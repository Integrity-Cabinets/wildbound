# Wildbound species roster: first 22 Kith (everything met before Gym 2)
S = []
def K(no, name, types, stats, traits, latent, growth, catch, xp, yield_, evo, egg, ht, wt, habitat, concept, dex, learn, art=None):
    S.append(dict(no=no, name=name, types=types, stats=dict(zip(['hp','atk','def','spa','spd','spe'], stats)),
                  traits=traits, latent=latent, growth=growth, catch=catch, base_xp=xp, cond_yield=yield_,
                  evolution=evo, egg_groups=egg, height_m=ht, weight_kg=wt, habitat=habitat,
                  concept=concept, dex=dex, learnset=learn, art=art))

# ---------------- Starters (art approved) ----------------
K(1,'Foxfern',['Bloom'],[45,49,45,60,55,62],['Overgrowth'],'Sapling','Medium-Slow',45,64,'1 Sp. Atk',
  'Vixthorn at level 16','Field, Flora',0.5,7.4,'Gift from Professor Wren',
  'Fox kit with one oversized leaf for a tail.',
  "The leaf on its tail turns toward sunlight even while it sleeps. It sulks visibly when ignored.",
  [(1,'Shove'),(1,'Disarming Look'),(4,'Leaf Flick'),(7,'Sap Drain'),(10,'Quick Pounce'),(13,'Lash Vine'),(17,'Sapling Seed'),(20,'Pollen Haze'),(24,'Leaf Blades'),(28,'Sun Bask'),(32,'Petal Squall'),(36,'Overgrow Field'),(40,'Solar Lance')])
K(2,'Vixthorn',['Bloom'],[60,64,60,80,70,86],['Overgrowth'],'Sapling','Medium-Slow',45,142,'1 Sp. Atk, 1 Speed',
  'Sylvarix at level 34','Field, Flora',1.0,19.0,'Evolves from Foxfern',
  'Lean, long-legged fox wearing a mane of thorned vines.',
  "Hunts at dusk and leaves a ring of thorns around its den. It only lowers that ring for a partner it trusts.",
  [(0,'Grasping Roots'),(1,'Shove'),(1,'Leaf Flick'),(1,'Sap Drain'),(13,'Lash Vine'),(17,'Sapling Seed'),(20,'Pollen Haze'),(25,'Leaf Blades'),(29,'Sun Bask'),(33,'Petal Squall'),(38,'Bramble Bed'),(42,'Overgrow Field'),(46,'Solar Lance')])
K(3,'Sylvarix',['Bloom','Fae'],[76,80,72,108,90,104],['Overgrowth'],'Sapling','Medium-Slow',45,236,'3 Sp. Atk',
  'Final stage','Field, Flora',1.7,48.0,'Evolves from Vixthorn',
  'Stag-like fox whose tail has become a small canopy of leaves.',
  "Groves grow greener wherever it rests for a season. The Greenwardens consider meeting one a good omen.",
  [(0,'Canopy Crown'),(1,'Glimmer'),(1,'Leaf Flick'),(1,'Sap Drain'),(1,'Grasping Roots'),(17,'Sapling Seed'),(20,'Pollen Haze'),(25,'Leaf Blades'),(29,'Sun Bask'),(33,'Petal Squall'),(39,'Lunar Burst'),(44,'Overgrow Field'),(49,'Solar Lance'),(55,'Starbloom')])
K(4,'Kindlit',['Ember'],[50,60,58,52,50,42],['Kindling'],'Insulated','Medium-Slow',45,62,'1 Attack',
  'Cinderlisk at level 16','Monster, Field',0.4,8.5,'Gift from Professor Wren',
  'Round salamander with a glowing ember on its tail and soft rock plates on its back.',
  "The ember on its tail dims when it's sad and flares when it's showing off, which is most of the time.",
  [(1,'Shove'),(1,'Disarming Look'),(4,'Cinder'),(8,'Pebble Toss'),(11,'Searing Bite'),(14,'Firewheel'),(18,'Smolder'),(21,'Granite Fist'),(25,'Ember Heel'),(29,'Fortify'),(33,'Magma Slam'),(37,'Sunfall'),(42,'Flare Charge')])
