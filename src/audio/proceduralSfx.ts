import Phaser from 'phaser';

export type SfxEvent = 'confirm' | 'cancel' | 'move' | 'blocked' | 'pause' | 'win';

interface ToneParams {
  frequency: number;
  gain: number;
  duration: number;
  type?: OscillatorType;
  attack?: number;
  release?: number;
  detune?: number;
  when?: number;
}

const DEFAULT_ATTACK = 0.003;
const DEFAULT_RELEASE = 0.08;

class ProceduralSfx {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private readonly limiter: Partial<Record<SfxEvent, number>> = {
    move: 0,
    blocked: 0
  };

  public attach(scene: Phaser.Scene): void {
    if (typeof window === 'undefined' || !window.AudioContext) {
      return;
    }

    scene.input.once('pointerdown', () => {
      void this.resume();
    });
    scene.input.keyboard?.once('keydown', () => {
      void this.resume();
    });
  }

  public async resume(): Promise<void> {
    const context = this.ensureContext();
    if (!context || context.state !== 'suspended') {
      return;
    }

    await context.resume();
  }

  public play(event: SfxEvent): void {
    const context = this.ensureContext();
    if (!context || context.state !== 'running') {
      return;
    }

    const now = context.currentTime;
    if (!this.canPlay(event, now)) {
      return;
    }

    switch (event) {
      case 'confirm':
        this.tone({ frequency: 320, gain: 0.045, duration: 0.05, type: 'triangle', when: now, detune: -4 });
        this.tone({ frequency: 486, gain: 0.038, duration: 0.1, type: 'sine', when: now + 0.03, release: 0.1 });
        break;
      case 'cancel':
        this.tone({ frequency: 268, gain: 0.044, duration: 0.06, type: 'triangle', when: now, detune: -7 });
        this.tone({ frequency: 176, gain: 0.035, duration: 0.11, type: 'sine', when: now + 0.015, release: 0.1 });
        break;
      case 'move':
        this.tone({ frequency: 164, gain: 0.02, duration: 0.035, type: 'triangle', when: now, release: 0.05, detune: -5 });
        break;
      case 'blocked':
        this.noiseBurst(now, 0.018, 0.045, 740);
        this.tone({ frequency: 104, gain: 0.022, duration: 0.055, type: 'triangle', when: now, release: 0.06, detune: -18 });
        break;
      case 'pause':
        this.tone({ frequency: 224, gain: 0.04, duration: 0.09, type: 'sine', when: now, release: 0.12 });
        this.tone({ frequency: 168, gain: 0.038, duration: 0.12, type: 'triangle', when: now + 0.045, release: 0.12 });
        break;
      case 'win':
        this.tone({ frequency: 246, gain: 0.042, duration: 0.08, type: 'triangle', when: now, release: 0.11 });
        this.tone({ frequency: 310, gain: 0.04, duration: 0.095, type: 'sine', when: now + 0.065, release: 0.13 });
        this.tone({ frequency: 368, gain: 0.042, duration: 0.14, type: 'sine', when: now + 0.135, release: 0.18 });
        break;
      default:
        break;
    }
  }

  private canPlay(event: SfxEvent, now: number): boolean {
    if (event === 'move' || event === 'blocked') {
      const minGap = event === 'move' ? 0.045 : 0.08;
      const lastPlayedAt = this.limiter[event] ?? 0;
      if (now - lastPlayedAt < minGap) {
        return false;
      }
      this.limiter[event] = now;
    }

    return true;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined' || !window.AudioContext) {
      return null;
    }

    if (!this.context) {
      this.context = new window.AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.context.destination);
    }

    return this.context;
  }

  private tone(params: ToneParams): void {
    if (!this.context || !this.master) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.type = params.type ?? 'triangle';
    oscillator.frequency.setValueAtTime(params.frequency, params.when ?? this.context.currentTime);
    oscillator.detune.value = params.detune ?? 0;

    const start = params.when ?? this.context.currentTime;
    const attack = params.attack ?? DEFAULT_ATTACK;
    const release = params.release ?? DEFAULT_RELEASE;
    const end = start + params.duration;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, params.gain), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, end + release);

    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(end + release + 0.01);
  }

  private noiseBurst(start: number, gainLevel: number, duration: number, highpass: number): void {
    if (!this.context || !this.master) {
      return;
    }

    const sampleRate = this.context.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainLevel, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.03);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);

    source.start(start);
    source.stop(start + duration + 0.04);
  }
}

const proceduralSfx = new ProceduralSfx();

export const attachSfxInputUnlock = (scene: Phaser.Scene): void => {
  proceduralSfx.attach(scene);
};

export const playSfx = (event: SfxEvent): void => {
  proceduralSfx.play(event);
};
