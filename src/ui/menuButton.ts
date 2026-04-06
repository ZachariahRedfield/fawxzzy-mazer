import Phaser from 'phaser';
import { palette } from '../render/palette';
import { proceduralSfx } from '../audio';

interface MenuButtonConfig {
  x: number;
  y: number;
  label: string;
  width?: number;
  onClick: () => void;
  sound?: 'confirm' | 'cancel';
}

export const createMenuButton = (scene: Phaser.Scene, config: MenuButtonConfig): Phaser.GameObjects.Container => {
  const width = config.width ?? 180;
  const height = 44;

  const rect = scene.add
    .rectangle(0, 0, width, height, palette.ui.buttonFill, 0.84)
    .setStrokeStyle(2, palette.ui.buttonStroke, 1)
    .setOrigin(0.5);

  const text = scene.add
    .text(0, 0, config.label, {
      color: '#e9f0ff',
      fontFamily: 'monospace',
      fontSize: '20px'
    })
    .setOrigin(0.5);

  const container = scene.add.container(config.x, config.y, [rect, text]);
  const hit = scene.add.rectangle(0, 0, width, height, 0x000000, 0.001).setOrigin(0.5).setInteractive({ useHandCursor: true });
  container.add(hit);

  hit.on('pointerover', () => {
    rect.setFillStyle(palette.ui.buttonHover, 0.9);
    text.setTint(palette.ui.title);
    scene.tweens.killTweensOf(container);
    scene.tweens.add({
      targets: container,
      scaleX: 1.015,
      scaleY: 1.015,
      duration: 80,
      ease: 'Quad.easeOut'
    });
  });

  hit.on('pointerout', () => {
    rect.setFillStyle(palette.ui.buttonFill, 0.84);
    text.clearTint();
    scene.tweens.killTweensOf(container);
    scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 90,
      ease: 'Quad.easeOut'
    });
  });

  hit.on('pointerdown', () => {
    scene.tweens.killTweensOf(container);
    container.setScale(0.985);
    scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Quad.easeOut'
    });

    proceduralSfx.play(config.sound === 'cancel' ? 'back-cancel' : 'menu-confirm');
    config.onClick();
  });

  return container;
};