K(5,'Cinderlisk',['Ember'],[66,82,80,68,64,58],['Kindling'],'Insulated','Medium-Slow',45,142,'2 Attack',
  'Pyrevault at level 36','Monster, Field',1.1,41.0,'Evolves from Kindlit',
  'Long-necked basilisk with glowing cracks between darker back plates.',
  "Basks on the walls of Cindervale's mines. Miners leave it scraps; it keeps the tunnels warm in winter.",
  [(1,'Shove'),(1,'Cinder'),(1,'Pebble Toss'),(1,'Searing Bite'),(14,'Firewheel'),(18,'Smolder'),(22,'Granite Fist'),(26,'Ember Heel'),(30,'Fortify'),(35,'Magma Slam'),(40,'Sunfall'),(45,'Flare Charge')])
K(6,'Pyrevault',['Ember','Stone'],[88,118,110,85,80,49],['Kindling'],'Ashcaller','Medium-Slow',45,240,'3 Attack',
  'Final stage','Monster, Field',2.0,190.0,'Evolves from Cinderlisk',
  'Armored lava lizard; its back plates vent flame when it charges.',
  "Its plates hold heat for days. In old Cindervale, a sleeping Pyrevault was a family's furnace for the winter.",
  [(0,'Vent Eruption'),(1,'Groundswell'),(1,'Cinder'),(1,'Searing Bite'),(1,'Firewheel'),(18,'Smolder'),(22,'Granite Fist'),(26,'Ember Heel'),(30,'Fortify'),(36,'Magma Slam'),(42,'Crag Spike'),(47,'Ashfall'),(52,'Flare Charge'),(58,'Ramming Crag')])
K(7,'Ottide',['Tide'],[52,55,50,48,52,55],['Undercurrent'],'Momentum','Medium-Slow',45,63,'1 Speed',
  'Wavecoat at level 16','Aquatic, Field',0.5,9.0,'Gift from Professor Wren',
  'Chubby otter pup with a tail like a paddle.',
  "Juggles pebbles when it's bored. If you watch, it will keep going until it drops one, then pretend it meant to.",
  [(1,'Shove'),(1,'Disarming Look'),(4,'Spritz'),(7,'Riptide Jab'),(10,'Gnaw'),(13,'Rapid Current'),(17,'Torrent Fang'),(21,'Soak In'),(25,'Aqua Lance'),(29,'Train Hard'),(33,'Brine Lash'),(37,'Rain Call'),(42,'Breaker')])
K(8,'Wavecoat',['Tide'],[68,76,66,62,66,80],['Undercurrent'],'Momentum','Medium-Slow',45,142,'2 Speed',
  'Torrentide at level 35','Aquatic, Field',1.2,32.0,'Evolves from Ottide',
  'Sleek otter whose fur flows off its back like a cape of water.',
  "Strong enough to swim upstream through rapids. It chooses to, often, apparently for fun.",
  [(1,'Shove'),(1,'Spritz'),(1,'Riptide Jab'),(1,'Gnaw'),(13,'Rapid Current'),(17,'Torrent Fang'),(22,'Soak In'),(26,'Aqua Lance'),(30,'Train Hard'),(34,'Brine Lash'),(39,'Rain Call'),(44,'Breaker')])
K(9,'Torrentide',['Tide','Brawl'],[90,112,84,70,80,94],['Undercurrent'],'Momentum','Medium-Slow',45,239,'3 Attack',
  'Final stage','Aquatic, Field',1.9,120.0,'Evolves from Wavecoat',
  'Broad-shouldered sea otter with a mane shaped like a breaking wave.',
  "Fishing crews in Marrowind say a storm won't sink a boat that a Torrentide has chosen to guard.",
  [(0,'Crashing Mane'),(1,'Quick Jab'),(1,'Spritz'),(1,'Riptide Jab'),(1,'Rapid Current'),(17,'Torrent Fang'),(22,'Soak In'),(26,'Aqua Lance'),(30,'Train Hard'),(35,'Siphon Fist'),(41,'Brine Lash'),(46,'Rain Call'),(51,'Breaker'),(57,'All-Out Assault')])

