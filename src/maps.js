/* ================= areas ================= */
/* Each area: size in tiles, a seed, ground features (paths, paving, pond, rails, gravel, tall grass)
   and build(), which places everything that stands up. Positions are tile coordinates.
   exits: which edge leads where, and the tile you arrive on. People live in buildNpcs() in game.js.
   World generation is seeded: adding or moving something before a scatter() call shifts the trees
   and rocks after it, so new decoration goes at the end of build(). */
const MAPS={};
const CV=()=>WA.cv;
// Water tiles under the pond, and nothing random on the pond shore, paths or paving.
function groundRules(){for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    if(POND){const d=ellD(POND,tc(x),tc(y));if(d<.95)setT(x,y,2);if(d<1.25)reserved[y*MW+x]=1}
    if(pathAtTile(x,y)<8||inPave(tc(x),tc(y)))reserved[y*MW+x]=1}}
// A wide object such as a stall or a cart: blocks 2*half+1 tiles.
function bigProp(x,y,img,sc,half,l,sh=.7){block(x-half,y,x+half,y);res(x-half-1,y-2,x+half+1,y+1);addB({x:tc(x),y:(y+1)*T-2,img,sh,sc});if(l)for(let i=-half;i<=half;i++)inter[(x+i)+','+y]=l}
function lantern(x,y){block(x,y,x,y);res(x,y,x,y);addB({x:tc(x),y:(y+1)*T-2,img:CV().small[0],emis:CV().lanternEmis,sh:.2,sc:.72});lights.push({x:tc(x)+5,y:(y+1)*T-2,hgt:30,r:58,lamp:1})}

