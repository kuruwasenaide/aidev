export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "running" | "paused" | "gameover";

export interface Coord {
  x: number;
  y: number;
}

export interface GameState {
  gridSize: number;
  snake: Coord[];
  direction: Direction;
  food: Coord | null;
  score: number;
  status: GameStatus;
}

export const DIRECTION_VECTORS: Record<Direction, Coord> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function resolveDirection(current: Direction, next?: Direction | null): Direction {
  if (!next) return current;
  if (OPPOSITE_DIRECTION[current] === next) return current;
  return next;
}

export function createInitialSnake(gridSize: number): Coord[] {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  return [
    { x: centerX + 1, y: centerY },
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
  ];
}

export function getEmptyCells(gridSize: number, snake: Coord[]): Coord[] {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const empty: Coord[] = [];
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) empty.push({ x, y });
    }
  }
  return empty;
}

export function placeFood(gridSize: number, snake: Coord[], rng: () => number): Coord | null {
  const empty = getEmptyCells(gridSize, snake);
  if (empty.length === 0) return null;
  const index = Math.floor(rng() * empty.length);
  return empty[Math.min(index, empty.length - 1)];
}

export function createInitialState(gridSize = 16, rng: () => number = Math.random): GameState {
  const snake = createInitialSnake(gridSize);
  const food = placeFood(gridSize, snake, rng);
  return {
    gridSize,
    snake,
    direction: "right",
    food,
    score: 0,
    status: "running",
  };
}

export function stepGame(
  state: GameState,
  inputDirection: Direction | null | undefined,
  rng: () => number
): GameState {
  if (state.status !== "running") return state;
  const direction = resolveDirection(state.direction, inputDirection);
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };

  const hitsWall =
    nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= state.gridSize || nextHead.y >= state.gridSize;
  if (hitsWall) {
    return { ...state, direction, status: "gameover" };
  }

  const snakeKeys = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const hitsSelf = snakeKeys.has(`${nextHead.x},${nextHead.y}`);
  if (hitsSelf) {
    return { ...state, direction, status: "gameover" };
  }

  const ateFood = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) nextSnake.pop();

  const nextScore = ateFood ? state.score + 1 : state.score;
  const nextFood = ateFood ? placeFood(state.gridSize, nextSnake, rng) : state.food;
  const nextStatus = ateFood && !nextFood ? "gameover" : "running";

  return {
    ...state,
    direction,
    snake: nextSnake,
    food: nextFood,
    score: nextScore,
    status: nextStatus,
  };
}
