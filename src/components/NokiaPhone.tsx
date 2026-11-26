import React from 'react';
import { Direction, GameMode, GameState, WallMode } from '../types/game';

interface NokiaPhoneProps {
  children: React.ReactNode;
  gameState: GameState;
  gameMode: GameMode;
  muted: boolean;
  wallMode: WallMode;
  pressedKey: string | null;
  onDirectionPress: (dir: Direction) => void;
  onCenterPress: () => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleWallMode: () => void;
  onToggleGrid: () => void;
  onSelectGameMode: (mode: GameMode) => void;
  onKeyTone: (digit: string, pitchOffset: number) => void;
}

interface KeypadButtonConfig {
  id: string;
  digit: string;
  subLabel: string;
  direction?: Direction;
  action?: 'OK' | 'WALL' | 'MUTE' | 'GRID' | 'TONE';
  pitchOffset: number;
}

const KEYPAD_ROWS: KeypadButtonConfig[][] = [
  [
    { id: '1', digit: '1', subLabel: '.,!', action: 'TONE', pitchOffset: -180 },
    { id: '2', digit: '2', subLabel: '▲ UP', direction: 'UP', pitchOffset: -120 },
    { id: '3', digit: '3', subLabel: 'def', action: 'TONE', pitchOffset: -60 },
  ],
  [
    { id: '4', digit: '4', subLabel: '◀ LEFT', direction: 'LEFT', pitchOffset: 0 },
    { id: '5', digit: '5', subLabel: 'OK', action: 'OK', pitchOffset: 60 },
    { id: '6', digit: '6', subLabel: 'RIGHT ▶', direction: 'RIGHT', pitchOffset: 120 },
  ],
  [
    { id: '7', digit: '7', subLabel: 'pqrs', action: 'TONE', pitchOffset: 180 },
    { id: '8', digit: '8', subLabel: '▼ DOWN', direction: 'DOWN', pitchOffset: 240 },
    { id: '9', digit: '9', subLabel: 'wxyz', action: 'TONE', pitchOffset: 300 },
  ],
  [
    { id: '*', digit: '*', subLabel: 'WALL', action: 'WALL', pitchOffset: -240 },
    { id: '0', digit: '0', subLabel: 'SFX', action: 'MUTE', pitchOffset: 360 },
    { id: '#', digit: '#', subLabel: 'GRID', action: 'GRID', pitchOffset: 420 },
  ],
];