/* ---------- Hearthmoss Village and Route 1 ---------- */
MAPS.hearthmoss={id:'hearthmoss',w:60,h:80,seed:20261122,bedRow:73,
  exits:[{edge:'n',to:'route2',tx:30,ty:92,dir:1}],
  paths:[{p:[[30,82],[30,66]],hw:17},{p:[[30,58],[30,41],[36,35],[36,27],[26,21],[26,12],[30,5],[30,-6]],hw:17},
    {p:[[26,60],[18,58]],hw:11},{p:[[34,60],[41,58]],hw:11},{p:[[34,65],[44,70]],hw:11},{p:[[26,65],[15,75]],hw:11}],
  grey:{cx:tc(22.4),cy:tc(18.6),rx:2.7*T,ry:2.1*T},plaza:{cx:tc(30),cy:tc(62),rx:6.2*T,ry:4.6*T},pond:{cx:tc(9),cy:tc(64),rx:4.6*T,ry:4.1*T},
  grass:[[19,36,6,5],[44,24,6,5],[38,10,5,3.5],[15,17,5,6],[24,44,3.5,1.8],[48,40,4,3]],
  beds:[{x0:38*T,x1:51*T-2,y0:74*T,y1:76*T+12,n:1600}],
  items:[{id:'r1_salve',x:49,y:9,item:'salve',n:1},{id:'r1_orb',x:8,y:30,item:'orb',n:1}],
  build(){
    // borders
    block(0,0,3,MH-1);block(56,0,MW-1,MH-1);block(0,0,MW-1,3);block(0,77,MW-1,MH-1);
    for(let x=4;x<56;x++)if(x<27||x>33)block(x,46,x,48);
    // pond & plaza
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(ellD(POND,tc(x),tc(y))<.95)setT(x,y,2);if(ellD(POND,tc(x),tc(y))<1.25||ellD(PLAZA,tc(x),tc(y))<1.15)reserved[y*MW+x]=1;if(pathAtTile(x,y)<8)reserved[y*MW+x]=1}
    inter.water=say(["The pond is calm and clear.","You could fish here… if you had a rod."]);
    // houses
    for(const h of[{tx:18,ty:57,spr:'player_house',half:3,smoke:1,lines:say(["Home. The door's unlocked, like always.","Mom's in the garden out front."])},
      {tx:41,ty:57,spr:'wren_lab',half:3,lines:say(["CALDER ARCHIVE · HEARTHMOSS FIELD LAB","A note on the door: \"Working outside today. Mind the table. — E. Wren\""])},
      {tx:44,ty:69,spr:'hearthmoss_house_a',half:2,dx:23,smoke:1,lines:say(["No answer. Muffled snoring drifts through the door."])},
      {tx:15,ty:74,spr:'hearthmoss_house_b',half:3,dx:-32,lines:say(["A note on the door reads:","\"Gone fishing. Back never.\""])}])placeHouse(h);
    // fountain
    block(29,61,31,62);addB({x:tc(30),y:63*T,img:SP.fountain,sh:.8,sc:.85});inter['29,62']=inter['30,62']=inter['31,62']=inter['30,61']=say(["The fountain burbles happily.","A few coins glint at the bottom."]);
    for(const[x,y]of[[24,58],[36,58],[24,66],[36,66]])placeLamp(x,y);
    // village props
    prop(22,65,WA.small[7],.7,.6,say(["A bench facing the fountain.","Somebody has carved a tiny Peeplet into the armrest."]));prop(40,65,WA.large[1],.8,.65,say(["The village well.","The water is cold and very clear."]));
    prop(46,57,WA.small[5],.7,.35,say(["A crate of sensor parts, addressed to Professor Wren."]));prop(47,57,WA.small[6],.7,.3,say(["A rain barrel. Something small is swimming in it."]));
    fenceRow(38,50,73,true);
    // signs
    sg(27,71,say(["HEARTHMOSS VILLAGE","\"Where every journey takes root.\""]));
    sg(28,50,say(["ROUTE 1 · EMBERWILD TRAIL","North: Route 2 and Cindervale City.","Wild Kith live in the tall grass."]));
    sg(21,58,say(["It's your mailbox.","Empty, as usual."]),WA.small[1]);
    sg(28,43,say(["FIELD NOTES","A tired Kith is far more willing to accept a Tether Orb.","Different Kith come out in the evening. Tap the sun to let the day pass."]));
    for(const[x,y]of[[15,65],[38,62]])res(x-1,y-1,x+1,y+1);res(13,58,22,61);res(42,58,49,66);res(32,31,34,33);res(28,14,30,16);res(20,16,25,21);
    growGrass();
    // trees
    for(let ty=-10;ty<=MH+7;ty+=2){for(let tx=-8;tx<=3;tx+=2)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4));for(let tx=56;tx<=67;tx+=2)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4))}
    for(let tx=4;tx<56;tx+=2){for(let ty=-10;ty<=3;ty+=2)if(ty<-2||tx<27||tx>33)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4));for(let ty=77;ty<=87;ty+=2)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4))}
    for(let tx=4;tx<56;tx+=2)if(tx<26||tx>33)tree(tc(tx)+rf(-4,4),tc(47)+rf(-3,3));
    scatter(34,5,54,6,44,'tree');scatter(9,5,54,50,75,'tree');scatter(12,5,54,6,44,'bush');scatter(12,5,54,50,75,'bush');scatter(10,5,54,6,44,'rock');scatter(4,5,54,50,75,'rock');
    // ---- lived-in detail, added after the scatter so the trees above stay where they were ----
    propNear(13,69,WA.small[7],.7,.6,say(["A bench by the water.","Someone left a fishing float on the seat. It has been here a while."]));
    propNear(48,70,WA.small[5],.7,.35,say(["Seed potatoes, packed in straw."]));propNear(49,70,WA.small[6],.7,.3,say(["A barrel of rainwater for the flowerbed."]));
    propNear(23,72,WA.small[6],.7,.3,say(["A barrel with a fishing net drying over the rim."]));
    for(const[x,y]of[[26,52],[34,52]]){const p=freeNear(x,y,2);if(p)placeLamp(p[0],p[1])}
    propNear(40,37,WA.small[7],.7,.6,say(["A trail bench. Initials are carved all along the back rail.","The newest pair is C.H., cut deep, with today's date."]));
    propNear(33,24,WA.small[5],.7,.35,say(["An Archive supply crate.","\"SENSOR STAKES · DO NOT STACK\". Two more crates are stacked on top of it."]));
    propNear(21,11,WA.small[7],.7,.6,say(["A bench where the trail starts to climb.","From here you can see the smoke of Cindervale to the north."]));
  }};

