import { Maze } from './Maze';
import { Pacman } from './Pacman';
import { Ghost } from './Ghost';
import { Direction, GameState } from './types';
import { COLORS, SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE } from './constants';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private maze: Maze;
  private pacman: Pacman;
  private ghosts: Ghost[];
  private score: number;
  private gameState: 'playing' | 'won' | 'lost';
  private animationId: number | null;
  private powerMode: boolean;
  private powerModeTimer: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;

    this.maze = new Maze();
    this.pacman = new Pacman(100 + TILE_SIZE * 1.5, TILE_SIZE * 1.5);
    this.ghosts = [
      new Ghost(100 + TILE_SIZE * 8.5, TILE_SIZE * 9.5, COLORS.RED, '/hubspot.png'),
      new Ghost(100 + TILE_SIZE * 9.5, TILE_SIZE * 9.5, COLORS.PINK, '/webflow.png'),
      new Ghost(100 + TILE_SIZE * 10.5, TILE_SIZE * 9.5, COLORS.CYAN, '/wix.png'),
      new Ghost(100 + TILE_SIZE * 11.5, TILE_SIZE * 9.5, COLORS.ORANGE, '/zapier.png'),
    ];
    this.score = 0;
    this.gameState = 'playing';
    this.animationId = null;
    this.powerMode = false;
    this.powerModeTimer = 0;

    this.setupKeyboardControls();
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (e) => {
      if (this.gameState === 'playing') {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            this.pacman.setNextDirection(Direction.UP);
            e.preventDefault();
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            this.pacman.setNextDirection(Direction.DOWN);
            e.preventDefault();
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            this.pacman.setNextDirection(Direction.LEFT);
            e.preventDefault();
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            this.pacman.setNextDirection(Direction.RIGHT);
            e.preventDefault();
            break;
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        if (this.gameState !== 'playing') {
          this.restart();
        }
      }
    });
  }

  update(): void {
    if (this.gameState === 'playing') {
      this.pacman.update(this.maze);

      // Check pellet collection
      const pelletType = this.maze.collectPellet(this.pacman.x, this.pacman.y);
      if (pelletType === 1) {
        // Regular pellet
        this.score += 10;
      } else if (pelletType === 2) {
        // Power pellet
        this.score += 50;
        this.activatePowerMode();
      }

      // Update power mode timer
      if (this.powerMode) {
        this.powerModeTimer--;
        if (this.powerModeTimer <= 0) {
          this.deactivatePowerMode();
        }
      }

      // Update ghosts
      for (const ghost of this.ghosts) {
        ghost.update(this.maze, this.pacman);

        // If ghost respawned during power mode, make it vulnerable again
        if (this.powerMode && !ghost.isEaten && !ghost.isVulnerable) {
          ghost.setVulnerable(true);
        }

        // Check collision with Pacman
        if (ghost.checkCollision(this.pacman) && !ghost.isEaten) {
          if (this.powerMode && ghost.isVulnerable) {
            // Eat the ghost
            ghost.eat();
            this.score += 200;
          } else if (!ghost.isVulnerable) {
            // Ghost kills Pacman
            this.gameState = 'lost';
          }
        }
      }

      // Check win condition
      if (this.maze.pelletsCollected >= this.maze.totalPellets) {
        this.gameState = 'won';
      }
    }
  }

  private activatePowerMode(): void {
    this.powerMode = true;
    this.powerModeTimer = 600; // 10 seconds at 60 FPS
    this.pacman.setPowerMode(true);
    for (const ghost of this.ghosts) {
      if (!ghost.isEaten) {
        ghost.setVulnerable(true);
      }
    }
  }

  private deactivatePowerMode(): void {
    this.powerMode = false;
    this.powerModeTimer = 0;
    this.pacman.setPowerMode(false);
    for (const ghost of this.ghosts) {
      ghost.setVulnerable(false);
    }
  }

  draw(): void {
    // Clear canvas
    this.ctx.fillStyle = COLORS.BLACK;
    this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw game objects
    this.maze.draw(this.ctx, COLORS);
    this.pacman.draw(this.ctx, COLORS.YELLOW);

    for (const ghost of this.ghosts) {
      ghost.draw(this.ctx);
    }

    // Draw UI
    this.ctx.fillStyle = COLORS.WHITE;
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(
      `Pellets: ${this.maze.pelletsCollected}/${this.maze.totalPellets}`,
      10,
      60
    );

    // Draw game over / win messages
    if (this.gameState === 'won') {
      // Draw semi-transparent background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(
        SCREEN_WIDTH / 2 - 250,
        SCREEN_HEIGHT / 2 - 100,
        500,
        150
      );

      this.ctx.fillStyle = COLORS.YELLOW;
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('YOU WIN!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30);

      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText(
        'Press R to restart',
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2 + 20
      );
      this.ctx.textAlign = 'left';
    } else if (this.gameState === 'lost') {
      // Draw semi-transparent background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(
        SCREEN_WIDTH / 2 - 250,
        SCREEN_HEIGHT / 2 - 100,
        500,
        150
      );

      this.ctx.fillStyle = COLORS.RED;
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30);

      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText(
        'Press R to restart',
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2 + 20
      );
      this.ctx.textAlign = 'left';
    }
  }

  start(): void {
    const gameLoop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  restart(): void {
    this.stop();
    this.maze = new Maze();
    this.pacman = new Pacman(100 + TILE_SIZE * 1.5, TILE_SIZE * 1.5);
    this.ghosts = [
      new Ghost(100 + TILE_SIZE * 8.5, TILE_SIZE * 9.5, COLORS.RED, '/hubspot.png'),
      new Ghost(100 + TILE_SIZE * 9.5, TILE_SIZE * 9.5, COLORS.PINK, '/webflow.png'),
      new Ghost(100 + TILE_SIZE * 10.5, TILE_SIZE * 9.5, COLORS.CYAN, '/wix.png'),
      new Ghost(100 + TILE_SIZE * 11.5, TILE_SIZE * 9.5, COLORS.ORANGE, '/zapier.png'),
    ];
    this.score = 0;
    this.gameState = 'playing';
    this.powerMode = false;
    this.powerModeTimer = 0;
    this.start();
  }

  getState(): GameState {
    return {
      score: this.score,
      pelletsCollected: this.maze.pelletsCollected,
      totalPellets: this.maze.totalPellets,
      status: this.gameState,
    };
  }
}
