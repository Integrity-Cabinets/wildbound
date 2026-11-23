/* ================= images ================= */
const loadImg=src=>new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.src=src});
const cut=(im,x,y,w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,x,y,w,h,0,0,w,h);return c};
function sheetFrames(im,fw,fh,cols){const out=[];for(let d=0;d<4;d++){out[d]=[];for(let c=0;c<cols;c++)out[d].push(cut(im,c*fw,d*fh,fw,fh))}return out}
const CH={},FOL={},PORT={};let WA=null;
async function loadWorld(){const W=DATA.world,L=a=>Promise.all(a.map(loadImg));WA={trees:await L(W.trees),plants:await L(W.plants),grass:await L(W.grass),small:await L(W.small),large:await L(W.large),fence:await L(W.fence),lampEmis:await loadImg(W.lampEmis),bld:{}};
  for(const k in W.bld)WA.bld[k]={img:await loadImg(W.bld[k].img),emis:await loadImg(W.bld[k].emis),wins:W.bld[k].wins,w:W.bld[k].w,h:W.bld[k].h}}
async function loadChars(){for(const n of['rowan','ivy']){CH[n]={walk:sheetFrames(await loadImg(DATA.chars[n].walk),32,48,3),run:sheetFrames(await loadImg(DATA.chars[n].run),32,48,3),face:cut(await loadImg(DATA.chars[n].port),0,0,96,96).toDataURL()}}
  for(const n in DATA.chars)if(n.startsWith('npc_'))CH[n]={walk:sheetFrames(await loadImg(DATA.chars[n].walk),32,48,3)};
  for(const n of['cole','wren','june']){CH[n]={walk:sheetFrames(await loadImg(DATA.chars[n].walk),32,48,3)};PORT[n]=await loadImg(DATA.chars[n].port)}}
async function followFrames(sp){if(!FOL[sp])FOL[sp]=sheetFrames(await loadImg(DATA.spr[sp].fo),32,32,2);return FOL[sp]}

/* ================= state ================= */
const KITH=DATA.kith,SAVE_KEY='wildbound_ch1_v1';
let G=null;
const newGame=pc=>({pc,party:[],box:[],bag:{orb:0,salve:0,clear:0},dex:{seen:{},caught:{}},flags:{},pos:{x:18,y:58,dir:0},tod:'am',snd:true,wins:0});
function save(){if(!G||!player)return false;G.pos={x:player.tx,y:player.ty,dir:player.dir};G.tod=tod;try{localStorage.setItem(SAVE_KEY,JSON.stringify(G));return true}catch(e){return false}}
function loadSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null}catch(e){return null}}
const lead=()=>G.party.find(k=>k.hp>0)||G.party[0];
const pcName=()=>G.pc==='ivy'?'Ivy':'Rowan';

/* ================= input ================= */
const keys={};let touchDir=-1,bDown=false;
const KD={ArrowDown:0,s:0,S:0,ArrowUp:1,w:1,W:1,ArrowLeft:2,a:2,A:2,ArrowRight:3,d:3,D:3};
let keyOrder=[];
const blocked=()=>!G||Battle.isOpen()||UI.isOpen()||titleOpen;
addEventListener('keydown',e=>{if(blocked())return;if(e.repeat)return;if(e.key in KD){keyOrder=keyOrder.filter(k=>k!==KD[e.key]);keyOrder.push(KD[e.key]);e.preventDefault()}
  if(['z','Z',' ','Enter'].includes(e.key)){pressA();e.preventDefault()}if(['x','X','Shift'].includes(e.key))bDown=true;if(e.key==='t'||e.key==='T')cycleTime();
  if(e.key==='m'||e.key==='M'||e.key==='Escape')openMenu()});
addEventListener('keyup',e=>{if(e.key in KD)keyOrder=keyOrder.filter(k=>k!==KD[e.key]);if(['x','X','Shift'].includes(e.key))bDown=false});
addEventListener('blur',()=>{keyOrder=[];bDown=false;touchDir=-1});
const inputDir=()=>blocked()?-1:touchDir>=0?touchDir:keyOrder.length?keyOrder[keyOrder.length-1]:-1;
const dp=$('dpad');
function dpadDir(e){const r=dp.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;if(Math.hypot(x,y)<10)return -1;return Math.abs(x)>Math.abs(y)?(x<0?2:3):(y<0?1:0)}
dp.addEventListener('pointerdown',e=>{dp.setPointerCapture(e.pointerId);touchDir=dpadDir(e);e.preventDefault()});
dp.addEventListener('pointermove',e=>{if(dp.hasPointerCapture(e.pointerId))touchDir=dpadDir(e)});
for(const ev of['pointerup','pointercancel','lostpointercapture'])dp.addEventListener(ev,()=>touchDir=-1);
const bA=$('btnA'),bB=$('btnB');
bA.addEventListener('pointerdown',e=>{bA.classList.add('on');pressA();e.preventDefault();e.stopPropagation()});
for(const ev of['pointerup','pointercancel','pointerleave'])bA.addEventListener(ev,()=>bA.classList.remove('on'));
bB.addEventListener('pointerdown',e=>{bB.setPointerCapture(e.pointerId);bB.classList.add('on');bDown=true;e.preventDefault()});
for(const ev of['pointerup','pointercancel','lostpointercapture'])bB.addEventListener(ev,()=>{bB.classList.remove('on');bDown=false});
$('timeBtn').addEventListener('click',()=>{if(!busy())cycleTime()});
$('menuBtn').addEventListener('click',()=>openMenu());
$('game').addEventListener('pointerdown',e=>{if(dlgOpen&&!e.target.closest('#topbtns'))pressA()});
function cycleTime(){tod=tod==='am'?'pm':tod==='pm'?'night':'am';buildSky();initParticles()}

