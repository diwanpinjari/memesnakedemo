import { useCallback, useEffect, useRef, useState } from 'react';
import { retroAudio } from './audio/retroAudio';
import { MemeGuidePanel } from './components/MemeGuidePanel';
import { NokiaPhone } from './components/NokiaPhone';
import { NokiaScreen } from './components/NokiaScreen';
import {
  ActiveEffect,
  CLASSIC_FOOD_DEFINITION,
  DeathReason,
  Direction,
  FloatingText,
  FOOD_DEFINITIONS,
  FoodDefinition,
  FoodItem,
  GameMode,
  GameState,
  GRID_COLS,
  GRID_ROWS,
  HIGH_SCORE_STORAGE_KEY,
  MemeReaction,
  MemeSituation,
  MUTE_STORAGE_KEY,
  pickMemeReaction,
  Point,
  WallMode,
} from './types/game';

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 9 },
  { x: 9, y: 9 },
  { x: 8, y: 9 },
  { x: 7, y: 9 },
];

const INITIAL_DIRECTION: Direction = 'RIGHT';

function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'UP' && b === 'DOWN') ||
    (a === 'DOWN' && b === 'UP') ||
    (a === 'LEFT' && b === 'RIGHT') ||
    (a === 'RIGHT' && b === 'LEFT')
  );
}

function flipDirection(dir: Direction): Direction {
  switch (dir) {
    case 'UP':
      return 'DOWN';
    case 'DOWN':
      return 'UP';
    case 'LEFT':
      return 'RIGHT';
    case 'RIGHT':
      return 'LEFT';
  }
}

function pickWeightedFoodDefinition(): FoodDefinition {
  const defs = Object.values(FOOD_DEFINITIONS);
  const totalWeight = defs.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const def of defs) {
    roll -= def.weight;
    if (roll <= 0) return def;
  }
  return FOOD_DEFINITIONS.pulihora;
}

