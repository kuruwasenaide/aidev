import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Direction,
  type GameState,
  createInitialState,
  stepGame,
} from "@/lib/snakeGame";

const GRID_SIZE = 16;
const TICK_MS = 150;

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  W: "up",
  A: "left",
  S: "down",
  D: "right",
};

export default function FunSnakeGame() {
  const [state, setState] = useState<GameState>(() => createInitialState(GRID_SIZE, Math.random));
  const pendingDirectionRef = useRef<Direction | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const restart = useCallback(() => {
    pendingDirectionRef.current = null;
    setState(createInitialState(GRID_SIZE, Math.random));
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => {
      if (prev.status === "running") return { ...prev, status: "paused" };
      if (prev.status === "paused") return { ...prev, status: "running" };
      return prev;
    });
  }, []);

  const queueDirection = useCallback((direction: Direction) => {
    pendingDirectionRef.current = direction;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === " " || key === "Spacebar") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (key === "r" || key === "R" || key === "Enter") {
        event.preventDefault();
        restart();
        return;
      }
      const direction = KEY_TO_DIRECTION[key];
      if (direction) {
        event.preventDefault();
        if (stateRef.current.status === "gameover") {
          restart();
          return;
        }
        queueDirection(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [queueDirection, restart, togglePause]);

  useEffect(() => {
    if (state.status !== "running") return;
    const intervalId = window.setInterval(() => {
      const pending = pendingDirectionRef.current;
      pendingDirectionRef.current = null;
      setState((prev) => stepGame(prev, pending, Math.random));
    }, TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [state.status]);

  const snakeKeys = useMemo(() => {
    return new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  }, [state.snake]);

  const headKey = state.snake[0] ? `${state.snake[0].x},${state.snake[0].y}` : null;
  const foodKey = state.food ? `${state.food.x},${state.food.y}` : null;

  const cells = useMemo(() => {
    const total = state.gridSize * state.gridSize;
    return Array.from({ length: total }, (_, index) => {
      const x = index % state.gridSize;
      const y = Math.floor(index / state.gridSize);
      const key = `${x},${y}`;
      const isHead = headKey === key;
      const isSnake = snakeKeys.has(key);
      const isFood = foodKey === key;

      return (
        <div
          key={key}
          className={cn(
            "rounded-[3px] transition-colors",
            "bg-[var(--glass-bg)]",
            isFood && "bg-emerald-400/80",
            isSnake && "bg-primary/70",
            isHead && "bg-primary"
          )}
        />
      );
    });
  }, [foodKey, headKey, snakeKeys, state.gridSize]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">Score: {state.score}</span>
          <span className="uppercase tracking-wide">
            {state.status === "running" && "Running"}
            {state.status === "paused" && "Paused"}
            {state.status === "gameover" && "Game Over"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePause}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--glass-border-subtle)]
                       bg-[var(--glass-bg)] px-2.5 py-1 text-xs text-foreground hover:bg-[var(--glass-bg-hover)]"
            aria-label={state.status === "paused" ? "Resume" : "Pause"}
          >
            {state.status === "paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {state.status === "paused" ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--glass-border-subtle)]
                       bg-[var(--glass-bg)] px-2.5 py-1 text-xs text-foreground hover:bg-[var(--glass-bg-hover)]"
            aria-label="Restart"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart
          </button>
        </div>
      </div>

      <div
        className="grid aspect-square w-full max-w-[320px] gap-[3px] rounded-xl border border-[var(--glass-border-subtle)]
                   bg-[var(--glass-bg)] p-3"
        style={{ gridTemplateColumns: `repeat(${state.gridSize}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Snake grid"
      >
        {cells}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 text-xs text-muted-foreground">
        <div className="space-y-1">
          <div>Controls: Arrow keys or WASD.</div>
          <div>Space = pause, R/Enter = restart.</div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          <div />
          <button
            type="button"
            onClick={() => queueDirection("up")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--glass-border-subtle)]
                       bg-[var(--glass-bg)] text-foreground"
            aria-label="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => queueDirection("left")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--glass-border-subtle)]
                       bg-[var(--glass-bg)] text-foreground"
            aria-label="Move left"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => queueDirection("down")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--glass-border-subtle)]
                       bg-[var(--glass-bg)] text-foreground"
            aria-label="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => queueDirection("right")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--glass-border-subtle)]
                       bg-[var(--glass-bg)] text-foreground"
            aria-label="Move right"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
