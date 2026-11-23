function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R = mulberry(20261122);
const ri = (a,b) => a + Math.floor(R()*(b-a+1));
const rf = (a,b) => a + R()*(b-a);
const shade = (c,f) => [Math.max(0,Math.min(255,Math.round(c[0]*f))),Math.max(0,Math.min(255,Math.round(c[1]*f))),Math.max(0,Math.min(255,Math.round(c[2]*f)))];
const clamp = (v,a,b) => v<a?a:v>b?b:v;

/* ================= pixel buffer ================= */
class Buf{
  constructor(w,h){this.w=w;this.h=h;this.d=new Uint8ClampedArray(w*h*4)}
  px(x,y,c){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=this.w||y>=this.h)return;const i=(y*this.w+x)*4;this.d[i]=c[0];this.d[i+1]=c[1];this.d[i+2]=c[2];this.d[i+3]=c.length>3?c[3]:255}
  a(x,y){if(x<0||y<0||x>=this.w||y>=this.h)return 0;return this.d[(y*this.w+x)*4+3]}
  rect(x0,y0,x1,y1,c){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)this.px(x,y,c)}
  ell(x0,y0,x1,y1,c){const cx=(x0+x1+1)/2,cy=(y0+y1+1)/2,rx=(x1-x0+1)/2,ry=(y1-y0+1)/2;
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry;if(nx*nx+ny*ny<=1)this.px(x,y,c)}}
  poly(p,c){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[x,y]of p){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){const X=x+.5,Y=y+.5;let ins=false;
      for(let i=0,j=p.length-1;i<p.length;j=i++){const[xi,yi]=p[i],[xj,yj]=p[j];if(((yi>Y)!==(yj>Y))&&(X<(xj-xi)*(Y-yi)/(yj-yi)+xi))ins=!ins}
      if(ins)this.px(x,y,c)}}
  line(x0,y0,x1,y1,c){x0|=0;y0|=0;x1|=0;y1|=0;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
    for(;;){this.px(x0,y0,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
  outline(c){const w=this.w,h=this.h,o=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(this.a(x,y))continue;if(this.a(x-1,y)||this.a(x+1,y)||this.a(x,y-1)||this.a(x,y+1))o.push(x,y)}
    for(let i=0;i<o.length;i+=2)this.px(o[i],o[i+1],c);return this}
  canvas(){const c=document.createElement('canvas');c.width=this.w;c.height=this.h;c.getContext('2d').putImageData(new ImageData(this.d,this.w,this.h),0,0);return c}
}
function mirror(cv){const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const x=c.getContext('2d');x.translate(cv.width,0);x.scale(-1,1);x.drawImage(cv,0,0);return c}

/* ================= sprites ================= */
const FRONT=["....kkkkkk....","...krrrrrrk...","..krrrrwwrrk..","..kRRRRRRRRRk.","..khhhhhhhhk..","..khsssssshk..","..ksseSSessk..","...ksssSssk...","....kSSSSk....","...kbbbybbk...","..kbbbbybbbk..",".ksbbbbybbBsk.",".kSkbbbyBBkSk.",".kk.kbbyBBk.kk","....kppppPk...","....kpPkpPk...","....kpPkpPk...","...kookkook...","...kkkk.kkkk.."];
const BACK =["....kkkkkk....","...krrrrrrk...","..krrrrrrrrk..","..kRRRRRRRRk..","..khhhhhhhhk..","..khhhhhhhhk..","..khhhhhhhhk..","...khhhhhhk...","....kSSSSk....","...kbbbbbbk...","..kbggggggbk..",".ksbggggggbsk.",".kSkggggggkSk.",".kk.kbbbbbk.kk","....kppppPk...","....kpPkpPk...","....kpPkpPk...","...kookkook...","...kkkk.kkkk.."];
const SIDE =["....kkkkkk....","...krrrrrrk...","..krrrrrwwrk..","..kRRRRRRRRRRk","..khhhhsssk...","..khhhssesk...","..khhhsssSk...","...khhsssk....","....kSSSk.....","...kbbbbbk....","...kgbbbybk...","...kgbbbybk...","...kgbsbybk...","...kkbSbBk....","....kppPPk....","....kpPkPk....","....kpPkPk....","....kookok....","....kkkkkk...."];
const BASEPAL={k:[40,30,42],r:[206,56,52],R:[140,34,44],w:[245,242,235],h:[78,48,32],s:[248,204,164],S:[214,160,122],e:[30,30,46],b:[58,112,204],B:[38,70,150],y:[244,204,70],p:[62,62,84],P:[42,42,58],o:[130,66,40],g:[196,84,58]};
const PALS={
  hero:BASEPAL,
  rival:Object.assign({},BASEPAL,{r:[70,160,110],R:[40,104,72],b:[70,64,82],B:[46,40,56],y:[220,90,60],h:[30,28,36],g:[90,90,100]}),
  girl:Object.assign({},BASEPAL,{r:[250,230,190],R:[200,170,120],w:[240,120,150],b:[234,120,150],B:[180,80,112],y:[255,255,255],h:[196,110,50],p:[80,120,190],P:[60,90,150],g:[240,200,90]}),
  elder:Object.assign({},BASEPAL,{r:[124,100,78],R:[90,70,54],w:[150,130,100],h:[210,210,214],b:[132,92,62],B:[96,64,44],y:[204,180,120],p:[76,66,56],P:[56,48,40],g:[132,92,62]}),
  prof:Object.assign({},BASEPAL,{r:[210,186,140],R:[160,136,96],w:[120,90,60],h:[120,86,60],b:[240,240,236],B:[196,200,210],y:[90,140,200],p:[96,84,70],P:[70,60,50],g:[200,200,206]})
};
function gridBuf(rows,pal){const w=Math.max(...rows.map(r=>r.length)),b=new Buf(w,rows.length);rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const c=pal[r[x]];if(c)b.px(x,y,c)}});return b}
function legShift(src,half){const b=new Buf(src.w,src.h);b.d.set(src.d);const mid=src.w>>1;
  for(let x=0;x<src.w;x++){if(half===0?x>=mid:x<mid)continue;for(let y=14;y<src.h;y++){const j=(y*src.w+x)*4,k=((y+1)*src.w+x)*4;for(let q=0;q<4;q++)b.d[j+q]=y+1<src.h?src.d[k+q]:0}}return b}
