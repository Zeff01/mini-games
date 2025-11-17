import { Direction, DIRECTION_VECTORS } from './types';
import { Maze } from './Maze';
import { Pacman } from './Pacman';
import { TILE_SIZE } from './constants';

export class Ghost {
  public x: number;
  public y: number;
  private color: string;
  private direction: Direction;
  private speed: number;
  public radius: number;
  private changeDirectionCounter: number;
  private image: HTMLImageElement | null;
  private imagePath: string;
  public isVulnerable: boolean;
  public isEaten: boolean;
  private startX: number;
  private startY: number;

  constructor(x: number, y: number, color: string, imagePath: string) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.color = color;
    this.imagePath = imagePath;
    this.direction = this.randomDirection();
    this.speed = 1;
    this.radius = TILE_SIZE / 2 - 2;
    this.changeDirectionCounter = 0;
    this.image = null;
    this.isVulnerable = false;
    this.isEaten = false;
    this.loadImage();
  }

  private loadImage(): void {
    this.image = new Image();
    this.image.src = this.imagePath;
  }

  private randomDirection(): Direction {
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  update(maze: Maze, pacman: Pacman): void {
    // If eaten, return to spawn
    if (this.isEaten) {
      const dx = this.startX - this.x;
      const dy = this.startY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // Reached spawn, reset
        this.isEaten = false;
        this.isVulnerable = false;
        this.x = this.startX;
        this.y = this.startY;
      } else {
        // Move directly towards spawn (can go through walls when eaten)
        const moveSpeed = this.speed * 2; // Move faster when returning home
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * moveSpeed;
        this.y += Math.sin(angle) * moveSpeed;
      }
      return; // Skip normal movement logic when eaten
    } else {
      this.changeDirectionCounter++;

      // Simple AI: occasionally try to move towards or away from Pacman
      if (this.changeDirectionCounter > 60) {
        this.changeDirectionCounter = 0;

        // 50% chance to move randomly or towards/away from Pacman
        if (Math.random() < 0.5) {
          const dx = pacman.x - this.x;
          const dy = pacman.y - this.y;

          if (this.isVulnerable) {
            // Run away from Pacman when vulnerable
            if (Math.abs(dx) > Math.abs(dy)) {
              this.direction = dx > 0 ? Direction.LEFT : Direction.RIGHT;
            } else {
              this.direction = dy > 0 ? Direction.UP : Direction.DOWN;
            }
          } else {
            // Chase Pacman normally
            if (Math.abs(dx) > Math.abs(dy)) {
              this.direction = dx > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
              this.direction = dy > 0 ? Direction.DOWN : Direction.UP;
            }
          }
        } else {
          // Random direction
          this.direction = this.randomDirection();
        }
      }
    }

    // Try to move in current direction
    const vector = DIRECTION_VECTORS[this.direction];
    const newX = this.x + vector.x * this.speed;
    const newY = this.y + vector.y * this.speed;

    if (!maze.checkCollision(newX, newY, this.radius)) {
      this.x = newX;
      this.y = newY;
    } else {
      // Hit a wall, change direction
      this.direction = this.randomDirection();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.radius * 2;

    if (this.isEaten) {
      // Draw eyes only when eaten (ghost returning home)
      const eyeOffset = 5;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(this.x - eyeOffset, this.y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + eyeOffset, this.y - 3, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(this.x - eyeOffset, this.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + eyeOffset, this.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.isVulnerable) {
      // Draw blue scared ghost
      ctx.fillStyle = '#0000FF';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw scared eyes
      const eyeOffset = 5;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(this.x - eyeOffset, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + eyeOffset, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.image && this.image.complete) {
      // Draw company logo image in a circle with border
      ctx.save();

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.clip();

      // Draw image within the circle
      ctx.drawImage(
        this.image,
        this.x - size / 2,
        this.y - size / 2,
        size,
        size
      );

      ctx.restore();

      // Draw circular border
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Fallback: draw colored circle if image not loaded
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  respawn(): void {
    this.x = this.startX;
    this.y = this.startY;
    this.isEaten = false;
    this.isVulnerable = false;
  }

  setVulnerable(vulnerable: boolean): void {
    this.isVulnerable = vulnerable;
  }

  eat(): void {
    this.isEaten = true;
    this.isVulnerable = false;
  }

  checkCollision(pacman: Pacman): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - pacman.x, 2) + Math.pow(this.y - pacman.y, 2)
    );
    return distance < this.radius + pacman.radius;
  }
}
