import Phaser from 'phaser';
import { createDemoWalkerState, stepDemoWalker } from '../domain/ai';
import { generateMaze } from '../domain/maze/generator';
import { createBoardLayout, BoardRenderer } from '../render/boardRenderer';
import { palette } from '../render/palette';
import { OverlayManager } from '../ui/overlayManager';
import { createMenuButton } from '../ui/menuButton';
import { legacyTuning } from '../config/defaults';

const OVERLAY_EVENTS = {
  open: 'overlay-open',
  close: 'overlay-close'
} as const;

export class MenuScene extends Phaser.Scene {
  private overlayManager!: OverlayManager;
  private titlePulseTween?: Phaser.Tweens.Tween;

  public constructor() {
    super('MenuScene');
  }

  public create(): void {
    const { width, height } = this.scale;
    this.overlayManager = new OverlayManager(this, ['OptionsScene', 'FeaturesScene', 'ModesScene']);

    this.cameras.main.fadeIn(200, 0, 0, 0);
    this.drawStarfield(width, height);

    const maze = generateMaze({
      scale: legacyTuning.board.scale,
      seed: 1988,
      checkPointModifier: legacyTuning.board.checkPointModifier,
      shortcutCountModifier: legacyTuning.board.shortcutCountModifier.menuDemo
    });

    const layout = createBoardLayout(this, maze, {
      boardScale: width < legacyTuning.menu.boardScale.compactViewportMaxWidth
        ? legacyTuning.menu.boardScale.compact
        : legacyTuning.menu.boardScale.desktop,
      topReserve: Math.max(legacyTuning.menu.boardPadding.topReserveMin, Math.round(height * legacyTuning.menu.boardPadding.topReserveRatio)),
      bottomPadding: legacyTuning.menu.boardPadding.bottom
    });
    const boardRenderer = new BoardRenderer(this, maze, layout);
    boardRenderer.drawBoardChrome();
    boardRenderer.drawBase();
    boardRenderer.drawGoal();

    const boardShade = this.add
      .rectangle(layout.boardX + layout.boardSize / 2, layout.boardY + layout.boardSize / 2, layout.boardSize, layout.boardSize, 0x8a8a9a, 0.2)
      .setOrigin(0.5)
      .setBlendMode(Phaser.BlendModes.SCREEN);

    const title = this.add
      .text(width / 2, layout.boardY - legacyTuning.menu.title.yOffsetAboveBoard, legacyTuning.menu.title.text, {
        color: '#22af3f',
        fontFamily: 'monospace',
        fontSize: `${Math.round(layout.boardSize * legacyTuning.menu.title.sizeRatioOfBoard)}px`,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setAlpha(0.48)
      .setStroke('#0a561b', 6)
      .setShadow(0, 0, '#0f631f', 12, true, true)
      .setDepth(10);

    const subtitle = this.add
      .text(width / 2, title.y + legacyTuning.menu.title.subtitleOffsetY, legacyTuning.menu.title.subtitle, {
        color: '#aeb6d9',
        fontFamily: 'monospace',
        fontSize: '16px'
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.titlePulseTween = this.tweens.add({
      targets: [title, boardShade],
      alpha: { from: 0.36, to: 0.52 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const demo = createDemoWalkerState(maze);
    boardRenderer.drawTrail(demo.trailIndices);
    boardRenderer.drawActor(demo.currentIndex);

    this.time.addEvent({
      delay: legacyTuning.menu.demo.stepDelayMs,
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

    const buttonY = height - legacyTuning.menu.buttons.rowInsetBottom;
    const spacing = legacyTuning.menu.buttons.spacing;

    createMenuButton(this, {
      x: width / 2,
      y: buttonY,
      label: legacyTuning.menu.buttons.start.label,
      width: legacyTuning.menu.buttons.start.width,
      onClick: () => {
        this.overlayManager.closeAll();
        this.cameras.main.fadeOut(120, 0, 0, 0);
        this.time.delayedCall(120, () => this.scene.start('GameScene'));
      }
    });

    createMenuButton(this, {
      x: width / 2 + spacing,
      y: buttonY,
      label: legacyTuning.menu.buttons.options.label,
      width: legacyTuning.menu.buttons.options.width,
      onClick: () => this.events.emit(OVERLAY_EVENTS.open, 'OptionsScene')
    });

    createMenuButton(this, {
      x: width / 2 - spacing,
      y: buttonY,
      label: legacyTuning.menu.buttons.exit.label,
      width: legacyTuning.menu.buttons.exit.width,
      onClick: () => {
        this.overlayManager.closeAll();
        this.game.destroy(true);
      }
    });

    this.events.on(OVERLAY_EVENTS.open, (key: string) => this.overlayManager.open(key));
    this.events.on(OVERLAY_EVENTS.close, () => this.overlayManager.closeActive());

    this.input.keyboard?.on('keydown-ESC', () => {
      this.overlayManager.closeActive();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.titlePulseTween?.remove();
      this.overlayManager.closeAll();
    });

    subtitle.setDepth(11);
  }

  private drawStarfield(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(palette.background.deepSpace, palette.background.deepSpace, palette.background.nebula, palette.background.nebula, 1);
    bg.fillRect(0, 0, width, height);

    const clouds = this.add.graphics();
    for (let i = 0; i < 5; i += 1) {
      const x = Phaser.Math.Between(width * 0.12, width * 0.88);
      const y = Phaser.Math.Between(height * 0.16, height * 0.84);
      const radius = Phaser.Math.Between(120, 300);
      clouds.fillStyle(0x51308d, Phaser.Math.FloatBetween(0.1, 0.24));
      clouds.fillCircle(x, y, radius);
    }

    const stars = this.add.graphics();
    for (let i = 0; i < 280; i += 1) {
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
