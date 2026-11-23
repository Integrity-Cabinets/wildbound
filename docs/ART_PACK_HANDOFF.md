# Wildbound — current asset handoff

## Current direction and approval

The user requested a closer match to the supplied HD-2D battle showcase.
Read `HD2D_BATTLE_SHOWCASE_DIRECTION.md` and `battle_presentation_profile.json` first.

222 current pixel-native PNGs + 222 exact 8× masters; 8 separate HD scene images.
161 approved pixel assets; 61 pending pixel assets; 8 pending HD scene assets.

The earlier 161 approved assets retain approval. New/revised batch-3 work
remains pending review. Original NPC eyes remain selected.

The source bible is preserved; this revision adds a narrow battle-presentation
profile alongside its established pixel-asset contracts. The user reference
is a visual target, not proof of a renderer or canonical combat numbers.

## Current authorities

Root `asset_manifest.json`, `approval_register.json`, `battle_presentation_profile.json`,
`presentation_asset_index.json`, `ui_asset_index.json`, `battle_asset_index.json`,
`sprite_layouts.json`, inventory/progress v15 and file map v10 are current.
Earlier producer metadata is historical unless selected by a current index.

## Pixel UI and Kith

Use native pixel files with nearest-neighbor sampling and their documented
frame rectangles. Keep exact 8× masters for review. The charcoal/gold UI
uses the revised current paths; prior light panels are unselected history.
Keep Kith and UI sharp. Render readable text separately in screen space;
review font choices do not establish the game's final localization system.

Dialog, menu and name-tag panels use 8-pixel nine-slice corners. HP/XP frames
use horizontal 8-pixel end caps on unchanged 64×24 canvases. Their visible
tracks occupy [0,8,64,8], with 8 transparent rows above and below; fills are
6 pixels high. Tile or extend horizontally and keep canvas height fixed.
Read `horizontal_slice` and gauge insets rather than the old nine-slice rule.

All type/item/Orb/title files are unchanged. Their prior dimensions, palettes
and state orders still apply. All Kith, human and NPC art is unchanged.

## New HD battle scenery

`assets/battle/hd2d/` contains 8 separate 1280×720 scene images. Load them
through `presentation_asset_index.json` and preserve their color/foreground alpha. Do not
reduce them to 16 colors or expect an 8× companion. They are high-resolution
presentation layers; the pixel sprite rules still apply to the other assets.

The current profile reuses Sylvarix's approved back sprite and Skyrook's
approved front sprite, with a broad stage and compact corner UI. The old
240×160 backgrounds and 128×32 platforms are retained byte-exact under the
compatibility profile. They are not the default for the revised showcase.

Portable layout, theme and source-composition records are under
`metadata/phase_two/batch_03/showcase_revision_01/presentation/`; composed review PNGs are under
`review/phase_two_batch_03_showcase_revision/`. Reconstruct original producer
paths with the reproduction path map before rerunning any tool.

The reference's levels, HP, move names/PP and Resonance wording are example
copy only. Canonical roster and battle mechanics remain governed by project
data. No engine repository, functional battle logic, game import or calibrated
3D camera has been supplied or tested. Camera projection, pitch and scale
remain unset. The 1280×720 size is a review artboard, not an engine mandate.

## Active HD-2D environment direction

Read [HD2D_ENVIRONMENT_ART_DIRECTION.md](HD2D_ENVIRONMENT_ART_DIRECTION.md) and [HD2D_ENVIRONMENT_CHECKLIST.json](HD2D_ENVIRONMENT_CHECKLIST.json) before further environment production. The user explicitly reaffirmed HD-2D as a production constraint. The flat village study is a source-art and placement review, not the finished visual target.

Ground source textures stay top-down and are displayed on a tilted ground texture or scene plane; upright art remains front-on billboards. The engine supplies lighting, cast shadows, bloom, depth of field, parallax and particles. Extra roof, side, rear or depth pieces are conditional on the surfaces exposed by the actual camera. No camera angle, projection or world scale has been established, and no scene, material or lighting system is claimed complete.

The checklist calls for a small calibrated Hearthmoss scene in the actual renderer before commissioning camera-dependent extensions. This dependency does not reorder the existing UI or character queue. The guide changes no image bytes, replaces no source-bible text, and grants no art approval.

## Approved generic NPCs

