# Wildbound — development handoff

Written 24 November 2026 for Claude Code, which takes over development from here. Nothing is left half-done: the art is merged, the build is current and the checks pass. Everything before this point was built in a claude.ai chat session; this file carries what that session knew that is not obvious from the code.

**Reading order:** `CLAUDE.md` (rules and layout, short) → this file (state, history, decisions, gotchas) → `docs/ART_PIPELINE.md` (the art contract) → `docs/KITH_ROSTER.md` (creature plan).

---

## 1. The project in one page

Wildbound is an original creature-collecting RPG in the classic Pokémon mold, presented in an HD-2D style: pixel sprites in a lit world with depth blur, parallax and particles. Creatures are called **Kith**. The region is the **Calder Reach**. The target is a full-length game: eight gyms, an Elite Four, a strong rival, seven organizations, 180 Kith, about 50 hours of main story.

What exists today is **Chapter One**: a playable prologue from the player's front door in Hearthmoss Village to the end of Route 1, with a complete battle system underneath it.

| | |
| --- | --- |
| Owner and director | Derek Suggs. Final say on every design, every art approval and every merge. |
| Art | ChatGPT, as lead asset artist. Publishes approved art on the `art-production` branch. |
| Development | Claude: mechanics, story, data, engine, integration. Claude Code from now on. |
| Repository | https://github.com/Integrity-Cabinets/wildbound (public) |
| Play it | https://integrity-cabinets.github.io/wildbound/dist/index.html (GitHub Pages, serves `main`) |
| Stack | Plain JavaScript, HTML canvas, Web Audio. No framework, no dependencies, no server. Python 3 + Pillow for the build. |

### How Derek works

- He directs and reviews; he does not write the code. Explain results in plain language, not in terms of functions and files.
- He values directness over validation. Say what is wrong or risky. Do not flatter.
- He wants a first pass done and shown, then he approves or redirects. He keeps final approval.
- He often reads and plays on his phone. Keep summaries short and test phone layouts.
- He dislikes "ship it messy". Report what was verified and what was not; never present untested work as done.
- He relays messages between Claude and ChatGPT by hand. When something needs ChatGPT to act, give him a block he can paste.

---

## 2. Current state

### Playable now

1. Title screen, new game or continue, choose Rowan or Ivy.
2. June (mom) greets you outside your house on your sixteenth birthday.
3. Walk to Professor Wren's table outside the lab. Choose Foxfern, Kindlit or Ottide.
4. Cole (rival) takes the starter that beats yours and battles you immediately. The story continues whether you win or lose.
5. Wren gives you 5 Tether Orbs, 3 Mending Salves and the Survey (the dex), then heads to Route 1.
6. Show June your Kith; she heals your team whenever you talk to her.
7. Marcus (dad) phones from the Foundry as you head north.
8. Route 1: wild encounters, two trainers, catching, levelling, evolution.
9. Wren places the first Wildvein sensor at the grey grass patch and gives you a second sensor for Cindervale.
10. The north exit shows an "End of Chapter One" card. The save carries on.

### Verified and not verified

| | Status |
| --- | --- |
| Every scene above | Driven by script (Playwright) on a 1280×720 desktop viewport and a 390×844 phone viewport, with no page errors. Scenes were jumped to, not played in one sitting. |
| A full human playthrough | **Not done by the developer.** Derek has played some of it on his phone. Pacing and difficulty are untuned. |
| The iPhone zoom bug | Fixed. Derek confirmed on his phone (24 November). |
| Music and sound | Working. Derek confirmed he hears it. He has not asked for changes to how it sounds. |
| GitHub Action (`Asset check and build`) | Confirmed running. It passed on `main` and on the art pull request. |
| Art from `art-production` | Merged into `main` on 24 November with Derek's approval. **Not yet wired into the game** (section 8). |

---

## 3. Where everything lives

### In this repository

See the table in `CLAUDE.md` for the file map. Additional notes:

- `dist/index.html` is committed on purpose: GitHub Pages serves it. Rebuild and commit it with every change to `src/`.
- `index.html` at the repo root only forwards to `dist/index.html`. `.nojekyll` stops GitHub from processing the site.
- `src/data.json` is generated and committed (about 680 KB, mostly art as data URIs). The build is deterministic: the same inputs give byte-identical output.
- `docs/ART_PACK_HANDOFF.md` and the two `HD2D_*.md` files were written by ChatGPT for an earlier ZIP-based workflow. They are background reading; where they disagree with `docs/ART_PIPELINE.md`, the pipeline doc wins.
- `docs/world_asset_index.json`, `docs/sprite_layouts.json`, `docs/npc_roster.json` are ChatGPT's indexes for the Hearthmoss atlases, sprite sheets and the 24 generic NPCs.
- `docs/camera_calibration.json` records the real camera, written for the artist.

### Outside this repository

These are claude.ai artifacts that belong to Derek. Claude Code may not be able to open them; ask Derek to export one to Markdown if you need its full text (see section 12).