# ---------------- Route Kith (art needed) ----------------
K(10,'Sparkit',['Volt'],[40,45,38,60,42,80],['Static Fur','Accelerate'],'Grounding','Medium',190,56,'1 Speed',
  'Voltail with a Volt Shard','Field',0.4,5.2,'Route 1 tall grass (morning and day); Lumen outskirts',
  'Blue jerboa-like Kith with huge crackling ears and a lightning-bolt tail.',
  "Its ears spark when it hears its name. Lumen City's tram workers keep one on every line to warn of shorts.",
  [(1,'Shove'),(1,'Static Snap'),(5,'Quick Pounce'),(9,'Arc Fang'),(13,'Jolt Wave'),(17,'Shock Jab'),(21,'Charge Up'),(25,'Volt Arc'),(30,'Static Coat'),(35,'Storm Strike')],
  art="Small, springy jerboa-like Kith in blue (#5078DC) with a pale blue belly (#C8E6FF), long hind legs, huge ears with crackling yellow tips, and a tail shaped like a yellow lightning bolt (#F6CE46). Alert, mischievous expression. Must read clearly differently from Foxfern: rounder body, bigger ears, hopping stance.")
K(11,'Voltail',['Volt'],[65,72,60,102,70,115],['Static Fur','Accelerate'],'Static Surge','Medium',75,165,'2 Speed',
  'Final stage','Field',1.3,26.0,'Evolves from Sparkit',
  'Long, sleek storm ferret whose tail splits into two crackling bolts.',
  "Moves in short bursts that leave the smell of rain behind. It sleeps through thunderstorms like they're lullabies.",
  [(1,'Static Snap'),(1,'Quick Pounce'),(1,'Arc Fang'),(1,'Jolt Wave'),(17,'Shock Jab'),(21,'Charge Up'),(25,'Volt Arc'),(30,'Static Coat'),(36,'Ion Pulse'),(42,'Storm Strike'),(48,'Overload')],
  art="Elegant, long-bodied storm ferret in deep blue (#3E5CC0) with yellow lightning markings (#F6CE46) along its spine; its tail splits into two bolt-shaped prongs that crackle. Narrow eyes, confident stance, mid-stride. Clearly the grown-up Sparkit.")
K(12,'Peeplet',['Beast','Gale'],[40,45,40,35,35,56],['Opening Gambit','Sharp Eyes'],'Momentum','Medium-Slow',255,50,'1 Speed',
  'Peeplark at level 14','Avian',0.3,1.8,'Routes 1, 2 and 3; very common',
  'Plump brown chick with a three-feather tuft and a loud opinion about everything.',
  "Wakes before dawn and makes sure everyone else does too. Farmers consider it a free alarm clock and a nuisance in equal measure.",
  [(1,'Beak Jab'),(1,'Disarming Look'),(5,'Quick Pounce'),(9,'Wing Cut'),(13,'Focus Gaze'),(17,'Swift Talon'),(21,'Talon Snatch'),(25,'Air Blade'),(29,'Tailgust'),(33,'Dive Bomb')],
  art="Round, plump chick (#B07C52) with a cream belly (#F6E2BE), orange beak and feet (#F0A032), and a three-feather tuft on its head. Puffed chest, beak open mid-chirp. Keep the prototype's round silhouette.")
K(13,'Peeplark',['Beast','Gale'],[60,68,58,50,50,76],['Opening Gambit','Sharp Eyes'],'Momentum','Medium-Slow',120,122,'2 Speed',
  'Skyrook at level 32','Avian',0.8,9.5,'Route 3 and Highcrest slopes',
  'Lean lark with a swept-back crest and sharp wing edges.',
  "Patrols a fixed territory every morning and duels any bird that crosses it, then sings about winning.",
  [(1,'Beak Jab'),(1,'Quick Pounce'),(1,'Wing Cut'),(13,'Focus Gaze'),(18,'Swift Talon'),(22,'Talon Snatch'),(27,'Air Blade'),(31,'Tailgust'),(36,'Stampede'),(41,'Dive Bomb')],
  art="Lean, fast lark in warm brown (#9A6A44) with a cream chest and a long, swept-back crest; sharp wing edges, focused eyes. Mid-flight or perched in a ready-to-launch pose. The teenage version of Peeplet.")