/* ================= dialog ================= */
let dlgOpen=false,dlgQ=[],dlgCb=null,dlgTxt='',dlgI=0,dlgWho='',lastA=0;
const dlg=$('dlg'),dtx=dlg.querySelector('.tx'),dmore=dlg.querySelector('.more'),dnm=dlg.querySelector('.nm'),dpo=$('port'),dpx=dpo.getContext('2d');
const SPK={cole:'COLE',wren:'PROF. WREN',june:'JUNE'},EXP={happy:1,serious:2,surprised:3};
function talk(lines,who,cb){dlgQ=lines.slice();dlgCb=cb||null;dlgWho=who||'';dlgOpen=true;dlg.style.display='block';$('ctrl').classList.add('hide');nextLine()}
function nextLine(){if(!dlgQ.length){dlgOpen=false;dlg.style.display='none';$('ctrl').classList.remove('hide');const cb=dlgCb;dlgCb=null;cb&&cb();return}
  let t=dlgQ.shift(),ex=0;const m=/^\{(\w+)\}\s*/.exec(t);if(m){ex=EXP[m[1]]||0;t=t.slice(m[0].length)}
  dlgTxt=t;dlgI=0;dnm.textContent=SPK[dlgWho]||dlgWho;dtx.textContent='';dmore.style.display='none';
  if(PORT[dlgWho]){dlg.classList.add('hasPort');dpx.clearRect(0,0,96,96);dpx.drawImage(PORT[dlgWho],ex*96,0,96,96,0,0,96,96)}else dlg.classList.remove('hasPort')}
function pressA(){const n=performance.now();if(n-lastA<120)return;lastA=n;
  if(dlgOpen){if(dlgI<dlgTxt.length){dlgI=dlgTxt.length;dtx.textContent=dlgTxt;dmore.style.display='block'}else{Battle.sfx('sel');nextLine()}return}
  if(busy())return;interact()}
const tell=(who,lines)=>new Promise(r=>talk(lines,who,r));
const note=lines=>tell('',lines);
let scripting=false;
function busy(){return dlgOpen||scripting||blocked()}
const waiters=[];
const until=pred=>new Promise(r=>waiters.push({pred,r}));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function cutscene(fn){if(scripting)return;scripting=true;try{await fn()}finally{scripting=false}}
async function walk(a,dirs){a.queue.push(...dirs);await until(()=>!a.moving&&!a.queue.length)}
function face(a,b){const dx=b.tx-a.tx,dy=b.ty-a.ty;a.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?2:3):(dy<0?1:0)}
async function bubbleAt(n,ms=700){n.bubble=true;Battle.sfx('sel');await pause(ms);n.bubble=false}

/* ================= props ================= */
function tableSprite(){const b=new Buf(54,26),w=[176,128,84],d=[132,92,58];b.rect(1,6,52,13,w);b.rect(1,12,52,15,d);b.rect(1,6,52,7,shade(w,1.15));for(const x of[4,46]){b.rect(x,15,x+3,25,d)}
  b.rect(8,14,45,15,shade(d,.8));return b.outline([60,40,30]).canvas()}
function orbSprite(){const b=new Buf(9,9);b.ell(0,0,8,8,[232,220,192]);for(let y=0;y<4;y++)for(let x=0;x<9;x++)if(b.a(x,y))b.px(x,y,[47,167,160]);b.rect(0,4,8,4,[214,180,106]);b.rect(3,3,5,5,[30,32,48]);b.px(4,4,[246,220,147]);b.px(2,1,[150,230,224]);return b.outline([27,32,48]).canvas()}
function sensorSprite(){const b=new Buf(12,26),m=[120,132,150];b.rect(5,8,6,25,m);b.rect(3,23,8,25,shade(m,.7));b.rect(2,2,9,8,[214,180,106]);b.rect(3,3,8,7,[40,52,70]);b.rect(4,4,7,5,[90,230,210]);b.line(5,0,5,2,m);b.px(5,0,[255,120,90]);return b.outline([30,34,48]).canvas()}
const PROPS={};
const orbTiles={foxfern:44,kindlit:45,ottide:46};
function placeProps(){PROPS.table=addB({x:tc(45),y:61*T-3,img:tableSprite(),sh:.5});block(44,60,46,60);
  const os=orbSprite();PROPS.orbs={};for(const k in orbTiles)PROPS.orbs[k]=addB({x:tc(orbTiles[k]),y:61*T-2.9,img:os,sh:0,lift:17,hidden:false});
  PROPS.sensor=addB({x:tc(23),y:19*T+10,img:sensorSprite(),sh:.3,sc:1});PROPS.sensor.dead=true;block(23,18,23,18,0)}
const removeEnt=e=>{const i=ents.indexOf(e);if(i>=0)ents.splice(i,1)};