| Document | What it holds | Link |
| --- | --- | --- |
| Story & World Bible | Timeline, organizations, rival arc, act structure, endings, scope targets | https://claude.ai/artifact/H374DrNi7HeMvTbgqU8f1m |
| Combat & Creature Systems | The full rules design: stats, natures, traits, statuses, weather, Trust, Resonance | https://claude.ai/artifact/U3yqPUEoiuwZLprL3EGBVT |
| Character & Asset Bible | The art brief for every character, plus the production roadmap | https://claude.ai/artifact/H7J6mFAtSsoUcTfsCqehLm |
| Kith Roster (sheet) | The 23 Kith, learnsets, encounters, trainer teams, Wave 2 tab | https://claude.ai/artifact/3uT3GrxUM5hxychTDfcoeX |
| Move Database (sheet) | All 279 moves | https://claude.ai/artifact/1ALArNfCbzj5cS3QMgrF1p |
| Chapter One (playable artifact) | A copy of the game published from the chat | https://claude.ai/artifact/DRT2QMDECk52e14KVd7ARo |
| Battle Showcase / Overworld Prototype | The two prototypes the engine grew from | historical |

The two sheets are views of data that is already in `data/`. **The repo is the source of truth for game data**; the sheets will drift unless someone updates them.

The Chapter One artifact was republished from the chat after each change. Claude Code cannot update it, so it will go stale. **The GitHub Pages link is the canonical build from now on.** Saves do not carry between the two links, because each site has its own browser storage.

---

## 4. Build, run and test

```
python3 build.py                  # src/ -> dist/index.html
python3 build.py --data           # also rebuild src/data.json from assets/ and data/  (pip install pillow)
node --check dist/game.check.js   # syntax check; build.py writes this file, it is git-ignored
python3 tools/check_assets.py     # validate assets/ and the manifest
```

`build.py` pastes six files into `src/shell.html` at comment markers (`/*UI*/`, `/*BATTLE_CORE*/`, `/*BATTLE_GAME*/`, `/*OW_CORE*/`, `/*GAME*/`, `/*DATA*/`). There is no bundler and no module system; order matters and everything shares one `<script>`.

### Scripted testing

`tests/drive.py` opens `dist/index.html` in headless Chromium and reads commands from standard input:

```
python3 tests/drive.py <name> <width> <height> <mobile 0|1> < script.txt
```

| Command | Effect |
| --- | --- |
| `js <code>` | Evaluate in the page and print the result |
| `shot <tag>` | Screenshot to `tests/shots/<name>_<tag>.png` |
| `wait <ms>` | Pause |
| `key <k>`, `keys <k> <n> <gap>`, `hold <k> <ms>` | Keyboard |
| `click <selector>` | Click |
| `until <ms> <js predicate>` | Poll every 100 ms until true or timeout |

It was written for one machine. It launches Chromium by Playwright's default, so run `playwright install chromium` first.

Debug hooks on `window.WB`: `G` (save state), `player`, `follower`, `npcs`, `warp(actor, x, y, dir)`, `busy()`, `getT(x, y)`, `pressA()`, `dlg` (current dialog text or null), `scripting`, `setTod('am'|'pm'|'night')`, `wild()` (start a wild battle), `evos()` (run evolution checks), `menu()`. In battle: `Battle.dbg()` returns the live battle object (`me`, `foe`, `party`, `bag`), and `Battle.music()` reports the song playing.

A typical script: start a game, skip the intro, set up state directly, then test one thing.

```
click #tNew
wait 500
click #chL button:nth-child(1)
wait 2600
until 30000 (WB.pressA(),!WB.scripting&&!WB.dlg)
js (()=>{const G=WB.G;G.party=[Battle.newKith('foxfern',5)];G.flags.starter=1;G.flags.intro=1;WB.npcs[4].hidden=true;WB.warp(WB.player,36,31,1);return 1})()
wait 300
js WB.wild();1
wait 3600
until 15000 !document.getElementById('b_app').classList.contains('busy')
shot battle
```

Testing pitfalls that cost time before:

- `WB.pressA()` has a 120 ms debounce. A `key z` sent right after an `until` loop that calls `pressA()` is swallowed. Add `wait 300` first.
- `pressA()` advances dialog but does nothing in a menu. Menus (`UI.choose`) need `key z`, `key x` or a click on `#chL button`.
- When a Kith with four moves learns a fifth, a chooser opens and blocks everything until answered. Scripts that level a Kith must handle it.
- `WB.npcs[4]` is Cole. Hide him when faking a post-starter state, or he stands in the lab area.
- Long playthroughs exceed two-minute command timeouts. Split tests.

Always check both a desktop viewport and 390×844 with `mobile 1` after a change to layout or input.

---

## 5. Architecture

One HTML page. Two independent scopes plus a small shared UI module:

```
DATA            constant: species, natures, traits, type chart, images (data URIs)
UI              chooser overlay, fades, evolution scene, phone zoom guards
Battle (IIFE)   battle_core.js + battle_game.js. Own canvas, own DOM (ids prefixed b_), audio, music
(IIFE)          ow_core.js + game.js. Overworld engine and the game
```

The game scope calls `Battle.start(options)` and awaits the result. The main loop in `game.js` draws either the battle (`Battle.frame`) or the overworld each frame, never both.

### `src/battle_core.js` (presentation)

Carried over from the battle showcase prototype. Dense, single-line style.

