# Wildbound

An original creature-collecting RPG in the classic Pokémon mold, presented in an HD-2D pixel style. Creatures are called **Kith**. The owner is Derek. This repo holds the playable Chapter One build (Hearthmoss Village, Route 1, Route 2 and a first pass of Cindervale City) and everything needed to keep building.

**New to the project? Read `docs/HANDOFF.md` next.** It covers the current state, what is verified and what is not, Derek's decisions, open questions, the story canon digest and the gotchas. `docs/KITH_ROSTER.md` is the creature plan.

## Commands

```
python3 build.py            # assemble dist/index.html from src/
python3 build.py --data     # also rebuild src/data.json from assets/ and data/ (needs Pillow)
node --check dist/game.check.js   # syntax check of the assembled script
python3 tests/drive.py <name> <width> <height> <mobile 0|1> < script.txt   # scripted playthrough (needs Playwright + Chromium)
python3 tests/playthrough.py desk    # plays all of Chapter One with real input, about eight minutes
python3 tests/playthrough.py phone   # the same at 390×844 with the touch controls
```

Run both `playthrough.py` modes after any change to gameplay, layout or input. They exit 1 on a page error, a stall or broken text, and write a log and screenshots to `tests/shots/playthrough/`.

`dist/index.html` is the whole game in one file: no server, no dependencies. Open it in a browser. It must keep working as a single self-contained file on both desktop and phones, because it is published as a web artifact.

## Layout

| Path | What it is |
| --- | --- |
| `src/shell.html` | Page skeleton and all CSS. `build.py` inlines the scripts and data at the `/*TAG*/` markers. |
| `src/ui.js` | `UI`: the chooser overlay used by every menu, screen fades, the evolution scene. |
| `src/battle_core.js` | Battle presentation: canvas, particles, tweens, lights, the procedural arenas, move animations (`ANIM`), the move table (`MV`), synthesized sound (`S`). |
| `src/battle_game.js` | Battle rules: Kith instances, stats, XP, turn flow, AI, catching, traits, items. Exports the `Battle` object. |
| `src/ow_core.js` | Overworld engine: the tile grid, placing helpers (`placeHouse`, `prop`, `scatter`, `wallIn`), painted ground (paths, paving, rails, gravel, pond), perspective ground plane, billboards, lighting, chimney smoke, time of day. |
| `src/maps.js` | The areas: `MAPS.hearthmoss` (village and Route 1), `MAPS.route2`, `MAPS.cindervale`. Each has a size, a seed, ground features, exits, pick-up items and a `build()` that places everything standing. |
| `src/game.js` | The game itself: save data, input, dialog, NPCs, story scenes, encounters, menus, title screen, main loop. |
| `src/data.json` | Generated. Species, natures, traits, type chart and every image as a data URI. Do not edit by hand. |
| `tools/build_data.py` | Builds `src/data.json`. Colour-grades world art toward the engine palette and derives night window masks. |
| `data/*.json` | Canonical game data exported from `data/src/`. |
| `data/src/*.py` | Source of truth for moves (279), traits (95), natures, the type chart and the 23-species roster. Run `export.py` and `export_roster.py` from `data/src/` to regenerate `data/*.json`. |
| `assets/` | Native-resolution art from the artist pipeline (ChatGPT). Read-only inputs; `assets/manifest.json` is generated. |
| `art/` | Concept lineups and review sheets. Not loaded by the game. |
| `docs/` | `HANDOFF.md` (development handoff), `ART_PIPELINE.md` (art contract), `KITH_ROSTER.md` (creature plan), art pack handoff and layout indexes, HD-2D direction, and `camera_calibration.json` (the measured camera for artists). |
| `tests/drive.py` | Playwright driver. `window.WB` exposes debug hooks (state, warp, start a wild battle). |
| `tests/playthrough.py` | Start-to-finish Chapter One playthrough with real key, touch and click input. |

## Art workflow

ChatGPT is the lead asset artist and publishes approved art on the `art-production` branch, then opens a pull request into `main`. The contract (folders, names, sprite sizes, manifest, revisions) is `docs/ART_PIPELINE.md`, enforced by `tools/check_assets.py` and the `Asset check and build` GitHub Action.

