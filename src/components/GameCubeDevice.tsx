import React, { useEffect, useState } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { playClick, playChiptuneBleep, playRetroJingle } from '../utils/audio';

interface GameCubeDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const GameCubeDevice: React.FC<GameCubeDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [powerOn, setPowerOn] = useState(false);
  const [bootSequence, setBootSequence] = useState(false);
  const [lidOpen, setLidOpen] = useState(false);

  useEffect(() => {
    if (powerOn) {
      setBootSequence(true);
      if (isAudioOn) {
        // Play legendary bouncy chiptune GameCube jingle
        playRetroJingle('gamecube');
      }
      const timer = setTimeout(() => {
        setBootSequence(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setBootSequence(false);
    }
  }, [powerOn]);

  const togglePower = () => {
    playClick(100, 0.12);
    setPowerOn(!powerOn);
  };

  const handleLidBtn = () => {
    playClick(320, 0.18);
    setLidOpen(!lidOpen);
  };

  const getCasingStyle = () => {
    return {
      backgroundColor: device.primaryColor || '#534394',
      border: '4px solid rgba(0,0,0,0.18)',
      boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.3), 0 15px 35px rgba(0,0,0,0.5)',
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 select-none animate-fade-in">
      
      {/* Dual Layout: Purple Console on Left / Retro TV monitor on Right */}
      <div className="flex flex-col md:flex-row gap-5 items-stretch">
        
        {/* Physical GameCube Casing */}
        <div 
          className="relative max-w-sm w-full mx-auto aspect-square flex flex-col justify-between p-5 rounded-[2rem] transition-all duration-500 overflow-hidden text-neutral-800 shadow-xl border-4 border-black/15" 
          style={getCasingStyle()}
        >
          {/* Background Wear and Decal */}
          <StickerAndWear
            stickerId={device.stickerId}
            stickerX={device.stickerX}
            stickerY={device.stickerY}
            wearLevel={device.wearLevel}
            onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
          />

          {/* Top Carry Handle background accent */}
          <div className="absolute top-0 inset-x-12 h-6 bg-stone-900/60 rounded-b-xl border-x-3 border-b-2 border-stone-850 shadow-inner z-5 flex justify-center">
            <div className="w-16 h-3 bg-stone-950 rounded-b-md" />
          </div>

          {/* GameCube Top plate with circular CD door */}
          <div className="flex-1 flex flex-col justify-center items-center relative my-3 select-none z-10 p-2">
            <div className="w-40 h-40 rounded-full border-3 border-stone-900/40 bg-black/10 flex items-center justify-center relative shadow-inner">
              
              {lidOpen ? (
                // Disc laser tray
                <div className="absolute inset-1 rounded-full bg-stone-900 p-2 flex flex-col justify-center items-center shadow-inner text-white">
                  
                  {/* Spindle drive with miniature disc (3-inch Nintendo mini DVD) */}
                  <div className="w-10 h-10 rounded-full bg-stone-950 border-2 border-stone-800 shadow-md flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 bg-stone-800 border border-zinc-500" />
                  </div>

                  {/* Game Cube unique small disc */}
                  <div
                    className="absolute w-26 h-26 rounded-full bg-linear-to-tr from-purple-800 via-indigo-700 to-stone-900 border-2 border-stone-950 flex flex-col justify-center items-center cursor-pointer shadow-lg hover:rotate-12 duration-300 transform"
                  >
                    {/* Center circle */}
                    <div className="w-8 h-8 rounded-full border border-stone-800 bg-stone-900/40 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border border-stone-950 bg-black/10" />
                    </div>
                    <span className="text-[5px] font-mono font-bold tracking-tight text-white mt-1 uppercase leading-none">
                      NINTENDO MINI
                    </span>
                    <span className="text-[4.5px] font-mono text-zinc-400">Smash Bros.</span>
                  </div>
                </div>
              ) : (
                // Original Glossy Badge
                <div className="flex flex-col items-center justify-center">
                  {/* Signature top circular Jewel plate */}
                  <button
                    onClick={handleLidBtn}
                    className="w-20 h-20 rounded-full bg-stone-950 border-3 border-stone-850 flex items-center justify-center shadow-lg hover:scale-105 duration-300 relative cursor-pointer"
                  >
                    {/* Mirror overlay reflection */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                    
                    {device.gcJewelPlate === 'retro-sun' ? (
                      <span className="text-2xl">☀️</span>
                    ) : device.gcJewelPlate === 'user-monogram' ? (
                      <span className="text-indigo-400 font-black font-mono text-base tracking-wider leading-none">RETRO</span>
                    ) : (
                      // Classic GameCube original symbol logo
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-[3px] border-indigo-400 rounded-sm rotate-45 flex items-center justify-center">
                          <div className="w-3 h-3 bg-indigo-500 rounded-xs" />
                        </div>
                        <span className="text-[6px] text-zinc-300 font-black mt-1.5 tracking-widest leading-none font-sans">GAMECUBE</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Front Controller Sockets plate */}
          <div className="bg-stone-300/90 border-t-2 border-stone-400 rounded-xl px-3 py-2 px-1 shadow-inner flex flex-col justify-between select-none z-10 w-full mt-1">
            
            {/* controller slots row */}
            <div className="flex justify-around items-center w-full">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex flex-col items-center gap-0.8">
                  {/* Socket hole */}
                  <div className="w-6 h-6 rounded-full bg-stone-900/95 border border-stone-400/80 shadow-inner flex items-center justify-center relative">
                    <div className="w-3 h-2 bg-stone-950 border border-zinc-700 rounded-b-sm flex justify-around p-0.5">
                      <div className="w-0.5 h-0.5 bg-zinc-300 rounded-full" />
                      <div className="w-0.5 h-0.5 bg-zinc-300 rounded-full" />
                    </div>
                    {/* Simulated joystick plug controller wire inserted */}
                    {device.gcControllerConnected && num === 1 && (
                      <div className="absolute inset-[-1.5px] rounded-full bg-gradient-to-b from-orange-400 to-orange-550 border-1.5 border-orange-700 shadow flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-stone-900 rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className="text-[5px] font-mono text-stone-500 font-bold">PT {num}</span>
                </div>
              ))}
            </div>

            {/* Buttons mechanical level panel */}
            <div className="flex justify-between items-center w-full mt-2 pt-1.5 border-t border-stone-300 select-none">
              {/* POWER Click on left */}
              <div className="flex flex-col items-center gap-0.5 shadow-sm">
                <button
                  onClick={togglePower}
                  className={`w-9 h-5 rounded-xs border border-stone-850 cursor-pointer transition-all ${
                    powerOn
                      ? 'bg-indigo-300 border-indigo-400 shadow-inner translate-y-px text-stone-900'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-450'
                  }`}
                >
                  <span className="text-[7px] font-mono font-black">{powerOn ? 'ON' : 'OFF'}</span>
                </button>
                <span className="text-[6.5px] font-bold text-stone-500 uppercase">POWER</span>
              </div>

              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full border border-stone-800 transition-shadow duration-300 ${
                    powerOn ? 'bg-orange-500 shadow-[0_0_5px_#f97316]' : 'bg-neutral-800'
                  }`}
                />
                <span className="text-[6px] font-mono font-bold text-stone-500 uppercase">LED</span>
              </div>

              {/* OPEN Lid releases lid latch */}
              <div className="flex flex-col items-center gap-0.5 shadow-sm">
                <button
                  onClick={handleLidBtn}
                  className="w-9 h-5 rounded-xs bg-stone-800 border border-stone-850 hover:bg-stone-700 text-stone-300 cursor-pointer active:translate-y-px"
                >
                  <span className="text-[7px]">▲</span>
                </button>
                <span className="text-[6.5px] font-bold text-stone-500 uppercase">OPEN</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CRT NINTENDO GAMECUBE COMPATIBLE GAME SCREEN (TV SYSTEM)                  */}
        {/* ========================================================================= */}
        <div className="flex-1 md:w-3/5 min-h-[260px] bg-stone-900 border-8 border-indigo-950/40 rounded-3xl flex flex-col justify-between p-3.5 relative overflow-hidden shadow-2xl">
          
          {/* CRT Scanline Filter overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.22)_50%),_linear-gradient(90deg,rgba(160,32,240,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[size:100%_4px,_6px_100%] pointer-events-none z-30" />
          
          <div className="flex-1 flex flex-col relative w-full h-full bg-stone-950 border border-neutral-900 rounded-lg overflow-hidden select-none">
            
            {!powerOn ? (
              // TELEVISORE SPENTO / OFF STATE
              <div className="absolute inset-0 bg-stone-950 flex flex-col justify-center items-center text-center p-4">
                <div className="text-[9px] font-mono text-indigo-500/60 select-none uppercase tracking-widest px-3 py-1 bg-[#18152c] rounded-md border border-indigo-950/50">
                  📺 SEGNALE ASSENTE
                </div>
                <span className="text-[8px] font-mono text-stone-600 mt-2 select-none">
                  Accendi l'interruttore POWER del GameCube per attivare il segnale AV
                </span>
              </div>
            ) : bootSequence ? (
              // GAMECUBE SPARK BOOT EXTREME
              <div className="absolute inset-0 bg-[#4c3e8a] z-25 flex flex-col justify-center items-center text-center select-none font-sans overflow-hidden p-4 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-[3px] border-orange-400 rotate-45 flex items-center justify-center animate-spin">
                    <div className="w-4 h-4 bg-orange-500" />
                  </div>
                  <span className="text-white text-md tracking-[0.25em] font-black font-sans mt-5">GAMECUBE</span>
                  <div className="h-1 bg-orange-400 w-12 rounded mt-2.5 animate-ping" />
                </div>
              </div>
            ) : (
              // SCHERMO PRINCIPALE ATTIVO
              <div className="flex-1 flex flex-col justify-between p-2 h-full">
                
                {lidOpen ? (
                  // ERROR STATE
                  <div className="absolute inset-0 bg-stone-900 flex flex-col justify-center items-center text-red-400 font-mono text-[9px] font-bold uppercase text-center p-4 select-none">
                    <span>⚠️ COPERCHIO DEL DISCO APERTO</span>
                    <span className="text-[7.5px] text-stone-550 mt-1 lowercase">Si prega di inserire un mini-DVD e premere il coperchio</span>
                  </div>
                ) : (
                  // PLAYING GAME OR RUNNING EMULATOR DIRECT IFRAME
                  <div className="flex-1 w-full h-full flex flex-col justify-between relative">
                    
                    {device.customVideoUrl ? (
                      /* ========================================================================= */
                      /* PLUG YOUR REAL GBA/GCN EMULATOR IFRAME LINK DIRECTLY HERE                */
                      /* ========================================================================= */
                      <div className="flex-1 bg-black w-full h-full relative border border-white/5 rounded overflow-hidden">
                        <iframe 
                          src={device.customVideoUrl}
                          title="Custom GameCube video ROM"
                          className="w-full h-full border-none"
                          allow="autoplay; encrypted-media; picture-in-picture; gamepad"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 left-1 bg-[#4c3e8a]/90 px-1.5 py-0.5 rounded text-[7px] text-orange-400 font-mono z-40 border border-orange-500/20">
                          EXTERNAL EMULATOR PLAY
                        </div>
                      </div>
                      /* ========================================================================= */
                    ) : (
                      // SIMULATED GAMECUBE HIT
                      <div className="flex-1 flex flex-col relative w-full h-full bg-indigo-950/25 p-2 text-[8px] font-mono text-[#AEB3B7] justify-between h-56">
                        
                        <div className="flex justify-between items-center opacity-70 border-b border-white/5 pb-1 select-none font-bold">
                          <span>SYSTEM: NINTENDO GCN</span>
                          <span className="text-orange-400 font-bold animate-bounce">● ATTIVO</span>
                        </div>

                        {/* Custom Interactive simulation per active CD */}
                        <div className="flex-1 flex flex-col justify-center items-center text-center py-2">
                          <div className="flex flex-col items-center">
                            <span className="text-3xl animate-bounce">🦖</span>
                            <span className="text-indigo-400 font-black text-xs tracking-wider uppercase mt-1">Smash Bros Melee</span>
                            <span className="text-[7.5px] text-neutral-400 mt-0.5">Scelta Personaggio Pronta!</span>
                            <div className="flex gap-1.5 mt-2">
                              <button onClick={() => { if (isAudioOn) playChiptuneBleep(415, 'triangle', 0.1); }} className="px-2 py-0.5 bg-indigo-900 border border-indigo-700 hover:bg-indigo-800 text-orange-300 text-[6.5px] font-mono rounded cursor-pointer font-bold leading-none">LUIGI [L]</button>
                              <button onClick={() => { if (isAudioOn) playChiptuneBleep(830, 'square', 0.1); }} className="px-2 py-0.5 bg-indigo-900 border border-indigo-700 hover:bg-indigo-800 text-orange-300 text-[6.5px] font-mono rounded cursor-pointer font-bold leading-none">MARIO [M]</button>
                            </div>
                          </div>
                        </div>

                        {/* Tip bar */}
                        <div className="text-center text-[7px] border-t border-white/5 pt-1 opacity-55">
                          Personalizza inserendo un URL gioco vero o video qui sotto!
                        </div>

                      </div>
                    )}

                  </div>
                )}
                
              </div>
            )}

          </div>

          {/* CRT Monitor physical indicators */}
          <div className="flex justify-between items-center mt-2 px-2 text-[7.5px] font-mono text-zinc-500 relative">
            <span>GAMECUBE MONITOR GCN-1</span>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
              <span className={`w-1.5 h-1.5 rounded-full ${powerOn ? 'bg-orange-500 shadow-[0_0_5px_#f97316]' : 'bg-neutral-800'}`} />
            </div>
          </div>

        </div>

      </div>

      {/* Real-world Media linker form for customized gaming console */}
      <div className="bg-stone-900/40 border border-neutral-800 p-3 rounded-2xl flex flex-col md:flex-row gap-3 items-center w-full z-10 transition-colors">
        <span className="text-[9px] font-mono text-[#AEB3B7] font-black uppercase shrink-0">🎮 Incolla Gioco / Video CRT:</span>
        <input 
          type="text" 
          placeholder="Incolla un URL (ex. emulatore o gioco online, video YouTube d'epoca, etc)"
          value={device.customVideoUrl || ''}
          onChange={(e) => onChangeDevice({ customVideoUrl: e.target.value })}
          className="bg-stone-950/80 border border-neutral-850 text-[9.5px] text-zinc-300 font-mono rounded px-3 py-1.5 w-full focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
        />
        {device.customVideoUrl && (
          <button 
            onClick={() => onChangeDevice({ customVideoUrl: '' })} 
            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-900/30 text-[9.5px] font-mono text-red-300 rounded cursor-pointer shrink-0 transition-colors"
          >
            Cancella
          </button>
        )}
      </div>

    </div>
  );
};
