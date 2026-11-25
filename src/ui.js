/* Phones: stop pinch and double-tap from zooming the page, and snap back if the browser zooms anyway. */
for(const ev of['gesturestart','gesturechange','gestureend'])document.addEventListener(ev,e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault());
if(window.visualViewport){const mv=document.querySelector('meta[name=viewport]'),base=mv.content;let rt=0;
  const unzoom=()=>{if(visualViewport.scale>1.02||visualViewport.offsetTop>1||visualViewport.offsetLeft>1){clearTimeout(rt);rt=setTimeout(()=>{mv.content=base+',minimum-scale=1';setTimeout(()=>{mv.content=base},60);scrollTo(0,0)},180)}};
  visualViewport.addEventListener('resize',unzoom);visualViewport.addEventListener('scroll',unzoom)}
const UI=(()=>{const q=id=>document.getElementById(id),el=q('ch'),ti=q('chT'),hd=q('chH'),li=q('chL');let cur=null,sel=0,evoOpen=false;
  const btns=()=>[...li.querySelectorAll('button')];
  function hi(still){btns().forEach((b,i)=>b.classList.toggle('sel',i===sel));const b=btns()[sel];if(!still&&b&&b.scrollIntoView)b.scrollIntoView({block:'nearest'})}
  function close(v){const c=cur;cur=null;el.style.display='none';c.res(v)}
  function choose({title='',html='',opts=[],cancel=true}){return new Promise(res=>{cur={res,cancel};ti.textContent=title;hd.innerHTML=html;hd.style.display=html?'block':'none';li.innerHTML='';
    opts.forEach((o,i)=>{const b=document.createElement('button');b.className='chO';b.disabled=!!o.dis;
      b.innerHTML=(o.icon?`<i class="ic" style="background-image:url(${o.icon})"></i>`:o.pic?`<img class="pic" src="${o.pic}">`:o.ico?`<img class="ico" src="${o.ico}">`:'')+`<span><b>${o.label}</b>${o.sub?`<small>${o.sub}</small>`:''}${o.hp!=null?`<em><u style="width:${Math.max(0,Math.min(1,o.hp))*100}%;background:${o.hp>.5?'#5bd06a':o.hp>.2?'#e0b040':'#e0503a'}"></u></em>`:''}</span>`;
      b.style.setProperty('--i',Math.min(i,9));b.onmouseenter=()=>{if(!b.disabled){sel=btns().indexOf(b);hi(1)}};b.onclick=()=>close(i);li.appendChild(b)});
    if(cancel){const b=document.createElement('button');b.className='chO back';b.innerHTML='<span><b>Back</b></span>';b.style.setProperty('--i',Math.min(opts.length,9));b.onmouseenter=()=>{sel=btns().indexOf(b);hi(1)};b.onclick=()=>close(-1);li.appendChild(b)}
    const bs=btns();sel=Math.max(0,bs.findIndex(b=>!b.disabled));hi();const bx=q('chB');bx.style.animation='none';el.style.display='flex';bx.offsetWidth;bx.style.animation='';el.scrollTop=0;bx.scrollTop=0})}
  addEventListener('keydown',e=>{if(!cur)return;e.stopImmediatePropagation();const bs=btns(),k=e.key;
    const mv=d=>{for(let i=0;i<bs.length;i++){sel=(sel+d+bs.length)%bs.length;if(!bs[sel].disabled)break}hi()};
    if(k==='ArrowDown'||k==='s'||k==='S'){mv(1);e.preventDefault()}else if(k==='ArrowUp'||k==='w'||k==='W'){mv(-1);e.preventDefault()}
    else if(k==='z'||k==='Z'||k==='Enter'||k===' '){if(e.repeat)return;e.preventDefault();const b=bs[sel];if(b&&!b.disabled)b.click()}
    else if(k==='x'||k==='X'||k==='Escape'){e.preventDefault();if(cur.cancel)close(-1)}},true);
  const fd=q('fade');
  function fade(on){return new Promise(r=>{fd.style.pointerEvents=on?'auto':'none';fd.style.opacity=on?1:0;setTimeout(r,430)})}
  const one=src=>new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.src=src});
  async function evolve(from,to,name){evoOpen=true;const ev=q('evo'),cv=q('evoC'),x=cv.getContext('2d'),tx=q('evoT');x.imageSmoothingEnabled=false;
    const a=await one(DATA.spr[from].f),b=await one(DATA.spr[to].f);
    const draw=(im,white)=>{x.clearRect(0,0,96,96);x.drawImage(im,Math.round(48-im.width/2),92-im.height);if(white){x.globalCompositeOperation='source-atop';x.fillStyle=`rgba(255,255,255,${white})`;x.fillRect(0,0,96,96);x.globalCompositeOperation='source-over'}};
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    draw(a,0);tx.textContent=`What? ${name} is changing!`;ev.style.display='flex';await wait(1400);
    for(let i=0;i<=10;i++){draw(a,i/10);await wait(60)}
    let d=260;for(let i=0;i<16;i++){draw(i%2?b:a,1);await wait(d);d=Math.max(50,d*.84)}
    ev.classList.add('pop');for(let i=10;i>=0;i--){draw(b,i/10);await wait(50)}
    tx.textContent=`${name} evolved into ${DATA.kith[to].name}!`;await wait(2200);ev.classList.remove('pop');ev.style.display='none';evoOpen=false}
  return{choose,fade,evolve,isOpen:()=>!!cur||evoOpen}})();
