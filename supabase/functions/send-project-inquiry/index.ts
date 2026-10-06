// Supabase Edge Function: send-project-inquiry
// Securely receives project inquiries and forwards them to your inbox via Resend API.
// Architecture: Fail-Closed CORS -> 50KB Size Guard -> Honeypot -> Validation -> Turnstile -> Atomic DB Rate Limiting -> Resend

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Fail-closed CORS evaluator
function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  const normalizedOrigin = origin.toLowerCase().trim();
  const allowedOriginEnv = Deno.env.get('ALLOWED_ORIGIN')?.trim();

  if (allowedOriginEnv) {
    const configuredOrigins = allowedOriginEnv
      .split(',')
      .map((o) => o.toLowerCase().trim())
      .filter(Boolean);
    if (configuredOrigins.includes(normalizedOrigin) || DEFAULT_DEV_ORIGINS.includes(normalizedOrigin)) {
      return true;
    }
    return false;
  }

  // When ALLOWED_ORIGIN is unset: allow ONLY known local development origins
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);
  return isLocalhost;
}

// Build CORS response headers strictly for allowed origins (never wildcard '*')
function buildCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && isOriginAllowed(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    };
  }
  return {};
}

// HTML entity escaping to prevent HTML injection in emails
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// SHA-256 IP hashing for privacy-friendly persistent rate limiting
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Permissive validation for either valid email or international phone / WhatsApp number
function isValidContact(contactStr: string): boolean {
  const str = contactStr.trim();
  // 1. Email check: standard RFC-compliant pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (emailRegex.test(str)) {
    return true;
  }

  // 2. International Phone / WhatsApp check:
  // Must allow leading +, optional parentheses, spaces, dots, hyphens, and 7 to 15 digits (E.164).
  const digitsOnly = str.replace(/\D/g, '');
  const phoneCharRegex = /^[+]?[\d\s().-]{7,25}$/;
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15 && phoneCharRegex.test(str)) {
    return true;
  }

  return false;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = buildCorsHeaders(origin);

  // 1. Method & CORS Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    if (origin && !isOriginAllowed(origin)) {
      return new Response('Forbidden origin', { status: 403 });
    }
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Enforce CORS on POST: reject browser requests from disallowed origins with 403
  if (origin && !isOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cross-origin request not allowed' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 2. Request Size Guard (50 KB Policy)
  // Note: Content-Length header is checked first; platform streaming limit handles chunked transfers
  const MAX_BODY_BYTES = 50000;
  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = parseInt(contentLengthHeader, 10);
    if (!isNaN(contentLength) && contentLength > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload too large. Maximum size is 50 KB.' }),
        {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // 3. Safe JSON Parsing
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Malformed JSON payload.' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (!body || typeof body !== 'object') {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request payload format.' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const {
    name,
    contact,
    project,
    budget,
    timeline,
    _hp,
    turnstileToken,
    source = 'Aadi Portfolio',
  } = body;

  // 4. Honeypot check: reject bots silently with 200 without consuming rate limits or calling Resend
  if (_hp && String(_hp).trim().length > 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'Inquiry received' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // 5. Basic field and contact validation
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedContact = typeof contact === 'string' ? contact.trim() : '';
  const trimmedProject = typeof project === 'string' ? project.trim() : '';
  const trimmedBudget = typeof budget === 'string' ? budget.trim() : '';
  const trimmedTimeline = typeof timeline === 'string' ? timeline.trim() : '';

  if (trimmedName.length < 2) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Name must be at least 2 characters.',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (trimmedContact.length < 5 || !isValidContact(trimmedContact)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Please enter a valid email address or phone / WhatsApp number.',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (trimmedProject.length < 10) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Project description must be at least 10 characters.',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Extract client IP from proxy headers
  const clientIp =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';

  // 6. Server-side Cloudflare Turnstile Verification
  // Must pass before reaching rate limiter so invalid/missing tokens do not burn user slots
  const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY');

  if (TURNSTILE_SECRET_KEY) {
    if (!turnstileToken || typeof turnstileToken !== 'string' || turnstileToken.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Security verification failed: missing verification token.',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const verifyFormData = new URLSearchParams();
    verifyFormData.append('secret', TURNSTILE_SECRET_KEY);
    verifyFormData.append('response', turnstileToken.trim());
    if (clientIp && clientIp !== '127.0.0.1') {
      verifyFormData.append('remoteip', clientIp);
    }

    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verifyFormData,
      }
    );

    const turnstileOutcome = await turnstileRes.json().catch(() => null);

    if (!turnstileOutcome || !turnstileOutcome.success) {
      console.error('[send-project-inquiry] Turnstile verification failed:', turnstileOutcome);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Security verification failed. Please try again.',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // 7. Persistent Atomic Rate Limiting Check + Record via Postgres Advisory Lock RPC
  // Only reached after honeypot, validation, and Turnstile all pass
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const ipHash = await hashIp(clientIp);
    const rpcUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/check_and_record_contact_rate_limit`;

    try {
      const rpcRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_ip_hash: ipHash,
          p_limit: 3,
          p_window_seconds: 600, // 10 minutes sliding window
        }),
      });

      if (rpcRes.ok) {
        const allowed = await rpcRes.json();
        if (allowed === false) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Rate limit exceeded: maximum 3 submission attempts allowed per 10 minutes. Please try again later.',
            }),
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        console.warn('[send-project-inquiry] Rate limit RPC non-ok response:', await rpcRes.text());
      }
    } catch (err) {
      // Graceful fail-open on rate limit DB connectivity error
      console.error('[send-project-inquiry] Rate limit check error:', err);
    }
  }

  // Sanitize & enforce maximum length limits
  const safeName = trimmedName.slice(0, 100);
  const safeContact = trimmedContact.slice(0, 150);
  const safeProject = trimmedProject.slice(0, 3000);
  const safeBudget = trimmedBudget ? trimmedBudget.slice(0, 50) : 'Not specified';
  const safeTimeline = trimmedTimeline ? trimmedTimeline.slice(0, 50) : 'Not specified';
  const safeSource = String(source).slice(0, 50);

  const timestamp = new Date().toUTCString();

  // 8. Environment Secrets Verification & Dispatch via Resend
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const CONTACT_DESTINATION_EMAIL = Deno.env.get('CONTACT_DESTINATION_EMAIL');
  const RESEND_FROM_EMAIL =
    Deno.env.get('RESEND_FROM_EMAIL') || 'Portfolio Inquiries <onboarding@resend.dev>';

  if (!RESEND_API_KEY || !CONTACT_DESTINATION_EMAIL) {
    console.error(
      '[send-project-inquiry] Missing server secrets: RESEND_API_KEY or CONTACT_DESTINATION_EMAIL'
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server email configuration is missing. Please check backend secrets.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const plainText = `NEW PROJECT INQUIRY

Name:
${safeName}

Contact:
${safeContact}

Project:
${safeProject}

Budget:
${safeBudget}

Timeline:
${safeTimeline}

Source:
${safeSource}

Submitted:
${timestamp}
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Project Inquiry</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0c0c; color: #d7e2ea;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #141414; border: 1px solid #262626; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.5);">
    <div style="font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: #c084fc; margin-bottom: 8px;">
      ${escapeHtml(safeSource)}
    </div>
    <h1 style="font-size: 22px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 24px 0; border-bottom: 1px solid #262626; padding-bottom: 16px;">
      New Project Inquiry
    </h1>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 11px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Name</div>
      <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${escapeHtml(safeName)}</div>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 11px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Contact (Email / WhatsApp)</div>
      <div style="font-size: 15px; font-weight: 600; color: #38bdf8;">${escapeHtml(safeContact)}</div>
    </div>

    <div style="margin-bottom: 20px; background-color: #1a1a1a; padding: 16px; border-radius: 12px; border: 1px solid #2a2a2a;">
      <div style="font-size: 11px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px;">Project Scope</div>
      <div style="font-size: 14px; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(safeProject)}</div>
    </div>

    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
      <div style="flex: 1; background-color: #1a1a1a; padding: 12px 16px; border-radius: 10px; border: 1px solid #2a2a2a;">
        <div style="font-size: 10px; font-family: monospace; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Budget Range</div>
        <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${escapeHtml(safeBudget)}</div>
      </div>
      <div style="flex: 1; background-color: #1a1a1a; padding: 12px 16px; border-radius: 10px; border: 1px solid #2a2a2a;">
        <div style="font-size: 10px; font-family: monospace; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Timeline</div>
        <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${escapeHtml(safeTimeline)}</div>
      </div>
    </div>

    <div style="border-top: 1px solid #262626; padding-top: 16px; font-size: 11px; color: #64748b; font-family: monospace;">
      Submitted on ${escapeHtml(timestamp)}
    </div>
  </div>
</body>
</html>
`;

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [CONTACT_DESTINATION_EMAIL],
        subject: `New Portfolio Project Inquiry — ${safeName}`,
        html: htmlContent,
        text: plainText,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error('[send-project-inquiry] Resend API error:', resendError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to dispatch email via provider.',
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Inquiry sent successfully.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    console.error('[send-project-inquiry] Dispatch error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected server error occurred.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