function charFrames(pal){const out=[];
  const mk=g=>{const b=gridBuf(g,pal);return [b.canvas(),legShift(b,0).canvas(),legShift(b,1).canvas()]};
  out[0]=mk(FRONT);out[1]=mk(BACK);out[3]=mk(SIDE);out[2]=out[3].map(mirror);return out}

function kit(body,belly,tail,bolt){const b=new Buf(30,24);
  if(bolt) b.poly([[16,15],[20,8],[17,8],[23,1],[22,7],[26,7],[19,17]],tail);
  else { b.poly([[17,14],[22,3],[28,1],[27,8],[21,16]],tail); b.line(18,14,26,3,shade(tail,.7)); }
  b.ell(7,10,21,21,body); b.ell(10,15,18,21,belly); b.ell(3,4,15,15,body);
  b.poly([[4,7],[3,0],[8,5]],body); b.poly([[10,5],[14,0],[14,7]],body);
  b.px(4,2,shade(body,.6)); b.px(13,2,shade(body,.6));
  b.rect(5,9,6,10,[30,30,46]); b.px(5,9,[255,255,255]); b.rect(10,9,11,10,[30,30,46]); b.px(10,9,[255,255,255]);
  b.px(8,12,[150,60,40]); b.rect(9,21,10,22,shade(body,.7)); b.rect(16,21,17,22,shade(body,.7));
  return b.outline([34,28,40]).canvas()}
function bird(){const b=new Buf(26,24),body=[176,124,82],dk=[130,88,58],cr=[246,226,190];
  b.line(11,6,9,1,dk);b.line(13,6,14,1,dk);b.line(12,6,12,2,dk);
  b.ell(3,5,21,21,body); b.ell(7,11,17,21,cr); b.ell(13,10,22,18,dk); b.ell(14,11,21,16,shade(body,.9));
  b.poly([[4,10],[0,12],[4,14]],[240,160,50]); b.rect(6,9,7,10,[30,30,46]); b.px(6,9,[255,255,255]);
  b.rect(9,21,10,23,[240,160,50]); b.rect(14,21,15,23,[240,160,50]);
  return b.outline([40,30,30]).canvas()}
function treeRound(){const b=new Buf(64,76),ox=2,dark=[38,96,52],mid=[62,136,62],light=[104,178,76],hi=[160,212,104];
  b.rect(26+ox,46,33+ox,73,[112,74,46]); b.rect(31+ox,46,33+ox,73,[80,52,34]); b.poly([[22+ox,74],[26+ox,67],[34+ox,67],[38+ox,74]],[96,62,40]);
  for(let i=0;i<9;i++){const cx=30+ox+ri(-14,14),cy=28+ri(-12,9),r=ri(10,14);b.ell(cx-r+2,cy-r+3,cx+r+2,cy+r+3,dark)}
  for(let i=0;i<8;i++){const cx=28+ox+ri(-13,11),cy=24+ri(-12,7),r=ri(8,11);b.ell(cx-r,cy-r,cx+r,cy+r,mid)}
  for(let i=0;i<6;i++){const cx=24+ox+ri(-10,8),cy=18+ri(-9,5),r=ri(4,7);b.ell(cx-r,cy-r,cx+r,cy+r,light)}
  for(let i=0;i<60;i++){const x=ri(6,56),y=ri(2,44),j=(y*b.w+x)*4;if(b.d[j+3]&&b.d[j]===light[0]&&b.d[j+1]===light[1])b.px(x,y,hi)}
  return b.outline([24,52,34]).canvas()}
function pine(){const b=new Buf(40,78);b.rect(18,60,22,76,[96,62,40]);const cols=[[30,82,60],[44,110,72],[70,140,84]];
  for(const[top,bot,hw]of[[2,26,10],[14,42,14],[28,62,18]]){b.poly([[20,top],[20+hw,bot],[20-hw,bot]],cols[0]);b.poly([[19,top+2],[19+(hw/3|0),bot-3],[20-hw+2,bot-2]],cols[1]);b.poly([[18,top+4],[16,bot-6],[20-hw+4,bot-4]],cols[2])}
  return b.outline([20,46,36]).canvas()}
function house(roof,wall,w=92,h=90){const b=new Buf(w,h),e=new Buf(w,h),beam=[110,72,50],wins=[];
  b.rect(w-30,4,w-21,22,[150,120,110]); b.rect(w-31,2,w-20,5,[110,90,84]);
  b.rect(9,44,w-10,h-1,wall); b.rect((w*2/3)|0,44,w-10,h-1,shade(wall,.86)); b.rect(9,h-6,w-10,h-1,[130,124,120]);
  for(const x of[9,(w>>1)-1,w-12])b.rect(x,44,x+2,h-6,beam); b.rect(9,62,w-10,64,beam);
  b.poly([[1,46],[w-2,46],[w-16,10],[15,10]],roof);
  let i=0;for(let y=14;y<46;y+=6,i++){b.line(1+(46-y)*.38,y,w-2-(46-y)*.38,y,shade(roof,.72));for(let x=4+(i%2)*4;x<w-4;x+=8)b.line(x,y-5,x,y,shade(roof,.82))}
  b.line(16,11,w-17,11,shade(roof,1.25));b.line(16,12,w-17,12,shade(roof,1.25)); b.line(1,46,w-2,46,shade(roof,.55)); b.line(1,47,w-2,47,shade(roof,.55));
  for(const wx of[16,w-32]){b.rect(wx,50,wx+14,60,[96,70,52]);b.rect(wx+1,51,wx+13,59,[130,176,212]);b.line(wx+2,52,wx+5,52,[220,240,255]);
    e.rect(wx+1,51,wx+13,59,[255,190,100]);e.rect(wx+4,53,wx+10,57,[255,232,170]);
    for(const z of[b,e]){z.line(wx+7,51,wx+7,59,[96,70,52]);z.line(wx+1,55,wx+13,55,[96,70,52])}
    b.rect(wx-1,61,wx+15,63,[120,80,50]);for(let fx=wx;fx<wx+15;fx+=3){b.px(fx,60,[230,80,100]);b.px(fx+1,60,[80,160,70])}
    wins.push([wx+7,55])}
  const dx=(w>>1)-7;b.rect(dx,66,dx+14,h-6,[132,84,52]);b.rect(dx+2,68,dx+12,h-6,[150,98,60]);b.px(dx+11,78,[240,210,90]);b.rect(dx-2,h-6,dx+16,h-4,[160,150,140]);
  return {img:b.outline([34,28,40]).canvas(),emis:e.canvas(),wins,w,h}}