K(14,'Skyrook',['Beast','Gale'],[85,105,80,65,72,100],['Imposing','Composed'],'Tailwind Born','Medium-Slow',45,214,'3 Attack',
  'Final stage','Avian',1.6,38.0,'Evolves from Peeplark; Cole\'s ace',
  'Large hawk-like bird with a white crown of feathers and a powerful build.',
  "Its crown feathers stand up before a dive. Highcrest's glider pilots learned to read the wind by watching them.",
  [(1,'Beak Jab'),(1,'Wing Cut'),(1,'Swift Talon'),(1,'Molting Flurry'),(18,'Focus Gaze'),(22,'Talon Snatch'),(27,'Air Blade'),(31,'Tailgust'),(32,'Feral Fury'),(38,'Stampede'),(44,'Dive Bomb'),(50,'Perch'),(56,'Last Stand')],
  art="Powerful hawk-like raptor, chestnut brown (#7A4A2E) with a bright white crown of feathers (#F5F2EB) that fans out like a crest, golden eyes, hooked beak. Broad wings, muscular build; reads as a proud, competitive bird. Rival Cole's partner.")
K(15,'Burrowbit',['Beast'],[50,52,45,30,40,66],['Hard Claws','Gatherer'],'Pack Bond','Medium',255,51,'1 Speed',
  'Thumpwarren at level 20','Field',0.4,3.6,'Routes 1 and 2; meadows and field edges',
  'Stocky rabbit with digging claws and one ear that never stands up.',
  "Digs shallow tunnels everywhere and forgets most of them. Half the potholes on Route 1 are its fault.",
  [(1,'Shove'),(1,'Disarming Look'),(4,'Quick Pounce'),(8,'Gnaw'),(12,'Mud Fling'),(16,'Hunker Down'),(20,'Burrow'),(24,'Echo Strike'),(28,'Rest Up'),(33,'Stampede')],
  art="Stocky, round rabbit in sandy brown (#B8A48C) with a cream muzzle, big digging claws on its front paws, and one ear permanently flopped over. Dirt on its nose. Friendly, a little dopey.")
K(16,'Thumpwarren',['Beast','Stone'],[80,95,80,45,65,75],['Hard Claws','Gatherer'],'Pack Bond','Medium',90,148,'2 Attack',
  'Final stage','Field',1.0,32.0,'Evolves from Burrowbit; rocky fields near Cindervale',
  'Heavyset hare with stone-hard foot pads that shake the ground when it stamps.',
  "Warns its warren of danger by stamping. The thump can be felt from a quarter mile away.",
  [(1,'Shove'),(1,'Quick Pounce'),(1,'Gnaw'),(1,'Mud Fling'),(16,'Hunker Down'),(20,'Burrow'),(25,'Granite Fist'),(29,'Echo Strike'),(33,'Rest Up'),(38,'Groundswell'),(44,'Feral Fury')],
  art="Big, muscular hare in sandy brown with stone-gray foot pads and forearm plating (#A8865A); one ear still flopped like Burrowbit's. Mid-stamp pose with small rocks bouncing. Tough but good-natured.")
K(17,'Silkling',['Swarm'],[45,30,40,35,40,40],['Molting','Even Keel'],'Lucky Star','Fast',255,39,'1 Sp. Def',
  'Female: Lumoth at level 10. Male: Threadwraith at level 10','Swarm',0.3,2.0,'Routes 1 and 2 tall grass; Bramblewood edges',
  'Soft, pale caterpillar wrapped in a scarf of its own silk.',
  "Spins silk scarves for itself when it's cold. Children in Bramblewood try to collect the scarves; it does not appreciate this.",
  [(1,'Shove'),(1,'Silk Bind'),(5,'Nibble'),(9,'Pester')],
  art="Small, soft caterpillar, cream and pale green (#DDE8B8) with big gentle eyes, wrapped in a wispy silk scarf. Tiny stubby legs. Shy, cozy look.")
K(18,'Lumoth',['Swarm','Fae'],[70,45,60,90,80,85],['Sharp Eyes','Even Keel'],'Reflective Hide','Fast',45,168,'2 Sp. Atk, 1 Speed',
  'Final stage','Swarm, Fae',1.1,9.0,'Evolves from female Silkling; Bramblewood at night',
  'Moth with softly glowing wings patterned like stained glass.',
  "Its wings glow brighter near people it trusts. Night travelers in Bramblewood follow Lumoth light home.",
  [(0,'Scale Dust'),(1,'Shove'),(1,'Silk Bind'),(1,'Nibble'),(1,'Pester'),(12,'Glimmer'),(15,'Mind Prick'),(19,'Lull'),(23,'Wing Drone'),(27,'Gentle Drain'),(32,'Dazzling Light'),(37,'Swarm Dance'),(43,'Lunar Burst')],
  art="Elegant moth with large wings patterned like stained glass in soft violet, teal and gold, with a faint glow along the wing edges; fluffy white collar, feathery antennae. Gentle, luminous. Glow should be suggested by lighter pixels, not blur.")
