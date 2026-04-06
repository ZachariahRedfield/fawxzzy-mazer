import Phaser from 'phaser';
import type { MazeBuildResult } from '../domain/maze';

interface HudHandle {
  setElapsedMs(elapsedMs: number): void;
  setGoalArrow(playerIndex: number): void;
}

const formatTime = (elapsedMs: number): string => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const createHudRenderer = (scene: Phaser.Scene, maze: MazeBuildResult): HudHandle => {
  const timerText = scene.add
    .text(18, 18, '00:00', {
      color: '#8cffa4',
      fontFamily: 'monospace',
      fontSize: '24px'
    })
    .setScrollFactor(0)
    .setDepth(1000);

  const arrowText = scene.add
    .text(scene.scale.width - 18, 18, 'Goal ▲', {
      color: '#ff4f5d',
      fontFamily: 'monospace',
      fontSize: '20px'
    })
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(1000);

  return {
    setElapsedMs(elapsedMs: number): void {
      timerText.setText(formatTime(elapsedMs));
    },
    setGoalArrow(playerIndex: number): void {
      const player = maze.tiles[playerIndex];
      const goal = maze.tiles[maze.endIndex];
      const dx = goal.x - player.x;
      const dy = goal.y - player.y;
      const isHorizontal = Math.abs(dx) >= Math.abs(dy);
      const glyph = isHorizontal ? (dx >= 0 ? '▶' : '◀') : (dy >= 0 ? '▼' : '▲');
      arrowText.setText(`Goal ${glyph}`);
    }
  };
};
