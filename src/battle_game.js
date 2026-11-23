/* ================= Kith instances ================= */
const NAT=DATA.nat,TRAITS=DATA.traits,STN=['hp','atk','def','spa','spd','spe'];
const GROW={'Fast':n=>Math.floor(.8*n*n*n),'Medium':n=>n*n*n,'Medium-Slow':n=>Math.max(0,Math.floor(1.2*n*n*n-15*n*n+100*n-140))};
const xpAt=(sp,L)=>L<=1?0:GROW[KITH[sp].growth](L);
function calcStats(k){const b=KITH[k.sp].stats,n=NAT[k.nat],o={};
  STN.forEach((s,i)=>{const core=Math.floor((2*b[i]+k.pot[s]+Math.floor(k.cond[s]/4))*k.L/100);
    if(s==='hp')o.hp=core+k.L+10;else{let v=core+5;if(n.up!==n.down){if(n.up===s)v=Math.floor(v*1.1);if(n.down===s)v=Math.floor(v*.9)}o[s]=v}});
  return o}
const learnable=sp=>KITH[sp].learn.filter(([lv,m])=>MV[m]);
function movesAt(sp,L){const out=[];for(const[lv,m]of learnable(sp))if(lv>=1&&lv<=L&&!out.includes(m))out.push(m);return out.slice(-4).map(n=>({n,pp:MV[n].pp}))}
function newKith(sp,L,o={}){const K=KITH[sp],pot={},cond={};STN.forEach(s=>{pot[s]=o.pot!=null?o.pot:ri(0,31);cond[s]=0});
  const k={sp,L,xp:xpAt(sp,L),nat:o.nat!=null?o.nat:ri(0,NAT.length-1),pot,cond,gender:K.fem==null?null:(o.gender||(R()*100<K.fem?'F':'M')),
    trait:K.traits[ri(0,K.traits.length-1)],st:null,moves:o.moves?o.moves.map(n=>({n,pp:MV[n].pp})):movesAt(sp,L)};
  k.hp=calcStats(k).hp;return k}
const kname=k=>KITH[k.sp].name;
const gsym=k=>k.gender==='M'?' ♂':k.gender==='F'?' ♀':'';
function healKith(k){k.hp=calcStats(k).hp;k.st=null;for(const m of k.moves)m.pp=MV[m.n].pp}
/* level-ups: returns a list of events for the caller to narrate */
function addXp(k,amt){const ev=[];k.xp+=amt;
  while(k.L<100&&k.xp>=xpAt(k.sp,k.L+1)){const before=calcStats(k);k.L++;const after=calcStats(k);if(k.hp>0)k.hp+=after.hp-before.hp;
    const learn=learnable(k.sp).filter(([lv,m])=>lv===k.L&&!k.moves.some(x=>x.n===m)).map(x=>x[1]);ev.push({L:k.L,before,after,learn})}
  return ev}
function evoTarget(k){const e=KITH[k.sp].evo;if(!e||k.L<e.lv)return null;const to=e.to||e[k.gender];return to||null}
function evolve(k,to){const before=calcStats(k);k.sp=to;const after=calcStats(k);if(k.hp>0)k.hp+=after.hp-before.hp;
  if(!KITH[to].traits.includes(k.trait))k.trait=KITH[to].traits[ri(0,KITH[to].traits.length-1)];
  return learnable(to).filter(([lv,m])=>lv===0&&!k.moves.some(x=>x.n===m)).map(x=>x[1])}

/* ================= battle engine ================= */
let B=null,busy=false,over=false,resArmed=false,tint=null,isOpen=false;
const ITEMS={orb:{name:'Tether Orb',desc:'Offers a wild Kith a bond. Works best on a tired Kith.'},
  salve:{name:'Mending Salve',desc:'Restores 20 HP to one Kith.'},
  clear:{name:'Clearfruit',desc:'Cures a burn or paralysis.'}};
const say=async(html,ms=900)=>{$('msg').innerHTML=html;await wait(ms)};
const contact=mv=>mv.c==='P'&&mv.k!=='shot'&&mv.k!=='spike';
const effOf=(mv,types)=>mv.typeless?1:eff(mv.t,types);
function makeMon(inst,side){const K=KITH[inst.sp],s=calcStats(inst),p=anchor(side);
  return{inst,key:inst.sp,side,name:K.name,types:K.types,L:inst.L,max:s.hp,hp:inst.hp,stat:s,stg:{atk:0,def:0,spa:0,spd:0,spe:0},
    brn:inst.st==='brn',par:inst.st==='par',moves:inst.moves,res:side?B.resMe:B.resFoe,trait:inst.trait,
    sp:side?sprites[inst.sp].b:sprites[inst.sp].f,sp1:side?sprites[inst.sp].b:sprites[inst.sp].f,sp2:side?sprites[inst.sp].b2:sprites[inst.sp].f2,x:p.x,y:p.y,ox:0,oy:0,sy:1,sx:1,rot:0,alpha:0,flash:0,flashCol:'#fff',aura:0,ph:R()*9,sink:0}}
function plate(m){const el=$(m.side?'pMe':'pFoe');el.querySelector('.n').textContent=m.name+gsym(m.inst);
  el.querySelector('.lv').textContent=(!m.side&&B.kind==='wild'&&B.dex.caught[m.key]?'◆ ':'')+'Lv '+m.L;
  el.querySelector('.ty').innerHTML=m.types.map(t=>`<span class="chip" style="background:${TC[t]}">${t}</span>`).join('');upd(m)}
