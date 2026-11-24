# Wildbound art pipeline

How artwork gets from the artist into the game. This repository is the single source of truth for approved art; cumulative ZIP packs are retired.

## Roles

| Who | Owns |
| --- | --- |
| Derek | Final approval of every design and every merge. |
| ChatGPT (lead asset artist) | Producing artwork and publishing approved art on the `art-production` branch. |
| Claude (game development) | Mechanics, story, data, engine, and wiring art into the game. Does not redesign or replace approved art. |

## The workflow

1. **Approve first.** Derek approves a design in the art conversation. Only approved art goes on the branch.
2. **Branch.** Commit to `art-production`, started from the latest `main`. Never commit to `main` directly.
3. **Stay in your lane.** An art pull request changes files under `assets/` and `art/` only. It never touches `src/`, `data/`, `tools/`, `dist/`, `docs/` or `CLAUDE.md`.
4. **Check.** Run `python3 tools/check_assets.py --write` (needs Pillow). It validates every file and regenerates `assets/manifest.json`. Commit the manifest with the art. If you cannot run it, leave the manifest alone; the automatic check still validates the files and the integrator regenerates the manifest.
5. **Open a pull request** into `main` using the checklist at the end of this file.
6. **Automatic check.** GitHub runs the validator and rebuilds the game to prove nothing broke.
7. **Merge.** Derek merges. Merged means approved.
8. **Integration.** Claude wires the new art into the game in a separate change. After merging, bring `art-production` back up to date with `main` before the next batch.

### Why merging art cannot break the game

The game only loads the files that `tools/build_data.py` names, and it reads them from the generated `src/data.json`, not from `assets/` at run time. A new file in `assets/` is inert until it is wired in. The only way art can change the running game is by altering a file that is already in use, which is why changing approved files is blocked by default (see Revisions).

## Directory structure

```
assets/
  creatures/     Kith sprites
  characters/    people: players, cast, generic NPCs, trainer classes
  props/         buildings, doors, and prop atlases
  tiles/         ground and tall-grass atlases
  ui/            type icons and labels, item icons, badges, UI frames, title art
  battle/        pixel battle backgrounds and platforms
  battle/hd2d/   high-resolution painted battle scenes (the one non-pixel folder)
  manifest.json  generated index of every file (do not edit by hand)
art/             concept lineups and review sheets (not shipped in the game)
```

Use only these folders. If something needs a new folder, ask first so the validator can be taught about it.

**Not in the repository:** the 8× masters (`@8x`) and raw generator output. Masters are an exact nearest-neighbour enlargement of the native file, so they can always be regenerated. Keep them in the art workspace.

## Naming

- Lowercase letters, digits and single underscores, ending in `.png`. No spaces, capitals, hyphens or `@`.
- One file per sheet. Do not also commit individual frames.
- Names are permanent once merged. The game refers to art by file name.

| Folder | Pattern | Example |
| --- | --- | --- |
| `creatures/` | `mon_<id>_<view>.png` | `mon_skimlet_front.png` |
| `characters/` | `char_<id>[_<outfit>]_<view>.png` | `char_cole_vanguard_walk.png` |
| `characters/` (generic) | `char_npc_<role>_<m or f>_walk.png` | `char_npc_farmer_f_walk.png` |
| `props/` | `bld_<name>.png`, `prop_<name>.png`, `props_<area>_<group>.png` | `bld_wren_lab.png` |
| `tiles/` | `tiles_<area>_<group>.png` | `tiles_hearthmoss_ground.png` |
| `ui/` | `icon_type_<type>.png`, `label_type_<type>.png`, `item_<name>.png`, `badge_<name>.png`, `ui_<name>.png` | `badge_slate.png` |
| `battle/` | `bg_<arena>.png`, `plat_<arena>.png` | `bg_meadow.png` |
| `battle/hd2d/` | `arena_<arena>.png`, `foreground_<arena>.png` | `arena_shore.png` |

**Kith IDs** are the species name in lowercase with no spaces or punctuation, exactly as in the Kith roster (`skimlet`, `bramboar`). The one exception is Threadwraith, which was delivered as `mon_23_*`; both `mon_23_*` and `mon_threadwraith_*` are accepted, and it may be renamed in a revision pull request.

**Character IDs** are the first name in lowercase (`dara`, `isla`, `marcus`). Add an outfit word before the view only when a character has more than one outfit.

## Sprite specifications

All pixel art: native resolution, binary alpha (each pixel fully opaque or fully transparent), flat and evenly lit with simple form shading, no baked cast shadows, glow, blur or environmental lighting. The engine adds lighting, shadows, bloom, depth of field and particles. Bottom-centre pivot. Never mirror a sprite to make the other side.

### Kith (`creatures/`)

