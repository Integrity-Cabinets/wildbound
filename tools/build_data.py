# Builds src/data.json from the asset pack + combat data. World art is colour-graded toward the engine palette.
import json,base64,io,re,colorsys
from PIL import Image
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A=ROOT+'/assets/'
sp=json.load(open(ROOT+'/data/species.json'))
nat=json.load(open(ROOT+'/data/natures.json'))
traits={t['name']:t['effect'] for t in json.load(open(ROOT+'/data/traits.json'))}
chart=json.load(open(ROOT+'/data/chart.json'))
def enc(im):
    b=io.BytesIO();im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def uri(p,crop=False):
    im=Image.open(p).convert('RGBA')
    if crop: im=im.crop(im.getchannel('A').getbbox())
    return enc(im)
def grade(im):
    """Shift pack colours toward the engine's brighter, cleaner palette."""
    im=im.convert('RGBA');px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            if not a: continue
            h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255);d=h*360
            if 55<=d<=170 and s>.18:   # foliage greens: cleaner hue, brighter
                d=d+(118-d)*.45;s=min(1,s*1.22+.04);v=min(1,v*1.16+.02)
            elif v<.28: pass            # keep outlines dark
            else: s=min(1,s*1.12);v=min(1,v*1.06)
            r,g,b=colorsys.hsv_to_rgb(d/360,s,v);px[x,y]=(round(r*255),round(g*255),round(b*255),a)
    return im
def cells(path,fw,fh,n,rows=1,g=True):
    im=Image.open(path).convert('RGBA');out=[]
    for r in range(rows):
        for c in range(n):
            t=im.crop((c*fw,r*fh,c*fw+fw,r*fh+fh));out.append(enc(grade(t) if g else t))
    return out
def glass(im,warm=(255,214,130)):
    """Emissive mask (lit windows/lamp glass) and light positions."""
    im=im.convert('RGBA');e=Image.new('RGBA',im.size,(0,0,0,0));px=im.load();ex=e.load();pts=[]
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            if not a: continue
            h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
            if 160<=h*360<=215 and s>.14 and v>.45: ex[x,y]=warm+(255,);pts.append((x,y))
    # cluster into windows
    seen=set();wins=[];P=set(pts)
    for p in pts:
        if p in seen: continue
        st=[p];seen.add(p);cl=[]
        while st:
            q=st.pop();cl.append(q)
            for dx in range(-3,4):
                for dy in range(-3,4):
                    n=(q[0]+dx,q[1]+dy)
                    if n in P and n not in seen: seen.add(n);st.append(n)
        if len(cl)>=12: wins.append([round(sum(c[0] for c in cl)/len(cl)),round(sum(c[1] for c in cl)/len(cl))])
    return enc(e),wins
SPR={};K={}
YM={'HP':'hp','Attack':'atk','Defense':'def','Sp. Atk':'spa','Sp. Def':'spd','Speed':'spe'}
IDLE={'peeplark','skyrook','lumoth','threadwraith'}
def pair(path):
    im=Image.open(path).convert('RGBA');a=im.crop((0,0,96,96));b=im.crop((96,0,192,96))
    u=Image.alpha_composite(a,b).getchannel('A').getbbox();return enc(a.crop(u)),enc(b.crop(u))
for s in sp:
    k=s['name'].lower();fid=k if os.path.exists(A+f'creatures/mon_{k}_front.png') else {'threadwraith':'23'}.get(k,k);c=A+f'creatures/mon_{fid}_'
    e={'fo':uri(c+'follow.png'),'ic':uri(c+'icon.png')}
    if k in IDLE: e['f'],e['f2']=pair(c+'idle.png');e['b'],e['b2']=pair(c+'back_idle.png')
    else: e['f']=uri(c+'front.png',True);e['b']=uri(c+'back.png',True)
    SPR[k]=e
    st=s['stats'];y={}
    for part in s['cond_yield'].split(','):
        m=re.match(r'\s*(\d+)\s+(.+)',part);y[YM[m.group(2).strip()]]=int(m.group(1))
    evo=None;ev=s['evolution']
    if k=='silkling': evo={'lv':10,'F':'lumoth','M':'threadwraith'}
    else:
        m=re.match(r'(\w+) at level (\d+)',ev)
        if m: evo={'lv':int(m.group(2)),'to':m.group(1).lower()}
    K[k]={'no':s['no'],'name':s['name'],'types':s['types'],'stats':[st[x] for x in['hp','atk','def','spa','spd','spe']],'dex':s['dex'],'concept':s['concept'],
          'growth':s['growth'],'catch':s['catch'],'xp':s['base_xp'],'yield':y,'evo':evo,'fem':s['gender_female_pct'],'traits':s['traits'],'learn':s['learnset'],'evoText':ev}
