import React, { useEffect, useState } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { RETRO_SONGS } from '../data/songs';
import { playClick, startStaticNoise, stopStaticNoise, startMelodySynth, stopMelodySynth, playStreamAudio, pauseStreamAudio, setStreamAudioVolume } from '../utils/audio';

interface IPodDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const IPodDevice: React.FC<IPodDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [scrollIndex, setScrollIndex] = useState(0);

  // Manage playlist synthesis based on playing state
  useEffect(() => {
    if (!isPlaying || !isAudioOn) {
      stopMelodySynth();
      stopStaticNoise();
      pauseStreamAudio();
      return;
    }

    const currentSong = RETRO_SONGS[scrollIndex];
    const audioUrl = device.customAudioUrl || currentSong.streamUrl;

    if (audioUrl) {
      playStreamAudio(audioUrl, (volume / 100) * 0.5);
    } else {
      startMelodySynth(currentSong.genre);
    }
    startStaticNoise(0.001); // ultra-faint tape hiss for vintage MP3 feel

    return () => {
      stopMelodySynth();
      stopStaticNoise();
      pauseStreamAudio();
    };
  }, [isPlaying, scrollIndex, isAudioOn, device.customAudioUrl]);

  // Sync volume adjustment with real HTML player
  useEffect(() => {
    setStreamAudioVolume((volume / 100) * 0.5);
  }, [volume]);

  const handleMenuClick = () => {
    playClick(1000, 0.012);
    // Cycle backward on songs list
    const prevIdx = scrollIndex <= 0 ? RETRO_SONGS.length - 1 : scrollIndex - 1;
    setScrollIndex(prevIdx);
  };

  const handleNextClick = () => {
    playClick(1200, 0.012);
    const nextIdx = scrollIndex >= RETRO_SONGS.length - 1 ? 0 : scrollIndex + 1;
    setScrollIndex(nextIdx);
  };

  const handlePlayToggle = () => {
    playClick(800, 0.02);
    setIsPlaying(!isPlaying);
  };

  const handleCenterClick = () => {
    playClick(600, 0.025);
    setIsPlaying(!isPlaying);
  };

  const adjustVolume = (delta: number) => {
    playClick(1100, 0.01);
    setVolume((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  // Outer casing color styles
  const getCasingStyle = () => {
    if (device.bodyMaterial === 'metal') {
      return {
        background: `linear-gradient(135deg, #eaeaea 0%, ${device.primaryColor} 40%, #a1a1a1 100%)`,
        boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.4), 0 10px 30px rgba(0,0,0,0.4)',
        border: '3px solid #b5b5b5',
      };
    } else if (device.bodyMaterial === 'wood') {
      return {
        background: `linear-gradient(135deg, #c38452 0%, ${device.primaryColor} 45%, #764121 100%)`,
        boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.4)',
        border: '3px solid #6c3210',
      };
    } else {
      // Sleek glossy polycarbonate plastic
      return {
        background: `linear-gradient(to bottom, ${device.primaryColor} 0%, ${device.primaryColor} 70%, rgba(20,20,20,0.05) 100%)`,
        boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.45)',
        border: '3.5px solid rgba(0,0,0,0.1)',
      };
    }
  };

  const getScreenBgClass = () => {
    switch (device.ipodBacklightColor) {
      case 'yellowish':
        return 'bg-amber-100/90 text-stone-800 border-stone-300 shadow-inner shadow-amber-200/50';
      case 'color-lcd':
        return 'bg-stone-900 text-stone-150 border-stone-850 shadow-inner shadow-indigo-950/20';
      case 'monochrome-blue':
      default:
        return 'bg-sky-100/95 text-stone-800 border-sky-200 shadow-inner shadow-sky-200/50';
    }
  };

  const isDarkScreen = device.ipodBacklightColor === 'color-lcd';

  return (
    <div className="relative w-[280px] mx-auto min-h-[460px] rounded-[30px] p-5 flex flex-col justify-between items-center transition-all duration-500 overflow-hidden text-neutral-800" style={getCasingStyle()}>
      {/* Background Wear and Decal */}
      <StickerAndWear
        stickerId={device.stickerId}
        stickerX={device.stickerX}
        stickerY={device.stickerY}
        wearLevel={device.wearLevel}
        onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
      />

      {/* Top Headphone Jack accent dot */}
      <div className="absolute top-0 right-14 w-8 h-1.5 bg-neutral-600 rounded-b-md border-b border-neutral-700 shadow-inner flex justify-center items-center">
        <div className="w-4 h-0.8 bg-black rounded-full" />
      </div>

      {/* Retro MP3 Player Display screen */}
      <div className={`w-full aspect-1.35 border-4 rounded-xl p-3 flex flex-col justify-between font-sans select-none z-10 ${getScreenBgClass()}`}>
        {/* Header battery and play state */}
        <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-0.7 text-[9px] uppercase tracking-wide font-semibold opacity-75">
          <div className="flex items-center gap-1">
            <span>{isPlaying ? '▶' : '‖'} iPod</span>
          </div>
          <div className="flex items-center gap-1.2">
            <span className="text-[8px]">🔊 {volume}%</span>
            <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex">
              <div className="w-11/12 h-full bg-current rounded-3xs" />
            </div>
          </div>
        </div>

        {/* Dynamic Songs playlist or active music player grid */}
        <div className="flex-1 flex flex-col justify-around py-1 overflow-hidden">
          {isPlaying ? (
            // Now Playing Active Dashboard screen
            <div className="flex flex-col gap-0.7">
              <div className="text-[10px] font-bold tracking-tight truncate">
                {RETRO_SONGS[scrollIndex].title}
              </div>
              <div className="text-[8px] opacity-75 truncate">
                Art.: {RETRO_SONGS[scrollIndex].artist}
              </div>
              <div className="text-[7.5px] opacity-65 font-mono">
                Gen.: {RETRO_SONGS[scrollIndex].genre.toUpperCase()} | Anno: {RETRO_SONGS[scrollIndex].year}
              </div>

              {/* Dynamic waveform visualizer bar strip */}
              <div className="h-6 flex items-end gap-1 px-1 bg-black/5 dark:bg-white/5 rounded my-1">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-xs bg-current"
                    style={{
                      height: `${10 + Math.abs(Math.sin((Date.now() / 150) + i) * 80)}%`,
                      opacity: 0.82,
                    }}
                  />
                ))}
              </div>

              {/* Timeline scrubber bar */}
              <div className="w-full flex items-center justify-between text-[7px] mt-0.5 opacity-80">
                <span>0:42</span>
                <div className="flex-1 mx-2 h-1 bg-black/15 dark:bg-white/15 rounded-full overflow-hidden">
                  <div className="w-2/5 h-full bg-current" />
                </div>
                <span>3:15</span>
              </div>
            </div>
          ) : (
            // Music List navigation
            <div className="flex flex-col gap-0.5 text-[8.5px] tracking-tight">
              <span className="text-[7.5px] font-bold opacity-60 uppercase mb-0.5">Playlist Digitale:</span>
              {RETRO_SONGS.map((song, index) => {
                const isSelected = index === scrollIndex;
                return (
                  <div
                    key={index}
                    onClick={() => {
                      playClick(1000, 0.015);
                      setScrollIndex(index);
                    }}
                    className={`px-1.5 py-0.5 rounded flex justify-between cursor-pointer ${
                      isSelected
                        ? isDarkScreen
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-zinc-800 text-white font-semibold'
                        : 'opacity-85 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{song.title}</span>
                    <span className="scale-90 opacity-70">➔</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Signature physical Click-Wheel controls */}
      <div className="relative w-44 h-44 rounded-full border border-black/10 flex items-center justify-center select-none shadow-md mb-2 z-10 mt-4 bg-gradient-to-b from-stone-55 to-stone-150 relative ring-4 ring-black/10 active:scale-[0.98] transition-transform" style={{ backgroundColor: device.ipodClickwheelColor || '#ffffff' }}>
        {/* Upper Option MENU */}
        <button
          onClick={handleMenuClick}
          className="absolute top-2 text-[10px] font-black font-sans uppercase tracking-widest text-zinc-500 hover:text-zinc-800 cursor-pointer active:scale-90"
        >
          MENU
        </button>

        {/* Right Forward button */}
        <button
          onClick={handleNextClick}
          className="absolute right-2.5 text-[10px] text-zinc-505 font-bold hover:text-zinc-800 cursor-pointer active:scale-90"
        >
          ⏭
        </button>

        {/* Left Previous button */}
        <button
          onClick={handleMenuClick}
          className="absolute left-2.5 text-[10px] text-zinc-505 font-bold hover:text-zinc-800 cursor-pointer active:scale-90"
        >
          ⏮
        </button>

        {/* Bottom Play Pause */}
        <button
          onClick={handlePlayToggle}
          className="absolute bottom-2 text-[9px] text-zinc-505 hover:text-zinc-805 cursor-pointer active:scale-90"
        >
          ⏯
        </button>

        {/* Volume Scroll Dial interactive area helper overlays */}
        <button
          onClick={() => adjustVolume(-10)}
          className="absolute left-7 top-7 text-[10px] text-zinc-400 opacity-60 hover:opacity-100"
          title="Vol -"
        >
          -
        </button>
        <button
          onClick={() => adjustVolume(10)}
          className="absolute right-7 top-7 text-[10px] text-zinc-400 opacity-60 hover:opacity-100"
          title="Vol +"
        >
          +
        </button>

        {/* Center Round metal click enter button */}
        <button
          onClick={handleCenterClick}
          className="w-16 h-16 rounded-full bg-gradient-to-b from-stone-50 to-stone-100 border-2 border-stone-300 shadow-md flex items-center justify-center cursor-pointer active:scale-90 ring-1 ring-black/5 hover:border-zinc-400 transition-colors"
        >
          <div className="w-5 h-5 rounded-full border border-stone-200/50 bg-stone-100 shadow-inner" />
        </button>
      </div>

      {/* Tiny descriptive brand signature */}
      <span className="text-[7.5px] text-black/50 font-bold uppercase tracking-[0.34em] select-none text-center">
        DISPOSITIVO PORTATILE MP3
      </span>
    </div>
  );
};