function fountain(){const b=new Buf(60,52),st=[196,190,178],dk=[150,144,136],wt=[225,245,255];
  b.rect(6,34,54,50,dk);b.ell(4,28,56,40,st);b.ell(9,30,51,38,[70,140,196]);b.ell(16,31,44,36,[110,180,220]);
  b.rect(27,12,33,34,st);b.ell(18,10,42,17,st);b.ell(21,11,39,15,[110,180,220]);
  for(let x=8;x<54;x+=6)b.line(x,38,x,50,shade(dk,.85));
  b.rect(29,2,30,11,wt);for(let t=0;t<1;t+=.05){b.px(30-14*t,6+22*t*t+2*t,wt);b.px(30+14*t,6+22*t*t+2*t,wt)}
  return b.outline([60,56,60]).canvas()}
function lamp(){const b=new Buf(14,50),e=new Buf(14,50),m=[54,52,64];
  b.rect(6,14,7,48,m);b.rect(3,46,10,49,m);b.poly([[2,4],[7,0],[12,4]],m);b.rect(3,4,11,13,m);b.rect(4,5,10,12,[250,226,160]);
  e.rect(4,5,10,12,[255,210,120]);e.rect(6,7,8,10,[255,248,220]);
  return {img:b.outline([34,28,40]).canvas(),emis:e.canvas()}}
function tuft(){const b=new Buf(20,18),cols=[[46,120,52],[70,154,62],[104,186,76]];
  for(let i=0;i<7;i++){const bx=2+i*2.4+R();b.poly([[bx-2,17],[bx+2,17],[bx+ri(-3,3),ri(1,5)]],cols[i%3])}
  b.line(1,16,18,16,cols[0]);return b.outline([26,70,36]).canvas()}
function bush(){const b=new Buf(32,22);
  for(const[c,off]of[[[44,110,54],2],[[70,146,64],0],[[110,180,80],-3]])for(let i=0;i<4;i++){const cx=16+ri(-8,8)+off,cy=13+ri(-3,3)+off,r=ri(5,7);b.ell(cx-r,cy-r,cx+r,Math.min(21,cy+r),c)}
  if(R()<.5)for(let i=0;i<5;i++)b.px(ri(6,26),ri(6,15),[240,120,150]);
  return b.outline([26,64,36]).canvas()}
function rock(){const b=new Buf(18,12);b.ell(1,2,16,11,[132,132,140]);b.ell(3,2,11,7,[172,172,178]);b.px(5,3,[210,210,214]);return b.outline([60,60,70]).canvas()}
function fence(){const b=new Buf(18,16),wd=[212,180,130],dk=[160,124,84];b.rect(0,6,17,8,wd);b.rect(0,11,17,12,dk);b.rect(1,2,4,15,wd);b.line(4,3,4,15,dk);return b.outline([70,50,36]).canvas()}
function sign(){const b=new Buf(24,24);b.rect(10,12,13,23,[130,90,56]);b.rect(1,2,22,13,[196,152,96]);b.rect(1,11,22,13,[150,110,70]);b.line(5,5,18,5,[100,70,46]);b.line(5,8,18,8,[100,70,46]);return b.outline([60,40,30]).canvas()}
function bubble(){const b=new Buf(14,18);b.rect(1,0,12,13,[255,255,255]);b.rect(0,1,13,12,[255,255,255]);b.poly([[4,13],[8,13],[5,17]],[255,255,255]);b.rect(6,2,7,8,[220,40,40]);b.rect(6,10,7,11,[220,40,40]);return b.outline([40,30,42]).canvas()}

/* ================= world ================= */
const T=16,MW=60,MH=80,M=600,WWp=MW*T,WHp=MH*T,GW=WWp+2*M,GH=WHp+2*M;
const tiles=new Uint8Array(MW*MH), reserved=new Uint8Array(MW*MH);
const getT=(x,y)=>x<0||y<0||x>=MW||y>=MH?1:tiles[y*MW+x];
const setT=(x,y,v)=>{if(x>=0&&y>=0&&x<MW&&y<MH)tiles[y*MW+x]=v};
const isRes=(x,y)=>x<0||y<0||x>=MW||y>=MH?1:reserved[y*MW+x];
function res(x0,y0,x1,y1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&y>=0&&x<MW&&y<MH)reserved[y*MW+x]=1}
function block(x0,y0,x1,y1,v=1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setT(x,y,v)}
const ents=[], lights=[], inter={};
const addB=o=>{ents.push(Object.assign({sc:1,sh:1,lift:0,fade:1},o));return ents[ents.length-1]};
const tc=v=>v*T+8;
let pathE;
const PATHS=[
  {p:[[30,82],[30,66]],hw:17},{p:[[30,58],[30,41],[36,35],[36,27],[26,21],[26,12],[30,5],[30,-6]],hw:17},
  {p:[[26,60],[18,58]],hw:11},{p:[[34,60],[41,58]],hw:11},{p:[[34,65],[44,70]],hw:11},{p:[[26,65],[15,75]],hw:11}];
const GREY={cx:tc(22.4),cy:tc(18.6),rx:2.7*T,ry:2.1*T},PLAZA={cx:tc(30),cy:tc(62),rx:6.2*T,ry:4.6*T}, POND={cx:tc(9),cy:tc(64),rx:4.6*T,ry:4.1*T};
const GRASS=[[19,36,6,5],[44,24,6,5],[38,10,5,3.5],[15,17,5,6],[24,44,3.5,1.8],[48,40,4,3]];
let SP={};

