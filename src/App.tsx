import React, { useState, useEffect } from 'react';
import { RetroDevice, DeviceType, WearLevel } from './types';
import { DEFAULT_DEVICES, RETRO_STICKERS, RETRO_SONGS } from './data/songs';
import { RadioDevice } from './components/RadioDevice';
import { TVDevice } from './components/TVDevice';
import { PCDevice } from './components/PCDevice';
import { IPodDevice } from './components/iPodDevice';
import { GameBoyDevice } from './components/GameBoyDevice';
import { PlayStationDevice } from './components/PlayStationDevice';
import { GameCubeDevice } from './components/GameCubeDevice';
import { TurntableDevice } from './components/TurntableDevice';
import { JukeboxDevice } from './components/JukeboxDevice';
import { playClick, playRetroJingle } from './utils/audio';
import { generateVanillaHTML } from './utils/vanillaExporter';

// Visual theme configurations for base devices
const BASE_DEVICES_INFO = [
  { type: 'radio', icon: '📻', label: 'Radio Vintage', year: '1974', desc: 'Sintonizzatore analogico AM/FM e finiture in legno di acacia.' },
  { type: 'tv', icon: '📺', label: 'TV Retro CRT', year: '1982', desc: 'Televisore a tubo catodico con antenne telescopiche e fruscio reale.' },
  { type: 'pc', icon: '💻', label: 'Computer Classico', year: '1984', desc: 'Terminale a fosfori verdi DOS e lettore floppy disk retroattivo.' },
  { type: 'ipod', icon: '📱', label: 'iPod Classic', year: '2004', desc: 'Dispositivo MP3 portatile con l\'iconica click-wheel scrollabile.' },
  { type: 'gameboy', icon: '🎮', label: 'Game Boy', year: '1989', desc: 'Console portatile a 8-Bit con gioco Snake retro-emulato e sonoro.' },
  { type: 'playstation', icon: '📀', label: 'PlayStation 1', year: '1994', desc: 'Console a 32-Bit con sportello CD a molla e sequenza di boot originale.' },
  { type: 'gamecube', icon: '🟪', label: 'GameCube', year: '2001', desc: 'Design a cubo con dischi ottici da 3" e cubetti cinetici all\'avvio.' },
  { type: 'turntable', icon: '🎚️', label: 'Giradischi', year: '1979', desc: 'Grammofono con braccio testina poggiabile e giri regolabili da 33 a 78.' },
  { type: 'jukebox', icon: '🪩', label: 'Jukebox Diner', year: '1956', desc: 'Arcata neon arcobaleno lampeggiante con canzoni diner selezionabili.' },
];