The package retains 24 approved reusable designs, each with a twelve-frame walk sheet.
This is a project-specific population foundation, not an industry-standard
NPC count. It does not complete the separately queued named NPCs or trainer
classes, and these generic designs do not include battle sprites or portraits.

| Group | Designs | Native sheets | Pose slots |
| --- | --- | ---: | ---: |
| Residents | Resident, parent, elder, teen, child and student; M/F designs | 12 | 144 |
| Specialists | Farmer, shop assistant, lodge attendant, crafter, traveler and office worker; M/F designs | 12 | 144 |

Each sheet is 96×192, with 32×48 cells. Rows are down, up, left and right;
columns are stand, step A and step B. Use the full cell rectangles and the
provided foot registration. Do not independently trim or recenter frames,
and do not generate one side by mirroring the other. The roster links each
generic ID to its canonical walk file, concept and production records.

## Hearthmoss and Route 1 world assets

There are 15 approved world atlases or sheets containing 99 indexed elements or
states. `world_asset_index.json` supplies actual cell rectangles, occupied
bounds, canonical pivots, building door rectangles and terrain edge rules.
It preserves the distinction between proposed placement data and engine code.

| Asset family | Native layout | Authored cells or states |
| --- | --- | ---: |
| Ground | 256×256 atlas, 16×16 cells | 50 |
| Tall grass | 60×36 sheet, 20×18 cells; three columns × two rows | 6 |
| Trees | 320×80 strip, five 64×80 cells | 5 |
| Plants | 192×24 strip, six 32×24 cells | 6 |
| Small props | 256×128 atlas, 64×64 cells | 8 |
| Large props | 256×64 strip, 64×64 cells | 4 |
| Fences and gate pieces | 256×32 strip, 32×32 cells | 8 |
| Buildings | Four individual images; exact sizes in manifest | 4 |
| Doors | Four closed/open state pairs; exact sizes in manifest | 8 |

The ground atlas has four grass variants, flower grass, dirt fill, four
cobble fills, pond-water variants, deep water and sand. Dirt, cobble and
pond-shore families each have four straight edges, four outer corners and
four inner corners. Only 50 cells are authored; the other 206 are transparent.
Do not interpret the full 256-cell grid as a complete tile inventory.

Use opposing terrain edge-profile labels that match. One-pixel border
registration copies strips from generated material/edge tiles and preserves
the reduced 14×14 interiors. Provenance records identify the donors and
changed pixels. Mechanical checks cover 700 compatible pairs and 792 joins
in the patch layout. The visual result has closed borders, with small angular
corner shoulders and visible repeating motifs. Mix the supplied fill variants
and inspect actual maps at gameplay scale. Direct dirt-to-cobble transitions
and pond-to-deep-water depth blends are not supplied. Deep water repeats with
itself; sand shares the soil edge profile rather than adding a beach family.

Tall grass has three variants with rest/rustle rows. Standing foliage includes
three round trees, two pines, three bushes, two flowerbeds and an intact
cuttable shrub. Other props include signs, mailbox, lamp, rocks, crate, barrel,
bench, boulder, well, fountain and ledge. The four buildings are the player
house, Wren lab and two generic Hearthmoss houses.

For a front-facing fence run, place the left end at `(0, 0)`, then `n` straight
spans at `(32 × (k + 1), 0)` for `k = 0..n-1`, and the right end at
`(32 × (n + 1), 0)`. All pieces share the occupied-row baseline `y = 31`.
Straight-to-straight boundary columns match exactly. End pieces connect,
with a one-pixel upper-rail jog; the lower rails match exactly. Keep the
common y origin rather than shifting an end to align only one rail.
Corner and gate pieces require overlap and scene review using their visible
posts; they are not automatic 32 px adjacency junctions. The world index
records measured rail spans and connection points. Do not mirror modules.

The ledge occupies 60 px of its 64 px cell, with two transparent pixels at
each side. Treat it as a discrete placed billboard prop, not an automatically
continuous ledge strip. The same scene-review requirement applies to its
collision and depth placement.

All world geometric pivots use frame-local **pixel-edge** coordinates:
`[frame_width / 2, frame_height]` is bottom center. The final occupied row is
the separate pixel index `frame_height - 1`. Architecture export reports
retain their original occupied-row indices as provenance; no art is translated
when recording the canonical pivot. Ground source tiles are top-down for the tilted scene plane; standing objects
remain front-on billboards. Base collision rectangles and walkability are proposals.
Canopies and other visual overhang should not automatically block a sprite's
full rectangle.