function buildPathField(){pathE=new Float32Array(WWp*WHp).fill(1e9);
  for(const P of PATHS)for(let i=0;i<P.p.length-1;i++){const ax=tc(P.p[i][0]),ay=tc(P.p[i][1]),bx=tc(P.p[i+1][0]),by=tc(P.p[i+1][1]),hw=P.hw,pad=hw+8;
    const x0=Math.max(0,Math.floor(Math.min(ax,bx)-pad)),x1=Math.min(WWp-1,Math.ceil(Math.max(ax,bx)+pad)),y0=Math.max(0,Math.floor(Math.min(ay,by)-pad)),y1=Math.min(WHp-1,Math.ceil(Math.max(ay,by)+pad));
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let t=((x-ax)*dx+(y-ay)*dy)/L2;t=t<0?0:t>1?1:t;const qx=ax+t*dx-x,qy=ay+t*dy-y,e=Math.sqrt(qx*qx+qy*qy)-hw,j=y*WWp+x;if(e<pathE[j])pathE[j]=e}}}
const pathAtTile=(tx,ty)=>tx<0||ty<0||tx>=MW||ty>=MH?1e9:pathE[(ty*T+8)*WWp+tx*T+8];
const ellD=(E,x,y)=>Math.hypot((x-E.cx)/E.rx,(y-E.cy)/E.ry);

function say(lines,name){return {lines,name}}
function buildWorld(){
  SP.round=[0,1,2,0,1,2,0].map(i=>WA.trees[i]); SP.pine=[3,4,3].map(i=>WA.trees[i]); SP.tuft=[0,1,2,0,1].map(i=>WA.grass[i]); SP.bush=[0,1,2,5].map(i=>WA.plants[i]);
  SP.rock=WA.small[4]; SP.sign=WA.small[0]; SP.fountain=WA.large[2]; SP.bubble=bubble();
  buildPathField();
  // borders
  block(0,0,3,MH-1);block(56,0,MW-1,MH-1);block(0,0,MW-1,3);block(0,77,MW-1,MH-1);
  for(let x=4;x<56;x++)if(x<27||x>33)block(x,46,x,48);
  // pond & plaza
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(ellD(POND,tc(x),tc(y))<.95)setT(x,y,2);if(ellD(POND,tc(x),tc(y))<1.25||ellD(PLAZA,tc(x),tc(y))<1.15)reserved[y*MW+x]=1;if(pathAtTile(x,y)<8)reserved[y*MW+x]=1}
  inter.water=say(["The pond is calm and clear.","You could fish here… if you had a rod."]);
  // houses
  const H=[{tx:18,ty:57,spr:'player_house',half:3,lines:say(["Home. The door's unlocked, like always.","Mom's in the garden out front."])},
           {tx:41,ty:57,spr:'wren_lab',half:3,lines:say(["CALDER ARCHIVE · HEARTHMOSS FIELD LAB","A note on the door: \"Working outside today. Mind the table. — E. Wren\""])},
           {tx:44,ty:69,spr:'hearthmoss_house_a',half:2,dx:23,lines:say(["No answer. Muffled snoring drifts through the door."])},
           {tx:15,ty:74,spr:'hearthmoss_house_b',half:3,dx:-32,lines:say(["A note on the door reads:","\"Gone fishing. Back never.\""])}];
  for(const h of H){const s=WA.bld[h.spr],k=.68,half=h.half,bx=tc(h.tx)-(h.dx||0)*k,by=(h.ty+1)*T,cx=Math.round((bx-8)/T);
    block(cx-half,h.ty-2,cx+half,h.ty);res(cx-half-1,h.ty-5,cx+half+1,h.ty+1);
    addB({x:bx,y:by,img:s.img,emis:s.emis,sh:.72,big:1,sc:k});
    for(const[lx,ly]of s.wins)lights.push({x:bx+(lx-s.w/2)*k,y:by,hgt:(s.h-ly)*k,r:34});
    inter[h.tx+','+h.ty]=h.lines}
  // fountain
  block(29,61,31,62);addB({x:tc(30),y:63*T,img:SP.fountain,sh:.8,sc:.85});inter['29,62']=inter['30,62']=inter['31,62']=inter['30,61']=say(["The fountain burbles happily.","A few coins glint at the bottom."]);
  // lamps
  for(const[x,y]of[[24,58],[36,58],[24,66],[36,66]]){const l={img:WA.small[2],emis:WA.lampEmis};block(x,y,x,y);res(x,y,x,y);addB({x:tc(x),y:(y+1)*T-2,img:l.img,emis:l.emis,sh:.2,sc:.72});lights.push({x:tc(x),y:(y+1)*T-2,hgt:42,r:62,lamp:1})}
  // village props
  const prop=(x,y,img,sc,sh,l)=>{if(getT(x,y)!==0||pathAtTile(x,y)<9)return;block(x,y,x,y);res(x-1,y-1,x+1,y+1);addB({x:tc(x),y:(y+1)*T-2,img,sh,sc});if(l)inter[x+','+y]=l};
  prop(22,65,WA.small[7],.7,.6,say(["A bench facing the fountain.","Somebody has carved a tiny Peeplet into the armrest."]));prop(40,65,WA.large[1],.8,.65,say(["The village well.","The water is cold and very clear."]));
  prop(46,57,WA.small[5],.7,.35,say(["A crate of sensor parts, addressed to Professor Wren."]));prop(47,57,WA.small[6],.7,.3,say(["A rain barrel. Something small is swimming in it."]));
  // fence + flowerbed
  for(let x=38;x<=50;x++){block(x,73,x,73);res(x,72,x,76);}
  {const k=.68,w=32*k,n=Math.round(13*T/w),x0=tc(44)-n*w/2+w/2;for(let i=0;i<n;i++)addB({x:x0+i*w,y:74*T-2,img:WA.fence[i===0?1:i===n-1?2:0],sh:0,sc:k});
   for(let x=39;x<=49;x+=2)addB({x:tc(x),y:75*T+8,img:WA.plants[3+(x>>1)%2],sh:.3,sc:.8})}
  // signs
  const sg=(x,y,l,img)=>{block(x,y,x,y);res(x,y,x,y);addB({x:tc(x),y:(y+1)*T-2,img:img||SP.sign,sh:.3,sc:.7});inter[x+','+y]=l};
  sg(27,71,say(["HEARTHMOSS VILLAGE","\"Where every journey takes root.\""]));
  sg(28,50,say(["ROUTE 1 · EMBERWILD TRAIL","North: Cindervale City.","Wild Kith live in the tall grass."]));
  sg(21,58,say(["It's your mailbox.","Empty, as usual."]),WA.small[1]);
  sg(28,43,say(["FIELD NOTES","A tired Kith is far more willing to accept a Tether Orb.","Different Kith come out in the evening. Tap the sun to let the day pass."]));
  for(const[x,y]of[[15,65],[38,62]])res(x-1,y-1,x+1,y+1);res(13,58,22,61);res(42,58,49,66);res(32,31,34,33);res(28,14,30,16);res(20,16,25,21);
  // tall grass
  for(const[cx,cy,rx,ry]of GRASS)for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
    const dx=(x-cx)/rx,dy=(y-cy)/ry;if(dx*dx+dy*dy<=1&&getT(x,y)===0&&pathAtTile(x,y)>10&&!isRes(x,y)){setT(x,y,3);reserved[y*MW+x]=1}}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===3){const X=x*T,Y=y*T;
    addB({x:X+4,y:Y+8,img:SP.tuft[ri(0,4)],sh:0});addB({x:X+12,y:Y+8,img:SP.tuft[ri(0,4)],sh:0});addB({x:X+8,y:Y+16,img:SP.tuft[ri(0,4)],sh:0,grass:1})}
  // trees
  const tree=(x,y)=>{const pin=R()<.3;addB({x,y,img:pin?SP.pine[ri(0,2)]:SP.round[ri(0,6)],sh:pin?.6:.85,sc:pin?1.02:.98})};
  for(let ty=-10;ty<=MH+7;ty+=2){for(let tx=-8;tx<=3;tx+=2)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4));for(let tx=56;tx<=67;tx+=2)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4))}
  for(let tx=4;tx<56;tx+=2){for(let ty=-10;ty<=3;ty+=2)if(ty<-2||tx<27||tx>33)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4));for(let ty=77;ty<=87;ty+=2)tree(tc(tx)+rf(-5,5),tc(ty)+rf(-4,4))}
  for(let tx=4;tx<56;tx+=2)if(tx<26||tx>33)tree(tc(tx)+rf(-4,4),tc(47)+rf(-3,3));
  const scatter=(n,x0,x1,y0,y1,kind)=>{let k=0;for(let t=0;t<n*30&&k<n;t++){const x=ri(x0,x1),y=ri(y0,y1);
    if(kind==='tree'){let ok=true;for(let yy=y-2;yy<=y+1;yy++)for(let xx=x-2;xx<=x+2;xx++)if(getT(xx,yy)!==0||isRes(xx,yy))ok=false;if(!ok||pathAtTile(x,y)<16)continue;
      block(x-1,y,x+1,y);res(x-2,y-2,x+2,y+1);tree(tc(x)+rf(-3,3),(y+1)*T-3);k++}
    else{if(getT(x,y)!==0||isRes(x,y)||pathAtTile(x,y)<6)continue;block(x,y,x,y);res(x-1,y-1,x+1,y+1);
      if(kind==='bush')addB({x:tc(x),y:(y+1)*T-2,img:SP.bush[ri(0,3)],sh:.75,sc:.9});else addB({x:tc(x),y:(y+1)*T-3,img:R()<.5?SP.rock:WA.small[3],sh:.3,sc:.8});k++}}};
  scatter(34,5,54,6,44,'tree');scatter(9,5,54,50,75,'tree');scatter(12,5,54,6,44,'bush');scatter(12,5,54,50,75,'bush');scatter(10,5,54,6,44,'rock');scatter(4,5,54,50,75,'rock');
}

