import Phaser from 'phaser';

export type SfxName = 'menu-confirm' | 'back-cancel' | 'move' | 'blocked-move' | 'pause' | 'win';

interface ToneEvent {
  at: number;
  duration: number;
  frequency: number;
  frequencyEnd?: number;
  gain: number;
  type?: OscillatorType;
}

const SFX_PATTERNS: Record<SfxName, ToneEvent[]> = {
  'menu-confirm': [
    { at: 0, duration: 0.055, frequency: 392, frequencyEnd: 494, gain: 0.05, type: 'triangle' },
    { at: 0.042, duration: 0.08, frequency: 494, frequencyEnd: 587, gain: 0.045, type: 'triangle' }
  ],
  'back-cancel': [
    { at: 0, duration: 0.07, frequency: 330, frequencyEnd: 268, gain: 0.04, type: 'sawtooth' }
  ],
  move: [
    { at: 0, duration: 0.04, frequency: 192, frequencyEnd: 230, gain: 0.026, type: 'square' }
  ],
  'blocked-move': [
    { at: 0, duration: 0.03, frequency: 146, frequencyEnd: 132, gain: 0.022, type: 'square' },
    { at: 0.024, duration: 0.03, frequency: 124, frequencyEnd: 110, gain: 0.018, type: 'square' }
  ],
  pause: [
    { at: 0, duration: 0.08, frequency: 250, frequencyEnd: 184, gain: 0.034, type: 'triangle' }
  ],
  win: [
    { at: 0, duration: 0.08, frequency: 294, frequencyEnd: 370, gain: 0.052, type: 'triangle' },
    { at: 0.07, duration: 0.1, frequency: 370, frequencyEnd: 494, gain: 0.048, type: 'triangle' },
    { at: 0.14, duration: 0.14, frequency: 494, frequencyEnd: 740, gain: 0.043, type: 'sine' }
  ]
};

class ProceduralSfx {
  private context?: AudioContext;
  private unlocked = false;
  private lastPlayedAt: Partial<Record<SfxName, number>> = {};

  public attachScene(scene: Phaser.Scene): void {
    if (!window.AudioContext && !(window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) {
      return;
    }

    scene.input.once('pointerdown', () => {
      void this.unlock();
    });

    scene.input.keyboard?.once('keydown', () => {
      void this.unlock();
    });
  }

  public play(name: SfxName): void {
    if (!this.unlocked || !this.context) {
      return;
    }

    const now = this.context.currentTime;
    const lastAt = this.lastPlayedAt[name] ?? -10;

    if (name === 'move' && now - lastAt < 0.045) {
      return;
    }

    if (name === 'blocked-move' && now - lastAt < 0.08) {
      return;
    }

    this.lastPlayedAt[name] = now;

    const masterGain = this.context.createGain();
    masterGain.gain.setValueAtTime(0.9, now);
    masterGain.connect(this.context.destination);

    SFX_PATTERNS[name].forEach((event) => {
      const oscillator = this.context!.createOscillator();
      oscillator.type = event.type ?? 'triangle';

      const gain = this.context!.createGain();
      const start = now + event.at;
      const attackEnd = start + Math.min(0.012, event.duration * 0.35);
      const releaseStart = start + event.duration * 0.45;
      const end = start + event.duration;

      oscillator.frequency.setValueAtTime(event.frequency, start);
      if (event.frequencyEnd) {
        oscillator.frequency.exponentialRampToValueAtTime(event.frequencyEnd, end);
      }

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, event.gain), attackEnd);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, event.gain * 0.55), releaseStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(start);
      oscillator.stop(end + 0.015);
    });
  }

  private async unlock(): Promise<void> {
    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) {
        return;
      }
      this.context = new Ctor();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    this.unlocked = this.context.state === 'running';
  }
}

export const proceduralSfx = new ProceduralSfx();