function upd(m){const el=$(m.side?'pMe':'pFoe'),f=clamp(m.hp/m.max,0,1),bar=el.querySelector('.hpb i');bar.style.width=(f*100)+'%';
  bar.style.background=f>.5?'linear-gradient(180deg,#8fe38b,#3fae4f)':f>.2?'linear-gradient(180deg,#f6dc93,#d6a84a)':'linear-gradient(180deg,#ff8a6a,#d6402a)';
  const n=el.querySelector('.hpn');if(n)n.textContent=Math.max(0,Math.ceil(m.hp))+' / '+m.max;
  const t=el.querySelector('.st');t.style.display=m.brn||m.par?'inline-block':'none';t.textContent=m.brn?'BRN':'PAR';t.style.background=m.brn?'#e8673a':'#d9a91a';
  el.querySelector('.stg').innerHTML=Object.entries(m.stg).filter(e=>e[1]).map(([s,v])=>`<span style="color:${v>0?'#9fe0a0':'#ff9a8a'}">${SN[s]} ${v>0?'+':''}${v}</span>`).join(' · ');
  m.inst.hp=Math.max(0,Math.ceil(m.hp));m.inst.st=m.brn?'brn':m.par?'par':null;
  if(m.side){const a=xpAt(m.key,m.L),b=xpAt(m.key,m.L+1);el.querySelector('.xpb i').style.width=clamp((m.inst.xp-a)/(b-a),0,1)*100+'%'}}
function calc(a,d,mv,res,forceCrit){const phys=mv.c==='P',as=phys?'atk':'spa',ds=phys?'def':'spd',cs=(mv.cr||0)+(res&&mv.rc||0),crit=forceCrit||R()<[1/24,1/8,1/2,1][Math.min(3,cs)],e=effOf(mv,d.types),stab=!mv.typeless&&a.types.includes(mv.t)?1.5:1;
  const A=crit&&a.stg[as]<0?a.stat[as]:stg(a,as),D=crit&&d.stg[ds]>0?d.stat[ds]:stg(d,ds);
  let tm=1;const tr=a.trait;
  if((tr==='Overgrowth'&&mv.t==='Bloom'||tr==='Kindling'&&mv.t==='Ember'||tr==='Undercurrent'&&mv.t==='Tide')&&a.hp<=a.max/3)tm*=1.5;
  if(tr==='Hard Claws'&&contact(mv))tm*=1.3;
  let dmg=Math.floor(Math.floor((2*a.L/5+2)*mv.p*A/D)/50)+2;
  dmg=Math.floor(dmg*(crit?1.5:1)*rf(.85,1)*stab*e*tm*(a.brn&&phys?.5:1)*(res?1.2:1));return{dmg:e?Math.max(1,dmg):0,crit,e}}
function expected(a,d,mv){if(!mv.p)return 0;const phys=mv.c==='P';return mv.p*stg(a,phys?'atk':'spa')/stg(d,phys?'def':'spd')*(a.types.includes(mv.t)?1.5:1)*effOf(mv,d.types)*(mv.a||100)/100*(mv.multi?3:1)*(a.brn&&phys?.5:1)}
const STRUGGLE={n:'Struggle',pp:1};
function aiPick(a,d,skill=1){const opts=a.moves.filter(m=>m.pp>0);if(!opts.length)return{o:STRUGGLE,res:false};
  let best=opts[0],bs=-1;
  if(R()>skill)best=opts[ri(0,opts.length-1)];
  else for(const o of opts){const mv=MV[o.n];let s=expected(a,d,mv);const kill=s*.42*a.L/50>=d.hp;if(mv.heal)s=a.hp/a.max<.42?400:0;
    if(mv.c==='X'&&!mv.heal){if(mv.inflict)s=d.brn||d.par?0:rf(40,120);else{const boosted=mv.st.some(([w,st,n])=>w==='self'?a.stg[st]>=2:d.stg[st]<=-2);s=boosted?0:(a.hp/a.max>.6?rf(30,110):rf(0,50))}}
    if(mv.pr&&kill)s+=500;s*=rf(.85,1.15);if(s>bs){bs=s;best=o}}
  const mv=MV[best.n],res=a.res&&(mv.p?(d.hp/d.max<.6||a.hp/a.max<.5):a.hp/a.max<.5)&&R()<.7;return{o:best,res}}
async function applyStat(m,st,n,quiet){const before=m.stg[st];m.stg[st]=clamp(before+n,-6,6);if(m.stg[st]===before){await say(`${m.name}'s ${SN[st]} won't go any ${n>0?'higher':'lower'}!`,700);return}upd(m);
  if(!quiet){const c=ctr(m),col=n>0?'#9fe0a0':'#ff9a8a';for(let i=0;i<12;i++)P({k:'px',x:m.x+rf(-1,1)*PX*22,y:c.y+(n>0?PX*20:-PX*20),vy:(n>0?-.14:.14)*PX,col,size:PX*.8,life:520});(n>0?S.buff:S.debuff)()}
  await say(`${m.name}'s ${SN[st]} ${n>0?'rose':'fell'}${Math.abs(n)>1?' sharply':''}!`,800)}
async function damage(m,dmg,o={}){m.hp=Math.max(0,m.hp-dmg);upd(m);const c=ctr(m);if(dmg>0)dmgText(c.x+rf(-1,1)*PX*8,c.y-PX*24,String(dmg),o.crit?'#ffd75a':o.e>1?'#ff9a6a':'#fff',o.crit||dmg>m.max*.4);
  m.flash=1;m.flashCol='#fff';tween(m,{flash:0},260);const dir=m.side?-1:1;m.ox=dir*PX*(o.big?10:6);tween(m,{ox:0},320,E.out);shake(o.big?8:o.crit?7:3.5);S.hit(o.big||o.crit);if(o.crit)S.crit()}
