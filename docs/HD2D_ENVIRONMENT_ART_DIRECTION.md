# Wildbound — HD-2D environment direction

**Current production constraint, reaffirmed by the user on November 23, 2026.**

> “The one thing you HAVE to take into consideration is that this is going to be HD-2D graphics. Try and take that into consideration as we build out the environment assets.”

Wildbound's finished environments should read as **crisp pixel-art characters and objects arranged in a lit diorama with visible depth, atmospheric separation and clear gameplay space**. The environment kit must support that composition from the start. The flat village asset study is a source-art and placement review; it does not define the finished camera, lighting or world presentation.

## Source authority and rendering contract

This guide implements the user's emphasis without replacing the Character & Asset Bible v2.3. Its “Phase 1 review and Phase 2 queue”, “Art direction and sprite specs”, and “Environment, tiles and UI” sections remain authoritative. They specify:

- Ground tiles authored from straight above and displayed as a tilted ground texture.
- Buildings, trees, props and characters supplied as front-on pixel-art billboards.
- Flat, even source-art lighting with simple form shading; engine lighting, shadows, bloom, depth of field, parallax and particles supply the scene treatment.
- Native pixel art, nearest-neighbor sampling, binary alpha, documented palettes and frame sizes, and no mirrored views.

Use that established contract for current imports. Additional roof, side, rear or depth surfaces are **camera-dependent extensions**. Produce them where the actual scene exposes those surfaces; do not assume a new isometric view or repaint every building before checking the camera. No camera angle, lens, world-unit scale or renderer configuration is established by the flat review study.

## Environment assets and their intended role

| Family | Current source art | HD-2D use and next production consideration |
| --- | --- | --- |
| Ground and paths | Top-down 16×16 material and transition cells | Assemble on the scene's ground plane. Preserve tile seams and pixel scale after camera projection. Introduce elevation through scene structure and the additional bank/edge art that structure needs. |
| Buildings | Four front-facing building PNGs and four closed/open door pairs | Establish convincing scale and placement in the diorama. Test entry points and occlusion. Split front trim, roof/canopy overhang or other foreground portions where depth sorting requires it. Add side/roof surfaces only when visible from the selected camera. |
| Trees and tall vegetation | Five tree silhouettes, bushes, flowers and grass states | Use deliberate foreground, playable-area and background layers. Add trunk/canopy or front/rear canopy splits where a character needs to pass behind one part and in front of another. Keep component pivots coordinated. |
| Rocks, furniture and fences | Reusable billboard props and fence/gate pieces | Give each object a stable ground contact, believable height and explicit collision footprint. Resolve overlaps and fence joins in the scene. The current corner/gate pieces and ledge are placed props, not complete continuous terrain systems. |
| Water | Static pond and water material cells | Keep the source base clean. Develop motion, reflections, highlights and depth treatment in the engine's material/effect workflow. Additional surface overlays or masks are planned work if that workflow requires them. |
| Distance and atmosphere | No completed scenery-layer or atmosphere system in this delivery | Develop foreground framing, middle-distance landmarks and distant terrain for each area. Use depth and controlled atmosphere to separate them while preserving the navigable route. |

The current world kit contains useful source art. It does **not** establish completed depth geometry, layered building assemblies, canopy splits, collision meshes, lighting materials, normal maps, reflection systems or a finished map.

## Rules for future environment generation

1. **Specify the asset's scene role before drawing it.** Every prompt must identify ground surface, upright billboard, foreground occluder, background layer, or a camera-approved structural surface. State native size, orientation, palette, contact point and intended neighboring pieces.
2. **Keep perspective consistent.** Ground source textures stay top-down. Standing art follows the approved front-on contract. A request for a building side or roof plane must include the camera and the relevant existing building reference so geometry and texture scale agree.
3. **Design useful layers.** Where an object crosses the character's depth, supply the needed components with a common registration reference. Avoid making the entire canopy or roof one unavoidable foreground obstruction. A full composite can accompany the separated pieces as an assembly reference.
4. **Keep source lighting neutral.** Paint readable material and form shading, with two or three tones per material as directed by the bible. Leave cast shadows, environmental light, glow, bloom, haze and depth blur to the renderer. A lamp pane or lit-window shape may provide a clean emissive-region reference; an actual emission mask is a separate deliverable when needed.
5. **Judge scale in context.** Compare doors, path widths, fence heights, furniture, trees and buildings against the same standing NPC and Kith. Native PNG dimensions alone do not define world size. Check ground contact and overhang from the actual camera.
6. **Protect gameplay readability.** Keep the player, nearby NPC faces, interactions, collision boundaries and the traversable route readable. Depth of field and atmospheric effects should support depth without obscuring decisions or sprite features.
7. **Preserve import discipline.** Document source rectangles, shared component anchors, drawing order expectations and the distinction between visual overhang and base collision. Test tile padding/extrusion and sampling in the actual renderer to prevent atlas bleed and pixel shimmer. These engine settings are not assumed complete by an art export.

## First HD-2D environment proof

Before expanding camera-dependent world art, build a small **Hearthmoss scene slice in the actual game renderer**. Use one house with its door states, a short path, one tree, a fence/prop group, a standing and walking NPC, a Kith and a pond edge. It should answer five practical questions:

- Does the chosen camera give the intended diorama depth while preserving crisp sprites and consistent material scale?
- Do feet, door thresholds, tree roots and prop bases meet the ground convincingly?
- Can a character walk around and behind objects with correct depth order, roof/canopy coverage and collision?
- Do the pixel materials remain readable under a neutral daylight setup and a dusk/window-light setup, including cast shadows and restrained bloom?
- Do movement, camera motion and restrained depth of field preserve the focus of play without texture bleed, shimmer or overly distracting detail?

Record the actual projection, pitch, target viewport, world scale, billboard behavior and material decisions from this slice. Leave those fields unset until checked. Use the results to commission any needed side planes, overhang layers, terrain banks, continuous ledges, scenery layers or effect masks. This is a production dependency for those additional assets; it does not silently reorder the bible's remaining UI and character queue.

## Review and handoff

Future environment reviews should contain both a clean native asset view and a view in the calibrated HD-2D scene. Label generated mood illustrations and flat assembly studies as concepts or studies; identify an engine capture only when it is actually captured from the running renderer.

The original NPC eye artwork is restored following the user's preference; the alternate eye-polish versions remain only as unselected history. This guide records the HD-2D requirement and future asset rules; it does not claim that environment geometry or rendering has been implemented. Current batch-2 assets remain pending user review. The accompanying `HD2D_ENVIRONMENT_CHECKLIST.json` carries the same constraints and uncompleted integration tasks for the development handoff.
