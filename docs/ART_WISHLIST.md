# Art wish list

What development needs from the art pipeline next, in priority order. Written 24 November 2026 after the first Route 2 and Cindervale build. Paste a section to ChatGPT as a brief. The contract for every item is `docs/ART_PIPELINE.md`: flat even lighting, no baked shadows or glow, bottom-centre pivot, front-on billboard view, transparent background, native pixel size.

## 1. Blocks story progress

| Asset | Why | Suggested size |
| --- | --- | --- |
| ~~Mine entrance~~ **Delivered in Batch 2 and placed.** Still needed to open the mines: cave floor and wall art for the inside | The entrance stands behind the rope fence; there is nowhere to walk into yet | to be agreed |
| Cave set for the mines: floor and wall pieces, support beams, lamp, ore seam, cart, rubble | The mines are the dungeon before Gym 1 | to be agreed; the engine paints floors, so standing pieces matter most |
| Interiors: Rest Lodge counter, Provisioner counter and shelves, Gym arena dressing | The attendant and curator currently work outside their buildings | objects only; hold walls and floors until the interior system is designed |

## 2. Generic decoration pack (`props_common_*`), usable in any outdoor area

Route 2 is a hundred tiles long and built from five trees, six plants, two rocks and one boulder. A shared pack fixes that everywhere at once.

1. **Wild plants** (32×24 cells): flower clumps in four colours, fern, mushroom cluster, reeds or cattails for pond edges, berry bush, thistle, tall wildflower stalks, clover patch.
2. **Woodland** (64×64 cells): tree stump, fallen log, mossy log, sapling, dead bare tree, woodpile, hollow log, bird nest on a post.
3. **More trees** (64×80 cells): two autumn-tinted trees, a birch, a fruit tree with apples, a tall dark pine, a scrubby dry tree for rocky ground.
4. **Farm and roadside** (64×64 cells): hay bale, scarecrow, wheelbarrow, vegetable crop row, beehive, laundry line, milk churns, handcart, picnic blanket, campfire (unlit and lit as two cells), small tent, milestone, wayside shrine.
5. **Rock and mining country** (64×64 and 96×96 cells): rock spire, flat slab, slag heap, scree pile, stone wall segment with end and corner, low cliff face segment that tiles sideways.
6. **Water edge** (32×24 cells): lily pads, stepping stone, small jetty segment, and a moored rowboat (64×64).

## 3. People

- Dara Flint is merged (walk, battle, portrait) and waiting for the Gym.
- Wanted: a miner or two, a Hollow Order pamphleteer in ordinary clothes, a League official. The 24 generic townsfolk are now all in use, several of them twice.

## Not needed

Ground tiles (the engine paints the ground), painted battle backdrops, anything with lighting baked in.