/* ================= ground texture ================= */
function vnoise(cell){const gw=Math.ceil(GW/cell)+2,gh=Math.ceil(GH/cell)+2,g=new Float32Array(gw*gh);for(let i=0;i<g.length;i++)g[i]=R();
  return (x,y)=>{const fx=x/cell,fy=y/cell,ix=fx|0,iy=fy|0;let tx=fx-ix,ty=fy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);const o=iy*gw+ix,a=g[o],b=g[o+1],c=g[o+gw],d=g[o+gw+1];return a+(b-a)*tx+(c-a)*ty+(a-b-c+d)*tx*ty}}
let ground;
function paintGround(){
  const img=new ImageData(GW,GH),d=img.data,n1=vnoise(48),n2=vnoise(12),nE=vnoise(5);
  const GP=[[74,132,54],[90,152,62],[108,170,70],[128,186,80]];
  for(let y=0;y<GH;y++){const wy=y-M,ty=wy>>4;for(let x=0;x<GW;x++){
    const n=n1(x,y)*.6+n2(x,y)*.3+R()*.22,c=GP[n<.42?0:n<.56?1:n<.7?2:3],i=(y*GW+x)*4,wx=x-M;let f=1;
    if(wx<0||wy<0||wx>=WWp||wy>=WHp)f=.74;else{const tx=wx>>4;if(tiles[ty*MW+tx]===3)f=.72;else if(tx<4||tx>55||ty<4||ty>76)f=.84}
    d[i]=c[0]*f;d[i+1]=c[1]*f;d[i+2]=c[2]*f;d[i+3]=255}}
  for(let k=0;k<30000;k++){const x=ri(0,GW-1),y=ri(0,GH-2),i=(y*GW+x)*4;d[i]=Math.min(255,d[i]*1.16);d[i+1]=Math.min(255,d[i+1]*1.12);d[i+2]=Math.min(255,d[i+2]*1.1);const j=i+GW*4;d[j]*=.86;d[j+1]*=.86;d[j+2]*=.86}
  const put=(wx,wy,c)=>{const i=((wy+M)*GW+wx+M)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2]};
  const DP=[[176,138,92],[192,156,106],[208,174,122]];
  for(let y=0;y<WHp;y++)for(let x=0;x<WWp;x++){const e=pathE[y*WWp+x];if(e>4)continue;const v=e+(nE(x+M,y+M)-.5)*6;
    if(v<0){const q=R()+n2(x+M,y+M)*.8;put(x,y,R()<.004?[150,146,140]:DP[q<.55?0:q<1.05?1:2])}else if(v<1.6)put(x,y,[132,104,70])}
  for(let y=Math.floor(PLAZA.cy-PLAZA.ry*1.1);y<PLAZA.cy+PLAZA.ry*1.1;y++)for(let x=Math.floor(PLAZA.cx-PLAZA.rx*1.1);x<PLAZA.cx+PLAZA.rx*1.1;x++){
    const dd=ellD(PLAZA,x,y);if(dd>=1.08)continue;if(dd>=1){put(x,y,[150,140,124]);continue}
    const row=Math.floor(y/7),off=(row%2)*5,col=Math.floor((x-off)/10),lx=((x-off)%10+10)%10,ly=y%7;
    if(lx===0||ly===0){put(x,y,[112,104,96]);continue}
    const h=((row*73856093)^(col*19349663))>>>0,cc=[[196,186,168],[180,170,154],[206,198,182],[170,164,150]][h%4];put(x,y,ly===1?shade(cc,1.08):cc)}
  for(let y=Math.floor(POND.cy-POND.ry*1.2);y<POND.cy+POND.ry*1.2;y++)for(let x=Math.floor(POND.cx-POND.rx*1.2);x<POND.cx+POND.rx*1.2;x++){
    const dd=ellD(POND,x,y)+(nE(x+M,y+M)-.5)*.12;if(dd>=1.08)continue;
    if(dd>=1.025)put(x,y,[206,190,150]);else if(dd>=1)put(x,y,[150,136,108]);else put(x,y,dd<.45?[40,98,160]:dd<.66?[52,120,178]:dd<.86?[70,150,196]:[96,180,206])}
  for(let k=0;k<160;k++){const x=ri(POND.cx-POND.rx,POND.cx+POND.rx),y=ri(POND.cy-POND.ry,POND.cy+POND.ry);if(ellD(POND,x,y)<.8){const L=ri(2,5);for(let q=0;q<L;q++)put(x+q,y,[226,246,255])}}
  const FC=[[240,92,112],[252,222,84],[246,246,252],[176,126,236],[255,150,70]];
  const flower=(x,y)=>{const tx=x>>4,ty=y>>4;if(getT(tx,ty)!==0&&!(ty===73))return;if(pathE[y*WWp+x]<4||ellD(PLAZA,x,y)<1.12||ellD(POND,x,y)<1.12)return;const c=FC[ri(0,4)];put(x,y,c);put(x+1,y,shade(c,.8))};
  for(let k=0;k<5000;k++)flower(ri(0,WWp-2),ri(0,WHp-1));
  for(let k=0;k<1600;k++)flower(ri(38*T,51*T-2),ri(74*T,76*T+12));
  for(let y=Math.floor(GREY.cy-GREY.ry*1.3);y<GREY.cy+GREY.ry*1.3;y++)for(let x=Math.floor(GREY.cx-GREY.rx*1.3);x<GREY.cx+GREY.rx*1.3;x++){
    const dd=ellD(GREY,x,y)+(nE(x+M,y+M)-.5)*.5;if(dd>=1.1)continue;const i=((y+M)*GW+x+M)*4,k=dd<.8?.92:(1.1-dd)/.3*.92,g=(d[i]*.3+d[i+1]*.5+d[i+2]*.2)*.92+26;
    d[i]+=(g-d[i])*k;d[i+1]+=(g-d[i+1])*k;d[i+2]+=(g+4-d[i+2])*k}
  ground=document.createElement('canvas');ground.width=GW;ground.height=GH;ground.getContext('2d').putImageData(img,0,0);
}