K(19,'Cobblit',['Stone'],[45,62,75,30,40,28],['Sturdy Frame','Jagged Hide'],'Unshakable','Medium',190,58,'1 Defense',
  'Cragmaw at level 30','Mineral',0.4,22.0,'Cindervale mines and rocky routes',
  'Small rock creature with a big lower jaw and gravel-studded back.',
  "Chews through loose rock to find iron, which it treats like candy. Miners follow it to new seams.",
  [(1,'Shove'),(1,'Hunker Down'),(5,'Pebble Toss'),(9,'Gnaw'),(13,'Sand Spray'),(17,'Granite Fist'),(21,'Shard Field'),(25,'Landslide'),(30,'Fortify'),(35,'Crag Spike')],
  art="Squat, round rock creature in warm stone gray-brown (#A8865A) with an oversized underbite jaw, small tough legs, and a back studded with gravel and a few iron flecks. Determined little face.")
K(20,'Cragmaw',['Stone','Metal'],[75,105,120,45,65,40],['Sturdy Frame','Jagged Hide'],'Unshakable','Medium',75,165,'2 Defense',
  'Final stage','Mineral',1.2,210.0,'Evolves from Cobblit; Dara Flint\'s ace',
  'Boulder-bodied creature whose jaw has hardened into iron.',
  "Can bite through a mine cart's axle. Dara Flint's Cragmaw once held up a collapsing tunnel long enough for a crew to get out.",
  [(1,'Shove'),(1,'Pebble Toss'),(1,'Gnaw'),(1,'Iron Ram'),(13,'Sand Spray'),(17,'Granite Fist'),(21,'Shard Field'),(25,'Landslide'),(30,'Steel Claw'),(33,'Plate Up'),(38,'Crag Spike'),(44,'Dead Weight'),(50,'Ramming Crag')],
  art="Heavy boulder-bodied creature (#8C7A5C stone with #8C98A8 metal) whose huge lower jaw has turned to riveted iron; metal plates on its shoulders, glowing ore veins. Low, immovable stance. Reads as a mine guardian.")
K(21,'Barnacub',['Tide','Stone'],[45,62,78,38,45,40],['Hard Claws','Sturdy Frame'],'Rain Runner','Medium',190,60,'1 Defense',
  'Barnaclaw at level 20','Aquatic, Mineral',0.4,12.0,'Marrowind shoreline and Route 3 tide pools',
  'Hermit-crab-like Kith living in a barnacle-covered stone shell.',
  "Collects shiny junk for its shell. Marrowind kids trade sea glass with it, and it always drives a hard bargain.",
  [(1,'Shove'),(1,'Hunker Down'),(5,'Spritz'),(9,'Pebble Toss'),(13,'Torrent Fang'),(17,'Sand Spray'),(21,'Granite Fist'),(25,'Brine Lash'),(30,'Fortify'),(35,'Crag Spike')],
  art="Small hermit-crab-like creature with blue-gray body (#5A86C8) and one oversized claw, living in a round stone shell crusted with barnacles and bits of sea glass. Curious eyes on short stalks.")
K(22,'Barnaclaw',['Tide','Stone'],[72,108,118,58,68,56],['Hard Claws','Sturdy Frame'],'Rain Runner','Medium',75,170,'2 Attack',
  'Final stage','Aquatic, Mineral',1.3,95.0,'Evolves from Barnacub; Captain Isla Marlowe\'s ace',
  'Armored crab with a fortress-like barnacle shell and one crushing claw.',
  "Marrowind's harbor has a Barnaclaw living under every pier. They keep the pilings free of rot in exchange for scraps.",
  [(1,'Shove'),(1,'Spritz'),(1,'Pebble Toss'),(1,'Torrent Fang'),(17,'Sand Spray'),(20,'Breaker'),(22,'Granite Fist'),(26,'Brine Lash'),(31,'Fortify'),(36,'Crag Spike'),(42,'Aqua Lance'),(48,'Ramming Crag')],
  art="Large armored crab, deep blue (#3E6EA8) with a tall stone shell like a small sea fortress, crusted with barnacles; one claw much larger than the other, scarred and heavy. Sturdy, veteran look.")

