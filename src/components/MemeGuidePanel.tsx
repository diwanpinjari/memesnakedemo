import React from 'react';
import { Volume2, VolumeX, RotateCcw, Grid3X3, Shield, Repeat } from 'lucide-react';
import {
  FOOD_DEFINITIONS,
  FoodKind,
  GameMode,
  MemeReaction,
  WallMode,
} from '../types/game';
import { MEME_IMAGE_PATHS } from '../types/memeImages';

interface MemeGuidePanelProps {
  gameMode: GameMode;
  score: number;
  highScore: number;
  speedLevel: number;
  wallMode: WallMode;
  muted: boolean;
  showStrongGrid: boolean;
  memeReaction: MemeReaction;
  onToggleMute: () => void;
  onToggleWallMode: () => void;
  onToggleGrid: () => void;
  onRestart: () => void;
}

const ORDERED_FOODS: FoodKind[] = [
  'pulihora',
  'ghost_pepper',
  'hard_exam',
  'midnight_biryani',
  'irani_chai',
];

export const MemeGuidePanel: React.FC<MemeGuidePanelProps> = ({
  gameMode,
  score,
  highScore,
  speedLevel,
  wallMode,
  muted,
  showStrongGrid,
  memeReaction,
  onToggleMute,
  onToggleWallMode,
  onToggleGrid,
  onRestart,
}) => {
  const isClassic = gameMode === 'CLASSIC';

  return (
    <aside className="w-full max-w-[440px] space-y-5 text-slate-200">
      {/* Title & Clean Intro */}
      <div className="border-b border-slate-800 pb-4">
        <p className={`text-xs font-medium tracking-wide ${isClassic ? 'text-white' : 'text-[#9bbc0f]'}`}>
          {isClassic ? 'Nokia 3310 Arcade · Classic B&W Mode' : 'Nokia 3310 Arcade · Telugu Meme Edition'}
        </p>
        <h1 className="mt-1.5 font-pixel text-2xl font-bold tracking-tight text-white">
          {isClassic ? 'Classic Snake 3310' : 'MemeSnake 3310'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {isClassic
            ? 'Pure black-and-white pixel Snake with standard food pellets, authentic 8-bit square-wave beeps, and progressive speed every 5 points.'
            : 'Retro pixel Snake with Guntur Mirchi speed panic, out-of-syllabus reverse chaos, 2AM Biryani buffs, and live situation meme reactions.'}
        </p>
      </div>

      {/* Live Scoreboard Strip */}
      <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs text-slate-400">Score</p>
          <p className="mt-1 font-pixel text-xl font-bold tabular-nums text-white">
            {score}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">High Score</p>
          <p className={`mt-1 font-pixel text-xl font-bold tabular-nums ${isClassic ? 'text-white' : 'text-[#9bbc0f]'}`}>
            {highScore}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Speed</p>
          <p className="mt-1 font-pixel text-xl font-bold tabular-nums text-white">
            Lv.{speedLevel}
          </p>
        </div>
      </div>

      {/* Live Situational Meme Reaction Card */}
      {!isClassic && (
        <div className="flex items-center gap-3.5 rounded-xl border border-[#9bbc0f]/35 bg-[#171b22] p-3 shadow-md">
          <img
            src={MEME_IMAGE_PATHS[memeReaction.imageKey]}
            alt={memeReaction.badge}
            className="h-20 w-20 shrink-0 rounded-lg border border-[#9bbc0f]/50 bg-[#0e1116] object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="min-w-0 space-y-1.5">
            <span className="inline-block rounded bg-[#9bbc0f] px-2 py-0.5 font-pixel text-[9px] font-bold tracking-wide text-[#0f380f]">
              {memeReaction.badge}
            </span>
            <p className="text-sm font-semibold leading-snug text-white">
              &ldquo;{memeReaction.dialogue}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Quick Hardware Preferences */}
      <div className="space-y-3 border-b border-slate-800 pb-4">
        <h2 className="text-sm font-semibold text-white">Arcade Controls</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700/80 focus-visible:outline-2 focus-visible:outline-[#9bbc0f]"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-[#9bbc0f]" />}
            <span>{muted ? 'Audio Muted' : 'Audio On'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleWallMode}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700/80 focus-visible:outline-2 focus-visible:outline-[#9bbc0f]"
          >
            {wallMode === 'SOLID' ? (
              <Shield className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Repeat className="h-3.5 w-3.5 text-[#9bbc0f]" />
            )}
            <span>{wallMode === 'SOLID' ? 'Walls: Classic Box' : 'Walls: Portal Wrap'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleGrid}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700/80 focus-visible:outline-2 focus-visible:outline-[#9bbc0f]"
          >
            <Grid3X3 className="h-3.5 w-3.5 text-slate-300" />
            <span>{showStrongGrid ? 'Grid: Sharp' : 'Grid: Soft'}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700/80 focus-visible:outline-2 focus-visible:outline-[#9bbc0f]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-300" />
            <span>Reset Run</span>
          </button>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Keyboard: Arrow Keys or WASD · Phone keys 2 (Up), 4 (Left), 6 (Right), 8 (Down) · Press 5 or Space to Start / Pause / Retry.
        </p>
      </div>

      {/* Mode Rules / Food Menu */}
      {isClassic ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Classic Mode Rules</h2>
          <div className="divide-y divide-slate-800/80 border-y border-slate-800/80">
            <div className="py-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                <span>Regular Food Pellet</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="font-pixel text-[10px] text-white">+1 PT</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Pure black-and-white pixel pellet with zero power-ups or control reversals.
              </p>
            </div>
            <div className="py-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                <span>Classic 8-Bit Beeps</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="font-pixel text-[10px] text-white">SQUARE WAVE</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Authentic single-tone Nokia keypad chirps, eat blips, and crash sequence.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Tiffin &amp; Chaos Menu</h2>
          <div className="divide-y divide-slate-800/80 border-y border-slate-800/80">
            {ORDERED_FOODS.map((kind) => {
              const item = FOOD_DEFINITIONS[kind];
              return (
                <div key={kind} className="flex items-start justify-between gap-3 py-2">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg leading-none pt-0.5" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                        <span>{item.label}</span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="font-pixel text-[10px] text-[#9bbc0f]">
                          {item.shortEffect}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