/* ================= actors ================= */
const DV=[[0,1],[0,-1],[-1,0],[1,0]],OPP=[1,0,3,2];
function actor(o){return Object.assign({fx:o.tx,fy:o.ty,t:1,moving:false,steps:0,queue:[],speed:4.2,sc:1.5},o)}
let player,follower,npcs=[];
const actorAt=(x,y,ex)=>npcs.find(n=>n!==ex&&!n.hidden&&n.tx===x&&n.ty===y);
function walkable(x,y,a){const t=getT(x,y);if(t!==0&&t!==3)return false;if(actorAt(x,y,a))return false;if(a!==player&&a!==follower&&player.tx===x&&player.ty===y)return false;return true}
function startMove(a,dir){const[dx,dy]=DV[dir];a.dir=dir;const nx=a.tx+dx,ny=a.ty+dy;if(!walkable(nx,ny,a))return false;a.fx=a.tx;a.fy=a.ty;a.tx=nx;a.ty=ny;a.t=0;a.moving=true;return true}
const apos=a=>{const t=a.moving?a.t:1;return{x:tc(a.fx+(a.tx-a.fx)*t),y:tc(a.fy+(a.ty-a.fy)*t)}};
function moveFollower(ox,oy){if(follower.tx===ox&&follower.ty===oy)return;follower.fx=follower.tx;follower.fy=follower.ty;
  const dx=ox-follower.tx,dy=oy-follower.ty;follower.dir=dx<0?2:dx>0?3:dy<0?1:0;follower.tx=ox;follower.ty=oy;follower.t=0;follower.moving=true;follower.speed=player.speed}

/* ================= camera / render ================= */
const cv=$('cv'),ctx=cv.getContext('2d'),lc=document.createElement('canvas'),lx=lc.getContext('2d'),ec=document.createElement('canvas'),ex=ec.getContext('2d');
let vw,vh,iw,ih,F,HC,hor,rTop,camX,camY,skyC;
const DZP=300,DZMAX=1150;
const TIMES={
  am:{label:'☀ AM',sky:[[0,'#6eaee8'],[.6,'#aed4f0'],[1,'#e4ece2']],fog:'#d7e4dc',mtn:['#9bb6cf','#7d9cae'],grade:'#fff8ec',shA:.3,shDX:-.25,shaft:[255,240,190],shaftA:.05,part:{c:'255,248,214',n:38,k:'mote'}},
  pm:{label:'◐ PM',sky:[[0,'#3e3c7a'],[.35,'#a85a7c'],[.7,'#f2955a'],[1,'#ffcf8e']],fog:'#f5c08c',mtn:['#9a6a84','#704c6a'],grade:'#ffcfa4',shA:.42,shDX:-1.5,shaft:[255,190,110],shaftA:.11,sun:1,part:{c:'255,214,150',n:55,k:'mote'}},
  night:{label:'☾ NIGHT',sky:[[0,'#070b22'],[.6,'#1a2452'],[1,'#323e74']],fog:'#2c3868',mtn:['#28325a','#1d2546'],ambient:'rgb(66,80,140)',shA:.22,shDX:0,part:{c:'190,255,120',n:46,k:'fly'}}};