async function faint(m){S.faint();await say(`${m.side?'':B.kind==='wild'?'The wild ':B.trainer.name+"'s "}${m.name} fainted!`,300);m.flash=.6;m.flashCol='#fff';tween(m,{flash:0},500);tween(m,{sink:1,alpha:0},900,E.in);
  for(let i=0;i<20;i++)setTimeout(()=>P({k:'px',x:m.x+rf(-1,1)*PX*28,y:m.y-PX*rf(0,40),vy:-.08*PX,col:'#fff',size:PX*.7,life:800,fade:1}),i*30);await wait(1000);$(m.side?'pMe':'pFoe').classList.add('hide')}
async function resonate(a,mv,name){a.res=false;if(a.side)B.resMe=false;else B.resFoe=false;S.res();$('bars').classList.add('on');a.auraImg=auraImg(a,'#f6dc93');const c=ctr(a),z=1.16;tween(cam,{dim:.6,z,x:(c.x-W/2)*.5,y:(c.y-H/2)*.4},450,E.io);tween(a,{aura:1},400);const rc=$('resCard');rc.querySelector('b').textContent=name;rc.classList.add('on');
  const iv=setInterval(()=>{for(let i=0;i<3;i++)P({k:'px',x:a.x+rf(-1,1)*PX*30,y:a.y-PX*rf(0,10),vy:-rf(.12,.3)*PX,col:R()<.6?'#f6dc93':'#fff',size:PX*rf(.5,1.2),life:rf(500,900)});if(R()<.2)ring(a.x,a.y,'#f6dc93',{flat:.3,r0:PX*50,r1:PX*6,ms:420,w:1.5})},20);light(a.x,a.y,PX*110,'#f6dc93',1.2,1300);
  tscale=.6;await wait(780);tscale=1;clearInterval(iv);rc.classList.remove('on');cam.flash=.5;ring(c.x,c.y,'#fff',{r1:PX*120,ms:500,w:3});tween(cam,{dim:.18,z:1.04,x:0,y:0},300);await wait(120)}
async function endRes(a){$('bars').classList.remove('on');tween(a,{aura:0},400);tween(cam,{dim:0,z:1},400)}
async function inflict(d,kind,quietFail){if(d.brn||d.par||d.hp<=0){if(!quietFail)await say('But it failed!',700);return}
  if(kind==='brn'){if(d.types.includes('Ember')){if(!quietFail)await say(`It doesn't affect ${d.name}…`,700);return}d.brn=true;upd(d);const c=ctr(d);burst(c.x,c.y,12,PAL.Ember,{sp:.3,up:.2});S.fire();await say(`${d.name} was burned!`,800)}
  else{if(d.types.includes('Volt')){if(!quietFail)await say(`It doesn't affect ${d.name}…`,700);return}d.par=true;upd(d);const c=ctr(d);burst(c.x,c.y,14,PAL.Volt,{sp:.5});S.zap();d.flash=.7;d.flashCol='#ffe066';tween(d,{flash:0},500);await say(`${d.name} is paralyzed! It may be unable to move.`,900)}}