/* ================= encounters & battles ================= */
const TABLES={day:[['peeplet',35,2,4],['burrowbit',30,2,4],['silkling',20,2,3],['sparkit',15,3,4]],dusk:[['burrowbit',35,2,4],['silkling',30,2,4],['peeplet',25,2,4],['sparkit',10,3,4]]};
const TINT={am:null,pm:'rgb(255,214,170)',night:'rgb(120,134,205)'};
async function flashIn(){$('ctrl').classList.add('hide');const fl=$('flash');fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go');Battle.sfx('zap');await pause(880);setTimeout(()=>fl.classList.remove('go'),200)}
async function runBattle(o){await flashIn();const r=await Battle.start(Object.assign({party:G.party,bag:G.bag,dex:G.dex,resonance:!!G.flags.resonance,tint:TINT[tod],arena:'glade'},o));$('ctrl').classList.remove('hide');playArea({delay:.3,fadeIn:1});await refreshFollower();return r}
async function wildBattle(){await cutscene(async()=>{const tab=TABLES[tod==='am'?'day':'dusk'];let r=Math.random()*100,pick=tab[0];for(const t of tab){if(r<t[1]){pick=t;break}r-=t[1]}
    const foe=Battle.newKith(pick[0],pick[2]+Math.floor(Math.random()*(pick[3]-pick[2]+1)));
    const res=await runBattle({kind:'wild',foes:[foe]});await afterBattle(res)})}
async function afterBattle(res){
  if(res.result==='caught'){const k=res.caught;k.st=null;const K=KITH[k.sp],n=Battle.NAT[k.nat];
    if(G.party.length<6){G.party.push(k);await note([`${K.name} joined your team!`,`It has a ${n.name} nature and the ${k.trait} trait.`])}
    else{Battle.healKith(k);G.box.push(k);await note([`${K.name} accepted the bond!`,`Your team is full, so ${K.name} was sent to the Archive lab, where Professor Wren will look after it.`])}
    if(!G.flags.firstCatch){G.flags.firstCatch=1;await note(["Your first bond in the field. The Survey has recorded it.","Open the menu to see your team, your bag and the Survey."])}}
  if(res.result==='win'){G.wins++;for(const k of G.party)if(k.trait==='Gatherer'&&k.hp>0&&Math.random()<.12){G.bag.salve++;await note([`${KITH[k.sp].name} found a Mending Salve in the grass and brought it to you.`]);break}}
  if(res.result==='lose'){await whiteout();return}
  await checkEvos();save()}
async function checkEvos(){for(const k of G.party){const to=Battle.evoTarget(k);if(!to||k.hp<=0)continue;
    if(!DATA.spr[to]){if(!G.flags.twNote){G.flags.twNote=1;await note([`${KITH[k.sp].name} seems ready to change into something new…`,"…but its next form hasn't been drawn yet, so it will wait for a later build."])}continue}
    const from=k.sp,nm=KITH[from].name;await UI.evolve(from,to,nm);const learn=Battle.evolve(k,to);G.dex.seen[to]=G.dex.caught[to]=1;
    await note([`${nm} evolved into ${KITH[to].name}!`]);for(const mv of learn)await learnOutside(k,mv);await refreshFollower()}}
async function learnOutside(k,mv){const M=Battle.MV[mv],nm=KITH[k.sp].name;if(k.moves.length<4){k.moves.push({n:mv,pp:M.pp});await note([`${nm} learned ${mv}!`]);return}
  const opts=k.moves.map(s=>({label:'Forget '+s.n,sub:Battle.moveSub(Battle.MV[s.n])}));opts.push({label:'Keep the old moves',sub:"Don't learn "+mv});
  const i=await UI.choose({title:`${nm} wants to learn ${mv}`,html:`<div class="note"><b>${mv}</b> · ${Battle.moveSub(M)}</div>`,opts,cancel:false});
  if(i<4){const old=k.moves[i].n;k.moves[i]={n:mv,pp:M.pp};await note([`${nm} forgot ${old} and learned ${mv}!`])}}
function healAll(){for(const k of G.party)Battle.healKith(k)}
function warp(a,x,y,dir){a.tx=a.fx=x;a.ty=a.fy=y;a.t=1;a.moving=false;a.queue.length=0;if(dir!=null)a.dir=dir}
async function whiteout(){await UI.fade(true);healAll();warp(player,18,58,0);warp(follower,18,59,1);const j=npc('june');warp(j,17,60,3);setArea();await pause(400);await UI.fade(false);
  await tell('june',["{surprised} Easy, easy. Sit down, both of you.","{happy} There. A little rest and a lot of soup fixes most things.","Go on when you're ready. The trail isn't going anywhere."]);save()}
async function refreshFollower(){const k=lead();follower.frames=k?await followFrames(k.sp):null;follower.sp=k?k.sp:null}

/* ================= npcs ================= */
const npc=id=>npcs.find(n=>n.id===id);
function addNpc(o){const real=CH[o.ch];const n=actor(Object.assign({frames:real?real.walk:charFrames(PALS[o.pal]),sc:real?.68:1.5,sh:real?.42:.75},o));npcs.push(n);return n}
PALS.scout=Object.assign({},BASEPAL,{r:[214,150,60],R:[160,104,40],b:[96,140,84],B:[64,100,60],y:[240,230,200],h:[70,44,30],g:[150,110,70],p:[110,90,70],P:[80,64,50]});
PALS.mira=Object.assign({},BASEPAL,{r:[120,90,170],R:[84,60,130],w:[240,220,255],b:[236,200,90],B:[190,150,60],y:[255,255,255],h:[40,36,60],p:[90,70,120],P:[64,50,90],g:[236,200,90]});
function buildNpcs(){npcs.length=0;const f=G.flags;
  addNpc({id:'june',ch:'june',tx:17,ty:60,dir:3,talk:talkJune});
  addNpc({id:'maribel',ch:'npc_resident_f',tx:15,ty:65,dir:2,name:'MARIBEL',lines:()=>tod==='night'?["The fireflies come out over the pond at night.","Silkling love them. You'll find more of them in the grass after dark."]:["Isn't the pond lovely this time of day?","My sister says different Kith come out of the tall grass near dusk."]});
  addNpc({id:'elder',ch:'npc_elder_m',tx:38,ty:62,dir:0,name:'ELDER PIKE',lines:()=>G.party.length?["A partner at your side already. Good.","A Tether Orb opens the door. What happens after that is up to the two of you.","My old Thumpwarren and I never needed one, in the end."]:["Sixteen today, is it? Then Wren will be wanting you.","The big hall across the plaza. He's set up a table outside, the old fool."]});
  const w=addNpc({id:'wren',ch:'wren',tx:45,ty:59,dir:0,talk:talkWren});
  const c=addNpc({id:'cole',ch:'cole',tx:48,ty:61,dir:2,talk:talkCole});
  if(f.starter){c.hidden=true;for(const k in PROPS.orbs)PROPS.orbs[k].dead=true;if(!f.sensor)warp(w,24,19,2)}
  if(f.sensor)PROPS.sensor.dead=false;
  addNpc({id:'theo',ch:'npc_teen_m',tx:33,ty:32,dir:3,name:'SCOUT THEO',trainer:{name:'Scout Theo',skill:.6,team:[['burrowbit',3],['peeplet',3]],
    intro:["Hold it! You've got the look of somebody on their first day.","So have I. Let's find out which of us it shows on more!"],win:["Huh. It shows on me more.","Take this. You'll get more use out of it than I will."],lose:["Ha! Second day's going to be even better!"],gift:['salve',1],
    after:["I'm staying on Route 1 until Burrowbit stops digging up my lunch."]}});
  addNpc({id:'mira',ch:'npc_traveler_f',tx:29,ty:15,dir:2,name:'WANDERER MIRA',trainer:{name:'Wanderer Mira',skill:.75,team:[['silkling',4],['sparkit',4]],
    intro:["You walked right past that grey patch too, didn't you.","Everyone does. Battle me and I'll tell you what I think it is."],win:["I think it's a warning. That's all I've got. Sorry.","Here. For the road to Cindervale."],lose:["No answer for you, then. Come back stronger."],gift:['orb',2],
    after:["Cindervale's just past the trees. Their Gym leader works the mines between challengers."]}})}
async function talkJune(){const f=G.flags;
  if(!f.starter){await tell('june',["{happy} Still here? The lab's the big timbered hall across the plaza.","Go on. I'll be right here when you want to show me who you chose."]);return}
  if(!f.juneMet){f.juneMet=1;const K=KITH[G.party[0].sp];await tell('june',[`{surprised} Oh, look at you two. A ${K.name}!`,"{happy} Your father's going to want a picture. Hold still. …There.","Whenever your team's worn out, come home. I'll look after all of you."])}
  else await tell('june',["{happy} Back already? Sit a minute. Both of you."]);
  await UI.fade(true);healAll();Battle.sfx('heal');await pause(700);await UI.fade(false);await note(["Your Kith are rested and back to full health."]);save()}
async function talkCole(){await tell('cole',G.flags.intro?["{serious} Pick already. I've known which one I want since I was nine."]:["{happy} Took you long enough. The Professor won't start without you."])}
async function talkWren(){const f=G.flags;
  if(!f.intro){await wrenIntro();return}
  if(!f.starter){await tell('wren',["Take your time. Walk up to the table and have a look at each of them."]);return}
  if(!f.sensor){await sensorScene();return}
  await tell('wren',["{happy} The sensor's reading steadily. Thank you for that.","Let me see to your team while you're here."]);
  healAll();Battle.sfx('heal');await note(["Professor Wren tended to your Kith. They're back to full health."]);
  await tell('wren',["The curator in Cindervale is expecting the second sensor. No hurry, but don't lose it."])}
async function wrenIntro(){G.flags.intro=1;const c=npc('cole');
  await tell('wren',["{happy} Ah, the birthday arrival! Right on time, which is more than I can say for my notes.","You know what I do here. The Calder Archive is surveying every Kith in the Reach, and I can't walk all of it myself anymore.","So I'd like to sign you both on as Archive Field Assistants. The job comes with a partner.","These three were raised here at the lab. Cole insisted that you choose first.","{serious} Don't tell him I told you that."]);
  c.dir=1;await bubbleAt(c,500);await tell('cole',["{surprised} Professor!","{serious} …Just pick already. I've known which one I want since I was nine."]);c.dir=2;
  await tell('wren',["{happy} Walk up to the table and meet them. There's no wrong choice, only a different journey."])}
const STARTERS={foxfern:{beats:'ottide',loses:'kindlit'},kindlit:{beats:'foxfern',loses:'ottide'},ottide:{beats:'kindlit',loses:'foxfern'}};
async function orbLook(sp){if(!G.flags.intro){await talkWren();return}if(G.flags.starter)return;const K=KITH[sp];
  const i=await UI.choose({title:`${K.name} · the ${K.types[0]} Kith`,html:`<div class="card"><img src="${DATA.spr[sp].f}"><div><p>${K.concept}</p><p class="dim">${K.dex}</p></div></div>`,opts:[{label:`Choose ${K.name}`,sub:'This Kith will be your partner.'},{label:'Keep looking'}]});
  if(i!==0)return;await starterScene(sp)}
async function starterScene(sp){const K=KITH[sp],c=npc('cole'),w=npc('wren'),rival=STARTERS[sp].loses;
  const mine=Battle.newKith(sp,5);G.party=[mine];G.dex.seen[sp]=G.dex.caught[sp]=1;PROPS.orbs[sp].dead=true;await refreshFollower();warp(follower,player.tx,player.ty+1,1);Battle.sfx('win');
  await note([`You chose ${K.name}!`,`${K.name} has a ${Battle.NAT[mine.nat].name} nature and the ${mine.trait} trait.`]);
  await tell('wren',["{happy} A fine match. I had a feeling.","{serious} Remember, a Tether Orb only opens the door. The trust is yours to earn."]);
  await walk(c,[2]);c.dir=1;await pause(250);PROPS.orbs[rival].dead=true;Battle.sfx('sel');
  await tell('cole',[`{happy} Then ${KITH[rival].name}'s with me. We'll be faster than you two by lunch.`]);
  G.bag.orb+=5;G.bag.salve+=3;G.flags.starter=1;
  await tell('wren',["Take these: five Tether Orbs, some Mending Salve, and the Survey.","The Survey records every Kith you meet. Complete it, and you'll see more of the Reach than I ever did."]);
  await note(["You received 5 Tether Orbs and 3 Mending Salves.","You received the Survey."]);
  face(c,player);await bubbleAt(c,500);
  await tell('cole',["{serious} Hold on. We're not walking out of here without knowing where we stand.","{happy} One battle. Right now."]);
  const foe=Battle.newKith(rival,5,{pot:15,nat:0,moves:['Shove','Disarming Look']});
  const res=await runBattle({kind:'trainer',foes:[foe],trainer:{name:'Cole',img:DATA.chars.cole.battle,skill:.55,resonance:false}});
  G.flags.cole1=res.result==='win'?'win':'lose';
  if(res.result==='win'){G.wins++;await tell('cole',["{surprised} …Huh.","{serious} Fine. That one's yours. Enjoy it, because I'm not losing the next one."])}
  else await tell('cole',["{happy} That's one for me.","{serious} Keep up, would you? It's no fun winning alone."]);
  await tell('wren',["{happy} Well fought, both of you. Let me see to them."]);healAll();Battle.sfx('heal');
  await note(["Professor Wren tended to both teams."]);
  await tell('cole',["I'm going on ahead. First badge is in Cindervale, and it's got my name on it.","{happy} Don't take all day on Route 1."]);
  c.speed=6;await walk(c,[0,0,2,2,2,2,2,2]);c.hidden=true;
  await tell('wren',["{serious} One more thing. There's a patch of grass up on Route 1 that's been troubling me.","I'm heading there now. Come and find me on the trail when you're ready.","{happy} And go and show your mother. She's been pretending not to watch from the garden all morning."]);
  w.speed=5;await walk(w,[3,3,0,0,0,2,2,2]);warp(w,24,19,2);w.speed=4.2;await checkEvos();save()}
async function dadCall(){G.flags.dad=1;Battle.sfx('sel');await note(["Your phone is ringing. It's Dad."]);
  await tell('MARCUS · phone',["There's my kid! Sixteen. Your mother already sent a picture of you and that Kith.","I wanted to be there. The Foundry's got me pinned down. We're building the biggest thing the company's ever made.","Can't say more yet. But I'm proud of you. Go and see the Reach.","Call me from Cindervale."]);save()}
async function sensorScene(){const w=npc('wren');face(w,player);
  await tell('wren',["{happy} You made it. And in one piece.","{serious} Look at this. Grass doesn't go grey in spring. Nothing's eaten it and nothing's burned it. The colour has simply gone out of it.","The Wildvein runs under this whole valley. It's what makes the Reach so alive.","A patch like this means something is drawing on it. I'd like to know what."]);
  w.dir=2;await pause(400);PROPS.sensor.dead=false;block(23,18,23,18);Battle.sfx('clang');await pause(500);
  await note(["Professor Wren set a Wildvein sensor in the ground."]);face(w,player);
  await tell('wren',["That's the first. I mean to place one on every route in the Reach.","Take the second to our field station in Cindervale. The curator there is expecting you.","{happy} The first Gym is in Cindervale too, if you're so inclined. Cole certainly is."]);
  G.flags.sensor=1;await note(["You received a Wildvein Sensor."]);healAll();
  await tell('wren',["Your team looks tired. There. Off you go, Field Assistant."]);save()}
async function trainerBattle(n){const t=n.trainer;await bubbleAt(n);const d=n.dir,dist=Math.abs(player.tx-n.tx)+Math.abs(player.ty-n.ty);
  if(dist>1)await walk(n,Array(dist-1).fill(d));player.dir=OPP[n.dir];
  await tell(n.name,t.intro);const foes=t.team.map(([sp,L])=>Battle.newKith(sp,L,{pot:12}));
  const res=await runBattle({kind:'trainer',foes,trainer:{name:t.name,skill:t.skill}});
  if(res.result==='win'){G.wins++;G.flags['t_'+n.id]=1;await tell(n.name,t.win);if(t.gift){G.bag[t.gift[0]]+=t.gift[1];await note([`You received ${t.gift[1]>1?t.gift[1]+' ':'a '}${Battle.ITEMS[t.gift[0]].name}${t.gift[1]>1?'s':''}.`])}await checkEvos();save()}
  else{await tell(n.name,t.lose);await whiteout()}}

/* ================= interaction ================= */
function interact(){if(player.moving)return;const[dx,dy]=DV[player.dir],x=player.tx+dx,y=player.ty+dy;
  const n=actorAt(x,y);if(n){n.dir=OPP[player.dir];if(n.talk)cutscene(n.talk);else if(n.trainer&&G.flags['t_'+n.id])talk(n.trainer.after,n.name);else if(n.trainer)cutscene(()=>trainerBattle(n));else talk(n.lines(),n.name);return}
  if(y===60&&x>=44&&x<=46){const sp=Object.keys(orbTiles).find(k=>orbTiles[k]===x);if(G.flags.starter)talk(["The table is covered in Professor Wren's notes. None of them are in order."]);else cutscene(()=>orbLook(sp));return}
  if(x===23&&y===18&&G.flags.sensor){talk(["The Wildvein sensor hums quietly.","Its reading holds steady. For now."]);return}
  if(follower.frames&&follower.tx===x&&follower.ty===y){const k=lead(),K=KITH[k.sp];talk([`${K.name} looks up at you.`,k.hp<=0?"It's worn out and needs to rest.":`It's happy to be walking with you.`]);return}
  const k=inter[x+','+y];if(k){talk(k.lines,k.name);return}
  if(getT(x,y)===2)talk(inter.water.lines)}

/* ================= menu ================= */
const hpCol=f=>f>.5?'#5bd06a':f>.2?'#e0b040':'#e0503a';
function kithOpts(dis){return G.party.map(k=>{const s=Battle.calcStats(k);return{label:`${KITH[k.sp].name}${Battle.gsym(k)}  Lv ${k.L}`,sub:k.hp<=0?'Fainted':`HP ${k.hp} / ${s.hp}${k.st?' · '+(k.st==='brn'?'Burned':'Paralyzed'):''}`,icon:DATA.spr[k.sp].ic,hp:k.hp/s.hp,dis:dis?dis(k):false}})}
function kithCard(k){const K=KITH[k.sp],s=Battle.calcStats(k),n=Battle.NAT[k.nat],SN={hp:'HP',atk:'Attack',def:'Defense',spa:'Sp. Atk',spd:'Sp. Def',spe:'Speed'};
  const pot=Object.values(k.pot).reduce((a,b)=>a+b,0),pg=pot>150?'Outstanding':pot>120?'Great':pot>90?'Good':'Decent',a=Battle.xpAt(k.sp,k.L),b=Battle.xpAt(k.sp,k.L+1);
  return `<div class="card"><img src="${DATA.spr[k.sp].f}"><div><p><b>${K.name}${Battle.gsym(k)}</b> · Lv ${k.L}<br>${K.types.map(t=>`<span class="chip" style="background:${Battle.TC[t]}">${t}</span>`).join(' ')}</p>
   <p>${n.name} nature${n.up!==n.down?` <span class="dim">(+${SN[n.up]}, −${SN[n.down]})</span>`:' <span class="dim">(balanced)</span>'}<br>Potential: ${pg}<br>${b-k.xp} XP to next level</p></div></div>
   <div class="stats">${Object.keys(SN).map(x=>`<span>${SN[x]}<b>${x==='hp'?k.hp+' / '+s.hp:s[x]}</b></span>`).join('')}</div>
   <div class="note"><b>${k.trait}</b> · ${DATA.traits[k.trait]||''}</div>
   <div class="note">${k.moves.map(m=>{const M=Battle.MV[m.n];return `<b>${m.n}</b> <span class="dim">${Battle.moveSub(M)} · PP ${m.pp}/${M.pp}</span>`}).join('<br>')}</div>`}
async function partyMenu(){for(;;){if(!G.party.length){await UI.choose({title:'Your Kith',html:'<div class="note">You don\'t have a Kith yet.</div>',opts:[{label:'Back'}],cancel:false});return}
    const i=await UI.choose({title:'Your Kith',opts:kithOpts()});if(i<0)return;const k=G.party[i];
    const j=await UI.choose({title:KITH[k.sp].name,html:kithCard(k),opts:i>0?[{label:'Move to the front',sub:'The first Kith walks with you and enters battle first.'}]:[]});
    if(j===0&&i>0){G.party.splice(i,1);G.party.unshift(k);await refreshFollower()}}}
async function bagMenu(){for(;;){const ids=Object.keys(Battle.ITEMS).filter(id=>G.bag[id]>0);
    const key=G.flags.sensor?'<div class="note"><b>Wildvein Sensor</b> · For the Archive field station in Cindervale.</div>':'';
    if(!ids.length){await UI.choose({title:'Bag',html:'<div class="note">Nothing here yet.</div>'+key,opts:[]});return}
    const i=await UI.choose({title:'Bag',html:key,opts:ids.map(id=>({label:`${Battle.ITEMS[id].name}  ×${G.bag[id]}`,sub:Battle.ITEMS[id].desc,dis:id==='orb',ico:DATA.ui[id]}))});if(i<0)return;const id=ids[i];
    const ok=id==='salve'?k=>k.hp>0&&k.hp<Battle.calcStats(k).hp:k=>!!k.st&&k.hp>0;
    const j=await UI.choose({title:`Use ${Battle.ITEMS[id].name} on…`,opts:kithOpts(k=>!ok(k))});if(j<0)continue;const k=G.party[j];G.bag[id]--;
    if(id==='salve')k.hp=Math.min(Battle.calcStats(k).hp,k.hp+20);else k.st=null;Battle.sfx('heal')}}
async function surveyMenu(){const all=Object.keys(KITH).sort((a,b)=>KITH[a].no-KITH[b].no),seen=all.filter(k=>G.dex.seen[k]).length,got=all.filter(k=>G.dex.caught[k]).length;
  const rows=all.map(k=>{const K=KITH[k],s=G.dex.seen[k],c=G.dex.caught[k];return `<span class="${s?'':'dim'}">${String(K.no).padStart(2,'0')} ${s&&DATA.spr[k]?`<i class="ic" style="background-image:url(${DATA.spr[k].ic})"></i>`:'<i class="ic"></i>'}${s?K.name:'———'}${c?' <b>◆</b>':''}</span>`}).join('');
  await UI.choose({title:'The Survey',html:`<div class="note">Seen ${seen} · Bonded ${got} · of ${all.length} known near Hearthmoss</div><div class="dex">${rows}</div>`,opts:[]})}
async function openMenu(){if(busy()||player.moving)return;Battle.sfx('sel');
  for(;;){const i=await UI.choose({title:pcName()+' · Archive Field Assistant',opts:[{label:'Kith',sub:G.party.length?`${G.party.length} with you`+(G.box.length?` · ${G.box.length} at the lab`:''):'None yet'},{label:'Bag',sub:'Tether Orbs and supplies'},{label:'Survey',sub:'Every Kith you have met'},{label:'Save',sub:'Your progress also saves after battles'},{label:G.snd?'Sound: on':'Sound: off'},{label:'Quit to title'}]});
    if(i<0)return;if(i===0)await partyMenu();else if(i===1)await bagMenu();else if(i===2)await surveyMenu();
    else if(i===3){const ok=save();await UI.choose({title:ok?'Saved':'Could not save',html:`<div class="note">${ok?'Your progress is saved on this device.':'This browser is blocking storage, so progress will be lost when you close the page.'}</div>`,opts:[{label:'OK'}],cancel:false})}
    else if(i===4){G.snd=!G.snd;Battle.setSound(G.snd);playArea()}else if(i===5){save();Battle.stopMusic(.6);showTitle();return}}}

/* ================= world logic ================= */
let area='',stepsSince=5;
const areaSong=()=>player.ty<47?'route':'town';
function playArea(o){if(G&&G.snd&&!titleOpen)Battle.playMusic(areaSong(),o)}
function setArea(){const a=player.ty<47?'ROUTE 1':'HEARTHMOSS VILLAGE';playArea({fade:1.2,fadeIn:1.2});if(a!==area){area=a;const b=$('banner');b.textContent=a;b.classList.add('show');clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove('show'),2400)}}
function seenBy(n){if(n.hidden||!n.trainer||G.flags['t_'+n.id])return false;const[dx,dy]=DV[n.dir];for(let i=1;i<=4;i++){const x=n.tx+dx*i,y=n.ty+dy*i;if(x===player.tx&&y===player.ty)return true;const t=getT(x,y);if(t!==0&&t!==3)return false}return false}
function arrive(a){a.steps++;if(a!==player)return;setArea();stepsSince++;const f=G.flags;
  if(!f.starter&&player.ty<=49){cutscene(async()=>{await note(["The tall grass on Route 1 is no place to be without a Kith.","Professor Wren is expecting you at the lab, across the plaza."]);await walk(player,[0])});return}
  if(player.ty<=5){cutscene(async()=>{if(!f.sensor){await note(["Professor Wren is waiting somewhere back along the trail.","Better find him before leaving Route 1."])}
      else{f.done=1;save();const got=Object.keys(G.dex.caught).length;await UI.choose({title:'End of Chapter One',html:`<div class="note">The trail runs on toward <b>Cindervale City</b>, its mines and the first Gym.<br><br>That part of the Reach isn't built yet. Your save will carry over.<br><br>Kith bonded: ${got} · Battles won: ${G.wins}</div>`,opts:[{label:'Keep exploring'}],cancel:false})}
      await walk(player,[0])});return}
  const tr=npcs.find(seenBy);if(tr){cutscene(()=>trainerBattle(tr));return}
  if(f.starter&&!f.sensor&&player.tx>=25&&player.tx<=27&&player.ty>=17&&player.ty<=21){const w=npc('wren');if(w.tx===24){cutscene(async()=>{face(player,w);await bubbleAt(w,500);await sensorScene()});return}}
  if(f.juneMet&&!f.dad&&player.ty>=50&&player.ty<=55&&player.tx>=25&&player.tx<=35){cutscene(dadCall);return}
  if(getT(player.tx,player.ty)===3){spawnLeaves();if(G.party.some(k=>k.hp>0)&&stepsSince>3&&Math.random()<.14){stepsSince=0;wildBattle()}}}
