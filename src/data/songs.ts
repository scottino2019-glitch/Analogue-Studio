import { Song } from '../types';

export const RETRO_SONGS: Song[] = [
  {
    title: 'Neon Horizon',
    artist: 'Vector Highway',
    year: '1986',
    genre: 'synthpop',
    notes: ['Retro synths', '80s electric bass', 'Lively drum beat'],
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    title: 'Vapor Wave Escape',
    artist: 'T e l e p a t h',
    year: '1992',
    genre: 'lofi',
    notes: ['Sublime detuned chords', 'Slow groove', 'Cassette crackle'],
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    title: 'Chiptune Hero',
    artist: 'Pixel Kid 8Bit',
    year: '1989',
    genre: 'chiptune',
    notes: ['Square wave arpeggios', 'Triangle bass', 'Game Boy buzz'],
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    title: 'Detroit Retro Garage',
    artist: 'The Spark Plugs',
    year: '1979',
    genre: 'rock',
    notes: ['Overdriven guitar drive', 'Raw energetic rhythm', 'Vinyl pop'],
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    title: 'Starlight Diner',
    artist: 'Soda Fountain Kids',
    year: '1982',
    genre: 'synthpop',
    notes: ['Bouncing poly-synth', 'Catchy drum machine', 'FM bells'],
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    title: 'Midnight Arcade',
    artist: 'Laser Viper',
    year: '1984',
    genre: 'synthpop',
    notes: ['Fast driving bassline', 'Dramatically glowing lead', 'Gated reverberation'],
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  },
];

export const RETRO_STATIONS = [
  { freq: 89.2, name: 'Vintage Gold FM (Melodie degli Anni 70)', genre: 'rock', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { freq: 94.5, name: 'Chiptune Radio (Suoni a 8-Bit)', genre: 'chiptune', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { freq: 101.1, name: 'Vaporwave Airwaves (Lofi & Relax)', genre: 'lofi', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { freq: 106.8, name: 'Cyberpunk Neon Beats (Anni 80)', genre: 'synthpop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
];

export const RETRO_STICKERS = [
  { id: 'smiley', name: 'Original Smiley', emoji: '😊' },
  { id: 'sun', name: 'Summer Sun', emoji: '☀️' },
  { id: 'invader', name: 'Space Invader', emoji: '👾' },
  { id: 'cassette', name: 'Cassette Tape', emoji: '📼' },
  { id: 'cherry', name: 'Retro Cherry', emoji: '🍒' },
  { id: 'skull', name: 'Classic Skull', emoji: '💀' },
  { id: 'star', name: 'Pixel Star', emoji: '⭐' },
  { id: 'ufo', name: 'Retro UFO', emoji: '🛸' },
];

export const DEFAULT_DEVICES = {
  radio: {
    brand: 'PHONOLA',
    primaryColor: '#8B4513', // saddle_brown wood
    accentColor: '#DEB887', // burlwood beige
    bodyMaterial: 'wood',
    wearLevel: 'used',
    stickerId: 'sun',
    stickerX: 75,
    stickerY: 20,
    radioFrequency: 94.5,
    radioBand: 'FM',
    radioSpeakerGrill: 'retro-slots',
  },
  tv: {
    brand: 'SUPER-CHRON',
    primaryColor: '#2b2c30', // charcoal
    accentColor: '#ff4500', // orange-red
    bodyMaterial: 'wood',
    wearLevel: 'scratched',
    stickerId: null,
    stickerX: 85,
    stickerY: 85,
    tvChannel: 4,
    tvAntennaLength: 60,
    tvAntennaAngle: 15,
    tvStaticLevel: 0.45,
    tvVintageFilter: 'bw',
  },
  pc: {
    brand: 'IBM Vintage',
    primaryColor: '#ded5ca', // computer beige
    accentColor: '#00ff00', // phosphor green
    bodyMaterial: 'plastic',
    wearLevel: 'used',
    stickerId: 'invader',
    stickerX: 10,
    stickerY: 10,
    pcTerminalColor: 'green',
    pcBootOS: 'dos',
    pcHasFloppy: true,
    pcTypingText: '10 PRINT "RETRO CRAFT"\n20 GOTO 10\nRUN\n',
  },
  ipod: {
    brand: 'iPod Classic',
    primaryColor: '#e0e0e0', // sleek steel silver
    accentColor: '#1e3a8a', // dark blue screen tint
    bodyMaterial: 'metal',
    wearLevel: 'mint',
    stickerId: null,
    stickerX: 50,
    stickerY: 50,
    ipodBacklightColor: 'monochrome-blue',
    ipodClickwheelColor: '#ffffff',
    ipodSelectedSongIndex: 0,
    ipodPlaying: false,
  },
  gameboy: {
    brand: 'GAME BOY',
    primaryColor: '#8C92AC', // classic grey-blue
    accentColor: '#9C052E', // classic magenta buttons
    bodyMaterial: 'plastic',
    wearLevel: 'mint',
    stickerId: 'smiley',
    stickerX: 12,
    stickerY: 76,
    gbScreenType: 'pea-soup',
    gbButtonColor: '#9C052E',
    gbCartridgeGame: 'tetris',
    gbScreenState: 'on',
  },
  playstation: {
    brand: 'PLAYSTATION',
    primaryColor: '#AEB3B7', // gray
    accentColor: '#3B82F6', // laser blue
    bodyMaterial: 'plastic',
    wearLevel: 'mint',
    stickerId: null,
    stickerX: 40,
    stickerY: 40,
    psCaseColor: '#AEB3B7',
    psDiscType: 'crash',
    psLidOpen: false,
    psLogoGlow: true,
  },
  gamecube: {
    brand: 'GAMECUBE',
    primaryColor: '#534394', // classic indigo purple
    accentColor: '#E25822', // orange controllers/details
    bodyMaterial: 'plastic',
    wearLevel: 'mint',
    stickerId: 'cherry',
    stickerX: 80,
    stickerY: 80,
    gcCaseColor: '#534394',
    gcJewelPlate: 'gamecube',
    gcControllerConnected: true,
  },
  turntable: {
    brand: 'DARRARD',
    primaryColor: '#4A1D13', // dark mahogany
    accentColor: '#F59E0B', // brass gold
    bodyMaterial: 'wood',
    wearLevel: 'mint',
    stickerId: null,
    stickerX: 20,
    stickerY: 80,
    turntablePlinthStyle: 'wood',
    turntableVinylColor: '#121212',
    turntableSpeed: '33',
    turntableArmPosition: 'resting',
  },
  jukebox: {
    brand: 'WURLITZER',
    primaryColor: '#A855F7', // bright purple lights / wood base
    accentColor: '#EAB308', // yellow arcs
    bodyMaterial: 'wood',
    wearLevel: 'mint',
    stickerId: null,
    stickerX: 50,
    stickerY: 50,
    jukeboxNeonCombo: 'cyber-neon',
    jukeboxChromeReflections: true,
    jukeboxSelectedSong: 0,
  },
};
