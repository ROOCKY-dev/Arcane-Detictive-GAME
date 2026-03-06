/**
 * Audio utility — Web Audio API sound effects for SQL Quest.
 * All sounds are synthesized procedurally (no audio file dependencies).
 * Singleton pattern: import { sfx } from '@/lib/audio'.
 *
 * Usage:
 *   sfx.play('cast')      // before executing a query
 *   sfx.play('success')   // on case solved
 *   sfx.play('misfire')   // on SQL error
 *   sfx.play('click')     // on button press
 *   sfx.play('hint')      // on hint reveal
 *   sfx.play('keystroke') // on editor keydown (throttled internally)
 */

type SoundName = 'cast' | 'success' | 'misfire' | 'click' | 'hint' | 'keystroke';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private lastKeystroke = 0;
  /** Minimum ms between keystroke sounds to avoid audio flooding */
  private static readonly KEYSTROKE_THROTTLE_MS = 80;

  /** Lazily create AudioContext on first user interaction */
  private getCtx(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    // Resume if suspended (browsers require user gesture)
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Master volume gate */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /** Play a named sound effect */
  play(name: SoundName): void {
    if (name === 'keystroke') {
      const now = Date.now();
      if (now - this.lastKeystroke < AudioEngine.KEYSTROKE_THROTTLE_MS) return;
      this.lastKeystroke = now;
    }

    const ctx = this.getCtx();
    if (!ctx) return;

    try {
      switch (name) {
        case 'keystroke': this.playKeystroke(ctx); break;
        case 'cast':      this.playCast(ctx);      break;
        case 'success':   this.playSuccess(ctx);   break;
        case 'misfire':   this.playMisfire(ctx);   break;
        case 'click':     this.playClick(ctx);     break;
        case 'hint':      this.playHint(ctx);      break;
      }
    } catch {
      // Audio errors are non-fatal — silently ignore
    }
  }

  /** Soft quill-scratch tick — short white-noise burst */
  private playKeystroke(ctx: AudioContext): void {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.15;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  /** Rising magical whoosh — spell being cast */
  private playCast(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /** Triumphant ascending chime — case solved */
  private playSuccess(ctx: AudioContext): void {
    const t = ctx.currentTime;
    // Play a short ascending arpeggio: C5 E5 G5 C6
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + i * 0.12;
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  /** Descending dissonant buzz — spell misfire / error */
  private playMisfire(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    // Add slight distortion via waveshaper
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeDistortionCurve(50);
    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  /** Soft low click — button press */
  private playClick(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /** Gentle bell-like tone — hint revealed */
  private playHint(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.4);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  }
}

/** Build a waveshaper distortion curve for the misfire effect */
function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/** Singleton audio engine — import this everywhere */
export const sfx = new AudioEngine();
