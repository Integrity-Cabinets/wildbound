const $=id=>document.getElementById('b_'+id), R=Math.random, rf=(a,b)=>a+R()*(b-a), ri=(a,b)=>Math.floor(rf(a,b+1)), clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, TAU=Math.PI*2;
const TC={Beast:'#B8A48C',Ember:'#E8673A',Tide:'#3E8ED8',Bloom:'#5DBB4C',Stone:'#A8865A',Brawl:'#C0453A',Fae:'#F3A6D8',Volt:'#F2C94C',Gale:'#9CC8EE',Swarm:'#9DB83A',Metal:'#8C98A8',Mind:'#EE6FA8',Shade:'#5B4E8C'};
const PAL={Beast:['#fff','#e8dcc6','#b8a48c'],Ember:['#fff3c4','#ffb347','#e8472a'],Tide:['#eafcff','#7fd0ff','#2f7fd8'],Bloom:['#f2ffd0','#8fe36a','#3d9c3a'],Stone:['#f3e6cc','#c9a877','#7a5c3c'],Brawl:['#fff','#ff9a7a','#c0453a'],Fae:['#fff','#ffd3f0','#f08ad0'],Volt:['#fffbe0','#ffe066','#f2b51c'],Gale:['#ffffff','#d4ecff','#86b8e6'],Swarm:['#f4ffd0','#c6e05a','#7d9a22'],Metal:['#ffffff','#d6dde6','#7d8a9c'],Mind:['#fff','#ffc0dc','#e0559a'],Shade:['#e6dcff','#9a86d8','#4a3c7c']};
/* ---------- moves ---------- */
const MV={
 'Quick Pounce':{t:'Beast',c:'P',p:40,a:100,pp:30,pr:1,k:'dash',res:'Also raises your Speed.',rs:[['self','spe',1,100]]},
 'Gnaw':{t:'Beast',c:'P',p:60,a:100,pp:25,k:'bite',st:[['foe','def',-1,20]],res:'Always lowers Defense.'},
 'Disarming Look':{t:'Beast',c:'X',a:100,pp:30,k:'debuff',st:[['foe','atk',-1,100]],res:'Also lowers Sp. Atk.',rs:[['foe','spa',-1,100]]},
 'Leaf Flick':{t:'Bloom',c:'P',p:40,a:100,pp:25,k:'slash',res:'High critical-hit ratio.',rc:1},
 'Sap Drain':{t:'Bloom',c:'S',p:50,a:100,pp:15,k:'drain',dr:.5,res:'Drains all damage dealt.'},
 'Lash Vine':{t:'Bloom',c:'P',p:55,a:100,pp:25,k:'slash',res:"Lowers the target's Speed.",rs:[['foe','spe',-1,100]]},
 'Leaf Blades':{t:'Bloom',c:'P',p:90,a:100,pp:15,k:'slash',cr:1,big:1,res:'Always a critical hit.',rc:9},
 'Petal Squall':{t:'Bloom',c:'S',p:90,a:100,pp:10,k:'squall',res:"Lowers the target's Sp. Def.",rs:[['foe','spd',-1,100]]},
 'Sun Bask':{t:'Bloom',c:'X',pp:10,k:'heal',heal:.5,res:'Heals 66% instead.'},
 'Lunar Burst':{t:'Fae',c:'S',p:95,a:100,pp:15,k:'lunar',st:[['foe','spa',-1,30]],res:'Always lowers Sp. Atk.'},
 'Cinder':{t:'Ember',c:'S',p:40,a:100,pp:25,k:'shot',brn:10,res:'Always burns.'},
 'Searing Bite':{t:'Ember',c:'P',p:65,a:95,pp:15,k:'bite',brn:10,res:'Always burns.'},
 'Firewheel':{t:'Ember',c:'P',p:60,a:100,pp:20,k:'wheel',st:[['self','spe',1,100]],res:'Raises Speed by 2.',rs:[['self','spe',1,100]]},
 'Ember Heel':{t:'Ember',c:'P',p:85,a:90,pp:10,k:'slash',cr:1,brn:10,big:1,res:'Cannot miss.'},
 'Flare Charge':{t:'Ember',c:'P',p:120,a:100,pp:15,k:'flare',rec:.33,brn:10,res:'No recoil.'},
 'Magma Slam':{t:'Ember',c:'P',p:100,a:90,pp:10,k:'slam',st:[['foe','def',-1,20]],res:'Always lowers Defense.'},
 'Pebble Toss':{t:'Stone',c:'P',p:40,a:100,pp:25,k:'shot',res:"Lowers the target's Speed.",rs:[['foe','spe',-1,100]]},
 'Granite Fist':{t:'Stone',c:'P',p:75,a:100,pp:15,k:'punch',st:[['foe','def',-1,20]],res:'Always lowers Defense.'},
 'Crag Spike':{t:'Stone',c:'P',p:100,a:80,pp:5,k:'spike',cr:1,res:'Cannot miss.'},
 'Fortify':{t:'Stone',c:'X',pp:20,k:'buff',st:[['self','def',2,100]],res:'Also raises Sp. Def.',rs:[['self','spd',1,100]]},
 'Spritz':{t:'Tide',c:'S',p:40,a:100,pp:25,k:'shot',res:'Strikes first.',rp:1},
 'Riptide Jab':{t:'Tide',c:'P',p:40,a:100,pp:20,pr:1,k:'dash',res:'Raises your Attack.',rs:[['self','atk',1,100]]},
 'Rapid Current':{t:'Tide',c:'P',p:25,a:100,pp:20,k:'dash',multi:1,res:'Always hits 5 times.'},
 'Torrent Fang':{t:'Tide',c:'P',p:75,a:100,pp:15,k:'bite',st:[['foe','def',-1,10]],res:'Always lowers Defense.'},
 'Aqua Lance':{t:'Tide',c:'P',p:90,a:100,pp:15,k:'lance',cr:1,res:'Always a critical hit.',rc:9},
 'Breaker':{t:'Tide',c:'P',p:120,a:100,pp:10,k:'wave',rec:.33,res:'No recoil.'},
 'Siphon Fist':{t:'Brawl',c:'P',p:75,a:100,pp:10,k:'punch',dr:.5,res:'Drains all damage dealt.'},
 'Shove':{t:'Beast',c:'P',p:40,a:100,pp:35,k:'dash',res:'+1 priority.',rp:1},
 'Static Snap':{t:'Volt',c:'S',p:40,a:100,pp:30,k:'shot',par:10,res:'Always paralyzes.'},
 'Arc Fang':{t:'Volt',c:'P',p:65,a:95,pp:15,k:'bite',par:10,res:'Always paralyzes.'},
 'Shock Jab':{t:'Volt',c:'P',p:65,a:100,pp:15,k:'punch',par:10,res:'Always paralyzes.'},
 'Volt Arc':{t:'Volt',c:'S',p:90,a:100,pp:15,k:'squall',par:10,res:'Always paralyzes.'},
 'Storm Strike':{t:'Volt',c:'S',p:110,a:70,pp:10,k:'lunar',par:30,res:'Cannot miss.'},
 'Charge Up':{t:'Volt',c:'X',pp:20,k:'buff',st:[['self','spd',1,100]],res:'Also raises Sp. Atk.',rs:[['self','spa',1,100]]},
 'Beak Jab':{t:'Gale',c:'P',p:35,a:100,pp:35,k:'dash',res:'+1 priority.',rp:1},
 'Wing Cut':{t:'Gale',c:'P',p:60,a:100,pp:35,k:'slash',res:'High critical-hit ratio.',rc:1},
 'Focus Gaze':{t:'Beast',c:'X',pp:30,k:'buff',st:[['self','atk',1,100]],res:'Also raises Speed.',rs:[['self','spe',1,100]]},
 'Air Blade':{t:'Gale',c:'S',p:75,a:95,pp:15,k:'squall',res:'Cannot miss.'},
 'Talon Snatch':{t:'Gale',c:'P',p:65,a:100,pp:20,k:'slash',res:'High critical-hit ratio.',rc:1},
 'Stampede':{t:'Beast',c:'P',p:90,a:90,pp:15,k:'slam',res:'Cannot miss.'},
 'Dive Bomb':{t:'Gale',c:'P',p:120,a:100,pp:15,k:'flare',rec:.33,res:'No recoil.'},
 'Feral Fury':{t:'Beast',c:'P',p:120,a:100,pp:15,k:'flare',rec:.33,res:'No recoil.'},
 'Mud Fling':{t:'Stone',c:'S',p:55,a:100,pp:15,k:'shot',st:[['foe','spe',-1,50]],res:'Always lowers Speed.'},
 'Hunker Down':{t:'Beast',c:'X',pp:20,k:'buff',st:[['self','def',2,100]],res:'Also raises Sp. Def.',rs:[['self','spd',1,100]]},
 'Burrow':{t:'Stone',c:'P',p:80,a:100,pp:10,k:'slam',res:'Lowers Defense.',rs:[['foe','def',-1,100]]},
 'Echo Strike':{t:'Beast',c:'P',p:60,a:100,pp:20,k:'punch',res:'High critical-hit ratio.',rc:1},
 'Nibble':{t:'Swarm',c:'P',p:60,a:100,pp:20,k:'bite',res:'Lowers Defense.',rs:[['foe','def',-1,100]]},
 'Pester':{t:'Swarm',c:'S',p:50,a:100,pp:20,k:'shot',st:[['foe','spa',-1,100]],res:'Lowers it by 2 instead.',rs:[['foe','spa',-1,100]]},
 'Silk Bind':{t:'Swarm',c:'X',a:95,pp:40,k:'debuff',st:[['foe','spe',-2,100]],res:'Also lowers Attack.',rs:[['foe','atk',-1,100]]},
 'Wing Drone':{t:'Swarm',c:'S',p:90,a:100,pp:10,k:'squall',st:[['foe','spd',-1,10]],res:'Always lowers Sp. Def.'},
 'Dazzling Light':{t:'Fae',c:'S',p:80,a:100,pp:10,k:'lunar',res:'High critical-hit ratio.',rc:1},
 'Gentle Drain':{t:'Fae',c:'S',p:50,a:100,pp:10,k:'drain',dr:.75,res:'Drains all damage dealt.'},
 'Iron Ram':{t:'Metal',c:'P',p:80,a:100,pp:15,k:'dash',res:'Lowers Defense.',rs:[['foe','def',-1,100]]},
 'Steel Claw':{t:'Metal',c:'P',p:50,a:95,pp:35,k:'slash',st:[['self','atk',1,10]],res:'Always raises Attack.'},
 'Plate Up':{t:'Metal',c:'X',pp:15,k:'buff',st:[['self','def',2,100]],res:'Also raises Sp. Def.',rs:[['self','spd',1,100]]},
 'Pollen Haze':{t:'Bloom',c:'X',a:100,pp:20,k:'debuff',st:[['foe','spe',-1,100]],res:'Lowers it by 2 instead.',rs:[['foe','spe',-1,100]]},
 'Smolder':{t:'Ember',c:'X',a:85,pp:15,k:'debuff',inflict:'brn',res:'Cannot miss.'},
 'Jolt Wave':{t:'Volt',c:'X',a:90,pp:20,k:'debuff',inflict:'par',res:'Cannot miss.'},
 'Swift Talon':{t:'Gale',c:'P',p:40,a:100,pp:30,pr:1,k:'dash',res:'Raises your Attack.',rs:[['self','atk',1,100]]},
 'Glimmer':{t:'Fae',c:'S',p:40,a:100,pp:30,k:'shot',res:"Lowers the target's Sp. Atk.",rs:[['foe','spa',-1,100]]},
 'Scale Dust':{t:'Swarm',c:'S',p:60,a:100,pp:5,k:'squall',res:'Raises your Sp. Atk.',rs:[['self','spa',1,100]]},
 'Mind Prick':{t:'Mind',c:'S',p:40,a:100,pp:25,k:'shot',res:"Lowers the target's Sp. Def.",rs:[['foe','spd',-1,100]]},
 'Soak In':{t:'Tide',c:'X',pp:10,k:'heal',heal:.5,res:'Heals 66% instead.'},
 'Grasping Roots':{t:'Bloom',c:'P',p:80,a:100,pp:10,k:'slam',res:"Lowers the target's Speed.",rs:[['foe','spe',-1,100]]},
 'Creep':{t:'Shade',c:'P',p:40,a:100,pp:30,pr:1,k:'dash',res:'High critical-hit ratio.',rc:1},
 'Scissor Strike':{t:'Swarm',c:'P',p:80,a:100,pp:15,k:'slash',res:'High critical-hit ratio.',rc:1},
 'Night Jaw':{t:'Shade',c:'P',p:80,a:100,pp:15,k:'bite',st:[['foe','def',-1,20]],res:'Always lowers Defense.'},
 'Scheme':{t:'Shade',c:'X',pp:20,k:'buff',st:[['self','spa',2,100]],res:'Also raises Speed.',rs:[['self','spe',1,100]]},
 'Struggle':{t:'Beast',c:'P',p:50,a:100,pp:1,k:'dash',rec:.25,res:'No recoil.',typeless:1},
 'Train Hard':{t:'Brawl',c:'X',pp:20,k:'buff',st:[['self','atk',1,100],['self','def',1,100]],res:'Also raises Speed.',rs:[['self','spe',1,100]]}
};