async function useMove(a,d,slot,res){const mv=MV[slot.n];
  if(a.par&&R()<.25){const c=ctr(a);burst(c.x,c.y,12,PAL.Volt,{sp:.5});S.zap();a.flash=.7;a.flashCol='#ffe066';tween(a,{flash:0},500);await say(`${a.name} is paralyzed! It can't move!`,900);return}
  if(slot!==STRUGGLE)slot.pp--;
  if(res&&a.res){await say(`${a.name} and ${a.side?'you':'its trainer'} <b>resonate</b>!`,200);await resonate(a,mv,slot.n)}else res=false;
  await say(`${a.side?'':B.kind==='wild'?'The wild ':"The foe's "}${a.name} used <b>${slot.n}</b>!`,380);
  const acc=(mv.a||100)*(a.trait==='Sharp Eyes'?1.3:1),miss=mv.c!=='X'&&!res&&R()*100>=acc||(mv.k==='debuff'&&!res&&R()*100>=acc);
  const camT=mv.c==='X'&&mv.k!=='debuff'?a:d;tween(cam,{x:(camT.x-W/2)*.07,y:0,z:Math.max(cam.z,1.03)},300,E.io);
  if(mv.c==='X'){await ANIM[mv.k](a,d,mv);if(miss)await say(`${d.name} shrugged it off!`,700);else{
      if(mv.heal){const amt=Math.floor(a.max*(res?.66:mv.heal)),was=a.hp;a.hp=Math.min(a.max,a.hp+amt);upd(a);dmgText(ctr(a).x,ctr(a).y-PX*24,'+'+(a.hp-was),'#9fe0a0');await say(a.hp>was?`${a.name} recovered HP!`:`${a.name}'s HP is already full!`,800)}
      if(mv.inflict)await inflict(d,mv.inflict);
      for(const[w,st,n] of (mv.st||[]).concat(res&&mv.rs||[]))await applyStat(w==='self'?a:d,st,n,true)}}
  else if(miss){await lunge(a,d,.3,140);d.ox=(d.side?-1:1)*PX*10;tween(d,{ox:0},400);await back(a);await say(`${a.name}'s attack missed!`,700)}
  else{let hits=mv.multi?(res?5:[2,2,2,3,3,3,4,5][ri(0,7)]):1;const rs=[];let total=0,any=null;for(let i=0;i<hits;i++)rs.push(calc(a,d,mv,res,res&&mv.rc===9));
    let done=0;await ANIM[mv.k](a,d,mv,hits,i=>{if(d.hp<=0)return;const r=rs[i];any=r;total+=r.dmg;done++;damage(d,r.dmg,{crit:r.crit,e:r.e,big:mv.p>=100||res})});
    const r=any||rs[0];if(r.e===0)await say(`It doesn't affect ${d.name}…`,800);else{if(rs.some(x=>x.crit))await say('A critical hit!',600);if(r.e>1)await say("It's super effective!",650);else if(r.e<1)await say("It's not very effective…",650);if(hits>1)await say(`Hit ${done} times!`,600)}
    if(d.hp>0&&r.e){if(mv.brn&&(res||R()*100<mv.brn))await inflict(d,'brn',true);if(mv.par&&(res||R()*100<mv.par))await inflict(d,'par',true);
      for(const[w,st,n,ch] of mv.st||[])if(w==='foe'&&(res||R()*100<ch))await applyStat(d,st,n)}
    if(r.e&&a.hp>0&&d.trait==='Static Fur'&&contact(mv)&&!a.par&&!a.brn&&R()<.3){await say(`${d.name}'s Static Fur crackles!`,500);await inflict(a,'par',true)}
    if(r.e){for(const[w,st,n,ch] of mv.st||[])if(w==='self'&&a.hp>0&&(res||R()*100<ch))await applyStat(a,st,n);if(res)for(const[w,st,n] of mv.rs||[]){const t=w==='self'?a:d;if(t.hp>0)await applyStat(t,st,n)}}
    if(mv.dr&&total>0&&a.hp<a.max){const h=Math.max(1,Math.floor(total*(res?1:mv.dr))),was=a.hp;a.hp=Math.min(a.max,a.hp+h);upd(a);dmgText(ctr(a).x,ctr(a).y-PX*24,'+'+(a.hp-was),'#9fe0a0');await say(`${a.name} drained energy!`,650)}
    if(mv.rec&&!res&&total>0&&a.hp>0){const rc=Math.max(1,Math.floor(total*mv.rec));await damage(a,rc,{});await say(`${a.name} was hurt by recoil!`,700)}}
  if(res)await endRes(a);tween(cam,{x:0,y:0,z:1},400,E.io)}

/* ---------- entering, leaving, experience ---------- */
async function sendOut(side,inst,first){const m=makeMon(inst,side);mons[side?1:0]=m;if(side)B.me=m;else B.foe=m;plate(m);
  if(side)B.part.add(inst);else{B.part=new Set(B.me&&B.me.hp>0?[B.me.inst]:[]);B.dex.seen[inst.sp]=1}
  const c=ctr(m);cam.flash=.2;ring(m.x,m.y,'#fff',{flat:.3,r1:PX*60});burst(c.x,c.y,18,['#fff','#f6dc93'],{sp:.6});pixels(c.x,c.y,14,['#fff'],{sp:.7});S.buff();
  m.alpha=1;m.sy=.6;m.flash=1;tween(m,{flash:0},400);tween(m,{sy:1},350,E.back);$(side?'pMe':'pFoe').classList.remove('hide');
  await say(side?`Go, <b>${m.name}</b>!`:B.kind==='wild'?`A wild <b>${m.name}</b> appeared!`:`${B.trainer.name} sent out <b>${m.name}</b>!`,first?900:750);
  if(m.trait==='Opening Gambit'&&!inst._og){inst._og=1;await applyStat(m,'spe',1)}
  return m}
async function recall(m){await say(`${m.name}, come back!`,300);tween(m,{alpha:0,sy:.6},260);await wait(320);$('pMe').classList.add('hide')}
async function teach(k,mvName,mon){const nm=kname(k);
  if(k.moves.length<4){k.moves.push({n:mvName,pp:MV[mvName].pp});S.heal();await say(`${nm} learned <b>${mvName}</b>!`,1300);return}
  await say(`${nm} wants to learn <b>${mvName}</b>, but it already knows four moves.`,1500);
  const mv=MV[mvName],opts=k.moves.map(s=>({label:'Forget '+s.n,sub:moveSub(MV[s.n])}));opts.push({label:'Keep the old moves',sub:`Don't learn ${mvName}`});
  const i=await UI.choose({title:`Teach ${mvName}?`,html:`<div class="note"><b>${mvName}</b> · ${moveSub(mv)}${B.resOn?'<br>With Resonance: '+mv.res:''}</div>`,opts,cancel:false});
  if(i<4){const old=k.moves[i].n;k.moves[i]={n:mvName,pp:mv.pp};S.heal();await say(`${nm} forgot ${old} and learned <b>${mvName}</b>!`,1400)}else await say(`${nm} did not learn ${mvName}.`,900)}
