// Supabase Edge Function: send-project-inquiry
// Securely receives project inquiries and forwards them to your inbox via Resend API.

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple HTML entity escaping to prevent HTML injection in emails
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
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

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request payload' }),
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
      source = 'Aadi Portfolio',
    } = body;

    // 1. Honeypot check: reject bots silently with 200
    if (_hp && String(_hp).trim().length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Inquiry received' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Validate and trim required fields
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

    if (trimmedContact.length < 5) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Contact (Email or WhatsApp) must be at least 5 characters.',
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

    // Sanitize & enforce maximum length limits
    const safeName = trimmedName.slice(0, 100);
    const safeContact = trimmedContact.slice(0, 150);
    const safeProject = trimmedProject.slice(0, 3000);
    const safeBudget = trimmedBudget ? trimmedBudget.slice(0, 50) : 'Not specified';
    const safeTimeline = trimmedTimeline ? trimmedTimeline.slice(0, 50) : 'Not specified';
    const safeSource = String(source).slice(0, 50);

    const timestamp = new Date().toUTCString();

    // 3. Environment Secrets Verification
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

    // 4. Construct Plain Text & HTML bodies
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

    // 5. Call Resend API server-side
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
    console.error('[send-project-inquiry] Unhandled error:', err);
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