let tod='am';
function resize(){vw=innerWidth;vh=innerHeight;const portrait=vh>vw*1.05,ps=portrait?vw/240:vh/270;
  iw=Math.round(vw/ps);ih=Math.round(vh/ps);for(const c of[cv,lc,ec]){c.width=iw;c.height=ih}
  const Sp=portrait?1:1.25;F=Sp*DZP;HC=portrait?280:186;const psy=(portrait?.62:.68)*ih;hor=psy-F*HC/DZP;rTop=hor+F*HC/DZMAX;
  for(const c of[ctx,lx,ex])c.imageSmoothingEnabled=false;buildSky()}
function buildSky(){const t=TIMES[tod],h=Math.max(2,Math.ceil(rTop)+2);skyC=document.createElement('canvas');skyC.width=iw;skyC.height=h;const s=skyC.getContext('2d');
  const g=s.createLinearGradient(0,0,0,h);for(const[p,c]of t.sky)g.addColorStop(p,c);s.fillStyle=g;s.fillRect(0,0,iw,h);
  const r2=mulberry(7);
  if(tod==='night'){for(let i=0;i<90;i++){s.fillStyle=`rgba(255,255,255,${.3+r2()*.7})`;s.fillRect(r2()*iw|0,r2()*h*.85|0,1,1)}}
  else for(let i=0;i<5;i++){const cx=r2()*iw,cy=r2()*h*.55;for(let k=0;k<5;k++){const rx=12+r2()*26,ox=(r2()-.5)*40,oy=(r2()-.5)*6;const gg=s.createRadialGradient(cx+ox,cy+oy,0,cx+ox,cy+oy,rx);
    const col=tod==='pm'?'255,180,150':'255,255,255';gg.addColorStop(0,`rgba(${col},.55)`);gg.addColorStop(1,`rgba(${col},0)`);s.fillStyle=gg;s.fillRect(cx+ox-rx,cy+oy-rx,rx*2,rx*2)}}
  if(t.sun){const sx=iw*.78,sy=h-14,gg=s.createRadialGradient(sx,sy,0,sx,sy,90);gg.addColorStop(0,'rgba(255,240,190,1)');gg.addColorStop(.12,'rgba(255,220,150,.9)');gg.addColorStop(1,'rgba(255,160,90,0)');s.fillStyle=gg;s.fillRect(0,0,iw,h)}
  $('timeBtn').textContent=t.label}
function project(x,y){const dz=camY-y;if(dz<10)return null;const s=F/dz;return{sx:iw/2+(x-camX)*s,sy:hor+F*HC/dz,s,dz}}

let particles=[],leaves=[];
function initParticles(){const p=TIMES[tod].part;particles=[];for(let i=0;i<p.n;i++)particles.push({x:Math.random()*iw,y:Math.random()*ih,vx:(Math.random()-.5)*4,vy:p.k==='fly'?(Math.random()-.5)*4:-2-Math.random()*4,ph:Math.random()*6,z:Math.random()})}

