/**
 * Studio-Grade Tactile & Cinematic Audio Engine
 *
 * Implements physical acoustic modeling via Web Audio API:
 * - Velocity-reactive aerodynamic 'whoosh' using swept multi-pole bandpass noise
 * - Crisp tactile haptic clicks (impulse transient + dampened acoustic chamber)
 * - Muted ceramic/wood micro-taps for hover states
 * - Deep spatial sub-bloom for modal & case study transitions
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;
  private lastHoverTime: number = 0;
  private lastWhooshTime: number = 0;
  private activeWhooshNode: GainNode | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      this.enabled = true;
    }

    if (typeof window !== 'undefined') {
      this.setupAutoUnlock();
    }
  }

  private setupAutoUnlock() {
    const unlock = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === 'running') {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('click', unlock);
        window.removeEventListener('wheel', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('wheel', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.generateNoiseBuffers();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Pre-synthesizes high-fidelity Pink and Brown noise buffers
   * for organic air turbulence and tactile impact transients.
   */
  private generateNoiseBuffers() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const duration = 2.5; // seconds
    const length = Math.floor(sampleRate * duration);

    // 1. Pink Noise (1/f spectral density) - warm air / whoosh body
    const pinkBuffer = this.ctx.createBuffer(1, length, sampleRate);
    const pinkData = pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
      b6 = white * 0.115926;
    }
    this.pinkNoiseBuffer = pinkBuffer;

    // 2. Brown Noise (1/f^2) - deep wind turbulence & low-end impact weight
    const brownBuffer = this.ctx.createBuffer(1, length, sampleRate);
    const brownData = brownBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      brownData[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = brownData[i];
      brownData[i] *= 3.5; // Gain compensation
    }
    this.brownNoiseBuffer = brownBuffer;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('sound_enabled', String(val));
    } catch {
      // Ignore
    }
  }

  public toggle(): boolean {
    const ctx = this.initContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const nextState = !this.enabled;
    this.setEnabled(nextState);
    if (nextState) {
      this.playClick();
    }
    return nextState;
  }

  /**
   * HIGH-END AERODYNAMIC SCROLL WHOOSH
   * Dual-stage air displacement sweep combining deep turbulence and Doppler filtered breeze.
   */
  public playScrollWhoosh(velocityMultiplier: number = 1) {
    if (!this.enabled) return;
    const now = Date.now();
    // Throttle so sustained scrolling forms a continuous, organic atmosphere
    if (now - this.lastWhooshTime < 280) return;
    this.lastWhooshTime = now;

    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running' || !this.pinkNoiseBuffer || !this.brownNoiseBuffer) return;

    try {
      const t = ctx.currentTime;
      const speed = Math.min(Math.max(velocityMultiplier, 0.7), 2.8);
      const duration = 0.42 / Math.sqrt(speed);

      // --- STAGE 1: Low-frequency wind turbulence (Brownian body) ---
      const brownSource = ctx.createBufferSource();
      brownSource.buffer = this.brownNoiseBuffer;
      const brownFilter = ctx.createBiquadFilter();
      brownFilter.type = 'lowpass';
      brownFilter.frequency.setValueAtTime(140, t);
      brownFilter.frequency.exponentialRampToValueAtTime(320 * speed, t + duration * 0.4);
      brownFilter.frequency.exponentialRampToValueAtTime(120, t + duration);

      const brownGain = ctx.createGain();
      brownGain.gain.setValueAtTime(0.001, t);
      brownGain.gain.exponentialRampToValueAtTime(0.18 * Math.min(speed, 1.5), t + duration * 0.35);
      brownGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      brownSource.connect(brownFilter);
      brownFilter.connect(brownGain);
      brownGain.connect(ctx.destination);
      brownSource.start(t, Math.random() * 1.5, duration);

      // --- STAGE 2: Sweeping Airy Doppler Breeze (Pink noise + resonant bandpass) ---
      const pinkSource = ctx.createBufferSource();
      pinkSource.buffer = this.pinkNoiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(2.4, t);

      const sweepStart = 380;
      const sweepPeak = 1200 * Math.min(speed, 1.8);
      bandpass.frequency.setValueAtTime(sweepStart, t);
      bandpass.frequency.exponentialRampToValueAtTime(sweepPeak, t + duration * 0.42);
      bandpass.frequency.exponentialRampToValueAtTime(280, t + duration);

      const pinkGain = ctx.createGain();
      pinkGain.gain.setValueAtTime(0.001, t);
      pinkGain.gain.exponentialRampToValueAtTime(0.22, t + duration * 0.38);
      pinkGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      pinkSource.connect(bandpass);
      bandpass.connect(pinkGain);
      pinkGain.connect(ctx.destination);
      pinkSource.start(t, Math.random() * 1.5, duration);
    } catch {
      // Audio playback failsafe
    }
  }

  /**
   * CRISP TACTILE STUDIO CLICK
   * Modeled after high-end precision cameras (Leica M shutter) and lubed mechanical switches:
   * - Crisp impulse transient snap (<8ms)
   * - Cushioned acoustic switch cavity thud (40ms)
   * - Clean mechanical clack release
   */
  public playClick() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // --- COMPONENT A: Cushioned Body Thump (Low-end chamber resonance) ---
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(130, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(42, t + 0.05);

      bodyGain.gain.setValueAtTime(0.35, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodyOsc.start(t);
      bodyOsc.stop(t + 0.06);

      // --- COMPONENT B: Tactile Switch Clack (Bandpass transient) ---
      if (this.pinkNoiseBuffer) {
        const snap = ctx.createBufferSource();
        snap.buffer = this.pinkNoiseBuffer;

        const snapFilter = ctx.createBiquadFilter();
        snapFilter.type = 'bandpass';
        snapFilter.frequency.setValueAtTime(2600, t);
        snapFilter.Q.setValueAtTime(4.2, t);

        const snapGain = ctx.createGain();
        snapGain.gain.setValueAtTime(0.32, t);
        snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

        snap.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(ctx.destination);
        snap.start(t, Math.random(), 0.025);
      }

      // --- COMPONENT C: Precision Metallic Pop (Micro high transient) ---
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(860, t);
      popOsc.frequency.exponentialRampToValueAtTime(210, t + 0.018);

      popGain.gain.setValueAtTime(0.16, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(t);
      popOsc.stop(t + 0.022);
    } catch {
      // Audio playback failsafe
    }
  }

  /**
   * MUTED CERAMIC HOVER TICK
   * Velvety, understated micro-tap (like fingertip brushing polished ceramic/glass).
   */
  public playHover() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastHoverTime < 50) return;
    this.lastHoverTime = now;

    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const t = ctx.currentTime;

      // Soft rounded acoustic pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.025);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.03);

      // Micro texture tick
      if (this.pinkNoiseBuffer) {
        const tick = ctx.createBufferSource();
        tick.buffer = this.pinkNoiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, t);
        filter.Q.setValueAtTime(6.0, t);

        const tickGain = ctx.createGain();
        tickGain.gain.setValueAtTime(0.07, t);
        tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

        tick.connect(filter);
        filter.connect(tickGain);
        tickGain.connect(ctx.destination);
        tick.start(t, Math.random(), 0.015);
      }
    } catch {
      // Audio playback failsafe
    }
  }

  /**
   * CINEMATIC MODAL SWELL (Case Studies & Contact Reveal)
   * Atmospheric sub-bass bloom paired with an airy reverse-style rise.
   */
  public playOpen() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // Deep sub-bass bloom (50Hz - 90Hz)
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(54, t);
      sub.frequency.exponentialRampToValueAtTime(84, t + 0.16);

      subGain.gain.setValueAtTime(0.35, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(t);
      sub.stop(t + 0.24);

      // Spatial airy shimmer sweep
      if (this.pinkNoiseBuffer) {
        const whoosh = ctx.createBufferSource();
        whoosh.buffer = this.pinkNoiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(360, t);
        filter.frequency.exponentialRampToValueAtTime(1450, t + 0.16);
        filter.Q.setValueAtTime(2.6, t);

        const wGain = ctx.createGain();
        wGain.gain.setValueAtTime(0.001, t);
        wGain.gain.exponentialRampToValueAtTime(0.22, t + 0.09);
        wGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

        whoosh.connect(filter);
        filter.connect(wGain);
        wGain.connect(ctx.destination);
        whoosh.start(t, Math.random(), 0.25);
      }
    } catch {
      // Audio playback failsafe
    }
  }
}

export const sound = new SoundManager();
