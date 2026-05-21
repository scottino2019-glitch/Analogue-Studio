import React, { useEffect, useState } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { playClick, playChiptuneBleep, playPS1Boot } from '../utils/audio';

interface PlayStationDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const PlayStationDevice: React.FC<PlayStationDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [powerOn, setPowerOn] = useState(false);
  const [bootSequence, setBootSequence] = useState(false);
  const [discSpinning, setDiscSpinning] = useState(false);

  useEffect(() => {
    if (powerOn) {
      setBootSequence(true);
      if (isAudioOn) {
        playPS1Boot();
      }

      // Disc starts spinning if closed
      if (!device.psLidOpen) {
        setDiscSpinning(true);
      }

      const timer = setTimeout(() => {
        setBootSequence(false);
      }, 6000); // 6 Sec boot synth sequence

      return () => clearTimeout(timer);
    } else {
      setBootSequence(false);
      setDiscSpinning(false);
    }
  }, [powerOn, device.psLidOpen]);

  const togglePower = () => {
    playClick(110, 0.15); // Chunky microswitch
    setPowerOn(!powerOn);
  };

  const pressReset = () => {
    playClick(200, 0.1);
    if (powerOn) {
      setBootSequence(true);
      if (isAudioOn) {
        playPS1Boot();
      }
      setTimeout(() => setBootSequence(false), 6000);
    }
  };

  const toggleLid = () => {
    playClick(320, 0.22); // Spring loaded release clicking latch
    onChangeDevice({ psLidOpen: !device.psLidOpen });
    if (!device.psLidOpen) {
      setDiscSpinning(false);
    } else if (powerOn) {
      setDiscSpinning(true);
    }
  };

  const getDiscLogo = () => {
    switch (device.psDiscType) {
      case 'spyro':
        return '🟣 SPYRO THE DRAGON';
      case 'resident':
        return '🔴 RESIDENT EVIL';
      case 'tomb_raider':
        return '🟢 TOMB RAIDER';
      case 'crash':
      default:
        return '🟠 CRASH BANDICOOT';
    }
  };

  const getDiscColor = () => {
    switch (device.psDiscType) {
      case 'spyro': return 'from-indigo-600 via-purple-700 to-indigo-900';
      case 'resident': return 'from-red-650 via-rose-800 to-stone-900';
      case 'tomb_raider': return 'from-teal-600 via-emerald-800 to-stone-900';
      case 'crash':
      default: return 'from-amber-500 via-orange-600 to-stone-900';
    }
  };

  const getBodyStyle = () => {
    return {
      backgroundColor: device.primaryColor || '#AEB3B7',
      boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.35), 0 15px 35px rgba(0,0,0,0.55)',
      border: '4px solid rgba(0,0,0,0.15)',
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 select-none">
      
      {/* Dual Layout Panel: Console on Left, CRT TV screen on Right */}
      <div className="flex flex-col md:flex-row gap-5 items-stretch">
        
        {/* Physical PlayStation 1 Console */}
        <div 
          className="relative flex-1 aspect-video flex flex-col justify-between p-7 rounded-[2.5rem] transition-all duration-500 overflow-hidden text-neutral-800 shadow-xl border-4 border-black/15" 
          style={getBodyStyle()}
        >
          {/* Background Wear and Decal */}
          <StickerAndWear
            stickerId={device.stickerId}
            stickerX={device.stickerX}
            stickerY={device.stickerY}
            wearLevel={device.wearLevel}
            onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
          />

          {/* PS1 Top Outer Lid Circle */}
          <div className="flex-1 flex justify-center items-center relative my-2 select-none z-10 p-2">
            
            {/* Memory card slots & controller sockets underneath */}
            <div className="absolute bottom-[-16px] left-10 flex gap-2">
              {/* Card Slot */}
              <div className="w-12 h-2.5 bg-black/30 border border-black/45 rounded-sm" />
              {/* Controller port */}
              <div className="w-12 h-6 bg-black/40 border border-black/50 rounded-b-md" />
            </div>

            {/* Big Circular CD Lid door */}
            <div className="w-48 h-48 rounded-full bg-black/5 border-3 border-stone-400/85 flex items-center justify-center relative shadow-inner ring-4 ring-black/5">
              
              {device.psLidOpen ? (
                // LID OPEN VIEW: Renders internal laser lens and spindle
                <div className="absolute inset-1 rounded-full bg-stone-900 p-3 flex flex-col justify-center items-center shadow-inner text-white select-none">
                  
                  {/* Spindle drive with mini gold pins */}
                  <div className="w-14 h-14 rounded-full bg-stone-950 border-3 border-stone-850 shadow-md flex items-center justify-center z-10 relative">
                    <div className="w-5 h-5 rounded-full bg-stone-800 border-[1.5px] border-zinc-400 flex items-center justify-center">
                      <div className="w-2 h-2 bg-black rounded-full" />
                    </div>
                  </div>

                  {/* PlayStation Black original CD back placed on spindle */}
                  <div
                    onClick={() => onChangeDevice({ psDiscType: device.psDiscType === 'crash' ? 'spyro' : device.psDiscType === 'spyro' ? 'resident' : device.psDiscType === 'resident' ? 'tomb_raider' : 'crash' })}
                    className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr ${getDiscColor()} border-3 border-stone-950 flex flex-col justify-center items-center cursor-pointer shadow-lg active:scale-95 transition-transform`}
                    title="Clicca per cambiare CD!"
                  >
                    {/* Center hole alignment ring */}
                    <div className="w-12 h-12 rounded-full border border-stone-800/80 bg-stone-900/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-stone-950 bg-black/10" />
                    </div>

                    <span className="text-[6.5px] font-mono tracking-widest text-[#AEB3B7] opacity-90 text-center font-bold absolute bottom-6 select-none leading-none">
                      {getDiscLogo().split(' ')[0]} {getDiscLogo().split(' ').slice(1).join(' ')}
                    </span>
                    <span className="text-[4.5px] font-mono font-bold uppercase text-zinc-400 absolute top-6">
                      PS1 BLACK CD
                    </span>
                  </div>

                  {/* Small Laser Pickup Node details */}
                  <div className="absolute right-10 w-5 h-8 bg-zinc-800 rounded border border-zinc-700 flex flex-col justify-around p-1 shadow-inner opacity-75">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto" />
                    <div className="w-full h-0.5 bg-gradient-to-r from-red-500 to-transparent" />
                  </div>

                </div>
              ) : (
                // LID CLOSED VIEW: Show Sony Logo print
                <div className="flex flex-col items-center">
                  {/* Spinning audio disc sound waves if closed and on */}
                  {discSpinning && powerOn && (
                    <div className="absolute inset-2 border border-blue-500/25 rounded-full animate-ping pointer-events-none" />
                  )}
                  {/* Sony PlayStation classic logo block */}
                  <div className="flex flex-col items-center justify-center select-none cursor-pointer" onClick={toggleLid}>
                    {/* Visual S for PlayStation */}
                    <div className="text-4xl font-extrabold text-stone-500 font-mono scale-x-125 select-none leading-8 relative">
                      <span className="text-red-500">P</span>
                      <span className="text-blue-600">S</span>
                    </div>
                    <span className="text-[7.5px] text-stone-600 font-black tracking-[0.34em] mt-1">PlayStation</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Front-Facing visual components and control tabs */}
          <div className="flex justify-between items-center bg-black/10 px-4 py-2 border border-black/5 rounded-2xl select-none z-10 w-full mt-2">
            
            {/* POWER BUTTON (Big mechanical click) */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={togglePower}
                className={`w-11 h-11 rounded-full bg-gradient-to-b from-stone-300 to-stone-400 border-2 border-stone-850 hover:border-stone-900 flex items-center justify-center cursor-pointer transition-all active:translate-y-px ${
                  powerOn ? 'shadow-inner scale-95 translate-y-0.5 border-stone-900' : 'shadow-md shadow-black/25'
                }`}
                title="Pulsante Alimentazione Console"
              >
                <div className="w-3.5 h-3.5 bg-stone-700 rounded-full border border-stone-800 flex items-center justify-center">
                  <div className="w-1 h-1 bg-neutral-100 rounded-full" />
                </div>
              </button>
              <span className="text-[8px] font-mono tracking-wider font-bold text-stone-600 uppercase">POWER</span>
            </div>

            {/* LED Light bar indication */}
            <div className="flex flex-col items-center justify-center">
              <div
                className={`w-3.5 h-1 rounded-sm border border-stone-900 transition-shadow duration-300 ${
                  powerOn
                    ? 'bg-[#22c55e] shadow-[0_0_8px_#22c55e]'
                    : 'bg-neutral-800'
                }`}
              />
              <span className="text-[6.5px] font-mono text-zinc-500 mt-1 uppercase">I/O STAT</span>
            </div>

            {/* RESET BUTTON (Small round mechanical) */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={pressReset}
                className="w-9 h-9 rounded-full bg-gradient-to-b from-stone-300 to-stone-400 border-2 border-stone-800 hover:border-zinc-500 flex items-center justify-center shadow-md active:scale-90 cursor-pointer"
                title="Reset Console"
              >
                <div className="w-2 h-2 bg-stone-600 rounded-full" />
              </button>
              <span className="text-[8px] font-mono tracking-wider font-bold text-stone-600 uppercase">RESET</span>
            </div>

            {/* OPEN BUTTON (Open spring hatch) */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={toggleLid}
                className={`w-10 h-10 rounded-sm bg-gradient-to-b from-stone-300 to-stone-400 border border-stone-800 hover:border-zinc-500 flex items-center justify-center shadow-md active:translate-y-px cursor-pointer ${
                  device.psLidOpen ? 'shadow-inner bg-stone-450 translate-y-0.5' : ''
                }`}
                title="Apri Sportello CD"
              >
                <span className="text-[13px] text-stone-600 leading-none">▲</span>
              </button>
              <span className="text-[8px] font-mono tracking-wider font-bold text-stone-600 uppercase">OPEN</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CRT SONY TRINITRON STYLE TELEVISION MONITOR DISPLAY                       */}
        {/* ========================================================================= */}
        <div className="flex-1 md:w-3/5 min-h-[260px] bg-stone-900 border-8 border-neutral-850 rounded-3xl flex flex-col justify-between p-3.5 relative overflow-hidden shadow-2xl">
          
          {/* CRT Shaders and Scanline mask Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),_linear-gradient(90deg,rgba(255,0,0,0.05),rgba(0,255,0,0.02),rgba(0,0,255,0.05))] bg-[size:100%_4px,_6px_100%] pointer-events-none z-30" />
          
          <div className="flex-1 flex flex-col relative w-full h-full bg-stone-950 border border-neutral-900 rounded-lg overflow-hidden select-none">
            
            {!powerOn ? (
              // OFF STATE DISPLAY
              <div className="absolute inset-0 bg-stone-950 flex flex-col justify-center items-center text-center p-4">
                <div className="text-[9px] font-mono text-zinc-700 select-none uppercase tracking-widest px-3 py-1 bg-stone-900 rounded-md border border-stone-850">
                  📺 SCHERMO SPENTO
                </div>
                <span className="text-[8px] font-mono text-stone-600 mt-2 select-none">
                  Sotto carica: Accendi la console PS1 a sinistra per connettere il segnale video.
                </span>
              </div>
            ) : bootSequence ? (
              // BOOT SEQUENCE LOADER
              <div className="absolute inset-0 bg-neutral-900 z-25 flex flex-col justify-center items-center text-center select-none font-sans overflow-hidden p-4 animate-fade-in">
                <div className="animate-pulse flex flex-col items-center">
                  <span className="text-zinc-300 text-xs tracking-[0.4em] uppercase font-bold text-center leading-4">SONY COMPUTER</span>
                  <span className="text-zinc-300 text-xs tracking-[0.25em] uppercase font-bold text-center mt-1">ENTERTAINMENT</span>
                  
                  <div className="w-2.5 h-2.5 bg-amber-500 rotate-45 my-4" />
                  
                  <span className="text-[8px] text-stone-500 font-mono tracking-wide mt-2">VERSIONE BIOS COSA v1.2 LICENZIATA DA SONY</span>
                </div>
              </div>
            ) : (
              // ACTIVE GAME ON CRT SCREEN
              <div className="flex-1 flex flex-col justify-between p-2 h-full">
                
                {device.psLidOpen ? (
                  // LID INSERTO REQUIRED
                  <div className="absolute inset-0 bg-stone-900 flex flex-col justify-center items-center text-amber-500 font-mono text-[9px] font-bold uppercase text-center p-4 select-none">
                    <span>⚠️ ERRORE LETTURA DISCO</span>
                    <span className="text-[7.5px] text-stone-550 mt-1.5 lowercase">Chiudi lo sportello CD per far ruotare il disco nel lettore ottico</span>
                  </div>
                ) : (
                  // NORMAL LOADING / EXECUTION PLAYGROUND
                  <div className="flex-1 w-full h-full flex flex-col justify-between relative">
                    
                    {device.customVideoUrl ? (
                      /* ========================================================================= */
                      /* PLUG YOUR CUSTOM GAME / ROMS EMULATOR / YOUTUBE IFRAME DIRECTLY HERE     */
                      /* ========================================================================= */
                      <div className="flex-1 bg-black w-full h-full relative border border-white/5 rounded overflow-hidden">
                        <iframe 
                          src={device.customVideoUrl}
                          title="Custom PlayStation Iframe"
                          className="w-full h-full border-none"
                          allow="autoplay; encrypted-media; picture-in-picture; gamepad"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[7px] text-blue-400 font-mono z-40 border border-blue-500/20">
                          EXTERNAL SEGMENT ACTIVED
                        </div>
                      </div>
                      /* ========================================================================= */
                    ) : (
                      // CHOSEN MINI GAME SIMULATOR
                      <div className="flex-1 flex flex-col relative w-full h-full bg-zinc-950 p-2 text-[8px] font-mono text-[#AEB3B7] justify-between h-56">
                        
                        <div className="flex justify-between items-center opacity-60 border-b border-white/5 pb-1 select-none">
                          <span>REGIONE: PAL 50Hz</span>
                          <span className="text-green-500 font-bold animate-pulse">● GIOCANDO</span>
                        </div>

                        {/* Custom Interactive simulator per active CD */}
                        <div className="flex-1 flex flex-col justify-center items-center text-center py-2">
                          {device.psDiscType === 'crash' && (
                            <div className="flex flex-col items-center">
                              <span className="text-3xl animate-bounce">🦊</span>
                              <span className="text-orange-400 font-black text-xs tracking-wider uppercase mt-1">Crash Odyssey</span>
                              <div className="flex gap-1.5 mt-2">
                                <button onClick={() => { if (isAudioOn) playChiptuneBleep(450, 'sine', 0.1); }} className="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-[6.5px] font-mono rounded cursor-pointer">SALTO</button>
                                <button onClick={() => { if (isAudioOn) playChiptuneBleep(900, 'square', 0.1); }} className="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-[6.5px] font-mono rounded cursor-pointer">GIRA</button>
                              </div>
                            </div>
                          )}
                          {device.psDiscType === 'spyro' && (
                            <div className="flex flex-col items-center">
                              <span className="text-3xl animate-pulse">🍇</span>
                              <span className="text-purple-400 font-black text-xs tracking-wider uppercase mt-1">Spyro Realms Mini</span>
                              <div className="flex gap-1.5 mt-2">
                                <button onClick={() => { if (isAudioOn) playChiptuneBleep(780, 'triangle', 0.2); }} className="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-[6.5px] font-mono rounded cursor-pointer">VOLO</button>
                              </div>
                            </div>
                          )}
                          {device.psDiscType === 'resident' && (
                            <div className="flex flex-col items-center">
                              <span className="text-3xl">☣️</span>
                              <span className="text-red-500 font-black text-xs tracking-wider uppercase mt-1">Biohazard Survival</span>
                              <span className="text-[7px] text-stone-500 mt-1">Salva alla macchina da scrivere!</span>
                            </div>
                          )}
                          {device.psDiscType === 'tomb_raider' && (
                            <div className="flex flex-col items-center">
                              <span className="text-3xl">🏜️</span>
                              <span className="text-cyan-400 font-black text-xs tracking-wider uppercase mt-1">Tomb Explorer</span>
                              <div className="flex gap-1.5 mt-2">
                                <button onClick={() => { if (isAudioOn) playChiptuneBleep(620, 'sine', 0.15); }} className="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-[6.5px] font-mono rounded cursor-pointer">AZIONE [X]</button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mini Tip */}
                        <div className="text-center text-[7px] border-t border-white/5 pt-1 opacity-55">
                          Usa il pannello sotto per inserire un gioco vero o video!
                        </div>

                      </div>
                    )}

                  </div>
                )}
                
              </div>
            )}

          </div>

          {/* CRT Monitor physical indicators */}
          <div className="flex justify-between items-center mt-2 px-2 text-[7.5px] font-mono text-zinc-500 relative select-none">
            <span>SONITRON MULTISYNC V1.0</span>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
              <span className={`w-1.5 h-1.5 rounded-full ${powerOn ? 'bg-green-500' : 'bg-neutral-800'}`} />
            </div>
          </div>

        </div>

      </div>

      {/* Real-world Media linker form for customized gaming console */}
      <div className="bg-stone-900/40 border border-neutral-800 p-3 rounded-2xl flex flex-col md:flex-row gap-3 items-center w-full z-10 transition-colors">
        <span className="text-[9px] font-mono text-neutral-400 font-black uppercase shrink-0">🎮 Incolla Gioco / Video CRT:</span>
        <input 
          type="text" 
          placeholder="Incolla un URL (ex. emulatore iframe, arcade, video YouTube embed, etc)"
          value={device.customVideoUrl || ''}
          onChange={(e) => onChangeDevice({ customVideoUrl: e.target.value })}
          className="bg-stone-950/80 border border-neutral-800 text-[9.5px] text-zinc-300 font-mono rounded px-3 py-1.5 w-full focus:outline-none focus:border-blue-500 placeholder-zinc-650"
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
