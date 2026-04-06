# Legacy tuning defaults (Unreal ➜ rebuild)

This lane centralizes feel-defining defaults in `src/config/defaults.ts` and wires scene usage through that module.

## Source references inspected
- `legacy/old-project.zip` (`Source/Mazer/MazerGameModeBase.cpp`, `Source/Mazer/Public/MazerGameInstance.h`, `Source/Mazer/Private/UI/MainMenuWidget.cpp`, `Source/Mazer/Private/UI/PauseMenuWidget.cpp`, `Source/Mazer/Private/UI/GamePauseMenu.cpp`, `Config/DefaultInput.ini`).
- `legacy/screenshots/menu-01.png` … `menu-04.png` (1919×1078/1079 captures) for proportion checks.

## Defaults captured

| Area | Value in rebuild | Legacy status | Notes |
|---|---:|---|---|
| Board scale | `50` | **Direct** | Unreal sets `_Scale=50` when unset in `SetupGrid()`. |
| Board scale editable range | `25..150` | **Direct** | Options (`PauseMenuWidget`) accepts only this range. |
| Checkpoint modifier | `0.35` | **Direct-ish** | Existing tuned value preserved; legacy uses `_Scale + (_Scale * _CheckPointModifier)`. |
| Shortcut modifier (menu demo) | `0.13` | **Approx** | Legacy uses `_ShortcutCount = _Scale * _ShortcutCountModifier`; value itself is authored outside extracted text. |
| Shortcut modifier (in-run) | `0.18` | **Approx** | Same rationale as above. |
| Camera scale range | `-50..50` (default `0`) | **Direct** | Both pause/options camera text fields clamp this range. |
| Camera-scale behavior | board scale offset by `camScale * 0.0016` | **Approx formula mapping** | Legacy camera height behavior: `(scale + camScale * 2) * preScalar`; mapped to 2D board zoom in rebuild. |
| Title size | `boardSize * 0.16` | **Approx from screenshots** | Keeps oversized classic title weight without full UMG recreation. |
| Menu button row | bottom inset `48`, spacing `214` | **Approx from screenshots** | Preserves wide 3-button bottom row composition. |
| Menu labels/order | `Start`, `Options`, `Exit` | **Direct** | Matches `MainMenuWidget` bindings and legacy naming. |
| Pause labels/order record | `Back`, `Reset`, `Main Menu`, `Features` | **Direct (documented)** | Captured from `GamePauseMenu` bindings for future overlay parity. |
| Options labels/order record | `Maze Scale`, `Camera Scale`, `Path RGB`, `Wall RGB`, `Features`, `Game Modes`, `Back` | **Direct (documented)** | Captured from `PauseMenuWidget` controls and button bindings. |
| Path default color | linear RGB `(0.19099, 0.192708, 0.18769)` | **Direct** | From `_PathColorOriginal` in `MazerGameInstance.h`. |
| Wall default color | linear RGB `(0.067708, 0.067708, 0.067708)` | **Direct** | From `_WallColorOriginal` in `MazerGameInstance.h`. |
| Player default color | `0xffffff` | **Approx** | Legacy player material base color lives in binary `.uasset`; kept neutral until material extraction lane. |
| Goal default color | `0xff3f4a` | **Approx** | Kept close to legacy screenshots/high-contrast endpoint marker. |
| Demo cadence | `70 ms` | **Approx parity** | Existing menu cadence retained; legacy AI delay is configurable (`_PlayerAiDelayDuration`) but raw default not text-extracted. |

## Wiring scope in this lane
- Central module: `src/config/defaults.ts`.
- Scene value wiring only:
  - `src/scenes/MenuScene.ts`
  - `src/scenes/GameScene.ts`
- Palette defaults wired from central tuning:
  - `src/render/palette.ts`

No broad layout rewrite was done in this lane.