const SN={atk:'Attack',def:'Defense',spa:'Sp. Atk',spd:'Sp. Def',spe:'Speed'};
const eff=(t,types)=>types.reduce((m,d)=>m*CHART[t][d],1);

/* ---------- audio ---------- */
let AC=null,sndOn=true,noiseB=null;
function audio(){if(AC||!sndOn)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate,b=AC.createBuffer(1,n,n),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=R()*2-1;noiseB=b}catch(e){AC=null}}
function noise(dur,f0,f1,vol,type='bandpass',q=1){if(!AC||!sndOn)return;const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseB;s.loop=true;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(AC.destination);s.start(t,R());s.stop(t+dur)}
function tone(f0,f1,dur,vol,type='sine',delay=0){if(!AC||!sndOn)return;const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.02)}
const TS={Volt:()=>S.zap(),Gale:()=>S.whoosh(),Swarm:()=>S.buzz(),Metal:()=>S.clang(),Shade:()=>S.whoosh()};
const S={zap:()=>{noise(.16,6000,2500,.2,'highpass');tone(1800,300,.14,.08,'square');tone(900,1600,.08,.06,'sawtooth',.06)},buzz:()=>{tone(150,170,.35,.1,'sawtooth');tone(300,280,.35,.05,'square')},clang:()=>{tone(1300,1250,.5,.11,'triangle');tone(1960,1900,.4,.06,'sine');noise(.08,4000,2000,.2,'bandpass',2)},hit:(b)=>{noise(.18,b?900:1600,120,b?.5:.32,'lowpass');tone(b?150:220,45,.22,b?.5:.3,'triangle')},whoosh:()=>noise(.22,400,2600,.16),fire:()=>{noise(.5,900,200,.3,'bandpass',.6);tone(180,60,.4,.12,'sawtooth')},water:()=>{noise(.45,2400,500,.28,'bandpass',1.4);tone(700,240,.25,.08)},leaf:()=>noise(.25,5200,2600,.16,'highpass'),rock:()=>{noise(.3,500,90,.45,'lowpass');tone(90,40,.3,.3,'square')},
 buff:()=>[0,.07,.14].forEach((d,i)=>tone(440*Math.pow(1.26,i),440*Math.pow(1.26,i)*1.02,.22,.12,'triangle',d)),debuff:()=>[0,.08,.16].forEach((d,i)=>tone(420/Math.pow(1.2,i),400/Math.pow(1.2,i),.24,.1,'sawtooth',d)),heal:()=>[0,.09,.18,.27].forEach((d,i)=>tone([523,659,784,1047][i],[523,659,784,1047][i],.35,.1,'sine',d)),
 sel:()=>tone(880,1100,.07,.07,'triangle'),res:()=>{[0,.1,.2,.3,.42].forEach((d,i)=>tone([262,330,392,523,659][i],[262,330,392,523,659][i]*1.01,.9-d,.11,'triangle',d));noise(1.1,300,5000,.12)},faint:()=>tone(420,60,.8,.2,'sawtooth'),lunar:()=>{tone(1200,1800,.9,.08);tone(600,900,.9,.08,'triangle')},crit:()=>tone(1400,2200,.12,.14,'square'),win:()=>[0,.14,.28,.5].forEach((d,i)=>tone([523,659,784,1047][i],[523,659,784,1047][i],.5,.13,'triangle',d))};

/* ---------- canvas & clock ---------- */
const cv=$('cv'),cx=cv.getContext('2d');
let W=0,H=0,PX=3,DPR=1,HY=0,clk=0,tscale=1,last=0,arena=null,arenaName='glade';
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c};
const sprites={};
const one=src=>new Promise(res=>{const im=new Image();im.onload=()=>{const c=mk(im.width,im.height);c.getContext('2d').drawImage(im,0,0);res({l:c,r:c,w:im.width,h:im.height})};im.src=src});
function loadSprites(){return Promise.all(Object.keys(SPR).map(async k=>{sprites[k]={f:await one(SPR[k].f),b:await one(SPR[k].b)};if(SPR[k].f2){sprites[k].f2=await one(SPR[k].f2);sprites[k].b2=await one(SPR[k].b2)}}))}
const timers=[],tweens=[];
const wait=ms=>new Promise(r=>timers.push({t:clk+ms,r}));
const E={out:t=>1-(1-t)*(1-t),in:t=>t*t,io:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,back:t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)},lin:t=>t};
function tween(o,props,ms,ease=E.out){return new Promise(r=>{const from={};for(const k in props)from[k]=o[k];tweens.push({o,from,props,t0:clk,ms,ease,r})})}
function tick(dt){clk+=dt*tscale;for(let i=timers.length-1;i>=0;i--)if(timers[i].t<=clk){const r=timers[i].r;timers.splice(i,1);r()}
 for(let i=tweens.length-1;i>=0;i--){const w=tweens[i],t=clamp((clk-w.t0)/w.ms,0,1),e=w.ease(t);for(const k in w.props)w.o[k]=lerp(w.from[k],w.props[k],e);if(t>=1){tweens.splice(i,1);w.r()}}}