const moveSub=mv=>`${mv.t} · ${mv.c==='P'?'Physical':mv.c==='S'?'Special':'Status'}${mv.p?' · Power '+mv.p:''}`;
async function award(foe){const K=KITH[foe.key],list=[...B.part].filter(k=>k.hp>0);if(!list.length)return;
  const each=Math.max(1,Math.floor(K.xp*foe.L/7*(B.kind==='trainer'?1.5:1)/list.length));
  for(const k of list){for(const s in K.yield){const tot=STN.reduce((a,x)=>a+k.cond[x],0);k.cond[s]=Math.min(252,k.cond[s]+Math.min(K.yield[s],510-tot))}
    const act=B.me&&B.me.inst===k?B.me:null;await say(`${kname(k)} gained ${each} XP.`,700);
    const evs=addXp(k,each);if(act){upd(act)}
    for(const ev of evs){if(act){act.L=ev.L;act.stat=ev.after;const up=ev.after.hp-ev.before.hp;act.max=ev.after.hp;act.hp=Math.min(act.max,act.hp+up);plate(act);
        const c=ctr(act);ring(act.x,act.y,'#f6dc93',{flat:.3,r1:PX*70});burst(c.x,c.y,16,['#fff','#f6dc93'],{sp:.5,up:.1});act.flash=.6;act.flashCol='#f6dc93';tween(act,{flash:0},500)}
      S.win();await say(`<b>${kname(k)}</b> grew to Lv ${ev.L}!`,1300);
      for(const mv of ev.learn)await teach(k,mv,act)}
    if(act)upd(act)}}

/* ---------- menus ---------- */
function menu(){const me=B.me,foe=B.foe,el=$('moves');el.innerHTML='';const usable=me.moves.some(s=>s.pp>0);
  me.moves.forEach((s,i)=>{const mv=MV[s.n],e=mv.p?effOf(mv,foe.types):1,b=document.createElement('button');b.className='mv'+(e>1?' se':e<1?' nve':'');b.style.setProperty('--c',TC[mv.t]);b.disabled=s.pp<=0;
    b.innerHTML=`${s.n}<small><span>${mv.t} · ${mv.c==='P'?'Phys':mv.c==='S'?'Spec':'Status'}${mv.p?' · '+mv.p:''}</span><span>PP ${s.pp}</span></small>`;
    b.onmouseenter=b.onfocus=()=>{if(B.resOn)$('resTxt').textContent=(resArmed?'Resonance bonus: ':'With Resonance: ')+mv.res};b.onclick=()=>{audio();S.sel();act({t:'move',slot:s})};el.appendChild(b)});
  if(!usable){const b=document.createElement('button');b.className='mv';b.style.setProperty('--c','#b8a48c');b.innerHTML='Struggle<small><span>No PP left</span><span></span></small>';b.onclick=()=>act({t:'move',slot:STRUGGLE});el.appendChild(b)}
  $('resBtn').style.display=B.resOn?'':'none';$('resTxt').style.display=B.resOn?'':'none';$('resBtn').disabled=!me.res;$('resBtn').textContent=me.res?'RESONANCE':'USED';$('resBtn').classList.remove('on');
  $('resTxt').textContent=me.res?'Resonance, once per battle: your next move hits 20% harder and gains its bonus effect.':'Resonance has been used this battle.';
  $('aRun').disabled=B.kind!=='wild';$('msg').innerHTML=`What will <b>${me.name}</b> do?`}
function partyOpts(filter){return B.party.map(k=>{const s=calcStats(k);return{label:`${kname(k)}${gsym(k)}  Lv ${k.L}`,sub:k.hp<=0?'Fainted':`HP ${k.hp} / ${s.hp}${k.st?' · '+(k.st==='brn'?'Burned':'Paralyzed'):''}${B.me&&B.me.inst===k&&B.me.hp>0?' · In battle':''}`,icon:DATA.spr[k.sp].ic,hp:k.hp/s.hp,dis:!filter(k)}})}
async function pickSwitch(forced){const i=await UI.choose({title:forced?'Choose your next Kith':'Switch to which Kith?',opts:partyOpts(k=>k.hp>0&&!(B.me&&B.me.inst===k&&B.me.hp>0)),cancel:!forced});return i}
async function bagMenu(){const ids=Object.keys(ITEMS).filter(id=>B.bag[id]>0);if(!ids.length){await UI.choose({title:'Bag',html:'<div class="note">Your bag is empty.</div>',opts:[{label:'Back'}]});return null}
  const i=await UI.choose({title:'Bag',opts:ids.map(id=>({ico:DATA.ui[id],label:`${ITEMS[id].name}  ×${B.bag[id]}`,sub:id==='orb'&&B.kind!=='wild'?"You can't bond with another trainer's Kith.":ITEMS[id].desc,dis:id==='orb'&&B.kind!=='wild'}))});
  if(i<0)return null;const id=ids[i];if(id==='orb')return{t:'orb'};
  const ok=id==='salve'?k=>k.hp>0&&k.hp<calcStats(k).hp:k=>!!k.st&&k.hp>0;
  const j=await UI.choose({title:`Use ${ITEMS[id].name} on…`,opts:partyOpts(ok)});if(j<0)return null;return{t:'item',id,k:B.party[j]}}

/* ---------- the catch ---------- */
function orbFx(o){fxs.push({t0:clk,ms:1e9,front:true,get dead(){return o.dead},draw(c){if(o.dead||o.a<=0)return;const r=PX*5.5*o.s;c.save();c.translate(o.x,o.y);c.rotate(o.rot);c.globalAlpha=o.a;
    c.fillStyle='#1b2030';c.beginPath();c.arc(0,0,r+PX,0,TAU);c.fill();c.fillStyle='#e8dcc0';c.beginPath();c.arc(0,0,r,0,TAU);c.fill();
    c.fillStyle='#2fa7a0';c.beginPath();c.arc(0,0,r,Math.PI,TAU);c.fill();c.fillStyle='#d6b46a';c.fillRect(-r,-PX*.9,r*2,PX*1.8);
    c.fillStyle=o.glow?'#fff6c0':'#12131c';c.beginPath();c.arc(0,0,r*.34,0,TAU);c.fill();c.fillStyle='#d6b46a';c.beginPath();c.arc(0,0,r*.2,0,TAU);c.fill();c.restore();
    if(o.glow){c.globalCompositeOperation='lighter';c.globalAlpha=o.glow*.8;c.drawImage(glow('#f6dc93'),o.x-r*3,o.y-r*3,r*6,r*6)}}});return o}