- Canvas setup, `resize()`, `anchor(side)` (where each Kith stands; left half for the player, right half for the foe on wide screens).
- A clock (`clk`, `tscale`), `tween()`, timers, `wait(ms)`.
- Particles (`P`, `burst`, `pixels`), rings, lights, damage text, camera shake and flash.
- `ARENAS`: procedural layered arenas `glade`, `cinder`, `shore`, built by `buildArena(name)` into parallax layers with depth blur.
- `MV`: the move table. **70 moves** have entries. Each has type `t`, category `c` (`P`/`S`/`X`), power `p`, accuracy `a`, `pp`, priority `pr`, an animation kind `k`, stat effects `st`, a Resonance description `res` and Resonance riders (`rs`, `rc`, `rp`), plus `brn`/`par` chances, `rec` recoil, `dr` drain, `heal`, `multi`, `inflict`.
- `ANIM`: the animation kinds, 17 at last count (`dash`, `punch`, `bite`, `slash`, `shot`, `drain`, `wheel`, `flare`, `slam`, `spike`, `lance`, `wave`, `squall`, `lunar`, `buff`, `debuff`, `heal`). Check the object itself for the current list. A move picks one with `k`. Colours come from `PAL[type]`.
- `S`: synthesized sound effects. `TS[type]` adds a type-specific impact for Volt, Gale, Swarm, Metal and Shade.
- `frame(now)`: draws one battle frame.

### `src/battle_game.js` (rules)

- **Kith instances:** `newKith(species, level, opts)`, `calcStats`, `xpAt`, `addXp`, `movesAt`, `evoTarget`, `evolve`, `healKith`.
- **Engine state:** `B`, the current battle: `kind` (`wild`/`trainer`), `party`, `foes`, `me`, `foe`, `bag`, `dex`, `skill`, `resOn`, `resMe`, `resFoe`, `part` (who earns XP).
- **Flow:** `start` → `sendOut` both sides → `menu()` → player picks → `act(action)` → `useMove` for each side in priority and speed order → `settle()` handles faints, XP, forced switches, win and loss → end-of-turn effects → `menu()`. `finish(result)` closes the battle and resolves the promise.
- **`calc`:** damage. **`aiPick`:** AI move choice, with a `skill` value from 0 to 1 (below 1, that fraction of turns is a random move).
- **`throwOrb`:** the catch. **`award`:** XP, Conditioning, level-ups, `teach` for new moves.
- **Music** at the bottom of the file: `SONGS`, `musicPlay(name)`, `musicStop()`.

`Battle` exports: `start`, `newKith`, `healKith`, `calcStats`, `evoTarget`, `evolve`, `xpAt`, `NAT`, `MV`, `TC`, `ITEMS`, `moveSub`, `gsym`, `isOpen`, `frame`, `load`, `sfx`, `setSound`, `playMusic`, `stopMusic`, `music`, `dbg`.

### `src/ow_core.js` (overworld engine)

Carried over from the overworld prototype. Also dense.

- Seeded random (`mulberry`), pixel buffer helpers (`Buf`), procedural placeholder sprite generators (`charFrames`, and tree/house generators that are no longer used for the world).
- `buildWorld()`: fills the 60×80 tile grid, places houses, lamps, fountain, signs, props, fence, trees, bushes, rocks and tall grass. Uses `res()` to reserve tiles and `block()` to make them solid.
- `paintGround()`: paints the whole ground as one image: noise-shaded grass, curved dirt paths from a distance field, the cobble plaza, the pond, flowers and the grey patch.
- `project()` and `render(now)`: the camera. The ground is drawn scanline by scanline as a tilted plane; everything standing is a billboard sorted by distance. Lighting, night emissive pass, light pools, particles.
- `TIMES`: three times of day, `am`, `pm`, `night`, each a colour grade and particle set.

### `src/game.js` (the game)

Readable, one concern per section, in this order: image loading, save state, input, dialog, props, encounters and battles, NPCs and story scenes, interaction, menus, world logic (`arrive`, `update`, `loop`), title and boot.

Key functions: `talk`/`tell`/`note` (dialog), `cutscene(fn)`, `walk(actor, dirs)`, `runBattle`, `wildBattle`, `afterBattle`, `checkEvos`, `whiteout`, `buildNpcs`, `starterScene`, `sensorScene`, `dadCall`, `trainerBattle`, `interact`, `openMenu`, `arrive`, `begin`, `boot`.

### `src/ui.js`

`UI.choose({title, html, opts, cancel})` returns a promise of the chosen index, or -1 for Back. Every menu in the game is built from it: party, bag, Survey, move replacement, the starter cards, the title's character select. Options can carry `icon` (a Kith icon sheet), `pic`, `ico`, `sub`, `hp` and `dis`. Keyboard: arrows or W/S, Z/Enter/Space to select, X/Escape for Back. Also `UI.fade(on)`, `UI.evolve(from, to, name)` and the phone zoom guards.

---

## 6. Chapter One as built

### The map

One 60×80 grid of 16-px tiles holds both the village (south) and Route 1 (north). Rows with `ty < 47` are Route 1; the rest is Hearthmoss. Coordinates are `(tx, ty)`.