- Do not redesign, redraw, recolour at source, or replace approved art. Colour-matching happens only at build time in `grade()`.
- Art pull requests change `assets/` and `art/` only. Wiring new art into the game is a separate change on the development side: add the file to `tools/build_data.py`, run `python3 build.py --data`, then use it.
- After merging art, run `python3 tools/check_assets.py --write` if the manifest is stale.
- New art is inert until it is wired in, so merging an art pull request cannot change the running game.

## How the game is put together

- Two scopes share one page: `Battle` (an IIFE) and the overworld/game IIFE. They talk only through `Battle.start(...)`, which returns a promise with `{result: 'win'|'lose'|'run'|'caught'}`, and a few helpers (`Battle.newKith`, `calcStats`, `healKith`, `evolve`).
- Battle DOM ids are prefixed `b_`. Inside `Battle`, `$('x')` means `#b_x`.
- Story progress is `G.flags` (`begun`, `intro`, `starter`, `cole1`, `dad`, `sensor`, `sensor2`, `t_<trainer id>`, `i_<item id>`, `done`, `resonance`). Scenes are `async` functions wrapped in `cutscene()`. Never nest `cutscene()` calls; call the inner scene function directly.
- A Kith instance is a plain object: `{sp, L, xp, nat, pot, cond, gender, trait, st, hp, moves:[{n, pp}]}`. Stats come from `calcStats`. Saves are `JSON.stringify(G)` in `localStorage`, always inside try/catch.
- One area is loaded at a time (`G.map`). `enterMap(id)` builds it and paints its ground, which takes about a second, so it always runs behind a fade; `travel(id, x, y, dir)` is the walk between areas. An area's `exits` say which edge leads where. Hearthmoss and Route 1 share one 60×80 area (rows above 47 are Route 1); Route 2 is 60×100; Cindervale is 64×76.
- Tiles are 16 px. Tile values: 0 walkable, 1 blocked, 2 water, 3 tall grass. Positions in scenes are tile coordinates. World generation is seeded per area, so placing or reserving anything before a `scatter()` call shifts the trees and rocks after it. Add decoration at the end of `build()`.
- People are built per area in `buildNpcs()` (`npcsHearthmoss`, `npcsRoute2`, `npcsCindervale`). `amb({...})` adds a background person, snapped to the nearest open tile; `wander: n` lets them stroll n tiles from home. `addKith({sp, ...})` adds a Kith going about its day. Trainers use `addNpc` with fixed tiles so their line of sight stays where it was designed.
- Losing a battle returns the player to `G.heal` (the last place they rested: Farmer Dell's on Route 2 or the Cindervale Rest Lodge), or home to June if they have not used one.
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
3. Cindervale: the Stone Gym battle with Dara Flint (her art is merged, not wired), the mines (needs art: a mine entrance and cave set), the Provisioner as a working shop. Hearthmoss and Route 1 have not been enlarged yet; that means splitting them into two areas and re-seating every Chapter One scene.
4. Money, shops and a healing station.
5. More of the 279 moves in `MV`, and more working traits (currently: Overgrowth, Kindling, Undercurrent, Hard Claws, Sharp Eyes, Static Fur, Accelerate, Opening Gambit, Molting, Gatherer).
6. Trust, Oathbonds and organization Standing (designed, not built).
7. More music. `SONGS` in `src/battle_game.js` holds the synthesized themes (`town`, `route`, `battle`); `Battle.playMusic(name)` plays one. Add a theme per new area. Recorded tracks may replace these later.
8. Engineering: split the big single-line functions into readable modules, move map layout and scene scripts into data files, add automated playthrough tests.

## Known shortcuts

- No interiors yet; the starter scene happens at a table outside the lab, and in Cindervale the Rest Lodge attendant and the Archive curator work outside their buildings.
- Cindervale's Gym, Provisioner and mine road are closed in the story (Dara is on shift, a stocktake, a foreman at a rope fence). There is no money or shop yet.
- Route 2 and Cindervale reuse the `route` and `town` music.
- The pack's 16×16 ground atlas, UI nine-slices, type labels and painted battle scenes are in `assets/` but not used.
- Ember types cannot be burned and Volt types cannot be paralyzed; no other statuses exist yet.
- Much of `battle_core.js` and `ow_core.js` is dense, minified-style code carried over from prototypes. Refactor freely, but check desktop and a 390×844 phone viewport after any change.