/* ---------- Route 2: the Cinder Road ---------- */
MAPS.route2={id:'route2',w:60,h:100,seed:20261207,bedRow:90,
  exits:[{edge:'s',to:'hearthmoss',tx:30,ty:7,dir:0},{edge:'n',to:'cindervale',tx:32,ty:69,dir:1}],
  paths:[{p:[[30,106],[30,89],[23,81],[23,70],[35,62],[35,50],[25,42],[25,30],[34,22],[34,12],[30,6],[30,-6]],hw:17},
    {p:[[30,89],[45,87]],hw:10},{p:[[35,56],[47,54]],hw:9},{p:[[25,36],[13,34]],hw:9},{p:[[23,75],[17,74]],hw:8}],
  pond:{cx:tc(11),cy:tc(75),rx:4.4*T,ry:3.6*T},
  grass:[[41,75,5.5,4.5],[13,62,6,5.5],[46,65,5,4],[15,47,6,5],[43,41,6,5],[13,27,5,4.5],[45,27,6,5],[20,12,5,3.5],[46,10,5,3.5]],
  rails:[[[4,17],[55,17]]],gravel:[{cx:tc(30),cy:tc(17),rx:28*T,ry:1.5*T},{cx:tc(48),cy:tc(54),rx:4.5*T,ry:3*T,c:[150,138,116]}],
  gpN:[[98,128,58],[116,146,64],[136,162,72],[156,176,84]],
  beds:[{x0:38*T,x1:51*T-2,y0:91*T,y1:93*T+12,n:1300}],
  items:[{id:'r2_salve',x:11,y:34,item:'salve',n:1},{id:'r2_orb',x:50,y:53,item:'orb',n:2},{id:'r2_clear',x:49,y:22,item:'clear',n:1},{id:'r2_salve2',x:9,y:14,item:'salve',n:1}],
  build(){
    wallIn({n:[27,33],s:[27,33]},(tx,ty)=>ty<30&&R()<.5);groundRules();
    inter.water=say(["A farm pond, stocked and tidy.","Something silver turns over just under the surface."]);
    // the farm at the south end
    placeHouse({tx:45,ty:85,spr:'hearthmoss_house_b',half:3,dx:-32,smoke:1,lines:say(["A farmhouse. Boots by the door, three sizes.","Something is baking."])});
    fenceRow(38,50,90,true);
    prop(40,86,WA.large[1],.8,.65,say(["The farm well. A tin cup hangs from the crank."]));prop(51,86,WA.small[5],.7,.35,say(["Crates of late apples, marked for Cindervale."]));prop(52,86,WA.small[6],.7,.3,say(["Cider. The lid is nailed down, which tells you something about the neighbours."]));
    prop(17,72,WA.small[7],.7,.6,say(["A bench by the pond.","Two fishing rods lean against it. Only one has a hook."]));
    // the prospectors' camp, east of the road
    prop(48,52,WA.small[5],.7,.35,say(["A crate of rock samples, each one labelled in neat pencil."]));prop(49,52,WA.small[6],.7,.3,say(["A water barrel. The camp has been here a few weeks."]));prop(46,56,WA.small[7],.7,.6,say(["A bench knocked together from mine timber."]));
    prop(50,55,CV().small[6],.7,.4,say(["Picks and a pan, cleaned and racked.","Somebody takes care of their tools."]));
    // the mine line crossing
    res(4,16,55,18);bigProp(44,17,CV().large[0],.7,1,say(["An ore cart, parked on the line and loaded with slate.","Chalked on the side: \"CINDERVALE YARD · NO RIDERS\"."]));
    prop(37,15,WA.small[5],.7,.35,say(["Spare rail spikes, by the crate."]));
    // the lookout, west of the road
    prop(14,32,WA.small[7],.7,.6,say(["A lookout bench.","North, past the trees, the slate roofs of Cindervale. South, the whole green valley you grew up in."]));
    // signs
    sg(32,93,say(["ROUTE 2 · THE CINDER ROAD","North: Cindervale City.","South: Route 1 and Hearthmoss Village."]));
    sg(27,65,say(["FIELD NOTES","Stone Kith such as Cobblit shrug off Beast and Ember moves.","Bloom and Tide moves get through. So does patience."]));
    sg(36,19,say(["MINE LINE CROSSING","Carts run to the Cindervale yard at all hours.","Look both ways. The carts will not."]),CV().small[4]);
    sg(32,9,say(["CINDERVALE CITY · just ahead","Rest Lodge, Provisioner and Stone Gym."]),CV().small[4]);
    // keep people's spots and the trainers' lines of sight clear
    res(21,75,28,77);res(31,55,37,57);res(23,35,30,37);res(27,85,32,88);res(15,71,20,76);res(44,51,52,57);res(11,31,16,35);res(37,84,53,88);
    growGrass();
    scatter(30,5,54,48,94,'tree');scatter(14,5,54,6,47,'tree');scatter(12,5,54,6,40,'boulder');scatter(16,5,54,6,94,'bush');scatter(8,5,54,48,94,'rock');scatter(22,5,54,6,47,'rock');
  }};

