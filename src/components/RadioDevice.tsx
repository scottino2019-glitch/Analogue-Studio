import React, { useEffect, useState } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { RETRO_STATIONS } from '../data/songs';
import { playClick, startStaticNoise, stopStaticNoise, updateStaticVolume, startMelodySynth, stopMelodySynth, playStreamAudio, pauseStreamAudio } from '../utils/audio';

interface RadioDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const RadioDevice: React.FC<RadioDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [activeStation, setActiveStation] = useState<any>(null);

  // Check if current frequency is locked into a station
  useEffect(() => {
    let bestStation: any = null;
    let minDistance = 2.0; // max frequency range to start hearing it

    RETRO_STATIONS.forEach((station) => {
      const distance = Math.abs(device.radioFrequency - station.freq);
      if (distance < minDistance) {
        minDistance = distance;
        bestStation = station;
      }
    });

    if (bestStation && minDistance < 0.6) {
      // Station locked!
      setActiveStation(bestStation);
    } else if (bestStation) {
      // Weak signal
      setActiveStation({ ...bestStation, weak: true, distance: minDistance });
    } else {
      setActiveStation(null);
    }
  }, [device.radioFrequency]);

  // Handle Audio activation based on station and Power
  useEffect(() => {
    if (!isAudioOn || !isPowerOn) {
      stopStaticNoise();
      stopMelodySynth();
      pauseStreamAudio();
      return;
    }

    if (activeStation) {
      if (activeStation.weak) {
        // Blend station music and strong static noise
        const staticVol = Math.max(0.01, activeStation.distance * 0.1);
        startStaticNoise(staticVol);
        // Start synthetic loop if not playing the correct station
        startMelodySynth(activeStation.genre);
        pauseStreamAudio();
      } else {
        // Clear station sound, minimal static
        startStaticNoise(0.002);
        stopMelodySynth();
        
        // Play real MP3 stream
        const audioUrl = device.customAudioUrl || activeStation.streamUrl;
        if (audioUrl) {
          playStreamAudio(audioUrl, 0.45);
        } else {
          startMelodySynth(activeStation.genre);
        }
      }
    } else {
      // Pure loud white noise static
      startStaticNoise(0.06);
      stopMelodySynth();
      pauseStreamAudio();
    }

    return () => {
      stopStaticNoise();
      stopMelodySynth();
      pauseStreamAudio();
    };
  }, [isAudioOn, isPowerOn, activeStation?.freq, activeStation?.weak, activeStation?.distance, device.customAudioUrl]);

  const togglePower = () => {
    playClick(600, 0.15);
    setIsPowerOn(!isPowerOn);
  };

  const handleTune = (freq: number) => {
    onChangeDevice({ radioFrequency: Math.round(freq * 10) / 10 });
    if (isPowerOn) {
      playClick(device.radioFrequency * 2 + 100, 0.01);
    }
  };

  const handleBandToggle = () => {
    playClick(400, 0.1);
    onChangeDevice({ radioBand: device.radioBand === 'FM' ? 'AM' : 'FM' });
  };

  // Convert frequency to percentage for the physical dial needle slider
  const getNeedlePosition = () => {
    const min = 88;
    const max = 108;
    const clamped = Math.max(min, Math.min(max, device.radioFrequency));
    return ((clamped - min) / (max - min)) * 100;
  };

  // Outer style styling for case material
  const getBodyStyle = () => {
    if (device.bodyMaterial === 'wood') {
      return {
        background: `linear-gradient(135deg, #a0522d 0%, ${device.primaryColor} 50%, #5c2c16 100%)`,
        boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.15), 0 10px 25px rgba(0,0,0,0.5)',
        border: '10px solid #4a210d',
      };
    } else if (device.bodyMaterial === 'metal') {
      return {
        background: `linear-gradient(135deg, #efefef 0%, ${device.primaryColor} 60%, #888888 100%)`,
        boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.4), 0 10px 25px rgba(0,0,0,0.5)',
        border: '8px solid #aaaaaa',
      };
    } else if (device.bodyMaterial === 'translucent') {
      return {
        background: `${device.primaryColor}cc`,
        boxShadow: 'inset 0 4px 15px rgba(255,255,255,0.25), 0 10px 25px rgba(0,0,0,0.4)',
        border: '8px solid rgba(255,255,255,0.35)',
        backdropFilter: 'blur(3px)',
      };
    } else {
      // Plastic
      return {
        backgroundColor: device.primaryColor,
        boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.15), 0 10px 25px rgba(0,0,0,0.5)',
        border: '8px solid rgba(0,0,0,0.15)',
      };
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-video flex flex-col justify-between p-6 rounded-2xl transition-all duration-500 overflow-hidden text-neutral-800" style={getBodyStyle()}>
      {/* Background Wear and Decal */}
      <StickerAndWear
        stickerId={device.stickerId}
        stickerX={device.stickerX}
        stickerY={device.stickerY}
        wearLevel={device.wearLevel}
        onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
      />

      {/* Retro Metallic Antenna */}
      <div
        className="absolute top-0 left-12 w-1.5 bg-gradient-to-r from-neutral-300 to-neutral-500 origin-bottom transition-all duration-500 z-10"
        style={{
          height: `${device.tvAntennaLength || 50}px`,
          transform: `rotate(${device.tvAntennaAngle || -30}deg) translateY(-100%)`,
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-400 rounded-full border border-neutral-600 shadow-xs" />
      </div>

      {/* Header Panel with classic vintage brand and glowing status led */}
      <div className="flex justify-between items-center bg-black/10 px-4 py-2 rounded-lg border border-black/5 backdrop-blur-xs select-none z-10">
        <span className="font-mono text-xs text-black/50 uppercase tracking-[0.3em] font-black">{device.brand || 'PHONOLA'}</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono tracking-wider opacity-60">STEREO</span>
          <div
            className={`w-3 h-3 rounded-full border border-black/30 transition-shadow duration-300 ${
              isPowerOn
                ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                : 'bg-neutral-800 shadow-inner'
            }`}
          />
        </div>
      </div>

      {/* Classic Frequency Tuning Dial */}
      <div className="relative flex-1 my-4 bg-gradient-to-b from-amber-950 to-stone-900 border-2 border-amber-950/50 rounded-lg overflow-hidden flex flex-col justify-end p-2 select-none z-10 shadow-inner">
        {/* Glow indicator backlight when powered on */}
        {isPowerOn && (
          <div className="absolute inset-0 bg-amber-500/20 mix-blend-color-dodge transition-opacity animate-pulse pointer-events-none" />
        )}

        {/* Station Frequency labels */}
        <div className="w-full flex justify-between text-[10px] font-mono text-stone-400 px-3 pb-1 border-b border-stone-800 select-none relative z-10">
          <span>88</span>
          <span>92</span>
          <span>96</span>
          <span>100</span>
          <span>104</span>
          <span>108</span>
          {device.radioBand === 'FM' ? (
            <span className="text-amber-500 font-bold absolute right-3 bottom-5">FM MHz</span>
          ) : (
            <span className="text-amber-600 font-bold absolute right-3 bottom-5">AM KHz</span>
          )}
        </div>

        {/* Physical Tuning Pointer Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 border-r border-red-300 shadow-[0_0_6px_rgba(239,68,68,0.8)] z-10 transition-all duration-100"
          style={{ left: `${getNeedlePosition()}%` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rounded-b-xs" />
        </div>

        {/* Station Indicators: glowing tick marks */}
        <div className="absolute inset-x-0 bottom-4 h-4 flex justify-between px-3 pointer-events-none">
          {RETRO_STATIONS.map((st) => (
            <div
              key={st.freq}
              className={`w-1 h-2 rounded-t-sm transition-all duration-300 ${
                isPowerOn && Math.abs(device.radioFrequency - st.freq) < 0.6
                  ? 'bg-amber-400 scale-y-150 shadow-[0_0_4px_rgba(251,191,36,0.8)]'
                  : 'bg-stone-700'
              }`}
              style={{
                left: `${((st.freq - 88) / 20) * 100}%`,
                position: 'absolute',
              }}
              title={st.name}
            />
          ))}
        </div>

        {/* Current Tuning Display */}
        <div className="w-full text-center py-1 mt-1 z-10">
          <span className="font-mono text-xl tracking-widest bg-black/60 text-amber-500 px-3 py-0.5 rounded border border-amber-500/20 shadow-inner">
            {device.radioFrequency.toFixed(1)} <span className="text-xs text-amber-600/75">MHz</span>
          </span>
        </div>
      </div>

      {/* Speaker Grille and Control Knobs Group */}
      <div className="flex gap-4 items-center mt-2 z-10">
        {/* Speaker Grille Area */}
        <div className="flex-1 h-14 bg-black/15 border border-black/5 rounded-lg overflow-hidden flex flex-col justify-around p-1.5">
          {device.radioSpeakerGrill === 'mesh' ? (
            <div className="w-full h-full bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:3px_3px] opacity-80" />
          ) : device.radioSpeakerGrill === 'retro-slots' ? (
            <div className="w-full h-full flex flex-col justify-between py-1 px-2">
              <div className="h-1.5 bg-black/40 rounded-full w-full" />
              <div className="h-1.5 bg-black/40 rounded-full w-4/5" />
              <div className="h-1.5 bg-black/40 rounded-full w-full" />
              <div className="h-1.5 bg-black/40 rounded-full w-11/12" />
            </div>
          ) : (
            // Horizontal slats
            <div className="w-full h-full flex flex-col justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-1 bg-black/45 w-full rounded-sm" />
              ))}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="flex gap-3 text-center">
          {/* Power Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={togglePower}
              className={`w-9 h-9 rounded-full border-2 border-stone-800 shadow-md flex items-center justify-center transition-all cursor-pointer ${
                isPowerOn
                  ? 'bg-amber-400 text-stone-900 border-amber-500 shadow-inner translate-y-0.5'
                  : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
            </button>
            <span className="text-[8px] font-mono mt-1 font-bold tracking-wider text-black/50">POWER</span>
          </div>

          {/* AM/FM Toggle Switch */}
          <div className="flex flex-col items-center justify-between py-0.5">
            <button
              onClick={handleBandToggle}
              className="px-2 py-1 bg-stone-850 hover:bg-stone-800 text-[10px] font-mono font-black text-amber-500 border border-stone-800 rounded shadow-xs cursor-pointer active:translate-y-px"
            >
              {device.radioBand}
            </button>
            <span className="text-[8px] font-mono mt-1 font-bold tracking-wider text-black/50">BAND</span>
          </div>

          {/* Tuning Knob Custom */}
          <div className="flex flex-col items-center">
            <div className="relative w-9 h-9">
              <input
                type="range"
                min="88"
                max="108"
                step="0.1"
                value={device.radioFrequency}
                onChange={(e) => handleTune(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              />
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-r from-stone-600 via-stone-400 to-stone-700 border-2 border-stone-800 flex items-center justify-center shadow-md active:scale-95 transition-transform"
                style={{ transform: `rotate(${(device.radioFrequency - 88) * 15}deg)` }}
              >
                <div className="w-1.5 h-1.5 bg-black rounded-full absolute top-1" />
                <div className="w-5 h-5 bg-stone-800 rounded-full border border-stone-900 flex items-center justify-center">
                  <div className="w-1 h-3 bg-red-500 rounded-xs" />
                </div>
              </div>
            </div>
            <span className="text-[8px] font-mono mt-1 font-bold tracking-wider text-black/50">TUNE</span>
          </div>
        </div>
      </div>

      {/* Screen station status notifier */}
      {isPowerOn && activeStation && !activeStation.weak && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-black/85 text-amber-400 font-mono text-[9px] px-3 py-1 rounded-full shadow-lg border border-amber-500/20 z-30 animate-bounce tracking-wide">
          📡 Sintonizzato: {activeStation.name}
        </div>
      )}

      {/* Active radio station details banner */}
      {isPowerOn && activeStation && activeStation.weak && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-yellow-950/90 text-yellow-400 font-mono text-[8px] px-3 py-0.5 rounded-full shadow-md border border-yellow-500/10 z-30 tracking-wider">
          ⚡ Disturbi di Frequenza...
        </div>
      )}
    </div>
  );
};