| Thing | Where |
| --- | --- |
| Player start | (18, 58), outside the player's house |
| Player's house door | (18, 57). Mailbox at (21, 58) |
| June | (17, 60) |
| Wren's lab door | (41, 57) |
| Starter table | tiles (44–46, 60). Orbs: Foxfern 44, Kindlit 45, Ottide 46. Stand at `ty` 61 facing up |
| Wren before the starter | (45, 59), behind the table |
| Cole before the starter | (48, 61) |
| Fountain, plaza | around (30, 62) |
| Maribel (villager) | (15, 65) |
| Elder Pike (villager) | (38, 62) |
| Gate to Route 1 | gap in the trees around `tx` 27–33, `ty` 46–48 |
| Scout Theo (trainer) | (33, 32), facing right across the path |
| Wanderer Mira (trainer) | (29, 15), facing left across the path |
| Grey grass patch | centred near (22.4, 18.6) |
| Wren on Route 1 | (24, 19). Sensor at (23, 18) |
| North exit | `ty <= 5` |

World generation is seeded. Reserving or placing anything new shifts where trees and rocks scatter, so re-check key scenes after changing `buildWorld()`.

### Story flags (`G.flags`)

| Flag | Set when | Gates |
| --- | --- | --- |
| `begun` | The opening scene with June has played | Opening plays once |
| `intro` | Wren's introduction at the table | Orbs become choosable |
| `starter` | A starter is chosen | Tall grass access, Cole and orbs removed, Wren moves to Route 1 |
| `cole1` | `'win'` or `'lose'` | Recorded only; not read yet. Future Cole dialog should use it |
| `juneMet` | June has seen your Kith | Dad's call |
| `dad` | Marcus has phoned | Call plays once |
| `sensor` | Wren placed the sensor | North exit, sensor prop, Wren's healing dialog |
| `t_theo`, `t_mira` | That trainer is beaten | Rematch off, after-battle lines |
| `firstCatch`, `twNote` | One-time tips | |
| `done` | The end card was shown | |
| `resonance` | **Never set yet** | Unlocks Resonance in battle |

Position triggers live in `arrive()`: the no-Kith gate at `ty <= 49`, the north exit at `ty <= 5`, trainer line of sight (four tiles, straight ahead), the sensor scene when you pass Wren at `tx` 25–27, `ty` 17–21, Dad's call at `tx` 25–35, `ty` 50–55, and wild encounters on tall grass.

### Encounters and trainers

Wild encounters: 14% per step in tall grass, never within three steps of the last one. Morning uses the day table; evening and night use the dusk table. Levels 2–4.

| Kith | Day | Dusk |
| --- | ---: | ---: |
| Peeplet | 35% | 25% |
| Burrowbit | 30% | 35% |
| Silkling | 20% | 30% |
| Sparkit | 15% | 10% |

| Trainer | Team | AI skill | Reward |
| --- | --- | ---: | --- |
| Cole (battle 1) | The starter that beats yours, level 5, knowing only Shove and Disarming Look | 0.55 | none |
| Scout Theo | Burrowbit 3, Peeplet 3 | 0.6 | 1 Mending Salve |
| Wanderer Mira | Silkling 4, Sparkit 4 | 0.75 | 2 Tether Orbs |

Cole's cut-down move list is deliberate. With his type advantage and a full move set the first fight was close to unwinnable. Theo and Mira, their dialog, and the two villagers' lines were invented in the chat session; Derek has not objected, but he has not explicitly approved them either.

### Items and saving

Items: Tether Orb (`orb`), Mending Salve (`salve`, heals 20 HP), Clearfruit (`clear`, cures burn or paralysis). Mending Salve and Clearfruit are placeholder names invented during the build. There is no money and no shop.

A caught Kith joins the party, or goes to `G.box` when the party has six. Nothing can retrieve a boxed Kith yet.

Losing every Kith fades to black, heals the team and returns you to June. There is no penalty.

The save is one JSON blob in `localStorage` under `wildbound_ch1_v1`, written after battles and key scenes and from the menu. If the save shape changes in a way old saves cannot survive, bump the key or write a migration; Derek and his playtesters have saves.

---

## 7. Game systems: built and designed

The complete rules design is in the Combat & Creature Systems document and in `data/src/`. The table shows how much of it the game runs today.

| System | In the game | Notes |
| --- | --- | --- |
| Stats | Yes | HP = `floor((2·base + Potential + floor(Conditioning/4)) · L / 100) + L + 10`. Others: same core `+ 5`, then nature ×1.1 or ×0.9 |
| Natures | Yes | 25, from `data/natures.json` |
| Potential | Yes | 0–31 per stat, rolled at creation. Shown to the player as a word (Decent, Good, Great, Outstanding) |
| Conditioning | Yes | Gained from defeated Kith by `cond_yield`. 252 per stat, 510 total |
| Levels and XP | Yes | Three growth curves. XP = `base_xp · foe level / 7`, ×1.5 for trainer battles, split among participants still standing |
| Evolution | Yes | By level after a battle. Silkling's depends on gender. Item evolutions (Sparkit's Volt Shard) are not built |
| Damage | Yes | `floor(floor((2L/5 + 2) · power · Atk/Def) / 50) + 2`, then crit ×1.5, random 0.85–1, same-type ×1.5, type chart, burn halves physical |
| Type chart | Yes | 16 types, `data/chart.json` |
| Critical hits, stat stages, priority | Yes | Stages run −6 to +6. There is no accuracy or evasion stage |
| Catching | Yes | Generation-4-style formula with three shakes. Burn or paralysis ×1.5 |
| Statuses | Two | Burn and paralysis. Ember types cannot be burned; Volt types cannot be paralyzed |
| Traits | 10 of 95 | Overgrowth, Kindling, Undercurrent, Hard Claws, Sharp Eyes, Static Fur, Accelerate, Opening Gambit, Molting, Gatherer. Every other trait shows its description and does nothing. Latent (hidden) traits are never assigned |
| Moves | 70 of 279 | A Kith only learns moves present in `MV`; learnsets are filtered at run time, so some learnset entries are silently skipped |
| Resonance | Built, locked | Once per battle: ×1.2 power and a per-move bonus. Hidden until `G.flags.resonance` is set |
| AI | Basic | Scores moves by expected damage, heals when low, values priority for a knockout |
| Music | Three themes | `town`, `route`, `battle` (the trainer version is faster and two semitones up). Synthesized |
| Trust (0–255) | **No** | Designed |
| Oathbonds, Oathbond Initiative | **No** | Designed |
| Organization Standing | **No** | Designed |
| Weather, terrain, hazards, screens | **No** | Designed, data in `data/field.json` |
| Held items | **No** | Data in `data/items.json` |
| Other statuses, confusion, sleep | **No** | Designed |
| Double battles | **No** | The story calls for some |
| Money, shops, healing stations, storage access | **No** | |
| Interiors | **No** | Required; see the backlog |

