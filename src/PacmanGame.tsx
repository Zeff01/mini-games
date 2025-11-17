import { useEffect, useRef } from 'react';
import { Game } from './game/Game';
import './PacmanGame.css';

export function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas);
    gameRef.current = game;
    game.start();

    return () => {
      game.stop();
    };
  }, []);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Pacman Game</h1>
        <div className="controls-info">
          <p>Use Arrow Keys or WASD to move</p>
          <p>Eat the big dots to turn ghosts blue and eat them!</p>
          <p>Press R to restart after game over</p>
        </div>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