/* ---------- particles / fx / lights ---------- */
let parts=[],fxs=[],lights=[],ghosts=[];
const glowCache={};
function glow(col){let g=glowCache[col];if(g)return g;g=mk(64,64);const x=g.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(.25,col);gr.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=1;x.fillStyle=gr;x.fillRect(0,0,64,64);x.globalCompositeOperation='destination-in';const a=x.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,'rgba(0,0,0,1)');a.addColorStop(.3,'rgba(0,0,0,.55)');a.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=a;x.fillRect(0,0,64,64);return glowCache[col]=g}
function P(o){parts.push(Object.assign({x:0,y:0,vx:0,vy:0,g:0,drag:0,life:500,age:0,size:PX*2,size1:null,col:'#fff',k:'glow',add:true,rot:0,vr:0,a:1,front:true},o))}
function burst(x,y,n,pal,o={}){for(let i=0;i<n;i++){const an=rf(0,TAU),sp=rf(.15,1)*(o.sp||.5)*PX;P(Object.assign({x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp*(o.flat||1)-(o.up||0)*PX,col:pal[ri(0,pal.length-1)],life:rf(250,650)*(o.life||1),size:rf(1.5,4)*PX*(o.size||1),size1:0,drag:.004,g:o.g||0,k:o.k||'glow',add:o.add!==false},o.extra||{}))}}
function pixels(x,y,n,pal,o={}){burst(x,y,n,pal,Object.assign({k:'px',size:.45,g:.0018},o))}
function ring(x,y,col,o={}){fxs.push({t0:clk,ms:o.ms||420,front:o.front!==false,draw(c,t){const r=lerp(o.r0||PX*4,o.r1||PX*38,E.out(t));c.globalCompositeOperation='lighter';c.globalAlpha=(1-t)*(o.a||.9);c.strokeStyle=col;c.lineWidth=Math.max(1,PX*(o.w||2)*(1-t));c.beginPath();c.ellipse(x,y,r,r*(o.flat||1),0,0,TAU);c.stroke()}})}
function light(x,y,r,col,int=1,ms=500){lights.push({x,y,r,col,int,t0:clk,ms})}
function slashFx(x,y,ang,len,col,ms=220){fxs.push({t0:clk,ms,front:true,draw(c,t){const e=E.out(Math.min(1,t*1.8)),a=t<.5?1:1-(t-.5)*2;c.save();c.translate(x,y);c.rotate(ang);c.globalCompositeOperation='lighter';c.globalAlpha=a;const L=len*e;const g=c.createLinearGradient(-len/2,0,len/2,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=col;c.beginPath();c.moveTo(-len/2,0);c.quadraticCurveTo(-len/2+L/2,-PX*7,-len/2+L,0);c.quadraticCurveTo(-len/2+L/2,-PX*2.5,-len/2,0);c.fill();c.fillStyle=g;c.beginPath();c.moveTo(-len/2,0);c.quadraticCurveTo(-len/2+L/2,-PX*5.5,-len/2+L,0);c.quadraticCurveTo(-len/2+L/2,-PX*3.6,-len/2,0);c.fill();c.restore()}})}
function biteFx(x,y,col){fxs.push({t0:clk,ms:320,front:true,pix:true,draw(c,t){const cl=t<.45?E.in(t/.45):1,a=t<.6?1:1-(t-.6)/.4,gap=lerp(PX*16,0,cl);c.save();c.translate(x,y);c.globalAlpha=a;for(const s of[-1,1]){c.fillStyle='#fff';c.strokeStyle=col;c.lineWidth=PX*.8;for(let i=-2;i<=2;i++){const tx=i*PX*5.2;c.beginPath();c.moveTo(tx-PX*2.6,s*(gap+PX*9));c.lineTo(tx,s*gap+s*PX*.5);c.lineTo(tx+PX*2.6,s*(gap+PX*9));c.closePath();c.fill();c.stroke()}}c.restore()}})}
function starFx(x,y,col,sc=1){fxs.push({t0:clk,ms:260,front:true,draw(c,t){const r=lerp(PX*4,PX*26*sc,E.out(t));c.save();c.translate(x,y);c.rotate(t*.6);c.globalCompositeOperation='lighter';c.globalAlpha=1-t;c.fillStyle='#fff';c.beginPath();for(let i=0;i<16;i++){const rr=i%2?r*.32:r,a=i/16*TAU;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=PX;c.stroke();c.restore()}})}
function dmgText(x,y,txt,col,big){parts.push({k:'text',txt,x,y,vx:rf(-.02,.02)*PX,vy:-.11*PX,g:.00022*PX,drag:0,life:1000,age:0,col,size:(big?13:10)*PX,a:1,front:true,add:false,rot:0,vr:0})}

/* ---------- arenas ---------- */
function layer(k,fn){const c=mk(W*1.2/k,H*1.2/k),x=c.getContext('2d');x.scale(1/k,1/k);x.translate(W*.1,H*.1);fn(x);return c}
function tex(kind){const N=256,c=mk(N,N),x=c.getContext('2d'),id=x.createImageData(N,N),d=id.data;
 const grid=(cell)=>{const n=N/cell,g=new Float32Array(n*n);for(let i=0;i<g.length;i++)g[i]=R();return(px,py)=>{const fx=px/cell,fy=py/cell,ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy,a=g[(iy%n)*n+ix%n],b=g[(iy%n)*n+(ix+1)%n],cc=g[((iy+1)%n)*n+ix%n],dd=g[((iy+1)%n)*n+(ix+1)%n];return a+(b-a)*tx+(cc-a)*ty+(a-b-cc+dd)*tx*ty}};
 const n1=grid(32),n2=grid(8);
 const pals={glade:[[58,112,52],[74,134,58],[92,154,64],[116,176,76]],cinder:[[30,24,30],[40,31,36],[52,40,44],[66,50,52]],shore:[[122,108,96],[142,126,108],[162,146,124],[180,164,140]]}[kind];
 for(let y=0;y<N;y++)for(let x2=0;x2<N;x2++){const n=n1(x2,y)*.6+n2(x2,y)*.3+R()*.2,c2=pals[n<.42?0:n<.55?1:n<.7?2:3],i=(y*N+x2)*4;d[i]=c2[0];d[i+1]=c2[1];d[i+2]=c2[2];d[i+3]=255}
 x.putImageData(id,0,0);
 if(kind==='glade'){for(let i=0;i<900;i++){const px=ri(0,N-1),py=ri(0,N-2);x.fillStyle='rgba(150,205,96,.9)';x.fillRect(px,py,1,1);x.fillStyle='rgba(40,84,40,.7)';x.fillRect(px,py+1,1,1)}
  const fc=['#f05c70','#fcde54','#f6f6fc','#b07eec','#ff9646'];for(let i=0;i<70;i++){const px=ri(0,N-2),py=ri(0,N-1);x.fillStyle=fc[ri(0,4)];x.fillRect(px,py,2,1);x.fillRect(px,py-1,1,1)}}
 if(kind==='shore'){for(let i=0;i<260;i++){x.fillStyle=R()<.5?'rgba(210,196,170,.8)':'rgba(92,80,74,.7)';x.fillRect(ri(0,N-1),ri(0,N-1),ri(1,2),1)}for(let i=0;i<10;i++){x.fillStyle='#e8e0d0';x.fillRect(ri(0,N-3),ri(0,N-2),2,2)}}
 let em=null;
 if(kind==='cinder'){em=mk(N,N);const e=em.getContext('2d');e.fillStyle='#000';e.fillRect(0,0,N,N);
  for(let i=0;i<9;i++){let px=rf(0,N),py=rf(0,N),an=rf(0,TAU);const pts=[[px,py]];for(let s=0;s<26;s++){an+=rf(-.7,.7);px+=Math.cos(an)*7;py+=Math.sin(an)*7;pts.push([px,py])}
   for(const[ctx2,cols] of [[x,['#1a1014','#ff6a1e','#ffd070']],[e,[null,'#ff5a14','#ffc050']]]){[[3.2,0],[1.6,1],[.7,2]].forEach(([w,ci])=>{if(!cols[ci])return;ctx2.strokeStyle=cols[ci];ctx2.lineWidth=w;ctx2.beginPath();for(const ox of[-N,0,N])for(const oy of[-N,0,N]){ctx2.moveTo(pts[0][0]+ox,pts[0][1]+oy);for(const p of pts)ctx2.lineTo(p[0]+ox,p[1]+oy)}ctx2.stroke()})}}}
 return{c,em}}
function projGround(t,S0){const c=mk(W*1.2,H*1.2),x=c.getContext('2d');x.imageSmoothingEnabled=false;const pat=x.createPattern(t,'repeat'),gh=H-HY,f=2.3,ox=W*.1,oy=H*.1;
 for(let y=HY+1;y<H*1.1;y++){const d=y-HY,s=S0*d/gh,v=f*gh*gh/(S0*d);x.save();x.beginPath();x.rect(0,y+oy,W*1.2,1);x.clip();x.setTransform(s,0,0,s,ox+W/2-128*s,y+oy-(v%256)*s);x.fillStyle=pat;x.fillRect(-W*2/s,(v%256)-1,W*4/s+2,3);x.restore()}
 return c}
function dof(g,haze){const k=6,sm=mk(g.width/k,g.height/k),sx=sm.getContext('2d');sx.drawImage(g,0,0,sm.width,sm.height);
 const t=mk(g.width,g.height),tx=t.getContext('2d');tx.drawImage(sm,0,0,g.width,g.height);tx.globalCompositeOperation='destination-in';const oy=H*.1,gr=tx.createLinearGradient(0,HY+oy,0,H*1.1+oy);gr.addColorStop(0,'#000');gr.addColorStop(.3,'rgba(0,0,0,0)');gr.addColorStop(.86,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.9)');tx.fillStyle=gr;tx.fillRect(0,0,t.width,t.height);
 const x=g.getContext('2d');x.setTransform(1,0,0,1,0,0);x.drawImage(t,0,0);const hz=x.createLinearGradient(0,HY+oy,0,HY+oy+(H-HY)*.34);hz.addColorStop(0,haze);hz.addColorStop(1,haze.replace(/[\d.]+\)$/,'0)'));x.fillStyle=hz;x.fillRect(0,HY+oy,g.width,(H-HY)*.36);x.globalCompositeOperation='destination-out';const ed=x.createLinearGradient(0,HY+oy,0,HY+oy+(H-HY)*.05);ed.addColorStop(0,'rgba(0,0,0,1)');ed.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=ed;x.fillRect(0,HY+oy-2,g.width,(H-HY)*.05+2);x.globalCompositeOperation='source-over';return g}
const blob=(x,cx_,cy,r,cols)=>{cols.forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(cx_-i*r*.14,cy-i*r*.16,r*(1-i*.22),0,TAU);x.fill()})};
function tree(x,bx,by,s,cols,trunk){x.fillStyle=trunk;x.fillRect(bx-s*.09,by-s*.75,s*.18,s*.78);const rnd=mulb(Math.round(bx*7+by));for(let i=0;i<7;i++)blob(x,bx+(rnd()-.5)*s*.8,by-s*.85-rnd()*s*.55,s*(.26+rnd()*.16),cols)}
function pine(x,bx,by,s,cols){x.fillStyle='#3a2a20';x.fillRect(bx-s*.04,by-s*.3,s*.08,s*.3);for(let i=0;i<3;i++){const w=s*(.42-i*.09),y0=by-s*(.2+i*.33),y1=y0-s*.5;x.fillStyle=cols[0];x.beginPath();x.moveTo(bx-w,y0);x.lineTo(bx,y1);x.lineTo(bx+w,y0);x.fill();x.fillStyle=cols[1];x.beginPath();x.moveTo(bx-w,y0);x.lineTo(bx,y1);x.lineTo(bx-w*.2,y0);x.fill()}}
function mulb(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function ridge(x,base,amp,col,seed,jag=0){const r=mulb(seed),ph=[r()*9,r()*9,r()*9];x.fillStyle=col;x.beginPath();x.moveTo(-W*.1,H*1.1);for(let px=-W*.1;px<=W*1.1;px+=W/160){const u=px/W;x.lineTo(px,base-amp*(.5*Math.sin(u*5+ph[0])+.3*Math.sin(u*13+ph[1])+.2*Math.sin(u*31+ph[2])+.7)-(jag?Math.abs(Math.sin(u*70+ph[0]))*jag:0))}x.lineTo(W*1.1,H*1.1);x.fill()}
const ARENAS={
 glade:{name:'Hearthmoss Glade',tex:'glade',haze:'rgba(214,232,206,.5)',shadow:'rgba(14,40,30,',amb:[1,1,1],
  sky(x){const g=x.createLinearGradient(0,-H*.1,0,HY);g.addColorStop(0,'#4f9be0');g.addColorStop(.6,'#a8d6f2');g.addColorStop(1,'#f4ecd0');x.fillStyle=g;x.fillRect(-W*.1,-H*.1,W*1.2,H*1.2);
   const s=x.createRadialGradient(W*.8,H*.06,0,W*.8,H*.06,H*.6);s.addColorStop(0,'rgba(255,250,220,1)');s.addColorStop(.08,'rgba(255,244,200,.8)');s.addColorStop(1,'rgba(255,240,190,0)');x.fillStyle=s;x.fillRect(-W*.1,-H*.1,W*1.2,H);
   const r=mulb(5);x.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<5;i++){const cx_=r()*W,cy=r()*HY*.6;for(let k=0;k<6;k++){x.beginPath();x.ellipse(cx_+(r()-.5)*W*.12,cy+(r()-.5)*H*.03,W*.05*(.5+r()),H*.022*(.5+r()),0,0,TAU);x.fill()}}},
  far(x){ridge(x,HY*.98,H*.16,'#8fb0cc',11);ridge(x,HY*1.0,H*.1,'#6f9a9e',12);const r=mulb(3);for(let i=0;i<46;i++){const bx=-W*.1+r()*W*1.2,s=H*(.16+r()*.1);(r()<.3?pine:tree)(x,bx,HY+H*.012,s,r()<.5?['#2f6b3e','#3f8a48','#62aa58']:['#285c3a','#3a7c44','#5a9e52'],'#4a3426')}},
  mid(x){for(const[bx,s] of [[-W*.02,H*.62],[W*.09,H*.42],[W*1.02,H*.66],[W*.92,H*.4]])tree(x,bx,HY+H*.06+(s>H*.5?H*.04:0),s,['#1f4f30','#2f7040','#58a050'],'#3a2a20');
   const r=mulb(8);for(let i=0;i<16;i++){const bx=-W*.1+r()*W*1.2;if(bx>W*.2&&bx<W*.8&&r()<.6)continue;blob(x,bx,HY+H*.03,H*.035*(1+r()),['#245a34','#357a42','#5aa054'])}},
  fg(x){const r=mulb(4);for(const side of[0,1])for(let i=0;i<34;i++){const bx=side?W*(1.1-r()*.3):W*(-.1+r()*.3),by=H*1.1,h=H*(.1+r()*.2);x.fillStyle=r()<.5?'#123620':'#1b4a2a';x.beginPath();x.moveTo(bx-H*.012,by);x.quadraticCurveTo(bx+(r()-.5)*H*.08,by-h*.6,bx+(r()-.5)*H*.12,by-h);x.lineTo(bx+H*.012,by);x.fill()}
   for(let i=0;i<22;i++)blob(x,W*(-.1+r()*.42),H*(-.1+r()*.16),H*.07*(.6+r()),['#0f3020','#184228']);for(let i=0;i<14;i++)blob(x,W*(1.1-r()*.3),H*(-.1+r()*.12),H*.07*(.6+r()),['#0f3020','#184228'])},
  dapple(x){const r=mulb(6);x.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const px=r()*W,py=HY+(H-HY)*(.12+r()*.9),rx=W*.05*(.4+r())*((py-HY)/(H-HY)+.3);const g=x.createRadialGradient(px,py,0,px,py,rx);g.addColorStop(0,'rgba(255,246,190,.13)');g.addColorStop(1,'rgba(255,246,190,0)');x.fillStyle=g;x.save();x.translate(px,py);x.scale(1,.35);x.translate(-px,-py);x.fillRect(px-rx,py-rx,rx*2,rx*2);x.restore()}x.globalCompositeOperation='source-over'},
  live(c,t){c.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const a=2.02+i*.085+Math.sin(t/3200+i)*.012,ox=W*.86,oy=-H*.12,len=H*1.7,wd=H*(.018+((i*37)%25)*.0016),ex=ox+Math.cos(a)*len,ey=oy+Math.sin(a)*len,nx=-Math.sin(a)*wd,ny=Math.cos(a)*wd,g=c.createLinearGradient(ex-nx,ey-ny,ex+nx,ey+ny);g.addColorStop(0,'rgba(255,240,190,0)');g.addColorStop(.5,`rgba(255,240,190,${.05+(i%3)*.022})`);g.addColorStop(1,'rgba(255,240,190,0)');c.fillStyle=g;c.beginPath();c.moveTo(ox,oy);c.lineTo(ex+nx,ey+ny);c.lineTo(ex-nx,ey-ny);c.fill()}c.globalCompositeOperation='source-over'},
  ambient(){if(R()<.25)P({x:rf(0,W),y:rf(0,H),vx:rf(-.008,.008)*PX,vy:rf(-.012,.002)*PX,life:rf(2500,5000),size:rf(.6,1.5)*PX,col:'#fff6c8',a:.55,fade:1});if(R()<.02)P({k:'leaf',add:false,x:rf(0,W),y:-10,vx:rf(-.03,.01)*PX,vy:rf(.02,.04)*PX,vr:rf(-.004,.004),life:9000,size:PX*1.3,col:R()<.5?'#6fba55':'#e0b040',wob:1})}},
 cinder:{name:'Cinder Pass',tex:'cinder',haze:'rgba(255,120,60,.42)',shadow:'rgba(10,4,8,',amb:[1,.84,.78],
  sky(x){const g=x.createLinearGradient(0,-H*.1,0,HY);g.addColorStop(0,'#1a1030');g.addColorStop(.45,'#6a2848');g.addColorStop(.8,'#e0603a');g.addColorStop(1,'#ffc070');x.fillStyle=g;x.fillRect(-W*.1,-H*.1,W*1.2,H*1.2);const r=mulb(9);for(let i=0;i<7;i++){x.fillStyle=`rgba(${60+r()*40|0},${20+r()*20|0},${40+r()*20|0},.5)`;const cx_=r()*W,cy=r()*HY*.7;for(let k=0;k<6;k++){x.beginPath();x.ellipse(cx_+(r()-.5)*W*.2,cy+(r()-.5)*H*.03,W*.09*(.5+r()),H*.02*(.5+r()),0,0,TAU);x.fill()}}},
  far(x){const vx=W*.36,top=HY-H*.3;x.fillStyle='rgba(70,40,60,.75)';for(let i=0;i<16;i++){x.beginPath();x.ellipse(vx+W*.02*i+Math.sin(i)*W*.02,top-H*.03*i,W*(.03+i*.008),H*(.03+i*.004),0,0,TAU);x.fill()}
   x.fillStyle='#3a1e34';x.beginPath();x.moveTo(vx-W*.3,HY+H*.02);x.lineTo(vx-W*.045,top);x.lineTo(vx+W*.045,top);x.lineTo(vx+W*.32,HY+H*.02);x.fill();const g=x.createRadialGradient(vx,top,0,vx,top,H*.2);g.addColorStop(0,'rgba(255,190,90,.95)');g.addColorStop(.2,'rgba(255,110,40,.6)');g.addColorStop(1,'rgba(255,80,30,0)');x.fillStyle=g;x.fillRect(vx-H*.2,top-H*.2,H*.4,H*.4);
   x.strokeStyle='#ff8a3a';x.lineWidth=H*.006;x.beginPath();x.moveTo(vx+W*.01,top);x.quadraticCurveTo(vx+W*.06,top+H*.12,vx+W*.04,HY);x.stroke();ridge(x,HY*1.0,H*.09,'#2a1428',21,H*.03);
   const hg=x.createLinearGradient(0,HY-H*.05,0,HY+H*.02);hg.addColorStop(0,'rgba(255,120,50,0)');hg.addColorStop(1,'rgba(255,140,60,.7)');x.fillStyle=hg;x.fillRect(-W*.1,HY-H*.05,W*1.2,H*.07)},
  mid(x){const r=mulb(14);for(const[bx,w,h] of [[-W*.04,W*.13,H*.5],[W*.1,W*.07,H*.28],[W*1.03,W*.14,H*.56],[W*.9,W*.07,H*.3],[W*.2,W*.04,H*.12],[W*.8,W*.04,H*.14]]){const by=HY+H*.06;x.fillStyle='#1c0f1c';x.beginPath();x.moveTo(bx-w,by);x.lineTo(bx-w*.5,by-h*.6);x.lineTo(bx-w*.15,by-h);x.lineTo(bx+w*.3,by-h*.72);x.lineTo(bx+w*.6,by-h*.3);x.lineTo(bx+w,by);x.fill();x.fillStyle='rgba(255,120,60,.55)';x.beginPath();x.moveTo(bx-w*.15,by-h);x.lineTo(bx+w*.3,by-h*.72);x.lineTo(bx+w*.6,by-h*.3);x.lineTo(bx+w*.5,by-h*.3);x.lineTo(bx+w*.24,by-h*.68);x.fill()}},
  fg(x){const r=mulb(2);for(const side of[0,1])for(let i=0;i<7;i++){const bx=side?W*(1.1-r()*.26):W*(-.1+r()*.26),w=H*(.08+r()*.1);x.fillStyle='#0c060c';x.beginPath();x.moveTo(bx-w,H*1.1);x.lineTo(bx-w*.3,H*1.1-w*(1+r()));x.lineTo(bx+w*.5,H*1.1-w*(.6+r()*.6));x.lineTo(bx+w,H*1.1);x.fill()}},
  live(c,t){const vx=W*.36,top=HY-H*.3,p=.5+.5*Math.sin(t/700);c.globalCompositeOperation='lighter';const g=c.createRadialGradient(vx,top,0,vx,top,H*.16);g.addColorStop(0,`rgba(255,160,70,${.25*p})`);g.addColorStop(1,'rgba(255,90,30,0)');c.fillStyle=g;c.fillRect(vx-H*.2,top-H*.2,H*.4,H*.4);c.globalCompositeOperation='source-over'},
  ambient(){if(R()<.5)P({k:'px',x:rf(0,W),y:rf(HY,H),vx:rf(-.02,.02)*PX,vy:rf(-.07,-.02)*PX,life:rf(1800,3600),size:rf(.35,.8)*PX,col:R()<.5?'#ffb040':'#ff6a20',fade:1,wob:1});if(R()<.12)P({k:'px',add:false,x:rf(0,W),y:-5,vx:rf(-.02,.0)*PX,vy:rf(.015,.03)*PX,life:8000,size:rf(.4,.7)*PX,col:'rgba(120,110,120,.8)',wob:1})}},
 shore:{name:'Marrowind Shore',tex:'shore',haze:'rgba(60,90,150,.5)',shadow:'rgba(4,8,24,',amb:[.72,.8,1.02],
  sky(x){const g=x.createLinearGradient(0,-H*.1,0,HY);g.addColorStop(0,'#060a20');g.addColorStop(.6,'#142454');g.addColorStop(1,'#34508c');x.fillStyle=g;x.fillRect(-W*.1,-H*.1,W*1.2,H*1.2);const r=mulb(17);for(let i=0;i<240;i++){x.fillStyle=`rgba(255,255,255,${.3+r()*.7})`;const s=H*.0035*(.5+r());x.fillRect(-W*.1+r()*W*1.2,-H*.1+r()*HY*1.1,s,s)}
   const mx=W*.68,my=HY*.36,mr=H*.075,h=x.createRadialGradient(mx,my,mr*.8,mx,my,mr*5);h.addColorStop(0,'rgba(200,220,255,.5)');h.addColorStop(1,'rgba(160,190,255,0)');x.fillStyle=h;x.fillRect(mx-mr*5,my-mr*5,mr*10,mr*10);x.fillStyle='#f4f6ff';x.beginPath();x.arc(mx,my,mr,0,TAU);x.fill();x.fillStyle='rgba(180,196,230,.6)';for(const[a,b,c2] of [[-.3,-.2,.22],[.25,.1,.16],[-.1,.4,.12]]){x.beginPath();x.arc(mx+a*mr,my+b*mr,c2*mr,0,TAU);x.fill()}},
  far(x){ridge(x,HY*1.0,H*.05,'#0e1838',31);const lx=W*.2,ly=HY-H*.035;x.fillStyle='#0a1230';x.beginPath();x.moveTo(lx-H*.016,ly);x.lineTo(lx-H*.009,ly-H*.11);x.lineTo(lx+H*.009,ly-H*.11);x.lineTo(lx+H*.016,ly);x.fill();x.fillRect(lx-H*.014,ly-H*.135,H*.028,H*.028);x.fillStyle='#ffe9a0';x.fillRect(lx-H*.008,ly-H*.13,H*.016,H*.016)},
  mid(x){const by=HY+H*.05;for(let i=0;i<5;i++){const px=W*(.82+i*.07),h=H*(.1+i*.03);x.fillStyle='#0c1024';x.fillRect(px,by-h,H*.022,h+H*.05);x.fillStyle='rgba(170,200,255,.5)';x.fillRect(px,by-h,H*.005,h)}x.fillStyle='#0c1024';x.fillRect(W*.8,HY+H*.01,W*.4,H*.014);
   const r=mulb(23);for(let i=0;i<5;i++){const bx=W*(-.08+r()*.24),w=H*(.05+r()*.07);x.fillStyle='#0b0f22';x.beginPath();x.ellipse(bx,by,w,w*.6,0,Math.PI,0);x.fill();x.fillStyle='rgba(160,190,255,.35)';x.beginPath();x.ellipse(bx+w*.2,by-w*.3,w*.5,w*.18,-.4,Math.PI,0);x.fill()}},
  fg(x){const r=mulb(41);for(const side of[0,1])for(let i=0;i<40;i++){const bx=side?W*(1.1-r()*.28):W*(-.1+r()*.28),by=H*1.1,h=H*(.12+r()*.22);x.strokeStyle=r()<.5?'#070a18':'#0c1226';x.lineWidth=H*.008;x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+(r()-.5)*H*.05,by-h*.6,bx+(r()-.3)*H*.16,by-h);x.stroke()}},
  sea(x){const y0=HY,y1=HY+(H-HY)*.2,g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#1a3066');g.addColorStop(1,'#2c5a98');x.fillStyle=g;x.fillRect(-W*.1,y0,W*1.2,y1-y0);x.fillStyle='rgba(230,244,255,.85)';for(let px=-W*.1;px<W*1.1;px+=PX){const o=Math.sin(px/W*40)*PX*1.5+Math.sin(px/W*130)*PX*.8;x.fillRect(px,y1+o,PX,PX*1.2)}const w=x.createLinearGradient(0,y1,0,y1+(H-HY)*.12);w.addColorStop(0,'rgba(60,90,140,.6)');w.addColorStop(1,'rgba(60,90,140,0)');x.fillStyle=w;x.fillRect(-W*.1,y1+PX*2,W*1.2,(H-HY)*.12)},
  live(c,t){const lx=W*.2,ly=HY-H*.035-H*.122,a=t/2600;c.globalCompositeOperation='lighter';for(const d of[0,Math.PI]){const an=a+d,k=Math.cos(an),len=W*.55*Math.abs(k)+H*.02,dir=k>0?1:-1,g=c.createLinearGradient(lx,ly,lx+dir*len,ly);g.addColorStop(0,`rgba(255,236,170,${.34*Math.abs(k)})`);g.addColorStop(1,'rgba(255,236,170,0)');c.fillStyle=g;c.beginPath();c.moveTo(lx,ly);c.lineTo(lx+dir*len,ly-len*.07);c.lineTo(lx+dir*len,ly+len*.07);c.fill()}
   const y0=HY,y1=HY+(H-HY)*.2,mx=W*.68,r=mulb(Math.floor(t/140));c.fillStyle='rgba(220,236,255,.8)';for(let i=0;i<34;i++){const yy=y0+r()*(y1-y0),sp=(yy-y0)/(y1-y0),xx=mx+(r()-.5)*W*(.05+sp*.22);c.fillRect(xx,yy,PX*(1+r()*3)*(.4+sp),Math.max(1,PX*.4))}c.globalCompositeOperation='source-over'},
  ambient(){if(R()<.12)P({x:rf(0,W),y:rf(HY,H),vx:rf(-.01,.01)*PX,vy:rf(-.01,.01)*PX,life:rf(2000,4000),size:rf(.8,1.6)*PX,col:'#c8ff8a',fade:1,blink:1})}}
};
function buildArena(name){arenaName=name;const A=ARENAS[name],t=tex(A.tex),S0=PX;
 const g=projGround(t.c,S0),gx=g.getContext('2d');gx.setTransform(1,0,0,1,W*.1,H*.1);
 if(A.sea)A.sea(gx);if(A.dapple)A.dapple(gx);
 // arena floor: soft worn rings under each side
 for(const k of[0,1]){const p=anchor(k),rx=PX*46,ry=rx*.3,gr=gx.createRadialGradient(p.x,p.y,0,p.x,p.y,rx);gr.addColorStop(0,A.shadow+'.28)');gr.addColorStop(1,A.shadow+'0)');gx.save();gx.translate(p.x,p.y);gx.scale(1,.3);gx.translate(-p.x,-p.y);gx.fillStyle=gr;gx.fillRect(p.x-rx,p.y-rx,rx*2,rx*2);gx.restore()}
 dof(g,A.haze);
 let em=null;if(t.em){const e=projGround(t.em,S0),k=5,sm=mk(e.width/k,e.height/k);sm.getContext('2d').drawImage(e,0,0,sm.width,sm.height);em=sm}
 arena={A,sky:layer(6,A.sky),far:layer(5,A.far),mid:layer(2.5,A.mid),ground:g,em,fg:layer(7,A.fg)};parts=parts.filter(p=>!p.amb)}
