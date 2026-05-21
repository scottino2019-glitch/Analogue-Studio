import React, { useEffect, useState, useRef } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { playClick, playChiptuneBleep } from '../utils/audio';

interface PCDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const PCDevice: React.FC<PCDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [floppyLoaded, setFloppyLoaded] = useState(false);
  const [commandLine, setCommandLine] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // States for interactive mini-text editor and custom spaces
  const [isEditorOpen, setIsEditorOpen] = useState(true); // Open by default once initialized for user utility
  const [editorText, setEditorText] = useState('Benvenuto nell\'Editor di Testo d\'Epoca!\n\nQui puoi scrivere appunti, testi o codici.\n\n[SPAZIO RISERVATO PER IL TUO EDITORE / GIOCO / PROGETTI]\nUsa e modifica questo componente a piacimento.\n\nPuoi digitare qui per testare...');
  const [fileName, setFileName] = useState('NOTE.TXT');

  // Restart booting when power or template configuration is altered
  useEffect(() => {
    if (isPowerOn) {
      setIsBooting(true);
      setBootProgress(0);
      setTerminalHistory([]);
      
      const timer = setInterval(() => {
        setBootProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsBooting(false);
            // Default first history
            setTerminalHistory([
              'VINTAGE BIOS V3.12 (C) 1984',
              'RAM SYSTEM CHECK: 640KB OK',
              floppyLoaded ? 'CARICAMENTO DA FLOPPY DISK...' : 'AVVIO DA DISCO RIGIDO C:',
              device.pcBootOS === 'dos' ? 'MS-DOS v5.0 loaded' : device.pcBootOS === 'system7' ? 'Mac System 7 Initialized!' : 'Retro-OS Core Ready.',
              ' ',
              'Digita un comando o clicca sulla tastiera per interagire!',
              'C:\\>'
            ]);
            return 100;
          }
          return prev + 20;
        });
      }, 300);

      // Play retro hard drive spinup noise
      if (isAudioOn) {
        playChiptuneBleep(150, 'sawtooth', 0.6);
        setTimeout(() => playChiptuneBleep(450, 'sine', 0.1), 300);
      }

      return () => clearInterval(timer);
    } else {
      setIsBooting(false);
      setTerminalHistory([]);
    }
  }, [isPowerOn, floppyLoaded, device.pcBootOS]);

  // Keep screen scrolled down
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const togglePower = () => {
    playClick(150, 0.15); // satisfying big chunky toggle switch
    setIsPowerOn(!isPowerOn);
  };

  const handleInsertFloppy = () => {
    if (isAudioOn) {
      playClick(300, 0.2); // mechanical sliding sound
      setTimeout(() => playChiptuneBleep(280, 'triangle', 0.1), 220);
    }
    setFloppyLoaded(!floppyLoaded);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isAudioOn) playClick(900, 0.03);
      if (!commandLine.trim()) return;

      const trimmedCmd = commandLine.trim().toLowerCase();
      let reply = `Comando sconosciuto: '${trimmedCmd}'`;

      if (trimmedCmd === 'help' || trimmedCmd === 'aiuto') {
        reply = 'Comandi: help, info, run, date, cls, play, edit, notepad';
      } else if (trimmedCmd === 'info') {
        reply = `PC Retro '${device.brand || 'IBM'}'. Terminale ${device.pcTerminalColor.toUpperCase()}. OS: ${device.pcBootOS.toUpperCase()}.`;
      } else if (trimmedCmd === 'cls') {
        setTerminalHistory(['C:\\>']);
        setCommandLine('');
        return;
      } else if (trimmedCmd === 'date') {
        reply = `Data corrente: ${new Date().toLocaleDateString()}`;
      } else if (trimmedCmd === 'run') {
        reply = 'Esecuzione codice in corso... RETRO CRAFT STUDIO v1.0 caricato in RAM!';
      } else if (trimmedCmd === 'edit' || trimmedCmd === 'notepad') {
        setIsEditorOpen(true);
        reply = 'Apertura Blocco Note Retro... Blocco Note caricato in RAM!';
      } else if (trimmedCmd === 'play') {
        if (isAudioOn) {
          playChiptuneBleep(523.25, 'square', 0.1);
          setTimeout(() => playChiptuneBleep(659.25, 'square', 0.1), 100);
          setTimeout(() => playChiptuneBleep(783.99, 'square', 0.2), 200);
        }
        reply = '♪ Chiptune melodica riprodotta via Altoparlante di Sistema!';
      }

      setTerminalHistory((prev) => [
        ...prev,
        `C:\\>${commandLine}`,
        reply,
        'C:\\>'
      ]);
      setCommandLine('');
    } else {
      // Simulate real clicking chiptune sound on keypress
      if (isAudioOn) {
        playClick(800 + Math.random() * 300, 0.015);
      }
    }
  };

  const handleKeyboardClick = (char: string) => {
    if (!isPowerOn || isBooting) return;
    setCommandLine((prev) => prev + char);
    if (isAudioOn) {
      playClick(800 + Math.random() * 200, 0.012);
    }
  };

  // Select screen glowing color style based on setting
  const getScreenColorClass = () => {
    switch (device.pcTerminalColor) {
      case 'amber':
        return 'text-amber-500 border-amber-950/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'cyan':
        return 'text-cyan-400 border-cyan-950/40 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]';
      case 'white':
        return 'text-stone-100 border-stone-800 bg-stone-900/40 shadow-[0_0_15px_rgba(240,240,240,0.1)]';
      case 'green':
      default:
        return 'text-emerald-500 border-emerald-950/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    }
  };

  const getScreenClowColor = () => {
    switch (device.pcTerminalColor) {
      case 'amber': return 'rgba(245, 158, 11, 0.15)';
      case 'cyan': return 'rgba(34, 211, 238, 0.15)';
      case 'white': return 'rgba(240, 240, 240, 0.12)';
      case 'green':
      default: return 'rgba(16, 185, 129, 0.15)';
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-video flex flex-col justify-between p-4 rounded-3xl transition-all duration-500 overflow-hidden text-neutral-800 border-6 bg-gradient-to-b from-stone-200 to-stone-350 shadow-2xl border-stone-400/80">
      {/* Background Wear and Decal */}
      <StickerAndWear
        stickerId={device.stickerId}
        stickerX={device.stickerX}
        stickerY={device.stickerY}
        wearLevel={device.wearLevel}
        onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
      />

      {/* Main Bezel Upper Section */}
      <div className="flex-1 flex gap-4 overflow-hidden my-1 z-10">
        {/* Curved CRT Computer Screen (Beige Bezel) */}
        <div className="flex-1 bg-stone-300 border-8 border-stone-250 rounded-2xl p-3 flex flex-col justify-between relative shadow-inner ring-4 ring-stone-400/30 overflow-hidden">
          {/* Inner Glow and Content */}
          <div className={`flex-1 rounded-lg border-2 p-3 font-mono text-xs overflow-y-auto relative ${getScreenColorClass()}`}>
            {/* CRT overlay scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.18)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none z-10" />
            <div className="absolute inset-0 bg-radial-gradient(circle,transparent_40%,rgba(0,0,0,0.55)_100%) pointer-events-none z-10" />

            {!isPowerOn ? (
              // Glass tube off state
              <div className="absolute inset-0 bg-stone-950/95 transition-all duration-1000 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/4 to-white/12 pointer-events-none" />
              </div>
            ) : isBooting ? (
              // Boot Loader
              <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                <span className="animate-pulse">BOOTING RETRO COMPUTER...</span>
                <div className="w-1/2 h-2.5 border rounded-xs p-0.5 overflow-hidden" style={{ borderColor: 'currentColor' }}>
                  <div className="h-full bg-current duration-200 transition-all" style={{ width: `${bootProgress}%` }} />
                </div>
                <span className="text-[10px]">{bootProgress}% CARICATO</span>
              </div>
            ) : device.pcBootOS === 'system7' ? (
              // Classic Mac Window GUI simulation
              <div className="w-full h-full flex flex-col relative text-[10px]">
                {/* Upper menu bar */}
                <div className="h-4 bg-current text-stone-900 font-bold px-2 flex justify-between items-center select-none -mx-3 -mt-3 mb-2 rounded-t-sm">
                  <div className="flex gap-2.5">
                    <span> RetroDesk</span>
                    <span>File</span>
                    <span>Edita</span>
                    <span>Speciale</span>
                  </div>
                  <span>10:45 AM</span>
                </div>

                {/* Desktop Grid Icons */}
                <div className="flex-1 flex gap-5 flex-wrap p-1">
                  <button onClick={() => setTerminalHistory(prev => [...prev.slice(-4), 'Apri Cartella: RetroCraft', 'C:\\>'])} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 text-center">
                    <span className="text-xl">📁</span>
                    <span className="leading-3">Progetti</span>
                  </button>
                  <button onClick={() => setTerminalHistory(prev => [...prev.slice(-4), 'Esegui: Synth Sound', 'C:\\>'])} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 text-center">
                    <span className="text-xl">💿</span>
                    <span className="leading-3">Musica</span>
                  </button>
                  <button onClick={handleInsertFloppy} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 text-center">
                    <span className="text-xl">{floppyLoaded ? '💾' : '🕳️'}</span>
                    <span className="leading-3">Floppy</span>
                  </button>
                  {/* Notepad Text Editor Icon */}
                  <button onClick={() => setIsEditorOpen(true)} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 text-center text-amber-500">
                    <span className="text-xl">📝</span>
                    <span className="leading-3 font-bold">Blocco Note</span>
                  </button>
                </div>

                {/* Prompt panel overlay */}
                <div className="absolute bottom-1 right-1 left-1/3 border border-current bg-stone-900/95 rounded p-1.5 flex flex-col shadow-lg z-20">
                  <div className="border-b border-current pb-0.5 mb-1 flex justify-between font-bold">
                    <span>Terminal Box</span>
                    <span className="cursor-pointer font-black" onClick={() => onChangeDevice({ pcBootOS: 'dos' })}>✕</span>
                  </div>
                  <div className="max-h-12 overflow-y-auto text-[9px] mb-1">
                    {terminalHistory.slice(-2).map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                  <div className="flex gap-1 items-center">
                    <span>$</span>
                    <input
                      type="text"
                      value={commandLine}
                      onChange={(e) => setCommandLine(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="..."
                      className="bg-transparent border-b border-current focus:outline-none flex-1 text-[9px]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Classic MS-DOS Prompt Console or Matrix Fall
              <div className="w-full h-full flex flex-col justify-between selection:bg-current selection:text-black">
                <div className="flex-1 overflow-y-auto flex flex-col pr-1 scrollbar-thin">
                  <div className="text-[10px] opacity-75 border-b border-current/20 pb-1 mb-1">
                    * Digita <span className="underline font-bold">edit</span> o clicca in basso per scrivere un file di testo!
                  </div>
                  {terminalHistory.map((text, index) => (
                    <div key={index} className="whitespace-pre-wrap leading-4">{text}</div>
                  ))}
                  <div ref={consoleBottomRef} />
                </div>
                {/* Input row */}
                <div className="flex items-center gap-1 mt-1 border-t border-current/20 pt-1">
                  <span>C:\&gt;</span>
                  <input
                    type="text"
                    value={commandLine}
                    onChange={(e) => setCommandLine(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={!isPowerOn || isBooting}
                    placeholder="Digita 'help' o 'edit'..."
                    className="bg-transparent text-current border-none outline-none focus:ring-0 flex-1 pl-0 py-0 text-xs font-mono"
                  />
                  <div className="w-1.5 h-3.5 bg-current animate-pulse shrink-0" />
                </div>
              </div>
            )}

            {/* Draggable/Overlay Windowed Text Editor (Phosphor styled) */}
            {isEditorOpen && (
              <div className="absolute inset-x-2 top-6 bottom-2 border-2 border-current bg-stone-950/95 font-mono text-[9px] flex flex-col z-35 shadow-[4px_4px_12px_rgba(0,0,0,0.85)] rounded-lg overflow-hidden">
                {/* Window Header */}
                <div className="bg-current text-stone-900 px-3 py-1 flex justify-between items-center font-bold">
                  <span className="flex items-center gap-1 text-[10px]">📝 EDIT: {fileName}</span>
                  <button 
                    onClick={() => setIsEditorOpen(false)} 
                    className="px-1.5 font-sans font-black bg-stone-950 text-current hover:bg-stone-850 rounded text-center cursor-pointer transition-colors"
                    title="Chiudi editor"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Window Toolbar */}
                <div className="border-b border-current/30 px-3 py-1 flex gap-3 text-[8.5px] bg-stone-900/50 select-none">
                  <button onClick={() => setEditorText('')} className="hover:underline font-bold hover:opacity-80">NUOVO</button>
                  <span className="opacity-40">|</span>
                  <button onClick={() => setEditorText(prev => prev + '\n10 PRINT "GIOCO VINTAGE"\n20 GOTO 10')} className="hover:underline font-bold hover:opacity-80">BASIC</button>
                  <span className="opacity-40">|</span>
                  <button 
                    onClick={() => {
                      if (isAudioOn) playChiptuneBleep(1000, 'sine', 0.15);
                      alert('Documento ' + fileName + ' memorizzato con successo!');
                    }} 
                    className="hover:underline font-bold hover:opacity-80"
                  >
                    SALVA
                  </button>
                </div>

                {/* Developer Playground label */}
                <div className="bg-amber-500/10 text-amber-500 border-b border-amber-500/15 py-0.5 text-[8px] text-center select-none tracking-wide">
                  🔨 [SPAZIO EDITORE REALE] - In questo blocco JSX puoi iniettare il tuo codice!
                </div>

                {/* ========================================================================= */}
                {/* INTERACTIVE WORKSPACE FOR PLACING ACTIVE TEXT EDITOR / IFRAME / GAME      */}
                {/* ========================================================================= */}
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  className="flex-1 bg-transparent text-current border-none p-3 resize-none outline-none focus:ring-0 text-[10.5px] leading-relaxed font-mono font-medium whitespace-pre-wrap select-text selection:bg-current selection:text-black"
                  placeholder="Inizia a digitare qui..."
                />
                {/* ========================================================================= */}

                <div className="bg-stone-950/90 border-t border-current/20 px-3 py-1 text-[8px] opacity-80 flex justify-between select-none font-bold">
                  <span>Caratteri: {editorText.length}</span>
                  <span>Modello: {device.brand}</span>
                </div>
              </div>
            )}
          </div>
          {/* Glass reflection cover for realistic CRT feel */}
          <div className="absolute inset-0 bg-radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_60%) pointer-events-none z-15" />
          <div className="absolute inset-0 shadow-[inset_0_2px_15px_rgba(0,0,0,0.4)] pointer-events-none z-15" fill="none" />
        </div>

        {/* Vintage Tower Disk Module Side-Cabinet */}
        <div className="w-28 bg-stone-250 rounded-2xl border-2 border-stone-300 flex flex-col justify-between items-center p-3 font-mono shadow-inner select-none relative">
          {/* Brand stamp badge */}
          <div className="text-[10px] font-black text-stone-500 text-center tracking-wider">{device.brand || 'IBM PC'}</div>

          {/* Floppy 3.5 Disk Drive Slot */}
          <div className="w-full my-1.5 p-2 bg-stone-300 rounded-lg border border-stone-350 shadow-xs flex flex-col items-center gap-1">
            <span className="text-[6.5px] text-stone-500 font-bold uppercase tracking-wider scale-90">Drive A: 3.5&quot;</span>
            <div
              onClick={handleInsertFloppy}
              className={`w-full h-3 border border-stone-800 rounded-sm relative flex items-center justify-center cursor-pointer transition-colors duration-300 ${
                floppyLoaded ? 'bg-stone-900 border-stone-950' : 'bg-stone-400 hover:bg-stone-350 shadow-inner'
              }`}
              title="Clicca per inserire/estrarre Floppy Disk!"
            >
              {/* Slit */}
              <div className="w-4/5 h-0.5 bg-black rounded" />
              {/* Mechanical slider details */}
              {floppyLoaded && (
                <div className="absolute bottom-0.5 left-2 w-1.5 h-1.5 bg-blue-500/90 rounded-xs animate-pulse" />
              )}
            </div>

            {/* Disk activity led */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[6px] text-stone-550 font-bold scale-90">FDD ACTIVE</span>
              <div
                className={`w-2 h-2 rounded-full border border-black/30 transition-all duration-300 ${
                  floppyLoaded && isPowerOn ? 'bg-red-500 shadow-[0_0_4px_#ef4444]' : 'bg-neutral-800'
                }`}
              />
            </div>
          </div>

          {/* Vent Grilles */}
          <div className="w-full flex flex-col gap-0.7 bg-black/5 rounded py-1 px-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-0.8 bg-stone-400/50 rounded-full w-full" />
            ))}
          </div>

          {/* Big satisfying red glowing power button */}
          <div className="flex flex-col items-center mt-1 w-full pt-1.5 border-t border-stone-300">
            <button
              onClick={togglePower}
              className={`w-10 h-7 rounded-sm border-2 border-stone-850 flex items-center justify-center cursor-pointer transition-all shadow-md active:translate-y-0.5 ${
                isPowerOn
                  ? 'bg-orange-500 border-orange-600 text-white shadow-inner shadow-orange-700/80'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-500'
              }`}
            >
              <span className="text-[8px] font-black">{isPowerOn ? 'ON' : 'OFF'}</span>
            </button>
            <span className="text-[7.5px] text-stone-550 font-black mt-1 tracking-wider">POWER</span>
          </div>
        </div>
      </div>

      {/* Tiny Retro Mini Keyboard clicker buttons along the bottom */}
      {isPowerOn && !isBooting && (
        <div className="relative mt-1 bg-stone-305 p-1 rounded-lg border border-stone-250 shadow-inner z-10 select-none">
          <div className="text-[7px] text-stone-500 font-bold mb-0.5 uppercase tracking-wider px-1">Tastiera Meccanica a Clic:</div>
          <div className="flex gap-1 justify-between flex-wrap">
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'R_RUN', 'C_CLS'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'R_RUN') {
                    setCommandLine('run');
                    if (isAudioOn) playClick(1000, 0.05);
                  } else if (key === 'C_CLS') {
                    setCommandLine('cls');
                    if (isAudioOn) playClick(1000, 0.05);
                  } else {
                    handleKeyboardClick(key.toLowerCase());
                  }
                }}
                className="flex-1 min-w-7 h-5 bg-gradient-to-b from-stone-100 to-stone-250 border border-stone-400 hover:border-stone-550 rounded text-[9px] font-bold font-mono text-stone-800 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-transform"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
