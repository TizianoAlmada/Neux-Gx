import { KeyboardSoundType, SoundSettings } from '../../../shared/types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private settings: SoundSettings = {
    enabled: true,
    volume: 60,
    keyboardSoundProfile: 'mechanical',
    playOnTabEvents: true,
    playOnHover: true,
    playOnClick: true,
    playOnDownload: true
  };

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public updateSettings(newSettings: Partial<SoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  private getMasterGain(ctx: AudioContext): GainNode {
    const gain = ctx.createGain();
    const vol = (this.settings.volume / 100) * (this.settings.enabled ? 1 : 0);
    gain.gain.value = vol;
    gain.connect(ctx.destination);
    return gain;
  }

  // --- Keyboard Sounds ---
  public playKeySound(type?: KeyboardSoundType): void {
    if (!this.settings.enabled) return;
    const profile = type || this.settings.keyboardSoundProfile;
    if (profile === 'off') return;

    try {
      const ctx = this.getAudioContext();
      const master = this.getMasterGain(ctx);
      const now = ctx.currentTime;

      if (profile === 'mechanical') {
        // High click + damped body
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 300, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        // Click noise burst
        const bufferSize = ctx.sampleRate * 0.01;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 3500;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        osc.connect(gain);
        gain.connect(master);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.05);
        noise.stop(now + 0.02);
      } else if (profile === 'thock') {
        // Deeper, bassier thock
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (profile === 'cyber') {
        // High-tech futuristic blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.03);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (profile === 'arcade') {
        // 8-bit square jump
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.setValueAtTime(700, now + 0.02);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }

  // --- UI Effects ---
  public playTabOpen(): void {
    if (!this.settings.enabled || !this.settings.playOnTabEvents) return;
    try {
      const ctx = this.getAudioContext();
      const master = this.getMasterGain(ctx);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // ignore
    }
  }

  public playTabClose(): void {
    if (!this.settings.enabled || !this.settings.playOnTabEvents) return;
    try {
      const ctx = this.getAudioContext();
      const master = this.getMasterGain(ctx);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      // ignore
    }
  }

  public playTabSwitch(): void {
    if (!this.settings.enabled || !this.settings.playOnTabEvents) return;
    try {
      const ctx = this.getAudioContext();
      const master = this.getMasterGain(ctx);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // ignore
    }
  }

  public playButtonClick(): void {
    if (!this.settings.enabled || !this.settings.playOnClick) return;
    try {
      const ctx = this.getAudioContext();
      const master = this.getMasterGain(ctx);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // ignore
    }
  }

  public playButtonHover(): void {
    if (!this.settings.enabled || !this.settings.playOnHover) return;
    try {
      const ctx = this.getAudioContext();
      const master = this.getMasterGain(ctx);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {
      // ignore
    }
  }

  public playDownloadSuccess(): void {
    if (!this.settings.enabled || !this.settings.playOnDownload) return;
    try {
      const ctx = this.getAudioContext();
      const master = this.getMasterGain(ctx);
      const now = ctx.currentTime;

      // Chord progression: C5 -> E5 -> G5 -> C6
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.16);
      });
    } catch (e) {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
