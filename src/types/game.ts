export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type GameMode = 'MEME' | 'CLASSIC';

export type WallMode = 'SOLID' | 'WRAP';

export interface Point {
  x: number;
  y: number;
}

export type FoodKind =
  | 'pulihora'
  | 'ghost_pepper'
  | 'hard_exam'
  | 'midnight_biryani'
  | 'irani_chai';

export type ActiveEffectType = 'SPRINT' | 'REVERSE' | 'DOUBLE_POINTS' | 'SLOW_MO';

export interface ActiveEffect {
  type: ActiveEffectType;
  label: string;
  expiresAt: number;
  durationMs: number;
}

export interface FoodDefinition {
  kind: FoodKind;
  emoji: string;
  label: string;
  shortEffect: string;
  description: string;
  memeQuip: string;
  points: number;
  effectType?: ActiveEffectType;
  effectDurationMs?: number;
  weight: number;
}

export interface FoodItem {
  position: Point;
  definition: FoodDefinition;
  spawnedAt: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  createdAt: number;
}

export type MemeImageKey =
  | 'ready'
  | 'sprint'
  | 'reverse'
  | 'feast'
  | 'chill'
  | 'bonk'
  | 'selfbite';

export type MemeSituation =
  | 'READY'
  | 'PULIHORA'
  | 'SPRINT'
  | 'REVERSE'
  | 'DOUBLE_POINTS'
  | 'SLOW_MO'
  | 'LEVEL_UP'
  | 'PAUSED'
  | 'CRASH_WALL'
  | 'CRASH_SELF'
  | 'CRASH_REVERSE'
  | 'CRASH_SPRINT'
  | 'CRASH_EARLY'
  | 'CRASH_HIGH_SCORE';

export type DeathReason = 'WALL' | 'SELF';

export interface MemeReaction {
  situation: MemeSituation;
  imageKey: MemeImageKey;
  badge: string;
  dialogue: string;
}

export const GRID_COLS = 20;
export const GRID_ROWS = 18;
export const CELL_SIZE = 14; // 280 x 252 logical canvas pixels

export const HIGH_SCORE_STORAGE_KEY = 'memesnake3310_highscore';
export const MUTE_STORAGE_KEY = 'memesnake3310_muted';

export const FOOD_DEFINITIONS: Record<FoodKind, FoodDefinition> = {
  pulihora: {
    kind: 'pulihora',
    emoji: '🍛',
    label: 'Temple Pulihora',
    shortEffect: '+1 PT',
    description: 'Steady survival fuel. Zero drama, pure +1 point.',
    memeQuip: 'Simple ga +1! Tension em ledu.',
    points: 1,
    weight: 40,
  },
  ghost_pepper: {
    kind: 'ghost_pepper',
    emoji: '🌶️',
    label: 'Guntur Mirchi',
    shortEffect: 'SPRINT 4S',
    description: 'Extreme mirchi spice! Rocket speed for 4 seconds—hold tight.',
    memeQuip: 'Brakes fail ayyayi! Aa speed enti ra babu?!',
    points: 2,
    effectType: 'SPRINT',
    effectDurationMs: 4000,
    weight: 18,
  },
  hard_exam: {
    kind: 'hard_exam',
    emoji: '🪨',
    label: 'Hard Exam',
    shortEffect: 'REVERSE 5S',
    description: 'Out-of-syllabus question! Flips all controls for 5 seconds.',
    memeQuip: 'Idi syllabus lo ledu ani cheppaleda Ramakrishna?!',
    points: 3,
    effectType: 'REVERSE',
    effectDurationMs: 5000,
    weight: 15,
  },
  midnight_biryani: {
    kind: 'midnight_biryani',
    emoji: '🍗',
    label: '2AM Dum Biryani',
    shortEffect: '2X PTS 6S',
    description: 'Late-night dum feast! Doubles all points earned for 6 seconds.',
    memeQuip: '2AM ki Dum Biryani dorikindi! Ika full rampage!',
    points: 2,
    effectType: 'DOUBLE_POINTS',
    effectDurationMs: 6000,
    weight: 17,
  },
  irani_chai: {
    kind: 'irani_chai',
    emoji: '☕',
    label: 'Irani Chai',
    shortEffect: 'CHILL 4S',
    description: 'Charminar chai break. Slows speed for 4 seconds for clutch turns.',
    memeQuip: 'Hammayya... praanam lechi ochindi! Slow-mo clutch!',
    points: 1,
    effectType: 'SLOW_MO',
    effectDurationMs: 4000,
    weight: 10,
  },
};

export const CLASSIC_FOOD_DEFINITION: FoodDefinition = {
  kind: 'pulihora',
  emoji: '▪',
  label: 'Food',
  shortEffect: '+1 PT',
  description: 'Standard classic Nokia food pellet.',
  memeQuip: 'Classic Nokia Snake',
  points: 1,
  weight: 100,
};

interface SituationConfig {
  imageKey: MemeImageKey;
  badge: string;
  dialogues: string[];
}