Each building's door sheet provides closed and open states. The closed frame
exactly matches the recorded building crop, and the open frame preserves the
area outside the door-opening region. Use the explicit building rectangle for
the overlay; a generic centered placement would be wrong for offset doors.
Door timing, transitions, occlusion and entry behavior need engine work.

## HD-2D presentation and common slicing

HD-2D remains in scope. The earlier 2D clarification referred to pixel sprites
instead of 3D character models. Engine lighting, shadows, bloom, depth of field,
parallax and particles remain part of the presentation. The sprites themselves
use flat, even form shading without baked cast shadows, glow, blur or soft
environmental lighting. Render native pixels with nearest-neighbor sampling
and binary alpha. Never mirror supplied artwork.

| Preserved asset | Native sheet | Cell | Layout |
| --- | --- | --- | --- |
| Kith front/back | 96×96 | 96×96 | One frame |
| Kith follower | 64×128 | 32×32 | Two columns × four direction rows |
| Kith menu icon | 64×32 | 32×32 | Rest, bounce |
| Kith idle/back_idle | 192×96 | 96×96 | Static pose, opposite motion extreme |
| Human walk/run | 96×192 | 32×48 | Three columns × four direction rows |
| Human battle front | 96×128 | 96×128 | One frame |
| Player battle back | 384×96 | 96×96 | Ready, wind-up, release, follow-through |
| Human portrait | 384×96 | 96×96 | Neutral, happy, determined, surprised |

Full source rectangles follow `x = column × frameWidth` and
`y = row × frameHeight`. Direction rows are down, up, left and right.
The creature `mback` slot maps to `_back.png`, one 96×96 frame; the player
`back` file is a separate four-frame sheet. Flying idle first frames exactly
reuse the final static artwork, with the opposite wing/streamer extreme in
the second cell. Recommended idle playback is approximately 4 fps per v2.3;
other animation timings require in-engine review.

## Preserved Kith and character decisions

All 23 Kith records and their prior assets are unchanged in batch 2.
Threadwraith is species 23, semantic ID `threadwraith`, type Swarm/Shade,
with filename ID `23`: `mon_23_front`, `back`, `follow`, `icon`, `idle` and
`back_idle`. The original 22 retain semantic filename IDs. The roster records
each `asset_file_id`; no duplicate alias PNGs exist.

Female Silkling evolves to Lumoth at level 10; male Silkling evolves to
Threadwraith at level 10. Lumoth is female-only, Threadwraith is male-only,
and Cobblit/Cragmaw are genderless. Cobblit evolves to Cragmaw at level 30
instead of 24. The shared Silkling family key remains `lumoth`. Unspecified
gender ratios remain `null` with `source_pending` because the linked external
roster could not be retrieved. Do not replace missing data with universal
50/50 ratios or invent missing stats, moves or habitats. These are recorded
data directives, not a claim that an external game database was patched.

Rowan and Ivy are 16; their accepted proportions, clothing and equipment
are preserved. Cole's three outfits, Wren and June remain complete in their
previously delivered scope. Skyrook uses the speed study and Thumpwarren
the athletic design with stone forearm bracers. Burrowbit/Thumpwarren keep
the floppy ear on anatomical left, and Barnacub/Barnaclaw keep the enlarged
claw on anatomical right. Older player and creature runtime art remains
reference-only.

## Preservation, reproduction and verification

All 1,306 v8 file payloads and all 640 prior PNG payloads are retained.
Only current pending UI components have been revised. Their older bytes
remain under `reference/unselected_phase_two_batch_03_light_ui/`; changed metadata is under `metadata/history/phase_two_batch_03_showcase_revision_previous_delivery/`.
All unrelated character/Kith/NPC/world/type/item/title PNGs, the source bible,
roster, first-22 compatibility files and original HD-2D guide/checklist retain
their original bytes.

Pixel checks cover dimensions, binary alpha, palette limits, fixed corners
and exact 8× masters. HD checks cover dimensions, file integrity and layer
roles. Preservation, approval consistency, source/export hashes, unique ZIP
members, CRC and archive-to-stage equality are checked. These are asset and
presentation checks, not engine integration or gameplay tests.

## Next queue

Review the presentation revision, then Dara Flint and Captain Isla Marlowe
with their badges, Marcus and Tobias. The later cast, named NPCs and fourteen
trainer classes remain queued. No automatic eye-polish reapplication.
