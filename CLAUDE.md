# Wildbound

An original creature-collecting RPG in the classic Pokémon mold, presented in an HD-2D pixel style. Creatures are called **Kith**. The owner is Derek. This repo holds the playable Chapter One build (Hearthmoss Village and Route 1) and everything needed to keep building.

**New to the project? Read `docs/HANDOFF.md` next.** It covers the current state, what is verified and what is not, Derek's decisions, open questions, the story canon digest and the gotchas. `docs/KITH_ROSTER.md` is the creature plan.

## Commands

```
python3 build.py            # assemble dist/index.html from src/
python3 build.py --data     # also rebuild src/data.json from assets/ and data/ (needs Pillow)
node --check dist/game.check.js   # syntax check of the assembled script
python3 tests/drive.py <name> <width> <height> <mobile 0|1> < script.txt   # scripted playthrough (needs Playwright + Chromium)
```

`dist/index.html` is the whole game in one file: no server, no dependencies. Open it in a browser. It must keep working as a single self-contained file on both desktop and phones, because it is published as a web artifact.

## Layout

| Path | What it is |
| --- | --- |
| `src/shell.html` | Page skeleton and all CSS. `build.py` inlines the scripts and data at the `/*TAG*/` markers. |
| `src/ui.js` | `UI`: the chooser overlay used by every menu, screen fades, the evolution scene. |
| `src/battle_core.js` | Battle presentation: canvas, particles, tweens, lights, the procedural arenas, move animations (`ANIM`), the move table (`MV`), synthesized sound (`S`). |
| `src/battle_game.js` | Battle rules: Kith instances, stats, XP, turn flow, AI, catching, traits, items. Exports the `Battle` object. |
| `src/ow_core.js` | Overworld engine: world generation, painted ground, perspective ground plane, billboards, lighting, time of day. |
| `src/game.js` | The game itself: save data, input, dialog, NPCs, story scenes, encounters, menus, title screen, main loop. |
| `src/data.json` | Generated. Species, natures, traits, type chart and every image as a data URI. Do not edit by hand. |
| `tools/build_data.py` | Builds `src/data.json`. Colour-grades world art toward the engine palette and derives night window masks. |
| `data/*.json` | Canonical game data exported from `data/src/`. |
| `data/src/*.py` | Source of truth for moves (279), traits (95), natures, the type chart and the 23-species roster. Run `export.py` and `export_roster.py` from `data/src/` to regenerate `data/*.json`. |
| `assets/` | Native-resolution art from the artist pipeline (ChatGPT). Read-only inputs; `assets/manifest.json` is generated. |
| `art/` | Concept lineups and review sheets. Not loaded by the game. |
| `docs/` | `HANDOFF.md` (development handoff), `ART_PIPELINE.md` (art contract), `KITH_ROSTER.md` (creature plan), art pack handoff and layout indexes, HD-2D direction, and `camera_calibration.json` (the measured camera for artists). |
| `tests/drive.py` | Playwright driver. `window.WB` exposes debug hooks (state, warp, start a wild battle). |

## Art workflow

ChatGPT is the lead asset artist and publishes approved art on the `art-production` branch, then opens a pull request into `main`. The contract (folders, names, sprite sizes, manifest, revisions) is `docs/ART_PIPELINE.md`, enforced by `tools/check_assets.py` and the `Asset check and build` GitHub Action.

- Do not redesign, redraw, recolour at source, or replace approved art. Colour-matching happens only at build time in `grade()`.
- Art pull requests change `assets/` and `art/` only. Wiring new art into the game is a separate change on the development side: add the file to `tools/build_data.py`, run `python3 build.py --data`, then use it.
- After merging art, run `python3 tools/check_assets.py --write` if the manifest is stale.
- New art is inert until it is wired in, so merging an art pull request cannot change the running game.

## How the game is put together

- Two scopes share one page: `Battle` (an IIFE) and the overworld/game IIFE. They talk only through `Battle.start(...)`, which returns a promise with `{result: 'win'|'lose'|'run'|'caught'}`, and a few helpers (`Battle.newKith`, `calcStats`, `healKith`, `evolve`).
- Battle DOM ids are prefixed `b_`. Inside `Battle`, `$('x')` means `#b_x`.
- Story progress is `G.flags` (`begun`, `intro`, `starter`, `cole1`, `dad`, `sensor`, `t_<trainer id>`, `done`, `resonance`). Scenes are `async` functions wrapped in `cutscene()`. Never nest `cutscene()` calls; call the inner scene function directly.
- A Kith instance is a plain object: `{sp, L, xp, nat, pot, cond, gender, trait, st, hp, moves:[{n, pp}]}`. Stats come from `calcStats`. Saves are `JSON.stringify(G)` in `localStorage`, always inside try/catch.
- The world is a 60×80 grid of 16-px tiles. Tile values: 0 walkable, 1 blocked, 2 water, 3 tall grass. Positions in scenes are tile coordinates. World generation is seeded, so changing what is reserved or placed shifts the random scatter of trees and rocks.
- The main loop draws either the overworld or the battle, never both.

## Rules that must hold

- **Art:** draw sprites with nearest-neighbour sampling. Never mirror a sprite (Burrowbit's floppy ear is its anatomical left; Barnacub's and Barnaclaw's big claw is the right). Pivot is bottom-centre. Frame layouts are in `docs/sprite_layouts.json`.
- **Style:** the look is the engine's: painted ground, soft lighting, depth blur, charcoal-and-gold menus. Pack art is used for objects and characters and is colour-graded to match (`grade()` in `tools/build_data.py`). Derek prefers this over flat tile-atlas ground or flat painted battle backdrops.
- **Lighting lives in the engine.** Source art stays flat and evenly lit.
- **Tone:** adult writing in a world that mostly works. No war, no grimdark, society is not the villain. Cole is a strong, likeable rival.
- **Names:** every move, Kith, item and place is original. Do not use Pokémon names.
- **Resonance is locked.** `G.flags.resonance` gates it; it is meant to unlock in a story event that has not been written yet. Do not expose it earlier.
- A Kith only learns moves that exist in `MV` (they need an animation kind). Add the move to `MV` in `src/battle_core.js` before adding it to play.

## Backlog, roughly in order

1. Interiors: the player's house and Wren's lab (move the starter scene and June's healing indoors). Needs interior art from the artist pipeline.
2. Resonance introduction event (proposed: the second Cole battle on Route 3).
3. Route 2, Cindervale City, the mines, Gym 1 (Dara Flint), the Archive field station.
4. Money, shops and a healing station.
5. More of the 279 moves in `MV`, and more working traits (currently: Overgrowth, Kindling, Undercurrent, Hard Claws, Sharp Eyes, Static Fur, Accelerate, Opening Gambit, Molting, Gatherer).
6. Trust, Oathbonds and organization Standing (designed, not built).
7. More music. `SONGS` in `src/battle_game.js` holds the synthesized themes (`town`, `route`, `battle`); `Battle.playMusic(name)` plays one. Add a theme per new area. Recorded tracks may replace these later.
8. Engineering: split the big single-line functions into readable modules, move map layout and scene scripts into data files, add automated playthrough tests.

## Known shortcuts

- No interiors yet; the starter scene happens at a table outside the lab.
- The pack's 16×16 ground atlas, UI nine-slices, type labels and painted battle scenes are in `assets/` but not used.
- Ember types cannot be burned and Volt types cannot be paralyzed; no other statuses exist yet.
- Much of `battle_core.js` and `ow_core.js` is dense, minified-style code carried over from prototypes. Refactor freely, but check desktop and a 390×844 phone viewport after any change.
