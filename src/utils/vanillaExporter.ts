import { RetroDevice } from '../types';
import { RETRO_STICKERS, RETRO_SONGS } from '../data/songs';

/**
 * Generates a fully self-contained HTML/CSS/JS file for the configured retro device.
 * It uses Tailwind CSS (via CDN) and embedded custom styles, complete with real Web Audio API
 * sound synthesis, fully draggable/deletable stickers, interactive dials, screen switch animations, 
 * and absolute compatibility with normal browser loading.
 */
export function generateVanillaHTML(device: RetroDevice): string {
  const selectedSticker = RETRO_STICKERS.find((s) => s.id === device.stickerId);
  const stickerX = device.stickerX ?? 50;
  const stickerY = device.stickerY ?? 50;

  // Render wear-and-tear overlays inside SVG
  let wearOverlayHtml = '';
  if (device.wearLevel === 'used') {
    wearOverlayHtml = `
      <svg class="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="10" y1="10" x2="15" y2="25" stroke="#4a4a4a" stroke-width="0.3" stroke-linecap="round" />
        <line x1="80" y1="75" x2="85" y2="70" stroke="#4a4a4a" stroke-width="0.25" stroke-linecap="round" />
        <line x1="20" y1="85" x2="35" y2="88" stroke="#ffffff" stroke-width="0.2" stroke-linecap="round" />
      </svg>
    `;
  } else if (device.wearLevel === 'scratched') {
    wearOverlayHtml = `
      <svg class="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="5" y1="12" x2="25" y2="22" stroke="#4a4a4a" stroke-width="0.5" stroke-linecap="round" />
        <line x1="25" y1="22" x2="20" y2="35" stroke="#4a4a4a" stroke-width="0.4" stroke-linecap="round" />
        <line x1="85" y1="10" x2="70" y2="35" stroke="#1c1c1c" stroke-width="0.5" stroke-linecap="round" />
        <line x1="72" y1="33" x2="88" y2="45" stroke="#ffffff" stroke-width="0.3" stroke-linecap="round" />
        <line x1="12" y1="75" x2="45" y2="92" stroke="#2a2a2a" stroke-width="0.4" stroke-linecap="round" />
      </svg>
    `;
  } else if (device.wearLevel === 'rusty') {
    wearOverlayHtml = `
      <div class="absolute top-0 left-0 w-24 h-24 bg-radial from-amber-900/40 via-amber-800/10 to-transparent pointer-events-none blur-[4px] rounded-br-full"></div>
      <div class="absolute bottom-0 right-0 w-32 h-32 bg-radial from-yellow-950/45 via-amber-900/15 to-transparent pointer-events-none blur-[8px] rounded-tl-full"></div>
      <svg class="absolute inset-0 w-full h-full opacity-80 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 0,20 Q 5,22 10,18 T 15,25" fill="none" stroke="#78350f" stroke-width="0.6" />
        <path d="M 98,75 Q 92,72 90,82 T 82,85" fill="none" stroke="#78350f" stroke-width="0.7" />
        <path d="M 12,85 Q 16,88 22,86" fill="none" stroke="#b45309" stroke-width="0.4" />
      </svg>
    `;
  }

  // Material-based border and styling customization to make the exported HTML perfectly faithful to the Workbench
  let shellStyle = '';
  const hex = device.primaryColor || '#a855f7';
  
  if (device.bodyMaterial === 'wood') {
    shellStyle = `background: linear-gradient(135deg, #a0522d 0%, ${hex} 50%, #5c2c16 100%); border: 12px solid #4a210d; box-shadow: inset 0 4px 12px rgba(255,255,255,0.15), 0 10px 25px rgba(0,0,0,0.5);`;
  } else if (device.bodyMaterial === 'metal') {
    shellStyle = `background: linear-gradient(135deg, #efefef 0%, ${hex} 60%, #888888 100%); border: 10px solid #aaaaaa; box-shadow: inset 0 3px 10px rgba(255,255,255,0.4), 0 10px 25px rgba(0,0,0,0.5);`;
  } else if (device.bodyMaterial === 'translucent') {
    shellStyle = `background: ${hex}cc; border: 10px solid rgba(255,255,255,0.35); box-shadow: inset 0 4px 15px rgba(255,255,255,0.25), 0 10px 25px rgba(0,0,0,0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);`;
  } else {
    shellStyle = `background-color: ${hex}; border: 10px solid rgba(0,0,0,0.15); box-shadow: inset 0 4px 10px rgba(255,255,255,0.15), 0 10px 25px rgba(0,0,0,0.5);`;
  }

  // Dynamic aspect ratio and size boundaries tailored for each specific retro hardware profile
  let containerDimensionsClass = 'aspect-video w-full max-w-lg rounded-3xl';
  let wrapperMaxWidthClass = 'max-w-2xl';

  if (device.type === 'gameboy') {
    containerDimensionsClass = 'aspect-[2/3.3] w-full max-w-[340px] rounded-[24px]';
  } else if (device.type === 'ipod') {
    containerDimensionsClass = 'aspect-[1/1.7] w-full max-w-[320px] rounded-[28px]';
  } else if (device.type === 'tv') {
    containerDimensionsClass = 'aspect-video w-full max-w-xl rounded-[2rem] md:rounded-[2.5rem] mb-14 p-4';
    wrapperMaxWidthClass = 'max-w-xl';
  } else if (device.type === 'jukebox') {
    containerDimensionsClass = 'w-full max-w-[340px] rounded-t-[7.5rem] md:rounded-t-[8.5rem] rounded-b-xl min-h-[510px] h-auto pb-6';
    wrapperMaxWidthClass = 'max-w-[350px]';
  } else if (device.type === 'pc') {
    containerDimensionsClass = 'md:aspect-video w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] md:min-h-[460px] h-auto p-4';
    wrapperMaxWidthClass = 'max-w-4xl';
  } else if (device.type === 'gamecube') {
    containerDimensionsClass = 'md:aspect-video w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] md:min-h-[460px] h-auto p-4';
    wrapperMaxWidthClass = 'max-w-4xl';
  } else if (device.type === 'playstation') {
    containerDimensionsClass = 'md:aspect-video w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] md:min-h-[460px] h-auto p-4';
    wrapperMaxWidthClass = 'max-w-4xl';
  } else if (device.type === 'turntable') {
    containerDimensionsClass = 'aspect-[1.4/1] w-full max-w-lg rounded-3xl';
  }

  // Generate customized device content markup based on active device type
  let deviceMarkup = '';
  let interactiveScripts = '';

  switch (device.type) {
    case 'radio':
      deviceMarkup = `
        <div class="flex flex-col h-full justify-between p-6">
          <!-- Top Grid -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-mono font-black text-black/60 bg-white/20 px-2 py-0.5 rounded border border-black/10 tracking-widest">${device.brand || 'PHONOLA-Classic'}</span>
            <div class="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse border border-black shadow"></div>
          </div>

          <!-- Glass Tuning Dial Scale -->
          <div class="bg-amber-950/20 border-2 border-black p-4 rounded mb-6 relative overflow-hidden backdrop-blur-xs flex flex-col justify-between">
            <div id="backlight-layer" class="absolute inset-0 bg-amber-500/15 mix-blend-color-dodge transition-opacity animate-pulse pointer-events-none"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-amber-800/10 via-transparent to-black/20 pointer-events-none"></div>
            <!-- Marker line -->
            <div id="tuning-marker" class="absolute top-0 bottom-0 w-0.5 bg-red-600 shadow-[0_0_8px_#ef4444] transition-all duration-350" style="left: ${((device.radioFrequency - 88) / 20) * 100}%"></div>
            
            <div class="flex justify-between text-[10px] font-mono font-black text-[#141414] select-none tracking-tight">
              <span>88 MHz</span>
              <span>92</span>
              <span>96</span>
              <span>100</span>
              <span>104</span>
              <span>108 MHz</span>
            </div>
            
            <div class="mt-2 text-center text-xs font-mono font-black py-0.5 px-2 bg-[#141414] text-[#F27D26] rounded border border-black inline-block self-center shadow-inner">
              SINTONIA: <span id="freq-display" class="text-amber-400 font-bold">${device.radioFrequency.toFixed(1)} MHz</span>
            </div>
          </div>

          <!-- Speaker Grill Pattern matching workbench selection -->
          <div class="grow border-2 border-black/25 bg-black/15 rounded-lg overflow-hidden flex flex-col justify-around p-1.5 min-h-[56px] shadow-inner mb-4">
            ${
              device.radioSpeakerGrill === 'mesh' ? `
                <div class="w-full h-full bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:3px_3px] opacity-80"></div>
              ` : device.radioSpeakerGrill === 'retro-slots' ? `
                <div class="w-full h-full flex flex-col justify-between py-1 px-2">
                  <div class="h-1.5 bg-[#141414]/80 rounded-full w-full"></div>
                  <div class="h-1.5 bg-[#141414]/80 rounded-full w-4/5"></div>
                  <div class="h-1.5 bg-[#141414]/80 rounded-full w-full"></div>
                  <div class="h-1.5 bg-[#141414]/80 rounded-full w-11/12"></div>
                </div>
              ` : `
                <div class="w-full h-full flex flex-col justify-between py-1">
                  <div class="h-1 bg-[#141414]/85 w-full rounded-sm"></div>
                  <div class="h-1 bg-[#141414]/85 w-full rounded-sm"></div>
                  <div class="h-1 bg-[#141414]/85 w-full rounded-sm"></div>
                  <div class="h-1 bg-[#141414]/85 w-full rounded-sm"></div>
                  <div class="h-1 bg-[#141414]/85 w-full rounded-sm"></div>
                </div>
              `
            }
          </div>

          <!-- Controls panel bottom row featuring rotating tactile 3D knobs and toggle -->
          <div class="flex justify-around items-center gap-4 mt-1 pt-2 border-t border-black/15">
            <!-- Tuning Custom Tactile Knob -->
            <div class="flex flex-col items-center">
              <div class="relative w-9 h-9">
                <input
                  type="range"
                  id="tuning-knob"
                  min="88"
                  max="108"
                  step="0.1"
                  value="${device.radioFrequency}"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />
                <div
                  id="tuning-dial-knob"
                  class="w-9 h-9 rounded-full bg-gradient-to-r from-stone-600 via-stone-400 to-stone-700 border-2 border-stone-800 flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  style="transform: rotate(${(device.radioFrequency - 88) * 15}deg);"
                >
                  <div class="w-1.5 h-1.5 bg-black rounded-full absolute top-1"></div>
                  <div class="w-5 h-5 bg-stone-800 rounded-full border border-stone-900 flex items-center justify-center">
                    <div class="w-1 h-3 bg-red-500 rounded-xs"></div>
                  </div>
                </div>
              </div>
              <span class="text-[8.5px] font-mono mt-1 font-black tracking-wider text-[#141414]/50">TUNING</span>
            </div>

            <!-- Volume Custom Tactile Knob -->
            <div class="flex flex-col items-center">
              <div class="relative w-9 h-9">
                <input
                  type="range"
                  id="volume-knob"
                  min="0"
                  max="100"
                  value="70"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />
                <div
                  id="volume-dial-knob"
                  class="w-9 h-9 rounded-full bg-gradient-to-r from-stone-600 via-stone-400 to-stone-700 border-2 border-stone-800 flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  style="transform: rotate(252deg);"
                >
                  <div class="w-1.5 h-1.5 bg-black rounded-full absolute top-1"></div>
                  <div class="w-5 h-5 bg-stone-800 rounded-full border border-stone-900 flex items-center justify-center">
                    <div class="w-1 h-3 bg-zinc-500 rounded-xs"></div>
                  </div>
                </div>
              </div>
              <span class="text-[8.5px] font-mono mt-1 font-black tracking-wider text-[#141414]/50">VOLUME</span>
            </div>

            <!-- Tactile 3D Power Switch Button like React -->
            <div class="flex flex-col items-center">
              <button
                id="power-btn"
                class="w-9 h-9 rounded-full border-2 border-stone-800 shadow-md flex items-center justify-center transition-all cursor-pointer bg-emerald-500 text-stone-900 active:translate-y-0.5"
                title="Accensione dispositivo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                </svg>
              </button>
              <span class="text-[8.5px] font-mono mt-1 font-black tracking-wider text-[#141414]/50">POWER</span>
            </div>
          </div>
        </div>
      `;
      interactiveScripts = `
        const tuningKnob = document.getElementById('tuning-knob');
        const volumeKnob = document.getElementById('volume-knob');
        const powerBtn = document.getElementById('power-btn');
        const marker = document.getElementById('tuning-marker');
        const freqDisplay = document.getElementById('freq-display');
        const backlight = document.getElementById('backlight-layer');

        let isPowerOn = true;
        let audioCtx = null;
        let carrierOsc = null;
        let staticNoise = null;
        let masterGain = null;

        function initAudio() {
          if (audioCtx) return;
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          
          carrierOsc = audioCtx.createOscillator();
          carrierOsc.type = 'triangle';
          carrierOsc.frequency.setValueAtTime(220, audioCtx.currentTime);

          // Build static noise filter
          staticNoise = audioCtx.createBufferSource();
          const bufferSize = audioCtx.sampleRate * 2;
          const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const outputData = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            outputData[i] = Math.random() * 2 - 1;
          }
          staticNoise.buffer = noiseBuffer;
          staticNoise.loop = true;

          const noiseGain = audioCtx.createGain();
          noiseGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

          masterGain = audioCtx.createGain();
          masterGain.gain.setValueAtTime(volumeKnob.value / 400, audioCtx.currentTime);

          carrierOsc.connect(masterGain);
          staticNoise.connect(noiseGain);
          noiseGain.connect(masterGain);
          masterGain.connect(audioCtx.destination);

          carrierOsc.start();
          staticNoise.start();
          showNotification("🔊 Sospiri ed onde radio d\\'epoca agganciati!");
        }

        tuningKnob.addEventListener('input', (e) => {
          const mHz = parseFloat(e.target.value);
          freqDisplay.textContent = mHz.toFixed(1) + ' MHz';
          const pct = ((mHz - 88) / 20) * 100;
          marker.style.left = pct + '%';

          // Rotate physical tuning knob dial
          const tuningDial = document.getElementById('tuning-dial-knob');
          if (tuningDial) {
            tuningDial.style.transform = \`rotate(\${(mHz - 88) * 15}deg)\`;
          }

          if (audioCtx && carrierOsc) {
            // Modulate pitch on tuning for raw analog space vibe
            const freqHz = 110 + (mHz - 88) * 18;
            carrierOsc.frequency.setValueAtTime(freqHz, audioCtx.currentTime);
          }
        });

        volumeKnob.addEventListener('input', (e) => {
          const val = e.target.value;

          // Rotate physical volume knob dial
          const volumeDial = document.getElementById('volume-dial-knob');
          if (volumeDial) {
            volumeDial.style.transform = \`rotate(\${val * 3.6}deg)\`;
          }

          if (masterGain && isPowerOn) {
            masterGain.gain.setValueAtTime(val / 400, audioCtx.currentTime);
          }
        });

        powerBtn.addEventListener('click', () => {
          isPowerOn = !isPowerOn;
          if (isPowerOn) {
            powerBtn.classList.remove('bg-red-500');
            powerBtn.classList.add('bg-emerald-500');
            if (backlight) backlight.style.opacity = '1';
            if (audioCtx) {
              audioCtx.resume();
              masterGain.gain.setValueAtTime(volumeKnob.value / 400, audioCtx.currentTime);
            } else {
              initAudio();
            }
          } else {
            powerBtn.classList.remove('bg-emerald-500');
            powerBtn.classList.add('bg-red-500');
            if (backlight) backlight.style.opacity = '0';
            if (masterGain) {
              masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
            }
          }
        });

        // Initialize audio on first click on screen
        document.body.addEventListener('click', initAudio, { once: true });
      `;
      break;

    case 'gameboy':
      deviceMarkup = `
        <div class="flex flex-col h-full justify-between p-4">
          <!-- Top Screen Bezel -->
          <div class="bg-[#3b3b3b] p-3 rounded-t-lg rounded-b-xl border-2 border-black shadow-[inset_0px_5px_15px_rgba(0,0,0,0.5)] flex flex-col items-center">
            <!-- Retro Screen Battery Indicator Left -->
            <div class="flex w-full px-2 justify-between items-center text-[7px] font-mono text-stone-400 font-bold mb-1 tracking-wider uppercase">
              <span>DOT MATRIX WITH STEREO SOUND</span>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-red-600 border border-black shadow"></div>
                <span class="text-[5.5px]">BATTERY</span>
              </div>
            </div>

            <!-- Core Gameboy nostalgic Screen Panel with real canvas mini-game -->
            <div class="w-full flex justify-center bg-[#8b956d] border-4 border-black rounded relative h-[140px] shadow-inner select-none overflow-hidden" id="gb-screen-wrapper">
              <!-- Real HTML5 game iframe slot -->
              <div id="gb-iframe-container" class="absolute inset-0 z-20 hidden">
                <iframe id="gb-frame" src="${device.customVideoUrl || ''}" class="w-full h-full border-none filter grayscale contrast-125" allow="autoplay; encrypted-media; picture-in-picture; gamepad" referrerPolicy="no-referrer"></iframe>
              </div>
              <canvas id="gb-canvas" width="160" height="140" class="w-full h-full bg-[#8b956d]" style="image-rendering: pixelated;"></canvas>
            </div>
          </div>

          <!-- Logo Brand Text -->
          <div class="text-center font-bold text-xs font-serif text-black/60 italic my-2 tracking-widest">${device.brand || 'VINTAGE-BOY'}</div>

          <!-- Bottom Control Deck (D-Pad & Action buttons) -->
          <div class="grid grid-cols-2 grow items-center gap-2 pt-2 px-1 relative">
            <!-- Left Side D-Pad Cross -->
            <div class="relative flex items-center justify-center w-28 h-28 mx-auto">
              <!-- Horizontal base bar -->
              <div class="absolute w-24 h-8 bg-[#1a1a1a] border-2 border-black rounded-sm shadow-md flex justify-between px-1.5">
                <button id="dpad-left" class="w-6 h-full cursor-pointer hover:bg-stone-800 transition-colors flex items-center justify-center font-black text-white text-xs select-none">◀</button>
                <button id="dpad-right" class="w-6 h-full cursor-pointer hover:bg-stone-800 transition-colors flex items-center justify-center font-black text-white text-xs select-none">▶</button>
              </div>
              <!-- Vertical base bar -->
              <div class="absolute w-8 h-24 bg-[#1a1a1a] border-2 border-black rounded-sm shadow-md flex flex-col justify-between py-1.5 z-10 pointer-events-none">
                <div class="text-[7.5px] font-bold text-center text-stone-500">▲</div>
                <div class="text-[7.5px] font-bold text-center text-stone-500">▼</div>
              </div>
              <!-- Clickable transparent overlays for top/down triggers -->
              <button id="dpad-up" class="absolute top-1 w-8 h-8 rounded hover:bg-white/15 cursor-pointer z-20"></button>
              <button id="dpad-down" class="absolute bottom-1 w-8 h-8 rounded hover:bg-white/15 cursor-pointer z-20"></button>
              <!-- Center Pivot Pin -->
              <div class="absolute w-6 h-6 rounded-full bg-[#141414] border border-black/40 z-30"></div>
            </div>

            <!-- Right Side Action Rounded Buttons -->
            <div class="flex items-center justify-center gap-3.5 transform -rotate-12">
              <div class="flex flex-col items-center">
                <button id="btn-b" class="h-10 w-10 bg-[#a52a2a] hover:bg-red-800 border-2 border-black rounded-full shadow-[3px_3px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141414] flex items-center justify-center font-black text-white text-sm cursor-pointer select-none">B</button>
                <span class="text-[9px] font-mono font-black text-black/70 mt-1">B</span>
              </div>
              <div class="flex flex-col items-center">
                <button id="btn-a" class="h-10 w-10 bg-[#a52a2a] hover:bg-red-800 border-2 border-black rounded-full shadow-[3px_3px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141414] flex items-center justify-center font-black text-white text-sm cursor-pointer select-none">A</button>
                <span class="text-[9px] font-mono font-black text-black/70 mt-1">A</span>
              </div>
            </div>
          </div>

          <!-- Select & Start horizontal diagonal pills bottom drawer -->
          <div class="flex justify-center gap-6 mt-1 pb-2">
            <div class="flex flex-col items-center">
              <button id="btn-select" class="w-10 h-2 bg-[#7c7a7a] hover:bg-[#5a5959] border border-black rounded-full rotate-[-15deg] cursor-pointer shadow-sm"></button>
              <div class="text-[7.5px] font-mono font-black text-black/60 mt-1 tracking-wider uppercase">SELECT</div>
            </div>
            <div class="flex flex-col items-center">
              <button id="btn-start" class="w-10 h-2 bg-[#7c7a7a] hover:bg-[#5a5959] border border-black rounded-full rotate-[-15deg] cursor-pointer shadow-sm"></button>
              <div class="text-[7.5px] font-mono font-black text-black/60 mt-1 tracking-wider uppercase">START</div>
            </div>
          </div>

          <!-- Input row for custom emulator / ROM links -->
          <div class="mt-2 p-2.5 rounded-xl flex flex-col gap-1 w-full z-10 select-none" style="background-color: rgba(28,25,23,0.5) !important; border: 1px solid rgba(0,0,0,0.2) !important;">
            <span class="text-[8px] font-mono text-stone-300 font-bold uppercase">🎮 Carica Gioco Real-Time (Iframe URL):</span>
            <div class="flex gap-2">
              <input type="text" id="gb-custom-url" placeholder="Incolla link gioco o emulatore..." value="${device.customVideoUrl || ''}" class="text-[9px] text-zinc-300 font-mono rounded px-2 py-0.5 w-full focus:outline-none focus:border-red-500 placeholder-zinc-700" style="background-color: #0c0a09 !important; border: 1px solid #2e2a24 !important; color: #e7e5e4 !important;" />
              <button id="gb-custom-load-btn" class="px-2 py-0.5 bg-[#F27D26] hover:bg-orange-600 text-[8px] font-mono font-bold text-white rounded cursor-pointer shrink-0">VAI</button>
            </div>
          </div>
        </div>
      `;
      interactiveScripts = `
        const canvas = document.getElementById('gb-canvas');
        const ctx = canvas.getContext('2d');
        const btnA = document.getElementById('btn-a');
        const btnB = document.getElementById('btn-b');
        const btnSelect = document.getElementById('btn-select');
        const btnStart = document.getElementById('btn-start');
        const dUp = document.getElementById('dpad-up');
        const dDown = document.getElementById('dpad-down');
        const dLeft = document.getElementById('dpad-left');
        const dRight = document.getElementById('dpad-right');

        let snake = [{x: 8, y: 7}];
        let direction = 'RIGHT';
        let food = {x: 3, y: 4};
        let score = 0;
        let gameOver = false;
        let gameStarted = false;
        let gameLoopInterval = null;
        let audioCtx = null;

        function beep(freq, type="square", duration=0.1) {
          try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
          } catch(e) {}
        }

        function drawGame() {
          ctx.fillStyle = '#8b956d';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (!gameStarted) {
            ctx.fillStyle = '#0f380f';
            ctx.font = '900 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('CR-BOY ADVANCE', canvas.width/2, 45);
            ctx.font = 'bold 8px monospace';
            ctx.fillText('PREMI START PER GIOCARE', canvas.width/2, 75);
            ctx.font = '500 7px monospace';
            ctx.fillText('CONTROLLI: TASTI D-PAD', canvas.width/2, 100);
            return;
          }

          if (gameOver) {
            ctx.fillStyle = '#0f380f';
            ctx.font = '900 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, 50);
            ctx.font = 'bold 8px monospace';
            ctx.fillText('PUNTEGGIO: ' + score, canvas.width/2, 80);
            ctx.font = '500 7px monospace';
            ctx.fillText('A o START PER RIPETERE', canvas.width/2, 110);
            return;
          }

          // Grid lines
          ctx.strokeStyle = 'rgba(15, 56, 15, 0.05)';
          ctx.lineWidth = 0.5;
          for (let i = 0; i < canvas.width; i += 10) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
          }
          for (let j = 0; j < canvas.height; j += 10) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
          }

          // Food
          ctx.fillStyle = '#0f380f';
          ctx.fillRect(food.x * 10 + 2, food.y * 10 + 2, 6, 6);

          // Snake
          snake.forEach((seg, index) => {
            ctx.fillStyle = '#0f380f';
            ctx.fillRect(seg.x * 10 + 1, seg.y * 10 + 1, 8, 8);
            if (index === 0) {
              ctx.fillStyle = '#8b956d';
              ctx.fillRect(seg.x * 10 + 3, seg.y * 10 + 3, 4, 4);
            }
          });

          // Top bar
          ctx.fillStyle = '#0f380f';
          ctx.fillRect(0, 0, canvas.width, 14);
          ctx.fillStyle = '#8b956d';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('CODE: ' + score, 6, 10);
          ctx.textAlign = 'right';
          ctx.fillText('RETRO-SNAKE', canvas.width - 6, 10);
        }

        function executeGameStep() {
          if (gameOver || !gameStarted) return;
          const head = Object.assign({}, snake[0]);
          if (direction === 'UP') head.y--;
          else if (direction === 'DOWN') head.y++;
          else if (direction === 'LEFT') head.x--;
          else if (direction === 'RIGHT') head.x++;

          const cols = 16;
          const rows = 14;
          if (head.x < 0 || head.x >= cols || head.y < 1 || head.y >= rows) {
            triggerGameOver();
            return;
          }

          for (let seg of snake) {
            if (seg.x === head.x && seg.y === head.y) {
              triggerGameOver();
              return;
            }
          }

          snake.unshift(head);

          if (head.x === food.x && head.y === food.y) {
            score += 10;
            beep(1200, 'square', 0.08);
            spawnFood();
          } else {
            snake.pop();
          }

          drawGame();
        }

        function spawnFood() {
          food.x = Math.floor(Math.random() * 16);
          food.y = Math.floor(Math.random() * 12) + 1;
        }

        function triggerGameOver() {
          gameOver = true;
          beep(220, 'sawtooth', 0.3);
          showNotification('GAME OVER! Punti: ' + score);
          drawGame();
        }

        function startGame() {
          snake = [{x: 8, y: 7}];
          direction = 'RIGHT';
          score = 0;
          gameOver = false;
          gameStarted = true;
          spawnFood();
          beep(900, 'square', 0.15);
          if (gameLoopInterval) clearInterval(gameLoopInterval);
          gameLoopInterval = setInterval(executeGameStep, 230);
          showNotification('Inizializzazione cartuccia... Retro Snake avviato!');
          drawGame();
        }

        btnStart.addEventListener('click', startGame);
        btnSelect.addEventListener('click', () => {
          beep(400, 'triangle', 0.1);
          gameStarted = false;
          drawGame();
        });
        
        btnA.addEventListener('click', () => {
          if (!gameStarted || gameOver) {
            startGame();
          } else {
            beep(800, 'square', 0.05);
          }
        });

        btnB.addEventListener('click', () => {
          beep(700, 'sine', 0.06);
        });

        dUp.addEventListener('click', () => { if (direction !== 'DOWN') { direction = 'UP'; beep(1000, 'sine', 0.02); } });
        dDown.addEventListener('click', () => { if (direction !== 'UP') { direction = 'DOWN'; beep(1000, 'sine', 0.02); } });
        dLeft.addEventListener('click', () => { if (direction !== 'RIGHT') { direction = 'LEFT'; beep(1000, 'sine', 0.02); } });
        dRight.addEventListener('click', () => { if (direction !== 'LEFT') { direction = 'RIGHT'; beep(1000, 'sine', 0.02); } });

        const gbCustomUrl = document.getElementById('gb-custom-url');
        const gbCustomLoadBtn = document.getElementById('gb-custom-load-btn');
        const gbIframeContainer = document.getElementById('gb-iframe-container');
        const gbFrame = document.getElementById('gb-frame');

        function updateGbSignal() {
          if (gbCustomUrl.value.trim() !== '') {
            gbIframeContainer.classList.remove('hidden');
            gbFrame.src = gbCustomUrl.value.trim();
          } else {
            gbIframeContainer.classList.add('hidden');
          }
        }

        updateGbSignal();

        gbCustomLoadBtn.addEventListener('click', () => {
          beep(1200, 'square', 0.08);
          updateGbSignal();
          showNotification("🎮 Gioco cartuccia caricato!");
        });

        drawGame();
      `;
      break;

    case 'ipod':
      deviceMarkup = `
        <div class="flex flex-col h-full justify-between p-4">
          <!-- Monochrome Screen Bezel -->
          <div class="bg-black p-1.5 rounded border-2 border-black/80 shadow-[inset_0px_2px_5px_rgba(255,255,255,0.1)]">
            <div class="bg-[#b4d2e1] text-stone-900 border border-stone-800 p-3 rounded-xs min-h-[140px] flex flex-col justify-between font-sans relative overflow-hidden select-none">
              <div class="absolute inset-0 opacity-1 pointer-events-none bg-[radial-gradient(1px_1px_at_1px_1px,#141414,transparent_1px)]" style="background-size: 2px 2px;"></div>
              
              <!-- iPod Status Bar -->
              <div class="flex justify-between items-center text-[7.5px] font-black border-b border-stone-700/50 pb-1 uppercase">
                <span>◀ iPod</span>
                <span>▶isPlaying</span>
                <span class="w-5 h-2.5 bg-stone-900 border border-[#b4d2e1] rounded-xs relative flex items-center"><span class="h-full w-4/5 bg-stone-100"></span></span>
              </div>

              <!-- Content Menu list -->
              <div class="my-auto py-1 flex flex-col gap-1 text-[9px] font-bold" id="ipod-screen-list">
                <div class="bg-stone-900 text-[#b4d2e1] px-1 py-0.5 flex justify-between items-center" id="opt-0">
                  <span>▶ Ora in Riproduzione</span>
                  <span>▶</span>
                </div>
                <div class="px-1 py-0.5" id="opt-1">Brani Vintage [11]</div>
                <div class="px-1 py-0.5" id="opt-2">Playlist Nostalgia</div>
                <div class="px-1 py-0.5" id="opt-3">Sacca degli Adesivi</div>
                <div class="px-1 py-0.5" id="opt-4">Impostazioni</div>
              </div>

              <!-- Track Progress bottom bar -->
              <div class="border-t border-stone-700/40 pt-1.5 mt-1">
                <div class="h-1 bg-stone-600 rounded">
                  <div class="h-full w-2/5 bg-stone-950 rounded" id="ipod-gauge"></div>
                </div>
                <div class="flex justify-between text-[6.5px] font-black tracking-tighter mt-1 text-stone-900">
                  <span id="ipod-timer">01:42</span>
                  <span class="font-extrabold">${device.brand || 'CLASSIC-POD'}</span>
                  <span>-02:18</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Large Apple-style Click Wheel -->
          <div class="w-36 h-36 rounded-full bg-stone-100 border-2 border-stone-300 relative mx-auto my-4 shadow-md flex items-center justify-center select-none cursor-pointer" id="clickwheel">
            <!-- Central core select button -->
            <button id="center-select" class="absolute w-12 h-12 rounded-full bg-white border border-stone-300 shadow active:scale-95 transition-transform flex items-center justify-center z-10 pointer-events-auto cursor-pointer"></button>
            
            <!-- Dial action buttons labels positioned on wheel edges -->
            <button id="wheel-menu" class="absolute top-1.5 font-bold font-mono text-[9px] text-stone-600 tracking-wider py-1 px-3 bg-transparent border-0 select-none z-10 pointer-events-auto">MENU</button>
            <button id="wheel-next" class="absolute right-2 font-bold font-mono text-[9.5px] text-stone-600 select-none z-10 pointer-events-auto">▶▶</button>
            <button id="wheel-prev" class="absolute left-2 font-bold font-mono text-[9.5px] text-stone-600 select-none z-10 pointer-events-auto">◀◀</button>
            <button id="wheel-play" class="absolute bottom-1.5 font-bold font-mono text-[9px] text-[#A52A2A] tracking-wider py-1 px-2 select-none z-10 pointer-events-auto">▶▮▮</button>
          </div>
        </div>
      `;
      interactiveScripts = `
        const listItems = [
          "▶ Ora in Riproduzione",
          "Brani Vintage [11]",
          "Playlist Nostalgia",
          "Sacca degli Adesivi",
          "Impostazioni"
        ];
        let cursorIndex = 0;
        let seconds = 102;

        const screenList = document.getElementById('ipod-screen-list');
        const wheel = document.getElementById('clickwheel');
        const btnSelect = document.getElementById('center-select');
        const wheelPlay = document.getElementById('wheel-play');
        const wheelMenu = document.getElementById('wheel-menu');
        const wheelNext = document.getElementById('wheel-next');
        const wheelPrev = document.getElementById('wheel-prev');
        const ipodGauge = document.getElementById('ipod-gauge');
        const ipodTimer = document.getElementById('ipod-timer');

        let audioCtx = null;
        let synthOsc = null;

        function renderList() {
          let markup = '';
          for (let i = 0; i < listItems.length; i++) {
            if (i === cursorIndex) {
              markup += \`<div class="bg-stone-900 text-[#b4d2e1] px-1 py-0.5 flex justify-between items-center" id="opt-\${i}">
                <span>\${listItems[i]}</span>
                <span>◀</span>
              </div>\`;
            } else {
              markup += \`<div class="px-1 py-0.5" id="opt-\${i}">\${listItems[i]}</div>\`;
            }
          }
          screenList.innerHTML = markup;
        }

        // Web Audio API pure synth triggers
        function clickSound(freq=600) {
          try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
          } catch(e){}
        }

        wheelNext.addEventListener('click', (e) => {
          e.stopPropagation();
          clickSound(880);
          cursorIndex = (cursorIndex + 1) % listItems.length;
          renderList();
        });

        wheelPrev.addEventListener('click', (e) => {
          e.stopPropagation();
          clickSound(730);
          cursorIndex = (cursorIndex - 1 + listItems.length) % listItems.length;
          renderList();
        });

        btnSelect.addEventListener('click', () => {
          clickSound(1000);
          showNotification("Selezionato: " + listItems[cursorIndex].replace('▶', '').trim());
        });

        wheelPlay.addEventListener('click', (e) => {
          e.stopPropagation();
          clickSound(520);
          showNotification("🔊 Riproduzione Iniziata!");
        });

        // Simulating scrolling with Wheel rotation interactions
        let wheelAngleStart = 0;
        wheel.addEventListener('wheel', (e) => {
          e.preventDefault();
          if (e.deltaY > 0) {
            cursorIndex = (cursorIndex + 1) % listItems.length;
          } else {
            cursorIndex = (cursorIndex - 1 + listItems.length) % listItems.length;
          }
          clickSound(450);
          renderList();
        });

        // Advance timer
        setInterval(() => {
          seconds++;
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          ipodTimer.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
          const pct = Math.min(100, (seconds / 240) * 100);
          ipodGauge.style.width = pct + '%';
          if (seconds >= 240) seconds = 0;
        }, 1000);
      `;
      break;

    case 'tv':
      deviceMarkup = `
        <div class="relative w-full h-full flex p-3.5 gap-3.5 text-neutral-800">
          <!-- Dual Rabbit Ear Antennas style matching React -->
          <div class="absolute inset-x-0 top-0 h-4 flex justify-between px-16 pointer-events-none select-none">
            <!-- Left Ear -->
            <div id="tv-antenna-l" class="absolute left-24 w-1 bg-stone-400 origin-bottom transition-all duration-300 pointer-events-none z-0" style="height: ${device.tvAntennaLength || 60}px; transform: rotate(-35deg) translateY(-100%);">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-600 rounded-full"></div>
            </div>
            <!-- Right Ear -->
            <div id="tv-antenna-r" class="absolute right-28 w-1 bg-stone-400 origin-bottom transition-all duration-300 pointer-events-none z-0" style="height: ${device.tvAntennaLength || 60}px; transform: rotate(35deg) translateY(-100%);">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-600 rounded-full"></div>
            </div>
          </div>

          <!-- Left column: Rounded CRT Screen bezel container -->
          <div class="flex-1 rounded-[1.8rem] border-[6px] border-neutral-700/60 bg-neutral-900 shadow-inner relative flex overflow-hidden ring-4 ring-black/45 z-10 select-none">
            <!-- CRT Screen tube glass simulation -->
            <div class="absolute inset-0 bg-[#1e2a1e] overflow-hidden flex items-center justify-center font-mono" id="crt-screen">
              <div id="crt-bg-glow" class="absolute inset-0 bg-[#344e34] pointer-events-none opacity-40 animate-pulse"></div>
              
              <!-- Scanlines overlays -->
              <div class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none z-10"></div>
              <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,0,0.03)_33%,rgba(255,0,0,0.03)_66%,rgba(0,0,255,0.03)_100%)] bg-[size:3px_100%] pointer-events-none z-10"></div>
              
              <!-- Glare reflex effect -->
              <div class="absolute inset-0 bg-radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_60%) pointer-events-none z-15"></div>
              <div class="absolute inset-0 shadow-[inset_0_4px_24px_rgba(0,0,0,0.85)] pointer-events-none z-15"></div>

              <!-- Animated Static layer -->
              <div id="tv-snow-layer" class="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:4px_4px] mix-blend-difference pointer-events-none z-9 opacity-40 transition-opacity duration-300"></div>

              <!-- Iframe slot -->
              <div id="tv-iframe-container" class="absolute inset-0 z-20 hidden">
                <iframe id="tv-frame" src="${device.customVideoUrl || ''}" class="w-full h-full border-none pointer-events-auto" allow="autoplay; encrypted-media"></iframe>
              </div>

              <!-- Default Retro Broadcast / Static Screen -->
              <div id="tv-status-screen" class="z-25 text-center text-[#7cfc00] leading-tight tracking-wider flex flex-col items-center">
                <span class="text-3xl font-black italic bg-black/60 px-4 py-1 rounded shadow-lg border border-white/20">CH 04</span>
                <span class="text-white bg-red-650 text-[9px] px-2 py-0.5 rounded mt-2 uppercase tracking-widest font-bold">ASSENZA SEGNALE</span>
              </div>
            </div>
          </div>

          <!-- Right column: Vertical side control panel -->
          <div class="w-24 bg-black/15 border border-black/5 rounded-2xl flex flex-col justify-between items-center p-2 pt-3 z-10 font-mono select-none">
            <div class="text-[9px] font-black uppercase text-black/60 tracking-wider text-center">${device.brand || 'SUPER-CHRON'}</div>

            <!-- Channel Rotary Selector Knob -->
            <div class="flex flex-col items-center gap-0.5 mt-2">
              <button id="tv-knob-ch" class="w-10 h-10 rounded-full bg-gradient-to-r from-stone-600 via-stone-400 to-stone-700 border-2 border-stone-850 flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer relative">
                <!-- Pointer notch notch -->
                <div id="tv-knob-notch" class="absolute inset-0 pointer-events-none flex justify-center transform transition-transform" style="transform: rotate(0deg);">
                  <div class="w-0.5 h-3 bg-stone-900 rounded-b"></div>
                </div>
                <div class="w-6 h-6 bg-stone-800 rounded-full border border-stone-900 flex items-center justify-center text-stone-300 font-bold text-xs select-none shadow-inner" id="tv-ch-num">
                  4
                </div>
              </button>
              <span class="text-[7.5px] text-black/55 font-bold mt-0.5 uppercase tracking-wide">CANALE</span>
            </div>

            <!-- Sliders -->
            <div class="w-full flex justify-around my-1 px-1">
              <!-- Antenna tuning vertical slider -->
              <div class="flex flex-col items-center">
                <input type="range" id="tv-slider-ant" min="20" max="140" value="${device.tvAntennaLength || 60}" class="w-1.5 h-10 bg-black/45 rounded-lg cursor-ns-resize cursor-pointer" style="writing-mode: vertical-lr; direction: rtl; -webkit-appearance: slider-vertical;" />
                <span class="text-[6.5px] text-black/55 font-bold mt-1 scale-85 uppercase">ANT</span>
              </div>
              <!-- Static level fine tune slider -->
              <div class="flex flex-col items-center">
                <input type="range" id="tv-slider-stat" min="0" max="100" value="45" class="w-1.5 h-10 bg-black/45 rounded-lg cursor-ns-resize cursor-pointer" style="writing-mode: vertical-lr; direction: rtl; -webkit-appearance: slider-vertical;" />
                <span class="text-[6.5px] text-black/55 font-bold mt-1 scale-85 uppercase">STAT</span>
              </div>
            </div>

            <!-- Vertical Speaker Grille Lines -->
            <div class="w-full h-8 flex justify-between px-2 bg-black/20 rounded-md py-1">
              <div class="w-1 h-full bg-stone-900/40 rounded-full"></div>
              <div class="w-1 h-full bg-stone-900/40 rounded-full"></div>
              <div class="w-1 h-full bg-stone-900/40 rounded-full"></div>
              <div class="w-1 h-full bg-stone-900/40 rounded-full"></div>
            </div>

            <!-- Power button -->
            <div class="flex flex-col items-center mt-2.5">
              <button id="tv-toggle-power" class="w-8 h-8 rounded-full border border-black/40 shadow-md flex items-center justify-center transition-all cursor-pointer bg-red-650 text-white active:translate-y-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                </svg>
              </button>
              <span class="text-[7px] text-black/55 font-bold mt-0.5 tracking-wider">POWER</span>
            </div>
          </div>
        </div>

        <!-- Custom Video loading console bar mounted below -->
        <div class="absolute bottom-[-55px] left-2 right-2 p-2 rounded-xl flex items-center gap-1.5 z-40 select-none font-sans scale-[0.97]" style="background-color: #1c1917 !important; border: 1px solid #44403c !important; box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;">
          <span class="text-[8px] font-mono text-neutral-400 font-bold uppercase whitespace-nowrap">📺 Video (YT LINK/IFRAME):</span>
          <input type="text" id="tv-custom-url" placeholder="Incolla link o Embed YouTube..." value="${device.customVideoUrl || ''}" class="text-[9px] text-zinc-300 font-mono rounded px-2 py-0.5 w-full focus:outline-none focus:border-red-500 placeholder-zinc-700 pointer-events-auto" style="background-color: #0c0a09 !important; border: 1px solid #2e2a24 !important; color: #e7e5e4 !important;" />
          <button id="tv-custom-load-btn" class="px-2.5 py-0.5 bg-[#F27D26] hover:bg-orange-600 text-[8px] font-mono font-black text-white rounded cursor-pointer shrink-0 pointer-events-auto">VAI</button>
        </div>
      `;
      interactiveScripts = `
        const chKnob = document.getElementById('tv-knob-ch');
        const chNotch = document.getElementById('tv-knob-notch');
        const chNum = document.getElementById('tv-ch-num');
        const powerToggle = document.getElementById('tv-toggle-power');
        const screen = document.getElementById('crt-screen');
        const screenLabel = document.getElementById('tv-status-screen');
        const iframeContainer = document.getElementById('tv-iframe-container');
        const tvFrame = document.getElementById('tv-frame');
        const tvCustomUrl = document.getElementById('tv-custom-url');
        const tvCustomLoadBtn = document.getElementById('tv-custom-load-btn');
        const tvSnowLayer = document.getElementById('tv-snow-layer');
        const sliderAnt = document.getElementById('tv-slider-ant');
        const sliderStat = document.getElementById('tv-slider-stat');
        const antL = document.getElementById('tv-antenna-l');
        const antR = document.getElementById('tv-antenna-r');

        let channels = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        let chIndex = channels.indexOf(${device.tvChannel || 4});
        if (chIndex === -1) chIndex = 2; // Default index

        chNum.textContent = channels[chIndex];
        chNotch.style.transform = 'rotate(' + ((channels[chIndex] - 2) * 32) + 'deg)';

        let isOn = true;
        let snowInterval = null;

        function tvZipBeep() {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } catch(e){}
        }

        function getPresetYoutubeUrl(channel) {
          if (channel === 2) return 'https://www.youtube.com/embed/F_S9p-m8l4Y?autoplay=1&mute=1&controls=1&loop=1&playlist=F_S9p-m8l4Y';
          if (channel === 4) return 'https://www.youtube.com/embed/yP_7gXQk7d8?autoplay=1&mute=1&controls=1&loop=1&playlist=yP_7gXQk7d8';
          if (channel === 7) return 'https://www.youtube.com/embed/4xDzrJKXOOY?autoplay=1&mute=1&controls=1&loop=1&playlist=4xDzrJKXOOY';
          return null;
        }

        function updateScreenSignal() {
          if (!isOn) {
            tvSnowLayer.style.opacity = '0';
            if (snowInterval) clearInterval(snowInterval);
            snowInterval = null;
            return;
          }

          // Antenna modifications
          const antVal = parseInt(sliderAnt.value);
          antL.style.height = antVal + 'px';
          antR.style.height = antVal + 'px';

          // Noise modifications
          const statStrength = parseFloat(sliderStat.value) / 100;

          const customVal = tvCustomUrl.value.trim();
          if (customVal !== '') {
            iframeContainer.classList.remove('hidden');
            screenLabel.classList.add('hidden');
            tvFrame.src = customVal;
            tvSnowLayer.style.opacity = '0';
            if (snowInterval) clearInterval(snowInterval);
            snowInterval = null;
          } else {
            const presetUrl = getPresetYoutubeUrl(channels[chIndex]);
            if (presetUrl) {
              iframeContainer.classList.remove('hidden');
              screenLabel.classList.add('hidden');
              tvFrame.src = presetUrl;
              tvSnowLayer.style.opacity = '0';
              if (snowInterval) clearInterval(snowInterval);
              snowInterval = null;
            } else {
              iframeContainer.classList.add('hidden');
              screenLabel.classList.remove('hidden');
              tvFrame.src = '';

              screenLabel.innerHTML = \`
                <div class="text-3xl font-black italic block animate-bounce border-2 border-[#7cfc00] px-3 py-1 rounded bg-black/50">CH \${channels[chIndex]}</div>
                <div class="text-[9px] mt-2 font-black">ASSENZA SEGNALE</div>
                <div class="text-[7.5px] mt-1 text-red-500 font-extrabold uppercase blinking">● NO SYNC SIGNAL</div>
              \`;

              // Animate static snow
              if (!snowInterval) {
                snowInterval = setInterval(() => {
                  tvSnowLayer.style.backgroundPosition = Math.random() * 10 + 'px ' + Math.random() * 10 + 'px';
                  tvSnowLayer.style.opacity = String((statStrength * 0.45) + Math.random() * 0.15);
                }, 40);
              }
            }
          }
        }

        updateScreenSignal();

        tvCustomLoadBtn.addEventListener('click', () => {
          tvZipBeep();
          updateScreenSignal();
          showNotification("📺 Segnale video sintonizzato!");
        });

        chKnob.addEventListener('click', () => {
          chIndex = (chIndex + 1) % channels.length;
          chNum.textContent = channels[chIndex];
          chNotch.style.transform = 'rotate(' + ((channels[chIndex] - 2) * 32) + 'deg)';
          tvZipBeep();
          if (isOn) {
            updateScreenSignal();
          }
        });

        sliderAnt.addEventListener('input', () => {
          const antVal = parseInt(sliderAnt.value);
          antL.style.height = antVal + 'px';
          antR.style.height = antVal + 'px';
          if (isOn) updateScreenSignal();
        });

        sliderStat.addEventListener('input', () => {
          if (isOn) updateScreenSignal();
        });

        powerToggle.addEventListener('click', () => {
          isOn = !isOn;
          if (isOn) {
            screen.style.display = "flex";
            screen.style.opacity = "1";
            powerToggle.classList.remove('bg-stone-550');
            powerToggle.classList.add('bg-red-650');
            tvZipBeep();
            updateScreenSignal();
          } else {
            screen.style.opacity = "0";
            powerToggle.classList.remove('bg-red-650');
            powerToggle.classList.add('bg-stone-550');
            iframeContainer.classList.add('hidden');
            updateScreenSignal();
          }
        });
      `;
      break;

    case 'turntable':
      deviceMarkup = `
        <div class="flex flex-row h-full justify-between p-5 gap-4 relative">
          <!-- Vinyl platter disk sleeve -->
          <div class="flex-1 bg-gradient-to-r from-stone-300 via-stone-400 to-stone-500 rounded-full flex justify-center items-center shadow-inner relative ring-4 ring-black/20 w-fit aspect-square overflow-hidden max-w-[200px]">
            <div class="absolute inset-2 border border-black/10 rounded-full"></div>
            <div class="absolute inset-5 border border-black/10 rounded-full"></div>
            
            <!-- Spinning Vinyl -->
            <div 
              id="vinyl-disc" 
              class="w-40 h-40 rounded-full border-4 border-stone-950 flex justify-center items-center relative shadow-2xl ${device.turntableArmPosition === 'playing' ? 'animate-[spin_4s_linear_infinite]' : ''}"
              style="background-color: ${device.turntableVinylColor || '#121212'}; animation-duration: ${device.turntableSpeed === '45' ? '2.5s' : device.turntableSpeed === '78' ? '1.5s' : '4s'}"
            >
              <div class="absolute inset-3 border border-stone-800 rounded-full opacity-40 pointer-events-none"></div>
              <div class="absolute inset-6 border border-stone-800 rounded-full opacity-40 pointer-events-none"></div>
              <div class="absolute inset-10 border border-stone-800 rounded-full opacity-40 pointer-events-none"></div>
              <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-md flex flex-col justify-center items-center border border-black/35 pointer-events-none">
                <div class="w-3.5 h-3.5 rounded-full bg-stone-300 border border-black/20 z-10"></div>
              </div>
            </div>
          </div>

          <!-- Tone arm & controls -->
          <div class="w-32 flex flex-col justify-between items-center z-10 font-mono select-none">
            <div class="relative w-full flex-1 flex flex-col justify-start items-end pr-2">
              <div class="w-12 h-12 rounded-full bg-gradient-to-b from-stone-600 to-stone-800 border-2 border-stone-900 shadow-md flex items-center justify-center relative">
                <div class="w-6 h-6 rounded-full bg-stone-300 border border-zinc-700"></div>
                <!-- Needle arm -->
                <div id="tone-arm" class="absolute top-6 right-5 h-20 w-1 bg-gradient-to-b from-zinc-300 to-zinc-500 origin-top shadow-md rounded-full transition-all duration-700 cursor-pointer" style="transform: ${device.turntableArmPosition === 'playing' ? 'rotate(18deg)' : 'rotate(-10deg)'}">
                  <div class="absolute bottom-0 left-[-4px] w-3 h-4 bg-stone-800 rounded-xs border border-stone-950 flex flex-col justify-end">
                    <div class="w-3 h-0.5 bg-orange-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <span class="text-[7.5px] text-zinc-650 mt-1 uppercase text-right leading-3 font-semibold w-full">TESTINA & LEVA</span>
            </div>

            <!-- Plinth cycle speed -->
            <div class="w-full flex justify-between items-center bg-black/10 p-2 border border-black/5 rounded-xl gap-2 mt-2">
              <div class="flex flex-col items-center">
                <button id="speed-btn" class="px-2.5 py-1 text-[11px] bg-stone-800 hover:bg-stone-700 text-amber-500 rounded border border-stone-950 font-bold cursor-pointer font-mono">${device.turntableSpeed || '33'}</button>
                <span class="text-[6.5px] text-black/50 font-bold mt-1">GIRI/MIN</span>
              </div>
              <div class="flex flex-col items-center">
                <button id="vinyl-track-btn" class="p-1 px-1.5 text-[8.5px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-950 font-bold truncate max-w-[60px] cursor-pointer" title="Cambia traccia">TR. A</button>
                <span class="text-[6.5px] text-black/50 font-bold mt-1 uppercase">TRACK</span>
              </div>
            </div>

            <!-- Pitch Fader slider -->
            <div class="w-full bg-black/10 rounded-xl px-2 py-1.5 border border-black/5 mt-2 text-center flex items-center justify-between gap-2 border-stone-400/20">
              <span class="text-[7px] text-black/50 font-bold">PITCH</span>
              <input type="range" id="pitch-slider" min="0" max="100" value="50" class="w-full h-1 bg-black/35 rounded" />
              <span id="pitch-display" class="text-[8px] text-amber-600 font-bold">0%</span>
            </div>
          </div>

          <!-- Brand stamp label -->
          <div class="absolute bottom-1.5 left-5 border-t border-black/10 pt-0.5 pointer-events-none opacity-50">
            <span class="text-[7px] font-mono uppercase font-black tracking-widest text-black">${device.brand || 'DARRARD'} RETROPLAYER</span>
          </div>
        </div>
      `;
      interactiveScripts = `
        const vinyl = document.getElementById('vinyl-disc');
        const arm = document.getElementById('tone-arm');
        const speedBtn = document.getElementById('speed-btn');
        const trackBtn = document.getElementById('vinyl-track-btn');
        const pitchSlider = document.getElementById('pitch-slider');
        const pitchDisplay = document.getElementById('pitch-display');

        let isVinylPlaying = ${device.turntableArmPosition === 'playing' ? 'true' : 'false'};
        let vinylSpeed = "${device.turntableSpeed || '33'}";
        let activeTrack = 0;
        const genres = ['lofi', 'synthpop', 'chiptune', 'rock'];

        let tCtx = null;
        let tStatic = null;
        let tLoopTimer = null;

        function playVinylClick() {
          try {
            if (!tCtx) tCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = tCtx.createOscillator();
            const gain = tCtx.createGain();
            osc.connect(gain);
            gain.connect(tCtx.destination);
            osc.frequency.setValueAtTime(600, tCtx.currentTime);
            gain.gain.setValueAtTime(0.02, tCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, tCtx.currentTime + 0.05);
            osc.start();
            osc.stop(tCtx.currentTime + 0.05);
          } catch(e){}
        }

        function syncSequencer() {
          if (tLoopTimer) clearInterval(tLoopTimer);
          if (!isVinylPlaying) {
            stopVinylStatic();
            return;
          }
          startVinylStatic();

          // Start a procedural synthesizer chord progression loop!
          let step = 0;
          const tempo = vinylSpeed === '45' ? 140 : vinylSpeed === '78' ? 180 : 90;
          const stepSec = 60 / tempo / 2;

          const chords = [
            [220.00, 261.63, 329.63], // Am
            [174.61, 220.00, 261.63], // F
            [130.81, 164.81, 196.00], // C
            [146.83, 196.00, 246.94], // G
          ];

          tLoopTimer = setInterval(() => {
            if (!tCtx) return;
            const now = tCtx.currentTime;
            const bar = Math.floor(step / 16) % 4;
            const beat = step % 16;

            // Base note playing
            if (beat % 4 === 0) {
              const root = chords[bar][0];
              const pitchVal = parseFloat(pitchSlider.value);
              const speedMult = 1.0 + (pitchVal - 50) / 500;

              const osc = tCtx.createOscillator();
              const gain = tCtx.createGain();
              osc.type = genres[activeTrack] === 'chiptune' ? 'square' : 'triangle';
              osc.frequency.setValueAtTime(root * speedMult, now);
              
              gain.gain.setValueAtTime(0.015, now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + stepSec * 3);
              
              osc.connect(gain);
              gain.connect(tCtx.destination);
              osc.start(now);
              osc.stop(now + stepSec * 3.2);
            }

            // Casual arpeggio sparkle
            if (beat % 2 === 0 && Math.random() > 0.4) {
              const chord = chords[bar];
              const note = chord[Math.floor(Math.random() * chord.length)];
              const pitchVal = parseFloat(pitchSlider.value);
              const speedMult = 1.0 + (pitchVal - 50) / 500;

              const osc = tCtx.createOscillator();
              const gain = tCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(note * 2 * speedMult, now);
              gain.gain.setValueAtTime(0.012, now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + stepSec * 0.9);
              osc.connect(gain);
              gain.connect(tCtx.destination);
              osc.start(now);
              osc.stop(now + stepSec * 1.0);
            }

            step++;
          }, stepSec * 1000);
        }

        function startVinylStatic() {
          try {
            if (!tCtx) tCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (tStatic) return;

            const bufferSize = tCtx.sampleRate * 2;
            const buffer = tCtx.createBuffer(1, bufferSize, tCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for(let i=0; i<bufferSize; i++) {
              data[i] = (Math.random() * 2 - 1) * 0.05;
            }

            tStatic = tCtx.createBufferSource();
            tStatic.buffer = buffer;
            tStatic.loop = true;

            const filter = tCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 500;

            const gain = tCtx.createGain();
            gain.gain.value = 0.04;

            tStatic.connect(filter);
            filter.connect(gain);
            gain.connect(tCtx.destination);
            tStatic.start();
          } catch(e){}
        }

        function stopVinylStatic() {
          if (tStatic) {
            try { tStatic.stop(); } catch(e){}
            tStatic = null;
          }
          if (tLoopTimer) {
            clearInterval(tLoopTimer);
            tLoopTimer = null;
          }
        }

        arm.addEventListener('click', () => {
          playVinylClick();
          isVinylPlaying = !isVinylPlaying;
          if (isVinylPlaying) {
            arm.style.transform = "rotate(18deg)";
            vinyl.classList.add('animate-[spin_4s_linear_infinite]');
            showNotification("💿 Puntina appoggiata! Avvio riproduzione del disco analogico.");
            syncSequencer();
          } else {
            arm.style.transform = "rotate(-10deg)";
            vinyl.classList.remove('animate-[spin_4s_linear_infinite]');
            showNotification("💿 Puntina sollevata.");
            stopVinylStatic();
          }
        });

        speedBtn.addEventListener('click', () => {
          playVinylClick();
          const speeds = ['33', '45', '78'];
          let currentIdx = speeds.indexOf(vinylSpeed);
          vinylSpeed = speeds[(currentIdx + 1) % speeds.length];
          speedBtn.textContent = vinylSpeed;
          
          let duration = "4s";
          if (vinylSpeed === '45') duration = "2.5s";
          if (vinylSpeed === '78') duration = "1.5s";
          vinyl.style.animationDuration = duration;

          showNotification("Giri motore vinile impostati a " + vinylSpeed + " RPM.");
          if (isVinylPlaying) syncSequencer();
        });

        trackBtn.addEventListener('click', () => {
          playVinylClick();
          activeTrack = (activeTrack + 1) % genres.length;
          trackBtn.textContent = 'TR. ' + String.fromCharCode(65 + activeTrack);
          showNotification("Traccia selezionata cambiata: " + genres[activeTrack].toUpperCase());
          if (isVinylPlaying) syncSequencer();
        });

        pitchSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          const percent = ((val - 50) / 10).toFixed(1);
          pitchDisplay.textContent = (val > 50 ? '+' : '') + percent + '%';
        });

        document.body.addEventListener('click', () => {
          if (!tCtx) tCtx = new (window.AudioContext || window.webkitAudioContext)();
          if (isVinylPlaying && !tLoopTimer) syncSequencer();
        }, { once: true });
      `;
      break;

    case 'jukebox': {
      let songsCardsHtml = '';
      RETRO_SONGS.forEach((song, idx) => {
        songsCardsHtml += `
          <button onclick="playJkTrack(${idx})" class="jk-card text-[8px] bg-stone-950 hover:bg-stone-850 p-1.5 rounded font-bold text-left text-orange-400 border border-stone-800 focus:border-amber-500 flex justify-between cursor-pointer w-full">
            <span class="truncate block max-w-[110px]">${idx + 1}. ${song.title}</span>
            <span>▶</span>
          </button>
        `;
      });

      deviceMarkup = `
        <div class="h-full flex flex-col justify-between items-center p-6 bg-[#210c04]/10 rounded select-none relative" style="min-height: 440px;">
          
          <!-- Neon rainbow tubes surrounding border -->
          <div id="neon-tubes" class="absolute inset-1 border-[10px] border-transparent pointer-events-none rounded-t-[5.5rem] opacity-90 transition-all duration-500 shadow-lg animate-pulse" style="background-image: linear-gradient(180deg, #ec4899 0%, #06b6d4 50%, #eab308 100%);"></div>

          <!-- Upper plaque grid -->
          <div class="w-40 h-10 bg-zinc-800 border border-zinc-700 rounded-b mt-4 flex flex-col justify-center items-center z-10 shadow">
            <span class="text-[9px] font-black tracking-widest text-amber-500 uppercase">${device.brand || 'WURLITZER-ROYAL'}</span>
            <div class="h-0.5 bg-amber-400 w-16 mt-0.5"></div>
          </div>

          <!-- Hidden native audio tag for streaming real MP3 sound -->
          <audio id="jukebox-audio" class="hidden" preload="auto"></audio>

          <!-- Songs selections card drawer -->
          <div class="w-full bg-stone-900 border-4 border-stone-800 rounded-xl p-3 my-4 flex flex-col justify-between z-10 shadow-inner overflow-hidden relative">
            <div class="text-[8px] font-mono text-amber-500 border-b border-stone-950 pb-1 flex justify-between font-bold uppercase tracking-wider mb-2">
              <span>📀 SCHEDA SELEZIONE CANZONI 📀</span>
              <span id="jk-label" class="blinking">IN ATTESA..</span>
            </div>

            <!-- List box -->
            <div class="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              ${songsCardsHtml}
            </div>
            
            <!-- Play queue indicators & Tactile Deck -->
            <div class="mt-3 pt-2 border-t border-amber-950/40 flex justify-between items-center font-mono select-none">
              <span class="text-[8px] text-stone-550 uppercase">Brano: <strong id="jk-active-song" class="text-amber-500">Nessuno</strong></span>
              <div class="flex gap-1.5 shrink-0 z-10">
                <button id="coin-slot-btn" class="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 border border-stone-950 px-2 py-0.5 text-white text-[7.5px] font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer active:translate-y-0.5 shadow">🪙 MONETA</button>
                <button onclick="cycleNeonCombo()" class="bg-stone-700 hover:bg-stone-600 border border-stone-950 px-2.5 py-0.5 text-amber-400 text-[7.5px] font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer active:translate-y-0.5 shadow">🌈 NEON</button>
                <button id="stop-slot-btn" onclick="stopJk()" class="bg-red-650 hover:bg-red-550 border border-stone-900 px-2 py-0.5 text-white text-[7.5px] font-black tracking-wider uppercase flex items-center gap-1 shadow cursor-pointer active:translate-y-0.5 rounded-none">■ SPEGNI</button>
              </div>
            </div>
          </div>
        </div>
      `;
      interactiveScripts = `
        const neonBorder = document.getElementById('neon-tubes');
        const jkLabel = document.getElementById('jk-label');
        const activeSongDisplay = document.getElementById('jk-active-song');
        const coinBtn = document.getElementById('coin-slot-btn');
        const audioEl = document.getElementById('jukebox-audio');

        let isNeonFlashing = 0;
        let activeJkGenre = null;
        let isPlayingJk = false;

        let jkCtx = null;
        let jkSequenceTimer = null;
        let neonCombo = "${device.jukeboxNeonCombo || 'cyber-neon'}";

        const tracks = ${JSON.stringify(
          RETRO_SONGS.map((s) => ({
            name: s.title,
            genre: s.genre,
            streamUrl: s.streamUrl,
          }))
        )};

        // Animate Neon color shifting dynamically over CSS variables
        setInterval(() => {
          isNeonFlashing = (isNeonFlashing + 4) % 360;
          if (neonBorder) {
            if (neonCombo === "sunset-orange") {
              neonBorder.style.backgroundImage = "linear-gradient(" + isNeonFlashing + "deg, #f97316 0%, #ef4444 50%, #eab308 100%)";
            } else if (neonCombo === "cyber-neon") {
              neonBorder.style.backgroundImage = "linear-gradient(" + isNeonFlashing + "deg, #06b6d4 0%, #ec4899 50%, #3b82f6 100%)";
            } else {
              // classic rainbow
              neonBorder.style.backgroundImage = "linear-gradient(" + isNeonFlashing + "deg, #ef4444 0%, #eab308 33%, #10b981 66%, #3b82f6 100%)";
            }
          }
        }, 50);

        function playSoundJk(freq, dur=0.08, type='sine') {
          try {
            if (!jkCtx) jkCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = jkCtx.createOscillator();
            const gain = jkCtx.createGain();
            osc.connect(gain);
            gain.connect(jkCtx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, jkCtx.currentTime);
            gain.gain.setValueAtTime(0.04, jkCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, jkCtx.currentTime + dur);
            osc.start();
            osc.stop(jkCtx.currentTime + dur);
          } catch(e){}
        }

        coinBtn.addEventListener('click', () => {
          playSoundJk(2000, 0.15, 'triangle');
          setTimeout(() => playSoundJk(1500, 0.08, 'sine'), 100);
          showNotification("🪙 Moneta caricata nel Jukebox!");
        });

        window.cycleNeonCombo = function() {
          playSoundJk(1000, 0.04);
          if (neonCombo === 'classic-rainbow') {
            neonCombo = 'cyber-neon';
          } else if (neonCombo === 'cyber-neon') {
            neonCombo = 'sunset-orange';
          } else {
            neonCombo = 'classic-rainbow';
          }
          showNotification("🎨 Stile luci Neon cambiato in: " + neonCombo);
        };

        window.stopJk = function() {
          if (jkSequenceTimer) {
            clearInterval(jkSequenceTimer);
            jkSequenceTimer = null;
          }
          if (audioEl) {
            audioEl.pause();
          }
          isPlayingJk = false;
          activeSongDisplay.textContent = "Nessuno";
          jkLabel.textContent = "SPENTO";
          
          // Reset highlights
          const cards = document.querySelectorAll('.jk-card');
          cards.forEach((card) => {
            card.classList.remove('bg-amber-950/40', 'border-amber-500', 'text-amber-400');
            card.classList.add('bg-stone-950', 'text-orange-400');
          });

          showNotification("■ Musica Jukebox spenta.");
        };

        window.playJkTrack = function(trackIndex) {
          if (!jkCtx) jkCtx = new (window.AudioContext || window.webkitAudioContext)();
          playSoundJk(800, 0.05);

          const track = tracks[trackIndex];
          activeJkGenre = track.genre;
          activeSongDisplay.textContent = track.name;
          jkLabel.textContent = "ATTIVO..";
          isPlayingJk = true;

          // Highlight active button/card representing selection
          const cards = document.querySelectorAll('.jk-card');
          cards.forEach((card, idx) => {
            if (idx === trackIndex) {
              card.className = "jk-card text-[8px] bg-amber-950/40 border-amber-500 text-amber-400 font-bold p-1.5 rounded font-bold text-left border focus:border-amber-500 flex justify-between cursor-pointer w-full";
            } else {
              card.className = "jk-card text-[8px] bg-stone-950 hover:bg-stone-850 text-stone-300 border-stone-800 p-1.5 rounded font-bold text-left border focus:border-amber-500 flex justify-between cursor-pointer w-full";
            }
          });

          showNotification("▶ Riproduzione brano: " + track.name);

          // Play high fidelity MP3 audio track loop
          if (audioEl) {
            audioEl.src = "${device.customAudioUrl || ''}" || track.streamUrl;
            audioEl.volume = 0.45;
            audioEl.currentTime = 0;
            audioEl.play().catch(err => {
              showNotification("🔊 Clicca sulla pagina per sbloccare l'audio se bloccato dal browser.");
            });
          }

          startJkSynth();
        };

        function startJkSynth() {
          if (jkSequenceTimer) clearInterval(jkSequenceTimer);
          let step = 0;
          const tempo = activeJkGenre === 'lofi' ? 80 : activeJkGenre === 'chiptune' ? 140 : 120;
          const stepSec = 60 / tempo / 2;

          const prog = [
            [261.63, 329.63, 392.00], // C
            [196.00, 246.94, 293.66], // G
            [220.00, 261.63, 329.63], // Am
            [174.61, 220.00, 261.63]  // F
          ];

          jkSequenceTimer = setInterval(() => {
            if (!jkCtx) return;
            const now = jkCtx.currentTime;
            const bar = Math.floor(step / 16) % 4;
            const beat = step % 16;

            if (beat % 4 === 0) {
              const root = prog[bar][0];
              const osc = jkCtx.createOscillator();
              const gain = jkCtx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(root / 2, now);
              gain.gain.setValueAtTime(0.012, now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + stepSec * 3.5);
              osc.connect(gain);
              gain.connect(jkCtx.destination);
              osc.start(now);
              osc.stop(now + stepSec * 3.8);
            }

            if (beat % 2 === 0 && Math.random() > 0.3) {
              const base = prog[bar][Math.floor(Math.random() * 3)];
              const osc = jkCtx.createOscillator();
              const gain = jkCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(base * 2, now);
              gain.gain.setValueAtTime(0.006, now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + stepSec * 0.9);
              osc.connect(gain);
              gain.connect(jkCtx.destination);
              osc.start(now);
              osc.stop(now + stepSec * 1.0);
            }

            step++;
          }, stepSec * 1000);
        }
      `;
      break;
    }

    case 'pc':
      deviceMarkup = `
        <div class="flex flex-col h-full justify-between p-4">
          <!-- Beige monitor display -->
          <div class="bg-stone-300 border-4 border-stone-400 rounded-2xl p-3 flex flex-col justify-between shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)]">
            <div id="pc-screen" class="w-full min-h-[220px] rounded p-2.5 font-mono text-[9.5px] border-2 flex flex-col justify-between selection:bg-stone-750/50 relative overflow-hidden" style="background-color: #0b130e; text-shadow: 0 0 5px currentColor;">
              
              <!-- CRT scan line overlays -->
              <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-25"></div>
              <div class="absolute inset-0 pointer-events-none z-30" style="background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%); background-size: 100% 4px;"></div>

              <!-- Terminal view element -->
              <div id="pc-terminal-view" class="w-full h-full flex flex-col justify-between grow">
                <!-- History Output -->
                <div id="pc-terminal-log" class="grow flex flex-col justify-end overflow-hidden max-h-[140px] select-none leading-relaxed">
                  <div>VINTAGE PC SYSTEM BIOS V5.10</div>
                  <div>RAM CONFIGURED OK: 640KB BASE MEMORY</div>
                  <div id="pc-floppy-line">FLOPPY DISK DRIVE A: VUOTO</div>
                  <div>FILESYSTEM BOOT: LOCAL CASING DISK C: ACTIVE</div>
                  <div class="text-[8px] opacity-75">Digita 'EDIT' per aprire l'editor di testo o 'HELP'!</div>
                  <div>---------------------------------------</div>
                </div>

                <!-- Input interactive row -->
                <div class="flex items-center text-[10px] border-t border-white/10 pt-1 mt-1 font-bold shrink-0">
                  <span>C:\\>&nbsp;</span>
                  <span id="pc-caret-text" class="text-white"></span>
                  <span class="animate-pulse bg-white text-transparent inline-block w-1.5 h-3.5 ml-0.5">_</span>
                </div>
              </div>

              <!-- Blue Text Editor View EDIT.EXE overlay (Hidden by default) -->
              <div id="pc-editor-view" class="absolute inset-2 bg-stone-200 border-2 border-stone-600 rounded p-2 font-mono text-xs hidden flex-col justify-between text-neutral-900 shadow-2xl z-40 select-text">
                <div class="flex justify-between items-center bg-blue-900 text-stone-100 p-1 rounded-t text-[8px] font-black uppercase">
                  <span>📝 DOS EDIT.RXT (TEXT EDITOR)</span>
                  <button onclick="closePcEditor()" class="px-1 text-white bg-red-650 hover:bg-red-500 rounded font-bold font-mono cursor-pointer">X</button>
                </div>
                <textarea id="pc-editor-textarea" class="grow bg-blue-950 text-yellow-300 font-mono text-[9.5px] p-2 mt-1 rounded resize-none border border-blue-900 outline-none focus:ring-1 focus:ring-yellow-400 leading-normal" placeholder="Scrivi qui il tuo codice o note..."></textarea>
                <div class="flex gap-2 justify-end mt-1 shrink-0">
                  <span class="text-[7.5px] text-zinc-650 font-bold self-center mr-auto">FILE: UTENTE.TXT</span>
                  <button onclick="newEditorFile()" class="px-2 py-0.5 bg-stone-300 hover:bg-stone-400 text-[8px] border border-stone-500 rounded font-black cursor-pointer shadow active:translate-y-px">NUOVO</button>
                  <button onclick="saveEditorFile()" class="px-2 py-0.5 bg-emerald-650 hover:bg-emerald-550 text-[8px] text-white rounded font-black cursor-pointer shadow active:translate-y-px">SALVA</button>
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom micro controls & floppy drawer -->
          <div class="flex items-center justify-between bg-stone-200 border-2 border-stone-400 p-2 rounded-xl mt-3 select-none">
            <!-- Floppy insert slot -->
            <div class="flex items-center gap-2">
              <button id="pc-insert-floppy" class="px-1.5 py-0.5 text-[8px] bg-stone-700 hover:bg-stone-600 border border-stone-800 text-stone-200 font-bold shadow active:translate-y-0.5 cursor-pointer">💾 FLOPPY</button>
              <div id="floppy-led" class="w-1.5 h-1.5 rounded-full bg-stone-800"></div>
            </div>

            <!-- Virtual keys keyboard mockup row -->
            <div class="flex gap-1 items-center">
              <button onclick="pcTypeChar('E')" class="w-5 h-5 bg-stone-100 hover:bg-white text-[9px] font-black border border-stone-400 rounded active:translate-y-px cursor-pointer flex items-center justify-center">E</button>
              <button onclick="pcTypeChar('D')" class="w-5 h-5 bg-stone-100 hover:bg-white text-[9px] font-black border border-stone-400 rounded active:translate-y-px cursor-pointer flex items-center justify-center">D</button>
              <button onclick="pcTypeChar('I')" class="w-5 h-5 bg-stone-100 hover:bg-white text-[9px] font-black border border-stone-400 rounded active:translate-y-px cursor-pointer flex items-center justify-center">I</button>
              <button onclick="pcTypeChar('T')" class="w-5 h-5 bg-stone-100 hover:bg-white text-[9px] font-black border border-stone-400 rounded active:translate-y-px cursor-pointer flex items-center justify-center">T</button>
              <button onclick="pcEnterKey()" class="px-1.5 h-5 bg-amber-400 hover:bg-amber-300 text-[8px] font-black border border-stone-900 rounded active:translate-y-px cursor-pointer flex items-center justify-center uppercase">INVIO</button>
            </div>

            <!-- Red PC Switch button -->
            <button id="pc-power-toggle" class="w-7 h-7 rounded-full bg-red-650 hover:bg-red-550 border-2 border-stone-900 active:scale-95 shadow flex items-center justify-center cursor-pointer"></button>
          </div>
        </div>
      `;
      interactiveScripts = `
        const pcScreen = document.getElementById('pc-screen');
        const pcLog = document.getElementById('pc-terminal-log');
        const caretText = document.getElementById('pc-caret-text');
        const powerToggle = document.getElementById('pc-power-toggle');
        const floppyBtn = document.getElementById('pc-insert-floppy');
        const floppyLed = document.getElementById('floppy-led');
        const floppyLine = document.getElementById('pc-floppy-line');

        // Editor layout hooks
        const pcTerminalView = document.getElementById('pc-terminal-view');
        const pcEditorView = document.getElementById('pc-editor-view');
        const pcEditorTextarea = document.getElementById('pc-editor-textarea');

        let pcOn = true;
        let command = "";
        let floppyIn = false;
        let pcCtx = null;

        const colors = {
          green: { term: "#10b981", border: "#064e3b", bg: "#02120b" },
          amber: { term: "#f59e0b", border: "#78350f", bg: "#1f0901" },
          cyan: { term: "#22d3ee", border: "#115e59", bg: "#011615" },
          white: { term: "#f3f4f6", border: "#374151", bg: "#0f172a" }
        };

        const configColor = "${device.pcTerminalColor || 'green'}";
        pcScreen.style.color = colors[configColor].term;
        pcScreen.style.backgroundColor = colors[configColor].bg;
        pcScreen.style.borderColor = colors[configColor].border;

        function playKeySound(freq, dur=0.015) {
          try {
            if (!pcCtx) pcCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = pcCtx.createOscillator();
            const gain = pcCtx.createGain();
            osc.connect(gain);
            gain.connect(pcCtx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, pcCtx.currentTime);
            gain.gain.setValueAtTime(0.04, pcCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, pcCtx.currentTime + dur);
            osc.start();
            osc.stop(pcCtx.currentTime + dur);
          } catch(e){}
        }

        window.pcTypeChar = function(char) {
          if (!pcOn) return;
          playKeySound(800 + Math.random() * 300);
          command += char;
          caretText.textContent = command;
        };

        window.openPcEditor = function() {
          playKeySound(700, 0.08);
          setTimeout(() => playKeySound(1000, 0.08), 85);
          pcTerminalView.classList.add('hidden');
          pcEditorView.classList.remove('hidden');
          showNotification("📝 DOS EDIT.EXE: editor caricato.");
        };

        window.closePcEditor = function() {
          playKeySound(500, 0.1);
          pcEditorView.classList.add('hidden');
          pcTerminalView.classList.remove('hidden');
          showNotification("🖥️ Ritorno al prompt DOS.");
        };

        window.newEditorFile = function() {
          playKeySound(900, 0.05);
          pcEditorTextarea.value = "";
          showNotification("📄 Aperto nuovo file vuoto.");
        };

        window.saveEditorFile = function() {
          playKeySound(1200, 0.1);
          setTimeout(() => playKeySound(1500, 0.1), 100);
          showNotification("💾 File salvato su C:\\\\UTENTE.TXT!");
        };

        window.pcEnterKey = function() {
          if (!pcOn) return;
          playKeySound(500, 0.05);
          
          let response = "COMANDO NON CORRETTO. DIGITA 'HELP' O 'EDIT'";
          const lowerCmd = command.trim().toLowerCase();

          if (lowerCmd === "help") {
            response = "COMANDI DISPONIBILI: HELP, EDIT, CLS, RUN, PLAY";
          } else if (lowerCmd === "edit") {
            command = "";
            caretText.textContent = "";
            openPcEditor();
            return;
          } else if (lowerCmd === "cls") {
            pcLog.innerHTML = "";
            command = "";
            caretText.textContent = "";
            return;
          } else if (lowerCmd === "run") {
            response = "ESECUZIONE RETRO_SYS TERMINATA CON SUCCESSO!";
          } else if (lowerCmd === "play") {
            playKeySound(523.25, 0.12);
            setTimeout(() => playKeySound(659.25, 0.12), 100);
            setTimeout(() => playKeySound(783.99, 0.2), 200);
            response = "ALTOPARLANTE PC SYSTEM: EMISSIONE TONO OK.";
          }

          const newLine = document.createElement('div');
          newLine.innerHTML = "C:\\\\>" + command + " <br/> " + response;
          pcLog.appendChild(newLine);
          
          command = "";
          caretText.textContent = "";
          pcLog.scrollTop = pcLog.scrollHeight;
        };

        floppyBtn.addEventListener('click', () => {
          floppyIn = !floppyIn;
          playKeySound(300, 0.2);
          if (floppyIn) {
            floppyBtn.textContent = "💾 ESPELLI";
            floppyLed.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse";
            floppyLine.textContent = "FLOPPY DRIVE: DISCHETTO CARICATO [EDIT.RXT]";
            showNotification("💾 Floppy disk caricato correttamente!");
          } else {
            floppyBtn.textContent = "💾 FLOPPY";
            floppyLed.className = "w-1.5 h-1.5 rounded-full bg-stone-800";
            floppyLine.textContent = "FLOPPY DRIVE: VUOTO";
            showNotification("💾 Floppy rimosso.");
          }
        });

        powerToggle.addEventListener('click', () => {
          pcOn = !pcOn;
          playKeySound(150, 0.1);
          if (pcOn) {
            pcScreen.style.opacity = "1";
            powerToggle.classList.remove('bg-stone-500');
            powerToggle.classList.add('bg-red-600');
            showNotification("🖥️ BIOS vintage avviato.");
          } else {
            pcScreen.style.opacity = "0";
            pcEditorView.classList.add('hidden');
            pcTerminalView.classList.remove('hidden');
            powerToggle.classList.remove('bg-red-650');
            powerToggle.classList.add('bg-stone-500');
            showNotification("🖥️ Spegnimento PC terminato.");
          }
        });
      `;
      break;

    case 'playstation':
      deviceMarkup = `
        <div class="grid grid-cols-1 md:grid-cols-2 h-full w-full gap-5 p-4 select-none">
          <!-- Left Column: Retro Console grey casing -->
          <div class="flex flex-col justify-between bg-stone-300 border-2 border-stone-400 p-4 rounded-2xl shadow-inner relative select-none">
            <!-- Top lid circles -->
            <div class="flex-1 flex justify-center items-center relative my-1 z-10">
              <!-- CD Lid door -->
              <div id="ps-lid" class="w-40 h-40 rounded-full bg-black/5 border-2 border-stone-400 flex items-center justify-center relative shadow-inner">
                <!-- SONY PS1 Closed Lid Visual overlay -->
                <div id="ps-closed-cover" class="absolute inset-1 rounded-full bg-stone-300 border border-stone-400/65 flex flex-col items-center justify-center shadow-md select-none cursor-pointer z-15" onclick="togglePsLid()">
                  <div class="flex flex-col items-center justify-center">
                    <div class="text-4xl font-extrabold text-stone-500 font-mono scale-x-125 select-none leading-8 relative">
                      <span class="text-red-500">P</span>
                      <span class="text-blue-600">S</span>
                    </div>
                    <span class="text-[7.5px] text-stone-600 font-black tracking-[0.34em] mt-1 pr-1.5">PlayStation</span>
                  </div>
                </div>

                <!-- CD Spindle lens background (visible when open) -->
                <div id="ps-lens-view" class="absolute inset-1 rounded-full bg-stone-900 flex flex-col justify-center items-center shadow-inner text-white select-none z-5 hidden">
                  <div class="w-14 h-14 rounded-full bg-stone-950 border-2 border-stone-850 shadow-md flex items-center justify-center relative">
                    <div class="w-5 h-5 rounded-full bg-stone-800 border border-zinc-400 flex items-center justify-center">
                      <div class="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                  </div>
                  <span class="text-[5px] text-zinc-500 font-mono mt-1 select-none">LASER LENS READ</span>
                </div>
                
                <!-- Disc inside CD deck (placed on spindle, swap-clickable when open) -->
                <div id="ps-disc" onclick="cyclePsDisc()" class="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500 via-orange-600 to-stone-900 border-2 border-stone-950 flex flex-col justify-center items-center shadow-lg cursor-pointer hover:rotate-12 duration-500 z-10 hidden">
                  <div class="w-12 h-12 rounded-full border border-stone-800/80 bg-stone-900/40 flex items-center justify-center">
                    <div class="w-8 h-8 rounded-full border-2 border-stone-950 bg-black/10"></div>
                  </div>
                  <span class="text-disc-label text-[6.5px] font-mono tracking-widest text-white/95 mt-1 uppercase">🟠 CRASH</span>
                  <span class="text-disc-sublabel text-[5px] text-zinc-400 font-mono font-bold uppercase">BANDICOOT</span>
                </div>
              </div>
            </div>

            <!-- Controller front plates ports -->
            <div class="flex gap-4 h-6 items-center justify-center my-3 select-none">
              <div class="w-14 h-4 bg-stone-400/80 border border-stone-500 rounded flex items-center justify-around px-1 shadow-inner">
                <span class="text-[5px] text-stone-600 font-mono">P1</span>
                <div class="w-3 h-2 bg-stone-950 rounded-sm"></div>
              </div>
              <div class="w-14 h-4 bg-stone-400/80 border border-stone-500 rounded flex items-center justify-around px-1 shadow-inner">
                <span class="text-[5px] text-stone-600 font-mono">P2</span>
                <div class="w-3 h-2 bg-stone-950 rounded-sm"></div>
              </div>
            </div>

            <!-- Bottom trigger buttons deck -->
            <div class="flex justify-between items-center bg-stone-250 border border-stone-350 p-2 rounded-xl">
              <!-- Left switch power -->
              <div class="flex items-center gap-1.5">
                <button id="ps-power-btn" class="w-10 h-10 rounded-full bg-stone-200 hover:bg-stone-100 border-2 border-stone-700 font-black text-[8px] shadow active:translate-y-px cursor-pointer flex items-center justify-center uppercase">ON/OFF</button>
                <div id="ps-power-led" class="w-2.5 h-2.5 rounded-full bg-stone-800"></div>
              </div>

              <!-- CD Lid open button -->
              <div class="flex items-center gap-1 font-bold font-mono text-[8px]">
                <button id="ps-open-btn" class="px-2 py-1.5 text-stone-200 bg-stone-700 hover:bg-stone-600 border border-stone-800 shadow cursor-pointer uppercase">OPEN</button>
                <button id="ps-reset-btn" class="w-8 h-8 rounded-full bg-stone-500 hover:bg-stone-400 text-[6.5px] border border-stone-600 cursor-pointer uppercase flex items-center justify-center">RST</button>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Screen CRT monitor & Inputs -->
          <div class="flex flex-col justify-between bg-zinc-900 border-2 border-zinc-950 p-4 rounded-2xl shadow-2xl relative select-none">
            <!-- CRT Screen bezel outer container -->
            <div class="grow border-4 border-black bg-neutral-900 p-2 rounded-xl relative min-h-[180px] flex flex-col justify-center items-center shadow-inner overflow-hidden">
              
              <!-- CRT Screen tube glass simulation -->
              <div class="w-full h-full bg-[#1e2a1e] border border-neutral-850 rounded-lg relative overflow-hidden flex flex-col justify-center items-center p-2" id="ps-screen">
                <div class="absolute inset-0 bg-emerald-950 pointer-events-none opacity-40 animate-pulse" id="ps-bg-glow"></div>
                <!-- Glare reflection effect -->
                <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-25"></div>
                <!-- Scanlines -->
                <div class="absolute inset-0 pointer-events-none z-30" style="background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%), linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03)); background-size: 100% 4px, 6px 100%;"></div>

                <!-- Live Iframe slot -->
                <div id="ps-iframe-container" class="absolute inset-0 z-20 hidden">
                  <iframe id="ps-frame" src="${device.customVideoUrl || ''}" class="w-full h-full border-none" allow="autoplay; encrypted-media; picture-in-picture; gamepad" referrerPolicy="no-referrer"></iframe>
                </div>

                <!-- CRT monoscope signal screen -->
                <div class="z-20 text-center text-[#7cfc00] font-mono leading-tight tracking-wider" id="ps-status-screen">
                  <div class="text-2xl font-black italic block animate-pulse border border-[#7cfc00] px-2 py-1 rounded bg-black/60">PS1 CRT OUT</div>
                  <div class="text-[8px] mt-2 font-black">RESOLUTION: 320x240</div>
                  <div class="text-[7px] mt-1 text-red-500 font-extrabold uppercase animate-pulse">● NO SIGNAL (ACCENDI PSX)</div>
                </div>
              </div>
            </div>

            <!-- Paste Game URL / Iframe configuration box -->
            <div class="mt-3 p-2.5 rounded-xl flex flex-col gap-1 w-full select-none z-10 font-sans" style="background-color: rgba(9, 9, 11, 0.8) !important; border: 1px solid #27272a !important;">
              <span class="text-[8px] font-mono text-stone-300 font-bold uppercase">🎮 Carica Gioco Real-Time (Iframe URL):</span>
              <div class="flex gap-2">
                <input type="text" id="ps-custom-url" placeholder="Incolla link emulatore o gioco HTML5..." value="${device.customVideoUrl || ''}" class="text-[9px] text-zinc-300 font-mono rounded px-2 py-0.5 w-full focus:outline-none focus:border-red-500 placeholder-zinc-700" style="background-color: #0c0a09 !important; border: 1px solid #2e2a24 !important; color: #e7e5e4 !important;" />
                <button id="ps-custom-load-btn" class="px-2 py-0.5 bg-[#F27D26] hover:bg-orange-600 text-[8px] font-mono font-bold text-white rounded cursor-pointer shrink-0">VAI</button>
              </div>
            </div>
          </div>
        </div>
      `;
      interactiveScripts = `
        const psLid = document.getElementById('ps-lid');
        const psLens = document.getElementById('ps-lens-view');
        const psDisc = document.getElementById('ps-disc');
        const psClosedCover = document.getElementById('ps-closed-cover');
        const psPowerBtn = document.getElementById('ps-power-btn');
        const psPowerLed = document.getElementById('ps-power-led');
        const psResetBtn = document.getElementById('ps-reset-btn');
        const psOpenBtn = document.getElementById('ps-open-btn');

        const psScreen = document.getElementById('ps-screen');
        const psStatusScreen = document.getElementById('ps-status-screen');
        const psIframeContainer = document.getElementById('ps-iframe-container');
        const psFrame = document.getElementById('ps-frame');
        const psCustomUrl = document.getElementById('ps-custom-url');
        const psCustomLoadBtn = document.getElementById('ps-custom-load-btn');

        let isPsPowered = false;
        let isPsLidOpen = ${device.psLidOpen ? 'true' : 'false'};
        let psCtx = null;
        let activeDisc = "${device.psDiscType || 'crash'}";

        const discGradients = {
          crash: "from-amber-500 via-orange-600 to-stone-900",
          spyro: "from-indigo-600 via-purple-700 to-indigo-900",
          resident: "from-red-650 via-rose-850 to-stone-900",
          tomb_raider: "from-teal-600 via-emerald-800 to-stone-900"
        };
        const discLabels = {
          crash: "🟠 CRASH BANDICOOT",
          spyro: "🟣 SPYRO THE DRAGON",
          resident: "🔴 RESIDENT EVIL",
          tomb_raider: "🟢 TOMB RAIDER"
        };

        function initPsLidVisuals() {
          if (isPsLidOpen) {
            if (psClosedCover) psClosedCover.classList.add('hidden');
            if (psLens) psLens.classList.remove('hidden');
            if (psDisc) {
              psDisc.classList.remove('hidden');
              if (isPsPowered) {
                psDisc.classList.add('animate-[spin_2s_linear_infinite]');
              } else {
                psDisc.classList.remove('animate-[spin_2s_linear_infinite]');
              }
            }
          } else {
            if (psClosedCover) psClosedCover.classList.remove('hidden');
            if (psLens) psLens.classList.add('hidden');
            if (psDisc) {
              psDisc.classList.add('hidden');
              psDisc.classList.remove('animate-[spin_2s_linear_infinite]');
            }
          }
          updatePsScreenSignal();
        }

        // Set initial color based on chosen disc at export
        if (psDisc) {
          psDisc.className = "absolute w-36 h-36 rounded-full bg-gradient-to-tr " + (discGradients[activeDisc] || discGradients.crash) + " border-2 border-stone-950 flex flex-col justify-center items-center cursor-pointer shadow-lg hover:rotate-12 duration-500 z-10 hidden";
          const labelPart = (discLabels[activeDisc] || discLabels.crash).split(' ');
          psDisc.querySelector('.text-disc-label').textContent = labelPart[0] + ' ' + labelPart[1];
          psDisc.querySelector('.text-disc-sublabel').textContent = labelPart.slice(2).join(' ') || '';
        }

        window.togglePsLid = function() {
          isPsLidOpen = !isPsLidOpen;
          playPsClick(330);
          initPsLidVisuals();
          if (isPsLidOpen) {
            showNotification("🔌 Coperchio CD aperto. Sacco CD pronto!");
          } else {
            showNotification("🔌 Coperchio CD chiuso.");
          }
        }

        window.cyclePsDisc = function() {
          if (!isPsLidOpen) {
            showNotification("⚠️ Apri il coperchio OPEN per cambiare CD Rom!");
            playPsClick(210);
            return;
          }
          playPsClick(800);
          if (activeDisc === 'crash') activeDisc = 'spyro';
          else if (activeDisc === 'spyro') activeDisc = 'resident';
          else if (activeDisc === 'resident') activeDisc = 'tomb_raider';
          else activeDisc = 'crash';

          // Update physical disk visual appearance when open
          psDisc.className = "absolute w-36 h-36 rounded-full bg-gradient-to-tr " + discGradients[activeDisc] + " border-2 border-stone-950 flex flex-col justify-center items-center cursor-pointer shadow-lg hover:rotate-12 duration-500 z-10";
          const labelPart = discLabels[activeDisc].split(' ');
          psDisc.querySelector('.text-disc-label').textContent = labelPart[0] + ' ' + labelPart[1];
          psDisc.querySelector('.text-disc-sublabel').textContent = labelPart.slice(2).join(' ') || '';

          showNotification("💿 Inserito CD PlayStation: " + discLabels[activeDisc]);
          updatePsScreenSignal();
        };

        function runPsBootTone() {
          try {
            if (!psCtx) psCtx = new (window.AudioContext || window.webkitAudioContext)();
            const now = psCtx.currentTime;
            
            // Sub rumble bass
            const oscA = psCtx.createOscillator();
            const gainA = psCtx.createGain();
            oscA.type = 'sawtooth';
            oscA.frequency.setValueAtTime(55, now);
            oscA.frequency.linearRampToValueAtTime(41.2, now + 5.0);
            
            gainA.gain.setValueAtTime(0.001, now);
            gainA.gain.linearRampToValueAtTime(0.08, now + 1.2);
            gainA.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
            
            const lowpass = psCtx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.setValueAtTime(110, now);

            oscA.connect(lowpass);
            lowpass.connect(gainA);
            gainA.connect(psCtx.destination);
            oscA.start();
            oscA.stop(now + 5.0);

            // Shimmering chord (A2, C#3, E3, A4)
            const freqs = [110, 138.61, 164.81, 440];
            freqs.forEach(f => {
              const osc = psCtx.createOscillator();
              const gain = psCtx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(f, now);
              gain.gain.setValueAtTime(0.001, now);
              gain.gain.linearRampToValueAtTime(0.015, now + 1.5);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
              osc.connect(gain);
              gain.connect(psCtx.destination);
              osc.start();
              osc.stop(now + 5.0);
            });
          } catch(e){}
        }

        function playPsClick(freq=400) {
          try {
            if (!psCtx) psCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = psCtx.createOscillator();
            const gain = psCtx.createGain();
            osc.connect(gain);
            gain.connect(psCtx.destination);
            osc.frequency.setValueAtTime(freq, psCtx.currentTime);
            gain.gain.setValueAtTime(0.02, psCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, psCtx.currentTime + 0.1);
            osc.start();
            osc.stop(psCtx.currentTime + 0.1);
          } catch(e){}
        }

        function renderPsMiniGame() {
          if (activeDisc === 'crash') {
            psStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center select-none font-sans">
                <span class="text-3xl animate-bounce mb-1">🦊</span>
                <span class="text-orange-400 font-black text-xs tracking-wider uppercase">Crash Odyssey</span>
                <p class="text-[7.5px] text-zinc-400 mt-1">Sintonizzazione CD avvenuta con successo</p>
                <div class="flex gap-1.5 mt-2">
                  <button onclick="playPsChime(450, 'sine')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border-2 border-neutral-700 text-[6.5px] text-orange-200 font-mono rounded cursor-pointer leading-none">SALTO</button>
                  <button onclick="playPsChime(900, 'square')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border-2 border-neutral-700 text-[6.5px] text-orange-200 font-mono rounded cursor-pointer leading-none">GIRA</button>
                </div>
              </div>
            \`;
          } else if (activeDisc === 'spyro') {
            psStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center select-none font-sans">
                <span class="text-3xl animate-pulse mb-1">🍇</span>
                <span class="text-purple-400 font-black text-xs tracking-wider uppercase">Spyro Realms Mini</span>
                <p class="text-[7.5px] text-zinc-400 mt-1">Sintonizzazione CD avvenuta con successo</p>
                <div class="flex gap-1.5 mt-2">
                  <button onclick="playPsChime(780, 'triangle')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border-2 border-neutral-700 text-[6.5px] text-purple-200 font-mono rounded cursor-pointer leading-none">VOLO</button>
                </div>
              </div>
            \`;
          } else if (activeDisc === 'resident') {
            psStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center text-center select-none font-sans">
                <span class="text-3xl mb-1 mt-1">☣️</span>
                <span class="text-red-500 font-black text-xs tracking-wider uppercase leading-none">Biohazard Survival</span>
                <p class="text-[7.5px] text-stone-500 mt-1">Salva alla macchina da scrivere vintage!</p>
                <button onclick="playPsChime(250, 'sawtooth')" class="px-2 py-0.5 bg-red-950/40 border border-red-850 text-[6.5px] text-red-350 rounded font-bold cursor-pointer mt-1 leading-none">SALVA PARTITA</button>
              </div>
            \`;
          } else if (activeDisc === 'tomb_raider') {
            psStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center select-none font-sans">
                <span class="text-3xl mb-1">🏜️</span>
                <span class="text-cyan-400 font-black text-xs tracking-wider uppercase">Tomb Explorer</span>
                <p class="text-[7.5px] text-zinc-400 mt-1">Sintonizzazione CD avvenuta con successo</p>
                <div class="flex gap-1.5 mt-2">
                  <button onclick="playPsChime(620, 'sine')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-800 border-2 border-neutral-700 text-[6.5px] text-cyan-200 font-mono rounded cursor-pointer leading-none">AZIONE [X]</button>
                </div>
              </div>
            \`;
          }
        }

        window.playPsChime = function(freq, type) {
          try {
            if (!psCtx) psCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = psCtx.createOscillator();
            const gain = psCtx.createGain();
            osc.connect(gain);
            gain.connect(psCtx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, psCtx.currentTime);
            gain.gain.setValueAtTime(0.04, psCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, psCtx.currentTime + 0.15);
            osc.start();
            osc.stop(psCtx.currentTime + 0.15);
          } catch(e){}
        };

        function updatePsScreenSignal() {
          if (!isPsPowered) {
            psIframeContainer.classList.add('hidden');
            psStatusScreen.classList.remove('hidden');
            psStatusScreen.innerHTML = \`
              <div class="text-2xl font-black italic block border border-[#7cfc00] px-2 py-1 rounded bg-black/60">PS1 CRT OUT</div>
              <div class="text-[8px] mt-2 font-black">RESOLUTION: 320x240</div>
              <div class="text-[7.5px] mt-1 text-red-500 font-extrabold uppercase animate-pulse">● NO SIGNAL (ACCENDI PSX)</div>
            \`;
            return;
          }

          if (isPsLidOpen) {
            psIframeContainer.classList.add('hidden');
            psStatusScreen.classList.remove('hidden');
            psStatusScreen.innerHTML = \`
              <div class="text-2xl font-black italic block text-amber-500 border border-amber-500 px-2 py-1 rounded bg-black/60">LID OPEN</div>
              <div class="text-[8.5px] mt-2 font-black text-amber-500">PLEASE CLOSE LID TO BOOT DISC</div>
            \`;
            return;
          }

          if (psCustomUrl.value.trim() !== '') {
            psIframeContainer.classList.remove('hidden');
            psStatusScreen.classList.add('hidden');
            psFrame.src = psCustomUrl.value.trim();
          } else {
            psIframeContainer.classList.add('hidden');
            psStatusScreen.classList.remove('hidden');
            renderPsMiniGame();
          }
        }

        psPowerBtn.addEventListener('click', () => {
          isPsPowered = !isPsPowered;
          playPsClick(120);
          if (isPsPowered) {
            psPowerLed.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]";
            showNotification("🎮 PlayStation accesa! Segnale video inviato al monitor.");
            runPsBootTone();
          } else {
            psPowerLed.className = "w-2.5 h-2.5 rounded-full bg-stone-800";
            showNotification("🎮 PlayStation spenta.");
          }
          initPsLidVisuals();
        });

        psResetBtn.addEventListener('click', () => {
          if (!isPsPowered) return;
          playPsClick(200);
          showNotification("🔄 Reset console.");
          runPsBootTone();
          updatePsScreenSignal();
        });

        psOpenBtn.addEventListener('click', () => {
          isPsLidOpen = !isPsLidOpen;
          playPsClick(330);
          initPsLidVisuals();
          if (isPsLidOpen) {
            showNotification("🔌 Coperchio CD aperto. Sacco CD pronto!");
          } else {
            showNotification("🔌 Coperchio CD chiuso.");
          }
        });

        psCustomLoadBtn.addEventListener('click', () => {
          playPsClick(600);
          updatePsScreenSignal();
          if (isPsPowered) {
            showNotification("🔌 Gioco caricato sulla console!");
          } else {
            showNotification("⚠️ Ricordati di accendere la PlayStation per vedere il gioco!");
          }
        });

        // Initial launch & sync
        initPsLidVisuals();
      `;
      break;

    case 'gamecube':
      deviceMarkup = `
        <div class="grid grid-cols-1 md:grid-cols-2 h-full w-full gap-5 p-4 select-none">
          <!-- Left Column: Indigo GameCube physical console hardware -->
          <div class="flex flex-col justify-between bg-indigo-900 border-2 border-indigo-950 p-4 rounded-3xl shadow-2xl relative select-none">
            <!-- Carry strap accent -->
            <div class="absolute top-0 inset-x-12 h-3.5 bg-neutral-950 rounded-b shadow-md"></div>

            <div class="flex-1 flex justify-center items-center my-2">
              <!-- Circular disc slot casing door -->
              <div id="gc-lid" class="w-40 h-40 rounded-full border-2 border-indigo-950 bg-black/10 flex items-center justify-center relative shadow-inner select-none p-1">
                <div id="gc-disc-view" class="absolute inset-1 rounded-full bg-stone-900 p-2 flex flex-col justify-center items-center shadow-inner text-white hidden">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-800 via-indigo-700 to-stone-950 border-2 border-stone-950 flex flex-col justify-center items-center shadow-md cursor-pointer hover:scale-105 transition-transform" onclick="cycleGcCd()">
                    <div class="w-2.5 h-2.5 bg-black rounded-full border border-zinc-650"></div>
                  </div>
                  <span class="text-[6px] font-mono font-bold tracking-tight text-white mt-1 uppercase">NINTENDO MINI DVD</span>
                  <span id="gc-cd-label" class="text-[5.5px] font-mono text-zinc-350 bg-black/40 px-1 rounded mt-0.5">SMASH MELEE</span>
                </div>

                <!-- Top glossy Jewel Plate -->
                <button id="gc-jewel-badge" class="w-20 h-20 rounded-full bg-stone-950 border-2 border-stone-850 flex items-center justify-center shadow-lg hover:scale-105 duration-300 relative cursor-pointer">
                  <!-- Reflections overlay -->
                  <div class="absolute inset-1 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                  
                  <div class="flex flex-col items-center">
                    <div class="w-6 h-6 border-2 border-indigo-400 rounded rotate-45 flex items-center justify-center">
                      <div class="w-2 h-2 bg-indigo-500 rounded"></div>
                    </div>
                    <span class="text-[5.5px] text-zinc-300 font-black mt-1 tracking-widest leading-3 uppercase">GAMECUBE</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Controller front plates ports -->
            <div class="bg-stone-300 border border-stone-400 rounded-xl px-2 py-2 flex flex-col gap-1.5 select-none w-full shadow-md">
              <div class="flex justify-around items-center w-full shadow-inner py-1 bg-stone-900/15 rounded">
                <div class="w-5 h-5 rounded-full bg-stone-900 border border-stone-400 flex items-center justify-center relative shadow-md">
                  <div class="w-3 h-2 bg-stone-950 border border-zinc-700 rounded-b-sm"></div>
                  <div class="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 border border-orange-600 rounded-full animate-ping"></div>
                </div>
                <div class="w-5 h-5 rounded-full bg-stone-900 border border-stone-400 flex items-center justify-center relative"><div class="w-3 h-2 bg-stone-950 border border-zinc-700 rounded-b-sm"></div></div>
                <div class="w-5 h-5 rounded-full bg-stone-900 border border-stone-400 flex items-center justify-center relative"><div class="w-3 h-2 bg-stone-950 border border-zinc-700 rounded-b-sm"></div></div>
                <div class="w-5 h-5 rounded-full bg-stone-900 border border-stone-400 flex items-center justify-center relative"><div class="w-3 h-2 bg-stone-950 border border-zinc-700 rounded-b-sm"></div></div>
              </div>

              <!-- Standard mechanical round triggers -->
              <div class="flex justify-between items-center px-1 text-[7px] font-mono">
                <div class="flex gap-1.5 items-center">
                  <button id="gc-power-btn" class="w-9 h-6 bg-red-650 border border-black hover:bg-red-750 text-white text-[7.5px] font-bold select-none cursor-pointer uppercase shadow">POWER</button>
                  <div id="gc-led" class="w-2.5 h-2.5 rounded-full bg-stone-850"></div>
                </div>
                <button id="gc-open-btn" class="px-2 py-1 text-stone-200 bg-stone-700 hover:bg-stone-600 border border-stone-800 text-[7px] font-mono font-bold shadow cursor-pointer uppercase">OPEN</button>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Gaming CRT Monitor & Inputs -->
          <div class="flex flex-col justify-between bg-zinc-900 border-2 border-zinc-950 p-4 rounded-3xl shadow-2xl relative select-none">
            <!-- CRT Screen bezel outer container -->
            <div class="grow border-4 border-black bg-neutral-900 p-2 rounded-xl relative min-h-[180px] flex flex-col justify-center items-center shadow-inner overflow-hidden">
              
              <!-- CRT Screen tube glass simulation -->
              <div class="w-full h-full bg-[#1e2a1e] border border-neutral-850 rounded-lg relative overflow-hidden flex flex-col justify-center items-center p-2" id="gc-screen">
                <div class="absolute inset-0 bg-violet-950 pointer-events-none opacity-40 animate-pulse" id="gc-bg-glow"></div>
                <!-- Glare reflection effect -->
                <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-25"></div>
                <!-- Scanlines -->
                <div class="absolute inset-0 pointer-events-none z-30" style="background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%), linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03)); background-size: 100% 4px, 6px 100%;"></div>

                <!-- Live Iframe slot -->
                <div id="gc-iframe-container" class="absolute inset-0 z-20 hidden">
                  <iframe id="gc-frame" src="${device.customVideoUrl || ''}" class="w-full h-full border-none" allow="autoplay; encrypted-media; picture-in-picture; gamepad" referrerPolicy="no-referrer"></iframe>
                </div>

                <!-- CRT monoscope signal screen -->
                <div class="z-20 text-center text-[#7cfc00] font-mono leading-tight tracking-wider" id="gc-status-screen">
                  <div class="text-2xl font-black italic block animate-pulse border border-[#7cfc00] px-2 py-1 rounded bg-black/60">GC CRT OUT</div>
                  <div class="text-[8px] mt-2 font-black">RESOLUTION: 640x480</div>
                  <div class="text-[7px] mt-1 text-red-500 font-extrabold uppercase animate-pulse">● NO SIGNAL (ACCENDI GAMECUBE)</div>
                </div>
              </div>
            </div>

            <!-- Paste Game URL / Iframe configuration box -->
            <div class="mt-3 p-2.5 rounded-xl flex flex-col gap-1 w-full select-none z-10 font-sans" style="background-color: rgba(9, 9, 11, 0.8) !important; border: 1px solid #27272a !important;">
              <span class="text-[8px] font-mono text-stone-300 font-bold uppercase">🎮 Carica Gioco Real-Time (Iframe URL):</span>
              <div class="flex gap-2">
                <input type="text" id="gc-custom-url" placeholder="Incolla link emulatore o gioco HTML5..." value="${device.customVideoUrl || ''}" class="text-[9px] text-zinc-300 font-mono rounded px-2 py-0.5 w-full focus:outline-none focus:border-red-500 placeholder-zinc-700" style="background-color: #0c0a09 !important; border: 1px solid #2e2a24 !important; color: #e7e5e4 !important;" />
                <button id="gc-custom-load-btn" class="px-2 py-0.5 bg-[#F27D26] hover:bg-orange-600 text-[8px] font-mono font-bold text-white rounded cursor-pointer shrink-0">VAI</button>
              </div>
            </div>
          </div>
        </div>
      `;
      interactiveScripts = `
        const gcLid = document.getElementById('gc-lid');
        const gcDisc = document.getElementById('gc-disc-view');
        const gcBadge = document.getElementById('gc-jewel-badge');
        const gcPowerBtn = document.getElementById('gc-power-btn');
        const gcOpenBtn = document.getElementById('gc-open-btn');
        const gcLed = document.getElementById('gc-led');
        const gcCdLabel = document.getElementById('gc-cd-label');

        const gcScreen = document.getElementById('gc-screen');
        const gcStatusScreen = document.getElementById('gc-status-screen');
        const gcIframeContainer = document.getElementById('gc-iframe-container');
        const gcFrame = document.getElementById('gc-frame');
        const gcCustomUrl = document.getElementById('gc-custom-url');
        const gcCustomLoadBtn = document.getElementById('gc-custom-load-btn');

        let isGcPowered = false;
        let isGcLidOpen = false;
        let gcCtx = null;
        let activeCdIdx = 0;
        const gameCds = ["Smash Melee", "Zelda Wind Waker", "Mario Sunshine", "Metroid Prime"];

        function playGcClick(freq=500) {
          try {
            if (!gcCtx) gcCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = gcCtx.createOscillator();
            const gain = gcCtx.createGain();
            osc.connect(gain);
            gain.connect(gcCtx.destination);
            osc.frequency.setValueAtTime(freq, gcCtx.currentTime);
            gain.gain.setValueAtTime(0.02, gcCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, gcCtx.currentTime + 0.1);
            osc.start();
            osc.stop(gcCtx.currentTime + 0.1);
          } catch(e){}
        }

        function runGcBootJingle() {
          try {
            if (!gcCtx) gcCtx = new (window.AudioContext || window.webkitAudioContext)();
            const now = gcCtx.currentTime;

            const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            scale.forEach((freq, index) => {
              const start = now + index * 0.08;
              const osc = gcCtx.createOscillator();
              const gain = gcCtx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, start);
              gain.gain.setValueAtTime(0.02, start);
              gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
              
              osc.connect(gain);
              gain.connect(gcCtx.destination);
              osc.start(start);
              osc.stop(start + 0.1);
            });

            setTimeout(() => {
              playGcClick(1174.66);
              setTimeout(() => playGcClick(1567.98), 80);
            }, 600);
          } catch(e){}
        }

        function renderGcMiniGame() {
          const game = gameCds[activeCdIdx];
          if (game === "Smash Melee") {
            gcStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center select-none font-sans">
                <span class="text-3xl animate-bounce mb-1">🥊</span>
                <span class="text-yellow-400 font-black text-xs tracking-wider uppercase">Super Smash Melee</span>
                <p class="text-[7.5px] text-zinc-400 mt-1">Stadio Combattimento Sintonizzato</p>
                <div class="flex gap-1.5 mt-2">
                  <button onclick="playGcChime(500, 'square')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-850 border border-neutral-700 text-[6.5px] text-yellow-350 rounded cursor-pointer font-mono font-bold leading-none">ATTACCO [A]</button>
                  <button onclick="playGcChime(300, 'sine')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-850 border border-neutral-700 text-[6.5px] text-yellow-350 rounded cursor-pointer font-mono font-bold leading-none">SCHIVA [R]</button>
                </div>
              </div>
            \`;
          } else if (game === "Zelda Wind Waker") {
            gcStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center select-none font-sans">
                <span class="text-3xl animate-pulse mb-1">⛵</span>
                <span class="text-cyan-400 font-black text-xs tracking-wider uppercase">Zelda: Wind Waker</span>
                <p class="text-[7.5px] text-zinc-400 mt-1">La Corrente del Destino ti chiama!</p>
                <div class="flex gap-1.5 mt-2">
                  <button onclick="playGcChime(880, 'sine')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-850 border border-neutral-700 text-[6.5px] text-cyan-350 rounded cursor-pointer font-mono font-bold leading-none">SPADA [B]</button>
                  <button onclick="playGcChime(1300, 'triangle')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-850 border border-neutral-700 text-[6.5px] text-cyan-350 rounded cursor-pointer font-mono font-bold leading-none">SUONA VENTO [Y]</button>
                </div>
              </div>
            \`;
          } else if (game === "Mario Sunshine") {
            gcStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center select-none font-sans">
                <span class="text-3xl animate-bounce mb-1">☀️</span>
                <span class="text-amber-500 font-black text-xs tracking-wider uppercase">Mario Sunshine</span>
                <p class="text-[7.5px] text-zinc-400 mt-1">Splac 3000 Caricato al 100%</p>
                <div class="flex gap-1.5 mt-2">
                  <button onclick="playGcChime(660, 'sine')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-850 border border-neutral-700 text-[6.5px] text-amber-200 rounded cursor-pointer font-mono font-bold leading-none">SPRUZZO [X]</button>
                  <button onclick="playGcChime(1100, 'square')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-850 border border-neutral-700 text-[6.5px] text-amber-200 rounded cursor-pointer font-mono font-bold leading-none">SALTRA [A]</button>
                </div>
              </div>
            \`;
          } else if (game === "Metroid Prime") {
            gcStatusScreen.innerHTML = \`
              <div class="flex flex-col items-center select-none font-sans">
                <span class="text-3xl animate-pulse mb-1">👾</span>
                <span class="text-purple-400 font-black text-xs tracking-wider uppercase">Metroid Prime</span>
                <p class="text-[7.5px] text-zinc-400 mt-1">Tuta Energia Gravità Attiva</p>
                <div class="flex gap-1.5 mt-2">
                  <button onclick="playGcChime(400, 'sawtooth')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-855 border border-neutral-700 text-[6.5px] text-purple-200 rounded cursor-pointer font-mono font-bold leading-none">SPARA [B]</button>
                  <button onclick="playGcChime(950, 'sawtooth')" class="px-2 py-0.5 bg-neutral-850 hover:bg-neutral-855 border border-neutral-700 text-[6.5px] text-purple-200 rounded cursor-pointer font-mono font-bold leading-none">SCANNER [X]</button>
                </div>
              </div>
            \`;
          }
        }

        window.playGcChime = function(freq, type) {
          try {
            if (!gcCtx) gcCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = gcCtx.createOscillator();
            const gain = gcCtx.createGain();
            osc.connect(gain);
            gain.connect(gcCtx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, gcCtx.currentTime);
            gain.gain.setValueAtTime(0.04, gcCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, gcCtx.currentTime + 0.12);
            osc.start();
            osc.stop(gcCtx.currentTime + 0.12);
          } catch(e){}
        };

        function updateGcScreenSignal() {
          if (!isGcPowered) {
            gcIframeContainer.classList.add('hidden');
            gcStatusScreen.classList.remove('hidden');
            gcStatusScreen.innerHTML = \`
              <div class="text-2xl font-black italic block border border-[#7cfc00] px-2 py-1 rounded bg-black/60">GC CRT OUT</div>
              <div class="text-[8px] mt-2 font-black">RESOLUTION: 640x480</div>
              <div class="text-[7px] mt-1 text-red-500 font-extrabold uppercase animate-pulse">● NO SIGNAL (ACCENDI GAMECUBE)</div>
            \`;
            return;
          }

          if (isGcLidOpen) {
            gcIframeContainer.classList.add('hidden');
            gcStatusScreen.classList.remove('hidden');
            gcStatusScreen.innerHTML = \`
              <div class="text-2xl font-black italic block text-amber-500 border border-amber-500 px-2 py-1 rounded bg-black/60">LID OPEN</div>
              <div class="text-[8.5px] mt-2 font-black text-amber-500">PLEASE CLOSE LID TO INSERT DISC</div>
            \`;
            return;
          }

          if (gcCustomUrl.value.trim() !== '') {
            gcIframeContainer.classList.remove('hidden');
            gcStatusScreen.classList.add('hidden');
            gcFrame.src = gcCustomUrl.value.trim();
          } else {
            gcIframeContainer.classList.add('hidden');
            gcStatusScreen.classList.remove('hidden');
            renderGcMiniGame();
          }
        }

        gcPowerBtn.addEventListener('click', () => {
          isGcPowered = !isGcPowered;
          playGcClick(100);
          if (isGcPowered) {
            gcLed.className = "w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]";
            showNotification("🎮 GameCube accesa! Cascade chiptune avviato.");
            runGcBootJingle();
          } else {
            gcLed.className = "w-2.5 h-2.5 rounded-full bg-stone-850";
            showNotification("🎮 GameCube spenta.");
          }
          updateGcScreenSignal();
        });

        gcOpenBtn.addEventListener('click', () => {
          isGcLidOpen = !isGcLidOpen;
          playGcClick(350);
          if (isGcLidOpen) {
            gcBadge.classList.add('hidden');
            gcDisc.classList.remove('hidden');
            showNotification("🚪 Coperchio Mini-DVD aperto.");
          } else {
            gcDisc.classList.add('hidden');
            gcBadge.classList.remove('hidden');
            showNotification("🚪 Coperchio Mini-DVD chiuso.");
          }
          updateGcScreenSignal();
        });

        gcCustomLoadBtn.addEventListener('click', () => {
          playGcClick(600);
          updateGcScreenSignal();
          if (isGcPowered) {
            showNotification("🔌 Gioco caricato sulla console!");
          } else {
            showNotification("⚠️ Ricordati di accendere il GameCube per vedere il gioco!");
          }
        });

        window.cycleGcCd = function() {
          if (!isGcLidOpen) return;
          playGcClick(900);
          activeCdIdx = (activeCdIdx + 1) % gameCds.length;
          gcCdLabel.textContent = gameCds[activeCdIdx];
          showNotification("💿 Mini DVD inserito: " + gameCds[activeCdIdx]);
          updateGcScreenSignal();
        };

        // Initial launch
        updateGcScreenSignal();
      `;
      break;

    default: // Fallback generic console mockup design
      deviceMarkup = `
        <div class="flex flex-col h-full justify-between p-6">
          <div class="flex justify-between items-center border-b pb-2 border-black/10">
            <h3 class="font-mono text-sm font-black text-[#141414] tracking-tight uppercase">${device.name}</h3>
            <span class="text-[9px] font-mono font-black text-black/50 tracking-wider">${device.brand || 'RETRO-SYSTEM'}</span>
          </div>

          <div class="grow flex flex-col justify-center items-center text-center py-6">
            <div class="text-4xl animate-bounce mb-3">📟</div>
            <div class="bg-black/5 p-4 rounded border-2 border-dashed border-black/20 w-full">
              <span class="text-xs font-mono text-black/80 inline-block font-bold">MODELLO: ${(device.type as string).toUpperCase()}</span>
              <p class="text-[10px] text-black/60 font-mono mt-1">Sintonizzatori analogici, colorazione d'epoca, sticker originali sbloccati.</p>
            </div>
          </div>

          <div class="flex gap-3 justify-center pt-4 border-t border-black/10">
            <button id="generic-trigger-btn" class="bg-[#F27D26] hover:bg-orange-600 text-white font-mono text-[10px] font-black border-2 border-black px-4 py-1.5 rounded-none shadow-[2px_2px_0px_#141414] active:translate-x-0.5 active:translate-y-0.5 tracking-wider">PREMI PER SUONARE</button>
          </div>
        </div>
      `;
      interactiveScripts = `
        const actionBtn = document.getElementById('generic-trigger-btn');
        let audioCtx2 = null;

        if (actionBtn) {
          actionBtn.addEventListener('click', () => {
            try {
              if (!audioCtx2) audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx2.createOscillator();
              const gain = audioCtx2.createGain();
              osc.connect(gain);
              gain.connect(audioCtx2.destination);
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(440, audioCtx2.currentTime);
              osc.frequency.linearRampToValueAtTime(880, audioCtx2.currentTime + 0.1);
              gain.gain.setValueAtTime(0.05, audioCtx2.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx2.currentTime + 0.12);
              osc.start();
              osc.stop(audioCtx2.currentTime + 0.12);
              showNotification("🎵 Nota sintonizzata suonata!");
            } catch(e){}
          });
        }
      `;
      break;
  }

  // Pure HTML sticker tag
  let stickerHtml = '';
  if (selectedSticker) {
    stickerHtml = `
      <div 
        id="draggable-sticker"
        class="absolute select-none transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto filter drop-shadow-md cursor-grab active:cursor-grabbing hover:scale-105 z-30"
        style="left: ${stickerX}%; top: ${stickerY}%;"
        title="Trascina questo adesivo ovunque sul dispositivo!"
      >
        <div class="relative bg-white border-2 border-[#141414] p-1 rounded-full shadow-lg flex items-center justify-center w-12 h-12 hover:rotate-6 transition-transform">
          <span class="text-3xl">${selectedSticker.emoji}</span>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${device.name} - Retro Device Vanilla Edition</title>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700;900&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    /* Styling elements specific to vintage textures */
    .wood-grain {
      background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px);
    }
    .blinking {
      animation: blinker 1.5s linear infinite;
    }
    @keyframes blinker {
      50% { opacity: 0; }
    }
    .bg-retro-panel {
      background-color: #E4E3E0;
    }
    .text-retro-black {
      color: #141414;
    }
    .border-retro-black {
      border-color: #141414;
    }
    /* Simple scale down on small portrait viewports to prevent clipping math */
    @media (max-width: 440px) {
      #wrapper-main {
        transform: scale(0.85);
      }
    }
    @media (max-width: 375px) {
      #wrapper-main {
        transform: scale(0.75);
      }
    }
  </style>
</head>
<body class="bg-[#141414] bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] text-stone-900 font-sans min-h-screen flex items-center justify-center p-4 md:p-8 antialiased overflow-x-hidden overflow-y-auto">

  <!-- Interactive workbench canvas area centering solely the Retro Device -->
  <main id="wrapper-main" class="w-full ${wrapperMaxWidthClass} flex justify-center items-center">
    
    <!-- Inside Vintage Shell casing container -->
    <div 
      id="device-body"
      class="${containerDimensionsClass} relative ${device.type === 'playstation' || device.type === 'gamecube' || device.type === 'pc' || device.type === 'jukebox' || device.type === 'tv' ? 'overflow-visible md:overflow-hidden' : 'overflow-hidden'} flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-transform duration-300"
      style="${shellStyle}"
    >
      <!-- Overlay grain and wear patterns -->
      <div class="absolute inset-0 wood-grain pointer-events-none opacity-10"></div>
      ${wearOverlayHtml}

      <!-- Drag & Drop sticker layer inside casing -->
      <div id="device-screen-overlay" class="absolute inset-0 pointer-events-none z-20">
        ${stickerHtml}
      </div>

      <!-- Generated Specific Device core elements - positioned responsive inside device-body -->
      <div class="${device.type === 'playstation' || device.type === 'gamecube' || device.type === 'pc' || device.type === 'jukebox' || device.type === 'tv' ? 'relative w-full h-full' : 'absolute inset-0'} z-10">
        ${deviceMarkup}
      </div>

    </div>

  </main>

  <!-- Core Javascript bindings inside exported page -->
  <script>
    // Global notification logging system
    function showNotification(msg) {
      console.log("📟 [Retro Device Event]:", msg);
    }

    // Active Draggable sticker handler bindings
    const sticker = document.getElementById('draggable-sticker');
    const container = document.getElementById('device-body');

    if (sticker && container) {
      let isDragging = false;
      
      sticker.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        sticker.classList.add('cursor-grabbing');
      });

      // Touch friendly support handles
      sticker.addEventListener('touchstart', (e) => {
        isDragging = true;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = container.getBoundingClientRect();
        
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;

        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        sticker.style.left = x + '%';
        sticker.style.top = y + '%';
      });

      window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length === 0) return;
        const rect = container.getBoundingClientRect();
        
        let x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        let y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;

        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        sticker.style.left = x + '%';
        sticker.style.top = y + '%';
      });

      const stopDrag = () => {
        if (isDragging) {
          isDragging = false;
          sticker.classList.remove('cursor-grabbing');
        }
      };

      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
    }

    // Embed specific action script hooks
    ${interactiveScripts}
  </script>
</body>
</html>`;
}

/**
 * Generates a dynamic HTML loader file.
 * This file fetches a JSON blueprint file from an external relative path or URL,
 * parses its properties dynamically, and renders the fully interactive vintage device inside the browser!
 */
export function generateVanillaLoaderHTML(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Caricatore Dinamico Retro Device (.json)</title>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700;900&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    .wood-grain {
      background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px);
    }
    .blinking {
      animation: blinker 1.5s linear infinite;
    }
    @keyframes blinker {
      50% { opacity: 0; }
    }
    .bg-retro-panel {
      background-color: #E4E3E0;
    }
    .text-retro-black {
      color: #141414;
    }
    .border-retro-black {
      border-color: #141414;
    }
  </style>
</head>
<body class="bg-stone-200 text-stone-900 font-sans min-h-screen flex flex-col justify-between overflow-x-hidden antialiased">

  <!-- Header Banner Area -->
  <header class="bg-stone-100 border-b-4 border-[#141414] p-4 sticky top-0 z-50 shadow-sm">
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🌐</span>
        <div>
          <h1 class="font-mono text-sm font-black tracking-tight text-retro-black uppercase">CARICATORE ESTERNO BLUOPRINT JSON</h1>
          <p class="text-[10px] font-mono text-retro-black/60 uppercase font-bold">CARICA GLI SCHEMI SITO TRADIZIONALE SENZA REACT / NPM</p>
        </div>
      </div>

      <!-- Live Path Control Configurator -->
      <div class="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto">
        <div class="flex">
          <span class="bg-[#141414] text-white font-mono text-[9px] font-bold px-2.5 flex items-center border-y-2 border-l-2 border-[#141414]">JSON PATH</span>
          <input 
            type="text" 
            id="json-file-url" 
            value="./retro_device_blueprint.json" 
            placeholder="percorso/o/url/schema.json" 
            class="bg-white border-2 border-[#141414] py-1 px-3 text-xs font-mono text-retro-black focus:outline-none min-w-[190px] w-full"
          />
        </div>
        <button onclick="caricaDispositivoDalServer()" class="bg-[#F27D26] hover:bg-orange-600 text-white font-mono text-xs font-black border-2 border-[#141414] px-4 py-1.5 shadow-[2px_2px_0px_#141414] active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap cursor-pointer">
          ⚙️ RICARICA BLUEPRINT
        </button>
      </div>
    </div>
  </header>

  <!-- Explanation alert about Local file access constraints -->
  <div class="max-w-4xl mx-auto w-full px-4 mt-6">
    <div class="bg-amber-100 border-2 border-amber-500 p-3.5 text-xs text-amber-900 font-mono flex items-start gap-3">
      <span class="text-xl">⚠️</span>
      <div>
        <strong>Nota importante sui permessi locali (CORS):</strong> I moderni browser bloccano le richieste <code>fetch()</code> locali quando la pagina viene aperta con un doppio click diretto dal tuo mouse (protocollo <code>file://</code>).
        Per caricare il file JSON esterno, apri questa cartella usando un server di sviluppo web locale (come l'estensione <strong>Live Server</strong> di VS Code, oppure digitando <code>npx http-server</code> nel terminale, o inserendola nel tuo hosting web).
      </div>
    </div>
  </div>

  <!-- Main interactive workbench canvas -->
  <main class="grow max-w-4xl mx-auto w-full p-4 flex flex-col items-center justify-center my-4">
    
    <!-- Render Container for the Device -->
    <div id="device-mount-point" class="w-full max-w-md bg-stone-100 p-2 border-4 border-retro-black shadow-[10px_10px_0px_#141414] relative rounded-md hidden">
      <!-- Injected Dynamically inside JavaScript -->
    </div>

    <!-- Fallback Screen when loading or error -->
    <div id="status-card" class="w-full max-w-md bg-white border-4 border-retro-black p-8 text-center shadow-[6px_6px_0px_#141414] font-mono">
      <span class="text-4xl animate-bounce inline-block mb-3">📡</span>
      <h3 class="text-sm font-black mb-2" id="status-line">In attesa del caricamento dello schema retro...</h3>
      <p class="text-[10.5px] text-stone-500 max-w-xs mx-auto leading-relaxed">
        Configura il percorso nel pannello ed avvia un server locale o trascina un file di blueprint se desideri ispezionarlo istantaneamente.
      </p>
      
      <!-- Direct drag and drop helper -->
      <div class="mt-6 border-2 border-dashed border-stone-300 p-4 rounded bg-stone-50 text-[10px]">
        O trascina e rilascia il file JSON direttamente qui per visualizzarlo istantaneamente offline!
        <input type="file" id="local-file-fallback" class="hidden" accept=".json" onchange="caricaFileLocaleFallback(this)"/>
        <button onclick="document.getElementById('local-file-fallback').click()" class="mt-2.5 block text-[9.5px] mx-auto bg-stone-200 border-2 border-stone-800 font-black px-3 py-1 hover:bg-stone-300">
          📂 CARICA ATTRAVERSO SFOGLIA FILE
        </button>
      </div>
    </div>

    <!-- Instruction helper dialog info -->
    <div class="mt-8 text-center max-w-md font-mono text-[10.5px] font-bold text-retro-black/80 leading-relaxed bg-[#E4E3E0] border-2 border-retro-black py-3 px-4 shadow-[3px_3px_0px_#141414]">
      * Questo file carica e interpreta gli schemi dinamici d'epoca (.json) generati dal workbench, configurando visual, sticker mobili e sintesi audio!
    </div>

  </main>

  <!-- Notification System Alert bottom popups -->
  <div id="notif-box" class="fixed bottom-4 right-4 pointer-events-none z-50 flex flex-col gap-2 max-w-xs font-mono"></div>

  <!-- Footer block links and licensing signatures -->
  <footer class="bg-stone-100 border-t-2 border-[#141414]/20 py-4 px-2 select-none text-center">
    <span class="text-[9.5px] font-mono text-retro-black/40 font-black tracking-widest uppercase">
      VINTAGE BLUEPRINT LOADER — TEMPLATE INTELLIGENTE AUTONOMO (.html)
    </span>
  </footer>

  <!-- Core dynamic loader engine -->
  <script>
    // Known stickers lookup table mapped in standard HTML
    const RETRO_STICKERS = [
      { id: 'smiley', name: 'Original Smiley', emoji: '😊' },
      { id: 'sun', name: 'Summer Sun', emoji: '☀️' },
      { id: 'invader', name: 'Space Invader', emoji: '👾' },
      { id: 'cassette', name: 'Cassette Tape', emoji: '📼' },
      { id: 'cherry', name: 'Retro Cherry', emoji: '🍒' },
      { id: 'skull', name: 'Classic Skull', emoji: '💀' },
      { id: 'star', name: 'Pixel Star', emoji: '⭐' },
      { id: 'ufo', name: 'Retro UFO', emoji: '🛸' }
    ];

    let currentAudioContext = null;
    let globalActiveGainNode = null;
    let globalLoopInterval = null;

    // Toast Notifications
    function showNotification(msg) {
      const box = document.getElementById('notif-box');
      const item = document.createElement('div');
      item.className = "bg-[#141414] text-white border-2 border-white/20 p-3 text-[10px] font-extrabold shadow-lg border-l-4 border-l-[#F27D26] animate-[bounce_0.3s_ease-out]";
      item.innerHTML = "🔔 " + msg;
      box.appendChild(item);
      setTimeout(() => {
        item.style.opacity = "0";
        setTimeout(() => item.remove(), 400);
      }, 3500);
    }

    // Load file fallback helper
    function caricaFileLocaleFallback(input) {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target.result);
          renderDynamicDevice(schema);
          showNotification("Successo: Schema locale caricato!");
        } catch (err) {
          alert("Impossibile interpretare il file JSON di schema selezionato.");
        }
      };
      reader.readAsText(file);
    }

    // Drag-and-drop file listener over body
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const inputMock = { files: [files[0]] };
        caricaFileLocaleFallback(inputMock);
      }
    });

    // Core dynamic HTML and sound engine renderer
    function renderDynamicDevice(device) {
      const parent = document.getElementById('device-mount-point');
      const statusCard = document.getElementById('status-card');

      // Setup audio cleaning to prevent background leak
      if (globalActiveGainNode) {
        try { globalActiveGainNode.gain.setValueAtTime(0, 0); } catch(e){}
      }
      if (globalLoopInterval) {
        clearInterval(globalLoopInterval);
      }

      parent.innerHTML = "";
      statusCard.classList.add('hidden');
      parent.classList.remove('hidden');

      // Styles
      let bodyStyle = \`background: \${device.primaryColor || '#a8a29e'};\`;
      if (device.bodyMaterial === 'wood') {
        bodyStyle = \`background: linear-gradient(135deg, #854d0e 0%, #713f12 50%, #451a03 100%);\`;
      } else if (device.bodyMaterial === 'metal') {
        bodyStyle = \`background: linear-gradient(145deg, #78716c 0%, #44403c 60%, rgba(100,100,100,0.3) 100%);\`;
      } else if (device.bodyMaterial === 'translucent') {
        bodyStyle = \`background: \${device.primaryColor || '#a8a29ebd'}eb; backdrop-filter: blur(10px); box-shadow: inset 0 0 20px rgba(255,255,255,0.25);\`;
      }

      // Wear and tear overlays HTML generator
      let wearHtml = "";
      if (device.wearLevel === 'used') {
        wearHtml = \`
          <svg class="absolute inset-0 w-full h-full opacity-40 pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="10" y1="10" x2="15" y2="25" stroke="#4a4a4a" stroke-width="0.3" stroke-linecap="round" />
            <line x1="80" y1="75" x2="85" y2="70" stroke="#4a4a4a" stroke-width="0.25" stroke-linecap="round" />
            <line x1="20" y1="85" x2="35" y2="88" stroke="#ffffff" stroke-width="0.2" stroke-linecap="round" />
          </svg>
        \`;
      } else if (device.wearLevel === 'scratched') {
        wearHtml = \`
          <svg class="absolute inset-0 w-full h-full opacity-70 pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="5" y1="12" x2="25" y2="22" stroke="#4a4a4a" stroke-width="0.5" stroke-linecap="round" />
            <line x1="25" y1="22" x2="20" y2="35" stroke="#4a4a4a" stroke-width="0.4" stroke-linecap="round" />
            <line x1="85" y1="10" x2="70" y2="35" stroke="#1c1c1c" stroke-width="0.5" stroke-linecap="round" />
            <line x1="12" y1="75" x2="45" y2="92" stroke="#2a2a2a" stroke-width="0.4" stroke-linecap="round" />
          </svg>
        \`;
      } else if (device.wearLevel === 'rusty') {
        wearHtml = \`
          <div class="absolute top-0 left-0 w-24 h-24 bg-radial from-amber-900/40 via-amber-800/10 to-transparent pointer-events-none blur-[4px] rounded-br-full z-10"></div>
          <div class="absolute bottom-0 right-0 w-32 h-32 bg-radial from-yellow-950/45 via-amber-900/15 to-transparent pointer-events-none blur-[8px] rounded-tl-full z-10"></div>
          <svg class="absolute inset-0 w-full h-full opacity-80 pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0,20 Q 5,22 10,18 T 15,25" fill="none" stroke="#78350f" stroke-width="0.6" />
            <path d="M 98,75 Q 92,72 90,82 T 82,85" fill="none" stroke="#78350f" stroke-width="0.7" />
          </svg>
        \`;
      }

      // Sticker markup
      let stickerHtml = "";
      const selectedSticker = RETRO_STICKERS.find(s => s.id === device.stickerId);
      if (selectedSticker) {
        const stkX = device.stickerX || 50;
        const stkY = device.stickerY || 50;
        stickerHtml = \`
          <div 
            id="draggable-sticker"
            class="absolute select-none transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto filter drop-shadow-md cursor-grab active:cursor-grabbing hover:scale-105 z-30"
            style="left: \${stkX}%; top: \${stkY}%;"
          >
            <div class="relative bg-white border-2 border-[#141414] p-1 rounded-full shadow-lg flex items-center justify-center w-12 h-12 hover:rotate-6 transition-transform">
              <span class="text-3xl">\${selectedSticker.emoji}</span>
              <button onclick="document.getElementById('draggable-sticker').remove()" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#A52A2A] border-2 border-[#141414] text-white rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer shadow">✕</button>
            </div>
          </div>
        \`;
      }

      // Setup body shell shell wrappers
      let shellHtml = \`
        <div 
          id="device-body"
          class="w-full min-h-[380px] border-4 border-retro-black rounded-lg relative overflow-hidden flex flex-col justify-between"
          style="\${bodyStyle}"
        >
          <div class="absolute inset-0 wood-grain pointer-events-none opacity-10"></div>
          \${wearHtml}
          <div id="sticker-container" class="absolute inset-0 pointer-events-none z-20">\${stickerHtml}</div>
          <div id="inner-panel" class="relative w-full h-full grow z-10 flex flex-col justify-between"></div>
        </div>
      \`;

      parent.innerHTML = shellHtml;

      const inner = document.getElementById('inner-panel');

      // Render interface based on device type
      if (device.type === 'radio') {
        const mHz = parseFloat(device.radioFrequency || 98.0);
        inner.innerHTML = \`
          <div class="flex flex-col h-full justify-between p-6">
            <div class="flex justify-between items-center mb-4">
              <span class="text-[11px] font-mono font-black text-black/60 bg-white/20 px-2.5 py-0.5 rounded border border-black/10 tracking-widest uppercase">\${device.brand || 'PHONOLA-Classic'}</span>
              <div class="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse border border-black shadow"></div>
            </div>

            <div class="bg-amber-950/20 border-2 border-black p-4 rounded mb-6 relative overflow-hidden backdrop-blur-xs flex flex-col justify-between">
              <div id="tuning-marker" class="absolute top-0 bottom-0 w-0.5 bg-red-600 shadow-[0_0_8px_#ef4444]" style="left: \${((mHz - 88) / 20) * 100}%"></div>
              <div class="flex justify-between text-[10px] font-mono font-black text-[#141414] select-none tracking-tight">
                <span>88 MHz</span>
                <span>96</span>
                <span>100</span>
                <span>108 MHz</span>
              </div>
              <div class="mt-2 text-center text-xs font-mono font-black py-0.5 px-2 bg-[#141414] text-[#F27D26] rounded border border-black inline-block self-center shadow-inner">
                SINTONIA: <span id="freq-display" class="text-amber-400 font-bold">\${mHz.toFixed(1)} MHz</span>
              </div>
            </div>

            <!-- Speaker Grill -->
            <div class="grow border-2 border-black bg-stone-900 rounded p-4 relative flex flex-col justify-center min-h-[90px] shadow-inner overflow-hidden">
              <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(#000 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%); background-size: 8px 8px; background-position: 0 0, 4px 4px;"></div>
              <div class="flex flex-col gap-1.5 h-full justify-around">
                <div class="h-1.5 bg-[#141414] rounded-full"></div>
                <div class="h-1.5 bg-[#141414] rounded-full"></div>
                <div class="h-1.5 bg-[#141414] rounded-full"></div>
              </div>
            </div>

            <!-- Bottom Knobs -->
            <div class="flex justify-around items-center gap-4 mt-6 pt-4 border-t-2 border-black/25">
              <div class="flex flex-col items-center">
                <div class="text-[9px] font-mono font-black mb-1 text-black/80">SINTONIA</div>
                <input type="range" id="tuning-knob" min="88" max="108" step="0.1" value="\${mHz}" class="w-16 accent-[#F27D26] cursor-pointer" />
              </div>
              <div class="flex flex-col items-center">
                <div class="text-[9px] font-mono font-black mb-1 text-black/80">VOLUME</div>
                <input type="range" id="volume-knob" min="0" max="100" value="70" class="w-16 accent-[#141414] cursor-pointer" />
              </div>
              <div class="flex flex-col items-center">
                <div class="text-[9px] font-mono font-black mb-1 text-black/80">SPINA</div>
                <button id="power-btn" class="w-10 h-10 rounded-full border-2 border-black bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs">O</button>
              </div>
            </div>
          </div>
        \`;

        // Bind interactive synth hooks
        const tuningKnob = document.getElementById('tuning-knob');
        const volumeKnob = document.getElementById('volume-knob');
        const powerBtn = document.getElementById('power-btn');
        const freqDisplay = document.getElementById('freq-display');
        const marker = document.getElementById('tuning-marker');

        let isPowerOn = true;
        let radioCtx = null;
        let carrierOsc = null;
        let pGain = null;

        function startRadioTone() {
          if (radioCtx) return;
          try {
            radioCtx = new (window.AudioContext || window.webkitAudioContext)();
            currentAudioContext = radioCtx;

            carrierOsc = radioCtx.createOscillator();
            carrierOsc.type = 'triangle';
            carrierOsc.frequency.setValueAtTime(120 + (tuningKnob.value - 88) * 16, radioCtx.currentTime);

            pGain = radioCtx.createGain();
            pGain.gain.setValueAtTime(volumeKnob.value / 400, radioCtx.currentTime);
            globalActiveGainNode = pGain;

            carrierOsc.connect(pGain);
            pGain.connect(radioCtx.destination);
            carrierOsc.start();
          } catch(e){}
        }

        tuningKnob.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          freqDisplay.textContent = val.toFixed(1) + ' MHz';
          marker.style.left = ((val - 88) / 20) * 100 + '%';
          if (carrierOsc && radioCtx) {
            carrierOsc.frequency.setValueAtTime(120 + (val - 88) * 16, radioCtx.currentTime);
          }
        });

        volumeKnob.addEventListener('input', (e) => {
          if (pGain && isPowerOn) {
            pGain.gain.setValueAtTime(e.target.value / 400, radioCtx.currentTime);
          }
        });

        powerBtn.addEventListener('click', () => {
          isPowerOn = !isPowerOn;
          if (isPowerOn) {
            powerBtn.className = "w-10 h-10 rounded-full border-2 border-black bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs";
            powerBtn.textContent = "O";
            if (pGain && radioCtx) pGain.gain.setValueAtTime(volumeKnob.value / 400, radioCtx.currentTime);
          } else {
            powerBtn.className = "w-10 h-10 rounded-full border-2 border-black bg-red-500 hover:bg-red-650 text-white font-black text-xs";
            powerBtn.textContent = "X";
            if (pGain) pGain.gain.setValueAtTime(0, radioCtx.currentTime);
          }
        });

        // Initialize audio on interactions
        document.body.addEventListener('click', startRadioTone, { once: true });

      } else if (device.type === 'gameboy') {
        inner.innerHTML = \`
          <div class="flex flex-col h-full justify-between p-4">
            <div class="bg-[#3b3b3b] p-3 rounded-t-lg rounded-b-xl border-2 border-black shadow-inner flex flex-col items-center">
              <div class="flex w-full px-2 justify-between items-center text-[7px] font-mono text-stone-400 font-bold mb-1 tracking-wider">
                <span>DOT MATRIX WITH STEREO SOUND</span>
                <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              </div>
              <div class="w-full bg-[#8b956d] border-4 border-black p-3 rounded min-h-[140px] shadow-inner select-none flex flex-col justify-between items-center text-[#0f380f] font-mono">
                <span class="text-[8px] font-extrabold uppercase py-0.5 border-b border-[#0f380f]">CRAFT BOY DYNAMIC</span>
                <div class="my-auto text-center">
                  <div class="text-lg font-black tracking-widest animate-pulse">GAME_PLAY</div>
                  <div class="text-[7.5px] mt-1">SBLOCCATO DA BLUEPRINT</div>
                </div>
                <div class="text-[8px] font-bold" id="gb-score">PUNTEGGIO: 1400</div>
              </div>
            </div>
            <div class="text-center font-bold text-xs font-serif my-2 text-black/50 italic tracking-widest">\${device.brand || 'VINTAGE-BOY'}</div>

            <!-- Lower controllers -->
            <div class="grid grid-cols-2 grow items-center gap-2 pt-2 pb-2">
              <div class="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div class="absolute w-20 h-7 bg-[#1a1a1a] border-2 border-black rounded flex justify-between px-1">
                  <button id="d-left" class="text-white text-[10px]">◀</button>
                  <button id="d-right" class="text-white text-[10px]">▶</button>
                </div>
                <div class="absolute w-7 h-20 bg-[#1a1a1a] border-2 border-black rounded pointer-events-none flex flex-col justify-between py-1 text-stone-500 text-[8px] text-center">
                  <span>▲</span>
                  <span>▼</span>
                </div>
                <button id="d-up" class="absolute top-1 w-6 h-6 hover:bg-white/10 z-20"></button>
                <button id="d-down" class="absolute bottom-1 w-6 h-6 hover:bg-white/10 z-20"></button>
              </div>

              <div class="flex rotate-[-12deg] gap-2.5 justify-center">
                <button id="gb-b" class="h-9 w-9 bg-[#a52a2a] hover:bg-red-800 border-2 border-black rounded-full font-black text-white text-xs shadow-md">B</button>
                <button id="gb-a" class="h-9 w-9 bg-[#a52a2a] hover:bg-red-800 border-2 border-black rounded-full font-black text-white text-xs shadow-md">A</button>
              </div>
            </div>
          </div>
        \`;

        let gameboyCtx = null;
        let points = 1400;

        function beepGb(freq) {
          try {
            if (!gameboyCtx) gameboyCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = gameboyCtx.createOscillator();
            const gain = gameboyCtx.createGain();
            osc.connect(gain);
            gain.connect(gameboyCtx.destination);
            osc.frequency.setValueAtTime(freq, gameboyCtx.currentTime);
            osc.type = 'square';
            gain.gain.setValueAtTime(0.04, gameboyCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, gameboyCtx.currentTime + 0.12);
            osc.start();
            osc.stop(gameboyCtx.currentTime + 0.12);
            points += 20;
            document.getElementById('gb-score').innerText = "PUNTEGGIO: " + points;
          } catch(e){}
        }

        document.getElementById('gb-a').addEventListener('click', () => beepGb(523.25));
        document.getElementById('gb-b').addEventListener('click', () => beepGb(587.33));
        document.getElementById('d-left').addEventListener('click', () => beepGb(329.63));
        document.getElementById('d-right').addEventListener('click', () => beepGb(349.23));
        document.getElementById('d-up').addEventListener('click', () => beepGb(392.00));
        document.getElementById('d-down').addEventListener('click', () => beepGb(440.00));

      } else if (device.type === 'ipod') {
        inner.innerHTML = \`
          <div class="flex flex-col h-full justify-between p-4">
            <div class="bg-black p-1.5 rounded border-2 border-black/80">
              <div class="bg-[#b4d2e1] text-stone-900 border border-stone-800 p-3 rounded-xs min-h-[130px] flex flex-col justify-between font-sans relative overflow-hidden select-none">
                <div class="flex justify-between items-center text-[7.5px] font-black tracking-tighter border-b border-stone-700/50 pb-0.5 uppercase mb-1">
                  <span>◀ iPod Classic</span>
                  <span>▶ PLAYING</span>
                </div>
                <div class="my-auto text-[9px] font-bold py-1 leading-relaxed text-center" id="ipod-track">
                  <div class="text-[11px] font-extrabold tracking-tight">BRANO RETRO</div>
                  <div class="text-[7.5px] text-stone-700 font-mono">\${device.brand || 'CLASSIC-POD'}</div>
                </div>
                <div class="border-t border-stone-700/50 pt-1 flex flex-col gap-0.5">
                  <div class="h-1 w-full bg-stone-300 rounded overflow-hidden"><div class="h-full w-2/5 bg-stone-900"></div></div>
                  <div class="flex justify-between text-[6.5px] font-extrabold text-stone-800 font-mono"><span>01:14</span><span>-03:02</span></div>
                </div>
              </div>
            </div>

            <!-- Click Wheel interface -->
            <div class="w-32 h-32 rounded-full bg-stone-100 border-2 border-stone-300 relative mx-auto shadow-md flex items-center justify-center cursor-pointer mb-2" id="clickwheel">
              <button id="pod-center" class="absolute w-10 h-10 rounded-full bg-white border border-stone-300 shadow active:scale-95 pointer-events-auto z-10"></button>
              <span class="absolute top-1 font-bold text-[9px] text-stone-500">MENU</span>
              <span id="pod-next" class="absolute right-2 font-bold text-[9px] text-stone-500">▶▶</span>
              <span id="pod-prev" class="absolute left-2 font-bold text-[9px] text-stone-500">◀◀</span>
              <span id="pod-play" class="absolute bottom-1 font-bold text-[9px] text-red-700">▶▮▮</span>
            </div>
          </div>
        \`;

        let ipodCtx = null;
        function beepIpod(freq) {
          try {
            if (!ipodCtx) ipodCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ipodCtx.createOscillator();
            const gain = ipodCtx.createGain();
            osc.connect(gain);
            gain.connect(ipodCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ipodCtx.currentTime);
            gain.gain.setValueAtTime(0.04, ipodCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ipodCtx.currentTime + 0.08);
            osc.start();
            osc.stop(ipodCtx.currentTime + 0.08);
          } catch(e){}
        }

        document.getElementById('pod-center').addEventListener('click', () => {
          beepIpod(900);
          showNotification("Selezionato!");
        });
        document.getElementById('clickwheel').addEventListener('click', () => {
          beepIpod(400);
        });

      } else if (device.type === 'tv') {
        inner.innerHTML = \`
          <div class="flex flex-col h-full justify-between p-4 bg-amber-900/10 border-2 border-[#141414]/20 rounded">
            <!-- Curved Bezel -->
            <div class="grow border-4 border-[#141414] bg-[#222222] p-4 rounded-3xl relative min-h-[150px] flex flex-col justify-center items-center shadow-inner">
              <div class="w-full h-full bg-[#1e2a1e] border-2 border-stone-800 rounded-[2.5rem] relative overflow-hidden select-none shadow-inner flex flex-col justify-center items-center p-3 animate-pulse" id="crt-screen">
                <div class="absolute inset-0 bg-[#344e34] pointer-events-none opacity-40"></div>
                <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/10"></div>
                <div class="z-20 text-center text-[#7cfc00] font-mono leading-tight" id="tv-status">
                  <div class="text-3xl font-black italic border-2 border-[#7cfc00] px-2 py-0.5 rounded bg-black/50 inline-block">CH 03</div>
                  <div class="text-[8px] mt-2 font-bold tracking-widest">\${device.brand || 'MONOSCOPE 1978'}</div>
                  <div class="text-[7.5px] text-amber-500 font-bold blinking uppercase mt-1">● SEGNALE BLUEPRINT</div>
                </div>
              </div>
            </div>

            <!-- Dial knobs -->
            <div class="flex justify-between items-center bg-[#d6d3d1] border-2 border-black/80 rounded p-2.5 mt-3 gap-2">
              <div class="flex gap-2">
                <button id="tv-ch" class="w-9 h-9 rounded-full border border-black bg-stone-300 font-bold text-[10px]">CH3</button>
                <button id="tv-contrast" class="w-9 h-9 rounded-full border border-black bg-stone-300 text-[8px]">MID</button>
              </div>
              <div class="grow h-1.5 bg-black/20 rounded"></div>
              <button id="tv-power" class="w-10 h-6 bg-red-600 border border-black rounded text-[9.5px] text-white font-black">I/O</button>
            </div>
          </div>
        \`;

        let tvCtx = null;
        let isTvOn = true;

        function tvSound() {
          try {
            if (!tvCtx) tvCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = tvCtx.createOscillator();
            const gain = tvCtx.createGain();
            osc.connect(gain);
            gain.connect(tvCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, tvCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, tvCtx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.04, tvCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, tvCtx.currentTime + 0.12);
            osc.start();
            osc.stop(tvCtx.currentTime + 0.12);
          } catch(e){}
        }

        const screen = document.getElementById('crt-screen');
        const power = document.getElementById('tv-power');

        power.addEventListener('click', () => {
          isTvOn = !isTvOn;
          tvSound();
          if (isTvOn) {
            screen.style.opacity = "1";
            power.className = "w-10 h-6 bg-red-600 border border-black rounded text-[9.5px] text-white font-black";
          } else {
            screen.style.opacity = "0";
            power.className = "w-10 h-6 bg-stone-500 border border-black rounded text-[9.5px] text-white font-black";
          }
        });

        document.getElementById('tv-ch').addEventListener('click', tvSound);
        document.getElementById('tv-contrast').addEventListener('click', tvSound);

      } else {
        // Fallback layout when device type is different (jukebox, turntable, pc, etc.)
        inner.innerHTML = \`
          <div class="flex flex-col h-full justify-between p-6">
            <div class="flex justify-between items-center border-b pb-2 border-black/10">
              <h3 class="font-mono text-sm font-black text-[#141414] tracking-tight uppercase">\${device.name || 'RETRO SCHEMA'}</h3>
              <span class="text-[9px] font-mono font-black text-black/50 uppercase tracking-widest">\${device.brand || 'DRAFT-MODEL'}</span>
            </div>

            <div class="grow flex flex-col justify-center items-center text-center py-6">
              <div class="text-4xl animate-bounce mb-3">🛸</div>
              <div class="bg-black/5 p-4 rounded border-2 border-dashed border-black/20 w-full font-mono">
                <span class="text-xs text-black/80 inline-block font-bold">TIPO: \${(device.type || 'console').toUpperCase()}</span>
                <p class="text-[10px] text-black/60 mt-1">Caricato correttamente, sintonizzatori, sticker originali sbloccati ed agganciati.</p>
              </div>
            </div>

            <div class="flex gap-3 justify-center pt-4 border-t border-black/10">
              <button id="generic-synth" class="bg-[#F27D26] hover:bg-orange-600 text-white font-mono text-[10px] font-black border-2 border-black px-4 py-1.5 shadow-[2px_2px_0px_#141414]">PREMI PER NOTA</button>
            </div>
          </div>
        \`;

        let fallbackCtx = null;
        document.getElementById('generic-synth').addEventListener('click', () => {
          try {
            if (!fallbackCtx) fallbackCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = fallbackCtx.createOscillator();
            const gain = fallbackCtx.createGain();
            osc.connect(gain);
            gain.connect(fallbackCtx.destination);
            osc.frequency.setValueAtTime(440, fallbackCtx.currentTime);
            osc.frequency.setValueAtTime(880, fallbackCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.04, fallbackCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, fallbackCtx.currentTime + 0.15);
            osc.start();
            osc.stop(fallbackCtx.currentTime + 0.15);
            showNotification("🎵 Sintetizzata nota " + device.type.toUpperCase() + "!");
          } catch(e){}
        });
      }

      // Sticker drag & drop handler
      const sticker = document.getElementById('draggable-sticker');
      const container = document.getElementById('device-body');

      if (sticker && container) {
        let isStickerDragging = false;

        sticker.addEventListener('mousedown', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          e.preventDefault();
          isStickerDragging = true;
          sticker.style.cursor = 'grabbing';
        });

        sticker.addEventListener('touchstart', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          isStickerDragging = true;
        });

        window.addEventListener('mousemove', (e) => {
          if (!isStickerDragging) return;
          const rect = container.getBoundingClientRect();
          let x = ((e.clientX - rect.left) / rect.width) * 100;
          let y = ((e.clientY - rect.top) / rect.height) * 100;
          x = Math.max(0, Math.min(100, x));
          y = Math.max(0, Math.min(100, y));

          sticker.style.left = x + '%';
          sticker.style.top = y + '%';
        });

        window.addEventListener('touchmove', (e) => {
          if (!isStickerDragging || e.touches.length === 0) return;
          const rect = container.getBoundingClientRect();
          let x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
          let y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
          x = Math.max(0, Math.min(100, x));
          y = Math.max(0, Math.min(100, y));

          sticker.style.left = x + '%';
          sticker.style.top = y + '%';
        });

        const releaseSticker = () => {
          if (isStickerDragging) {
            isStickerDragging = false;
            sticker.style.cursor = 'grab';
          }
        };

        window.addEventListener('mouseup', releaseSticker);
        window.addEventListener('touchend', releaseSticker);
      }
    }

    // Dynamic JSON Loader Method
    async function caricaDispositivoDalServer() {
      const pathInput = document.getElementById('json-file-url');
      const pathValue = pathInput.value.trim() || "./retro_device_blueprint.json";
      const statusTitle = document.getElementById('status-line');

      statusTitle.innerText = "Sintonizzazione e download del blueprint in corso...";

      try {
        const res = await fetch(pathValue);
        if (!res.ok) {
          throw new Error("Impossibile caricare il file. Codice errore HTTP: " + res.status);
        }
        const parsed = await res.json();
        
        let targetSchema = parsed;
        if (Array.isArray(parsed) && parsed.length > 0) {
          targetSchema = parsed[0]; // If backup complete list array is fed, grab the first design
        }

        if (targetSchema && targetSchema.type) {
          renderDynamicDevice(targetSchema);
          showNotification("Sintonizzato con successo su: " + targetSchema.name);
        } else {
          throw new Error("Campi di schema non validi (manca type o name)");
        }
      } catch (err) {
        statusTitle.innerHTML = \`<span class="text-red-650">❌ ERRORE DI FEEDING:</span> \` + err.message;
        alert("Errore nel caricamento del file JSON da '" + pathValue + "'.\\n\\nDettagli:\\n" + err.message + "\\n\\nAssicurati che il file esista e di aver aperto questa pagina tramite server web locale (localhost/127.0.0.1) o hosting, e non tramite file://");
      }
    }

    // Try loading immediately on document load if relative file present
    window.addEventListener('load', () => {
      caricaDispositivoDalServer();
    });
  </script>
</body>
</html>`;
}