Battle HP is not doubled. The showcase prototype doubled HP to lengthen level-50 fights; the game removed that because low-level fights already take four or five hits.

---

## 8. Art

### What is where

- **On `main`:** 256 files. All 23 Kith with full sprite sets, Rowan, Ivy, Cole (three outfits), Wren, June, 24 generic NPCs, the Hearthmoss world set, UI pieces, battle backdrops, and the batch below.
- **Merged 24 November, not yet used by the game:** 26 files from ChatGPT's first pull request. Characters: `corvin`, `dara`, `isla`, `kragg`, `tobias`, `vesper` (walk, battle, portrait), `marcus` (walk, portrait), `grunt_m` and `grunt_f` (walk, battle). Badges: `badge_slate.png`, `badge_tidemark.png` (32×32). The merge changed no game output: `src/data.json` and `dist/index.html` rebuilt byte-identical.
- **`art-production` is level with `main`.** Future art arrives as new pull requests from that branch. Derek approves each merge.
- The review images in `art/` total about 17 MB. That is over the "keep each under 2 MB" guideline in spirit; watch repository growth and raise it with Derek if art review sheets keep arriving at that size.

### What the game uses

Wired in by `tools/build_data.py`: every Kith's front, back, follower and icon; flying idles for Peeplark, Skyrook, Lumoth and Threadwraith; walk and run sheets for the players; walk sheets and portraits for Cole, Wren and June; Cole's battle sprite; four generic NPCs (`teen_m`, `traveler_f`, `resident_f`, `elder_m`); the four Hearthmoss buildings; trees, plants, tall grass, small and large props, fences; the title background and logo; the Tether Orb and potion item icons.

In `assets/` but **not used**, by Derek's choice of style: the 16×16 ground atlas, the UI nine-slice frames, HP and XP bar art, type icons and labels, the pixel battle backgrounds and platforms, the eight painted `hd2d` battle scenes. Also unused so far: the players' battle `back` sheets and portraits beyond the title screen, Cole's other outfits, door open/closed sheets, 20 of the 24 generic NPCs.

### Style decisions that are settled

- **Derek prefers the engine's own look.** When shown ChatGPT's tiles and painted battle scenes next to the engine's painted ground and layered arenas, he asked for the pack art to be "molded into" the existing style. So: the engine paints the ground and builds the arenas; pack art supplies objects and characters.
- **Colour grading happens at build time**, in `grade()` in `tools/build_data.py`: foliage greens are pulled toward hue 118 with more saturation and brightness; other colours get a small lift; dark outlines are left alone. Source files are never altered.
- **Night windows** are derived automatically: `glass()` finds window-glass pixels in a building and builds a warm emissive mask plus light positions.
- **Scale:** people and buildings are drawn at 0.68 of native size, trees at about 1.0. See `docs/camera_calibration.json`.
- **Never mirror.** The engine used to flip sprites; it does not any more. The player's Kith shows its `back` sprite.

### Wiring in new art (the integration step)

1. Add the file to `tools/build_data.py` (follow the pattern for `C[...]`, `W[...]` or `U[...]`).
2. `python3 build.py --data`.
3. Load it in `game.js` (`loadChars`, `loadWorld`) and use it.
4. Check `src/data.json` size. Everything is inlined; the page is about 840 KB now. If it passes a few megabytes, move to loading images as separate files, which GitHub Pages can serve. The single-file requirement came from publishing as a claude.ai artifact, and matters less now that Pages is the canonical build. Confirm with Derek before dropping it.

---

## 9. Known issues

| Issue | Detail |
| --- | --- |
| Music | Cannot be heard by the developer, only by Derek. Each theme is a short block in `SONGS`; describe changes to him in words and let him judge |
| Boxed Kith | Caught Kith beyond six go to `G.box` and cannot be reached |
| `cole1` unused | Win or lose is recorded but nothing reads it later |
| Rival plate text | Long Kith names can crowd the level label on narrow phones |
| Learnset gaps | Moves not in `MV` are skipped without notice |
| Inert traits | 85 traits display but do nothing |
| No interiors | The starter scene is outdoors at a table; June heals in the garden |
| Dense engine files | `battle_core.js` and `ow_core.js` are hard to read and have no tests |
| Stale sheets and artifact | The roster and move sheets and the Chapter One artifact will not follow the repo |
| `tests/drive.py` | Machine-specific in places; treat as a starting point |
| Audio before first tap | Browsers block sound until the first touch or key; music starts then |

