import { legacyTuning, toHex } from '../config/defaults';

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
    wall: toHex(
      legacyTuning.palette.wallLinearRgb.r,
      legacyTuning.palette.wallLinearRgb.g,
      legacyTuning.palette.wallLinearRgb.b
    ),
    floor: legacyTuning.palette.floorHex,
    path: toHex(
      legacyTuning.palette.pathLinearRgb.r,
      legacyTuning.palette.pathLinearRgb.g,
      legacyTuning.palette.pathLinearRgb.b
    ),
    goal: legacyTuning.palette.goalHex,
    player: legacyTuning.palette.playerHex
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