async function throwOrb(){const me=B.me,foe=B.foe;B.bag.orb--;await say('You offered a <b>Tether Orb</b>!',300);
  const f=ctr(me),t=ctr(foe),o=orbFx({x:f.x,y:f.y,rot:0,a:1,s:1,glow:0,dead:false});S.whoosh();
  const p={k:0};tween(p,{k:1},520,E.lin);const iv=setInterval(()=>{o.x=lerp(f.x,t.x,p.k);o.y=lerp(f.y,t.y,p.k)-Math.sin(p.k*Math.PI)*PX*46;o.rot=p.k*TAU*2},16);await wait(540);clearInterval(iv);o.x=t.x;o.y=t.y;o.rot=0;
  cam.flash=.3;S.buff();ring(t.x,t.y,'#f6dc93',{r1:PX*50});for(let i=0;i<16;i++)P({k:'px',x:t.x+rf(-1,1)*PX*26,y:t.y+rf(-1,1)*PX*26,col:'#f6dc93',size:PX*.9,life:420,home:{x:t.x,y:t.y,f:.0012*PX}});
  foe.flash=1;foe.flashCol='#f6dc93';tween(foe,{alpha:0,sy:.3,sx:.3},300);await wait(320);$('pFoe').classList.add('hide');
  await tween(o,{y:foe.y-PX*5},320,E.in);S.rock();await tween(o,{y:foe.y-PX*12},130);await tween(o,{y:foe.y-PX*5},130,E.in);
  const K=KITH[foe.key],bonus=foe.brn||foe.par?1.5:1,a=Math.min(255,(3*foe.max-2*foe.hp)*K.catch*bonus/(3*foe.max)),b=a>=255?65536:65536/Math.pow(255/a,.1875);
  let shakes=0;for(let i=0;i<3;i++){if(R()*65536>=b)break;shakes++}const ok=shakes===3&&(a>=255||R()*65536<b);
  for(let i=0;i<shakes;i++){await wait(420);S.sel();o.glow=.6;tween(o,{glow:0},300);await tween(o,{rot:.45},110);await tween(o,{rot:-.45},180);await tween(o,{rot:0},110)}
  await wait(450);
  if(ok){o.glow=1;S.win();for(let i=0;i<22;i++)P({k:'px',x:o.x,y:o.y,vx:rf(-.25,.25)*PX,vy:rf(-.35,-.05)*PX,g:.0006*PX,col:R()<.5?'#f6dc93':'#fff',size:PX*rf(.6,1.2),life:rf(500,900)});ring(o.x,o.y,'#f6dc93',{r1:PX*46});
    await say(`<b>${foe.name}</b> accepted the bond!`,1500);tween(o,{a:0},300);await wait(320);o.dead=true;return true}
  o.dead=true;cam.flash=.25;S.hit();burst(o.x,o.y,14,['#fff','#f6dc93'],{sp:.6});foe.sx=1;foe.sy=.6;foe.alpha=1;foe.flash=1;foe.flashCol='#fff';tween(foe,{flash:0},400);tween(foe,{sy:1},300,E.back);$('pFoe').classList.remove('hide');
  await say([`${foe.name} shook the orb off!`,`So close! ${foe.name} wasn't ready.`,`Almost! ${foe.name} pulled free at the last second.`][Math.min(2,shakes)],1100);return false}

/* ---------- turn flow ---------- */
function setBusy(v){busy=v;$('app').classList.toggle('busy',v)}
async function finish(result,extra={}){over=true;setBusy(true);musicStop(.6);await wait(350);const app=$('app');app.classList.add('fade');await new Promise(r=>setTimeout(r,450));
  for(const k of B.party)delete k._og;isOpen=false;app.classList.remove('open','fade');$('tr').classList.remove('in');
  timers.length=0;tweens.length=0;fxs.length=0;parts.length=0;lights.length=0;tscale=1;const res=B.resolve;B=null;res(Object.assign({result},extra))}
/* returns true when the battle has ended */
async function settle(){const me=B.me,foe=B.foe;let foeDown=false,meDown=false;
  if(foe.hp<=0&&!foe.gone){foe.gone=true;foeDown=true;await faint(foe);await award(foe)}
  if(me.hp<=0&&!me.gone){me.gone=true;meDown=true;await faint(me)}
  if(!foeDown&&!meDown)return false;
  const next=B.foes.find(k=>k.hp>0),alive=B.party.some(k=>k.hp>0);
  if(foe.gone&&!next){if(B.kind==='trainer'){musicStop(.2);S.win();await say(`You defeated <b>${B.trainer.name}</b>!`,1300)}await finish('win');return true}
  if(me.gone&&!alive){await say('You have no Kith left that can battle…',1400);await finish('lose');return true}
  if(me.gone){const i=await pickSwitch(true);await sendOut(1,B.party[i])}
  if(foe.gone){await sendOut(0,next)}
  return 'swap'}
