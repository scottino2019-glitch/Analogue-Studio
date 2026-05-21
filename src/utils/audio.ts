/**
 * Web Audio API synthesizer for Retro Devices.
 * Strictly local, procedural, and robust.
 */

let audioCtx: AudioContext | null = null;
let staticNode: AudioWorkletNode | ScriptProcessorNode | null = null;
let staticGain: GainNode | null = null;
let humOsc1: OscillatorNode | null = null;
let humOsc2: OscillatorNode | null = null;
let humGain: GainNode | null = null;

// Ensure we have an active audio context on interaction
export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play simple click sound for knobs/wheels/buttons
export function playClick(freq = 1200, duration = 0.015) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio click failed', e);
  }
}

// Play Game Boy high-pitched chiptune bleep
export function playChiptuneBleep(freq = 800, type: OscillatorType = 'square', duration = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Bleep failed', e);
  }
}

// Play retro game Jingle in a non-blocking sequence
export function playRetroJingle(theme: 'gameboy' | 'gamecube' | 'success') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playNote = (freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.04) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    };

    if (theme === 'gameboy') {
      // Game Boy classic startup "Baleep!"
      playNote(1046.50, now, 0.08, 'square', 0.04); // C6
      playNote(1318.51, now + 0.1, 0.35, 'square', 0.04); // E6
    } else if (theme === 'gamecube') {
      // Game Cube bounce chiptune cascade
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        playNote(freq, now + index * 0.07, 0.06, 'triangle', 0.05);
      });
      // Squeak giggly chiptune at the end
      playNote(1174.66, now + 0.6, 0.05, 'square', 0.03);
      playNote(1396.91, now + 0.66, 0.05, 'square', 0.03);
      playNote(1567.98, now + 0.72, 0.2, 'square', 0.03);
    } else if (theme === 'success') {
      playNote(523.25, now, 0.1, 'sine', 0.06); // C5
      playNote(659.25, now + 0.1, 0.1, 'sine', 0.06); // E5
      playNote(783.99, now + 0.2, 0.1, 'sine', 0.06); // G5
      playNote(1046.50, now + 0.3, 0.3, 'sine', 0.06); // C6
    }
  } catch (e) {
    console.warn('Jingle failed', e);
  }
}

// PS1 Boot sequence simulation: deep low-frequency pad + sweeping pitch
export function playPS1Boot() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const dur = 6.0;

    // Sub rumble osc
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55, now); // A1
    subOsc.frequency.linearRampToValueAtTime(41.20, now + dur); // E1

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(120, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.12, now + 1.0);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    // Warm high pad chord: A2, C#3, E3, A3
    const freqs = [110, 138.61, 164.81, 220, 277.18, 329.63, 440];
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.linearRampToValueAtTime(0.04, now + 2.0);
    padGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 2.0);
    filter.frequency.exponentialRampToValueAtTime(400, now + dur);

    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      // Subtle detuning for analog richness
      osc.detune.setValueAtTime(Math.random() * 10 - 5, now);
      osc.detune.linearRampToValueAtTime(Math.random() * 6 - 3, now + dur);

      osc.connect(filter);
      osc.start(now);
      osc.stop(now + dur);
    });

    filter.connect(padGain);
    padGain.connect(ctx.destination);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + dur);
  } catch (e) {
    console.warn('PS1 Boot synth failed', e);
  }
}

