import React, { useEffect, useRef } from 'react';
import {
  ActiveEffect,
  CELL_SIZE,
  Direction,
  FloatingText,
  FoodItem,
  GameMode,
  GameState,
  GRID_COLS,
  GRID_ROWS,
  Point,
  WallMode,
} from '../types/game';

interface NokiaScreenProps {
  gameState: GameState;
  gameMode: GameMode;
  snake: Point[];
  direction: Direction;
  food: FoodItem;
  score: number;
  highScore: number;
  speedLevel: number;
  wallMode: WallMode;
  muted: boolean;
  showStrongGrid: boolean;
  activeEffects: ActiveEffect[];
  floatingTexts: FloatingText[];
  statusMessage: string;
  gameOverQuote: string;
  isNewHighScore: boolean;
  nowMs: number;
  onStartGame: () => void;
  onResumeGame: () => void;
  onTryAgain: () => void;
  onSwipeDirection: (dir: Direction) => void;
}

function padScore(val: number): string {
  return Math.max(0, val).toString().padStart(4, '0');
}

export const NokiaScreen: React.FC<NokiaScreenProps> = ({
  gameState,
  gameMode,
  snake,
  direction,
  food,
  score,
  highScore,
  speedLevel,
  wallMode,
  muted,
  showStrongGrid,
  activeEffects,
  floatingTexts,
  statusMessage,
  gameOverQuote,
  isNewHighScore,
  nowMs,
  onStartGame,
  onResumeGame,
  onTryAgain,
  onSwipeDirection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isClassic = gameMode === 'CLASSIC';
  const isReversed = !isClassic && activeEffects.some((e) => e.type === 'REVERSE');
  const isSprinting = !isClassic && activeEffects.some((e) => e.type === 'SPRINT');
  const isDoublePoints = !isClassic && activeEffects.some((e) => e.type === 'DOUBLE_POINTS');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = GRID_COLS * CELL_SIZE;
    const height = GRID_ROWS * CELL_SIZE;

    const bgColor = isClassic ? '#ffffff' : '#9bbc0f';
    const darkInk = isClassic ? '#000000' : '#0f380f';
    const midInk = isClassic ? '#000000' : '#306230';
    const gridColor = isClassic
      ? showStrongGrid
        ? 'rgba(0, 0, 0, 0.16)'
        : 'rgba(0, 0, 0, 0.08)'
      : showStrongGrid
        ? 'rgba(15, 56, 15, 0.16)'
        : 'rgba(15, 56, 15, 0.08)';

    // 1. LCD Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Retro pixel grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= GRID_COLS; c++) {
      const x = c * CELL_SIZE + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = r * CELL_SIZE + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Optional warning border blink during Hard Exam (Reverse) or Sprint (Meme Mode only)
    if (!isClassic && gameState === 'PLAYING' && (isReversed || isSprinting)) {
      const blinkOn = Math.floor(nowMs / 220) % 2 === 0;
      if (blinkOn) {
        ctx.strokeStyle = isReversed ? darkInk : midInk;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
      }
    }

    // 3. Draw Food item
    const fx = food.position.x * CELL_SIZE;
    const fy = food.position.y * CELL_SIZE;
    const pulse = Math.floor(nowMs / 280) % 2 === 0;

    if (isClassic) {
      // Pure black-and-white classic Nokia 4-pixel diamond pellet
      ctx.fillStyle = '#000000';
      const c = Math.floor(CELL_SIZE / 2);
      ctx.fillRect(fx + c - 2, fy + 2, 4, 3); // top
      ctx.fillRect(fx + c - 2, fy + CELL_SIZE - 5, 4, 3); // bottom
      ctx.fillRect(fx + 2, fy + c - 2, 3, 4); // left
      ctx.fillRect(fx + CELL_SIZE - 5, fy + c - 2, 3, 4); // right
    } else {
      if (food.definition.kind !== 'pulihora') {
        ctx.fillStyle = pulse ? darkInk : midInk;
        ctx.fillRect(fx + 1, fy + 1, 3, 1);
        ctx.fillRect(fx + 1, fy + 1, 1, 3);
        ctx.fillRect(fx + CELL_SIZE - 4, fy + CELL_SIZE - 2, 3, 1);
        ctx.fillRect(fx + CELL_SIZE - 2, fy + CELL_SIZE - 4, 1, 3);
      }

      ctx.font = `${CELL_SIZE - 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const bobOffset = pulse ? -0.5 : 0.5;
      ctx.fillText(
        food.definition.emoji,
        fx + CELL_SIZE / 2,
        fy + CELL_SIZE / 2 + 1 + bobOffset
      );
    }

    // 4. Draw Snake segments
    snake.forEach((segment, idx) => {
      const sx = segment.x * CELL_SIZE;
      const sy = segment.y * CELL_SIZE;
      const isHead = idx === 0;
      const isTail = idx === snake.length - 1;

      if (isHead) {
        ctx.fillStyle = darkInk;
        ctx.fillRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        // Eyes carved out in background color
        ctx.fillStyle = bgColor;
        if (direction === 'RIGHT') {
          ctx.fillRect(sx + CELL_SIZE - 5, sy + 3, 2, 2);
          ctx.fillRect(sx + CELL_SIZE - 5, sy + CELL_SIZE - 5, 2, 2);
        } else if (direction === 'LEFT') {
          ctx.fillRect(sx + 3, sy + 3, 2, 2);
          ctx.fillRect(sx + 3, sy + CELL_SIZE - 5, 2, 2);
        } else if (direction === 'UP') {
          ctx.fillRect(sx + 3, sy + 3, 2, 2);
          ctx.fillRect(sx + CELL_SIZE - 5, sy + 3, 2, 2);
        } else {
          ctx.fillRect(sx + 3, sy + CELL_SIZE - 5, 2, 2);
          ctx.fillRect(sx + CELL_SIZE - 5, sy + CELL_SIZE - 5, 2, 2);
        }

        if (gameState === 'PLAYING' && Math.floor(nowMs / 180) % 3 === 0) {
          ctx.fillStyle = darkInk;
          if (direction === 'RIGHT') ctx.fillRect(sx + CELL_SIZE - 1, sy + 6, 2, 2);
          if (direction === 'LEFT') ctx.fillRect(sx - 1, sy + 6, 2, 2);
          if (direction === 'UP') ctx.fillRect(sx + 6, sy - 1, 2, 2);
          if (direction === 'DOWN') ctx.fillRect(sx + 6, sy + CELL_SIZE - 1, 2, 2);
        }
      } else {
        const useMidTone = !isClassic && isDoublePoints && idx % 2 === 1;
        ctx.fillStyle = useMidTone ? midInk : darkInk;
        const pad = isTail ? 2.5 : 1.5;
        ctx.fillRect(sx + pad, sy + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2);

        if (!isTail && idx % 2 === 0) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(sx + CELL_SIZE / 2 - 1, sy + CELL_SIZE / 2 - 1, 2, 2);
        }
      }
    });

    // 5. Floating retro score / effect popups inside canvas
    floatingTexts.forEach((ft) => {
      const age = nowMs - ft.createdAt;
      if (age < 0 || age > 950) return;
      const lift = (age / 950) * 14;
      const px = Math.min(Math.max(ft.x * CELL_SIZE + CELL_SIZE / 2, 28), width - 28);
      const py = Math.max(ft.y * CELL_SIZE - lift, 10);

      ctx.font = 'bold 10px Silkscreen, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = bgColor;
      ctx.fillText(ft.text, px + 1, py + 1);
      ctx.fillStyle = darkInk;
      ctx.fillText(ft.text, px, py);
    });
  }, [
    isClassic,
    snake,
    direction,
    food,
    gameState,
    showStrongGrid,
    isReversed,
    isSprinting,
    isDoublePoints,
    floatingTexts,
    nowMs,
  ]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || gameState !== 'PLAYING') return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      onSwipeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      onSwipeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
  };

  const primaryEffect = !isClassic ? activeEffects[0] ?? null : null;
  const primaryEffectRemaining = primaryEffect
    ? Math.max(0, (primaryEffect.expiresAt - nowMs) / 1000)
    : 0;
  const primaryEffectRatio = primaryEffect
    ? Math.min(100, Math.max(0, ((primaryEffect.expiresAt - nowMs) / primaryEffect.durationMs) * 100))
    : 0;

  return (
    <div
      className={`relative w-full rounded-[6px] border-[2px] overflow-hidden select-none ${
        isClassic
          ? 'border-black bg-white text-black shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]'
          : 'border-[#0f380f]/80 bg-[#9bbc0f] text-[#0f380f] shadow-[inset_0_3px_10px_rgba(15,56,15,0.35)]'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle LCD dot-matrix overlay */}
      <div className="pointer-events-none absolute inset-0 lcd-pixel-overlay z-20" />
      {/* Top-left subtle glass reflection */}
      <div className="pointer-events-none absolute -top-12 -left-10 h-32 w-56 rotate-[-18deg] bg-white/10 z-20" />

      {/* Top LCD Status Bar */}
      <div
        className={`relative z-10 flex items-center justify-between border-b px-2 py-1 font-pixel text-[10px] leading-none tracking-tight ${
          isClassic ? 'border-black/40' : 'border-[#0f380f]/35'
        }`}
      >
        <div className="flex items-center gap-2 tabular-nums">
          <span>SC:{padScore(score)}</span>
          <span className={isClassic ? 'text-black/70' : 'text-[#306230]'}>
            HI:{padScore(highScore)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px]">
          <span className="tabular-nums">LV{speedLevel}</span>
          <span>·</span>
          <span>{wallMode === 'WRAP' ? 'WRAP' : 'BOX'}</span>
          <span>·</span>
          <span>{muted ? 'MUTE' : 'SFX'}</span>
        </div>
      </div>

      {/* Active Twist / Power-up Bar */}
      <div
        className={`relative z-10 flex items-center justify-between border-b px-2 py-0.5 font-pixel text-[9px] leading-tight ${
          isClassic
            ? 'border-black/25 bg-black/[0.04]'
            : 'border-[#0f380f]/25 bg-[#8bac0f]/45'
        }`}
      >
        {primaryEffect ? (
          <>
            <span className="truncate font-bold">
              {primaryEffect.type === 'REVERSE' ? '! ' : ''}
              {primaryEffect.label}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-1.5 w-14 border border-[#0f380f] bg-[#9bbc0f]">
                <div
                  className="h-full bg-[#0f380f]"
                  style={{ width: `${primaryEffectRatio}%` }}
                />
              </div>
              <span className="tabular-nums w-7 text-right">
                {primaryEffectRemaining.toFixed(1)}s
              </span>
            </div>
          </>
        ) : (
          <div className="flex w-full items-center justify-between">
            <span className="truncate">
              {isClassic ? 'CLASSIC NOKIA SNAKE' : statusMessage}
            </span>
            <span className={`shrink-0 ml-1 ${isClassic ? 'text-black' : 'text-[#306230]'}`}>
              {isClassic
                ? '+1 PT'
                : `${food.definition.emoji} ${food.definition.shortEffect}`}
            </span>
          </div>
        )}
      </div>

      {/* Game Canvas Area */}
      <div
        className={`relative z-10 flex items-center justify-center p-1 ${
          isClassic ? 'bg-white' : 'bg-[#9bbc0f]'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={GRID_COLS * CELL_SIZE}
          height={GRID_ROWS * CELL_SIZE}
          className={`block w-full max-w-[280px] aspect-[20/18] border ${
            isClassic ? 'border-black/70' : 'border-[#0f380f]/60'
          }`}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* TITLE MENU OVERLAY */}
        {gameState === 'TITLE_MENU' && (
          <div
            className={`absolute inset-1 z-30 flex flex-col items-center justify-between p-3 text-center ${
              isClassic ? 'bg-white/95 text-black' : 'bg-[#9bbc0f]/95 text-[#0f380f]'
            }`}
          >
            <div
              className={`w-full border-b pb-1.5 ${
                isClassic ? 'border-black/40' : 'border-[#0f380f]/35'
              }`}
            >
              <p
                className={`font-pixel text-[9px] tracking-wider ${
                  isClassic ? 'text-black/70' : 'text-[#306230]'
                }`}
              >
                {isClassic ? 'CLASSIC B&W EDITION' : 'NOKIA 3310 EDITION'}
              </p>
              <h2 className="mt-0.5 font-pixel text-base font-bold tracking-tight">
                {isClassic ? 'SNAKE 3310' : 'MEMESNAKE'}
              </h2>
            </div>

            {isClassic ? (
              <div className="my-auto space-y-2 font-lcd text-[16px] leading-tight text-black">
                <p className="font-bold">Pure Classic Rules:</p>
                <div className="space-y-0.5 text-[15px]">
                  <p>Black &amp; White Pixel Grid</p>
                  <p>Regular Food Only (+1 pt)</p>
                  <p>Classic 8-Bit Square Beeps</p>
                </div>
                <p className="pt-1 text-[13px] text-black/70">
                  Move: Arrows / WASD / 2-4-6-8
                </p>
              </div>
            ) : (
              <div className="my-auto space-y-1.5 font-lcd text-[15px] leading-tight text-[#0f380f]">
                <p className="font-bold">Telugu Meme Twist:</p>
                <div className="space-y-0.5 text-[14px]">
                  <p>🌶️ Ghost Pepper · Sprint 4s</p>
                  <p>🪨 Hard Exam · Reverse 5s</p>
                  <p>🍕 Midnight Biryani · 2X Pts</p>
                </div>
                <p className="pt-1 text-[13px] text-[#306230]">
                  Move: Arrows / WASD / 2-4-6-8
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onStartGame}
              className={`w-full cursor-pointer border-2 px-3 py-1.5 font-pixel text-[11px] font-bold transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isClassic
                  ? 'border-black bg-black text-white focus-visible:outline-black'
                  : 'border-[#0f380f] bg-[#0f380f] text-[#9bbc0f] focus-visible:outline-[#0f380f]'
              }`}
            >
              START GAME (PRESS 5)
            </button>
          </div>
        )}

        {/* PAUSED OVERLAY */}
        {gameState === 'PAUSED' && (
          <div
            className={`absolute inset-1 z-30 flex flex-col items-center justify-center gap-3 p-4 text-center ${
              isClassic ? 'bg-white/95 text-black' : 'bg-[#9bbc0f]/92 text-[#0f380f]'
            }`}
          >
            <div
              className={`border-y-2 px-4 py-1 ${
                isClassic ? 'border-black' : 'border-[#0f380f]'
              }`}
            >
              <p className="font-pixel text-sm font-bold tracking-wider">
                GAME PAUSED
              </p>
            </div>
            <p className={`font-lcd text-base ${isClassic ? 'text-black/70' : 'text-[#306230]'}`}>
              {isClassic ? 'Game paused. Press 5 to resume.' : 'Chai break? Snake is waiting.'}
            </p>
            <div className="flex w-full max-w-[210px] flex-col gap-1.5">
              <button
                type="button"
                onClick={onResumeGame}
                className={`w-full cursor-pointer border-2 px-3 py-1.5 font-pixel text-[10px] font-bold active:scale-[0.98] ${
                  isClassic
                    ? 'border-black bg-black text-white'
                    : 'border-[#0f380f] bg-[#0f380f] text-[#9bbc0f]'
                }`}
              >
                RESUME (PRESS 5)
              </button>
              <button
                type="button"
                onClick={onTryAgain}
                className={`w-full cursor-pointer border-2 px-3 py-1 font-pixel text-[10px] font-bold active:scale-[0.98] ${
                  isClassic
                    ? 'border-black bg-white text-black hover:bg-black/10'
                    : 'border-[#0f380f] bg-[#9bbc0f] text-[#0f380f] hover:bg-[#8bac0f]'
                }`}
              >
                RESTART
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === 'GAME_OVER' && (
          <div
            className={`absolute inset-1 z-30 flex flex-col items-center justify-between p-2.5 text-center ${
              isClassic ? 'bg-white/95 text-black' : 'bg-[#9bbc0f]/95 text-[#0f380f]'
            }`}
          >
            <div className="w-full">
              <div
                className={`px-2 py-1 font-pixel text-xs font-bold tracking-wider ${
                  isClassic ? 'bg-black text-white' : 'bg-[#0f380f] text-[#9bbc0f]'
                }`}
              >
                GAME OVER
              </div>
              <div className="mt-1.5 flex items-center justify-center gap-3 font-pixel text-[11px] tabular-nums">
                <span>SCORE: {score}</span>
                <span className={isClassic ? 'text-black/70' : 'text-[#306230]'}>
                  BEST: {highScore}
                </span>
              </div>
              {isNewHighScore && (
                <p className="mt-0.5 font-pixel text-[9px] font-bold">
                  {isClassic ? '* NEW HIGH SCORE *' : '* NEW RECORD, LEGEND! *'}
                </p>
              )}
            </div>

            <div
              className={`my-auto w-full border px-2.5 py-2 ${
                isClassic
                  ? 'border-black bg-white text-black'
                  : 'border-[#0f380f]/60 bg-[#8bac0f]/45 text-[#0f380f]'
              }`}
            >
              <p className="font-lcd text-[18px] font-bold leading-snug">
                {isClassic ? 'CLASSIC RUN ENDED' : `"${gameOverQuote}"`}
              </p>
            </div>

            <button
              type="button"
              onClick={onTryAgain}
              className={`w-full cursor-pointer border-2 px-3 py-1.5 font-pixel text-[10px] font-bold transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isClassic
                  ? 'border-black bg-black text-white hover:bg-black/85 focus-visible:outline-black'
                  : 'border-[#0f380f] bg-[#0f380f] text-[#9bbc0f] hover:bg-[#1a4d1a] focus-visible:outline-[#0f380f]'
              }`}
            >
              Try Again (Press 5)
            </button>
          </div>
        )}
      </div>

      {/* Bottom LCD Item Ticker */}
      <div
        className={`relative z-10 flex items-center justify-between border-t px-2 py-1 font-lcd text-[14px] leading-none ${
          isClassic
            ? 'border-black/30 bg-black/[0.04]'
            : 'border-[#0f380f]/30 bg-[#8bac0f]/35'
        }`}
      >
        <span className="truncate">
          {isClassic
            ? 'REGULAR FOOD · +1 PT · 8-BIT AUDIO'
            : `${food.definition.emoji} ${food.definition.label} — ${food.definition.memeQuip}`}
        </span>
        {!isClassic && activeEffects.length > 1 && (
          <span className="ml-1 shrink-0 font-pixel text-[8px] text-[#0f380f]">
            +{activeEffects.length - 1} FX
          </span>
        )}
      </div>
    </div>
  );
};
