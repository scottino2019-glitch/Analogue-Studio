import React, { useEffect, useState } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { playClick, startStaticNoise, stopStaticNoise, playChiptuneBleep } from '../utils/audio';

interface TVDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const TVDevice: React.FC<TVDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [antennaNoise, setAntennaNoise] = useState(0);

  // Calculate TV Noise based on antenna adjustment and Channel
  useEffect(() => {
    // If antenna length is short (< 50) or angle is close to center, add extra static noise!
    const lengthDeficit = Math.max(0, 100 - (device.tvAntennaLength || 100));
    const angleOffset = Math.abs(device.tvAntennaAngle || 0);
    
    // Antennas are most tuned when they are long and slightly tilted
    let noiseFactor = (lengthDeficit / 100) * 0.4 + (1 - angleOffset / 45) * 0.15;
    
    // Add specific channel noise
    if (device.tvChannel === 9) noiseFactor = 1.0; // pure static channel

    setAntennaNoise(Math.min(1, Math.max(0, noiseFactor)));
  }, [device.tvAntennaLength, device.tvAntennaAngle, device.tvChannel]);

  // Audio setup for TV Static noise
  useEffect(() => {
    if (!isAudioOn || !isPowerOn) {
      stopStaticNoise();
      return;
    }

    // Static volume mapped of total static level (device setting + antenna noise)
    const currentStatic = Math.min(1.0, (device.tvStaticLevel || 0.4) + antennaNoise);
    if (currentStatic > 0.1) {
      startStaticNoise(currentStatic * 0.04);
    } else {
      startStaticNoise(0.002); // faint background ambient fuzz
    }

    return () => {
      stopStaticNoise();
    };
  }, [isAudioOn, isPowerOn, device.tvStaticLevel, antennaNoise]);

  const togglePower = () => {
    playClick(100, 0.2); // deep punch of relays
    setTimeout(() => {
      if (!isPowerOn) {
        // play high-frequency flyback line squeal
        playClick(15000, 0.4);
      }
    }, 50);
    setIsPowerOn(!isPowerOn);
  };

  const cycleChannel = () => {
    playClick(500, 0.08);
    const nextChannel = device.tvChannel >= 12 ? 2 : device.tvChannel + 1;
    onChangeDevice({ tvChannel: nextChannel });
  };

  const handleAntennaSlider = (val: number) => {
    onChangeDevice({ tvAntennaLength: val });
    if (isPowerOn) {
      playClick(300, 0.01);
    }
  };

  const handleStaticSlider = (val: number) => {
    onChangeDevice({ tvStaticLevel: val });
  };

  const getBodyStyle = () => {
    if (device.bodyMaterial === 'wood') {
      return {
        background: `linear-gradient(135deg, #8b4513 0%, ${device.primaryColor} 60%, #4a250b 100%)`,
        border: '10px solid #3d1b06',
        boxShadow: 'inset 0 4px 15px rgba(255,255,255,0.15), 0 15px 30px rgba(0,0,0,0.6)',
      };
    } else if (device.bodyMaterial === 'metal') {
      return {
        background: `linear-gradient(135deg, #cccccc 0%, ${device.primaryColor} 50%, #777777 100%)`,
        border: '8px solid #999999',
        boxShadow: 'inset 0 4px 15px rgba(255,255,255,0.3), 0 15px 30px rgba(0,0,0,0.6)',
      };
    } else if (device.bodyMaterial === 'translucent') {
      return {
        background: `${device.primaryColor}dd`,
        border: '8px solid rgba(255,255,255,0.3)',
        boxShadow: 'inset 0 4px 15px rgba(255,255,255,0.2), 0 15px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
      };
    } else {
      // Classic vintage orange or olive-drab hard plastic
      return {
        backgroundColor: device.primaryColor,
        border: '8px solid rgba(0,0,0,0.2)',
        boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.15), 0 15px 30px rgba(0,0,0,0.6)',
      };
    }
  };

  const getYouTubeId = (url: string | undefined): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getBroadcastVideoId = (): string | null => {
    if (device.customVideoUrl) {
      return getYouTubeId(device.customVideoUrl);
    }
    // Preset maps
    if (device.tvChannel === 2) return 'F_S9p-m8l4Y'; // 80s commercials compilation
    if (device.tvChannel === 4) return 'yP_7gXQk7d8'; // Atari/Nintendo Nes retro arcade compilation
    if (device.tvChannel === 7) return '4xDzrJKXOOY'; // Lofi Synthwave driving loop
    return null;
  };

  // Live Screen graphics depending on selected channel
  const renderScreenContent = () => {
    if (!isPowerOn) {
      return (
        // Glossy powered off glass with reflection
        <div className="absolute inset-0 bg-neutral-950 transition-all duration-700 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
          {/* Fading white dot of collapsing CRT beam left right after turnoff */}
          <div className="absolute w-2 h-2 bg-white rounded-full blur-[1px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-1000" />
        </div>
      );
    }

    const currentTotalStatic = Math.min(1.0, (device.tvStaticLevel || 0.45) + antennaNoise);
    const videoId = getBroadcastVideoId();

    return (
      <div className={`absolute inset-0 overflow-hidden flex items-center justify-center font-mono ${
        device.tvVintageFilter === 'bw' ? 'grayscale' :
        device.tvVintageFilter === 'sepia' ? 'sepia contrast-125' :
        device.tvVintageFilter === 'cyberpunk' ? 'hue-rotate-180 saturate-200 contrast-125' : ''
      }`}>
        {/* CRT Scanline Grille Layer overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,0,0.03)_33%,rgba(255,0,0,0.03)_66%,rgba(0,0,255,0.03)_100%)] bg-[size:3px_100%] pointer-events-none z-10" />

        {/* Animated Phosphor Screen Flicker */}
        <div className="absolute inset-0 bg-white/5 pointer-events-none z-10 animate-pulse" />

        {/* Dynamic Static snow layer */}
        {currentTotalStatic > 0.05 && (
          <div
            className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px] mix-blend-difference pointer-events-none z-9 opacity-100 animate-[pulse_0.15s_infinite]"
            style={{
              opacity: currentTotalStatic * 0.95,
              backgroundPosition: `${Math.random() * 10}px ${Math.random() * 10}px`,
            }}
          />
        )}

        {/* Real YouTube video player if available */}
        {videoId ? (
          <div className="w-full h-full relative pointer-events-auto">
            {/* Interactive Iframe Stream */}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${videoId}`}
              className="w-full h-full border-none pointer-events-auto shadow-inner relative z-1"
              allow="autoplay; encrypted-media"
              title="Real Retro Broadcast"
            />
            {/* Small audio help badge overlay */}
            <div className="absolute bottom-1 right-1 bg-black/80 border border-white/20 text-[7px] text-stone-300 font-mono scale-90 rounded p-1 z-30 tracking-wider flex items-center gap-1 cursor-help pointer-events-none select-none">
              🔈 CLICCA PLAYER PER REGOLARE AUDIO
            </div>
          </div>
        ) : (
          // Pure noise state, static channel, TV logo
          <div className="flex flex-col items-center">
            <span className="text-white text-3xl font-black tracking-widest bg-black/60 px-4 py-1 rounded shadow-lg border border-white/20">
              CH {device.tvChannel}
            </span>
            <span className="text-white bg-red-650 text-[10px] px-3 py-0.5 rounded mt-2 uppercase tracking-widest font-bold">
              ASSENZA SEGNALE
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-video flex p-4 rounded-3xl transition-all duration-500 overflow-hidden text-neutral-800 gap-4" style={getBodyStyle()}>
      {/* Background Wear and Decal */}
      <StickerAndWear
        stickerId={device.stickerId}
        stickerX={device.stickerX}
        stickerY={device.stickerY}
        wearLevel={device.wearLevel}
        onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
      />

      {/* Dual Rabbit Ear Antennas with physical placement */}
      <div className="absolute inset-x-0 top-0 h-4 flex justify-between px-16 pointer-events-none">
        {/* Left Ear */}
        <div
          className="absolute left-24 w-1.5 bg-neutral-400 origin-bottom transition-all duration-300"
          style={{
            height: `${device.tvAntennaLength || 60}px`,
            transform: `rotate(${-(device.tvAntennaAngle || 20) - 25}deg) translateY(-100%)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-neutral-600 rounded-full" />
        </div>
        {/* Right Ear */}
        <div
          className="absolute right-24 w-1.5 bg-gradient-to-t from-neutral-500 to-neutral-400 origin-bottom transition-all duration-300"
          style={{
            height: `${device.tvAntennaLength || 60}px`,
            transform: `rotate(${(device.tvAntennaAngle || 20) + 25}deg) translateY(-100%)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-neutral-600 rounded-full" />
        </div>
      </div>

      {/* High-Fidelity CRT Curved Bezel screen container */}
      <div className="flex-1 rounded-[1.8rem] border-6 border-neutral-700/60 bg-neutral-850 shadow-inner relative flex overflow-hidden ring-4 ring-black/45 z-10 select-none">
        {renderScreenContent()}
        {/* Glare mask overlay */}
        <div className="absolute inset-0 bg-radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_60%) pointer-events-none z-15" />
        {/* Shadow border for CRT glass depth */}
        <div className="absolute inset-0 shadow-[inset_0_4px_24px_rgba(0,0,0,0.85)] pointer-events-none z-15" />
      </div>

      {/* Vertical Side Control Panel (Skeuomorphic knobs + speaker) */}
      <div className="w-24 bg-black/15 border border-black/5 rounded-2xl flex flex-col justify-between items-center p-2 pt-3 z-10 font-mono select-none">
        {/* Brand label */}
        <div className="text-[9px] font-black uppercase text-black/60 tracking-wider text-center">{device.brand || 'SUPER-CHRON'}</div>

        {/* Channel Rotary Selector Knob */}
        <div className="flex flex-col items-center gap-0.5 mt-2">
          <button
            onClick={cycleChannel}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-stone-600 via-stone-400 to-stone-750 border-2 border-stone-850 flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer relative"
          >
            {/* Pointer notch indicator */}
            <div
              className="absolute inset-0 pointer-events-none flex justify-center"
              style={{ transform: `rotate(${(device.tvChannel - 2) * 32}deg)` }}
            >
              <div className="w-1 h-3.5 bg-stone-900 rounded-b" />
            </div>
            <div className="w-6 h-6 bg-stone-800 rounded-full border border-stone-900 flex items-center justify-center text-stone-300 font-bold text-xs select-none shadow-inner">
              {device.tvChannel}
            </div>
          </button>
          <span className="text-[7px] text-black/55 font-bold mt-0.5 uppercase tracking-wide">CANALE</span>
        </div>

        {/* Small Sliders for Fine tuning Contrast / Brightness */}
        <div className="w-full flex justify-around my-2 px-1">
          {/* Antenna tuner slider */}
          <div className="flex flex-col items-center">
            <input
              type="range"
              min="10"
              max="140"
              value={device.tvAntennaLength}
              onChange={(e) => handleAntennaSlider(parseInt(e.target.value))}
              className="w-1.5 h-10 bg-black/35 rounded-lg appearance-slider h-oriented"
              style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}
            />
            <span className="text-[6px] text-black/55 font-bold mt-1 scale-85 uppercase">ANT</span>
          </div>

          {/* Static level adjustment slider */}
          <div className="flex flex-col items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={device.tvStaticLevel}
              onChange={(e) => handleStaticSlider(parseFloat(e.target.value))}
              className="w-1.5 h-10 bg-black/35 rounded-lg appearance-slider h-oriented"
              style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}
            />
            <span className="text-[6px] text-black/55 font-bold mt-1 scale-85 uppercase">STAT</span>
          </div>
        </div>

        {/* Vertical Speaker Grille Lines */}
        <div className="w-full h-8 flex justify-between px-2 bg-black/20 rounded-md py-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.2 h-full bg-stone-900/40 rounded-full" />
          ))}
        </div>

        {/* Power Toggle Push Button */}
        <div className="flex flex-col items-center mt-2">
          <button
            onClick={togglePower}
            className={`w-8 h-8 rounded-full border border-black/40 shadow-md flex items-center justify-center transition-all cursor-pointer ${
              isPowerOn
                ? 'bg-red-500 border-red-600 text-white shadow-inner translate-y-0.5'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3C h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
            </svg>
          </button>
          <span className="text-[7px] text-black/55 font-bold mt-0.5 tracking-wider">POWER</span>
        </div>
      </div>
    </div>
  );
};