const PRESET_COLORS = [
  { hex: '#8B4513', name: 'Legno Scuro' },
  { hex: '#D2B48C', name: 'Beige Vintage' },
  { hex: '#AEB3B7', name: 'Grigio Grigio' },
  { hex: '#534394', name: 'Viola Indigo' },
  { hex: '#EBE9E4', name: 'Beige Plastica PC' },
  { hex: '#ef4444', name: 'Rosso Ciliegia' },
  { hex: '#0ea5e9', name: 'Azzurro Atomico' },
  { hex: '#1e293b', name: 'Nero Carbone' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'device' | 'finishes' | 'stickers' | 'controls'>('device');
  const [selectedType, setSelectedType] = useState<DeviceType>('radio');
  const [device, setDevice] = useState<RetroDevice>({
    id: 'temp-id',
    name: 'La Mia Radio Vintage',
    type: 'radio',
    ...DEFAULT_DEVICES.radio,
  } as RetroDevice);

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isBlueprintMode, setIsBlueprintMode] = useState(false);
  const [collection, setCollection] = useState<RetroDevice[]>([]);
  const [customDeviceName, setCustomDeviceName] = useState('');

  // Load collection from localStorage on component mount & subscribe to sticker deletions
  useEffect(() => {
    const saved = localStorage.getItem('retro_craft_collection');
    if (saved) {
      try {
        setCollection(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load collection', e);
      }
    } else {
      // Mock initial shelf items
      const initialPresets: RetroDevice[] = [
        {
          id: 'preset-radio',
          name: 'Radio di Nonno',
          type: 'radio',
          ...DEFAULT_DEVICES.radio,
          brand: 'PHONOLA-Classic',
        } as RetroDevice,
        {
          id: 'preset-gameboy',
          name: 'GameBoy Trasparente',
          type: 'gameboy',
          ...DEFAULT_DEVICES.gameboy,
          bodyMaterial: 'translucent',
          primaryColor: '#a855f7',
        } as RetroDevice,
      ];
      setCollection(initialPresets);
      localStorage.setItem('retro_craft_collection', JSON.stringify(initialPresets));
    }

    const handleClearSticker = () => {
      setDevice((prev) => ({
        ...prev,
        stickerId: null,
      }));
    };

    window.addEventListener('retro_clear_sticker', handleClearSticker);
    return () => {
      window.removeEventListener('retro_clear_sticker', handleClearSticker);
    };
  }, []);

  // Update device active state when base device type is shifted
  const handleSelectBaseType = (type: DeviceType) => {
    playClick(1000, 0.05);
    setSelectedType(type);
    
    // Merge base properties
    const defaultProps = (DEFAULT_DEVICES as any)[type];
    const uppercaseName = type.toUpperCase();
    const italianLabel = BASE_DEVICES_INFO.find((b) => b.type === type)?.label || 'Dispositivo';

    const newDevice: RetroDevice = {
      id: Math.random().toString(36).substring(4),
      name: `La Mia ${italianLabel}`,
      type,
      ...defaultProps,
    } as RetroDevice;

    setDevice(newDevice);
    setCustomDeviceName(`La Mia ${italianLabel}`);
    setIsBlueprintMode(false); // reset to normal view
  };

  const handleUpdateDevice = (updatedFields: Partial<RetroDevice>) => {
    setDevice((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  // Save current design to Local Storage archive list
  const handleSaveToShelf = () => {
    if (isAudioOn) {
      playRetroJingle('success');
    }
    const shelfName = customDeviceName.trim() || `Design Retro #${collection.length + 1}`;
    
    const deviceToSave: RetroDevice = {
      ...device,
      id: Math.random().toString(36).substring(4),
      name: shelfName,
    };

    const newCollection = [deviceToSave, ...collection];
    setCollection(newCollection);
    localStorage.setItem('retro_craft_collection', JSON.stringify(newCollection));
    setCustomDeviceName('');
  };

  const handleLoadFromShelf = (item: RetroDevice) => {
    playClick(500, 0.1);
    setDevice(item);
    setSelectedType(item.type);
    setIsBlueprintMode(false);
  };

  const handleDeleteFromShelf = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClick(300, 0.15);
    const filtered = collection.filter((item) => item.id !== id);
    setCollection(filtered);
    localStorage.setItem('retro_craft_collection', JSON.stringify(filtered));
  };

  const handleAudioSwitchToggle = () => {
    setIsAudioOn(!isAudioOn);
  };

  const handleResetApp = () => {
    const confirmReset = window.confirm(
      "Sei sicuro di voler effettuare un reset completo dell'app?\n" +
      "Questo ripristinerà i dispositivi e pulirà la mensola vintage locale."
    );
    if (!confirmReset) return;

    if (isAudioOn) playRetroJingle('success');
    localStorage.removeItem('retro_craft_collection');

    const initialPresets: RetroDevice[] = [
      {
        id: 'preset-radio',
        name: 'Radio di Nonno',
        type: 'radio',
        ...DEFAULT_DEVICES.radio,
        brand: 'PHONOLA-Classic',
      } as RetroDevice,
      {
        id: 'preset-gameboy',
        name: 'GameBoy Trasparente',
        type: 'gameboy',
        ...DEFAULT_DEVICES.gameboy,
        bodyMaterial: 'translucent',
        primaryColor: '#a855f7',
      } as RetroDevice,
    ];
    setCollection(initialPresets);
    localStorage.setItem('retro_craft_collection', JSON.stringify(initialPresets));

    const defaultRadioProps = DEFAULT_DEVICES.radio;
    const initialRadio: RetroDevice = {
      id: 'starting-radio',
      name: 'La Mia Radio Vintage',
      type: 'radio',
      ...defaultRadioProps,
    } as RetroDevice;

    setDevice(initialRadio);
    setSelectedType('radio');
    setCustomDeviceName('La Mia Radio Vintage');
    setIsBlueprintMode(false);
    setActiveTab('device');
  };

  // Helper utility to trigger a file download of JSON structure
  const downloadJson = (data: any, fileName: string) => {
    const fileData = JSON.stringify(data, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export current customized device blueprint config as a JSON file
  const handleExportActive = () => {
    if (isAudioOn) playRetroJingle('success');
    const safeName = device.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'retro_device';
    downloadJson(device, `${safeName}_blueprint.json`);
  };

  // Export current customized device as standalone, interactive HTML/CSS/JS file
  const handleExportVanillaHTML = () => {
    if (isAudioOn) playRetroJingle('success');
    const htmlString = generateVanillaHTML(device);
    const blob = new Blob([htmlString], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = device.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'retro_device';
    link.href = url;
    link.download = `${safeName}_reale.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import a previously exported device JSON blueprint, load it onto workbench and add to storage collection
  const handleImportActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result as string) as RetroDevice;
        if (parsed && parsed.name && parsed.type) {
          // Assign a new ID to avoid duplication conflicts but preserve custom state and details
          const importedDevice = {
            ...parsed,
            id: Math.random().toString(36).substring(4),
          };
          setDevice(importedDevice);
          setSelectedType(importedDevice.type);
          setCustomDeviceName(importedDevice.name);
          
          // Prepend this imported device to the vintage shelf rack collection
          const newCollection = [importedDevice, ...collection];
          setCollection(newCollection);
          localStorage.setItem('retro_craft_collection', JSON.stringify(newCollection));
          
          if (isAudioOn) playRetroJingle('success');
        } else {
          alert('Il file JSON selezionato non contiene una schematica di dispositivo d\'epoca valida.');
        }
      } catch (err) {
        console.error(err);
        alert('Errore nella lettura del file di schematica. Assicurati che sia un file di configurazione con formato JSON valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  // Export the full vintage collection of all saved custom devices
  const handleExportCollection = () => {
    if (isAudioOn) playRetroJingle('success');
    downloadJson(collection, `mensola_retro_completa.json`);
  };

  // Import (Overwrite or restore) the full archive of devices to the browser storage
  const handleImportCollection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result as string);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(item => item && item.name && item.type);
          if (isValid) {
            setCollection(parsed);
            localStorage.setItem('retro_craft_collection', JSON.stringify(parsed));
            if (parsed.length > 0) {
              // Load the first one to the active workbench
              setDevice(parsed[0]);
              setSelectedType(parsed[0].type);
            }
            if (isAudioOn) playRetroJingle('success');
          } else {
            alert('Il file contiene schemi di backup con campi obsoleti o non validi.');
          }
        } else {
          alert('Il file caricato non sembra un archivio completo di dispositivi (.json).');
        }
      } catch (err) {
        console.error(err);
        alert('Errore durante il caricamento del file di archivio.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  // Technical blueprint labels for schematic mode based on selected device
  const getBlueprintSpecs = () => {
    switch (selectedType) {
      case 'tv':
        return [
          { name: 'Tubo Catodico (CRT)', spec: 'Fosfori ad attivazione magnetica 1982' },
          { name: 'Sintonia Canale', spec: 'Commutatore rotativo a 12 posizioni discrete' },
          { name: 'Modulo Alimentatore', spec: 'Flyback Transformer 15.625 KHz' },
          { name: 'Antenna a Corna', spec: 'Telescopica estensione Max 1.4m' },
        ];
      case 'pc':
        return [
          { name: 'CPU', spec: 'Processore Intel 8086 @ 4.77 MHz' },
          { name: 'Fosfori Monitor', spec: 'Tipo P39 verde a persistenza prolungata' },
          { name: 'Lettore Floppy', spec: 'Slot 3.5 pollici magnetico con molla' },
          { name: 'Tastiera Integrata', spec: 'Switch Meccanici capacitivi a clic strutturale' },
        ];
      case 'ipod':
        return [
          { name: 'Click-wheel', spec: 'Tracciatore capacitivo circolare multi-pressione' },
          { name: 'Micro-Drive HDD', spec: 'Disco rigido ultra-sottile Toshiba 20GB' },
          { name: 'Schermo Backlit', spec: 'Monocromatico bluastro con ris. 160x128 pixel' },
          { name: 'Convertitore DAC', spec: 'Chip Audio ad altissima fedeltà 24-Bit' },
        ];
      case 'gameboy':
        return [
          { name: 'CPU Principale', spec: 'Sharp LR35902 a 8-Bit @ 4.19 MHz' },
          { name: 'Display LCD', spec: 'Schermo a matrice di riflessione liquida "Pea Soup"' },
          { name: 'Batteria Vani', spec: 'Alloggio ad incasso per 4 pile Stilo AA' },
          { name: 'Pulsantiera Meccanica', spec: 'Contatti in gomma conduttiva siliconica' },
        ];
      case 'playstation':
        return [
          { name: 'Processore Centrale', spec: 'LSI R3000A a 32-Bit @ 33.86 MHz' },
          { name: 'Drive Laser CD-ROM', spec: 'Lente ottica asferica a scorrimento lineare' },
          { name: 'Memoria RAM', spec: '2MB RAM Principale, 1MB VRAM Cinetica' },
          { name: 'Lid Latch', spec: 'Sportello a sblocco meccanico a molla tesa' },
        ];
      case 'gamecube':
        return [
          { name: 'GPU Gekko', spec: 'Processore IBM PowerPC @ 485 MHz' },
          { name: 'Drive Disc', spec: 'Vano di rotazione mini dischi ottici da 8cm' },
          { name: 'Jewel Badge', spec: 'Piastra superiore personalizzabile da 90mm' },
          { name: 'Port Central', spec: 'Alloggi controller quadrupli a bassa latenza' },
        ];
      case 'turntable':
        return [
          { name: 'Trazione Giradischi', spec: 'Piatto rotante a mezzo cinghia in gomma dura' },
          { name: 'Braccio di Lettura', spec: 'Leva metallica a bilanciamento micrometrico' },
          { name: 'Testina Phonografica', spec: 'Puntina diamantata a magnete mobile' },
          { name: 'Pitch Control', spec: 'Potenziometro lineare di precisione +/- 10%' },
        ];
      case 'jukebox':
        return [
          { name: 'Tubo Neon', spec: 'Lampadine a scarica di gas neon dimerizzate' },
          { name: 'Meccanismo Selettore', spec: 'Carosello rotante a rastrelliera verticale 45 g/m' },
          { name: 'Speaker Grill Dome', spec: 'Griglia radiotrasparente cromata' },
          { name: 'Tasti Selezione', spec: 'Micro-interruttori diner ad alta corsa magnetica' },
        ];
      case 'radio':
      default:
        return [
          { name: 'Bobina d\'Induzione', spec: 'Antenna in ferrite per onde e frequenze AM' },
          { name: 'Condensatore Variabile', spec: 'Manopola doppia per sintonizzazione fissa' },
          { name: 'Cassa Armonica', spec: 'Finitura in compensato sagomato di mogano' },
          { name: 'Griglia Stereo', spec: 'Lamelle in legno a scanalature sonore' },
        ];
    }
  };

  const renderActiveDevice = () => {
    const props = { device, onChangeDevice: handleUpdateDevice, isAudioOn };
    switch (selectedType) {
      case 'tv':
        return <TVDevice {...props} />;
      case 'pc':
        return <PCDevice {...props} />;
      case 'ipod':
        return <IPodDevice {...props} />;
      case 'gameboy':
        return <GameBoyDevice {...props} />;
      case 'playstation':
        return <PlayStationDevice {...props} />;
      case 'gamecube':
        return <GameCubeDevice {...props} />;
      case 'turntable':
        return <TurntableDevice {...props} />;
      case 'jukebox':
        return <JukeboxDevice {...props} />;
      case 'radio':
      default:
        return <RadioDevice {...props} />;
    }
  };

  const getMaterialLabel = (material: string) => {
    switch (material) {
      case 'wood': return 'Legno Pregiato';
      case 'metal': return 'Metallo Satinato';
      case 'translucent': return 'Plastica Trasparente (Atomic)';
      case 'plastic':
      default:
        return 'Plastica Lucida';
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col justify-between selection:bg-[#F27D26] selection:text-white border-[12px] border-[#141414]">
      
      {/* Upper Navigation Header bar - Massive Typographic Impact */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end px-6 pt-6 pb-4 border-b-2 border-[#141414] bg-[#E4E3E0] select-none gap-4">
        <div className="leading-none flex items-end gap-3.5">
          <span className="text-4xl sm:text-7xl">📻</span>
          <div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#141414] select-none leading-none">
              Analogue
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-1 text-[#141414]/80 select-none">
              Hardware Synthesis Studio
            </p>
          </div>
        </div>

        {/* Header toolbar stats & buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="bg-[#F27D26] border-2 border-[#141414] px-3 py-0.5 text-white font-black text-[10px] sm:text-xs uppercase shadow-[2px_2px_0px_#141414]">
              v4.02 // STABLE
            </div>
            <div className="text-[9px] sm:text-xs font-mono uppercase opacity-70">
              Project: NOSTALGIA_CORE_001
            </div>
          </div>
          <div className="flex items-center gap-2.5 mt-2 sm:mt-0 grow">
            {/* Audio Switch */}
            <button
              onClick={handleAudioSwitchToggle}
              className={`px-3 py-1.5 rounded-none font-mono text-xs font-black border-2 border-[#141414] flex items-center gap-1.5 cursor-pointer transition-all shadow-[3px_3px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141414] ${
                isAudioOn
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-[#141414]'
              }`}
            >
              {isAudioOn ? '🔊 AUDIO ATTIVO' : '🔇 AUDIO MUTO'}
            </button>

            {/* Blueprint schematic toggle */}
            <button
              onClick={() => {
                playClick(1400, 0.05);
                setIsBlueprintMode(!isBlueprintMode);
              }}
              className={`px-3 py-1.5 rounded-none font-mono text-xs font-black border-2 border-[#141414] flex items-center gap-1.5 cursor-pointer transition-all shadow-[3px_3px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141414] ${
                isBlueprintMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-[#141414]'
              }`}
            >
              📐 SCHEMA {isBlueprintMode ? 'ATTIVO' : 'OFF'}
            </button>

            {/* Total Reset of App & local storage */}
            <button
              onClick={handleResetApp}
              className="px-3 py-1.5 rounded-none font-mono text-xs font-black border-2 border-[#141414] bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-[3px_3px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141414]"
              title="Azzera e ripristina la mensola locale e le impostazioni di fabbrica"
            >
              🔄 RESETTA APP
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Physical Workbench Container (7 cols) */}
        <section className="lg:col-span-7 flex flex-col justify-between bg-[#D9D7D2] border-[4px] border-[#141414] rounded-lg p-4 lg:p-6 shadow-[8px_8px_0px_#141414] relative min-h-[440px] overflow-hidden text-[#141414]">
          
          {/* Brutalist Drafting Blueprint Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }} />

          {/* Blueprint paper background when activated */}
          {isBlueprintMode && (
            <div className="absolute inset-0 bg-[#0f1d3a] z-5 opacity-100 transition-all duration-500 flex flex-col border-[4px] border-[#141414]">
              {/* Drafting grid paper lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:16px_16px]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
              
              {/* Technical drawing titles on border edges */}
              <div className="absolute top-3 left-4 text-[9px] font-mono text-blue-400 font-bold opacity-80 uppercase tracking-widest select-none">
                TECHNICAL PROTO_BLUEPRINT SCHEMA v3.0 // COD_ID: {selectedType.toUpperCase()}
              </div>
              <div className="absolute bottom-3 right-4 text-[8.5px] font-mono text-blue-500 font-bold select-none">
                SCALE 1:1 / CALIBRATO RETRO_CRAFT_STUDIO_99
              </div>
            </div>
          )}

          {/* Workbench Header: dynamic indicator */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-[#141414] z-10 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F27D26] animate-pulse" />
              <span className="text-xs font-mono text-[#141414] uppercase tracking-widest font-black">
                {isBlueprintMode ? '📐 PROSPETTO TECNICO / SCHEMA' : '🛠️ BANCO DI LAVORO RETRO'}
              </span>
            </div>
            
            <div className="text-right text-[10px] font-mono text-[#141414] font-bold">
              MOD.: {device.brand.toUpperCase()} // STATO: {device.wearLevel.toUpperCase()}
            </div>
          </div>

          {/* Rendering the customized actual interactive device */}
          <div className="flex-1 flex items-center justify-center py-4 relative z-10">
            {isBlueprintMode ? (
              // Glowing wireframe technical schematic design view
              <div className="relative w-full max-w-md mx-auto aspect-video rounded-none border-4 border-[#141414] bg-[#E4E3E0] p-6 flex flex-col justify-between shadow-[6px_6px_0px_#141414] text-[#141414] font-mono select-none">
                {/* Outline corner guides */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#141414]" />
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#141414]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#141414]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#141414]" />

                <div className="border-b-2 border-[#141414] pb-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#F27D26] block">SCHEMA TECNICO</span>
                  <span className="text-[10px] font-bold opacity-85">{device.name.toUpperCase()} // {BASE_DEVICES_INFO.find(b => b.type === selectedType)?.label.toUpperCase()}</span>
                </div>

                {/* Grid layout showing custom component stats specification blocks */}
                <div className="flex-1 flex flex-col justify-around gap-1.5 my-2">
                  {getBlueprintSpecs().map((spec, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] border-b border-[#141414]/25 pb-1">
                      <span className="text-[#141414] font-black">● {spec.name.toUpperCase()}</span>
                      <span className="text-[#141414] ml-4 max-w-[210px] text-right truncate font-medium">{spec.spec}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t-2 border-[#141414] flex justify-between items-center text-[9px] font-bold">
                  <span>DIM.: 240 x 180 x 110 MM</span>
                  <span className="text-[#F27D26]">FINITURA: {getMaterialLabel(device.bodyMaterial).toUpperCase()}</span>
                </div>
              </div>
            ) : (
              // High Fidelity Living interactive console simulation
              renderActiveDevice()
            )}
          </div>

          {/* Visual placement instructions block under workbench */}
          {!isBlueprintMode && (
            <div className="text-center text-[10px] font-mono text-[#141414]/80 select-none border-t-2 border-[#141414] pt-2.5 mt-2 z-10 font-bold">
              * Ruota le manopole, premi i bottoni o gioca con i comandi!
              {device.stickerId && " Clicca sul guscio del dispositivo per ricollocare l'adesivo."}
            </div>
          )}
          {isBlueprintMode && (
            <div className="text-center text-[10px] font-mono text-blue-400 select-none border-t border-blue-900/40 pt-2.5 mt-2 z-10 font-bold">
              * Visualizzazione radiografia componenti circuiti stampati analogici.
            </div>
          )}
        </section>

        {/* Right Side: Custmization Settings & Parameters drawer (5 cols) */}
        <section className="lg:col-span-5 flex flex-col bg-[#E4E3E0] border-[4px] border-[#141414] rounded-lg overflow-hidden shadow-[8px_8px_0px_#141414] text-[#141414]">
          
          {/* Customizations Sidebar tab headers */}
          <div className="grid grid-cols-4 border-b-2 border-[#141414] bg-[#E4E3E0] text-center select-none divide-x-2 divide-[#141414]">
            <button
              onClick={() => { playClick(1100, 0.015); setActiveTab('device'); }}
              className={`py-3 text-[10.5px] font-black uppercase tracking-tight hover:bg-[#D9D7D2] cursor-pointer transition-colors flex flex-col items-center gap-1 ${
                activeTab === 'device' ? 'bg-[#141414] text-[#E4E3E0]' : 'text-[#141414]'
              }`}
            >
              <span className="text-lg">📦</span>
              <span>MODELLO</span>
            </button>
            <button
              onClick={() => { playClick(1105, 0.015); setActiveTab('finishes'); }}
              className={`py-3 text-[10.5px] font-black uppercase tracking-tight hover:bg-[#D9D7D2] cursor-pointer transition-colors flex flex-col items-center gap-1 ${
                activeTab === 'finishes' ? 'bg-[#141414] text-[#E4E3E0]' : 'text-[#141414]'
              }`}
            >
              <span className="text-lg">🎨</span>
              <span>FINITURA</span>
            </button>
            <button
              onClick={() => { playClick(1110, 0.015); setActiveTab('stickers'); }}
              className={`py-3 text-[10.5px] font-black uppercase tracking-tight hover:bg-[#D9D7D2] cursor-pointer transition-colors flex flex-col items-center gap-1 ${
                activeTab === 'stickers' ? 'bg-[#141414] text-[#E4E3E0]' : 'text-[#141414]'
              }`}
            >
              <span className="text-lg">🍒</span>
              <span>ADESIVI</span>
            </button>
            <button
              onClick={() => { playClick(1115, 0.015); setActiveTab('controls'); }}
              className={`py-3 text-[10.5px] font-black uppercase tracking-tight hover:bg-[#D9D7D2] cursor-pointer transition-colors flex flex-col items-center gap-1 ${
                activeTab === 'controls' ? 'bg-[#141414] text-[#E4E3E0]' : 'text-[#141414]'
              }`}
            >
              <span className="text-lg">🎛️</span>
              <span>REGOLA</span>
            </button>
          </div>

          {/* Active Tab options viewport drawer */}
          <div className="flex-1 p-5 overflow-y-auto max-h-[460px] scrollbar-thin">
            
            {/* TAB 1: Base templates choosing list */}
            {activeTab === 'device' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black tracking-wider text-[#F27D26] font-mono uppercase border-b-2 border-[#141414] pb-1.5 mb-1.5">
                  1. Scegli Modello di Partenza
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BASE_DEVICES_INFO.map((item) => {
                    const isSelected = item.type === selectedType;
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleSelectBaseType(item.type as DeviceType)}
                        className={`p-3.5 rounded-none border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#141414] border-[#141414] text-[#E4E3E0] shadow-[4px_4px_0px_#F27D26]'
                            : 'bg-white hover:bg-stone-50 border-[#141414] text-[#141414] shadow-[4px_4px_0px_#141414]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-extrabold text-sm tracking-tight leading-4 uppercase">{item.label}</div>
                            <span className="text-[10px] font-mono font-black opacity-60">{item.year}</span>
                          </div>
                        </div>
                        <p className={`text-[10px] mt-2 leading-3.5 italic ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Case Finitura layout details */}
            {activeTab === 'finishes' && (
              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-black tracking-wider text-[#F27D26] font-mono uppercase border-b-2 border-[#141414] pb-1.5 mb-1.5">
                  2. Personalizza Scocca & Materiali
                </h3>

                {/* Brand label name updater input field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Marchio Stampato (Brand Name)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={device.brand}
                    onChange={(e) => handleUpdateDevice({ brand: e.target.value })}
                    className="bg-white border-2 border-[#141414] rounded-none py-2 px-3 text-sm focus:outline-none focus:border-[#F27D26] text-[#141414] font-mono font-black shadow-[3px_3px_0px_#141414]"
                    placeholder="Scegli etichetta..."
                  />
                </div>

                {/* Primary exterior casing color palettes */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Colore Principale Scocca</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((col) => {
                      const isSelected = device.primaryColor === col.hex;
                      return (
                        <button
                          key={col.hex}
                          onClick={() => {
                            playClick(1000, 0.012);
                            handleUpdateDevice({ primaryColor: col.hex });
                          }}
                          className={`h-9 rounded-sm border-2 border-[#141414] relative transition-all ${
                            isSelected ? 'scale-105 shadow-[3px_3px_0px_#141414] ring-2 ring-[#F27D26]' : 'hover:scale-103 shadow-[1rem_1rem_0px_transparent]'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        >
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs select-none bg-black/15 font-black">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Casing Solid Body material types */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Materiale Principale</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['plastic', 'wood', 'metal', 'translucent'] as const).map((mat) => {
                      const isSelected = device.bodyMaterial === mat;
                      return (
                        <button
                          key={mat}
                          onClick={() => {
                            playClick(1200, 0.01);
                            handleUpdateDevice({ bodyMaterial: mat });
                          }}
                          className={`py-2 px-3 rounded-none border-2 border-[#141414] font-black cursor-pointer transition-all shadow-[3px_3px_0px_#141414] active:translate-y-px active:shadow-[1px_1px_0px_#141414] ${
                            isSelected
                              ? 'bg-[#141414] text-white'
                              : 'bg-white text-[#141414] hover:bg-stone-100'
                          }`}
                        >
                          {getMaterialLabel(mat).toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wear and tear levels (Nuovo, Vecchio etc) */}
                <div className="flex flex-col gap-2 border-t-2 border-[#141414] pt-4">
                  <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Usura e Patina d&apos;Invecchiamento</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { value: 'mint', label: 'Incolume (Nuovo)', emoji: '✨' },
                      { value: 'used', label: 'Usato (Polvere)', emoji: '🧹' },
                      { value: 'scratched', label: 'Graffiato (Vissuto)', emoji: '🩹' },
                      { value: 'rusty', label: 'Arrugginito (Antico)', emoji: '🪵' },
                    ].map((w) => {
                      const isSelected = device.wearLevel === w.value;
                      return (
                        <button
                          key={w.value}
                          onClick={() => {
                            playClick(1100, 0.05);
                            handleUpdateDevice({ wearLevel: w.value as WearLevel });
                          }}
                          className={`py-2 px-3 rounded-none border-2 border-[#141414] font-black flex items-center justify-between cursor-pointer transition-all shadow-[3px_3px_0px_#141414] active:translate-y-px active:shadow-[1px_1px_0px_#141414] ${
                            isSelected
                              ? 'bg-[#141414] text-white'
                              : 'bg-white text-[#141414] hover:bg-stone-100'
                          }`}
                        >
                          <span>{w.label.toUpperCase()}</span>
                          <span>{w.emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Vintage Decals sticker selection */}
            {activeTab === 'stickers' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black tracking-wider text-[#F27D26] font-mono uppercase border-b-2 border-[#141414] pb-1.5 mb-1.5">
                  3. Incolla Adesivo Vintage
                </h3>
                <p className="text-[10px] text-stone-750 font-medium italic leading-3.5 mb-2">
                  Scegli un decalcomania qui sotto, poi fai clic sulla bacheca del dispositivo a sinistra per posizionarlo o spostarlo liberamente.
                </p>

                <div className="grid grid-cols-4 gap-3">
                  {/* Option to clear stickers */}
                  <button
                    onClick={() => {
                      playClick(1000, 0.03);
                      handleUpdateDevice({ stickerId: null });
                    }}
                    className={`p-3 rounded-none border-2 border-[#141414] flex flex-col items-center justify-center text-[10px] font-black cursor-pointer transition-all ${
                      device.stickerId === null
                        ? 'bg-[#A52A2A] text-white shadow-[3px_3px_0px_#141414]'
                        : 'bg-white text-[#141414] hover:bg-stone-150 shadow-[3px_3px_0px_#141414]'
                    }`}
                  >
                    <span className="text-xl">✕</span>
                    <span>ELIMINA</span>
                  </button>

                  {RETRO_STICKERS.map((st) => {
                    const isSelected = device.stickerId === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => {
                          playClick(1100, 0.04);
                          handleUpdateDevice({ stickerId: st.id, stickerX: 50, stickerY: 50 });
                        }}
                        className={`p-3 rounded-none border-2 border-[#141414] flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#141414] text-white shadow-[3px_3px_0px_#F27D26] scale-103'
                            : 'bg-white hover:bg-stone-100 text-[#141414] shadow-[3px_3px_0px_#141414]'
                        }`}
                      >
                        <span className="text-2xl mb-1">{st.emoji}</span>
                        <span className="text-[8px] truncate max-w-full font-mono font-black">{st.name.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: Specific analog parameters sliders */}
            {activeTab === 'controls' && (
              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-black tracking-wider text-[#F27D26] font-mono uppercase border-b-2 border-[#141414] pb-1.5 mb-1.5">
                  4. Parametri di Regolazione Fine
                </h3>

                      {selectedType === 'radio' && (
                  <div className="flex flex-col gap-4">
                    {/* Speaker grill selector */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Stile Griglia Altoparlante</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'horizontal', label: 'Orizzontale' },
                          { val: 'mesh', label: 'A Rete' },
                          { val: 'retro-slots', label: 'Fessure' },
                        ].map((grid) => (
                          <button
                            key={grid.val}
                            onClick={() => { playClick(1200, 0.01); handleUpdateDevice({ radioSpeakerGrill: grid.val as any }); }}
                            className={`py-1.5 px-2 rounded-none border-2 border-[#141414] font-black cursor-pointer transition-all shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.radioSpeakerGrill === grid.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {grid.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between text-[11px] font-mono text-[#141414] font-black uppercase">
                        <span>Frequenza Sintonizzazione</span>
                        <span className="text-[#F27D26] font-black">{device.radioFrequency || 94.5} MHz</span>
                      </div>
                      <input
                        type="range"
                        min="88"
                        max="108"
                        step="0.1"
                        value={device.radioFrequency || 94.5}
                        onChange={(e) => handleUpdateDevice({ radioFrequency: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-white rounded-none border-2 border-[#141414] appearance-none cursor-pointer accent-[#F27D26]"
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'tv' && (
                  <div className="flex flex-col gap-4 text-xs">
                    {/* Monitor filters */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-mono text-[#141414] font-black uppercase">Filtro Immagine Monitor</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'bw', label: 'Bianco & Nero' },
                          { id: 'warm-color', label: 'Colori Caldi CRT' },
                          { id: 'sepia', label: 'Seppia Nostalgica' },
                          { id: 'cyberpunk', label: 'Futuristico' },
                        ].map((fil) => (
                          <button
                            key={fil.id}
                            onClick={() => { playClick(1000, 0.05); handleUpdateDevice({ tvVintageFilter: fil.id as any }); }}
                            className={`py-1.5 px-2 rounded-none border-2 border-[#141414] font-black cursor-pointer transition-all shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.tvVintageFilter === fil.id ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {fil.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Antenna values sliders */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] font-mono text-[#141414] font-black uppercase">LUNGHEZZA ANTENNE</span>
                        <span className="text-[#141414] font-black">{device.tvAntennaLength || 60}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={device.tvAntennaLength || 60}
                        onChange={(e) => handleUpdateDevice({ tvAntennaLength: parseInt(e.target.value) })}
                        className="w-full h-2 bg-white rounded-none border-2 border-[#141414] appearance-none cursor-pointer accent-[#F27D26]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] font-mono text-[#141414] font-black uppercase">INCLINAZIONE ANTENNE</span>
                        <span className="text-[#141414] font-black">{device.tvAntennaAngle || 20} Deg</span>
                      </div>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={device.tvAntennaAngle || 20}
                        onChange={(e) => handleUpdateDevice({ tvAntennaAngle: parseInt(e.target.value) })}
                        className="w-full h-2 bg-white rounded-none border-2 border-[#141414] appearance-none cursor-pointer accent-[#F27D26]"
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'pc' && (
                  <div className="flex flex-col gap-4 text-xs">
                    {/* OS Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Sistema Operativo Retro</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'dos', label: 'MS-DOS v5.0' },
                          { id: 'system7', label: 'Mac System 7' },
                        ].map((os) => (
                          <button
                            key={os.id}
                            onClick={() => { playClick(1100, 0.05); handleUpdateDevice({ pcBootOS: os.id as any }); }}
                            className={`py-2 px-3 rounded-none border-2 border-[#141414] font-black cursor-pointer transition-all shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.pcBootOS === os.id ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {os.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Terminal monitor phosphor style */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Sfumatura Terminale Phosphor</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { val: 'green', label: 'Verde' },
                          { val: 'amber', label: 'Ambra' },
                          { val: 'cyan', label: 'Ciano' },
                          { val: 'white', label: 'Bianco' },
                        ].map((ph) => (
                           <button
                             key={ph.val}
                             onClick={() => { playClick(1000, 0.05); handleUpdateDevice({ pcTerminalColor: ph.val as any }); }}
                             className={`py-1.5 rounded-none border-2 border-[#141414] text-[10px] font-black cursor-pointer shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                               device.pcTerminalColor === ph.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                             }`}
                           >
                             {ph.label.toUpperCase()}
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'ipod' && (
                  <div className="flex flex-col gap-4 text-xs">
                    {/* Backlight color */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-mono text-[#141414] font-black uppercase">Retroilluminazione Schermo</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'monochrome-blue', label: 'Celeste Classic' },
                          { val: 'yellowish', label: 'Giallognolo ' },
                          { val: 'color-lcd', label: 'Colori LCD' },
                        ].map((b) => (
                          <button
                            key={b.val}
                            onClick={() => { playClick(1100, 0.03); handleUpdateDevice({ ipodBacklightColor: b.val as any }); }}
                            className={`py-1.5 px-2 rounded-none border-2 border-[#141414] font-black text-[9px] truncate cursor-pointer shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.ipodBacklightColor === b.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {b.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'gameboy' && (
                  <div className="flex flex-col gap-4 text-xs">
                    {/* Screen panel grid colors */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Riflessione Minerale Schermo</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'pea-soup', label: 'Classic Verde' },
                          { val: 'pocket-grey', label: 'Grey Pocket' },
                          { val: 'color', label: 'Color IPS' },
                        ].map((gbscr) => (
                          <button
                            key={gbscr.val}
                            onClick={() => { playClick(1100, 0.05); handleUpdateDevice({ gbScreenType: gbscr.val as any }); }}
                            className={`py-1.5 px-1 rounded-none border-2 border-[#141414] font-black text-[9.5px] truncate cursor-pointer shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.gbScreenType === gbscr.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {gbscr.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'playstation' && (
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="p-3 bg-white border-2 border-[#141414] rounded-none shadow-[3px_3px_0px_#141414]">
                      <div className="font-mono text-[10px] text-[#141414] font-black uppercase mb-2">Giochi Disponibili su CD (Seleziona)</div>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { val: 'crash', label: '🟠 Crash Bandicoot (1996)' },
                          { val: 'spyro', label: '🟣 Spyro the Dragon (1998)' },
                          { val: 'resident', label: '🔴 Resident Evil (1996)' },
                          { val: 'tomb_raider', label: '🟢 Tomb Raider II (1997)' },
                        ].map((d) => (
                          <button
                            key={d.val}
                            onClick={() => { playClick(1000, 0.03); handleUpdateDevice({ psDiscType: d.val as any, psLidOpen: true }); }}
                            className={`py-2 px-3 rounded-none text-left border-2 border-[#141414] font-black cursor-pointer transition-all shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.psDiscType === d.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {d.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'gamecube' && (
                  <div className="flex flex-col gap-4 text-xs">
                    {/* Badge Jewel Customizer toggle */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Badge Superiore (Jewel)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'gamecube', label: 'Logo Classic' },
                          { val: 'retro-sun', label: 'Sole Sole' },
                          { val: 'user-monogram', label: 'Monogramma' },
                        ].map((jw) => (
                          <button
                            key={jw.val}
                            onClick={() => { playClick(1000, 0.04); handleUpdateDevice({ gcJewelPlate: jw.val as any }); }}
                            className={`py-1.5 rounded-none border-2 border-[#141414] text-[10px] font-black cursor-pointer shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.gcJewelPlate === jw.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {jw.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex justify-between items-center p-3 bg-white border-2 border-[#141414] rounded-none shadow-[3px_3px_0px_#141414] mt-2">
                      <span className="text-[10px] font-extrabold text-[#141414]">CONNESSIONE PORTA 1</span>
                      <button
                        onClick={() => { playClick(1000, 0.05); handleUpdateDevice({ gcControllerConnected: !device.gcControllerConnected }); }}
                        className={`py-1 px-3 rounded-none text-[10px] cursor-pointer font-black border-2 border-[#141414] shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                          device.gcControllerConnected ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                        }`}
                      >
                        {device.gcControllerConnected ? 'CONNESSO' : 'DISCONNESSO'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedType === 'turntable' && (
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Stile Platina Vinile (Plinth)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'wood', label: 'Mogano' },
                          { val: 'metal', label: 'Silver Allun.' },
                          { val: 'neon', label: 'Rosa Pink' },
                        ].map((pl) => (
                          <button
                            key={pl.val}
                            onClick={() => { playClick(1000, 0.04); handleUpdateDevice({ turntablePlinthStyle: pl.val as any }); }}
                            className={`py-1.5 rounded-none border-2 border-[#141414] text-[10px] font-black cursor-pointer shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.turntablePlinthStyle === pl.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {pl.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'jukebox' && (
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-[#141414] font-black uppercase">Stile Neon Diner Lampeggiante</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'classic-rainbow', label: 'Arcobaleno' },
                          { val: 'cyber-neon', label: 'Cyberpunk' },
                          { val: 'sunset-orange', label: 'Sunset Red' },
                        ].map((comb) => (
                          <button
                            key={comb.val}
                            onClick={() => { playClick(1000, 0.05); handleUpdateDevice({ jukeboxNeonCombo: comb.val as any }); }}
                            className={`py-1.5 rounded-none border-2 border-[#141414] text-[10px] font-black truncate cursor-pointer shadow-[2px_2px_0px_#141414] active:translate-y-px active:shadow-none ${
                              device.jukeboxNeonCombo === comb.val ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                            }`}
                          >
                            {comb.label.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dedicated Custom Real Stream settings for Radio, TV, iPod, Turntable, Jukebox */}
                {['radio', 'tv', 'ipod', 'turntable', 'jukebox'].includes(selectedType) && (
                  <div className="mt-4 p-3 bg-white border-2 border-[#141414] rounded-none shadow-[3px_3px_0px_#141414]">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#141414] font-black uppercase mb-1.5">
                      <span>🔗 CONNETTI STREAMING REALE</span>
                      <span className="bg-[#F27D26] text-white text-[8px] px-1 py-0.2 rounded font-sans shrink-0 uppercase tracking-wide">Novità</span>
                    </div>
                    {selectedType === 'tv' ? (
                      <div className="flex flex-col gap-1.5 text-xs">
                        <p className="text-[9px] text-[#141414]/75 uppercase leading-normal font-mono mb-1">
                          Incolla un link Video YouTube per trasmetterlo direttamente sulla TV CRT con canali e ombre CRT dinamici!
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Es. https://www.youtube.com/watch?v=F_S9p-m8l4Y"
                            value={device.customVideoUrl || ''}
                            onChange={(e) => handleUpdateDevice({ customVideoUrl: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 font-mono text-[10px] bg-neutral-50 rounded-none border-2 border-[#141414] text-[#141414] outline-none placeholder:text-neutral-400"
                          />
                          {device.customVideoUrl && (
                            <button
                              onClick={() => { playClick(500, 0.1); handleUpdateDevice({ customVideoUrl: '' }); }}
                              className="px-2.5 py-1 bg-red-100 border-2 border-[#141414] font-black text-[9px] cursor-pointer"
                            >
                              RESET
                            </button>
                          )}
                        </div>
                        {/* YouTube Presets shortcuts */}
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-[8.5px] font-mono text-neutral-500 font-bold uppercase">Idee Canali Consigliate:</span>
                          <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-mono">
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customVideoUrl: 'https://www.youtube.com/watch?v=F_S9p-m8l4Y' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              📺 Spot Anni '80 Retro
                            </button>
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customVideoUrl: 'https://www.youtube.com/watch?v=yP_7gXQk7d8' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              🕹️ Console Arcade Games
                            </button>
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customVideoUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              🌇 Synthwave Sunset Drive
                            </button>
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customVideoUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              🌴 Lo-Fi Beats Chill Ambient
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 text-xs">
                        <p className="text-[9px] text-[#141414]/75 uppercase leading-normal font-mono mb-1">
                          Incolla un qualsiasi indirizzo URL MP3 diretto o radio stream sul web per riprodurlo dal vivo sui tuoi altoparlanti d'epoca!
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Es. https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                            value={device.customAudioUrl || ''}
                            onChange={(e) => handleUpdateDevice({ customAudioUrl: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 font-mono text-[10px] bg-neutral-50 rounded-none border-2 border-[#141414] text-[#141414] outline-none placeholder:text-neutral-400"
                          />
                          {device.customAudioUrl && (
                            <button
                              onClick={() => { playClick(500, 0.1); handleUpdateDevice({ customAudioUrl: '' }); }}
                              className="px-2.5 py-1 bg-red-100 border-2 border-[#141414] font-black text-[9px] cursor-pointer"
                            >
                              RESET
                            </button>
                          )}
                        </div>
                        {/* Audio Presets shortcuts */}
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-[8.5px] font-mono text-neutral-500 font-bold uppercase">Preset Audio Consigliati:</span>
                          <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-mono">
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              🎵 Retro Future Elec (Synth)
                            </button>
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              ☕ Lo-Fi Chillwave Acoustic
                            </button>
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              👾 Chiptune Game-Boy Wave
                            </button>
                            <button
                              onClick={() => { playClick(800, 0.05); handleUpdateDevice({ customAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }); }}
                              className="p-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 text-left truncate cursor-pointer"
                            >
                              🎸 Cadillac Garage Rock
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Web Export Section */}
          <div className="border-t-2 border-[#141414] bg-[#E4E3E0] p-4 flex flex-col gap-2.5 shadow-inner">
            <div>
              <span className="text-[10px] font-mono font-black text-[#141414] uppercase tracking-wider block mb-1">
                Esporta Sito Web Vintage Reale
              </span>
              <p className="text-[9px] font-mono text-[#141414]/70 leading-normal mb-2 uppercase">
                Ottieni un singolo file HTML autonomo con questo modello personalizzato interattivo con suoni, adesivi e giochi pronti all'uso!
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportVanillaHTML}
                className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white border-2 border-[#141414] py-2.5 px-3 rounded-none font-mono font-black text-xs uppercase cursor-pointer transition-all shadow-[3px_3px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141414] text-center flex items-center justify-center gap-1.5 animate-pulse hover:animate-none"
                title="Scarica il file singolo .html interattivo, standalone e pronto all'uso sul tuo computer!"
              >
                🌐 SCARICA DISPOSITIVO INTERATTIVO (.html)
              </button>
            </div>
          </div>

          {/* Device Saving Deck footer drawer area inside Sidebar */}
          <div className="border-t-2 border-dashed border-[#141414]/40 bg-[#E4E3E0] p-4 flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-mono font-black text-[#141414] uppercase tracking-wider block mb-1">
                Archivia nella mensola vintage locale
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Dai un titolo al tuo capolavoro..."
                  value={customDeviceName}
                  onChange={(e) => setCustomDeviceName(e.target.value)}
                  className="bg-white border-2 border-[#141414] rounded-none py-1.5 px-3 text-xs text-[#141414] focus:outline-none focus:border-[#F27D26] flex-1 font-mono font-black shadow-[2px_2px_0px_#141414]"
                />
                <button
                  onClick={handleSaveToShelf}
                  className="bg-[#F27D26] hover:bg-[#df6b15] text-white border-2 border-[#141414] px-4 py-1.5 rounded-none text-xs font-black tracking-wide cursor-pointer flex items-center gap-1.5 transition-all shadow-[3px_3px_0px_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141414]"
                  title="Salva temporaneamente questa personalizzazione nel browser"
                >
                  💾 SALVA
                </button>
              </div>
            </div>

            {/* Import / Export Single Blueprint Config */}
            <div className="border-t border-dashed border-[#141414]/30 pt-2.5 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-black text-[#141414] uppercase tracking-wider block">
                Esporta / Importa Schematica (.json)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportActive}
                  className="bg-white hover:bg-stone-50 text-[#141414] border-2 border-[#141414] py-1 px-2 rounded-none font-mono font-black text-[9px] uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#141414] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#141414] text-center"
                  title="Scarica la configurazione del dispositivo corrente completa di adesivi e opzioni"
                >
                  📤 ESPORTA ATTIVO
                </button>
                <label
                  className="bg-white hover:bg-stone-50 text-[#141414] border-2 border-[#141414] py-1 px-2 rounded-none font-mono font-black text-[9px] uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#141414] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#141414] text-center flex items-center justify-center gap-1"
                  title="Seleziona un file di schematica .json precedentemente esportato per attivarlo immediatamente"
                >
                  📥 IMPORTA FILE
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportActive}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Complete Library Options */}
            <div className="border-t border-dashed border-[#141414]/30 pt-2.5 flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-black text-[#141414]/70 uppercase tracking-wider block">
                Archivio Completo Mensola
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCollection}
                  className="bg-[#141414] hover:bg-[#2c2c2c] text-white py-1 px-1.5 text-[8.5px] rounded-none font-mono font-black cursor-pointer transition-all flex-1 text-center"
                  title="Esporta un backup completo di tutti i tuoi dispositivi d'epoca personalizzati"
                >
                  📦 BACKUP MENSOLA
                </button>
                <label
                  className="bg-[#141414] hover:bg-[#2c2c2c] text-white py-1 px-1.5 text-[8.5px] rounded-none font-mono font-black cursor-pointer transition-all flex-1 text-center flex items-center justify-center gap-1"
                  title="Carica un archivio di dispositivi scaricato in precedenza da sostituire"
                >
                  📂 CARICA BACKUP
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportCollection}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom section: La Mensola Vintage Collection drawers container */}
      <footer className="border-t-2 border-[#141414] bg-[#E4E3E0] p-6 select-none">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-3">
          
          <div className="flex justify-between items-center text-xs tracking-wider font-mono text-[#141414] uppercase font-black">
            <span>📚 LA MIA MENSOLA RETRO ({collection.length} ELEMENTI SALVATI)</span>
            <span className="text-[#141414]/70 italic normal-case font-bold">Finiture e adesivi sono persistiti nel browser</span>
          </div>

          {collection.length === 0 ? (
            <div className="rounded-none border-2 border-dashed border-[#141414] py-8 text-center text-xs text-[#141414]/70 tracking-wider font-bold bg-[#D9D7D2]">
              La tua mensola vintage è vuota. Crea e personalizza un dispositivo sopra, poi clicca &quot;SALVA&quot; per posizionarlo qui!
            </div>
          ) : (
            // The actual vintage shelf rendering rack list
            <div className="relative py-4 px-4 bg-[#D9D7D2] border-4 border-[#141414] rounded-none shadow-[4px_4px_0px_#141414] overflow-x-auto select-none min-h-[140px] flex gap-5 items-end scrollbar-thin">
              
              {collection.map((item) => {
                const info = BASE_DEVICES_INFO.find((b) => b.type === item.type);
                const isCurrent = device.id === item.id;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleLoadFromShelf(item)}
                    className={`shrink-0 w-36 h-28 rounded-none bg-white shadow-[3px_3px_0px_#141414] p-2.5 flex flex-col justify-between border-2 border-[#141414] cursor-pointer hover:bg-stone-50 hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#141414] transition-all relative group ${
                      isCurrent
                        ? 'ring-4 ring-[#F27D26]/60 bg-yellow-50/10'
                        : ''
                    }`}
                  >
                    {/* Floating Delete badge */}
                    <button
                      onClick={(e) => handleDeleteFromShelf(item.id, e)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-none bg-[#A52A2A] border-2 border-[#141414] text-white text-[10px] font-black flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Elimina"
                    >
                      ✕
                    </button>

                    <div className="flex justify-between items-start">
                      <span className="text-2xl">{info?.icon || '📟'}</span>
                      <span className="text-[7px] font-mono text-white bg-[#141414] px-1 py-0.2 rounded font-bold uppercase">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex flex-col mt-2">
                      <span className="text-[10px] font-black text-[#141414] truncate pr-2 leading-3 uppercase">
                        {item.name}
                      </span>
                      <span className="text-[7.5px] font-mono font-black text-[#141414]/60 uppercase mt-0.5 truncate select-none">
                        Ref.: {item.brand || 'VINTAGE'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Shelf bar background vector layer below shelf items */}
              <div className="absolute bottom-0 inset-x-0 h-2 bg-[#141414] shadow-md" />
            </div>
          )}
        </div>
      </footer>

      {/* Industrial status bar exactly matching the template's footer design specs */}
      <div className="h-10 bg-[#141414] text-[#E4E3E0] flex items-center px-6 justify-between text-[10px] uppercase font-mono font-black tracking-widest mt-auto shrink-0">
        <div className="flex gap-4 sm:gap-8 overflow-hidden">
          <span className="text-[#F27D26] animate-pulse">● SYSTEM ONLINE</span>
          <span className="hidden sm:inline">BUFFER: 4096KB</span>
          <span className="hidden md:inline">ENCODING: 32BIT_HE</span>
          <span className="hidden lg:inline">CORES: NEURAL_CRAFT</span>
        </div>
        <div className="flex gap-4 italic font-black">
          <span>STATION: DESIGNER_01</span>
        </div>
      </div>
    </div>
  );
}
