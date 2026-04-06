export const legacyTuning = {
  board: {
    // Legacy C++ truth (`MazerGameModeBase::SetupGrid`): default `_Scale` when unset.
    legacyScale: 50,
    // Rebuild currently uses this directly for parity tuning.
    scale: 50,
    checkPointModifier: 0.35,
    shortcutCountModifier: {
      menu: 0.13,
      game: 0.18
    }
  },
  camera: {
    // Legacy option range (`PauseMenuWidget` + `GamePauseMenu`): [-50, 50].
    camScaleMin: -50,
    camScaleMax: 50,
    camScaleDefault: 0,
    // Legacy camera distance behavior (`MazerPlayer`):
    // buffer = (scale + (camScale * 2)) * preScalar
    camScaleDoubleFactor: 2,
    normalizedBaseline: 0.83
  },
  menu: {
    layout: {
      boardScaleNarrow: 0.68,
      boardScaleWide: 0.72,
      topReserveRatio: 0.12,
      topReserveMinPx: 74,
      bottomPaddingPx: 112
    },
    title: {
      text: 'MAZER',
      fontScaleToBoard: 0.18,
      yOffsetFromBoardTop: -28,
      alpha: 0.48
    },
    subtitle: {
      text: 'Board-first maze runner',
      yOffsetFromTitle: 34
    },
    buttons: {
      laneBottomOffset: 48,
      spacing: 214,
      widths: {
        left: 164,
        center: 196,
        right: 204
      }
    },
    // Legacy menu labels/order from Unreal bindings.
    labels: ['Start', 'Options', 'Exit'] as const
  },
  game: {
    layout: {
      topReservePx: 64,
      bottomPaddingPx: 20
    }
  },
  overlays: {
    optionsLabels: ['Features', 'Game Modes', 'Back'] as const,
    pauseLabels: ['Back', 'Reset', 'Main Menu', 'Features'] as const
  },
  demo: {
    // Legacy AI was timer-driven (`_PlayerAiDelayDuration`); exact value was BP-driven.
    // This is our closest retained pacing from the current lane.
    stepMs: 70,
    goalPulseMs: 120
  },
  palette: {
    // Direct legacy defaults from `MazerGameInstance.h` originals.
    pathLinearRgb: { r: 0.19099, g: 0.192708, b: 0.18769 },
    wallLinearRgb: { r: 0.067708, g: 0.067708, b: 0.067708 },
    // Approximated from screenshots/material look where raw source values are not available.
    floorHex: 0x8f8f8f,
    playerHex: 0x3a7cff,
    goalHex: 0xff3f4a
  }
} as const;

export const toHex = (r: number, g: number, b: number): number => {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value * 255)));
  return (clamp(r) << 16) | (clamp(g) << 8) | clamp(b);
};


export const resolveBoardScaleFromCamScale = (
  camScale: number,
  baseline = legacyTuning.camera.normalizedBaseline
): number => {
  const clamped = Math.max(legacyTuning.camera.camScaleMin, Math.min(legacyTuning.camera.camScaleMax, camScale));
  const normalized = clamped / (legacyTuning.camera.camScaleMax * legacyTuning.camera.camScaleDoubleFactor);
  return baseline + normalized;
};
