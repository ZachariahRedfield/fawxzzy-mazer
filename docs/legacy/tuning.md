# Legacy tuning defaults (Unreal -> rebuild)

This document centralizes feel-defining defaults used by the rebuild and records which values are direct legacy truth vs approximations.

## Source of truth used
- Legacy code: `legacy/old-project.zip` (`Source/Mazer/**/*.cpp|*.h`).
- Legacy visual references: `legacy/screenshots/menu-01.png` ... `menu-04.png`.
- Rebuild central module: `src/config/defaults.ts`.

## Directly extracted from legacy code

### Board + generation
- Grid scale default: `_Scale = 50` when unset.
- Checkpoint modifier: `_CheckPointModifier = 0.35` usage is preserved.
- Shortcut modifiers used by rebuild lanes:
  - menu/demo: `0.13`
  - in-run: `0.18`

### Camera scale behavior
- Camera scale edit range in options/pause: `-50..50`.
- Camera distance formula:
  - `buffer = (scale + (camScale * 2)) * preScalar`
- Rebuild maps this behavior into normalized board-scale tuning via `resolveBoardScaleFromCamScale(...)`.

### Menu/pause/options labels + ordering
- Main menu labels/order (legacy): `Start`, `Options`, `Exit`.
- Menu-time options submenu order: `Features`, `Game Modes`, `Back`.
- In-game pause menu order: `Back`, `Reset`, `Main Menu`, `Features`.

### Path/wall color defaults
- Path original linear RGB: `(0.19099, 0.192708, 0.18769)`.
- Wall original linear RGB: `(0.067708, 0.067708, 0.067708)`.

## Approximated from screenshots/material intent
- Title proportion and placement over board.
- Bottom button lane spacing/offset values.
- Demo cadence (`70ms`) and goal pulse cadence (`120ms`) preserved from current lane as closest practical timing match to timer-driven legacy demo behavior.
- Floor/player/goal hex accents where explicit raw legacy material constants were not recoverable from C++.

## Wiring summary
- All feel defaults are centralized in `src/config/defaults.ts`.
- `MenuScene` and `GameScene` now consume board/camera/menu/demo tuning from that module.
- `palette.ts` now derives board path/wall colors from legacy linear RGB values.

## Rule enforced
> Legacy truth lives in one tuning module, not scattered magic numbers.