async function act(pa){if(busy||over||!B)return;setBusy(true);const fa=aiPick(B.foe,B.me,B.skill);
  const useRes=pa.t==='move'&&resArmed&&B.me.res;resArmed=false;$('resBtn').classList.remove('on');let acts=[];
  if(pa.t==='move'){acts=[{side:1,o:pa.slot,res:useRes},{side:0,o:fa.o,res:fa.res}];
    const pr=x=>{const m=x.side?B.me:B.foe,mv=MV[x.o.n];return(mv.pr||0)+(x.res&&m.res&&mv.rp||0)};
    acts.sort((x,y)=>pr(y)-pr(x)||spd(y.side?B.me:B.foe)-spd(x.side?B.me:B.foe)||R()-.5)}
  else{acts=[{side:0,o:fa.o,res:fa.res}];
    if(pa.t==='switch'){await recall(B.me);await sendOut(1,pa.k)}
    else if(pa.t==='item'){const k=pa.k,m=B.me.inst===k?B.me:null;B.bag[pa.id]--;
      if(pa.id==='salve'){const mx=calcStats(k).hp,was=k.hp;k.hp=Math.min(mx,k.hp+20);if(m){m.hp=k.hp;upd(m);dmgText(ctr(m).x,ctr(m).y-PX*24,'+'+(k.hp-was),'#9fe0a0')}S.heal();await say(`${kname(k)} recovered ${k.hp-was} HP.`,1000)}
      else{k.st=null;if(m){m.brn=m.par=false;upd(m)}S.heal();await say(`${kname(k)} was cured.`,1000)}}
    else if(pa.t==='orb'){if(await throwOrb()){upd(B.foe);B.dex.caught[B.foe.key]=1;await finish('caught',{caught:B.foe.inst});return}}
    else if(pa.t==='run'){const p=clamp(.55+(spd(B.me)-spd(B.foe))/Math.max(1,spd(B.foe))*.6,.35,1);if(R()<p){S.whoosh();await say('You got away safely.',900);await finish('run');return}await say("Couldn't get away!",900)}}
  let swapped=false;
  for(const x of acts){const a=x.side?B.me:B.foe,d=x.side?B.foe:B.me;if(a.hp<=0||d.hp<=0)continue;await useMove(a,d,x.o,x.res);const r=await settle();if(r===true)return;if(r){swapped=true;break}}
  if(!swapped){for(const m of[B.me,B.foe]){if(m.hp<=0)continue;
      if(m.brn){const c=ctr(m);burst(c.x,c.y,10,PAL.Ember,{sp:.3,up:.2});S.fire();await damage(m,Math.max(1,Math.floor(m.max/16)),{});await say(`${m.name} is hurt by its burn!`,700)}
      if(m.hp>0&&m.trait==='Molting'&&(m.brn||m.par)&&R()<.3){m.brn=m.par=false;upd(m);S.heal();await say(`${m.name} shed its ailment by Molting!`,900)}
      if(m.hp>0&&m.trait==='Accelerate'&&m.stg.spe<6){m.stg.spe++;upd(m);await say(`${m.name}'s Accelerate raised its Speed!`,700)}}
    if(await settle()===true)return}
  setBusy(false);menu()}

function start(o){return new Promise(async resolve=>{audio();
  musicStart(o.trainer?'trainer':'wild');
  B={kind:o.kind,party:o.party,foes:o.foes,trainer:o.trainer||null,bag:o.bag,dex:o.dex,skill:o.trainer?o.trainer.skill??1:.75,resOn:!!o.resonance,resMe:!!o.resonance,resFoe:!!(o.resonance&&o.trainer&&o.trainer.resonance),part:new Set(),resolve,me:null,foe:null};
  over=false;resArmed=false;isOpen=true;tint=o.tint||null;const app=$('app');app.classList.add('open');setBusy(true);
  $('bars').classList.remove('on');$('resCard').classList.remove('on');$('pFoe').classList.add('hide');$('pMe').classList.add('hide');$('moves').innerHTML='';$('msg').innerHTML='';
  timers.length=0;tweens.length=0;fxs.length=0;parts.length=0;lights.length=0;tscale=1;Object.assign(cam,{x:0,y:0,z:1,shake:0,dim:0,flash:0});mons=[null,null];
  resize();if((o.arena||'glade')!==arenaName||!arena)buildArena(o.arena||'glade');
  cam.z=1.12;cam.dim=.5;tween(cam,{z:1,dim:0},1100,E.io);
  const tr=$('tr');if(o.trainer){if(o.trainer.img){tr.src=o.trainer.img;tr.classList.add('in')}await say(`<b>${o.trainer.name}</b> wants to battle!`,1300);tr.classList.remove('in')}else await wait(350);
  await sendOut(0,B.foes.find(k=>k.hp>0),true);await sendOut(1,B.party.find(k=>k.hp>0),true);
  setBusy(false);menu()})}

$('resBtn').onclick=()=>{if(busy||!B||!B.me.res)return;resArmed=!resArmed;$('resBtn').classList.toggle('on',resArmed);S.sel();$('resTxt').textContent=resArmed?'Resonance is armed. Choose a move to unleash it.':'Resonance, once per battle: your next move hits 20% harder and gains its bonus effect.'};
$('aBag').onclick=async()=>{if(busy||over)return;S.sel();const a=await bagMenu();if(a)act(a)};
$('aKith').onclick=async()=>{if(busy||over)return;S.sel();const i=await pickSwitch(false);if(i>=0)act({t:'switch',k:B.party[i]})};
$('aRun').onclick=()=>{if(busy||over)return;S.sel();act({t:'run'})};
addEventListener('keydown',e=>{if(!isOpen||busy||over||UI.isOpen())return;const n='1234'.indexOf(e.key);if(n>=0){const b=$('moves').children[n];if(b&&!b.disabled)b.click()}
  else if(e.key==='r'||e.key==='R')$('resBtn').click();else if(e.key==='b'||e.key==='B')$('aBag').click();else if(e.key==='k'||e.key==='K')$('aKith').click()});
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(isOpen)resize()},120)});