function anchor(side){const wide=W>H*1.25;return side?{x:W*(wide?.25:.29),y:HY+(H-HY)*(wide?.7:.74)}:{x:W*(wide?.75:.72),y:HY+(H-HY)*(wide?.46:.44)}}
function resize(){const st=$('stage'),r=st.getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);W=cv.width=Math.round(r.width*DPR);H=cv.height=Math.round(r.height*DPR);HY=H*.4;PX=Math.max(2,Math.floor(Math.min(W*.0046,H*.0043)));
 buildArena(arenaName);for(const k of mons){if(!k)continue;const p=anchor(k.side);k.x=p.x;k.y=p.y}}

/* ---------- battlers ---------- */
let mons=[null,null];
const cam={x:0,y:0,z:1,shake:0,dim:0};
const stg=(m,s)=>{const n=m.stg[s];return m.stat[s]*(n>=0?(2+n)/2:2/(2-n))};
const spd=m=>stg(m,'spe')*(m.par?.5:1);
const ctr=m=>({x:m.x+m.ox,y:m.y+m.oy-m.sp.h*PX*mscale(m)*.5});
const mscale=m=>m.side?1:.86;
const tmp=mk(8,8),tmx=tmp.getContext('2d');
function drawMon(c,m,now){if(m.alpha<=0)return;const s=PX*mscale(m),w=m.sp.w*s,h=m.sp.h*s,br=1+Math.sin(now/520+m.ph)*.012,img=m.side?m.sp.l:m.sp.r;
 const x=m.x+m.ox,y=m.y+m.oy;
 // shadow
 c.save();c.globalAlpha=.42*m.alpha*clamp(1+m.oy/(PX*60),.3,1);c.fillStyle=arena.A.shadow+'1)';c.beginPath();c.ellipse(m.x+m.ox,m.y+PX,w*.4,w*.09,0,0,TAU);c.fill();c.restore();
 // strongest light tint
 let lc=null,li=0;for(const l of lights){const t=(clk-l.t0)/l.ms;if(t>=1)continue;const d=Math.hypot(l.x-x,l.y-(y-h/2)),k=l.int*(1-t)*clamp(1-d/(l.r*2.2),0,1);if(k>li){li=k;lc=l.col}}
 if(tmp.width!==m.sp.w+2||tmp.height!==m.sp.h+2){tmp.width=m.sp.w+2;tmp.height=m.sp.h+2}
 tmx.globalCompositeOperation='source-over';tmx.clearRect(0,0,tmp.width,tmp.height);tmx.drawImage(img,1,1);
 const amb=arena.A.amb;if(amb[0]!==1||amb[1]!==1||amb[2]!==1){tmx.globalCompositeOperation='multiply';tmx.fillStyle=`rgb(${amb[0]*255|0},${amb[1]*255|0},${amb[2]*255|0})`;tmx.fillRect(0,0,tmp.width,tmp.height);tmx.globalCompositeOperation='destination-in';tmx.drawImage(img,1,1)}
 if(li>.03){tmx.globalCompositeOperation='source-atop';tmx.globalAlpha=Math.min(.55,li*.5);tmx.fillStyle=lc;tmx.fillRect(0,0,tmp.width,tmp.height);tmx.globalAlpha=1}
 if(m.flash>0){tmx.globalCompositeOperation='source-atop';tmx.globalAlpha=Math.min(1,m.flash);tmx.fillStyle=m.flashCol;tmx.fillRect(0,0,tmp.width,tmp.height);tmx.globalAlpha=1}
 c.save();c.translate(x,y);c.rotate(m.rot);c.scale(m.sx,m.sy*br);c.imageSmoothingEnabled=false;
 if(m.aura>0){c.globalCompositeOperation='lighter';c.globalAlpha=m.aura*.5*(.7+.3*Math.sin(now/60));const o=PX*1.6;for(let i=0;i<8;i++){const a=i/8*TAU;c.drawImage(m.auraImg||img,-w/2+Math.cos(a)*o,-h+Math.sin(a)*o,w,h)}c.globalCompositeOperation='source-over'}
 c.globalAlpha=m.alpha;if(m.sink>0){c.beginPath();c.rect(-w,-h*2,w*2,h*2);c.clip();c.translate(0,h*m.sink)}
 c.drawImage(tmp,-w/2-s,-h-s,tmp.width*s,tmp.height*s);c.restore()}