// Continuous static noise generator for Radio / TV static
export function startStaticNoise(volume = 0.02) {
  try {
    const ctx = getAudioContext();
    if (staticNode) return; // already active

    // Create a simple procedural noise buffer
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to make static sound softer
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.0;

    staticGain = ctx.createGain();
    staticGain.gain.setValueAtTime(volume, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(staticGain);
    staticGain.connect(ctx.destination);

    noiseSource.start();

    // Cache to allow stop
    (staticNode as any) = noiseSource;
  } catch (e) {
    console.warn('Noise start failed', e);
  }
}

export function updateStaticVolume(volume: number) {
  if (staticGain) {
    try {
      const ctx = getAudioContext();
      staticGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    } catch (_) {}
  }
}

export function stopStaticNoise() {
  if (staticNode) {
    try {
      (staticNode as any).stop();
    } catch (_) {}
    staticNode = null;
    staticGain = null;
  }
}

// High-fidelity Procedural Melodic Loops using Web Audio oscillators (for radio music, jukebox retro tunes, or cassette playing)
let melodySequenceTimer: any = null;
export function startMelodySynth(genre: string = 'synthpop') {
  try {
    stopMelodySynth();
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Let's build a clean periodic synthesizer step sequencer that runs in a loop!
    let tempo = 120;
    if (genre === 'lofi') tempo = 80;
    if (genre === 'chiptune') tempo = 140;
    if (genre === 'rock') tempo = 130;

    const stepDuration = 60 / tempo / 2; // eighth notes

    // Chord progressions
    // Am - F - C - G
    const synthChords = [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [130.81, 164.81, 196.00], // C
      [146.83, 196.00, 246.94], // G
    ];

    const melodyScales = [
      [440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00], // A minor
    ];

    let step = 0;

    function scheduler() {
      const playTime = ctx.currentTime + 0.05;
      const bar = Math.floor(step / 16) % 4;
      const beatInBar = step % 16;

      // Bass drone on beat 0, 4, 8, 12
      if (beatInBar % 4 === 0) {
        const root = synthChords[bar][0];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = genre === 'chiptune' ? 'triangle' : 'sawtooth';
        bassOsc.frequency.setValueAtTime(root, playTime);

        // Lowpass filter for warm bass
        const bFilter = ctx.createBiquadFilter();
        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(genre === 'chiptune' ? 400 : 250, playTime);

        bassGain.gain.setValueAtTime(0.02, playTime);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, playTime + stepDuration * 3.5);

        bassOsc.connect(bFilter);
        bFilter.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(playTime);
        bassOsc.stop(playTime + stepDuration * 3.8);
      }

      // Arpeggiate / Melodize on random steps or eighth steps
      const isMelodyStep = genre === 'chiptune' 
        ? beatInBar % 3 === 0 
        : (beatInBar % 2 === 0 && Math.random() > 0.3);

      if (isMelodyStep) {
        const chordNotes = synthChords[bar];
        // Pick a chord tone and shift it up an octave
        const baseNote = chordNotes[Math.floor(Math.random() * chordNotes.length)];
        const mult = Math.random() > 0.6 ? 4 : 2;
        const noteFreq = baseNote * mult;

        const leadOsc = ctx.createOscillator();
        const leadGain = ctx.createGain();

        leadOsc.type = genre === 'chiptune' ? 'square' : 'triangle';
        leadOsc.frequency.setValueAtTime(noteFreq, playTime);

        // Chiptune slide effect
        if (genre === 'chiptune' && Math.random() > 0.7) {
          leadOsc.frequency.exponentialRampToValueAtTime(noteFreq * 1.5, playTime + stepDuration * 0.8);
        }

        leadGain.gain.setValueAtTime(0.012, playTime);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, playTime + stepDuration * 0.9);

        // Subtle delay feedback
        const delay = ctx.createDelay(1.0);
        delay.delayTime.value = stepDuration * 1.5;
        const delayGain = ctx.createGain();
        delayGain.gain.value = 0.4;

        leadOsc.connect(leadGain);
        leadGain.connect(ctx.destination);

        leadGain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(ctx.destination);

        leadOsc.start(playTime);
        leadOsc.stop(playTime + stepDuration * 1.2);
      }

      // Cute hihat click on 4, 12
      if (beatInBar % 4 === 2) {
        const htGain = ctx.createGain();
        htGain.gain.setValueAtTime(0.006, playTime);
        htGain.gain.exponentialRampToValueAtTime(0.0001, playTime + 0.05);

        // Generate tiny white noise slice
        const whiteBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const data = whiteBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = whiteBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, playTime);

        noise.connect(filter);
        filter.connect(htGain);
        htGain.connect(ctx.destination);

        noise.start(playTime);
        noise.stop(playTime + 0.06);
      }

      step++;
      const nextTime = (playTime - ctx.currentTime) * 1000 + (stepDuration * 1000);
      melodySequenceTimer = setTimeout(scheduler, stepDuration * 1000);
    }

    scheduler();
  } catch (e) {
    console.warn('Melody scheduler failed', e);
  }
}

export function stopMelodySynth() {
  if (melodySequenceTimer) {
    clearTimeout(melodySequenceTimer);
    melodySequenceTimer = null;
  }
}

// Real-world Streaming Audio Singleton Player
let streamAudio: HTMLAudioElement | null = null;

export function playStreamAudio(url: string, volume: number = 0.5, playbackRate: number = 1.0) {
  try {
    if (!streamAudio) {
      streamAudio = new Audio();
      streamAudio.crossOrigin = "anonymous";
    }
    
    // Check if the URL indeed changed to avoid resetting buffer
    if (streamAudio.src !== url) {
      streamAudio.src = url;
      streamAudio.load();
    }
    
    streamAudio.volume = volume;
    try {
      streamAudio.playbackRate = playbackRate;
    } catch (_) {}
    
    streamAudio.play().catch((err) => {
      console.warn("Autoplay block dynamic play or stream error:", err);
    });
  } catch (e) {
    console.error("Stream player trigger failed:", e);
  }
}

export function pauseStreamAudio() {
  if (streamAudio) {
    try {
      streamAudio.pause();
    } catch (_) {}
  }
}

export function setStreamAudioVolume(volume: number) {
  if (streamAudio) {
    try {
      streamAudio.volume = Math.max(0, Math.min(1, volume));
    } catch (_) {}
  }
}

export function setStreamAudioPlaybackRate(rate: number) {
  if (streamAudio) {
    try {
      streamAudio.playbackRate = rate;
    } catch (_) {}
  }
}

