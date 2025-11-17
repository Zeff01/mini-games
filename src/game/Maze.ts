import { TILE_SIZE } from './constants';

export class Maze {
  private layout: number[][];
  public offsetX: number;
  public offsetY: number;
  public totalPellets: number;
  public pelletsCollected: number;

  constructor() {
    this.layout = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 2, 1, 1, 0, 0, 1, 1, 2, 1, 2, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1],
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    this.offsetX = 100;
    this.offsetY = 0;

    // Place random power pellets
    this.placePowerPellets(4); // Place 4 random power pellets

    this.totalPellets = this.layout.reduce(
      (sum, row) => sum + row.filter(cell => cell === 2 || cell === 3).length,
      0
    );
    this.pelletsCollected = 0;
  }

  private placePowerPellets(count: number): void {
    const pelletPositions: Array<{ y: number; x: number }> = [];

    // Find all positions with regular pellets
    for (let y = 0; y < this.layout.length; y++) {
      for (let x = 0; x < this.layout[y].length; x++) {
        if (this.layout[y][x] === 2) {
          pelletPositions.push({ y, x });
        }
      }
    }

    // Randomly select positions for power pellets
    for (let i = 0; i < count && pelletPositions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * pelletPositions.length);
      const pos = pelletPositions[randomIndex];
      this.layout[pos.y][pos.x] = 3; // Convert to power pellet
      pelletPositions.splice(randomIndex, 1); // Remove from available positions
    }
  }

  checkCollision(x: number, y: number, radius: number): boolean {
    const positions = [
      [x - radius, y - radius],
      [x + radius, y - radius],
      [x - radius, y + radius],
      [x + radius, y + radius],
    ];

    for (const [px, py] of positions) {
      const gridX = Math.floor((px - this.offsetX) / TILE_SIZE);
      const gridY = Math.floor((py - this.offsetY) / TILE_SIZE);

      if (
        gridY >= 0 &&
        gridY < this.layout.length &&
        gridX >= 0 &&
        gridX < this.layout[0].length
      ) {
        if (this.layout[gridY][gridX] === 1) {
          return true;
        }
      }
    }

    return false;
  }

  collectPellet(x: number, y: number): number {
    const gridX = Math.floor((x - this.offsetX) / TILE_SIZE);
    const gridY = Math.floor((y - this.offsetY) / TILE_SIZE);

    if (
      gridY >= 0 &&
      gridY < this.layout.length &&
      gridX >= 0 &&
      gridX < this.layout[0].length
    ) {
      const cell = this.layout[gridY][gridX];
      if (cell === 2) {
        // Regular pellet
        this.layout[gridY][gridX] = 0;
        this.pelletsCollected++;
        return 1;
      } else if (cell === 3) {
        // Power pellet
        this.layout[gridY][gridX] = 0;
        this.pelletsCollected++;
        return 2;
      }
    }

    return 0;
  }

  draw(ctx: CanvasRenderingContext2D, colors: typeof import('./constants').COLORS): void {
    for (let y = 0; y < this.layout.length; y++) {
      for (let x = 0; x < this.layout[y].length; x++) {
        const screenX = x * TILE_SIZE + this.offsetX;
        const screenY = y * TILE_SIZE + this.offsetY;
        const cell = this.layout[y][x];

        if (cell === 1) {
          // Wall
          ctx.fillStyle = colors.BLUE;
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        } else if (cell === 2) {
          // Regular pellet
          ctx.fillStyle = colors.WHITE;
          ctx.beginPath();
          ctx.arc(
            screenX + TILE_SIZE / 2,
            screenY + TILE_SIZE / 2,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (cell === 3) {
          // Power pellet (bigger and glowing)
          ctx.fillStyle = colors.WHITE;
          ctx.beginPath();
          ctx.arc(
            screenX + TILE_SIZE / 2,
            screenY + TILE_SIZE / 2,
            8,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }

  reset(): void {
    this.pelletsCollected = 0;
    // Reset pellets in layout
    for (let y = 0; y < this.layout.length; y++) {
      for (let x = 0; x < this.layout[y].length; x++) {
        if (this.layout[y][x] === 0) {
          // Check original layout to restore pellets
          const shouldBePellet = y !== 9 || (x < 8 || x > 11);
          if (shouldBePellet && y !== 0 && y !== 19 && x !== 0 && x !== 19) {
            // Simplified: restore based on pattern
          }
        }
      }
    }
  }
}
