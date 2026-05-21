import React, { useEffect, useState, useRef } from 'react';
import { RetroDevice } from '../types';
import { StickerAndWear } from './StickerAndWear';
import { playClick, playChiptuneBleep, playRetroJingle } from '../utils/audio';

interface GameBoyDeviceProps {
  device: RetroDevice;
  onChangeDevice: (updated: Partial<RetroDevice>) => void;
  isAudioOn: boolean;
}

export const GameBoyDevice: React.FC<GameBoyDeviceProps> = ({ device, onChangeDevice, isAudioOn }) => {
  const [powerOn, setPowerOn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game state: Snake
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameIntervalRef = useRef<any>(null);

  // Restart game whenever power is toggled or cartridge game is switched
  useEffect(() => {
    if (powerOn) {
      // Play nostalgic chiptune startup jingle "Baleep!"
      if (isAudioOn) {
        playRetroJingle('gameboy');
      }
      resetGame();
    } else {
      setGameStarted(false);
      clearInterval(gameIntervalRef.current);
    }
    return () => clearInterval(gameIntervalRef.current);
  }, [powerOn, device.gbCartridgeGame]);

  // Snake Core game loop
  useEffect(() => {
    if (powerOn && gameStarted && !gameOver) {
      gameIntervalRef.current = setInterval(() => {
        executeGameStep();
      }, 250); // retro game tick rate
    } else {
      clearInterval(gameIntervalRef.current);
    }
    return () => clearInterval(gameIntervalRef.current);
  }, [powerOn, gameStarted, gameOver, snake, direction, food]);

  const resetGame = () => {
    setSnake([{ x: 8, y: 8 }]);
    setDirection('RIGHT');
    setFood({ x: 3, y: 5 });
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const executeGameStep = () => {
    const head = { ...snake[0] };
    switch (direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Border Collision Check
    const width = 16;
    const height = 14;
    if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
      triggerGameOver();
      return;
    }

    // Body Self Collision Check
    for (let segment of snake) {
      if (segment.x === head.x && segment.y === head.y) {
        triggerGameOver();
        return;
      }
    }

    const newSnake = [head, ...snake];

    // Check if eating retro pixel food block
    if (head.x === food.x && head.y === food.y) {
      setScore((prev) => prev + 10);
      if (isAudioOn) {
        playChiptuneBleep(1200, 'square', 0.08); // delicious pixel bleep
      }
      spawnFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const spawnFood = () => {
    const fx = Math.floor(Math.random() * 15);
    const fy = Math.floor(Math.random() * 13);
    setFood({ x: fx, y: fy });
  };

  const triggerGameOver = () => {
    setGameOver(true);
    if (isAudioOn) {
      playChiptuneBleep(280, 'sawtooth', 0.4); // game over crash buzz
    }
  };

  const changeDirection = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!powerOn || gameOver) return;
    playClick(1500, 0.008);

    // Filter opposite direction
    if (dir === 'UP' && direction === 'DOWN') return;
    if (dir === 'DOWN' && direction === 'UP') return;
    if (dir === 'LEFT' && direction === 'RIGHT') return;
    if (dir === 'RIGHT' && direction === 'LEFT') return;

    setDirection(dir);
  };

  const handleActionButton = (btn: 'A' | 'B') => {
    if (!powerOn) return;
    
    if (gameOver) {
      playClick(1200, 0.05);
      resetGame();
      return;
    }

    if (isAudioOn) {
      playChiptuneBleep(btn === 'A' ? 950 : 750, 'square', 0.05);
    }

    // If starting or playing, maybe jump snake or speed up
    if (gameStarted) {
      // jump effect
    }
  };

  const turnPowerToggle = () => {
    playClick(400, 0.12);
    setPowerOn(!powerOn);
  };

  // Casing base color palette
  const getCasingStyle = () => {
    if (device.bodyMaterial === 'translucent') {
      return {
        background: `radial-gradient(ellipse_at_top, rgba(168,85,247,0.8) 0%, rgba(107,33,168,0.7) 100%)`, // Atomic Transparent purple
        border: '3px solid rgba(255,255,255,0.4)',
        boxShadow: 'inset 0 3px 12px rgba(255,255,255,0.3), 0 15px 35px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3.5px)',
      };
    } else {
      return {
        backgroundColor: device.primaryColor,
        border: '3px solid rgba(0,0,0,0.15)',
        boxShadow: 'inset 0 5px 12px rgba(255,255,255,0.22), 0 15px 35px rgba(0,0,0,0.5)',
      };
    }
  };

  const getScreenClass = () => {
    switch (device.gbScreenType) {
      case 'pocket-grey':
        return 'bg-zinc-350 text-stone-850 border-zinc-450 shadow-inner shadow-zinc-400';
      case 'color':
        return 'bg-slate-900 text-stone-100 border-stone-850 shadow-inner';
      case 'pea-soup':
      default:
        return 'bg-[linear-gradient(135deg,#8fa33d_0%,#7d9134_100%)] text-stone-900 border-[#5e6d23] shadow-inner shadow-[#5e6d23]/40';
    }
  };

  return (
    <div className="relative w-[290px] mx-auto min-h-[480px] rounded-br-[4rem] rounded-tl-[1.8rem] rounded-tr-[1.8rem] rounded-bl-[1.8rem] p-5 flex flex-col justify-between items-center transition-all duration-500 overflow-hidden text-neutral-800" style={getCasingStyle()}>
      {/* Background Wear and Decal */}
      <StickerAndWear
        stickerId={device.stickerId}
        stickerX={device.stickerX}
        stickerY={device.stickerY}
        wearLevel={device.wearLevel}
        onMoveSticker={(x, y) => onChangeDevice({ stickerX: x, stickerY: y })}
      />

      {/* Top Slider Switch for Power */}
      <div className="absolute top-0 left-10 h-2 w-14 bg-zinc-800 rounded-b-md border-b border-black shadow-inner flex justify-around p-0.5 pointer-events-auto">
        <button
          onClick={turnPowerToggle}
          className={`h-full w-5 rounded-xs transition-transform duration-300 cursor-pointer ${
            powerOn ? 'translate-x-6 bg-red-650' : 'translate-x-0 bg-stone-500 hover:bg-stone-400'
          }`}
          title="Interruttore Alimentazione Game Boy"
        />
      </div>

      {/* Protective Dark Bezel Matrix Frame */}
      <div className="w-full bg-stone-700/90 rounded-b-lg border-b-[3px] border-stone-800 border-x-2 border-stone-750 p-4 pt-5 relative shadow-md mt-1 z-10 flex flex-col justify-between select-none">
        
        {/* Playful bezel lines */}
        <div className="flex w-full justify-between items-center mb-1 pb-1 border-b border-stone-850">
          <div className="flex-1 w-full bg-gradient-to-r from-red-600 via-blue-700 to-transparent h-1.2 rounded-sm" />
          <span className="text-[7.5px] font-mono text-zinc-300 px-2 tracking-[0.2em] font-bold">DOT MATRIX WITH STEREO SOUND</span>
          <div className="flex-1 w-full bg-gradient-to-l from-red-600 via-blue-700 to-transparent h-1.2 rounded-sm" />
        </div>

        {/* Real liquid pea-soup green retro screen plate */}
        <div className="flex-1 flex gap-3 items-stretch relative">
          
          {/* LED battery power indicator */}
          <div className="flex flex-col justify-center items-center gap-0.7 select-none">
            <div
              className={`w-1.5 h-1.5 rounded-full border border-black/30 transition-shadow duration-300 ${
                powerOn ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 'bg-neutral-800'
              }`}
            />
            <span className="text-[5.5px] font-mono font-bold text-stone-450">BATTERY</span>
          </div>

          {/* Liquid Crystal Grid LCD */}
          <div className={`flex-1 aspect-1.15 rounded border-3 p-1 font-mono text-xs overflow-hidden relative shadow-inner ${getScreenClass()}`}>
            
            {/* Screen static reflection grids */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/4 to-white/10 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12)_50%,transparent_50%50%)] bg-[size:100%_3px] pointer-events-none z-10" />

            {!powerOn ? (
              // Powered Off grey metallic glass
              <div className="absolute inset-0 bg-neutral-900/95 transition-all duration-700" />
            ) : gameOver ? (
              // Game Over Interface
              <div className="w-full h-full flex flex-col justify-center items-center text-center">
                <span className="text-sm font-semibold tracking-widest leading-4 animate-bounce">FINE GIOCO!</span>
                <span className="text-[9px] mt-1 font-bold">SCORE: {score}</span>
                <span className="text-[7.5px] mt-2 bg-black text-white px-2 py-0.5 rounded-sm animate-pulse cursor-pointer font-bold" onClick={resetGame}>PRESS A TO RESTART</span>
              </div>
            ) : device.customVideoUrl ? (
              /* ========================================================================= */
              /* PLUG YOUR CUSTOM GBA GAME / CANVASES IN THE RESERVED SCREEN HERE          */
              /* ========================================================================= */
              <div className="w-full h-full relative bg-neutral-950 overflow-hidden rounded">
                <iframe 
                  src={device.customVideoUrl}
                  title="Custom GB ROM Iframe"
                  className="w-full h-full border-none opacity-85 mix-blend-multiply cursor-pointer filter grayscale contrast-125"
                  allow="autoplay; encrypted-media; picture-in-picture; gamepad"
                  referrerPolicy="no-referrer"
                />
              </div>
              /* ========================================================================= */
            ) : gameStarted ? (
              // Living Retro Console Play Grid (Snake)
              <div className="w-full h-full relative" style={{ fontSize: '8px' }}>
                {/* 16 x 14 virtual coordinates grid */}
                <div className="absolute inset-0 grid grid-cols-16 grid-rows-14 gap-0 bg-black/3">
                  {[...Array(16 * 14)].map((_, i) => {
                    const gx = i % 16;
                    const gy = Math.floor(i / 16);
                    
                    const isSnakeHead = snake[0].x === gx && snake[0].y === gy;
                    const isSnakeBody = snake.slice(1).some(seg => seg.x === gx && seg.y === gy);
                    const isFood = food.x === gx && food.y === gy;

                    if (isSnakeHead) {
                      return <div key={i} className="bg-stone-900 border border-current rounded-sm z-5 scale-95" />;
                    } else if (isSnakeBody) {
                      return <div key={i} className="bg-stone-900 opacity-80 border-current" />;
                    } else if (isFood) {
                      return <span key={i} className="flex items-center justify-center font-bold text-[9px] text-stone-900 animate-pulse">■</span>;
                    }
                    return <div key={i} className="h-full w-full opacity-5" />;
                  })}
                </div>

                {/* score float */}
                <div className="absolute top-0.5 right-1 bg-white/20 px-1 py-0.2 rounded-sm text-[6.5px] font-black pointer-events-none z-10">
                  PT: {score}
                </div>
              </div>
            ) : (
              // Classic loading jingle view
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-xl tracking-widest font-black text-black/90 scale-y-125 select-none font-sans">Nintendo</span>
                <span className="text-[8px] tracking-widest mt-1">® GAME BOY</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Boy Classic lower branding */}
      <div className="w-full text-center py-2 z-10 select-none">
        <span className="font-sans text-stone-500 font-extrabold italic text-sm tracking-widest">
          {device.brand || 'GAME BOY'} <span className="text-[10px] text-stone-450 align-top">Classic</span>
        </span>
      </div>

      {/* Physical Keys Grid (Skeuomorphic Cross D-pad + A/B Action circle keys) */}
      <div className="w-full flex justify-between items-start px-2 relative z-10 mt-2 select-none">
        
        {/* D-PAD Cross layout */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Background casing indentation ring */}
          <div className="absolute inset-2 bg-black/15 rounded-full border border-black/5 flex items-center justify-center" />
          
          {/* UP Button */}
          <button
            onClick={() => changeDirection('UP')}
            className="absolute top-2.5 w-7 h-7 bg-stone-850 hover:bg-stone-800 rounded-sm border-x border-t border-stone-900 flex items-center justify-center cursor-pointer active:translate-y-px shadow-xs"
            title="D-Pad Giù"
          >
            <div className="w-2.5 h-1 bg-stone-700 rounded-lg" />
          </button>

          {/* DOWN Button */}
          <button
            onClick={() => changeDirection('DOWN')}
            className="absolute bottom-2.5 w-7 h-7 bg-stone-850 hover:bg-stone-800 rounded-sm border-x border-b border-stone-900 flex items-center justify-center cursor-pointer active:translate-y-px shadow-xs"
            title="D-Pad Su"
          >
            <div className="w-2.5 h-1 bg-stone-700 rounded-lg" />
          </button>

          {/* LEFT Button */}
          <button
            onClick={() => changeDirection('LEFT')}
            className="absolute left-2.5 w-7 h-7 bg-stone-850 hover:bg-stone-800 rounded-sm border-y border-l border-stone-900 flex items-center justify-center cursor-pointer active:translate-y-px shadow-xs"
            title="D-Pad Sinistra"
          >
            <div className="w-1.2 h-2.5 bg-stone-700 rounded-lg" />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={() => changeDirection('RIGHT')}
            className="absolute right-2.5 w-7 h-7 bg-stone-850 hover:bg-stone-800 rounded-sm border-y border-r border-stone-900 flex items-center justify-center cursor-pointer active:translate-y-px shadow-xs"
            title="D-Pad Destra"
          >
            <div className="w-1.2 h-2.5 bg-stone-700 rounded-lg" />
          </button>

          {/* Center block */}
          <div className="absolute w-7 h-7 bg-stone-850 border border-stone-900 flex items-center justify-center rounded-xs pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-750" />
          </div>
        </div>

        {/* Slanted A/B buttons container box with red indicators */}
        <div className="w-28 h-18 bg-black/10 rounded-full border border-black/5 transform rotate-[-24deg] translate-y-2 flex justify-around p-2.5 gap-2 items-center">
          
          {/* Button B */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleActionButton('B')}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-red-800 to-[#9C052E] border-2 border-[#5a0219] flex items-center justify-center shadow-md active:translate-y-px active:shadow-inner cursor-pointer"
              title="Pulsante B"
            />
            <span className="text-[10px] font-sans font-bold text-stone-600 mt-1 uppercase scale-90 translate-x-px">B</span>
          </div>

          {/* Button A */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleActionButton('A')}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-red-850 to-[#9C052E] border-2 border-[#5a0219] flex items-center justify-center shadow-md active:translate-y-px active:shadow-inner cursor-pointer"
              title="Pulsante A"
            />
            <span className="text-[10px] font-sans font-bold text-stone-600 mt-1 uppercase scale-90 translate-x-px">A</span>
          </div>
        </div>
      </div>

      {/* Soft Rubber Pill select/start buttons at bottom angle */}
      <div className="w-3/5 flex justify-around items-center py-2 relative z-10 select-none">
        {/* Select */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => {
              playClick(900, 0.05);
              onChangeDevice({ gbScreenType: device.gbScreenType === 'pea-soup' ? 'pocket-grey' : device.gbScreenType === 'pocket-grey' ? 'color' : 'pea-soup' });
            }}
            className="w-9 h-2.5 bg-stone-500 border border-stone-600 hover:bg-stone-400 cursor-pointer rounded-full transform -rotate-[28deg] shadow-sm active:translate-y-px"
            title="Selezione Layout Schermo"
          />
          <span className="text-[8px] font-bold text-stone-600 tracking-wider font-sans mt-0.5">SELECT</span>
        </div>

        {/* Start */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => {
              playClick(900, 0.05);
              resetGame();
            }}
            className="w-9 h-2.5 bg-stone-500 border border-stone-600 hover:bg-stone-400 cursor-pointer rounded-full transform -rotate-[28deg] shadow-sm"
            title="Sveglia Gioco"
          />
          <span className="text-[8px] font-bold text-stone-600 tracking-wider font-sans mt-0.5">START</span>
        </div>
      </div>

      {/* Game Boy Real Launcher input linker form */}
      <div className="bg-stone-900/40 border border-neutral-800 p-2.5 rounded-2xl flex flex-col sm:flex-row gap-2 items-center w-full z-10 transition-colors mt-4">
        <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase shrink-0">🎮 Incolla Gioco / ROM Iframe:</span>
        <input 
          type="text" 
          placeholder="https://emulatorjs.org (es. rom GameBoy)"
          value={device.customVideoUrl || ''}
          onChange={(e) => onChangeDevice({ customVideoUrl: e.target.value })}
          className="bg-stone-950/80 border border-neutral-800 text-[9px] text-zinc-300 font-mono rounded px-2.5 py-1 w-full focus:outline-none focus:border-red-500 placeholder-zinc-650"
        />
        {device.customVideoUrl && (
          <button 
            onClick={() => onChangeDevice({ customVideoUrl: '' })} 
            className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-900/30 text-[9px] font-mono text-red-300 rounded cursor-pointer shrink-0 transition-colors"
          >
            Azzera
          </button>
        )}
      </div>

    </div>
  );
};
