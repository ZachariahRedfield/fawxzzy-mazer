import Phaser from 'phaser';
import { createOverlaySheet } from '../ui/overlaySheet';
import { createMenuButton } from '../ui/menuButton';

export class PauseScene extends Phaser.Scene {
  public constructor() {
    super('PauseScene');
  }

  public create(): void {
    const { width } = this.scale;
    const { contentY } = createOverlaySheet(this, 'Paused', 'Run is paused');

    createMenuButton(this, {
      x: width / 2,
      y: contentY,
      label: 'Back',
      onClick: () => this.emitAction('resume')
    });

    createMenuButton(this, {
      x: width / 2,
      y: contentY + 54,
      label: 'Main Menu',
      onClick: () => this.emitAction('menu')
    });

    createMenuButton(this, {
      x: width / 2,
      y: contentY + 108,
      label: 'Reset',
      onClick: () => this.emitAction('reset')
    });

    createMenuButton(this, {
      x: width / 2,
      y: contentY + 162,
      label: 'Features',
      onClick: () => this.emitAction('features')
    });

    createMenuButton(this, {
      x: width / 2,
      y: contentY + 216,
      label: 'Cam Scale',
      onClick: () => this.emitAction('cam-scale')
    });

    this.input.keyboard?.once('keydown-P', () => this.emitAction('resume'));
    this.input.keyboard?.once('keydown-ESC', () => this.emitAction('resume'));
  }

  private emitAction(action: 'resume' | 'menu' | 'reset' | 'features' | 'cam-scale'): void {
    this.scene.get('GameScene').events.emit('pause-action', { action });
  }
}