const frameAnim=now=>{for(const m of mons)if(m&&m.sp2)m.sp=Math.floor(now/250)%2?m.sp2:m.sp1;frame(now)};

/* ================= battle music (synthesized, no audio files) ================= */
const SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const hz=(n,tr=0)=>{const m=/^([A-G])(#?)(\d)$/.exec(n);return 440*Math.pow(2,(SEMI[m[1]]+(m[2]?1:0)+(+m[3]+1)*12-69+tr)/12)};
const CH={Am:['A','C','E'],F:['F','A','C'],C:['C','E','G'],G:['G','B','D'],E:['E','G#','B']};
/* 16 bars: [chord, lead]. Lead is sixteen 16th-note steps; "." holds or rests. */
const SONG=[
 ['Am','A4 . C5 . E5 . A5 . G5 . E5 . C5 . E5 .'],['F','F5 . . E5 . . C5 . A4 . . C5 . . F5 .'],
 ['C','E5 . G5 . C6 . G5 . E5 . G5 . E5 . C5 .'],['G','D5 . . G5 . . B5 . D6 . . B5 . G5 . .'],
 ['Am','A5 . . . E5 . A5 . C6 . . . B5 . A5 .'],['F','F5 . A5 . C6 . A5 . F5 . . . G5 . A5 .'],
 ['E','G#5 . . . B5 . . . E6 . . . D6 . B5 .'],['E','E5 . G#5 . B5 . E6 . D6 . B5 . G#5 . B5 .'],
 ['F','C6 . . . A5 . F5 . A5 . . . C6 . . .'],['G','B5 . . . G5 . D5 . G5 . . . B5 . D6 .'],
 ['Am','C6 . B5 . A5 . E5 . A5 . . . E5 . A5 .'],['Am','C6 . . B5 . . A5 . E6 . . . . . . .'],
 ['F','F5 . A5 . C6 . F6 . E6 . C6 . A5 . C6 .'],['G','G5 . B5 . D6 . G6 . F6 . D6 . B5 . D6 .'],
 ['E','E6 . . . D6 . . . B5 . . . G#5 . . .'],['E','E5 . E5 E5 . E5 . E5 G#5 . B5 . E6 . . .']
].map(([c,l])=>{const t=l.split(' '),lead=[];t.forEach((n,i)=>{if(n==='.')return;let d=1;while(i+d<16&&t[i+d]==='.')d++;lead[i]=[n,Math.min(d,4)]});return{c,lead}});
let mus=null;
function mVoice(t,f,dur,vol,type){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.setValueAtTime(vol*.8,t+dur*.55);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g).connect(mus.g);o.start(t);o.stop(t+dur+.03)}
function mDrum(t,k){if(k==='k'){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g).connect(mus.g);o.start(t);o.stop(t+.18);return}
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),d=k==='s'?.13:.035;s.buffer=noiseB;f.type=k==='s'?'bandpass':'highpass';f.frequency.value=k==='s'?1900:7500;g.gain.setValueAtTime(k==='s'?.28:.08,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f).connect(g).connect(mus.g);s.start(t,R()*.5);s.stop(t+d+.02)}
function mStep(i,t){const bar=Math.floor(i/16)%SONG.length,s=i%16,B=SONG[bar],ch=CH[B.c],tr=mus.tr,st=mus.step,fill=(bar%8===7)&&s>=12;
  const L=B.lead[s];if(L)mVoice(t,hz(L[0],tr),st*L[1]*.95,.085,'square');
  if(s%2===0)mVoice(t,hz(ch[0]+(s%4===0?'2':'3'),tr),st*1.7,.2,'triangle');
  mVoice(t,hz(ch[[0,1,2,1][s%4]]+'4',tr),st*.9,.028,'square');
  if(s===0||s===8||s===10&&bar%2)mDrum(t,'k');if(s===4||s===12||fill)mDrum(t,'s');if(s%2===0)mDrum(t,'h')}
function mSched(){if(!mus||!AC)return;if(mus.next<AC.currentTime-.3)mus.next=AC.currentTime+.05;while(mus.next<AC.currentTime+.25){mStep(mus.i++,mus.next);mus.next+=mus.step}}
function musicStop(fade=.5){if(!mus)return;const m=mus;mus=null;clearInterval(m.iv);try{m.g.gain.cancelScheduledValues(AC.currentTime);m.g.gain.setValueAtTime(m.g.gain.value,AC.currentTime);m.g.gain.linearRampToValueAtTime(0,AC.currentTime+fade);setTimeout(()=>m.g.disconnect(),fade*1000+400)}catch(e){}}
function musicStart(kind){musicStop(0);audio();if(!AC||!sndOn)return;try{if(AC.state==='suspended')AC.resume();const g=AC.createGain();g.gain.setValueAtTime(0,AC.currentTime);g.gain.linearRampToValueAtTime(.42,AC.currentTime+.5);g.connect(AC.destination);
    const bpm=kind==='trainer'?164:148;mus={g,step:60/bpm/4,tr:kind==='trainer'?2:0,next:AC.currentTime+.1,i:0,iv:setInterval(mSched,60)};mSched()}catch(e){mus=null}}
addEventListener('pointerdown',()=>{if(AC&&AC.state==='suspended')AC.resume()});