function spawnLeaves(){const p=project(apos(player).x,tc(player.ty)+7);if(!p)return;for(let i=0;i<6;i++)leaves.push({x:p.sx+(Math.random()-.5)*14,y:p.sy-4,vx:(Math.random()-.5)*40,vy:-30-Math.random()*30,life:.6,c:Math.random()<.5?'#4f9a44':'#8cc864'})}
function step(a,dt){if(!a.moving)return;a.t+=dt*a.speed;if(a.t>=1){a.t=1;a.moving=false;arrive(a)}}
let turnT=0,held=false,last=performance.now();
function update(dt){
  player.speed=bDown&&!scripting?8:4.2;player.frames=CH[G.pc][bDown&&!scripting&&player.moving?'run':'walk'];
  if(!player.moving&&player.queue.length&&!dlgOpen){const d=player.queue.shift();const ox=player.tx,oy=player.ty;if(startMove(player,d))moveFollower(ox,oy);else player.dir=d}
  else if(!busy()&&!player.moving&&!player.queue.length){const d=inputDir();
    if(d>=0){if(d!==player.dir&&!held){player.dir=d;turnT=.09;held=true}else if(turnT<=0||held&&d!==player.dir&&player.steps>0){const ox=player.tx,oy=player.ty;player.dir=d;if(startMove(player,d)){moveFollower(ox,oy)}}}
    else held=false}
  if(inputDir()<0)held=false;
  turnT-=dt;
  step(player,dt);step(follower,dt);
  for(const n of npcs){if(!n.moving&&n.queue.length){const d=n.queue.shift();if(!startMove(n,d))n.dir=d}step(n,dt)}
  for(let i=waiters.length-1;i>=0;i--)if(waiters[i].pred()){const w=waiters[i];waiters.splice(i,1);w.r()}
  if(dlgOpen&&dlgI<dlgTxt.length){dlgI=Math.min(dlgTxt.length,dlgI+dt*60);dtx.textContent=dlgTxt.slice(0,dlgI|0);if(dlgI>=dlgTxt.length)dmore.style.display='block'}
  const pk=TIMES[tod].part.k;for(const q of particles){q.x+=(q.vx+Math.sin(performance.now()/1500+q.ph)*3)*dt;q.y+=q.vy*dt;if(q.y<-2)q.y=ih+2;if(q.y>ih+2)q.y=-2;if(q.x<-2)q.x=iw+2;if(q.x>iw+2)q.x=-2;if(pk==='fly'&&Math.random()<.01){q.vx=(Math.random()-.5)*6;q.vy=(Math.random()-.5)*6}}
  for(const l of leaves){l.x+=l.vx*dt;l.y+=l.vy*dt;l.vy+=120*dt;l.life-=dt}leaves=leaves.filter(l=>l.life>0);
}
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(Battle.isOpen())Battle.frame(now);else if(G&&player&&!titleOpen){update(dt);render(now)}
  requestAnimationFrame(loop)}

