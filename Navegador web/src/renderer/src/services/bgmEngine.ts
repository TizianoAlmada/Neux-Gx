import { MusicSettings, TrackItem } from '../../../shared/types';

class BgmEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private isDucked = false;
  private isPlaying = false;
  private currentTrack: TrackItem | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private synthInterval: number | null = null;
  private currentChordIndex = 0;
  private settings: MusicSettings = {
    enabled: false,
    volume: 45,
    autoPlay: false,
    autoDuckOnWebAudio: true,
    shuffle: false,
    repeat: true,
    playlist: [],
    currentTrackIndex: 0
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.onended = () => {
      this.handleTrackEnded();
    };
  }

  private initAudioNodes(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain = this.ctx.createGain();
      this.updateGain();

      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Connect audioElement source
      try {
        const source = this.ctx.createMediaElementSource(this.audioElement!);
        source.connect(this.analyser);
      } catch (e) {
        // media element source might already be connected
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public updateSettings(settings: Partial<MusicSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.updateGain();
    this.notify();
  }

  public setDucked(ducked: boolean): void {
    if (!this.settings.autoDuckOnWebAudio) return;
    this.isDucked = ducked;
    this.updateGain();
  }

  private updateGain(): void {
    if (!this.masterGain || !this.ctx) return;
    const baseVol = (this.settings.volume / 100);
    const target = this.isDucked ? baseVol * 0.15 : baseVol;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(target, now, 0.2);
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public play(track?: TrackItem): void {
    this.initAudioNodes();
    const targetTrack = track || this.settings.playlist[this.settings.currentTrackIndex];
    if (!targetTrack) return;

    this.currentTrack = targetTrack;
    this.isPlaying = true;

    if (targetTrack.isBuiltin) {
      this.stopAudioElement();
      this.startBuiltinSynth(targetTrack.id);
    } else {
      this.stopBuiltinSynth();
      if (this.audioElement) {
        this.audioElement.src = targetTrack.url;
        this.audioElement.play().catch(err => console.warn('BGM play failed:', err));
      }
    }
    this.notify();
  }

  public pause(): void {
    this.isPlaying = false;
    this.stopBuiltinSynth();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.notify();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public next(): void {
    if (this.settings.playlist.length === 0) return;
    let nextIdx = (this.settings.currentTrackIndex + 1) % this.settings.playlist.length;
    if (this.settings.shuffle) {
      nextIdx = Math.floor(Math.random() * this.settings.playlist.length);
    }
    this.settings.currentTrackIndex = nextIdx;
    this.play(this.settings.playlist[nextIdx]);
  }

  public prev(): void {
    if (this.settings.playlist.length === 0) return;
    const prevIdx = (this.settings.currentTrackIndex - 1 + this.settings.playlist.length) % this.settings.playlist.length;
    this.settings.currentTrackIndex = prevIdx;
    this.play(this.settings.playlist[prevIdx]);
  }

  private handleTrackEnded(): void {
    if (this.settings.repeat) {
      this.play();
    } else {
      this.next();
    }
  }

  // --- Real-time Built-in Ambient Synth Generator ---
  private startBuiltinSynth(trackId: string): void {
    this.stopBuiltinSynth();
    if (!this.ctx || !this.analyser) return;

    // Progression chords in Hz
    // Track 1: Am9 -> Fmaj7 -> Cmaj7 -> G6
    const chordProgressions: Record<string, number[][]> = {
      'synth-1': [
        [220, 261.63, 329.63, 392.00, 493.88], // Am9
        [174.61, 220, 261.63, 329.63, 392.00], // Fmaj9
        [130.81, 164.81, 196.00, 246.94, 329.63], // Cmaj7
        [196.00, 246.94, 293.66, 392.00, 440.00]  // G6
      ],
      'synth-2': [
        [146.83, 220.00, 261.63, 349.23], // Dm7
        [116.54, 174.61, 233.08, 293.66], // Bbmaj7
        [130.81, 196.00, 261.63, 329.63], // C7
        [164.81, 246.94, 329.63, 392.00]  // Em7
      ],
      'synth-3': [
        [130.81, 196.00, 261.63, 329.63], // C
        [98.00, 146.83, 196.00, 246.94],  // G
        [110.00, 164.81, 220.00, 261.63], // Am
        [87.31, 130.81, 174.61, 220.00]   // F
      ]
    };

    const chords = chordProgressions[trackId] || chordProgressions['synth-1'];
    this.currentChordIndex = 0;

    const playChord = () => {
      if (!this.ctx || !this.isPlaying || !this.analyser) return;
      const now = this.ctx.currentTime;
      const chord = chords[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

      // Filter for warm analog synth feel
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 1.5);
      filter.frequency.exponentialRampToValueAtTime(500, now + 3.8);
      filter.connect(this.analyser);

      // Play notes with soft attack and long release
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Slight detune for lush chorus effect
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06 / chord.length, now + 0.8 + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playChord();
    this.synthInterval = window.setInterval(playChord, 3800);
  }

  private stopBuiltinSynth(): void {
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  private stopAudioElement(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public addTracks(tracks: TrackItem[]): void {
    this.settings.playlist = [...this.settings.playlist, ...tracks];
    this.notify();
  }

  public getPlaybackState(): { isPlaying: boolean; currentTrack: TrackItem | null; settings: MusicSettings } {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      settings: this.settings
    };
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }
}

export const bgmEngine = new BgmEngine();