function render(now){
  const t=TIMES[tod],pp=apos(player);camX=pp.x;camY=pp.y+7+DZP;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.fillStyle=t.fog;ctx.fillRect(0,0,iw,ih);
  if(rTop>0){ctx.drawImage(skyC,0,0);
    // mountains (parallax)
    t.mtn.forEach((col,li)=>{ctx.fillStyle=col;ctx.beginPath();const base=rTop+2,amp=Math.min(46,rTop*.5)*(li?0.6:1),off=camX*(li?.06:.03)+li*400;ctx.moveTo(0,base+4);
      for(let x=0;x<=iw+4;x+=4){const X=x+off;ctx.lineTo(x,base-amp*(.55*Math.sin(X/70)+.3*Math.sin(X/27+1.3)+.15*Math.sin(X/11+2)+.6)/1.6)}ctx.lineTo(iw,base+4);ctx.fill()})}
  // ground (mode-7 scanlines)
  for(let r=Math.max(0,Math.floor(rTop));r<ih;r++){const dz=F*HC/(r+.5-hor);if(dz>DZMAX*1.02||dz<=0)continue;const wy=Math.floor(camY-dz)+M;
    if(wy<0||wy>=GH)continue;const s=F/dz;let sw=iw/s,sx=camX-sw/2+M;if(sw>GW){sw=GW;sx=0}sx=clamp(sx,0,GW-sw);ctx.drawImage(ground,sx,wy,sw,1,0,r,iw,1)}
  if(rTop>-60){const g=ctx.createLinearGradient(0,rTop-2,0,rTop+ih*.16);g.addColorStop(0,t.fog);g.addColorStop(1,t.fog+'00');ctx.fillStyle=g;ctx.fillRect(0,Math.max(0,rTop-2),iw,ih*.17)}
  // collect drawables
  const list=[];
  const push=(o,x,y)=>{const p=project(x,y);if(!p||p.dz>DZMAX*1.3)return;const w=o.img.width*o.sc*p.s,h=o.img.height*o.sc*p.s;
    if(p.sx+w/2<-4||p.sx-w/2>iw+4||p.sy-h>ih||p.sy-(o.lift||0)*p.s<-4-h*0)return;
    list.push({o,x,y,p,w,h})};
  for(const e of ents)if(!e.dead)push(e,e.x,e.y);
  const actorDraw=(a,frames,extra)=>{const q=apos(a);const f=a.moving&&a.t<.5?(a.steps%2?1:2):0;
    push(Object.assign({img:frames[a.dir][f],sc:a.sc,sh:a.sh||.75},extra||{}),q.x,q.y+6)};
  for(const n of npcs){if(n.hidden)continue;actorDraw(n,n.frames);if(n.bubble){const q=apos(n);push({img:SP.bubble,sc:1.3,sh:0,lift:32},q.x,q.y+6.01)}}
  actorDraw(player,player.frames);
  if(follower.frames){const q=apos(follower),hop=follower.moving?Math.sin(follower.t*Math.PI)*2.5:0;push({img:follower.frames[follower.dir][follower.moving?follower.steps%2:(now%1400<700?0:1)],sc:.9,sh:.5,lift:hop},q.x,q.y+5)}
  list.sort((a,b)=>a.y-b.y||a.x-b.x);
  // shadows
  ctx.fillStyle='rgb(20,28,40)';
  for(const d of list){if(!d.o.sh)continue;const w=d.o.img.width*.42*d.o.sh*d.p.s*(d.o.sc>1.2?.7:1),hh=w*.32,ox=t.shDX*w*.6;ctx.globalAlpha=t.shA*Math.min(1,d.o.fade);ctx.beginPath();ctx.ellipse(d.p.sx+ox,d.p.sy-hh*.2,w+Math.abs(ox)*.5,hh,0,0,6.283);ctx.fill()}
  ctx.globalAlpha=1;
  const night=tod==='night';if(night){ex.globalCompositeOperation='source-over';ex.clearRect(0,0,iw,ih)}
  for(const d of list){const fa=clamp((DZMAX*1.3-d.p.dz)/(DZMAX*.5),0,1)*clamp((d.p.dz-120)/80,0,1)*(d.o.big?clamp((d.p.dz-222)/22,0,1):1);if(fa<=0)continue;ctx.globalAlpha=fa;
    const X=Math.round(d.p.sx-d.w/2),Y=Math.round(d.p.sy-d.h-(d.o.lift||0)*d.p.s),W=Math.round(d.w),Hh=Math.round(d.h);
    ctx.drawImage(d.o.img,X,Y,W,Hh);
    if(night){ex.globalCompositeOperation='destination-out';ex.drawImage(d.o.img,X,Y,W,Hh);if(d.o.emis){ex.globalCompositeOperation='source-over';ex.drawImage(d.o.emis,X,Y,W,Hh)}}}
  ctx.globalAlpha=1;
  if(night){lx.globalCompositeOperation='source-over';lx.fillStyle=t.ambient;lx.fillRect(0,0,iw,ih);lx.globalCompositeOperation='lighter';
    const flick=1+Math.sin(now/90)*.03;
    for(const L of lights){const p=project(L.x,L.y);if(!p||p.dz>DZMAX)continue;const r=L.r*p.s*flick,cy=p.sy-L.hgt*p.s*.55;
      const g=lx.createRadialGradient(p.sx,cy,0,p.sx,cy,r);g.addColorStop(0,'rgba(255,190,110,.95)');g.addColorStop(.5,'rgba(230,140,70,.35)');g.addColorStop(1,'rgba(200,110,60,0)');lx.fillStyle=g;lx.fillRect(p.sx-r,cy-r,r*2,r*2)}
    ctx.globalCompositeOperation='multiply';ctx.drawImage(lc,0,0);ctx.globalCompositeOperation='source-over';ctx.drawImage(ec,0,0);
    ctx.globalCompositeOperation='lighter';
    for(const L of lights){const p=project(L.x,L.y);if(!p||p.dz>DZMAX)continue;const cy=p.sy-L.hgt*p.s,r=(L.lamp?16:13)*p.s;
      const g=ctx.createRadialGradient(p.sx,cy,0,p.sx,cy,r);g.addColorStop(0,'rgba(255,210,140,.55)');g.addColorStop(1,'rgba(255,160,80,0)');ctx.fillStyle=g;ctx.fillRect(p.sx-r,cy-r,r*2,r*2)}
  } else {
    ctx.globalCompositeOperation='multiply';ctx.fillStyle=t.grade;ctx.fillRect(0,0,iw,ih);
    ctx.globalCompositeOperation='lighter';
    const sx=iw*(tod==='pm'?.95:.85),sy=-ih*.15;
    for(let i=0;i<6;i++){const a=(tod==='pm'?2.25:2.05)+i*.09+Math.sin(now/3000+i)*.015,len=ih*2,wd=10+((i*37)%25);
      const ex_=sx+Math.cos(a)*len,ey=sy+Math.sin(a)*len,nx=-Math.sin(a)*wd,ny=Math.cos(a)*wd;
      const g=ctx.createLinearGradient(ex_-nx,ey-ny,ex_+nx,ey+ny);const c=t.shaft.join(',');g.addColorStop(0,`rgba(${c},0)`);g.addColorStop(.5,`rgba(${c},${t.shaftA*(.6+(i%3)*.25)})`);g.addColorStop(1,`rgba(${c},0)`);
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex_+nx,ey+ny);ctx.lineTo(ex_-nx,ey-ny);ctx.fill()}
    if(tod==='pm'){const g=ctx.createRadialGradient(iw*.85,rTop,0,iw*.85,rTop,ih*.9);g.addColorStop(0,'rgba(255,170,90,.28)');g.addColorStop(1,'rgba(255,140,80,0)');ctx.fillStyle=g;ctx.fillRect(0,0,iw,ih)}
  }
  // particles
  ctx.globalCompositeOperation='lighter';const pc=t.part.c;
  for(const q of particles){const a=t.part.k==='fly'?Math.max(0,Math.sin(now/400+q.ph))*.9:.35+.25*Math.sin(now/700+q.ph);const sz=q.z>.8?2:1;ctx.fillStyle=`rgba(${pc},${a})`;ctx.fillRect(q.x|0,q.y|0,sz,sz);
    if(t.part.k==='fly'&&a>.4){ctx.fillStyle=`rgba(${pc},${a*.25})`;ctx.fillRect((q.x|0)-1,(q.y|0)-1,3,3)}}
  ctx.globalCompositeOperation='source-over';
  for(const l of leaves){ctx.fillStyle=l.c;ctx.fillRect(l.x|0,l.y|0,2,1)}
}