/* ================= title & boot ================= */
let titleOpen=true,worldBuilt=false;
function showTitle(){titleOpen=true;const s=loadSave();$('title').style.display='flex';$('tCont').style.display=s?'block':'none';
  if(s){const k=s.party[0];$('tCont').innerHTML=`CONTINUE<small>${s.pc==='ivy'?'Ivy':'Rowan'}${k?' · '+KITH[k.sp].name+' Lv '+k.L:''}</small>`}}
async function begin(state){G=state;Battle.setSound(G.snd);$('title').style.display='none';tod=G.tod||'am';buildSky();initParticles();
  for(const k in PROPS.orbs)PROPS.orbs[k].dead=false;PROPS.sensor.dead=true;block(23,18,23,18,G.flags.sensor?1:0);
  player=actor({tx:G.pos.x,ty:G.pos.y,dir:G.pos.dir,frames:CH[G.pc].walk,sc:.68,sh:.42});follower=actor({tx:G.pos.x,ty:G.pos.y+(G.pos.dir===0?-1:1),dir:1,sc:1});
  if(getT(follower.tx,follower.ty)!==0&&getT(follower.tx,follower.ty)!==3)warp(follower,player.tx,player.ty);
  buildNpcs();await refreshFollower();area='';titleOpen=false;setArea();await UI.fade(false);
  if(!G.flags.begun){G.flags.begun=1;cutscene(async()=>{const j=npc('june');warp(j,18,61,1);
      await note(["Hearthmoss Village, at the southern edge of the Calder Reach.","The morning of your sixteenth birthday."]);
      await walk(j,[1]);await tell('june',["{happy} There you are, birthday kid. Sixteen. I'm not ready, but nobody asked me.","Professor Wren sent word at dawn. He wants you at the lab, the big timbered hall across the plaza.","{serious} Cole's been pacing out front since sunrise, so don't keep either of them waiting.","{happy} Come back whenever you need a rest. I'll be in the garden, pretending not to worry."]);
      await walk(j,[2,0]);j.dir=3;await note([matchMedia('(pointer:coarse)').matches?"Move with the pad. Press A to talk and read. Hold B to run.":"Move with the arrow keys or WASD. Z or Space to talk and read. Hold X or Shift to run. M opens the menu."]);save()})}}