export const NokiaPhone: React.FC<NokiaPhoneProps> = ({
  children,
  gameState,
  gameMode,
  muted,
  wallMode,
  pressedKey,
  onDirectionPress,
  onCenterPress,
  onTogglePause,
  onToggleMute,
  onToggleWallMode,
  onToggleGrid,
  onSelectGameMode,
  onKeyTone,
}) => {
  const handleKeypadPointerDown = (keyCfg: KeypadButtonConfig) => {
    if (keyCfg.direction) {
      onKeyTone(keyCfg.digit, keyCfg.pitchOffset);
      onDirectionPress(keyCfg.direction);
      return;
    }

    switch (keyCfg.action) {
      case 'OK':
        onKeyTone(keyCfg.digit, keyCfg.pitchOffset);
        onCenterPress();
        break;
      case 'WALL':
        onKeyTone(keyCfg.digit, keyCfg.pitchOffset);
        onToggleWallMode();
        break;
      case 'MUTE':
        onToggleMute();
        break;
      case 'GRID':
        onKeyTone(keyCfg.digit, keyCfg.pitchOffset);
        onToggleGrid();
        break;
      default:
        onKeyTone(keyCfg.digit, keyCfg.pitchOffset);
        break;
    }
  };

  const centerActionLabel =
    gameState === 'PLAYING'
      ? 'PAUSE'
      : gameState === 'GAME_OVER'
        ? 'RETRY'
        : 'START';

  const isClassic = gameMode === 'CLASSIC';

  return (
    <div className="relative mx-auto w-full max-w-[356px] shrink-0">
      {/* Outer Realistic Nokia 3310 Shell */}
      <div className="relative rounded-t-[44px] rounded-b-[52px] border border-[#4b5262]/60 bg-gradient-to-b from-[#343944] via-[#242831] to-[#1a1d24] p-4 pb-6 shadow-[0_28px_60px_-12px_rgba(0,0,0,0.85),inset_0_2px_3px_rgba(255,255,255,0.18),inset_0_-6px_12px_rgba(0,0,0,0.65)]">
        {/* Subtle side grip contour lines */}
        <div className="pointer-events-none absolute inset-x-3 top-6 bottom-8 rounded-[36px] border border-white/[0.04]" />

        {/* Top Earpiece Speaker Grille */}
        <div className="mb-3 flex flex-col items-center gap-1.5 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#111318] shadow-[inset_0_1px_1px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.12)]" />
            <span className="h-1.5 w-4 rounded-full bg-[#111318] shadow-[inset_0_1px_1px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.12)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#111318] shadow-[inset_0_1px_1px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.12)]" />
          </div>
        </div>

        {/* Classic Silver-Grey Inner Screen Bezel */}
        <div className="rounded-t-[20px] rounded-b-[26px] border border-[#6c7382]/50 bg-gradient-to-b from-[#8f96a3] via-[#7b8290] to-[#686e7b] p-2.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_4px_10px_rgba(0,0,0,0.45)]">
          {/* Molded Brand Plate Above Screen */}
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="font-pixel text-[11px] font-bold tracking-[0.16em] text-[#171a21] drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]">
              {isClassic ? 'NOKIA' : 'MEMESNAKE'}
            </span>
            <span className="font-pixel text-[10px] font-bold tracking-widest text-[#2a2f3a]">
              3310
            </span>
          </div>

          {/* Recessed Dark Screen Frame */}
          <div className="rounded-[8px] bg-[#1e2228] p-1.5 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]">
            {children}
          </div>

          {/* Below-Screen Mode Toggle: Classic Nokia Mode vs Meme Mode */}
          <div
            className="mt-2.5 flex items-center rounded-[8px] border border-[#2c313b]/80 bg-[#252a33] p-0.5 shadow-inner"
            role="group"
            aria-label="Game mode toggle"
          >
            <button
              type="button"
              onClick={() => {
                onKeyTone('MODE_CLASSIC', -60);
                onSelectGameMode('CLASSIC');
              }}
              aria-pressed={isClassic}
              className={`flex-1 cursor-pointer rounded-[6px] px-2 py-1.5 font-sans text-[11px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-white ${
                isClassic
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Classic Nokia Mode
            </button>
            <button
              type="button"
              onClick={() => {
                onKeyTone('MODE_MEME', 80);
                onSelectGameMode('MEME');
              }}
              aria-pressed={!isClassic}
              className={`flex-1 cursor-pointer rounded-[6px] px-2 py-1.5 font-sans text-[11px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-white ${
                !isClassic
                  ? 'bg-[#9bbc0f] text-[#0f380f] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Meme Mode
            </button>
          </div>

          {/* Below-Screen Soft Function Cluster */}
          <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
            {/* Left Soft Key: Pause / Resume */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onKeyTone('PAUSE', -80);
                onTogglePause();
              }}
              aria-label={gameState === 'PAUSED' ? 'Resume game' : 'Pause game'}
              className="nokia-key flex h-10 w-16 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-[#2a2f3a] bg-gradient-to-b from-[#4c5363] to-[#2e333e] text-[#e2e8f0] focus-visible:outline-2 focus-visible:outline-white"
            >
              <span className="h-[2px] w-5 rounded-full bg-[#38bdf8]/80 mb-1" />
              <span className="font-pixel text-[8px] tracking-tight">
                {gameState === 'PAUSED' ? 'GO' : 'PAUSE'}
              </span>
            </button>

            {/* Iconic Center Navi Rocker Key */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onKeyTone('NAVI', 60);
                onCenterPress();
              }}
              aria-label="Nokia Navi OK Button"
              className={`nokia-key flex h-11 flex-1 cursor-pointer items-center justify-center rounded-[18px] border border-[#9aa2b1]/70 bg-gradient-to-b from-[#d8dde6] via-[#aeb6c4] to-[#8790a0] text-[#141820] focus-visible:outline-2 focus-visible:outline-white ${
                pressedKey === '5' ? 'nokia-key-pressed' : ''
              }`}
            >
              <span className="font-pixel text-[10px] font-bold tracking-wider">
                {centerActionLabel}
              </span>
            </button>

            {/* Right Soft Key: Sound Toggle */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onToggleMute();
              }}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              className="nokia-key flex h-10 w-16 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-[#2a2f3a] bg-gradient-to-b from-[#4c5363] to-[#2e333e] text-[#e2e8f0] focus-visible:outline-2 focus-visible:outline-white"
            >
              <span
                className={`h-[2px] w-5 rounded-full mb-1 ${
                  muted ? 'bg-rose-400/80' : 'bg-emerald-400/80'
                }`}
              />
              <span className="font-pixel text-[8px] tracking-tight">
                {muted ? 'MUTE' : 'SFX'}
              </span>
            </button>
          </div>
        </div>

        {/* Classic C (Wall Mode) & Up/Down Quick Rocker Row */}
        <div className="mt-3 mb-2.5 flex items-center justify-between px-3">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onKeyTone('C', -140);
              onToggleWallMode();
            }}
            aria-label="Toggle wall mode between solid and wrap"
            className="nokia-key flex h-9 min-w-[68px] cursor-pointer items-center justify-center gap-1 rounded-full border border-[#3d4452] bg-gradient-to-b from-[#414754] to-[#292d36] px-3 text-[#d8dee9] focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className="font-pixel text-[10px] font-bold">C</span>
            <span className="font-sans text-[10px] font-medium text-[#9aa5b8]">
              {wallMode === 'WRAP' ? 'Wrap' : 'Box'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onKeyTone('UP', -120);
                onDirectionPress('UP');
              }}
              aria-label="Move Up"
              className={`nokia-key flex h-9 w-12 cursor-pointer items-center justify-center rounded-l-full border border-[#3d4452] bg-gradient-to-b from-[#414754] to-[#292d36] text-xs font-bold text-[#e2e8f0] focus-visible:outline-2 focus-visible:outline-white ${
                pressedKey === 'UP' ? 'nokia-key-pressed' : ''
              }`}
            >
              ▲
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onKeyTone('DOWN', 240);
                onDirectionPress('DOWN');
              }}
              aria-label="Move Down"
              className={`nokia-key flex h-9 w-12 cursor-pointer items-center justify-center rounded-r-full border border-[#3d4452] bg-gradient-to-b from-[#414754] to-[#292d36] text-xs font-bold text-[#e2e8f0] focus-visible:outline-2 focus-visible:outline-white ${
                pressedKey === 'DOWN' ? 'nokia-key-pressed' : ''
              }`}
            >
              ▼
            </button>
          </div>
        </div>

        {/* 12-Key Numeric Nokia Keypad (2, 4, 6, 8 D-Pad + 5 OK) */}
        <div className="grid grid-cols-3 gap-x-2.5 gap-y-2.5 px-2">
          {KEYPAD_ROWS.flat().map((keyCfg) => {
            const isDpad = Boolean(keyCfg.direction);
            const isOk = keyCfg.action === 'OK';
            const isActiveHighlight =
              pressedKey === keyCfg.id ||
              (keyCfg.direction && pressedKey === keyCfg.direction);

            return (
              <button
                key={keyCfg.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeypadPointerDown(keyCfg);
                }}
                aria-label={
                  keyCfg.direction
                    ? `Key ${keyCfg.digit} Move ${keyCfg.direction}`
                    : `Key ${keyCfg.digit} ${keyCfg.subLabel}`
                }
                className={`nokia-key flex h-11 cursor-pointer items-center justify-between rounded-[14px] border px-2.5 focus-visible:outline-2 focus-visible:outline-white ${
                  isOk
                    ? 'border-[#6f7a8e] bg-gradient-to-b from-[#555d6f] to-[#343a47] text-white'
                    : isDpad
                      ? 'border-[#5a6375] bg-gradient-to-b from-[#495060] to-[#2c313b] text-white'
                      : 'border-[#3b414e] bg-gradient-to-b from-[#3a404c] to-[#242831] text-[#d5dce6]'
                } ${
                  isActiveHighlight
                    ? isClassic
                      ? 'nokia-key-pressed ring-1 ring-white/80'
                      : 'nokia-key-pressed ring-1 ring-[#9bbc0f]/70'
                    : ''
                }`}
              >
                <span className="font-sans text-[15px] font-bold leading-none tabular-nums">
                  {keyCfg.digit}
                </span>
                <span
                  className={`font-pixel text-[8px] leading-none tracking-tight ${
                    isDpad || isOk
                      ? isClassic
                        ? 'text-white'
                        : 'text-[#9bbc0f]'
                      : 'text-[#94a3b8]'
                  }`}
                >
                  {keyCfg.subLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Microphone Pin-hole */}
        <div className="mt-4 flex justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0e1014] shadow-[inset_0_1px_1px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.1)]" />
        </div>
      </div>
    </div>
  );
};
