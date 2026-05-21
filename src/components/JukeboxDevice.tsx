import React, { useEffect, useState } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { RETRO_SONGS } from '../data/songs';
import { playClick, startStaticNoise, stopStaticNoise, startMelodySynth, stopMelodySynth, playStreamAudio, pauseStreamAudio } from '../utils/audio';

interface JukeboxDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const JukeboxDevice: React.FC<JukeboxDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSongIdx, setActiveSongIdx] = useState(0);
  const [neonFlashPhase, setNeonFlashPhase] = useState(0);

  // Animate glowing neon arcs procedurally
  useEffect(() => {
    const timer = setInterval(() => {
      setNeonFlashPhase((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // Sync music and statics
  useEffect(() => {
    if (!isPlaying || !isAudioOn) {
      stopMelodySynth();
      stopStaticNoise();
      pauseStreamAudio();
      return;
    }

    const currentSong = RETRO_SONGS[activeSongIdx];
    const audioUrl = device.customAudioUrl || currentSong.streamUrl;

    if (audioUrl) {
      playStreamAudio(audioUrl, 0.45);
    } else {
      startMelodySynth(currentSong.genre);
    }
    
    // No static noise or speakers hum for the jukebox to prevent annoying high-pass fuzz
    
    return () => {
      stopMelodySynth();
      stopStaticNoise();
      pauseStreamAudio();
    };
  }, [isPlaying, activeSongIdx, isAudioOn, device.customAudioUrl]);

  const selectSong = (index: number) => {
    playClick(1500, 0.04); // high mechanical pop click
    setActiveSongIdx(index);
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    playClick(800, 0.035);
    setIsPlaying(!isPlaying);
  };

  const getNeonColors = () => {
    const hue = neonFlashPhase;
    switch (device.jukeboxNeonCombo) {
      case 'sunset-orange':
        return {
          glowArc: `linear-gradient(to top, #f97316 0%, #ef4444 50%, #eab308 100%)`,
          shadow: '0 0 25px rgba(239, 68, 68, 0.82)',
        };
      case 'cyber-neon':
        return {
          glowArc: `linear-gradient(to top, #06b6d4 0%, #ec4899 50%, #3b82f6 100%)`,
          shadow: '0 0 25px rgba(236, 72, 153, 0.85)',
        };
      case 'classic-rainbow':
      default:
        return {
          glowArc: `linear-gradient(${hue}deg, #ef4444 0%, #eab308 33%, #10b981 66%, #3b82f6 100%)`,
          shadow: '0 0 25px rgba(234, 179, 8, 0.85)',
        };
    }
  };

  const neon = getNeonColors();

  const getBodyStyle = () => {
    return {
      background: `linear-gradient(135deg, #a0522d 0%, ${device.primaryColor || '#8B4513'} 55%, #1f0d05 100%)`,
      border: '8px solid #4a210d',
      boxShadow: 'inset 0 4px 15px rgba(255,255,255,0.18), 0 15px 35px rgba(0,0,0,0.6)',
    };
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto min-h-[460px] rounded-t-[7rem] p-6 flex flex-col justify-between items-center transition-all duration-500 overflow-hidden text-neutral-800" style={getBodyStyle()}>
      {/* Background Wear and Decal */}
      <StickerAndWear
        stickerId={device.stickerId}
        stickerX={device.stickerX}
        stickerY={device.stickerY}
        wearLevel={device.wearLevel}
        onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
      />

      {/* Dynamic Arch Glowing Neon Tube (Skeuomorphic diner styling) */}
      <div
        className="absolute inset-[10px] rounded-t-[6.5rem] border-[12px] border-transparent pointer-events-none z-5 transition-all duration-300"
        style={{
          backgroundImage: neon.glowArc,
          backgroundClip: 'border-box',
          filter: `drop-shadow(${neon.shadow})`,
          opacity: 0.9,
        }}
      />

      {/* Decorative Upper Metal Grille dome */}
      <div className="w-48 h-12 bg-zinc-800 border-2 border-zinc-700 rounded-b-lg flex flex-col justify-around select-none p-1.5 z-10 shadow-lg mt-8">
        <div className="text-[10px] font-black uppercase text-amber-500 text-center tracking-[0.22em]">
          {device.brand || 'WURLITZER'}
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </div>

      {/* Playback Display & Songs cards */}
      <div className="flex-1 w-full bg-stone-900 border-4 border-stone-850 rounded-xl p-3 my-4 flex flex-col justify-between select-none z-10 shadow-inner">
        {/* Interior LED Backlighting */}
        <div className="absolute inset-x-6 top-28 h-20 bg-radial from-amber-500/25 to-transparent pointer-events-none" />

        <div className="text-[8px] font-mono text-amber-500 border-b border-amber-950/40 pb-1 mb-2.5 flex justify-between select-none uppercase tracking-wider font-semibold">
          <span>🎵 SELEZIONE JUKEBOX 🎵</span>
          <span>{isPlaying ? 'ACTIVE' : 'IDLE'}</span>
        </div>

        {/* Vintage title strip cards */}
        <div className="flex-1 grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
          {RETRO_SONGS.map((song, index) => {
            const isSelected = index === activeSongIdx;
            return (
              <div
                key={index}
                onClick={() => selectSong(index)}
                className={`p-1.5 border hover:border-amber-500 transition-colors rounded cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-405/20 border-amber-500 text-amber-400 font-semibold scale-[0.98]'
                    : 'bg-stone-950 border-stone-850 text-stone-300'
                }`}
              >
                <div className="text-[7.5px] font-bold font-mono tracking-tight text-center truncate pr-0.5 leading-3">
                  {song.title}
                </div>
                <div className="flex justify-between items-center text-[5.5px] text-stone-500 mt-1">
                  <span>A-{index + 1}</span>
                  <span className="truncate max-w-[50px]">{song.artist}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Song duration timeline progress */}
        {isPlaying && (
          <div className="h-4 flex items-center justify-between mt-2 gap-1.5 text-[7px] font-mono text-amber-500">
            <span className="text-[6.5px] uppercase tracking-wide">Playing A-{activeSongIdx + 1}</span>
            <div className="flex-1 h-1 bg-amber-950 rounded-full overflow-hidden">
              <div className="w-4/5 h-full bg-amber-500 animate-[pulse_1s_infinite]" />
            </div>
          </div>
        )}
      </div>

      {/* Physical tactile control panel on wood border deck */}
      <div className="w-full bg-stone-800 border-t border-stone-900 shadow-md rounded-xl p-3 flex justify-around select-none z-10 items-center">
        {/* Play toggle */}
        <button
          onClick={togglePlayback}
          className={`px-3 py-1.5 rounded-full border border-stone-900 font-mono text-[9px] font-black cursor-pointer transition-all active:translate-y-px ${
            isPlaying
              ? 'bg-red-500 text-white border-red-600 shadow-inner'
              : 'bg-stone-705 text-stone-300 hover:bg-stone-650'
          }`}
        >
          {isPlaying ? 'STOP_LP' : 'PLAY_LP'}
        </button>

        {/* Selected slot print notifier */}
        <div className="bg-black border border-amber-950 rounded-md py-1 px-3 text-center text-[11px] font-mono font-bold text-amber-500 tracking-wider">
          A - {activeSongIdx + 1}
        </div>

        {/* Arc neon cycle changer selector link button */}
        <button
          onClick={() => {
            playClick(1000, 0.04);
            onChangeDevice({
              jukeboxNeonCombo:
                device.jukeboxNeonCombo === 'classic-rainbow'
                  ? 'cyber-neon'
                  : device.jukeboxNeonCombo === 'cyber-neon'
                  ? 'sunset-orange'
                  : 'classic-rainbow',
            });
          }}
          className="p-1 px-2.5 rounded bg-zinc-700 hover:bg-zinc-650 text-amber-400 font-bold font-mono text-[8px] border border-stone-850 cursor-pointer active:translate-y-px"
          title="Cicla stile neon diner"
        >
          NEON
        </button>
      </div>

      {/* Footer shiny diner chrome bumper accent */}
      <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-stone-400 via-stone-300 to-stone-500 rounded-b-md shadow-lg pointer-events-none" />
    </div>
  );
};
