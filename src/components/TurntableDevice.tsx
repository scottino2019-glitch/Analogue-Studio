import React, { useEffect, useState } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { RETRO_SONGS } from '../data/songs';
import { playClick, startStaticNoise, stopStaticNoise, startMelodySynth, stopMelodySynth, playStreamAudio, pauseStreamAudio, setStreamAudioPlaybackRate } from '../utils/audio';

interface TurntableDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const TurntableDevice: React.FC<TurntableDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(50); // 0 to 100 pitch slide
  const [activeSongIndex, setActiveSongIndex] = useState(1); // default Vapor Wave lofi

  // Calculate current playback speed multiplier
  const getPlaybackRate = () => {
    // 33 is default 1.0, 45 is 1.25, 78 is 1.75
    let baseRate = 1.0;
    if (device.turntableSpeed === '45') baseRate = 1.25;
    if (device.turntableSpeed === '78') baseRate = 1.75;

    // Pitch range -5% to +5% or slightly more
    const pitchFactor = 1.0 + (pitch - 50) / 300;
    return baseRate * pitchFactor;
  };

  // Manage turntable audio synthesis
  useEffect(() => {
    if (device.turntableArmPosition !== 'playing' || !isAudioOn) {
      stopMelodySynth();
      stopStaticNoise();
      pauseStreamAudio();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const currentSong = RETRO_SONGS[activeSongIndex];
    const audioUrl = device.customAudioUrl || currentSong.streamUrl;

    if (audioUrl) {
      playStreamAudio(audioUrl, 0.45, getPlaybackRate());
    } else {
      startMelodySynth(currentSong.genre);
    }
    
    // Smooth crackling static of needle friction
    startStaticNoise(0.012);

    return () => {
      stopMelodySynth();
      stopStaticNoise();
      pauseStreamAudio();
    };
  }, [device.turntableArmPosition, activeSongIndex, isAudioOn, device.turntableSpeed, device.customAudioUrl]);

  // Handle dynamic pitch speed slider updates
  useEffect(() => {
    if (isPlaying) {
      setStreamAudioPlaybackRate(getPlaybackRate());
    }
  }, [pitch, device.turntableSpeed, isPlaying]);

  const handleArmToggle = () => {
    playClick(400, 0.1); // lift lever squeal
    if (device.turntableArmPosition === 'resting') {
      onChangeDevice({ turntableArmPosition: 'playing' });
    } else {
      onChangeDevice({ turntableArmPosition: 'resting' });
    }
  };

  const handleCycleSpeed = () => {
    playClick(1100, 0.03);
    const speeds: ('33' | '45' | '78')[] = ['33', '45', '78'];
    const currentIdx = speeds.indexOf(device.turntableSpeed || '33');
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    onChangeDevice({ turntableSpeed: nextSpeed });
  };

  const handleCycleSong = () => {
    playClick(800, 0.05);
    setActiveSongIndex((prev) => (prev + 1) % RETRO_SONGS.length);
  };

  const getPlinthStyle = () => {
    if (device.turntablePlinthStyle === 'wood') {
      return {
        background: `linear-gradient(135deg, #a0522d 0%, ${device.primaryColor || '#4A1D13'} 65%, #2e1009 100%)`,
        border: '8px solid #361711',
        boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.15), 0 15px 30px rgba(0,0,0,0.5)',
      };
    } else if (device.turntablePlinthStyle === 'metal') {
      return {
        background: `linear-gradient(135deg, #dfdfdf 0%, ${device.primaryColor || '#888888'} 50%, #555555 100%)`,
        border: '6px solid #777777',
        boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.3), 0 15px 30px rgba(0,0,0,0.5)',
      };
    } else {
      // Sleek neon glow vapor plastic
      return {
        backgroundColor: device.primaryColor || '#ff007f',
        border: '6px solid rgba(255,255,255,0.15)',
        boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.22), 0 15px 30px rgba(0,0,0,0.4)',
      };
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-video flex p-5 rounded-2xl transition-all duration-500 overflow-hidden text-neutral-850 gap-6" style={getPlinthStyle()}>
      {/* Background Wear and Decal */}
      <StickerAndWear
        stickerId={device.stickerId}
        stickerX={device.stickerX}
        stickerY={device.stickerY}
        wearLevel={device.wearLevel}
        onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
      />

      {/* Silver platter metal sheet disk underlay */}
      <div className="flex-1 bg-gradient-to-r from-stone-300 via-stone-400 to-stone-500 rounded-full flex justify-center items-center shadow-inner relative select-none ring-4 ring-black/20 z-10 w-full aspect-square overflow-hidden max-w-[210px]">
        
        {/* Grooves grid line */}
        <div className="absolute inset-2 border border-black/10 rounded-full" />
        <div className="absolute inset-5 border border-black/10 rounded-full" />

        {/* Vinyl LP Record body */}
        <div
          onClick={handleCycleSong}
          className={`w-44 h-44 rounded-full border-4 border-stone-950 flex justify-center items-center relative transition-transform shadow-2xl ${
            isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
          style={{
            backgroundColor: device.turntableVinylColor || '#121212',
            animationDuration: device.turntableSpeed === '45' ? '2.5s' : device.turntableSpeed === '78' ? '1.5s' : '4s',
          }}
          title="Clicca per cambiare traccia sul vinile!"
        >
          {/* Vinyl sound waves grooves rings */}
          <div className="absolute inset-3 border border-stone-800 rounded-full pointer-events-none opacity-40" />
          <div className="absolute inset-6 border border-stone-800 rounded-full pointer-events-none opacity-40" />
          <div className="absolute inset-9 border border-stone-800 rounded-full pointer-events-none opacity-40" />
          <div className="absolute inset-12 border border-stone-800 rounded-full pointer-events-none opacity-40" />

          {/* Central Vinyl Sticker label */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-md flex flex-col justify-center items-center border border-black/35">
            <div className="w-4 h-4 rounded-full bg-stone-300 border border-black/20 flex justify-center items-center shadow-inner">
              <div className="w-1.5 h-1.5 bg-neutral-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* Flashing speed strobe timing helper LED on lower left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 opacity-80 z-15">
          <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-red-800'}`} />
          <span className="text-[7px] font-mono text-zinc-200">STROBE</span>
        </div>
      </div>

      {/* Mechanical Tone-Arm & control slide panels */}
      <div className="w-36 flex flex-col justify-between items-center z-10 font-mono select-none">
        
        {/* Tone Arm Unit (Metallic structure with counterweights) */}
        <div className="relative w-full flex-1 flex flex-col justify-start items-end pr-3">
          
          {/* Pivoting Pivot base */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-stone-600 to-stone-800 border-2 border-stone-900 shadow-md flex items-center justify-center relative">
            <div className="w-6 h-6 rounded-full bg-stone-300 border border-zinc-700" />
            
            {/* Tone Arm rod */}
            <div
              onClick={handleArmToggle}
              className="absolute top-6 right-5 h-24 w-1 bg-gradient-to-b from-zinc-300 to-zinc-500 origin-top shadow-md rounded-full transition-all duration-700 hover:brightness-110 cursor-pointer"
              style={{
                transform: device.turntableArmPosition === 'playing' ? 'rotate(18deg)' : 'rotate(-10deg)',
              }}
              title="Clicca per muovere la testina sul vinile!"
            >
              {/* Pickup Cartridge head shell */}
              <div className="absolute bottom-0 left-[-4px] w-3 h-5 bg-stone-800 rounded-xs border border-stone-950 flex flex-col justify-end">
                {/* Finger lift pin */}
                <div className="w-4 h-0.5 bg-zinc-400 rounded-full self-start translate-x-2 translate-y-2" />
                {/* Needle brush lines */}
                <div className="w-full h-1 bg-orange-400/80 rounded-b-xs" />
              </div>
            </div>
          </div>
          
          <span className="text-[7.5px] text-zinc-400 mt-1 uppercase text-right leading-3 font-semibold w-full">TESTINA & LEVA</span>
        </div>

        {/* Control Buttons (Speed knob & Cue lever) */}
        <div className="w-full flex justify-between items-center bg-black/10 p-2 border border-black/5 rounded-xl gap-2 mt-2">
          
          {/* Speed cycle button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleCycleSpeed}
              className="px-2.5 py-1 text-[11px] bg-stone-800 hover:bg-stone-700 text-amber-500 rounded border border-stone-950 cursor-pointer text-center font-bold font-mono select-none"
            >
              {device.turntableSpeed || '33'}
            </button>
            <span className="text-[6.5px] text-black/50 font-bold mt-1">GIRI/MIN</span>
          </div>

          {/* Song selector button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleCycleSong}
              className="p-1 px-1.5 text-[8.5px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-950 cursor-pointer font-bold leading-3 select-none truncate max-w-[64px]"
              title={RETRO_SONGS[activeSongIndex].title}
            >
              {RETRO_SONGS[activeSongIndex].title.slice(0, 5)}..
            </button>
            <span className="text-[6.5px] text-black/50 font-bold mt-1 uppercase">TRACK</span>
          </div>
        </div>

        {/* Pitch Linear speed slider */}
        <div className="w-full bg-black/10 rounded-xl px-2.5 py-2 border border-black/5 mt-2.5 text-center flex items-center justify-between gap-2">
          <span className="text-[7px] text-black/50 font-bold font-mono">PITCH</span>
          <input
            type="range"
            min="0"
            max="100"
            value={pitch}
            onChange={(e) => {
              setPitch(parseInt(e.target.value));
              if (isAudioOn) playClick(1000 + (pitch - 50) * 10, 0.005);
            }}
            className="w-full h-1.5 bg-black/35 rounded-lg cursor-pointer"
          />
          <span className="text-[8px] font-mono text-amber-600 font-bold">{pitch > 50 ? '+' : ''}{(pitch - 50) / 10}%</span>
        </div>
      </div>

      {/* Retro Brand Label stamp */}
      <div className="absolute bottom-2 left-6 border-t border-black/10 pt-1 select-none pointer-events-none">
        <span className="text-[7.5px] uppercase font-black tracking-[0.25em] text-black/45">{device.brand || 'DARRARD'} RETROPLAYER</span>
      </div>

      {/* Active notification bubble */}
      {isPlaying && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/85 text-amber-400 font-mono text-[8px] px-3.5 py-0.5 rounded-full shadow-lg border border-amber-500/10 z-30 animate-pulse tracking-wide uppercase">
          📻 Track: {RETRO_SONGS[activeSongIndex].title} ({RETRO_SONGS[activeSongIndex].year})
        </div>
      )}
    </div>
  );
};
