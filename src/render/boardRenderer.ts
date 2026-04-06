import Phaser from 'phaser';
import type { MazeBuildResult } from '../domain/maze';
import { palette } from './palette';

export interface BoardLayout {
  boardX: number;
  boardY: number;
  boardSize: number;
  tileSize: number;
}

export const createBoardLayout = (scene: Phaser.Scene, maze: MazeBuildResult, boardScale = 0.82): BoardLayout => {
  const { width, height } = scene.scale;
  const topHudReserve = 64;
  const sidePadding = 20;
  const availableWidth = width - (sidePadding * 2);
  const availableHeight = height - topHudReserve - sidePadding;
  const boardSize = Math.min(availableWidth, availableHeight) * boardScale;
  const boardX = width / 2 - boardSize / 2;
  const boardY = topHudReserve + ((availableHeight - boardSize) / 2);

  return {
    boardX,
    boardY,
    boardSize,
    tileSize: boardSize / maze.scale
  };
};

export class BoardRenderer {
  private readonly base: Phaser.GameObjects.Graphics;
  private readonly grid: Phaser.GameObjects.Graphics;
  private readonly goal: Phaser.GameObjects.Graphics;
  private readonly trail: Phaser.GameObjects.Graphics;
  private readonly actor: Phaser.GameObjects.Graphics;

  public constructor(private readonly scene: Phaser.Scene, private readonly maze: MazeBuildResult, private readonly layout: BoardLayout) {
    this.base = this.scene.add.graphics();
    this.grid = this.scene.add.graphics();
    this.goal = this.scene.add.graphics();
    this.trail = this.scene.add.graphics();
    this.actor = this.scene.add.graphics();
  }

  public drawBoardChrome(): void {
    const { boardX, boardY, boardSize } = this.layout;
    this.scene.add.rectangle(boardX + boardSize / 2, boardY + boardSize / 2, boardSize + 20, boardSize + 20, palette.board.panel, 0.3).setStrokeStyle(2, palette.board.panelStroke, 0.9);
    this.scene.add.rectangle(boardX + boardSize / 2, boardY + boardSize / 2, boardSize, boardSize, palette.board.panel, 0.66).setStrokeStyle(1, palette.board.panelStroke, 0.62);
  }

  public drawBase(): void {
    const { boardX, boardY, tileSize } = this.layout;
    this.base.clear();
    this.grid.clear();

    this.maze.tiles.forEach((tile) => {
      const color = tile.floor ? palette.board.floor : palette.board.wall;
      this.base.fillStyle(color, tile.floor ? 0.86 : 0.96);
      this.base.fillRect(boardX + tile.x * tileSize, boardY + tile.y * tileSize, tileSize, tileSize);
      this.grid.lineStyle(1, 0x000000, tile.floor ? 0.2 : 0.34);
      this.grid.strokeRect(boardX + tile.x * tileSize, boardY + tile.y * tileSize, tileSize, tileSize);
    });
  }

  public drawGoal(): void {
    const { boardX, boardY, tileSize } = this.layout;
    const goalTile = this.maze.tiles[this.maze.endIndex];
    this.goal.clear();
    const centerX = boardX + goalTile.x * tileSize + tileSize / 2;
    const centerY = boardY + goalTile.y * tileSize + tileSize / 2;
    this.goal.lineStyle(Math.max(2, tileSize * 0.06), palette.board.goal, 1);
    this.goal.strokeCircle(centerX, centerY, tileSize * 0.34);
    this.goal.fillStyle(palette.board.goal, 0.92);
    this.goal.fillCircle(centerX, centerY, tileSize * 0.12);
  }

  public drawTrail(indices: number[]): void {
    const { boardX, boardY, tileSize } = this.layout;
    this.trail.clear();
    const startAlpha = 0.28;
    const endAlpha = 0.88;

    for (let i = 0; i < indices.length; i += 1) {
      const index = indices[i];
      const tile = this.maze.tiles[index];
      const t = indices.length <= 1 ? 1 : i / (indices.length - 1);
      const alpha = Phaser.Math.Linear(startAlpha, endAlpha, t);
      this.trail.fillStyle(palette.board.path, alpha);
      this.trail.fillRect(boardX + tile.x * tileSize + tileSize * 0.16, boardY + tile.y * tileSize + tileSize * 0.16, tileSize * 0.68, tileSize * 0.68);
    }
  }

  public drawActor(index: number): void {
    const { boardX, boardY, tileSize } = this.layout;
    const tile = this.maze.tiles[index];
    this.actor.clear();
    this.actor.fillStyle(0xffffff, 0.98);
    this.actor.fillCircle(boardX + tile.x * tileSize + (tileSize / 2), boardY + tile.y * tileSize + (tileSize / 2), tileSize * 0.28);
  }
}
