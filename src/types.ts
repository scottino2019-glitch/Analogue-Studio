export type DeviceType =
  | 'radio'
  | 'tv'
  | 'pc'
  | 'ipod'
  | 'gameboy'
  | 'playstation'
  | 'gamecube'
  | 'turntable'
  | 'jukebox';

export type WearLevel = 'mint' | 'used' | 'scratched' | 'rusty';

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
}

export interface RetroDevice {
  id: string;
  name: string;
  type: DeviceType;
  brand: string;
  // Common visual configurations
  primaryColor: string;
  accentColor: string;
  bodyMaterial: 'plastic' | 'metal' | 'wood' | 'translucent';
  wearLevel: WearLevel;
  stickerId: string | null;
  stickerX: number; // percentage
  stickerY: number;

  // Radio Specifics
  radioFrequency: number; // 88 to 108 MHz
  radioBand: 'AM' | 'FM';
  radioSpeakerGrill: 'horizontal' | 'mesh' | 'retro-slots';

  // TV Specifics
  tvChannel: number; // 2 - 12
  tvAntennaLength: number; // 10% to 100%
  tvAntennaAngle: number; // -45 to 45 deg
  tvStaticLevel: number; // 0 to 1
  tvVintageFilter: 'bw' | 'warm-color' | 'sepia' | 'cyberpunk';

  // PC Specifics
  pcTerminalColor: 'green' | 'amber' | 'cyan' | 'white';
  pcBootOS: 'dos' | 'system7' | 'retro-cyber';
  pcHasFloppy: boolean;
  pcTypingText: string;

  // iPod / MP3 Specifics
  ipodBacklightColor: 'monochrome-blue' | 'yellowish' | 'color-lcd';
  ipodClickwheelColor: string;
  ipodSelectedSongIndex: number;
  ipodPlaying: boolean;

  // Gameboy Specifics
  gbScreenType: 'pea-soup' | 'pocket-grey' | 'color';
  gbButtonColor: string;
  gbCartridgeGame: 'tetris' | 'space-battle' | 'classic-snake';
  gbScreenState: 'on' | 'off';

  // Playstation Specifics
  psCaseColor: string; // Classic Gray, Net Yaroze Black, Debug Green
  psDiscType: 'crash' | 'spyro' | 'resident' | 'tomb_raider';
  psLidOpen: boolean;
  psLogoGlow: boolean;

  // Gamecube Specifics
  gcCaseColor: string; // Indigo, Jet Black, Spice Orange, Platinum
  gcJewelPlate: 'gamecube' | 'retro-sun' | 'user-monogram';
  gcControllerConnected: boolean;

  // Turntable Specifics
  turntablePlinthStyle: 'wood' | 'metal' | 'neon';
  turntableVinylColor: string;
  turntableSpeed: '33' | '45' | '78';
  turntableArmPosition: 'resting' | 'playing' | 'end';

  // Jukebox Specifics
  jukeboxNeonCombo: 'cyber-neon' | 'sunset-orange' | 'classic-rainbow';
  jukeboxChromeReflections: boolean;
  jukeboxSelectedSong: number;

  // Real-world media integration
  customAudioUrl?: string;
  customVideoUrl?: string;
}

export interface Song {
  title: string;
  artist: string;
  year: string;
  genre: string;
  notes: string[]; // step sequence or instructions for the retro noise synth to perform
  streamUrl?: string;
}