K(23,'Threadwraith',['Swarm','Shade'],[61,92,55,45,55,122],['Lucky Eye','Opening Gambit'],'Marksman','Fast',45,168,'2 Speed, 1 Attack',
  'Final stage','Swarm',1.0,6.5,'Evolves from male Silkling; rarely seen at the Bramblewood edge after dark',
  'Lean, silk-wrapped ninja moth whose scarf has grown into long trailing streamers.',
  "Moves so quietly that Bramblewood rangers only know one passed by the cut threads it leaves on branches. It is fiercely loyal to one partner and ignores everyone else.",
  [(0,'Creep'),(1,'Shove'),(1,'Silk Bind'),(1,'Nibble'),(1,'Pester'),(12,'Quick Pounce'),(15,'Mandible Slash'),(19,'Silk Snare'),(23,'Ambush'),(27,'Scissor Strike'),(32,'Night Jaw'),(37,'Scheme'),(41,'Fade Strike'),(46,'Ambush Strike')],
  art="Male-line evolution of Silkling. Slim, upright moth-ninja in charcoal and deep indigo (#2E2A44) with pale cream silk wrappings (#DDE8B8) binding its forearms and face like a mask; Silkling's scarf has become two long trailing streamers. Narrow, swept-back wings folded close like a cloak, sharp silver eyes. Crouched, ready-to-strike stance. Should read as Silkling's sibling to Lumoth: same cream silk, opposite mood (quiet and sharp, not soft and glowing).")

ENCOUNTERS = [
 ('Route 1','Tall grass, morning/day',[('Peeplet',35,'2–4'),('Burrowbit',30,'2–4'),('Silkling',20,'2–3'),('Sparkit',15,'3–4')]),
 ('Route 1','Tall grass, evening/night',[('Burrowbit',35,'2–4'),('Silkling',30,'2–4'),('Peeplet',25,'2–4'),('Sparkit',10,'3–4')]),
 ('Route 2','Tall grass',[('Burrowbit',30,'5–8'),('Peeplet',25,'5–8'),('Cobblit',20,'6–8'),('Silkling',15,'5–7'),('Sparkit',10,'6–8')]),
 ('Cindervale Mines','Cave floor',[('Cobblit',60,'8–12'),('Burrowbit',25,'8–11'),('Thumpwarren',15,'20–22 (rare, after badge 1)')]),
 ('Route 3','Tall grass',[('Peeplet',30,'10–13'),('Peeplark',10,'14–15'),('Burrowbit',25,'10–13'),('Sparkit',20,'11–13'),('Silkling',15,'10–12')]),
 ('Route 3','Tide pools',[('Barnacub',70,'11–14'),('Ottide',5,'12 (rare)'),('Peeplet',25,'10–13')]),
 ('Bramblewood edge','Night only',[('Silkling',50,'12–14'),('Lumoth',25,'14–16'),('Sparkit',20,'13–15'),('Threadwraith',5,'15–16 (rare)')]),
]

TEAMS = [
 ('Cole (battle 1, Hearthmoss)','Starter strong against yours, L5','No items'),
 ('Cole (battle 2, Route 3)','Peeplet L11; his starter L13','Calder Fig on the starter'),
 ('Dara Flint (Gym 1)','Burrowbit L11; Cobblit L12; Cobblit L14 (ace)','Ace holds a Growth Ring; uses Shard Field and Sturdy Frame'),
 ('Cole (battle 3, Marrowind double)','Peeplark L16; Sparkit L16; his starter L18','Partners with the player'),
 ('Isla Marlowe (Gym 2)','Barnacub L17; Peeplark L18; Barnaclaw L20 (ace)','Opens with Rain Call; ace holds Trail Rations'),
]

# Gender: percent female; None = genderless. Applied to every species.
GENDER = {n:50 for n in [x['name'] for x in S]}
GENDER.update({'Cobblit':None,'Cragmaw':None,'Lumoth':100,'Threadwraith':0})
GENDER_NOTES = {
 'Silkling':'Gender decides evolution: females become Lumoth, males become Threadwraith.',
 'Lumoth':'Female only (female Silkling line).',
 'Threadwraith':'Male only (male Silkling line).',
 'Cobblit':'Genderless mineral Kith.','Cragmaw':'Genderless mineral Kith.'}
for x in S:
    x['gender_female_pct']=GENDER[x['name']]; x['gender_note']=GENDER_NOTES.get(x['name'],'')
