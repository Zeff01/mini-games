import { Direction, DIRECTION_VECTORS } from './types';
import { Maze } from './Maze';
import { TILE_SIZE } from './constants';

export class Pacman {
  public x: number;
  public y: number;
  private direction: Direction;
  private nextDirection: Direction;
  private speed: number;
  public radius: number;
  private baseRadius: number;
  private mouthAngle: number;
  private mouthOpening: boolean;
  private scale: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.speed = 1.5;
    this.baseRadius = TILE_SIZE / 2 - 2;
    this.radius = this.baseRadius;
    this.mouthAngle = 0;
    this.mouthOpening = true;
    this.scale = 1.0;
  }

  update(maze: Maze): void {
    // Update mouth animation
    if (this.mouthOpening) {
      this.mouthAngle += 2;
      if (this.mouthAngle >= 45) {
        this.mouthOpening = false;
      }
    } else {
      this.mouthAngle -= 2;
      if (this.mouthAngle <= 0) {
        this.mouthOpening = true;
      }
    }

    // Try to move in next direction
    const nextVector = DIRECTION_VECTORS[this.nextDirection];
    const newX = this.x + nextVector.x * this.speed;
    const newY = this.y + nextVector.y * this.speed;

    // Always use base radius for collision, not scaled radius
    if (!maze.checkCollision(newX, newY, this.baseRadius)) {
      this.direction = this.nextDirection;
      this.x = newX;
      this.y = newY;
    } else {
      // Continue in current direction
      const currentVector = DIRECTION_VECTORS[this.direction];
      const currentX = this.x + currentVector.x * this.speed;
      const currentY = this.y + currentVector.y * this.speed;

      if (!maze.checkCollision(currentX, currentY, this.baseRadius)) {
        this.x = currentX;
        this.y = currentY;
      }
    }
  }

  setNextDirection(direction: Direction): void {
    this.nextDirection = direction;
  }

  draw(ctx: CanvasRenderingContext2D, color: string): void {
    let startAngle = this.mouthAngle;
    let endAngle = 360 - this.mouthAngle;

    // Calculate scaled radius
    const drawRadius = this.baseRadius * this.scale;

    // Adjust mouth angle based on direction
    switch (this.direction) {
      case Direction.RIGHT:
        startAngle = this.mouthAngle;
        endAngle = 360 - this.mouthAngle;
        break;
      case Direction.LEFT:
        startAngle = 180 + this.mouthAngle;
        endAngle = 180 - this.mouthAngle;
        break;
      case Direction.UP:
        startAngle = 270 + this.mouthAngle;
        endAngle = 270 - this.mouthAngle;
        break;
      case Direction.DOWN:
        startAngle = 90 + this.mouthAngle;
        endAngle = 90 - this.mouthAngle;
        break;
    }

    // Draw Pacman circle with scale
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw mouth (simple black wedge)
    if (this.mouthAngle > 0) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);

      const rad1 = (startAngle * Math.PI) / 180;
      const rad2 = (endAngle * Math.PI) / 180;

      ctx.lineTo(
        this.x + drawRadius * Math.cos(rad1),
        this.y + drawRadius * Math.sin(rad1)
      );
      ctx.lineTo(
        this.x + drawRadius * Math.cos(rad2),
        this.y + drawRadius * Math.sin(rad2)
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  setPowerMode(powered: boolean): void {
    if (powered) {
      this.scale = 1.5; // Grow 50% bigger visually
    } else {
      this.scale = 1.0; // Return to normal size
    }
    // Keep radius at base for collision detection
    this.radius = this.baseRadius;
  }
}
