# Wildbound — Kith Roster and Production Plan

Exported 23 November 2026 from the game data (`data/species.json` in the Integrity-Cabinets/wildbound repo). This file is the roster the Character & Asset Bible refers to. Fields marked **UNDECIDED** have not been designed yet; do not invent values for them.

## 1. Counts

| | Count |
| --- | ---: |
| Planned total | **180** (151 in the main dex, 29 postgame-only) |
| Designed, with approved art | 23 (#1–#23) |
| Designed in this document for the next wave (Wave 2) | 12 (#24–#35) |
| Still to design after Wave 2 | 145 (116 main dex, 29 postgame) |

The 29 postgame Kith include the three Primals (Calderon, Marivane, Hollowroot) and the mythical Vowling.

## 2. Types

Sixteen types: Beast, Ember, Tide, Bloom, Volt, Gale, Stone, Frost, Brawl, Venom, Mind, Shade, Metal, Fae, Wyrm, Swarm.

Not yet represented by any designed Kith after Wave 2: **Frost, Venom, Wyrm**. Metal, Fae and Shade exist only as second types.

## 3. Completed roster (#1–#23)

| No. | Asset file ID | Kith | Types | Family | Evolves | Gender | Where it is found |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | `mon_foxfern_*` | Foxfern | Bloom | Foxfern | Vixthorn at level 16 | 50% M / 50% F | Gift from Professor Wren |
| 2 | `mon_vixthorn_*` | Vixthorn | Bloom | Foxfern | Sylvarix at level 34 | 50% M / 50% F | Evolves from Foxfern |
| 3 | `mon_sylvarix_*` | Sylvarix | Bloom/Fae | Foxfern | Final stage | 50% M / 50% F | Evolves from Vixthorn |
| 4 | `mon_kindlit_*` | Kindlit | Ember | Kindlit | Cinderlisk at level 16 | 50% M / 50% F | Gift from Professor Wren |
| 5 | `mon_cinderlisk_*` | Cinderlisk | Ember | Kindlit | Pyrevault at level 36 | 50% M / 50% F | Evolves from Kindlit |
| 6 | `mon_pyrevault_*` | Pyrevault | Ember/Stone | Kindlit | Final stage | 50% M / 50% F | Evolves from Cinderlisk |
| 7 | `mon_ottide_*` | Ottide | Tide | Ottide | Wavecoat at level 16 | 50% M / 50% F | Gift from Professor Wren |
| 8 | `mon_wavecoat_*` | Wavecoat | Tide | Ottide | Torrentide at level 35 | 50% M / 50% F | Evolves from Ottide |
| 9 | `mon_torrentide_*` | Torrentide | Tide/Brawl | Ottide | Final stage | 50% M / 50% F | Evolves from Wavecoat |
| 10 | `mon_sparkit_*` | Sparkit | Volt | Sparkit | Voltail with a Volt Shard | 50% M / 50% F | Route 1 tall grass (morning and day); Lumen outskirts |
| 11 | `mon_voltail_*` | Voltail | Volt | Sparkit | Final stage | 50% M / 50% F | Evolves from Sparkit |
| 12 | `mon_peeplet_*` | Peeplet | Beast/Gale | Peeplet | Peeplark at level 14 | 50% M / 50% F | Routes 1, 2 and 3; very common |
| 13 | `mon_peeplark_*` | Peeplark | Beast/Gale | Peeplet | Skyrook at level 32 | 50% M / 50% F | Route 3 and Highcrest slopes |
| 14 | `mon_skyrook_*` | Skyrook | Beast/Gale | Peeplet | Final stage | 50% M / 50% F | Evolves from Peeplark; Cole's ace |
| 15 | `mon_burrowbit_*` | Burrowbit | Beast | Burrowbit | Thumpwarren at level 20 | 50% M / 50% F | Routes 1 and 2; meadows and field edges |
| 16 | `mon_thumpwarren_*` | Thumpwarren | Beast/Stone | Burrowbit | Final stage | 50% M / 50% F | Evolves from Burrowbit; rocky fields near Cindervale |
| 17 | `mon_silkling_*` | Silkling | Swarm | Silkling | Female: Lumoth at level 10. Male: Threadwraith at level 10 | 50% M / 50% F | Routes 1 and 2 tall grass; Bramblewood edges |
| 18 | `mon_lumoth_*` | Lumoth | Swarm/Fae | Silkling | Final stage | 0% M / 100% F | Evolves from female Silkling; Bramblewood at night |
| 19 | `mon_cobblit_*` | Cobblit | Stone | Cobblit | Cragmaw at level 30 | Genderless | Cindervale mines and rocky routes |
| 20 | `mon_cragmaw_*` | Cragmaw | Stone/Metal | Cobblit | Final stage | Genderless | Evolves from Cobblit; Dara Flint's ace |
| 21 | `mon_barnacub_*` | Barnacub | Tide/Stone | Barnacub | Barnaclaw at level 20 | 50% M / 50% F | Marrowind shoreline and Route 3 tide pools |
| 22 | `mon_barnaclaw_*` | Barnaclaw | Tide/Stone | Barnacub | Final stage | 50% M / 50% F | Evolves from Barnacub; Captain Isla Marlowe's ace |
| 23 | `mon_23_*` | Threadwraith | Swarm/Shade | Silkling | Final stage | 100% M / 0% F | Evolves from male Silkling; rarely seen at the Bramblewood edge after dark |

All 23 have front, back, follower and icon sprites. Peeplark, Skyrook, Lumoth and Threadwraith also have two-frame flying idles.

### Evolution families

| Family | Stages | Conditions |
| --- | --- | --- |
| Foxfern | Foxfern → Vixthorn → Sylvarix | Level 16, level 34 |
| Kindlit | Kindlit → Cinderlisk → Pyrevault | Level 16, level 36 |
| Ottide | Ottide → Wavecoat → Torrentide | Level 16, level 35 |
| Sparkit | Sparkit → Voltail | Use a Volt Shard (item) |
| Peeplet | Peeplet → Peeplark → Skyrook | Level 14, level 32 |
| Burrowbit | Burrowbit → Thumpwarren | Level 20 |
| Silkling | Silkling → Lumoth (female) or Threadwraith (male) | Level 10, decided by gender |
| Cobblit | Cobblit → Cragmaw | Level 30 |
| Barnacub | Barnacub → Barnaclaw | Level 20 |

### Encounter progression through Gym 2

| Area | Method | Kith | Chance | Levels |
| --- | --- | --- | ---: | --- |
| Route 1 | Tall grass, morning/day | Peeplet | 35% | 2–4 |
| Route 1 | Tall grass, morning/day | Burrowbit | 30% | 2–4 |
| Route 1 | Tall grass, morning/day | Silkling | 20% | 2–3 |
| Route 1 | Tall grass, morning/day | Sparkit | 15% | 3–4 |
| Route 1 | Tall grass, evening/night | Burrowbit | 35% | 2–4 |
| Route 1 | Tall grass, evening/night | Silkling | 30% | 2–4 |
| Route 1 | Tall grass, evening/night | Peeplet | 25% | 2–4 |
| Route 1 | Tall grass, evening/night | Sparkit | 10% | 3–4 |
| Route 2 | Tall grass | Burrowbit | 30% | 5–8 |
| Route 2 | Tall grass | Peeplet | 25% | 5–8 |
| Route 2 | Tall grass | Cobblit | 20% | 6–8 |
| Route 2 | Tall grass | Silkling | 15% | 5–7 |
| Route 2 | Tall grass | Sparkit | 10% | 6–8 |
| Cindervale Mines | Cave floor | Cobblit | 60% | 8–12 |
| Cindervale Mines | Cave floor | Burrowbit | 25% | 8–11 |
| Cindervale Mines | Cave floor | Thumpwarren | 15% | 20–22 (rare, after badge 1) |
| Route 3 | Tall grass | Peeplet | 30% | 10–13 |
| Route 3 | Tall grass | Peeplark | 10% | 14–15 |
| Route 3 | Tall grass | Burrowbit | 25% | 10–13 |
| Route 3 | Tall grass | Sparkit | 20% | 11–13 |
| Route 3 | Tall grass | Silkling | 15% | 10–12 |
| Route 3 | Tide pools | Barnacub | 70% | 11–14 |
| Route 3 | Tide pools | Ottide | 5% | 12 (rare) |
| Route 3 | Tide pools | Peeplet | 25% | 10–13 |
| Bramblewood edge | Night only | Silkling | 50% | 12–14 |
| Bramblewood edge | Night only | Lumoth | 25% | 14–16 |
| Bramblewood edge | Night only | Sparkit | 20% | 13–15 |
| Bramblewood edge | Night only | Threadwraith | 5% | 15–16 (rare) |

### Trainer teams through Gym 2

| Battle | Team | Notes |
| --- | --- | --- |
| Cole (battle 1, Hearthmoss) | Starter strong against yours, L5 | No items |
| Cole (battle 2, Route 3) | Peeplet L11; his starter L13 | Calder Fig on the starter |
| Dara Flint (Gym 1) | Burrowbit L11; Cobblit L12; Cobblit L14 (ace) | Ace holds a Growth Ring; uses Shard Field and Sturdy Frame |
| Cole (battle 3, Marrowind double) | Peeplark L16; Sparkit L16; his starter L18 | Partners with the player |
| Isla Marlowe (Gym 2) | Barnacub L17; Peeplark L18; Barnaclaw L20 (ace) | Opens with Rain Call; ace holds Trail Rations |

### Visual briefs for the completed 23

These are approved designs; the briefs are kept for reference and consistency.

- **#1 Foxfern** (Bloom, 0.5 m): Fox kit with one oversized leaf for a tail.
- **#2 Vixthorn** (Bloom, 1.0 m): Lean, long-legged fox wearing a mane of thorned vines.
- **#3 Sylvarix** (Bloom/Fae, 1.7 m): Stag-like fox whose tail has become a small canopy of leaves.
- **#4 Kindlit** (Ember, 0.4 m): Round salamander with a glowing ember on its tail and soft rock plates on its back.
- **#5 Cinderlisk** (Ember, 1.1 m): Long-necked basilisk with glowing cracks between darker back plates.
- **#6 Pyrevault** (Ember/Stone, 2.0 m): Armored lava lizard; its back plates vent flame when it charges.
- **#7 Ottide** (Tide, 0.5 m): Chubby otter pup with a tail like a paddle.
- **#8 Wavecoat** (Tide, 1.2 m): Sleek otter whose fur flows off its back like a cape of water.
- **#9 Torrentide** (Tide/Brawl, 1.9 m): Broad-shouldered sea otter with a mane shaped like a breaking wave.
- **#10 Sparkit** (Volt, 0.4 m): Small, springy jerboa-like Kith in blue (#5078DC) with a pale blue belly (#C8E6FF), long hind legs, huge ears with crackling yellow tips, and a tail shaped like a yellow lightning bolt (#F6CE46). Alert, mischievous expression. Must read clearly differently from Foxfern: rounder body, bigger ears, hopping stance.
- **#11 Voltail** (Volt, 1.3 m): Elegant, long-bodied storm ferret in deep blue (#3E5CC0) with yellow lightning markings (#F6CE46) along its spine; its tail splits into two bolt-shaped prongs that crackle. Narrow eyes, confident stance, mid-stride. Clearly the grown-up Sparkit.
- **#12 Peeplet** (Beast/Gale, 0.3 m): Round, plump chick (#B07C52) with a cream belly (#F6E2BE), orange beak and feet (#F0A032), and a three-feather tuft on its head. Puffed chest, beak open mid-chirp. Keep the prototype's round silhouette.
- **#13 Peeplark** (Beast/Gale, 0.8 m): Lean, fast lark in warm brown (#9A6A44) with a cream chest and a long, swept-back crest; sharp wing edges, focused eyes. Mid-flight or perched in a ready-to-launch pose. The teenage version of Peeplet.
- **#14 Skyrook** (Beast/Gale, 1.6 m): Powerful hawk-like raptor, chestnut brown (#7A4A2E) with a bright white crown of feathers (#F5F2EB) that fans out like a crest, golden eyes, hooked beak. Broad wings, muscular build; reads as a proud, competitive bird. Rival Cole's partner.
- **#15 Burrowbit** (Beast, 0.4 m): Stocky, round rabbit in sandy brown (#B8A48C) with a cream muzzle, big digging claws on its front paws, and one ear permanently flopped over. Dirt on its nose. Friendly, a little dopey.
- **#16 Thumpwarren** (Beast/Stone, 1.0 m): Big, muscular hare in sandy brown with stone-gray foot pads and forearm plating (#A8865A); one ear still flopped like Burrowbit's. Mid-stamp pose with small rocks bouncing. Tough but good-natured.
- **#17 Silkling** (Swarm, 0.3 m): Small, soft caterpillar, cream and pale green (#DDE8B8) with big gentle eyes, wrapped in a wispy silk scarf. Tiny stubby legs. Shy, cozy look.
- **#18 Lumoth** (Swarm/Fae, 1.1 m): Elegant moth with large wings patterned like stained glass in soft violet, teal and gold, with a faint glow along the wing edges; fluffy white collar, feathery antennae. Gentle, luminous. Glow should be suggested by lighter pixels, not blur.
- **#19 Cobblit** (Stone, 0.4 m): Squat, round rock creature in warm stone gray-brown (#A8865A) with an oversized underbite jaw, small tough legs, and a back studded with gravel and a few iron flecks. Determined little face.
- **#20 Cragmaw** (Stone/Metal, 1.2 m): Heavy boulder-bodied creature (#8C7A5C stone with #8C98A8 metal) whose huge lower jaw has turned to riveted iron; metal plates on its shoulders, glowing ore veins. Low, immovable stance. Reads as a mine guardian.
- **#21 Barnacub** (Tide/Stone, 0.4 m): Small hermit-crab-like creature with blue-gray body (#5A86C8) and one oversized claw, living in a round stone shell crusted with barnacles and bits of sea glass. Curious eyes on short stalks.
- **#22 Barnaclaw** (Tide/Stone, 1.3 m): Large armored crab, deep blue (#3E6EA8) with a tall stone shell like a small sea fortress, crusted with barnacles; one claw much larger than the other, scarred and heavy. Sturdy, veteran look.
- **#23 Threadwraith** (Swarm/Shade, 1.0 m): Male-line evolution of Silkling. Slim, upright moth-ninja in charcoal and deep indigo (#2E2A44) with pale cream silk wrappings (#DDE8B8) binding its forearms and face like a mask; Silkling's scarf has become two long trailing streamers. Narrow, swept-back wings folded close like a cloak, sharp silver eyes. Crouched, ready-to-strike stance. Should read as Silkling's sibling to Lumoth: same cream silk, opposite mood (quiet and sharp, not soft and glowing).

## 4. The planned roster by stretch of the game

The per-stretch counts below are **provisional targets**, not designed lists. Only Wave 2 has named Kith.

| Stretch | Areas | New Kith | Running total | Status |
| --- | --- | ---: | ---: | --- |
| Start to Gym 2 | Hearthmoss, Routes 1–3, Cindervale, Marrowind | 23 | 23 | Art approved |
| Gym 3 (Bloom) | Marrowind waters, Route 4, Bramblewood | 12 | 35 | **Wave 2, designed below** |
| Gym 4 (Volt) | Route 5, Lumen City and its power works | 16 | 51 | UNDECIDED |
| Gym 5 (Gale) | Highcrest cliffs and wind plateaus | 16 | 67 | UNDECIDED |
| Gym 6 (Frost) | Mountain pass, Frostfall, ice caves | 18 | 85 | UNDECIDED |
| Gym 7 (Shade) | Duskmoor and the ruins of the old city | 18 | 103 | UNDECIDED |
| Gym 8 (Metal) | Ironspire and the foundries | 18 | 121 | UNDECIDED |
| Summit and rare finds | Volcano approach, Summit Hall, rare and late-game Kith across the Reach | 30 | 151 | UNDECIDED |
| Postgame | Severed Isles, the Deepwood, Primals, Vowling | 29 | 180 | Four named, 25 UNDECIDED |

## 5. Wave 2: the next 12 Kith (#24–#35)

Six complete two-stage families, in the order the player meets them after Gym 2. They add the first pure Brawl and the first Mind Kith, and give Gym 3 its Bloom team.

| No. | Kith | Types | Family | Evolves | Where it is found | Height |
| ---: | --- | --- | --- | --- | --- | ---: |
| 24 | Skimlet | Tide | Skimlet | Galefin at level 26 | Marrowind harbor and Route 4 shallows (fishing and surf); very common | 0.3 m |
| 25 | Galefin | Tide/Gale | Skimlet | Final stage | Evolves from Skimlet; open water off Route 4 on windy days | 1.4 m |
| 26 | Knucklet | Brawl | Knucklet | Brawlger at level 28 | Route 4 hillsides and field edges; common by day | 0.5 m |
| 27 | Brawlger | Brawl | Knucklet | Final stage | Evolves from Knucklet; Route 4 burrows | 1.2 m |
| 28 | Snufflet | Bloom | Snufflet | Bramboar at level 25 | Route 4 and the Bramblewood approach; common in tall grass | 0.5 m |
| 29 | Bramboar | Bloom/Beast | Snufflet | Final stage | Evolves from Snufflet; Bramblewood undergrowth | 1.3 m |
| 30 | Glowmite | Swarm/Ember | Glowmite | Pyrefly at level 22 | Route 4 at dusk and night; the Hearthmoss pond at night (rare) | 0.2 m |
| 31 | Pyrefly | Swarm/Ember | Glowmite | Final stage | Evolves from Glowmite; Bramblewood edge at night | 0.9 m |
| 32 | Sporeling | Bloom | Sporeling | Gloomcap at level 27 | Bramblewood forest floor, shaded areas; common | 0.3 m |
| 33 | Gloomcap | Bloom/Shade | Sporeling | Final stage | Evolves from Sporeling; deep Bramblewood, and the Deepwood in the postgame | 1.1 m |
| 34 | Hootle | Mind/Gale | Hootle | Sagewing at level 30 | Bramblewood canopy, night only; uncommon | 0.4 m |
| 35 | Sagewing | Mind/Gale | Hootle | Final stage | Evolves from Hootle; Bramblewood canopy at night | 1.3 m |

### Wave 2 visual briefs

- **#24 Skimlet** (Tide): Palm-sized flying fish in sea-blue (#3F8FD6) with a silver-white belly (#E6F2F8) and oversized translucent pectoral fins edged in pale yellow (#F4E08A). Big round eyes, upturned mouth. Shown mid-skip above a small splash. Simple, friendly, clearly a first-stage.
- **#25 Galefin** (Tide/Gale): Sleek flying fish the length of a surfboard, deep blue (#2A5FA8) back fading to white, with long wing-like fins striped white and sky blue (#9CC8EE) and a forked tail trailing two ribbon streamers. Glides above the water rather than swimming. Confident, sharp-eyed. Needs the two-frame flying idle (fins sweep).
- **#26 Knucklet** (Brawl): Stocky badger cub standing upright, charcoal (#3A3A44) with a cream stripe (#F0E6CC) from nose to tail and cream wrappings of fur around oversized forepaws like boxing wraps. Scuffed nose, determined scowl, feet planted wide.
- **#27 Brawlger** (Brawl): Broad-shouldered badger in a low fighting crouch, charcoal with the cream stripe now splitting into two bands across the shoulders, heavy forearms with dark red (#C0453A) knuckle fur, short thick claws. Calm, seasoned expression rather than angry.
- **#28 Snufflet** (Bloom): Round piglet-like boar with moss-green (#6FAE5A) bristles along its back, a tan (#D8B88A) body, tiny white tusk nubs and a single clover leaf sprouting behind one ear. Nose to the ground, tail curled. Cute and a little muddy.
- **#29 Bramboar** (Bloom/Beast): Heavy wild boar with a mane of thorned bramble vines (#3F7A3A) and small pink blossoms (#F3A6D8) along its spine, dark brown (#6A4A32) hide, curved ivory tusks wrapped in vine. Head lowered, ready to charge. Must read differently from Sylvarix: low, wide and heavy, not elegant.
- **#30 Glowmite** (Swarm/Ember): Small round firefly larva-beetle in dark brown (#4A3628) with a soft orange glowing abdomen (#FF9A4A), stubby wings and curled antennae. Hovers just off the ground. Needs the two-frame flying idle (wings blur, glow pulses).
- **#31 Pyrefly** (Swarm/Ember): Slender firefly with a black-brown thorax, amber wing cases (#E8A23A) open over clear wings, and a bright flame-shaped lantern tail (#FF6A2A to #FFE08A). Long antennae like sparks. Elegant, not menacing. Needs the two-frame flying idle.
- **#32 Sporeling** (Bloom): Tiny walking mushroom with a cream stalk body (#EFE6D0), stubby feet and a wide moss-green cap (#5E9A58) with pale spots, pulled down like a hat so only two shy eyes show beneath it.
- **#33 Gloomcap** (Bloom/Shade): Tall hooded mushroom figure: a drooping violet-grey cap (#5B4E8C) with faintly glowing teal gills (#6FD6C8) underneath, a pale stalk body wrapped in root tendrils, and two dim lantern eyes in the shadow of the cap. Quiet and watchful, not evil. It should hint at Hollowroot without copying it.
- **#34 Hootle** (Mind/Gale): Fluffy round owlet in warm grey (#B8AE9E) with a cream heart-shaped face, large pink-violet eyes (#EE6FA8) and two tiny ear tufts. Wings too small for its body. Tilts its head. Needs the two-frame flying idle (wing flap).
- **#35 Sagewing** (Mind/Gale): Tall, composed barn-owl Kith in ash grey and cream with a mantle of longer feathers like a scholar's cloak, wing tips marked with pink-violet eye patterns (#EE6FA8), half-lidded knowing eyes. Wings half spread. Needs the two-frame flying idle.

### Wave 2 production notes

- **File IDs:** use the lowercase name, for example `mon_skimlet_front.png`. Threadwraith keeps its numeric ID `23`.
- **Sprite set per Kith:** front 96×96, back 96×96, follower 64×128, icon 64×32, as for the first 23.
- **Flying idles (192×96, front and back):** Galefin, Glowmite, Pyrefly, Hootle and Sagewing.
- **Never mirror.** None of the Wave 2 designs has a one-sided feature, so no left/right rule applies yet.
- **Gym 3 (Juniper Vale, Bloom), provisional team:** Snufflet, Sporeling, Gloomcap, Bramboar (ace). Her team is not final.
- **Gender:** every Wave 2 Kith is 50% male / 50% female with no gender-variant art.

## 6. Story-milestone Kith

| Kith | Types | Role | When the art is needed |
| --- | --- | --- | --- |
| Vowling | Fae | Mythical; appears only to Oathbound trainers. Seen in legend imagery before it is met. | Concept alongside the Bramblewood wave, because the Greenwardens and the Old Grove sit in that part of the game. Full sprites when the Oath trials are built. Exact chapter of the Oath trials: **UNDECIDED**. |
| Calderon | Ember/Stone | The titan under the northern volcano; the finale. | Concept early, since murals and story scenes show it. Full sprites with the Gym 8 and Summit wave. |
| Marivane | Tide/Mind | Sea Primal of the Severed Isles. | Postgame wave. |
| Hollowroot | Bloom/Shade | Forest Primal of the Deepwood. | Postgame wave. Gloomcap (#33) foreshadows it. |

All four use larger 128×128 battle sprites and cannot be caught with an ordinary Tether Orb. Their detailed visual briefs are **UNDECIDED**.

## 7. Undecided fields

- **Wave 2 game data:** base stats, traits, learnsets, catch rates and XP yields for #24–#35. These are not needed for art and will be set before the Kith go into the game.
- **Exact encounter rates and levels** for Route 4 and Bramblewood.
- **Names, types and designs for #36–#180**, apart from the four story Kith named above.
- **Final gym and rival teams from Gym 3 onward.**
- **Volt Shard location** (the item that evolves Sparkit).
- **Which chapter holds the Oath trials**, which sets when the Vowling is first seen.