async function boot(){await Promise.all([Battle.load(),loadChars(),loadWorld()]);$('title').style.backgroundImage=`url(${DATA.ui.titleBg})`;$('tLogo').src=DATA.ui.logo;buildWorld();placeProps();paintGround();worldBuilt=true;
  resize();initParticles();addEventListener('resize',resize);$('loading').style.display='none';showTitle();
  $('tNew').onclick=async()=>{Battle.sfx('sel');if(loadSave()){const c=await UI.choose({title:'Start a new game?',html:'<div class="note">This replaces your saved game on this device.</div>',opts:[{label:'Start over'},{label:'Keep my save'}],cancel:false});if(c!==0)return}
    const pic=n=>CH[n].face;
    const i=await UI.choose({title:'Who are you?',opts:[{label:'Rowan',sub:'Sixteen today. Raised in Hearthmoss.',pic:pic('rowan')},{label:'Ivy',sub:'Sixteen today. Raised in Hearthmoss.',pic:pic('ivy')}],cancel:true});if(i<0)return;
    await UI.fade(true);begin(newGame(i?'ivy':'rowan'))};
  $('tCont').onclick=async()=>{const s=loadSave();if(!s)return;Battle.sfx('sel');await UI.fade(true);begin(s)};
  requestAnimationFrame(t=>{last=t;loop(t)})}
/* entities flagged dead are skipped by the renderer */
setTimeout(boot,30);
window.WB={wild:wildBattle,evos:checkEvos,menu:openMenu,get G(){return G},get player(){return player},get follower(){return follower},get npcs(){return npcs},warp,busy,getT,pressA,get dlg(){return dlgOpen?dlgTxt:null},get scripting(){return scripting},setTod:t=>{tod=t;buildSky();initParticles()}};
