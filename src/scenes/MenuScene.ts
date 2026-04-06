import Phaser from 'phaser';
import { createDemoWalkerState, stepDemoWalker } from '../domain/ai';
import { generateMaze } from '../domain/maze/generator';
import { createBoardLayout, BoardRenderer } from '../render/boardRenderer';
import { palette } from '../render/palette';
import { OverlayManager } from '../ui/overlayManager';
import { createMenuButton } from '../ui/menuButton';

const OVERLAY_EVENTS = {
  open: 'overlay-open',
  close: 'overlay-close'
} as const;

export class MenuScene extends Phaser.Scene {
  private overlayManager!: OverlayManager;

  public constructor() {
    super('MenuScene');
  }

  public create(): void {
    const { width, height } = this.scale;
    this.overlayManager = new OverlayManager(this, ['OptionsScene', 'FeaturesScene', 'ModesScene']);

    this.drawStarfield(width, height);

    const maze = generateMaze({
      scale: 24,
      seed: 1988,
      checkPointModifier: 0.35,
      shortcutCountModifier: 0.13
    });

    const layout = createBoardLayout(this, maze, width < 900 ? 0.58 : 0.62);
    const boardRenderer = new BoardRenderer(this, maze, layout);
    boardRenderer.drawBoardChrome();
    boardRenderer.drawBase();
    boardRenderer.drawGoal();

    this.add
      .text(width / 2, height / 2 - layout.boardSize * 0.24, 'Mazer', {
        color: '#8cffa4',
        fontFamily: 'monospace',
        fontSize: `${Math.round(layout.boardSize * 0.2)}px`
      })
      .setOrigin(0.5)
      .setAlpha(0.42);

    const demo = createDemoWalkerState(maze);
    boardRenderer.drawTrail(demo.trailIndices);
    boardRenderer.drawActor(demo.currentIndex);

    this.time.addEvent({
      delay: 70,
      loop: true,
      callback: () => {
        const next = stepDemoWalker(maze, demo);
        demo.currentIndex = next.currentIndex;
        demo.trailIndices = next.trailIndices;
        demo.alternatives = next.alternatives;
        demo.visited = next.visited;
        demo.loops = next.loops;
        demo.reachedGoal = next.reachedGoal;

        boardRenderer.drawTrail(demo.trailIndices);
        boardRenderer.drawActor(demo.currentIndex);
      }
    });

    const buttonY = Math.min(height - 64, layout.boardY + layout.boardSize + 58);
    const spacing = Math.min(220, width * 0.24);

    createMenuButton(this, {
      x: width / 2 - spacing,
      y: buttonY,
      label: 'Start',
      onClick: () => this.scene.start('GameScene')
    });

    createMenuButton(this, {
      x: width / 2,
      y: buttonY,
      label: 'Options',
      onClick: () => this.events.emit(OVERLAY_EVENTS.open, 'OptionsScene')
    });

    createMenuButton(this, {
      x: width / 2 + spacing,
      y: buttonY,
      label: 'Exit',
      onClick: () => {
        this.game.destroy(true);
      }
    });

    this.events.on(OVERLAY_EVENTS.open, (key: string) => this.overlayManager.open(key));
    this.events.on(OVERLAY_EVENTS.close, () => this.overlayManager.closeActive());

    this.input.keyboard?.on('keydown-ESC', () => {
      this.overlayManager.closeActive();
    });
  }

  private drawStarfield(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(palette.background.deepSpace, palette.background.deepSpace, palette.background.nebula, palette.background.nebula, 1);
    bg.fillRect(0, 0, width, height);

    const stars = this.add.graphics();
    for (let i = 0; i < 240; i += 1) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const r = Phaser.Math.FloatBetween(0.5, 1.7);
      stars.fillStyle(palette.background.star, Phaser.Math.FloatBetween(0.25, 0.95));
      stars.fillCircle(x, y, r);
    }

    const vignette = this.add.graphics();
    vignette.fillStyle(palette.background.vignette, 0.24);
    vignette.fillRect(0, 0, width, height * 0.14);
    vignette.fillRect(0, height * 0.86, width, height * 0.14);
  }
}