/* ---------- Cindervale City ---------- */
MAPS.cindervale={id:'cindervale',w:64,h:76,seed:20261208,
  exits:[{edge:'s',to:'route2',tx:30,ty:7,dir:0}],
  paths:[{p:[[12,58],[30,58]],hw:10},{p:[[34,58],[52,58]],hw:10},{p:[[32,21],[32,9]],hw:15}],
  pave:[[30,46,34,75],[23,37,41,46],[8,41,22,43],[42,41,56,43],[31,22,33,36],[14,30,50,32]],
  rails:[[[30,-4],[30,18]],[[30,16],[47,16]]],
  gravel:[{cx:tc(33),cy:tc(14),rx:21*T,ry:7*T},{cx:tc(52),cy:tc(24),rx:5*T,ry:3.5*T,c:[120,116,118]},{cx:tc(44),cy:tc(66),rx:5*T,ry:3.5*T,c:[150,138,116]}],
  gp:[[92,124,58],[108,140,64],[126,154,72],[144,168,84]],dp:[[150,130,104],[166,146,116],[182,162,130]],dpE:[116,98,76],
  cob:{st:[[158,156,160],[142,142,150],[170,168,170],[134,134,142]],gap:[90,88,96],edge:[112,108,110]},flowers:.35,
  build(){
    wallIn({s:[30,34],n:[28,34]},(tx,ty)=>ty<30&&R()<.75);groundRules();
    const B=(spr,tx,ty,half,dx,lines)=>placeHouse({tx,ty,spr:'cindervale_'+spr,half,dx,smoke:1,lines:say(lines)});
    B('rest_lodge',15,40,3,0,["LEAGUE REST LODGE · CINDERVALE","Rest for any trainer and their Kith, free of charge.","The attendant is working out front today."]);
    B('gym',50,40,3,0,["CINDERVALE GYM · STONE","Leader: Dara Flint.","A slate hangs on the door: \"On shift at the mines. Challenges when I'm back up. — D.F.\""]);
    B('shop',28,36,3,24,["PROVISIONER","A card in the window: \"Stocktaking. Open again shortly.\""]);
    B('archive_station',37,36,3,0,["CALDER ARCHIVE · CINDERVALE FIELD STATION","Through the window: shelves of sample jars, and a desk buried in survey forms."]);
    B('house_a',18,29,2,18,["Somebody is practising a fiddle. They have a way to go."]);
    B('house_b',25,29,3,0,["A brass plate: \"FLINT\". The step is swept clean."]);
    B('house_b',39,29,3,0,["Laughter inside, and the clatter of a card game."]);
    B('house_a',47,29,2,18,["The curtains are drawn. Night shift, probably."]);
    B('house_b',15,56,3,0,["A row of work boots dries on the sill."]);
    B('house_a',24,56,2,18,["A note: \"Deliveries round the back. The Burrowbit bites.\""]);
    B('house_a',41,56,2,18,["Window boxes, full of herbs that are somehow thriving."]);
    B('house_b',49,56,3,0,["A child's chalk drawing of a Cobblit covers the bottom of the door."]);
    // the square
    bigProp(32,42,CV().large[4],.72,1,say(["The town well, roofed in slate.","The water tastes faintly of stone. Locals swear by it."]));
    bigProp(26,45,CV().large[3],.7,1,say(["A market stall: late apples, seed cake, and jars of something pickled."]));
    bigProp(38,45,CV().large[2],.7,1,say(["TOWN NOTICES","\"SHIFT ROSTER: day crew up at six bells.\"","\"GYM: challenges resume when Leader Flint is back above ground.\"","\"LOST: one Cobblit, answers to Pebble. Has probably eaten this notice by now.\""]));
    for(const[x,y]of[[24,39],[40,39]])prop(x,y,CV().small[7],.7,.6,say(["A bench of dark mine timber, worn smooth."]));
    for(const[x,y]of[[23,37],[41,37],[23,46],[41,46],[29,50],[35,50],[29,62],[35,62],[29,69],[35,69],[10,40],[21,40],[44,40],[55,40],[30,28],[34,28],[15,33],[49,33]])lantern(x,y);
    // the yard by the gate
    bigProp(44,66,CV().large[1],.72,1,say(["The water tower. It ticks as the sun warms the hoops."]));
    prop(42,67,CV().small[5],.7,.4,say(["Sacks of crushed ore, waiting on a cart."]));prop(46,68,CV().small[2],.7,.35,say(["A crate stencilled \"VANCE-CALDER WORKS · LUMEN CITY\"."]));prop(47,68,CV().small[3],.7,.3,say(["A barrel of lamp oil."]));
    prop(24,66,CV().small[2],.7,.35,say(["Empty crates, stacked for the next cart south."]));prop(25,66,CV().small[3],.7,.3,say(["Rain barrel."]));
    // the mine yard and the north road
    res(28,4,36,20);res(29,15,48,17);
    bigProp(39,16,CV().large[0],.7,1,say(["An ore cart heaped with slate, fresh up from the mine."]));bigProp(44,16,CV().large[0],.7,1,say(["An ore cart. A Cobblit-sized dent has been hammered back out of one side."]));
    addB({x:tc(48),y:17*T-2,img:CV().fence[7],sh:.3,sc:.8});block(48,16,48,16);
    prop(36,19,CV().small[6],.7,.4,say(["A rack of picks, each handle branded with its owner's mark."]));prop(26,18,CV().small[5],.7,.4,say(["Ore sacks, tagged for the assay office."]));prop(25,18,CV().small[2],.7,.35,say(["Lamp wicks and candles, by the crate."]));
    fenceRow(27,36,7,false,[CV().fence[3],CV().fence[4],CV().fence[5]]);
    sg(37,9,say(["NORTH ROAD · CINDERVALE MINES","Closed to visitors while a shift is underground."]),CV().small[4]);
    sg(36,70,say(["CINDERVALE CITY","\"Built on slate.\""]),CV().small[4]);
    sg(12,44,say(["LEAGUE REST LODGE","Open to every trainer in the Reach."]),CV().small[4]);
    sg(46,44,say(["CINDERVALE GYM","The first badge of the Calder League is earned here."]),CV().small[4]);
    res(26,6,38,12);res(20,12,30,20);
    scatter(7,5,58,48,71,'tree');scatter(5,5,58,22,28,'tree');scatter(7,5,58,5,26,'boulder');scatter(10,5,58,44,72,'bush');scatter(18,5,58,5,72,'rock');
  }};