---

## 10. Decisions already made

Derek's instructions, in the order they came. Treat these as settled unless he reopens them.

1. **Scope and feel:** close to classic Pokémon in scale and mechanics, all-original designs, badges and an Elite Four, "the whole shooting match".
2. **Look:** HD-2D pixel style, as in recent Square Enix games.
3. **Tone:** "more mature" means adult writing, not darkness. No war. Society is not broken or corrupt. Things in the world can be fine, some even great. Trust between trainer and Kith matters. The rival must be very strong. Organizations must be vast and meaningful.
4. **Combat:** deep, in the Pokémon mold: levels, natures, traits that affect stats, and a large move list with real depth. He asked for most of the design effort to go here.
5. **Battle presentation:** he was very impressed by the battle showcase. He wants an animation for nearly every attack, and impact sounds by type. On PC the two Kith stand centred in the left and right halves.
6. **HD-2D confirmed.** A note from ChatGPT saying "gameplay is 2D" was a mistake; it meant 2D sprites rather than 3D models.
7. **Threadwraith:** a Swarm/Shade ninja, the male evolution of Silkling. Lumoth is the female evolution. He picked the name and the type.
8. **Male and female** exist for Kith. Ratios are in the roster.
9. **Cragmaw** evolves at level 30, not 24.
10. **Interiors are required** eventually.
11. **Resonance arrives later**, through a story event that introduces it. It must not be available in Chapter One.
12. **Style:** keep the engine's look; adapt ChatGPT's assets to it (section 8).
13. **Music:** battle music and calm 16-bit-style area music, built into the game for now. Variety grows with the game.
14. **Dad's call** happens after you have shown June your Kith and are heading toward Route 1. It used to fire right after the Cole battle, which made his line about a photo impossible.
15. **GitHub is the source of truth.** ZIP packs are retired. ChatGPT works on `art-production` and opens pull requests.
16. **Development moves to Claude Code** from this point.

---

## 11. Open questions for Derek

Ask before building on any of these.

