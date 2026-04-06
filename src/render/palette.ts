import { legacyTuning } from '../config/defaults';

const toByte = (value: number): number => Math.max(0, Math.min(255, Math.round(value * 255)));

const linearRgbToHex = (rgb: { r: number; g: number; b: number }): number => {
  const r = toByte(rgb.r);
  const g = toByte(rgb.g);
  const b = toByte(rgb.b);
  return (r << 16) | (g << 8) | b;
};

export const palette = {
  background: {
    deepSpace: 0x140a2a,
    nebula: 0x3b1b63,
    vignette: 0x090511,
    star: 0xf0ecff
  },
  board: {
    panel: 0x1f1b2c,
    panelStroke: 0x23212d,
    wall: linearRgbToHex(legacyTuning.colors.wallLinearRgb),
    floor: 0x8f8f8f,
    path: linearRgbToHex(legacyTuning.colors.pathLinearRgb),
    goal: legacyTuning.colors.goalHexApprox,
    player: legacyTuning.colors.playerHexApprox
  },
  ui: {
    title: 0x1fab3a,
    text: 0xe9f0ff,
    textDim: 0xb5b8d8,
    buttonFill: 0x151625,
    buttonStroke: 0x5e577f,
    buttonHover: 0x23253a,
    overlayFill: 0x0f1020,
    overlayStroke: 0x66608d
  }
} as const;
