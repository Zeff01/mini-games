export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  pelletsCollected: number;
  totalPellets: number;
  status: 'playing' | 'won' | 'lost';
}

export const DIRECTION_VECTORS: Record<Direction, Position> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};