| View | Sheet | Frame | Layout | Needed for |
| --- | --- | --- | --- | --- |
| `front` | 96×96 | 96×96 | one frame | every Kith |
| `back` | 96×96 | 96×96 | one frame | every Kith |
| `follow` | 64×128 | 32×32 | 2 columns (step A, step B) × 4 rows (down, up, left, right) | every Kith |
| `icon` | 64×32 | 32×32 | rest, bounce | every Kith |
| `idle` | 192×96 | 96×96 | static pose, opposite wing or streamer extreme | flying Kith |
| `back_idle` | 192×96 | 96×96 | same, from behind | flying Kith |

The first frame of an idle is exactly the `front` (or `back`) artwork. `idle` and `back_idle` always come as a pair.

**Story Kith** (Calderon, Marivane, Hollowroot, Vowling) use 128×128 for `front` and `back` and 256×128 for idles. They need `front`, `back` and `icon`; a follower is optional.

### People (`characters/`)

| View | Sheet | Frame | Layout |
| --- | --- | --- | --- |
| `walk`, `run` | 96×192 | 32×48 | 3 columns (stand, step A, step B) × 4 rows (down, up, left, right) |
| `portrait` | 384×96 | 96×96 | neutral, happy, determined, surprised |
| `battle` | 96×128 | 96×128 | one frame, facing the player |
| `back` | 384×96 | 96×96 | ready, wind-up, release, follow-through (player characters only) |

Draw each direction; do not flip left to make right. Keep the foot registration consistent across frames, and do not trim or recentre cells.

### Everything else

| Art | Size |
| --- | --- |
| Type icon | 24×24 |
| Type label | 32×14 |
| Item icon | 24×24 |
| Badge | as approved; state the size in the pull request |
| Pixel battle background / platform | 240×160 / 128×32 |
| Painted battle scene (`battle/hd2d/`) | 1280×720, full colour, soft alpha allowed |
| Buildings, doors, single props, UI frames, title art | as designed; recorded in the manifest |

**Atlases** (`props_*`, `tiles_*`): every new atlas needs a sidecar next to it, `<same name>.layout.json`, so the game knows what each cell is:

```json
{
  "cell": [64, 64],
  "cells": [
    {"id": "market_stall", "col": 0, "row": 0, "bounds": [6, 10, 52, 54], "collision": [8, 48, 48, 16]},
    {"id": "crate_stack",  "col": 1, "row": 0}
  ]
}
```

`cell` is the cell size and must divide the sheet evenly. `bounds` (occupied pixels) and `collision` (base footprint) are optional `[x, y, width, height]` in cell pixels. Buildings state their door rectangle in the pull request description. The seven Hearthmoss atlases already in the repo are indexed in `docs/world_asset_index.json` instead.

Files must be under 2 MB each.

## The manifest

`assets/manifest.json` lists every art file with its path, kind, id, view, size, frame size and SHA-256. It is generated by `tools/check_assets.py --write`; never edit it by hand. It exists so that anyone can see exactly what art is in the repo and detect an accidental change to an approved file.

Approval is not a field in the manifest. A file on `main` is approved; a file that is not yet approved is not on `main`.

## Revisions to approved art

Changing, renaming or deleting a file that is already on `main` fails the automatic check. When Derek has agreed to a revision:

1. Say so in the pull request title, starting with `REVISION:`.
2. Add the `art-revision` label to the pull request, which lets the check pass.
3. Keep the same file name, size and frame layout, so the game keeps working with no code change.

## Concept art and review sheets

Put concept lineups and review sheets in `art/`, grouped by batch (`art/wave_02/lineup.png`). They are for humans and are not loaded by the game. Keep each under 2 MB.

## What the artist needs from the game side

- **The Kith roster** (names, types, families, visual briefs) lives in the Wildbound project as `Wildbound_Kith_Roster.md` and on the roster sheet. Do not invent Kith that are not in it.
- **The camera** is recorded in `docs/camera_calibration.json`. Only a building's front face is ever visible, so no roof, side or rear surfaces are needed.
- **Style:** the game keeps its own painted ground, lighting and layered battle arenas. Pack art supplies the objects and characters and is colour-matched at build time. This is Derek's stated preference.

## Pull request checklist

Copy this into the description of every art pull request.

```
Batch:
Approved by Derek on:

- [ ] Only files under assets/ and art/ changed
- [ ] File names follow docs/ART_PIPELINE.md
- [ ] Native resolution, binary alpha, flat even lighting, nothing mirrored
- [ ] Every new Kith has front, back, follow and icon (plus idle and back_idle if it flies)
- [ ] New atlases have a .layout.json sidecar
- [ ] No approved file changed, or this is a REVISION with the art-revision label
- [ ] Ran python3 tools/check_assets.py --write (or noted that it was not run)

Notes for integration (badge sizes, door rectangles, anything one-sided that must not be mirrored):
```