export const MEME_SITUATION_CONFIG: Record<MemeSituation, SituationConfig> = {
  READY: {
    imageKey: 'ready',
    badge: 'GAME READY',
    dialogues: [
      'Babu ready... high score kottadaniki vasthunna!',
      'Press 5! Ee sari record break cheyyadam pakka.',
    ],
  },
  PULIHORA: {
    imageKey: 'ready',
    badge: 'STEADY FUEL',
    dialogues: [
      'Simple ga +1! Safe game aaduthunnam.',
      'No twists, no tension — pure survival fuel!',
      'Idhe pace lo pothe record pakka!',
    ],
  },
  SPRINT: {
    imageKey: 'sprint',
    badge: 'TURBO PANIC',
    dialogues: [
      'Brakes fail ayyayi! Aa speed enti ra babu?!',
      'Guntur Mirchi heat! Flight ekkuthava enti?!',
      'Fingers ready ga unchuko, rocket launch ayyindi!',
    ],
  },
  REVERSE: {
    imageKey: 'reverse',
    badge: 'OUT OF SYLLABUS',
    dialogues: [
      'Idi syllabus lo ledu ani cheppaleda Ramakrishna?!',
      'Left kodithe right pothundi entra?! Total brain jam!',
      'Invigilator strict ga chustunnadu, controls ulta ayyayi!',
    ],
  },
  DOUBLE_POINTS: {
    imageKey: 'feast',
    badge: '2X BIRYANI BUFF',
    dialogues: [
      '2AM ki Dum Biryani dorikindi! Ika full rampage!',
      'Double points active! Ee chance miss cheyyaku!',
      'Full meals + bonus points — life set ayipoyindi!',
    ],
  },
  SLOW_MO: {
    imageKey: 'chill',
    badge: 'CHAI CLUTCH',
    dialogues: [
      'Hammayya... praanam lechi ochindi! Slow-mo clutch!',
      'Tension padaku, chai thaagi smooth ga turn theesko.',
      'Speed taggindi, ippudu pro player mode on!',
    ],
  },
  LEVEL_UP: {
    imageKey: 'ready',
    badge: 'SPEED LEVEL UP',
    dialogues: [
      'Level perigindi! Ika game serious mode loki vellindi!',
      'Speed pencharu! Finger reflexes test start!',
      'Next gear vachindi — concentration miss avvaku!',
    ],
  },
  PAUSED: {
    imageKey: 'chill',
    badge: 'CHAI BREAK',
    dialogues: [
      'Urgent call vachinda? Pause chesi mellaga ra.',
      'Chai break teeskuni malli continue cheddam.',
      'Snake waiting lo undi... quick break ah?',
    ],
  },
  CRASH_WALL: {
    imageKey: 'bonk',
    badge: 'WALL BONK',
    dialogues: [
      'Wall kanapadaleda ledha brake lu pani cheyyaleda?!',
      'Direct ga goda ki headbutt ichav ga!',
      'Physics class lo inertia vinakapothe ilage untadi.',
      'Turning radius miss ayyindi... seedha wall loki!',
    ],
  },
  CRASH_SELF: {
    imageKey: 'selfbite',
    badge: 'SELF-BITE',
    dialogues: [
      'Aakali ekkuva aithe sontha body ne thintava?!',
      'Nuvve vesina traffic jam lo nuvve irukkunnav!',
      'Tail ki head ki difference marchipoyava?!',
      'Friendly fire on chesukunnav ga, self-goal!',
    ],
  },
  CRASH_REVERSE: {
    imageKey: 'reverse',
    badge: 'EXAM BACKLOG',
    dialogues: [
      'Left nokkithe right poyindi... paper motham blank!',
      'Out-of-syllabus debba! Controls artham ayyelopu out!',
      'Supply exam rasinattu undi... straight ga fail!',
    ],
  },
  CRASH_SPRINT: {
    imageKey: 'sprint',
    badge: 'OVER-SPEEDING',
    dialogues: [
      'Over-speeding challan padindi... direct crash!',
      'Guntur Mirchi heat tattukoleka wall ki guddesav!',
      'Nitrous on chesav sare, steering evaru pattukuntaru?!',
    ],
  },
  CRASH_EARLY: {
    imageKey: 'bonk',
    badge: 'INSTANT OUT',
    dialogues: [
      'Start chesina 5 seconds ke out aa? Speedrun chestunnava?!',
      'Warm-up kuda avvaledu appude pack up aa?!',
      'Trial ball lo ne clean bowled ayyav ga!',
    ],
  },
  CRASH_HIGH_SCORE: {
    imageKey: 'feast',
    badge: 'NEW RECORD!',
    dialogues: [
      'Out ayina parledu — New High Score kottesam!',
      'History created! Ee score break cheyyadam kashtam!',
      'Champion exit! New record pettesi out ayyav!',
    ],
  },
};

export function pickMemeReaction(situation: MemeSituation): MemeReaction {
  const cfg = MEME_SITUATION_CONFIG[situation];
  const dialogue =
    cfg.dialogues[Math.floor(Math.random() * cfg.dialogues.length)];
  return {
    situation,
    imageKey: cfg.imageKey,
    badge: cfg.badge,
    dialogue,
  };
}