function auraImg(m,col){const c=mk(m.sp.w,m.sp.h),x=c.getContext('2d');x.drawImage(m.side?m.sp.l:m.sp.r,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c}
function ghost(m){ghosts.push({m,x:m.x+m.ox,y:m.y+m.oy,t0:clk,ms:220})}

/* ---------- frame ---------- */
function drawLayer(c,img,p){const z=cam.z,sx=cam.x+(cam.shake?rf(-1,1)*cam.shake*PX:0),sy=cam.y+(cam.shake?rf(-1,1)*cam.shake*PX:0);c.setTransform(z,0,0,z,W/2-W/2*z-sx*p*z,H/2-H/2*z-sy*p*z);if(img){c.imageSmoothingEnabled=true;c.drawImage(img,-W*.1,-H*.1,W*1.2,H*1.2)}}
function frame(now){const dt=Math.min(50,now-last);last=now;tick(dt);const c=cx,t=clk;
 if(!arena||!W)return;
 cam.shake*=Math.pow(.86,dt/16);if(cam.shake<.05)cam.shake=0;
 const sh=cam.shake;const jx=sh?rf(-1,1)*sh*PX:0,jy=sh?rf(-1,1)*sh*PX:0,idle={x:Math.sin(now/5200)*PX*2.5,y:Math.cos(now/6100)*PX*1.2};
 const L=(img,p)=>{const z=cam.z;c.setTransform(z,0,0,z,W/2-W/2*z-(cam.x+idle.x+jx)*p*z,H/2-H/2*z-(cam.y+idle.y+jy)*p*z);if(img){c.imageSmoothingEnabled=true;c.drawImage(img,-W*.1,-H*.1,W*1.2,H*1.2)}};
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);
 L(arena.sky,.12);L(arena.far,.3);L(null,.3);arena.A.live&&arena.A.live(c,now);L(arena.mid,.6);L(arena.ground,1);
 if(arena.em){c.globalCompositeOperation='lighter';c.globalAlpha=.55+.25*Math.sin(now/600);c.drawImage(arena.em,-W*.1,-H*.1,W*1.2,H*1.2);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 // ground lights
 c.globalCompositeOperation='lighter';lights=lights.filter(l=>clk-l.t0<l.ms);for(const l of lights){const k=1-(clk-l.t0)/l.ms,gy=Math.max(l.y,HY+PX*4),g=c.createRadialGradient(l.x,gy,0,l.x,gy,l.r*1.6);c.globalAlpha=Math.min(1,k*l.int*.8);g.addColorStop(0,l.col);g.addColorStop(1,'rgba(0,0,0,0)');c.save();c.translate(l.x,gy);c.scale(1,.32);c.translate(-l.x,-gy);c.fillStyle=g;c.fillRect(l.x-l.r*1.6,gy-l.r*1.6,l.r*3.2,l.r*3.2);c.restore()}
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
 if(cam.dim>0){c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle=`rgba(4,6,18,${cam.dim})`;c.fillRect(0,0,W,H);c.restore()}
 drawFx(c,false);drawParts(c,dt,false);
 ghosts=ghosts.filter(g=>clk-g.t0<g.ms);for(const g of ghosts){const m=g.m,s=PX*mscale(m),k=1-(clk-g.t0)/g.ms;c.globalAlpha=k*.4;c.imageSmoothingEnabled=false;c.drawImage(m.side?m.sp.l:m.sp.r,g.x-m.sp.w*s/2,g.y-m.sp.h*s,m.sp.w*s,m.sp.h*s)}c.globalAlpha=1;
 const order=mons.filter(Boolean).sort((a,b)=>(a.y+a.oy*0)-(b.y+b.oy*0));for(const m of order)drawMon(c,m,now);
 drawFx(c,true);drawParts(c,dt,true);
 if(R()<.6)arena.A.ambient();
 L(arena.fg,1.7);
 c.setTransform(1,0,0,1,0,0);const v=c.createRadialGradient(W/2,H*.55,H*.35,W/2,H*.55,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(2,3,10,.62)');c.fillStyle=v;c.fillRect(0,0,W,H);
 if(cam.flash>0){c.fillStyle=`rgba(255,255,255,${cam.flash})`;c.fillRect(0,0,W,H);cam.flash=Math.max(0,cam.flash-dt/260)}
 if(tint){c.globalCompositeOperation='multiply';c.fillStyle=tint;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}}
const low=mk(8,8),lowx=low.getContext('2d');
function drawFx(c,front){let any=false;const lw=Math.ceil(W/PX),lh=Math.ceil(H/PX);
 for(let i=fxs.length-1;i>=0;i--){const f=fxs[i],t=(clk-f.t0)/f.ms;if(t>=1){fxs.splice(i,1);continue}if(t<0||!!f.front!==front)continue;
  if(f.pix){if(!any){if(low.width!==lw||low.height!==lh){low.width=lw;low.height=lh}lowx.setTransform(1,0,0,1,0,0);lowx.clearRect(0,0,lw,lh);any=true}lowx.save();lowx.setTransform(1/PX,0,0,1/PX,0,0);f.draw(lowx,t);lowx.restore();continue}
  c.save();f.draw(c,t);c.restore();c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 if(any){c.imageSmoothingEnabled=false;c.drawImage(low,0,0,lw*PX,lh*PX)}}
function drawParts(c,dt,front){const d=dt*tscale;for(let i=parts.length-1;i>=0;i--){const p=parts[i];if(!!p.front!==front)continue;p.age+=d;if(p.age>=p.life){parts.splice(i,1);continue}
  const t=p.age/p.life;p.vy+=p.g*d;if(p.drag){const k=Math.pow(1-p.drag,d);p.vx*=k;p.vy*=k}p.x+=p.vx*d+(p.wob?Math.sin(p.age/300+p.life)*PX*.03*d/16:0);p.y+=p.vy*d;p.rot+=p.vr*d;
  if(p.home){const hx=p.home.x-p.x,hy=p.home.y-p.y,dd=Math.hypot(hx,hy)||1,a=p.home.f*d;p.vx+=hx/dd*a;p.vy+=hy/dd*a;if(dd<PX*5){parts.splice(i,1);continue}}
  let a=p.a*(p.fade?Math.sin(t*Math.PI):t<.7?1:1-(t-.7)/.3);if(p.blink)a*=.5+.5*Math.sin(p.age/180);const sz=p.size1!=null?lerp(p.size,p.size1,t):p.size;
  c.globalAlpha=Math.max(0,a);c.globalCompositeOperation=p.add?'lighter':'source-over';
  if(p.k==='glow'){const g=glow(p.col);c.drawImage(g,p.x-sz,p.y-sz,sz*2,sz*2)}
  else if(p.k==='px'){c.fillStyle=p.col;const s=Math.max(1,Math.round(sz));c.fillRect(Math.round(p.x),Math.round(p.y),s,s)}
  else if(p.k==='leaf'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;c.beginPath();c.ellipse(0,0,sz*1.5,sz*.6,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-sz*1.2,-sz*.1,sz*2.4,Math.max(1,sz*.16));c.restore()}
  else if(p.k==='shard'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;c.beginPath();c.moveTo(-sz,sz*.6);c.lineTo(0,-sz);c.lineTo(sz*.9,sz*.5);c.fill();c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(-sz,sz*.6);c.lineTo(0,-sz);c.lineTo(-sz*.1,sz*.5);c.fill();c.restore()}
  else if(p.k==='drop'){c.fillStyle=p.col;c.beginPath();c.ellipse(p.x,p.y,sz*.5,sz*.9,Math.atan2(p.vy,p.vx)+Math.PI/2,0,TAU);c.fill()}
  else if(p.k==='text'){c.font=`700 ${Math.round(p.size)}px Georgia,serif`;c.textAlign='center';c.lineWidth=Math.max(2,PX*1.1);c.strokeStyle='rgba(10,8,16,.9)';c.strokeText(p.txt,p.x,p.y);c.fillStyle=p.col;c.fillText(p.txt,p.x,p.y)}}
 c.globalAlpha=1;c.globalCompositeOperation='source-over'}

/* ---------- move animations ---------- */
const shake=n=>{cam.shake=Math.max(cam.shake,n)};
async function hitstop(ms){const s=tscale;tscale=.05;await new Promise(r=>setTimeout(r,ms));tscale=s}
function typeBurst(x,y,type,power=1){const pal=PAL[type];if(TS[type])TS[type]();burst(x,y,14*power,pal,{sp:.55*power,size:1.2*power});pixels(x,y,16*power,pal,{sp:.6*power});ring(x,y,pal[1],{r1:PX*30*power});light(x,y,PX*60*power,pal[1],1,480);
 if(type==='Ember'){burst(x,y,10,['#ffb347','#ff6a20'],{sp:.3,up:.12,size:1.6,life:1.3});S.fire()}
 else if(type==='Tide'){burst(x,y,18,['#bfe8ff','#7fd0ff'],{k:'drop',add:false,sp:.7,up:.25,g:.0016*PX,size:.7});ring(x,y+PX*10,'#bfe8ff',{flat:.3,r1:PX*46,ms:600});S.water()}
 else if(type==='Bloom'){burst(x,y,14,['#6fba55','#9be06a','#3d9c3a'],{k:'leaf',add:false,sp:.6,size:.7,life:1.6,g:.0005*PX,extra:{vr:.01}});S.leaf()}
 else if(type==='Stone'){burst(x,y,12,['#a8865a','#7a5c3c','#c9a877'],{k:'shard',add:false,sp:.7,up:.3,g:.002*PX,size:.9,extra:{vr:.012}});S.rock()}
 else if(type==='Fae'){for(let i=0;i<10;i++)P({x:x+rf(-1,1)*PX*20,y:y+rf(-1,1)*PX*20,k:'px',col:'#fff',size:PX*.6,life:rf(300,700),blink:1})}}
async function lunge(att,def,frac,ms=150,arc=0){const dx=(def.x-att.x)*frac,dy=(def.y-att.y)*frac;S.whoosh();const g=setInterval(()=>ghost(att),28);att.sx=1.08;att.sy=.94;if(arc){tween(att,{ox:dx},ms,E.in);await tween(att,{oy:dy-arc},ms*.55,E.out);await tween(att,{oy:dy},ms*.45,E.in)}else await tween(att,{ox:dx,oy:dy},ms,E.in);clearInterval(g);att.sx=att.sy=1}
const back=(att,ms=260)=>tween(att,{ox:0,oy:0},ms,E.io);
async function charge(att,type,ms=380,big=1){const c=ctr(att),pal=PAL[type];const n=Math.round(ms/22);for(let i=0;i<n;i++){const a=rf(0,TAU),r=PX*rf(26,44)*big;P({x:c.x+Math.cos(a)*r,y:c.y+Math.sin(a)*r*.8,col:pal[ri(0,2)],size:PX*rf(1,2.2),life:ms*.9,home:{x:c.x,y:c.y,f:.0009*PX},drag:.01});}light(att.x,att.y,PX*50,pal[1],.8,ms+200);tween(att,{sy:.94},ms*.6).then(()=>tween(att,{sy:1},ms*.3));await wait(ms)}
async function projectile(from,to,type,o={}){const pal=PAL[type],ms=o.ms||300,p={x:from.x,y:from.y,t:0};const fx={t0:clk,ms:ms+20,front:true,draw(c,t){const sz=PX*(o.size||7);c.globalCompositeOperation='lighter';c.drawImage(glow(pal[1]),p.x-sz*1.8,p.y-sz*1.8,sz*3.6,sz*3.6);c.drawImage(glow(pal[0]),p.x-sz,p.y-sz,sz*2,sz*2);if(type==='Stone'){c.globalCompositeOperation='source-over';c.fillStyle='#7a5c3c';c.beginPath();c.arc(p.x,p.y,sz*.55,0,TAU);c.fill();c.fillStyle='#c9a877';c.beginPath();c.arc(p.x-sz*.15,p.y-sz*.15,sz*.3,0,TAU);c.fill()}}};fxs.push(fx);
 const iv=setInterval(()=>{for(let i=0;i<3;i++)P({x:p.x+rf(-2,2)*PX,y:p.y+rf(-2,2)*PX,vx:rf(-.02,.02)*PX,vy:rf(-.04,.01)*PX,col:pal[ri(0,2)],size:PX*rf(1.5,3.4),size1:0,life:rf(200,420),k:type==='Tide'?'drop':'glow',add:type!=='Tide'});if(type==='Ember')light(p.x,to.y+PX*30,PX*34,pal[1],.5,200)},16);
 const arc=o.arc||0;tween(p,{t:1},ms,E.lin);const t0=clk;await new Promise(res=>{const st=()=>{const t=clamp((clk-t0)/ms,0,1);p.x=lerp(from.x,to.x,t);p.y=lerp(from.y,to.y,t)-Math.sin(t*Math.PI)*arc;if(t<1)requestAnimationFrame(st);else res()};st()});clearInterval(iv)}
const ANIM={
 async dash(a,d,mv,hits,imp){for(let i=0;i<hits;i++){await lunge(a,d,.72,hits>1?95:140);const c=ctr(d);starFx(c.x,c.y,PAL[mv.t][1],.8);typeBurst(c.x,c.y,mv.t,.7);imp(i);await hitstop(40);await back(a,hits>1&&i<hits-1?110:240)}},
 async punch(a,d,mv,hits,imp){await tween(a,{ox:(a.x-d.x)*.06,sx:.92},160);await lunge(a,d,.74,120);const c=ctr(d);starFx(c.x,c.y,PAL[mv.t][1],1.3);typeBurst(c.x,c.y,mv.t,1.1);shake(5);imp(0);await hitstop(80);await back(a)},
 async bite(a,d,mv,hits,imp){await lunge(a,d,.7,150);const c=ctr(d);biteFx(c.x,c.y,PAL[mv.t][2]);await wait(140);typeBurst(c.x,c.y,mv.t,.9);imp(0);await hitstop(70);await back(a)},
 async slash(a,d,mv,hits,imp){const c0=ctr(d),big=mv.big?1.4:1;if(mv.t==='Bloom'){S.leaf();for(let i=0;i<10*big;i++)P({k:'leaf',add:false,x:ctr(a).x,y:ctr(a).y,vx:rf(-.1,.1)*PX,vy:rf(-.2,-.05)*PX,vr:.02,col:'#8fe36a',size:PX*1.8,life:500,home:{x:c0.x,y:c0.y,f:.0016*PX},drag:.02})}
  await lunge(a,d,.74,130);const c=ctr(d),L=PX*52*big;slashFx(c.x,c.y,-.7,L,PAL[mv.t][1]);await wait(70);if(mv.big){slashFx(c.x,c.y,.7+Math.PI,L,PAL[mv.t][1]);await wait(60)}typeBurst(c.x,c.y,mv.t,big);if(mv.big)shake(6);imp(0);await hitstop(mv.big?90:50);await back(a)},
 async shot(a,d,mv,hits,imp){await charge(a,mv.t,300);const f=ctr(a),t=ctr(d);(mv.t==='Ember'?S.fire:mv.t==='Tide'?S.water:S.whoosh)();await projectile(f,t,mv.t,{arc:mv.t==='Stone'?PX*26:PX*4,size:mv.p>50?8:5.5});typeBurst(t.x,t.y,mv.t,.9);imp(0);await hitstop(50);await wait(150)},
 async drain(a,d,mv,hits,imp){await charge(a,mv.t,260);const t=ctr(d),f=ctr(a);typeBurst(t.x,t.y,mv.t,.7);imp(0);await wait(120);for(let i=0;i<22;i++){P({x:t.x+rf(-1,1)*PX*12,y:t.y+rf(-1,1)*PX*12,vx:rf(-.12,.12)*PX,vy:rf(-.18,-.02)*PX,col:PAL.Bloom[ri(0,1)],size:PX*rf(1.6,3),life:1100,home:{x:f.x,y:f.y,f:.0014*PX},drag:.012})}S.heal();await wait(700);a.flash=.5;a.flashCol='#b8ffa0';tween(a,{flash:0},400)},
 async wheel(a,d,mv,hits,imp){const iv=setInterval(()=>{const c=ctr(a);burst(c.x,c.y,3,PAL.Ember,{sp:.25,size:1.4});light(a.x+a.ox,a.y,PX*40,'#ff8a3a',.6,200)},20);S.fire();tween(a,{rot:(a.side?-1:1)*TAU*2},520,E.in);await tween(a,{oy:-PX*8},220);await lunge(a,d,.74,220);clearInterval(iv);a.rot=0;const c=ctr(d);typeBurst(c.x,c.y,'Ember',1.1);shake(4);imp(0);await hitstop(60);await back(a)},
 async flare(a,d,mv,hits,imp){tween(cam,{dim:.35},300);await charge(a,'Ember',520,1.5);const iv=setInterval(()=>{const c=ctr(a);burst(c.x,c.y,6,PAL.Ember,{sp:.4,size:2,up:.08});pixels(c.x,c.y,3,PAL.Ember,{sp:.5});light(a.x+a.ox,a.y+a.oy,PX*70,'#ff7a2a',1,180)},16);a.flash=.6;a.flashCol='#ffb347';S.fire();await tween(a,{ox:(a.x-d.x)*.1},180);await lunge(a,d,.76,170);clearInterval(iv);a.flash=0;const c=ctr(d);cam.flash=.7;for(let i=0;i<5;i++)setTimeout(()=>{burst(c.x+rf(-1,1)*PX*14,d.y-PX*rf(0,60),16,PAL.Ember,{sp:.7,up:.5,size:2.4,life:1.3});light(d.x,d.y,PX*130,'#ff7a2a',1.3,500)},i*55);typeBurst(c.x,c.y,'Ember',1.8);ring(d.x,d.y,'#ffb347',{flat:.3,r1:PX*90,ms:700,w:3});shake(12);S.hit(true);imp(0);await hitstop(140);tween(cam,{dim:0},500);await back(a,340)},
 async slam(a,d,mv,hits,imp){await tween(a,{sy:.85},140);a.sy=1;S.whoosh();const dx=(d.x-a.x)*.74,dy=(d.y-a.y)*.74;tween(a,{ox:dx},420,E.lin);await tween(a,{oy:dy-PX*70},240,E.out);await tween(a,{oy:dy},180,E.in);const c=ctr(d);shake(11);cam.flash=.35;S.rock();S.fire();typeBurst(c.x,c.y,'Ember',1.5);for(let i=0;i<7;i++){const ex=d.x+rf(-1,1)*PX*46;setTimeout(()=>{burst(ex,d.y,10,PAL.Ember,{sp:.3,up:.8,size:1.8,g:.0012*PX,life:1.4});light(ex,d.y,PX*50,'#ff6a20',1,400)},i*45)}burst(d.x,d.y,14,['#3a2a2c','#5a4040'],{k:'shard',add:false,sp:.8,up:.5,g:.002*PX,extra:{vr:.01}});ring(d.x,d.y,'#ff8a3a',{flat:.3,r1:PX*80,ms:650,w:3});imp(0);await hitstop(110);await back(a,320)},
 async spike(a,d,mv,hits,imp){await tween(a,{sy:.9},120);await tween(a,{sy:1,oy:-PX*6},90);await tween(a,{oy:0},90,E.in);shake(4);S.rock();ring(a.x,a.y,'#c9a877',{flat:.3,r1:PX*40});const n=6;for(let i=1;i<=n;i++){const t=i/n,x=lerp(a.x,d.x,t),y=lerp(a.y,d.y,t),h=PX*(14+i*7),big=i===n;fxs.push({t0:clk+i*55,ms:520,front:y>=d.y-1,pix:true,draw(c,tt){const up=tt<.25?E.out(tt/.25):tt>.75?1-(tt-.75)/.25:1;c.fillStyle='#7a5c3c';c.beginPath();c.moveTo(x-h*.28,y);c.lineTo(x+h*.05,y-h*up);c.lineTo(x+h*.3,y);c.fill();c.fillStyle='#c9a877';c.beginPath();c.moveTo(x-h*.28,y);c.lineTo(x+h*.05,y-h*up);c.lineTo(x-h*.04,y);c.fill()}});setTimeout(()=>{burst(x,y,5,['#a8865a','#7a5c3c'],{k:'shard',add:false,sp:.4,up:.35,g:.002*PX,size:.6});if(big)S.rock()},i*55)}
  await wait(n*55+60);const c=ctr(d);typeBurst(c.x,c.y,'Stone',1.4);shake(9);imp(0);await hitstop(100);await wait(260)},
 async lance(a,d,mv,hits,imp){await charge(a,'Tide',300);const f=ctr(a);S.water();await lunge(a,d,.7,120);const t=ctr(d),dir=Math.atan2(t.y-f.y,t.x-f.x);fxs.push({t0:clk,ms:300,front:true,draw(c,tt){const L=Math.hypot(t.x-f.x,t.y-f.y)*1.25,w=PX*9*(1-tt);c.translate(f.x,f.y);c.rotate(dir);c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'rgba(127,208,255,0)');g.addColorStop(.6,'rgba(127,208,255,.9)');g.addColorStop(1,'#fff');c.fillStyle=g;c.beginPath();c.moveTo(0,-w*.3);c.lineTo(L*.85,-w);c.lineTo(L,0);c.lineTo(L*.85,w);c.lineTo(0,w*.3);c.fill()}});for(let i=0;i<24;i++){const k=R();P({k:'drop',add:false,x:lerp(f.x,t.x,k),y:lerp(f.y,t.y,k),vx:rf(-.1,.1)*PX,vy:rf(-.25,0)*PX,g:.0016*PX,col:'#bfe8ff',size:PX*1.2,life:600})}typeBurst(t.x,t.y,'Tide',1.3);shake(6);imp(0);await hitstop(90);await back(a)},
 async wave(a,d,mv,hits,imp){tween(cam,{dim:.25},300);await charge(a,'Tide',460,1.4);S.water();const dir=d.x>a.x?1:-1,x0=a.x-dir*PX*30,x1=d.x+dir*PX*50,w={x:x0,h:0};fxs.push({t0:clk,ms:900,front:true,pix:true,draw(c,tt){const hh=PX*78*w.h,by=lerp(a.y,d.y,clamp((w.x-x0)/(x1-x0),0,1))+PX*4,X=k=>w.x+dir*PX*k;
   const body=(col,sx,sy)=>{c.fillStyle=col;c.beginPath();c.moveTo(X(-120*sx),by);c.quadraticCurveTo(X(-50*sx),by-hh*.45*sy,X(-14),by-hh*sy);c.quadraticCurveTo(X(22),by-hh*1.12*sy,X(34),by-hh*.62*sy);c.quadraticCurveTo(X(30),by-hh*.84*sy,X(12),by-hh*.74*sy);c.quadraticCurveTo(X(-2),by-hh*.5*sy,X(10),by);c.closePath();c.fill()};
   body('#1d4f9c',1,1);body('#2f7fd8',.9,.92);body('#5fb4f2',.62,.7);c.fillStyle='#bfe8ff';for(let i=0;i<5;i++){c.beginPath();c.ellipse(X(-34-i*14),by-hh*(.5-i*.09),PX*7,PX*1.6,-dir*.5,0,TAU);c.fill()}
   c.fillStyle='#eafcff';for(let i=0;i<11;i++){const k=i/10,fx=lerp(-14,34,k),fy=k<.6?lerp(1,1.1,k/.6):lerp(1.1,.62,(k-.6)/.4);c.beginPath();c.arc(X(fx)+Math.sin(tt*40+i)*PX*1.5,by-hh*fy,PX*(4.2+Math.sin(i*2.1)*1.6),0,TAU);c.fill()}
   c.fillStyle='rgba(234,252,255,.9)';for(let i=0;i<9;i++){c.beginPath();c.arc(X(-100+i*14)+Math.sin(tt*30+i*2)*PX*2,by-PX*1,PX*(2.6+Math.sin(i)*1),0,TAU);c.fill()}}});
  const iv=setInterval(()=>{for(let i=0;i<4;i++)P({k:'drop',add:false,x:w.x+rf(-30,30)*PX,y:a.y-PX*rf(10,70)*w.h,vx:rf(-.1,.1)*PX,vy:rf(-.3,-.05)*PX,g:.0016*PX,col:R()<.5?'#eafcff':'#7fd0ff',size:PX*rf(.8,1.6),life:700})},16);tween(w,{h:1},260);tween(a,{ox:(d.x-a.x)*.72,oy:(d.y-a.y)*.72-PX*18},620,E.in);await tween(w,{x:d.x},620,E.in);const c=ctr(d);cam.flash=.5;shake(12);S.hit(true);typeBurst(c.x,c.y,'Tide',1.9);ring(d.x,d.y,'#bfe8ff',{flat:.3,r1:PX*100,ms:800,w:3});imp(0);tween(w,{x:x1,h:0},280);await hitstop(130);clearInterval(iv);tween(cam,{dim:0},500);await back(a,340)},
 async squall(a,d,mv,hits,imp){await charge(a,'Bloom',340);const c=ctr(d);S.leaf();tween(cam,{dim:.2},200);const t0=clk,cols=['#ffb7d5','#ff8fc0','#fff','#9be06a'];const iv=setInterval(()=>{const t=(clk-t0)/900;for(let i=0;i<5;i++){const an=rf(0,TAU),r=PX*rf(10,50);P({k:'leaf',add:false,x:c.x+Math.cos(an)*r,y:c.y+Math.sin(an)*r*.5+PX*20,vx:-Math.sin(an)*.22*PX,vy:rf(-.2,-.08)*PX,vr:.02,col:cols[ri(0,3)],size:PX*rf(1.1,2),life:520})}if(R()<.3){slashFx(c.x+rf(-1,1)*PX*14,c.y+rf(-1,1)*PX*14,rf(0,TAU),PX*34,'#ffb7d5',160);S.leaf()}},16);await wait(420);imp(0);d.flash=.7;d.flashCol='#ffd3f0';tween(d,{flash:0},300);shake(5);await wait(420);clearInterval(iv);burst(c.x,c.y,26,cols,{k:'leaf',add:false,sp:.9,size:.8,life:1.5,extra:{vr:.015}});ring(c.x,c.y,'#ffb7d5',{r1:PX*60});tween(cam,{dim:0},400);await wait(220)},
 async lunar(a,d,mv,hits,imp){tween(cam,{dim:.55},350);S.lunar();const c=ctr(d),m={y:c.y-PX*150,r:0,b:0};fxs.push({t0:clk,ms:1700,front:true,draw(cx2,t){const mx=c.x,r=PX*22*m.r;cx2.globalCompositeOperation='lighter';cx2.drawImage(glow('#ffd3f0'),mx-r*3,m.y-r*3,r*6,r*6);cx2.globalCompositeOperation='source-over';cx2.fillStyle='#fff6fc';cx2.beginPath();cx2.arc(mx,m.y,r,0,TAU);cx2.fill();cx2.fillStyle='rgba(240,138,208,.35)';cx2.beginPath();cx2.arc(mx+r*.3,m.y-r*.2,r*.25,0,TAU);cx2.arc(mx-r*.35,m.y+r*.3,r*.18,0,TAU);cx2.fill();if(m.b>0){cx2.globalCompositeOperation='lighter';const w=PX*26*m.b,g=cx2.createLinearGradient(mx-w,0,mx+w,0);g.addColorStop(0,'rgba(240,138,208,0)');g.addColorStop(.5,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(240,138,208,0)');cx2.fillStyle=g;cx2.fillRect(mx-w,m.y,w*2,d.y-m.y)}}});
  await charge(a,'Fae',300);await tween(m,{r:1},380,E.back);for(let i=0;i<16;i++)P({k:'px',x:c.x+rf(-1,1)*PX*60,y:m.y+rf(-1,1)*PX*40,col:'#fff',size:PX*.7,life:rf(400,900),blink:1});await wait(160);tween(m,{b:1},90);cam.flash=.4;shake(8);S.hit(true);light(d.x,d.y,PX*120,'#ffd3f0',1.4,700);typeBurst(c.x,c.y,'Fae',1.5);ring(d.x,d.y,'#ffd3f0',{flat:.3,r1:PX*90,ms:700,w:3});const iv=setInterval(()=>pixels(c.x,d.y,5,PAL.Fae,{sp:.7,up:.5}),20);imp(0);await hitstop(120);await wait(260);clearInterval(iv);tween(m,{b:0},200);await tween(m,{r:0},260,E.in);tween(cam,{dim:0},400);await wait(120)},
 async buff(a,d,mv){S.buff();const col=mv.t==='Stone'?'#9fd0ff':'#ff9a7a';a.flash=.5;a.flashCol=col;tween(a,{flash:0},500);ring(a.x,a.y,col,{flat:.3,r0:PX*40,r1:PX*8,ms:500});if(mv.t==='Stone')burst(a.x,a.y,8,['#a8865a','#c9a877'],{k:'shard',add:false,sp:.3,up:.5,g:.0015*PX,extra:{vr:.01}});for(let i=0;i<18;i++)setTimeout(()=>P({k:'px',x:a.x+rf(-1,1)*PX*26,y:a.y-PX*rf(0,20),vy:-.16*PX,col,size:PX*rf(.6,1.1),life:700}),i*25);light(a.x,a.y,PX*60,col,.8,700);await tween(a,{sy:1.08},180);await tween(a,{sy:1},180);await wait(250)},
 async debuff(a,d,mv){const c0=ctr(a),c=ctr(d);S.debuff();fxs.push({t0:clk,ms:500,front:true,draw(cx2,t){cx2.globalCompositeOperation='lighter';cx2.globalAlpha=Math.sin(t*Math.PI);cx2.drawImage(glow('#ffe9a0'),c0.x-PX*20,c0.y-PX*26,PX*40,PX*40)}});await wait(260);d.flash=.45;d.flashCol='#7a5cc0';tween(d,{flash:0},600);for(let i=0;i<18;i++)setTimeout(()=>P({k:'px',x:d.x+rf(-1,1)*PX*26,y:c.y-PX*rf(10,40),vy:.14*PX,col:'#b090ff',size:PX*rf(.6,1.1),life:650}),i*25);tween(d,{sy:.93},200).then(()=>tween(d,{sy:1},200));await wait(600)},
 async heal(a,d,mv){S.heal();tween(cam,{dim:.2},250);const c=ctr(a);fxs.push({t0:clk,ms:1000,front:true,draw(cx2,t){cx2.globalCompositeOperation='lighter';const w=PX*34,al=Math.sin(t*Math.PI)*.6,g=cx2.createLinearGradient(a.x-w,0,a.x+w,0);g.addColorStop(0,'rgba(255,240,170,0)');g.addColorStop(.5,`rgba(255,246,200,${al})`);g.addColorStop(1,'rgba(255,240,170,0)');cx2.fillStyle=g;cx2.beginPath();cx2.moveTo(a.x-w*.5,0);cx2.lineTo(a.x+w*.5,0);cx2.lineTo(a.x+w,a.y);cx2.lineTo(a.x-w,a.y);cx2.fill()}});light(a.x,a.y,PX*80,'#fff0a8',1,1000);for(let i=0;i<26;i++)setTimeout(()=>P({x:a.x+rf(-1,1)*PX*26,y:a.y-PX*rf(0,50),vy:-.07*PX,col:R()<.5?'#b8ffa0':'#fff6c8',size:PX*rf(1.2,2.4),life:800,fade:1}),i*28);a.flash=.4;a.flashCol='#d8ffc0';tween(a,{flash:0},900);await wait(900);tween(cam,{dim:0},300)}
};