function spawnFood(
  occupied: Point[],
  gameMode: GameMode,
  forceKind?: keyof typeof FOOD_DEFINITIONS
): FoodItem {
  const occupiedSet = new Set(occupied.map((p) => `${p.x},${p.y}`));
  const freeCells: Point[] = [];
  for (let x = 0; x < GRID_COLS; x++) {
    for (let y = 0; y < GRID_ROWS; y++) {
      if (!occupiedSet.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  const position =
    freeCells.length > 0
      ? freeCells[Math.floor(Math.random() * freeCells.length)]
      : { x: 0, y: 0 };

  const definition =
    gameMode === 'CLASSIC'
      ? CLASSIC_FOOD_DEFINITION
      : forceKind
        ? FOOD_DEFINITIONS[forceKind]
        : pickWeightedFoodDefinition();

  return {
    position,
    definition,
    spawnedAt: performance.now(),
  };
}

function readStoredNumber(key: string, fallback: number): number {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readStoredBoolean(key: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === 'true';
  } catch {
    return fallback;
  }
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('MEME');
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<FoodItem>(() =>
    spawnFood(INITIAL_SNAKE, 'MEME', 'ghost_pepper')
  );
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() =>
    readStoredNumber(HIGH_SCORE_STORAGE_KEY, 0)
  );
  const [wallMode, setWallMode] = useState<WallMode>('SOLID');
  const [muted, setMuted] = useState<boolean>(() => {
    const initialMuted = readStoredBoolean(MUTE_STORAGE_KEY, false);
    retroAudio.setMuted(initialMuted);
    return initialMuted;
  });
  const [showStrongGrid, setShowStrongGrid] = useState<boolean>(true);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [memeReaction, setMemeReaction] = useState<MemeReaction>(() =>
    pickMemeReaction('READY')
  );
  const [statusMessage, setStatusMessage] = useState<string>('READY FOR ACTION');
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => performance.now());

  // Refs for synchronous game loop access
  const gameStateRef = useRef<GameState>(gameState);
  const gameModeRef = useRef<GameMode>(gameMode);
  const snakeRef = useRef<Point[]>(snake);
  const directionRef = useRef<Direction>(direction);
  const directionQueueRef = useRef<Direction[]>([]);
  const foodRef = useRef<FoodItem>(food);
  const scoreRef = useRef<number>(score);
  const highScoreRef = useRef<number>(highScore);
  const isNewHighScoreRef = useRef<boolean>(false);
  const wallModeRef = useRef<WallMode>(wallMode);
  const activeEffectsRef = useRef<ActiveEffect[]>(activeEffects);
  const floatingIdRef = useRef<number>(1);
  const lastStepTimeRef = useRef<number>(0);
  const keyHighlightTimerRef = useRef<number | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    gameModeRef.current = gameMode;
    retroAudio.setClassicMode(gameMode === 'CLASSIC');
  }, [gameMode]);

  useEffect(() => {
    wallModeRef.current = wallMode;
  }, [wallMode]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const flashPressedKey = useCallback((keyId: string) => {
    setPressedKey(keyId);
    if (keyHighlightTimerRef.current !== null) {
      window.clearTimeout(keyHighlightTimerRef.current);
    }
    keyHighlightTimerRef.current = window.setTimeout(() => {
      setPressedKey(null);
    }, 130);
  }, []);

  const startNewRun = useCallback(() => {
    const freshSnake = INITIAL_SNAKE.map((p) => ({ ...p }));
    const mode = gameModeRef.current;
    const freshFood = spawnFood(freshSnake, mode);
    const now = performance.now();
    const readyReaction = pickMemeReaction('READY');

    snakeRef.current = freshSnake;
    directionRef.current = INITIAL_DIRECTION;
    directionQueueRef.current = [];
    foodRef.current = freshFood;
    scoreRef.current = 0;
    isNewHighScoreRef.current = false;
    activeEffectsRef.current = [];
    lastStepTimeRef.current = now;

    setSnake(freshSnake);
    setDirection(INITIAL_DIRECTION);
    setFood(freshFood);
    setScore(0);
    setActiveEffects([]);
    setFloatingTexts([]);
    setIsNewHighScore(false);
    setMemeReaction(readyReaction);
    setStatusMessage(
      mode === 'CLASSIC' ? 'CLASSIC NOKIA SNAKE' : readyReaction.dialogue.toUpperCase()
    );
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    retroAudio.playStart();
  }, []);

  const handleSelectGameMode = useCallback((nextMode: GameMode) => {
    if (gameModeRef.current === nextMode) return;
    gameModeRef.current = nextMode;
    setGameMode(nextMode);
    retroAudio.setClassicMode(nextMode === 'CLASSIC');

    // Clear active meme effects & swap food immediately to match mode
    activeEffectsRef.current = [];
    setActiveEffects([]);
    setFloatingTexts([]);

    const swappedFood = spawnFood(
      snakeRef.current,
      nextMode,
      nextMode === 'MEME' && gameStateRef.current === 'TITLE_MENU' ? 'ghost_pepper' : undefined
    );
    foodRef.current = swappedFood;
    setFood(swappedFood);
    if (nextMode === 'MEME') {
      const readyReaction = pickMemeReaction('READY');
      setMemeReaction(readyReaction);
      setStatusMessage(readyReaction.dialogue.toUpperCase());
    } else {
      setStatusMessage('CLASSIC NOKIA SNAKE');
    }
  }, []);

  const triggerGameOver = useCallback((reason: DeathReason, now: number) => {
    const currentEffects = activeEffectsRef.current.filter((e) => e.expiresAt > now);
    let situation: MemeSituation;

    if (isNewHighScoreRef.current) {
      situation = 'CRASH_HIGH_SCORE';
    } else if (scoreRef.current <= 2) {
      situation = 'CRASH_EARLY';
    } else if (currentEffects.some((e) => e.type === 'REVERSE')) {
      situation = 'CRASH_REVERSE';
    } else if (currentEffects.some((e) => e.type === 'SPRINT')) {
      situation = 'CRASH_SPRINT';
    } else if (reason === 'SELF') {
      situation = 'CRASH_SELF';
    } else {
      situation = 'CRASH_WALL';
    }

    const reaction = pickMemeReaction(situation);
    setMemeReaction(reaction);
    setGameState('GAME_OVER');
    gameStateRef.current = 'GAME_OVER';
    retroAudio.playGameOver();
  }, []);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      const pauseReaction = pickMemeReaction('PAUSED');
      setMemeReaction(pauseReaction);
      setGameState('PAUSED');
      gameStateRef.current = 'PAUSED';
    } else if (gameStateRef.current === 'PAUSED') {
      lastStepTimeRef.current = performance.now();
      setGameState('PLAYING');
      gameStateRef.current = 'PLAYING';
    } else if (gameStateRef.current === 'TITLE_MENU') {
      startNewRun();
    }
  }, [startNewRun]);

  const handleCenterAction = useCallback(() => {
    flashPressedKey('5');
    if (gameStateRef.current === 'TITLE_MENU' || gameStateRef.current === 'GAME_OVER') {
      startNewRun();
    } else {
      togglePause();
    }
  }, [flashPressedKey, startNewRun, togglePause]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      retroAudio.setMuted(next);
      try {
        window.localStorage.setItem(MUTE_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      if (!next) {
        retroAudio.playKeyBeep(120);
      }
      return next;
    });
  }, []);

  const handleToggleWallMode = useCallback(() => {
    setWallMode((prev) => {
      const next: WallMode = prev === 'SOLID' ? 'WRAP' : 'SOLID';
      setStatusMessage(next === 'WRAP' ? 'PORTAL WALLS ON' : 'CLASSIC BOX WALLS');
      return next;
    });
  }, []);

  const handleToggleGrid = useCallback(() => {
    setShowStrongGrid((prev) => {
      const next = !prev;
      setStatusMessage(next ? 'LCD GRID: SHARP' : 'LCD GRID: SOFT');
      return next;
    });
  }, []);

  const handleKeyTone = useCallback((digit: string, pitchOffset: number) => {
    retroAudio.playKeyBeep(pitchOffset);
    if (gameStateRef.current !== 'PLAYING' && ['1', '3', '7', '9'].includes(digit)) {
      const jokes: Record<string, string> = {
        '1': 'PRESS 5 — START GAME!',
        '3': 'GUNTUR MIRCHI = TURBO PANIC',
        '7': '2AM BIRYANI = 2X POINTS',
        '9': 'OUT OF SYLLABUS = REVERSE',
      };
      setStatusMessage(jokes[digit] ?? 'MEMESNAKE 3310');
    }
  }, []);

  const enqueueDirection = useCallback(
    (rawDir: Direction) => {
      flashPressedKey(rawDir);

      if (gameStateRef.current !== 'PLAYING') return;

      const now = performance.now();
      const reversedActive = activeEffectsRef.current.some(
        (eff) => eff.type === 'REVERSE' && eff.expiresAt > now
      );
      const effectiveDir = reversedActive ? flipDirection(rawDir) : rawDir;

      const queue = directionQueueRef.current;
      const lastPlannedDir =
        queue.length > 0 ? queue[queue.length - 1] : directionRef.current;

      if (effectiveDir === lastPlannedDir || isOpposite(effectiveDir, lastPlannedDir)) {
        return;
      }

      if (queue.length < 2) {
        queue.push(effectiveDir);
      }
    },
    [flashPressedKey]
  );

  // Keyboard listener (Arrows, WASD, 2/4/6/8, 5/Space/Enter, shortcuts)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)
      ) {
        e.preventDefault();
      }

      if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === '2') {
        enqueueDirection('UP');
        return;
      }
      if (key === 'ArrowDown' || key === 's' || key === 'S' || key === '8') {
        enqueueDirection('DOWN');
        return;
      }
      if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === '4') {
        enqueueDirection('LEFT');
        return;
      }
      if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === '6') {
        enqueueDirection('RIGHT');
        return;
      }
      if (key === '5' || key === 'Enter' || key === ' ') {
        handleCenterAction();
        return;
      }
      if (key === 'p' || key === 'P' || key === 'Escape') {
        if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'PAUSED') {
          togglePause();
        }
        return;
      }
      if (key === 'm' || key === 'M' || key === '0') {
        handleToggleMute();
        return;
      }
      if (key === '*') {
        handleToggleWallMode();
        return;
      }
      if (key === '#') {
        handleToggleGrid();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    enqueueDirection,
    handleCenterAction,
    togglePause,
    handleToggleMute,
    handleToggleWallMode,
    handleToggleGrid,
  ]);

  // Fixed-timestep animation loop driven by requestAnimationFrame
  useEffect(() => {
    let rafId = 0;

    const addFloatingText = (x: number, y: number, text: string, now: number) => {
      const item: FloatingText = {
        id: floatingIdRef.current++,
        x,
        y,
        text,
        createdAt: now,
      };
      setFloatingTexts((prev) => [
        ...prev.filter((f) => now - f.createdAt < 950),
        item,
      ]);
    };

    const tickGame = (now: number) => {
      // Prune expired effects
      const validEffects = activeEffectsRef.current.filter((e) => e.expiresAt > now);
      if (validEffects.length !== activeEffectsRef.current.length) {
        activeEffectsRef.current = validEffects;
        setActiveEffects(validEffects);
      }

      // Consume next buffered turn
      let nextDir = directionRef.current;
      if (directionQueueRef.current.length > 0) {
        nextDir = directionQueueRef.current.shift()!;
        directionRef.current = nextDir;
        setDirection(nextDir);
      }

      const currentSnake = snakeRef.current;
      const head = currentSnake[0];
      let nextX = head.x;
      let nextY = head.y;

      if (nextDir === 'UP') nextY -= 1;
      if (nextDir === 'DOWN') nextY += 1;
      if (nextDir === 'LEFT') nextX -= 1;
      if (nextDir === 'RIGHT') nextX += 1;

      if (wallModeRef.current === 'WRAP') {
        nextX = (nextX + GRID_COLS) % GRID_COLS;
        nextY = (nextY + GRID_ROWS) % GRID_ROWS;
      } else {
        if (nextX < 0 || nextX >= GRID_COLS || nextY < 0 || nextY >= GRID_ROWS) {
          triggerGameOver('WALL', now);
          return;
        }
      }

      const currentFood = foodRef.current;
      const willEat =
        nextX === currentFood.position.x && nextY === currentFood.position.y;

      // Tail moves away unless eating, so exclude last segment during non-eating collision check
      const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
      const hitSelf = bodyToCheck.some((seg) => seg.x === nextX && seg.y === nextY);
      if (hitSelf) {
        triggerGameOver('SELF', now);
        return;
      }

      const nextSnake = [{ x: nextX, y: nextY }, ...currentSnake];
      if (!willEat) {
        nextSnake.pop();
      }

      snakeRef.current = nextSnake;
      setSnake(nextSnake);

      if (willEat) {
        const def = currentFood.definition;
        const hasDouble = validEffects.some((e) => e.type === 'DOUBLE_POINTS');
        const pointsEarned =
          def.effectType === 'DOUBLE_POINTS'
            ? def.points * 2
            : hasDouble
              ? def.points * 2
              : def.points;

        const prevScore = scoreRef.current;
        const nextScore = prevScore + pointsEarned;
        const prevLevel = 1 + Math.floor(prevScore / 5);
        const nextLevel = 1 + Math.floor(nextScore / 5);

        scoreRef.current = nextScore;
        setScore(nextScore);

        if (nextScore > highScoreRef.current) {
          highScoreRef.current = nextScore;
          isNewHighScoreRef.current = true;
          setHighScore(nextScore);
          setIsNewHighScore(true);
          try {
            window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(nextScore));
          } catch {
            // Ignore storage errors
          }
        }

        // Apply food power-up effect if present
        if (def.effectType && def.effectDurationMs) {
          const effectLabelMap: Record<NonNullable<typeof def.effectType>, string> = {
            SPRINT: 'SPRINT!',
            REVERSE: 'REVERSE!',
            DOUBLE_POINTS: '2X PTS!',
            SLOW_MO: 'CHILL!',
          };

          let updatedEffects = validEffects.filter((e) => {
            if (e.type === def.effectType) return false;
            // Sprint & Slow-Mo override each other cleanly
            if (def.effectType === 'SPRINT' && e.type === 'SLOW_MO') return false;
            if (def.effectType === 'SLOW_MO' && e.type === 'SPRINT') return false;
            return true;
          });

          updatedEffects = [
            {
              type: def.effectType,
              label: `${def.emoji} ${effectLabelMap[def.effectType]}`,
              expiresAt: now + def.effectDurationMs,
              durationMs: def.effectDurationMs,
            },
            ...updatedEffects,
          ];

          activeEffectsRef.current = updatedEffects;
          setActiveEffects(updatedEffects);
          retroAudio.playPowerUp(def.effectType);
          addFloatingText(
            nextX,
            nextY,
            `+${pointsEarned} ${effectLabelMap[def.effectType]}`,
            now
          );

          const situationMap: Record<NonNullable<typeof def.effectType>, MemeSituation> = {
            SPRINT: 'SPRINT',
            REVERSE: 'REVERSE',
            DOUBLE_POINTS: 'DOUBLE_POINTS',
            SLOW_MO: 'SLOW_MO',
          };
          const reaction = pickMemeReaction(situationMap[def.effectType]);
          setMemeReaction(reaction);
          setStatusMessage(reaction.dialogue.toUpperCase());
        } else if (nextLevel > prevLevel) {
          retroAudio.playSpeedUp();
          addFloatingText(nextX, nextY, `+${pointsEarned} LV${nextLevel}!`, now);
          const reaction = pickMemeReaction('LEVEL_UP');
          setMemeReaction(reaction);
          setStatusMessage(`SPEED UP! LEVEL ${nextLevel}`);
        } else {
          retroAudio.playEat();
          addFloatingText(nextX, nextY, `+${pointsEarned}`, now);
          const reaction = pickMemeReaction('PULIHORA');
          setMemeReaction(reaction);
          setStatusMessage(reaction.dialogue.toUpperCase());
        }

        // Spawn next food item according to active GameMode
        const nextFood = spawnFood(nextSnake, gameModeRef.current);
        foodRef.current = nextFood;
        setFood(nextFood);
      }
    };

    const frame = (now: number) => {
      setNowMs(now);

      if (gameStateRef.current === 'PLAYING') {
        const currentScore = scoreRef.current;
        const speedLvl = 1 + Math.floor(currentScore / 5);
        // Speed increases slightly every 5 points
        let stepInterval = Math.max(68, 150 - (speedLvl - 1) * 10);

        if (gameModeRef.current === 'MEME') {
          const effects = activeEffectsRef.current.filter((e) => e.expiresAt > now);
          if (effects.some((e) => e.type === 'SPRINT')) {
            stepInterval = Math.max(48, Math.round(stepInterval * 0.56));
          } else if (effects.some((e) => e.type === 'SLOW_MO')) {
            stepInterval = Math.min(235, Math.round(stepInterval * 1.42));
          }
        }

        if (lastStepTimeRef.current === 0) {
          lastStepTimeRef.current = now;
        }

        if (now - lastStepTimeRef.current >= stepInterval) {
          lastStepTimeRef.current = now;
          tickGame(now);
        }
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [triggerGameOver]);

  const speedLevel = 1 + Math.floor(score / 5);

  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#232834_0%,_#111317_62%,_#0b0d10_100%)] px-4 py-6 sm:py-10 flex items-center justify-center">
      <div className="mx-auto flex w-full max-w-[980px] flex-col items-center justify-center gap-10 lg:flex-row lg:items-center lg:gap-14">
        {/* Realistic Nokia 3310 Handset */}
        <NokiaPhone
          gameState={gameState}
          gameMode={gameMode}
          muted={muted}
          wallMode={wallMode}
          pressedKey={pressedKey}
          onDirectionPress={enqueueDirection}
          onCenterPress={handleCenterAction}
          onTogglePause={togglePause}
          onToggleMute={handleToggleMute}
          onToggleWallMode={handleToggleWallMode}
          onToggleGrid={handleToggleGrid}
          onSelectGameMode={handleSelectGameMode}
          onKeyTone={handleKeyTone}
        >
          <NokiaScreen
            gameState={gameState}
            gameMode={gameMode}
            snake={snake}
            direction={direction}
            food={food}
            score={score}
            highScore={highScore}
            speedLevel={speedLevel}
            wallMode={wallMode}
            muted={muted}
            showStrongGrid={showStrongGrid}
            activeEffects={activeEffects}
            floatingTexts={floatingTexts}
            statusMessage={statusMessage}
            memeReaction={memeReaction}
            isNewHighScore={isNewHighScore}
            nowMs={nowMs}
            onStartGame={startNewRun}
            onResumeGame={togglePause}
            onTryAgain={startNewRun}
            onSwipeDirection={enqueueDirection}
          />
        </NokiaPhone>

        {/* Desktop Companion Reference & Controls */}
        <MemeGuidePanel
          gameMode={gameMode}
          score={score}
          highScore={highScore}
          speedLevel={speedLevel}
          wallMode={wallMode}
          muted={muted}
          showStrongGrid={showStrongGrid}
          memeReaction={memeReaction}
          onToggleMute={handleToggleMute}
          onToggleWallMode={handleToggleWallMode}
          onToggleGrid={handleToggleGrid}
          onRestart={startNewRun}
        />
      </div>
    </main>
  );
}