C={}
for n in ['rowan','ivy']: C[n]={'walk':uri(A+f'characters/char_{n}_walk.png'),'run':uri(A+f'characters/char_{n}_run.png'),'port':uri(A+f'characters/char_{n}_portrait.png')}
for n in ['cole','wren','june']: C[n]={'walk':uri(A+f'characters/char_{n}_walk.png'),'port':uri(A+f'characters/char_{n}_portrait.png')}
C['cole']['battle']=uri(A+'characters/char_cole_battle.png',True)
for f in sorted(os.listdir(A+'characters')):
    m=re.match(r'char_(npc_\w+)_walk\.png$',f)
    if m: C[m.group(1)]={'walk':uri(A+'characters/'+f)}
W={'trees':cells(A+'props/props_hearthmoss_trees.png',64,80,5),'plants':cells(A+'props/props_hearthmoss_plants.png',32,24,6),
   'grass':cells(A+'tiles/tiles_tallgrass.png',20,18,3,2),'small':cells(A+'props/props_hearthmoss_small.png',64,64,4,2),
   'large':cells(A+'props/props_hearthmoss_large.png',64,64,4),'fence':cells(A+'props/props_hearthmoss_fences.png',32,32,8),'bld':{}}
for n in ['player_house','wren_lab','hearthmoss_house_a','hearthmoss_house_b']:
    im=grade(Image.open(A+f'props/bld_{n}.png'));em,wins=glass(im);W['bld'][n]={'img':enc(im),'emis':em,'wins':wins,'w':im.width,'h':im.height}
# Cindervale City: buildings, and prop sheets kept apart from the Hearthmoss ones
for n in ['gym','archive_station','rest_lodge','shop','house_a','house_b','mine_entrance']:
    im=grade(Image.open(A+f'props/bld_cindervale_{n}.png'));em,wins=glass(im);W['bld']['cindervale_'+n]={'img':enc(im),'emis':em,'wins':wins,'w':im.width,'h':im.height}
W['cv']={'small':cells(A+'props/props_cindervale_small.png',64,64,4,2),'large':cells(A+'props/props_cindervale_large.png',96,96,3,2)[:5],
         'fence':cells(A+'props/props_cindervale_fences.png',32,32,4,2)}
# Route 2 uplands and the Cindervale mines (Batch 2). Cell sizes are in the .layout.json beside each sheet.
P=A+'props/props_'
W['r2']={'trees':cells(P+'route2_trees.png',64,80,5),'rocks':cells(P+'route2_rocks.png',64,64,4,2)[:7],'veg':cells(P+'route2_vegetation.png',64,48,4,2),
         'debris':cells(P+'route2_debris.png',96,80,3,2)[:5],'ledges':cells(P+'route2_ledges.png',112,96,3)}
W['mine']={'small':cells(P+'mine_small.png',64,64,3,3),'large':cells(P+'mine_large.png',128,128,2,2)}
def warm(cell):
    e=Image.new('RGBA',cell.size,(0,0,0,0));cp=cell.load();ep=e.load()
    for y in range(cell.height):
        for x in range(cell.width):
            r,g,b,a=cp[x,y]
            if a and r>215 and g>170 and b<205: ep[x,y]=(255,226,150,255)
    return enc(e)
cvs=Image.open(A+'props/props_cindervale_small.png').convert('RGBA')
W['cv']['lanternEmis']=warm(cvs.crop((0,0,64,64)))
lamp=Image.open(A+'props/props_hearthmoss_small.png').convert('RGBA').crop((128,0,192,64))
le=Image.new('RGBA',(64,64),(0,0,0,0));lp=lamp.load();lq=le.load()
for y in range(64):
    for x in range(64):
        r,g,b,a=lp[x,y]
        if a and r>215 and g>180 and b<190 and y<28: lq[x,y]=(255,226,150,255)
W['lampEmis']=enc(le)
U={'titleBg':uri(A+'ui/ui_title_background.png'),'logo':uri(A+'ui/ui_title_logo.png'),'orb':uri(A+'ui/item_tether_orb.png'),'salve':uri(A+'ui/item_potion.png')}
used={t for k in K for t in K[k]['traits']}
D={'spr':SPR,'kith':K,'chars':C,'chart':chart,'nat':nat,'traits':{t:traits[t] for t in sorted(used)},'world':W,'ui':U}
json.dump(D,open(ROOT+'/src/data.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(json.dumps(D))//1024,'KB',len(SPR),'sprite sets',{n:W['bld'][n]['wins'] for n in W['bld']})
