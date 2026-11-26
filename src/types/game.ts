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

export const GRID_COLS = 20;
export const GRID_ROWS = 18;
export const CELL_SIZE = 14; // 280 x 252 logical canvas pixels

export const HIGH_SCORE_STORAGE_KEY = 'memesnake3310_highscore';
export const MUTE_STORAGE_KEY = 'memesnake3310_muted';

export const FOOD_DEFINITIONS: Record<FoodKind, FoodDefinition> = {
  pulihora: {
    kind: 'pulihora',
    emoji: '🍛',
    label: 'Pulihora',
    shortEffect: '+1 PT',
    description: 'Classic temple pulihora. Steady fuel, zero side effects.',
    memeQuip: 'Pulihora kalipav ga!',
    points: 1,
    weight: 40,
  },
  ghost_pepper: {
    kind: 'ghost_pepper',
    emoji: '🌶️',
    label: 'Ghost Pepper',
    shortEffect: 'SPRINT 4S',
    description: 'Guntur Mirchi heat! Snake sprints at turbo speed for 4 seconds.',
    memeQuip: 'Guntur Mirchi! Rocket speed!',
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
    description: 'Out-of-syllabus question! Reverses all directions for 5 seconds.',
    memeQuip: 'Syllabus bayata nundi vachindi!',
    points: 3,
    effectType: 'REVERSE',
    effectDurationMs: 5000,
    weight: 15,
  },
  midnight_biryani: {
    kind: 'midnight_biryani',
    emoji: '🍕',
    label: 'Midnight Biryani',
    shortEffect: '2X PTS 6S',
    description: 'Late-night dum feast! Doubles all points earned for 6 seconds.',
    memeQuip: '2AM Dum Feast! Double dhamaka!',
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
    description: 'Charminar chai break. Slows speed briefly for clutch dodging.',
    memeQuip: 'Chai break mowa, relax!',
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

export const GAME_OVER_QUOTES: string[] = [
  'Emotional Damage!',
  'You had one job!',
  'System crash: 0 brain cells detected',
  'Aipoindi... Everything is gone!',
  'Bokka paddadi! Wall tho romance aa?',
  'Taggadele... except you just crashed!',
  'Ee sala cup namde... next time!',
  'Control thappindi mowa!',
  'Brain.exe stopped working',
  'Amma baboi! Self-bite ah?!',
];