1. **Where Resonance is introduced.** Proposed: the second Cole battle on Route 3, where your Kith is about to lose and syncs with you for the first time, which gives Cole a reason to chase it. The alternative was the Old Grove with the Greenwardens, alongside the Oathbond, which is much later. No answer yet.
2. **Wave 2 Kith.** Twelve new Kith (#24–#35) were designed in the chat and given to Derek for ChatGPT; the same document is now `docs/KITH_ROSTER.md`. Derek has not confirmed the names or designs.
3. **Playtester feedback.** He wants his friend and his brother to play and send feedback from inside the game, reviewable by him. The proposal: a Feedback item in the menu with a short form (type, note, name) that also attaches context (location, team, device, build), posting to a Google Form that fills a Google Sheet. It needs him to create the form and send its pre-filled link. He said to revisit this as the assets build out. Any text field must use a 16 px font or iOS zooms the page.
4. **Recorded music.** Whether to keep synthesized music or bring in recorded tracks for a fuller sound. He can hear the current music and has not asked for a change.
5. **The single-file build.** Whether it still matters now that GitHub Pages hosts the game.
6. **The repository lives in his company's GitHub organization and is public.** He chose both. All unreleased art and design is publicly visible.
7. **Invented content** awaiting an explicit yes: Theo and Mira, Mending Salve and Clearfruit, all Chapter One dialog.
8. **When the Oath trials happen**, which sets when the Vowling is first seen.

---

## 12. Design canon digest

A summary for orientation. The Story & World Bible is authoritative; ask Derek to export it to Markdown into `docs/design/` if you need the full text, and do the same for the Combat & Creature Systems document.

### The world

The **Wildvein** is the living energy that runs under the Calder Reach and makes it so alive. **Tether Orbs** let a trainer bond with a Kith; an orb "only opens the door" and the trust has to be earned. An **Oathbond** is a bond a Kith chooses freely, with no orb: rare, needs high Trust, can be refused, and the Greenwardens have practised it for centuries.

Grey patches are appearing where the Wildvein is thinning, and the Reach's institutions disagree about why. The League Council will vote on a Wildvein policy within the year. The player turns 16 at the start and becomes an Archive Field Assistant.

**The truth, which the player uncovers:** Calderon, the titan under the northern volcano, is waking on its natural 300-year cycle and pulling the Wildvein toward itself. Heavy orb use adds a small extra draw, so Corvin Ash's data is not wrong, only incomplete. Vance-Calder's Heart Orb would tether the titan and make things worse. The Hollow Order's Unbinding would shock it fully awake. The answer is to calm Calderon through an Oathbond, which needs every faction's help. Nobody is simply the villain.

History in brief: the First Oath (legend says the Vowling chose to walk beside a human freely); the Sundering (Calderon stirred, eruptions buried old Duskmoor, and the moor has been thick with Shade types since); Vance-Calder Works became the Reach's largest employer; Corvin Ash and Elias Wren co-founded the Archive's Wildvein research program before falling out.

### The seven organizations

| Organization | What it is | Its position on the thinning | Headquarters |
| --- | --- | --- | --- |
| The Calder League | Governs trainers, gyms, rankings and Rest Lodges | "Study it, then vote." Cautious and divided | League Hall, Summit |
| Vance-Calder Works | The Reach's largest company: orbs, tech, sponsorships | Calderon is the cause; the Heart Orb will regulate it | Vance Spire, Lumen City |
| The Calder Archive | Independent research institute; runs the creature survey | "We don't know yet. Measure everything." | Archive Hall, Hearthmoss, with field stations in every town |
| The Hollow Order | An activist movement that became something more | Orbs are the cause; the Great Unbinding must free every creature | The Hollow Spire, Duskmoor ruins |
| The Greenwardens | Forest stewards who keep the Oathbond tradition | The land is out of balance; listen to it | The Old Grove, deep Bramblewood |
| The Tidewright Guild | Shipping, fishing and ferry guild of the southern coast | Whatever keeps the sea lanes open | Guildhouse, Marrowind Port |
| The Undercard | Unsanctioned battle circuit with no level caps | Doesn't care, but hears everything | Rotating venues; the Pit under Cindervale |

The player earns **Standing** with each. In the finale, every organization where the player has Standing 3 or higher joins in.

### The journey

| Stop | Place | Gym | Leader | Badge |
| ---: | --- | --- | --- | --- |
| 0 | Hearthmoss Village: start, Wren's lab | | | |
| 1 | Cindervale City: mining town | Stone | Dara Flint | Slate |
| 2 | Marrowind Port: fishing harbour | Tide | Captain Isla Marlowe | Tidemark |
| 3 | Bramblewood: village in giant trees | Bloom | Juniper Vale | Thorn |
| 4 | Lumen City: neon tech city | Volt | Nico Ampere | Spark |
| 5 | Highcrest: cliffside town of wind towers | Gale | Aeryn Skye | Plume |
| 6 | Frostfall: snowbound mountain village | Frost | Old Hagen | Rime |
| 7 | Duskmoor: foggy moor with old ruins | Shade | Mirela Vos | Veil |
| 8 | Ironspire: fortress city of foundries | Metal | Gideon Kade | Bastion |
| 9 | Summit Hall: Elite Four and Champion, at the volcano's rim | | See below | |

Elite Four, in order: Nyx Calloway (Venom), Brutus Oduya (Brawl), Seraphine Lark (Mind), Ardent Kael (Wyrm). Champion: Liora Vance. Each fights the player for real and each has a stake in the Council vote. In the story's last stretch Cole becomes Champion and is the final battle.

Postgame: the Severed Isles (Vesper's splinter cell; Marivane, the sea Primal) and the Deepwood beyond Bramblewood (Hollowroot; the deepest greying).

### People

- **Rowan / Ivy:** the player, 16.
- **Cole Hartley:** the rival. Strong, likeable, always a step ahead. He has three outfits in the art (start, Vanguard, Champion), which track his arc. His epilogue always closes the game: the two of you on Route 1, where it started, arguing about who would win a rematch.
- **Professor Elias Wren:** director of the Calder Archive, the player's mentor. Co-founded the Wildvein program with Corvin Ash.
- **June:** the player's mom, in Hearthmoss.
- **Marcus:** the player's dad, at the Ironspire Foundry, working on "the biggest thing the company's ever built".
- **Tobias Hartley:** Cole's older brother. He left home two years ago to join the Hollow Order and is now its Admin for recruitment. Cole carries that, along with his parents' expectation that he be the one who turns out right. Tobias is glimpsed in an Order hood at Marrowind, tries to recruit Cole at Frostfall, and fights beside Vesper at Duskmoor. Optional "Two Brothers" scenes shape his ending.
- **The Hollow Order:** Magister Corvin Ash (brilliant, wounded by the Archive's rejection) leads three Admins: Vesper (operations, zealous), Kragg (protection, loyal but doubtful; he quietly defects at Duskmoor) and Tobias (recruitment). Ranks are Initiate, Severant, Admin.
- **The Calder League:** High Steward Maren Okafor, Ranger Captain Bryn Adair, Champion Liora Vance.
- **Vance-Calder Works:** CEO Aldric Vance. Sela Moreau coaches the Vanguard, the company's sponsored team of young trainers, which Cole joins. Marcus works at the Foundry division.
- **The Calder Archive:** Wren, and his assistant Pip.
- **The Greenwardens:** Elder Rhosyn, and Juniper Vale (also Gym 3).
- **The Tidewright Guild:** Harbor Master Orrin Tate, and Isla Marlowe (also Gym 2).
- **The Undercard:** the Booker, and Rook.

Cole's nine battles: Hearthmoss; Route 3; Marrowind (a double battle as partners); the Lumen tryout (the story continues if you lose); Highcrest, where his ace refuses him; the Pit; Frostfall (scenes, where he turns Tobias down); Duskmoor (a double battle as partners against Vesper and Tobias, where his ace accepts an Oath before yours does); and Champion Cole at Summit.

### The opening, as written in the bible

1. Wren gives the player and Cole their starters and signs the player on as an Archive Field Assistant: "Complete the survey, and you'll see more of the Reach than I ever did."
2. First battle with Cole.
3. Marcus calls from the Ironspire Foundry: proud, busy, working on "the biggest thing the company's ever built."
4. On Route 1, Wren shows the player a greying patch of grass and places the first Wildvein sensor.

All four are built. After Gym 1, Cole's second battle is on Route 3; his third is a double battle at Marrowind where he partners with the player.

### Kith

180 planned: 151 in the main dex and 29 postgame-only, including the Primals Calderon (Ember/Stone), Marivane (Tide/Mind) and Hollowroot (Bloom/Shade), and the mythical Vowling (Fae). 23 are designed and drawn. 12 more are designed (Wave 2). `docs/KITH_ROSTER.md` has everything, with undecided fields marked.

Sixteen types: Beast, Ember, Tide, Bloom, Volt, Gale, Stone, Frost, Brawl, Venom, Mind, Shade, Metal, Fae, Wyrm, Swarm.

---

## 13. What to do next

### First session

1. Read `CLAUDE.md` and this file. Run the build and open the game.
2. Play Chapter One start to finish in a real browser if you can. It has never had a continuous developer playthrough.
3. Ask Derek about the open questions in section 11 that block what you plan to build.

### Recommended order of work

1. **Stabilise before growing.** Split `ow_core.js` and `battle_core.js` into readable modules with real names. Move the map (houses, props, NPC positions, encounter tables, trainers) and scene scripts out of code into data files, so new areas are data, not edits to `buildWorld()`. Add playthrough tests. Keep behaviour identical and prove it with before-and-after screenshots.
2. **Multiple maps.** The world is one hard-coded grid. Cindervale needs map loading, transitions between maps, and interiors. Design this once, with interiors in mind.
3. **Wire in the merged art**: Dara, Isla, Marcus (his phone call could show his portrait), Tobias, the Order, badges.
4. **Route 2, Cindervale, the mines, Gym 1.** Needs environment art from ChatGPT; ask for it through Derek with a specific list. Encounter tables and Dara's team are already in `data/encounters.json`.
5. **Money, a shop, a healing station, storage access.**
6. **The Resonance event**, once Derek picks where.
7. **Move and trait coverage.** Each new move needs an `MV` entry and an animation kind; most can reuse the existing kinds, which is how Derek's "animation for nearly every attack" gets met at scale.
8. **Trust**, then Oathbonds and Standing, as the story reaches them.
9. **Stats, traits and learnsets for Wave 2** when those Kith enter the game.
10. **More music** per area.

### Working agreements

- Commit `dist/index.html` with every change so the play link stays current. Pages updates a minute or two after a push to `main`.
- Development pushes straight to `main`. Art arrives only by pull request from `art-production`.
- Never alter, recolour or replace a file in `assets/`.
- Check a desktop and a phone viewport after any change to layout, input or rendering.
- Keep every name original. No Pokémon names for Kith, moves, items or places.
- When reporting to Derek: lead with what changed for the player, say plainly what was and was not tested, and keep it short.

---

## 14. Gotchas

- **`cutscene()` does not nest.** It returns at once if a scene is already running. Inside a scene, call other scene functions directly.
- **`$` means different things.** In the `Battle` scope `$('x')` is `#b_x`; in the game scope it is `#x`.
- **`R` differs too.** In `ow_core.js`, `R` is the seeded generator used for world building. Use `Math.random()` for gameplay rolls in `game.js` so they do not disturb world generation.
- **Two things are called `CH`-like.** `CH` in `game.js` is the loaded character sheets. The chord table in the music code is `CHD`.
- **Hidden NPCs** (`n.hidden`) are skipped for drawing and collision but still exist in `npcs`, and their array order is fixed by `buildNpcs()`.
- **Entities marked `dead`** are skipped by the renderer; the table orbs and the sensor use this.
- **Buildings fade out completely** when they come between the camera and the player (`big: 1`). Other near objects only become translucent.
- **Dialog portraits** come from `PORT[who]` for `cole`, `wren`, `june`. A line can start with `{happy}`, `{serious}` or `{surprised}` to pick the expression; the tag is stripped.
- **Follower sprites** load on demand per species (`followFrames`).
- **Idle animation** swaps `m.sp` between two frames every 250 ms in `frameAnim`. Both frames are cropped to their shared bounds at build time so the sprite does not jitter.
- **Threadwraith's files** are `mon_23_*`. The build accepts `mon_threadwraith_*` too.
- **Level-up with multiple levels at once** narrates each level; the plate shows the level being narrated.
- **Opening Gambit** triggers once per Kith per battle, tracked by a temporary `_og` flag that is deleted when the battle ends, so it is never saved.
- **The battle arena** is rebuilt only when its name changes or the size changes. Time of day in battle is a colour multiply (`tint`), not a different arena.
- **`build.py` asserts each marker appears exactly once.** Do not put a marker string in a source file.
- **Gender data:** `fem` is the percentage female, `null` for genderless. Cobblit and Cragmaw are genderless; Lumoth is female-only; Threadwraith is male-only.

---

## 15. Glossary

| Term | Meaning |
| --- | --- |
| Kith | The creatures |
| Tether Orb | The capture item |
| The Survey | The dex |
| Wildvein | The energy under the Reach |
| Oathbond | A bond a Kith chooses freely, without an orb |
| Trust | 0–255 bond value per Kith (designed, not built) |
| Resonance | Once-per-battle power-up (built, locked) |
| Potential | Per-stat innate value, 0–31 |
| Conditioning | Per-stat trained value, earned in battle |
| Trait | Passive ability |
| Standing | Reputation with an organization (designed, not built) |
| Primals | Calderon, Marivane, Hollowroot |
