import { ActiveEffectType } from '../types/game';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private classicMode: boolean = false;

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setClassicMode(classic: boolean): void {
    this.classicMode = classic;
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignore autoplay restrictions before explicit interaction
      });
    }

    return this.ctx;
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'square',
    volume: number = 0.08,
    delaySec: number = 0,
    slideToFreq?: number
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, slideToFreq),
        startTime + durationSec
      );
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.015);
  }

  public playKeyBeep(pitchOffset: number = 0): void {
    if (this.classicMode) {
      this.playTone(1046.5, 0.03, 'square', 0.035);
      return;
    }
    this.playTone(980 + pitchOffset, 0.035, 'square', 0.035);
  }

  public playStart(): void {
    if (this.classicMode) {
      this.playTone(880, 0.06, 'square', 0.065, 0);
      this.playTone(1174.66, 0.09, 'square', 0.065, 0.07);
      return;
    }
    this.playTone(523.25, 0.07, 'square', 0.07, 0);
    this.playTone(659.25, 0.07, 'square', 0.07, 0.07);
    this.playTone(783.99, 0.09, 'square', 0.08, 0.14);
    this.playTone(1046.5, 0.14, 'square', 0.08, 0.22);
  }

  public playEat(): void {
    if (this.classicMode) {
      this.playTone(1046.5, 0.045, 'square', 0.07, 0);
      return;
    }
    this.playTone(587.33, 0.055, 'square', 0.075, 0);
    this.playTone(880, 0.075, 'square', 0.075, 0.05);
  }

  public playPowerUp(effectType: ActiveEffectType): void {
    if (this.classicMode) {
      this.playEat();
      return;
    }
    switch (effectType) {
      case 'SPRINT':
        // Spicy rising turbo chirp
        this.playTone(660, 0.05, 'square', 0.08, 0);
        this.playTone(880, 0.05, 'square', 0.08, 0.05);
        this.playTone(1174.66, 0.06, 'square', 0.08, 0.1);
        this.playTone(1567.98, 0.1, 'square', 0.09, 0.15);
        break;
      case 'REVERSE':
        // Confused comical tritone wobble
        this.playTone(440, 0.08, 'sawtooth', 0.065, 0, 311.13);
        this.playTone(311.13, 0.09, 'sawtooth', 0.065, 0.09, 440);
        this.playTone(293.66, 0.14, 'square', 0.07, 0.18, 207.65);
        break;
      case 'DOUBLE_POINTS':
        // Festive Biryani coin fanfare
        this.playTone(523.25, 0.06, 'square', 0.08, 0);
        this.playTone(659.25, 0.06, 'square', 0.08, 0.06);
        this.playTone(783.99, 0.06, 'square', 0.08, 0.12);
        this.playTone(1046.5, 0.15, 'square', 0.09, 0.18);
        break;
      case 'SLOW_MO':
        // Smooth descending chill chime
        this.playTone(783.99, 0.08, 'triangle', 0.09, 0);
        this.playTone(587.33, 0.12, 'triangle', 0.09, 0.08);
        break;
    }
  }

  public playSpeedUp(): void {
    if (this.classicMode) {
      this.playTone(1318.51, 0.05, 'square', 0.065, 0);
      this.playTone(1567.98, 0.07, 'square', 0.065, 0.055);
      return;
    }
    this.playTone(740, 0.045, 'square', 0.06, 0);
    this.playTone(987.77, 0.045, 'square', 0.06, 0.05);
    this.playTone(1318.51, 0.08, 'square', 0.07, 0.1);
  }

  public playGameOver(): void {
    if (this.classicMode) {
      this.playTone(523.25, 0.09, 'square', 0.08, 0);
      this.playTone(392.0, 0.09, 'square', 0.08, 0.1);
      this.playTone(261.63, 0.22, 'square', 0.08, 0.2);
      return;
    }
    this.playTone(440, 0.12, 'square', 0.09, 0, 392);
    this.playTone(369.99, 0.12, 'square', 0.09, 0.13, 329.63);
    this.playTone(293.66, 0.14, 'square', 0.09, 0.26, 246.94);
    this.playTone(220, 0.32, 'sawtooth', 0.085, 0.41, 98);
  }
}

export const retroAudio = new RetroAudioEngine();
