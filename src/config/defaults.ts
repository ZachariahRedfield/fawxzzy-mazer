export const legacyTuning = {
  board: {
    // Legacy Unreal fallback when scale was unset.
    scale: 50,
    scaleRange: {
      min: 25,
      max: 150
    },
    checkPointModifier: 0.35,
    shortcutCountModifier: {
      menuDemo: 0.13,
      inRun: 0.18
    }
  },
  camera: {
    // Legacy pause/options editable range for _CamScale.
    scale: {
      default: 0,
      min: -50,
      max: 50
    },
    // Legacy behavior: buffer = (boardScale + camScale * 2) * preScalar
    bufferScalar: {
      preScalar: 100,
      camScaleMultiplier: 2
    },
    // Rebuild approximation to map legacy cam scale into 2D board zoom.
    boardScalePerStep: 0.0016
  },
  menu: {
    boardScale: {
      compact: 0.72,
      desktop: 0.76,
      compactViewportMaxWidth: 900
    },
    boardPadding: {
      topReserveRatio: 0.12,
      topReserveMin: 74,
      bottom: 112
    },
    title: {
      text: 'MAZER',
      sizeRatioOfBoard: 0.16,
      yOffsetAboveBoard: 24,
      subtitle: 'Board-first maze runner',
      subtitleOffsetY: 34
    },
    demo: {
      stepDelayMs: 70
    },
    buttons: {
      rowInsetBottom: 48,
      spacing: 214,
      start: { label: 'Start', width: 196 },
      options: { label: 'Options', width: 204 },
      exit: { label: 'Exit', width: 164 }
    }
  },
  game: {
    boardScale: 0.83,
    topReserve: 64,
    bottomPadding: 20
  },
  labels: {
    menuOrder: ['Start', 'Options', 'Exit'],
    optionsOrder: ['Maze Scale', 'Camera Scale', 'Path RGB', 'Wall RGB', 'Features', 'Game Modes', 'Back'],
    pauseOrder: ['Back', 'Reset', 'Main Menu', 'Features']
  },
  colors: {
    // Directly from legacy headers (linear RGB authored defaults).
    pathLinearRgb: { r: 0.19099, g: 0.192708, b: 0.18769 },
    wallLinearRgb: { r: 0.067708, g: 0.067708, b: 0.067708 },
    // Legacy goal/player material defaults are not text-extracted from uassets.
    playerHexApprox: 0xffffff,
    goalHexApprox: 0xff3f4a
  }
} as const;

export type LegacyTuning = typeof legacyTuning;
