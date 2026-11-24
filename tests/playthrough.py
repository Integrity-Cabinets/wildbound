"""Continuous Chapter One playthrough of dist/index.html with real input (keys, touch pad, clicks).

    python3 tests/playthrough.py desk  [foxfern|kindlit|ottide]    # 1280x720, keyboard
    python3 tests/playthrough.py phone [foxfern|kindlit|ottide]    # 390x844, touch controls

Plays from the title screen through Hearthmoss, Route 1 and Route 2 to Cindervale City and the
End of Chapter One card, opens every menu, saves, reloads and continues. It reads state through window.WB only to decide what to press; it never warps or edits
state. Battles are random, so turn counts differ between runs.

Writes a log, a JSON report and screenshots to tests/shots/playthrough/ (git-ignored).
Exits 1 if the run stops early, the page logs an error, or suspicious text ("undefined", "NaN") appears.
Needs: pip install playwright, then playwright install chromium. Takes about eight minutes.
"""
import asyncio, json, sys, time, heapq, re
from pathlib import Path
from playwright.async_api import async_playwright

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / 'tests' / 'shots' / 'playthrough'
NAME = sys.argv[1] if len(sys.argv) > 1 else 'desk'
if NAME not in ('desk', 'phone'): sys.exit(__doc__)
W, H, MOB = (390, 844, True) if NAME == 'phone' else (1280, 720, False)
STARTER = sys.argv[2] if len(sys.argv) > 2 else 'foxfern'
if STARTER not in ('foxfern', 'kindlit', 'ottide'): sys.exit(__doc__)
OUT.mkdir(parents=True, exist_ok=True)

SNAP = """(()=>{const p=WB.player,d=id=>getComputedStyle(document.getElementById(id)).display!=='none';
return {tx:p?p.tx:null,ty:p?p.ty:null,dir:p?p.dir:null,moving:p?!!p.moving:false,dlg:WB.G?WB.dlg:null,
who:document.querySelector('#dlg .nm').textContent,scripting:WB.scripting,battle:Battle.isOpen(),
bbusy:document.getElementById('b_app').classList.contains('busy'),ch:d('ch'),evo:d('evo'),title:d('title'),
busy:WB.busy(),fade:+getComputedStyle(document.getElementById('fade')).opacity>0.05}})()"""
CHOOSER = """(()=>({title:document.getElementById('chT').textContent,html:document.getElementById('chH').innerText,
opts:[...document.querySelectorAll('#chL button')].map(b=>({t:b.innerText.replace(/\\n+/g,' | '),dis:b.disabled}))}))()"""
BATTLE = """(()=>{const B=Battle.dbg();if(!B||!B.me||!B.foe)return null;const m=x=>({n:x.name,key:x.key,hp:x.hp,max:x.max,L:x.L,brn:x.brn,par:x.par});
return {kind:B.kind,me:m(B.me),foe:m(B.foe),bag:Object.assign({},B.bag),party:B.party.map(k=>({sp:k.sp,hp:k.hp,L:k.L})),
caught:Object.keys(B.dex.caught),msg:document.getElementById('b_msg').innerText,
moves:[...document.querySelectorAll('#b_moves button')].map(b=>{const n=b.childNodes[0].textContent,M=Battle.MV[n]||{};return {n,p:M.p||0,c:M.c,cls:b.className,dis:b.disabled,txt:b.innerText.replace(/\\n+/g,' | ')}})}})()"""
PARTY = """(()=>{const G=WB.G;return {party:G.party.map(k=>({sp:k.sp,L:k.L,hp:k.hp,max:Battle.calcStats(k).hp,st:k.st,moves:k.moves.map(m=>m.n+' '+m.pp),trait:k.trait,nat:Battle.NAT[k.nat].name})),
box:G.box.length,bag:G.bag,flags:G.flags,wins:G.wins,seen:Object.keys(G.dex.seen),caught:Object.keys(G.dex.caught),pos:[WB.player.tx,WB.player.ty],map:WB.map,heal:G.heal||null,music:Battle.music()}})()"""
GRID = """(()=>{const g=[],[w,h]=WB.size();for(let y=0;y<h;y++){const r=[];for(let x=0;x<w;x++)r.push(WB.getT(x,y));g.push(r)}
return {g,npcs:WB.npcs.filter(n=>!n.hidden).map(n=>[n.tx,n.ty,n.id])}})()"""
DV = [(0, 1), (0, -1), (-1, 0), (1, 0)]            # down, up, left, right  (matches the game's dir numbering)
KEY = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']
BAD = re.compile(r'undefined|NaN|\[object|null\b')


class Stuck(Exception):
    pass


class Bot:
    def __init__(s, pg):
        s.pg = pg; s.t0 = time.time(); s.log = []; s.errs = []; s.dialog = []; s.battles = []; s.cur = None
        s.plans = []; s.lastdlg = None; s.nshot = 0; s.flags = []; s.stage = 'boot'; s.stages = []
        s.want_catch = False; s.steps = 0; s.held = None; s.unexpected = []

    def note(s, *a):
        line = f"[{time.time() - s.t0:6.1f}s {s.stage}] " + ' '.join(str(x) for x in a)
        s.log.append(line); print(line, flush=True)

    def check(s, text, where):
        if text and BAD.search(text): s.flags.append(f'{where}: {text[:160]}'); s.note('!! suspicious text', where, text[:120])

    async def js(s, code): return await s.pg.evaluate(code)
    async def wait(s, ms): await s.pg.wait_for_timeout(ms)
    async def snap(s): return await s.js(SNAP)

    async def shot(s, tag):
        s.nshot += 1; p = OUT / f'{NAME}_{s.nshot:02d}_{tag}.png'
        await s.pg.screenshot(path=str(p)); s.note('shot', p.name)

    def begin(s, name):
        if s.stages: s.stages[-1]['end'] = time.time() - s.t0
        s.stage = name; s.stages.append({'name': name, 'start': time.time() - s.t0}); s.note('--- stage', name)

    # ---------- input ----------
    async def pressA(s):
        if MOB: await s.pg.locator('#game').click(position={'x': W // 2, 'y': H // 3}, force=True) if (await s.snap())['dlg'] is not None else await s.pg.locator('#btnA').click(force=True)
        else: await s.pg.keyboard.press('z')

    async def dir_down(s, d):
        if s.held == d: return
        await s.dir_up()
        if MOB:
            bb = await s.pg.locator('#dpad').bounding_box(); cx, cy = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
            r = bb['width'] * .32; await s.pg.mouse.move(cx + DV[d][0] * r, cy + DV[d][1] * r); await s.pg.mouse.down()
        else: await s.pg.keyboard.down(KEY[d])
        s.held = d

    async def dir_up(s):
        if s.held is None: return
        if MOB: await s.pg.mouse.up()
        else: await s.pg.keyboard.up(KEY[s.held])
        s.held = None

    async def run_key(s, on):
        if MOB: return
        if on: await s.pg.keyboard.down('Shift')
        else: await s.pg.keyboard.up('Shift')

    # ---------- choosers ----------
    def plan(s, substr, pick): s.plans.append((substr, pick))

    async def on_chooser(s):
        info = await s.js(CHOOSER); t = info['title']; opts = info['opts']
        s.check(t + ' ' + info['html'] + ' ' + ' '.join(o['t'] for o in opts), 'chooser')
        idx = None
        if s.plans and s.plans[0][0] in t:
            _, pick = s.plans.pop(0); idx = await pick(info) if asyncio.iscoroutinefunction(pick) else pick(info)
        elif t.startswith('Teach ') or 'wants to learn' in t:
            newp = int((re.search(r'Power (\d+)', info['html']) or [0, 0])[1])
            pw = [int((re.search(r'Power (\d+)', o['t']) or [0, 0])[1]) for o in opts[:4]]
            lo = min(range(len(pw)), key=lambda i: pw[i])
            idx = lo if newp > pw[lo] else len(opts) - 1
            s.note('move choice:', t, '|', info['html'].strip(), '->', opts[idx]['t'])
        elif 'next Kith' in t: idx = next(i for i, o in enumerate(opts) if not o['dis'])
        elif t in ('Saved', 'Could not save', 'End of Chapter One'):
            if t != 'Saved': await s.shot('card_' + t.replace(' ', '_').lower())
            s.note('card:', t, '|', info['html'].replace('\n', ' ')); idx = 0
        else:
            s.unexpected.append(t); s.note('!! unexpected chooser', t, [o['t'] for o in opts]); idx = len(opts) - 1
        if idx is None or idx < 0: idx = len(opts) - 1
        s.note('choose', repr(t), '->', opts[idx]['t'] if opts else '(none)')
        await s.pg.locator('#chL button').nth(idx).click(); await s.wait(180)

    # ---------- battle ----------
    async def on_battle(s, sn):
        if s.cur is None:
            s.cur = {'t': time.time() - s.t0, 'turns': 0, 'msgs': [], 'acts': [], 'stage': s.stage, 'shot': False}
        b = await s.js(BATTLE)
        if b and b['msg'] and (not s.cur['msgs'] or s.cur['msgs'][-1] != b['msg']):
            s.cur['msgs'].append(b['msg']); s.check(b['msg'], 'battle')
        if b and 'kind' not in s.cur:
            s.cur.update(kind=b['kind'], foe=f"{b['foe']['n']} L{b['foe']['L']}", me0=f"{b['me']['n']} L{b['me']['L']} {b['me']['hp']}/{b['me']['max']}")
            s.note('battle start', s.cur['kind'], 'vs', s.cur['foe'], '| me', s.cur['me0'])
        if sn['bbusy'] or not b or not b['moves']: await s.wait(110); return
        me, foe, bag = b['me'], b['foe'], b['bag']
        if not s.cur['shot']:
            s.cur['shot'] = True
            if len(s.battles) < 3 or s.cur.get('kind') == 'trainer': await s.shot('battle_menu')
        s.cur['turns'] += 1
        dmg = [m for m in b['moves'] if m['p'] and not m['dis']]
        sc = lambda m: m['p'] * (2 if ' se' in m['cls'] else .5 if 'nve' in m['cls'] else 1)
        act = None
        catch = s.want_catch and b['kind'] == 'wild' and bag.get('orb', 0) > 0 and foe['key'] not in b['caught'] and len(b['party']) < 6
        if me['hp'] / me['max'] < .34 and bag.get('salve', 0) > 0 and foe['hp'] / foe['max'] > .25:
            act = 'salve'
            s.plan('Bag', lambda i: next(k for k, o in enumerate(i['opts']) if o['t'].startswith('Mending Salve')))
            s.plan('Use Mending Salve', lambda i: next((k for k, o in enumerate(i['opts']) if 'In battle' in o['t'] and not o['dis']), len(i['opts']) - 1))
            await s.pg.locator('#b_aBag').click()
        elif catch and (foe['hp'] / foe['max'] <= .5 or not dmg):
            act = 'orb'
            s.plan('Bag', lambda i: next(k for k, o in enumerate(i['opts']) if o['t'].startswith('Tether Orb')))
            await s.pg.locator('#b_aBag').click()
        else:
            pool = dmg or [m for m in b['moves'] if not m['dis']]
            m = (min if catch else max)(pool, key=sc) if dmg else pool[0]
            act = m['n']; await s.pg.locator('#b_moves button').nth(b['moves'].index(m)).click()
        s.cur['acts'].append(f"T{s.cur['turns']} {act} (me {me['hp']}/{me['max']}, foe {foe['hp']}/{foe['max']})")
        for _ in range(30):
            await s.wait(100); n = await s.snap()
            if n['bbusy'] or not n['battle'] or n['ch']: break

    async def end_battle(s):
        c = s.cur; s.cur = None; p = await s.js(PARTY)
        c['dur'] = round(time.time() - s.t0 - c['t'], 1); c['after'] = [f"{k['sp']} L{k['L']} {k['hp']}/{k['max']}" for k in p['party']]
        c['last'] = c['msgs'][-3:]; s.battles.append(c)
        s.note('battle end', c.get('kind'), 'vs', c.get('foe'), f"turns={c['turns']} dur={c['dur']}s", '| party', c['after'], '| last:', c['last'])

    # ---------- event pump: run until the player has free control ----------
    async def pump(s, limit=240):
        t = time.time(); quiet = 0
        while True:
            if time.time() - t > limit: await s.shot('stuck'); raise Stuck(f'pump timeout in {s.stage}: {await s.snap()}')
            sn = await s.snap()
            if sn['ch']: await s.dir_up(); await s.on_chooser(); quiet = 0; continue
            if sn['battle']: await s.dir_up(); await s.on_battle(sn); quiet = 0; continue
            if s.cur is not None: await s.end_battle()
            if sn['dlg'] is not None:
                await s.dir_up()
                key = (sn['who'], sn['dlg'])
                if key != s.lastdlg:
                    s.lastdlg = key; s.dialog.append({'stage': s.stage, 'who': sn['who'], 'text': sn['dlg']})
                    s.note(f"  {sn['who'] or '·'}: {sn['dlg']}"); s.check(sn['dlg'], 'dialog')
                await s.pressA(); await s.wait(150); quiet = 0; continue
            if sn['evo'] or sn['scripting'] or sn['moving'] or sn['busy'] or sn['fade']: await s.wait(90); quiet = 0; continue
            quiet += 1
            if quiet >= 2: s.lastdlg = None; return sn
            await s.wait(60)

    # ---------- walking ----------
    async def route(s, sx, sy, goals, grass_cost=1.0, avoid=()):
        w = await s.js(GRID); g = w['g']; blocked = {(n[0], n[1]) for n in w['npcs']} | set(avoid)
        goals = set(goals); dist = {(sx, sy): 0}; prev = {}; pq = [(0, sx, sy)]
        while pq:
            d, x, y = heapq.heappop(pq)
            if (x, y) in goals:
                path = []; c = (x, y)
                while c in prev: c, dd = prev[c]; path.append(dd)
                return path[::-1], (x, y)
            if d > dist[(x, y)]: continue
            for i, (dx, dy) in enumerate(DV):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < len(g[0]) and 0 <= ny < len(g)) or g[ny][nx] not in (0, 3) or (nx, ny) in blocked: continue
                nd = d + (grass_cost if g[ny][nx] == 3 else 1)
                if nd < dist.get((nx, ny), 1e9): dist[(nx, ny)] = nd; prev[(nx, ny)] = ((x, y), i); heapq.heappush(pq, (nd, nx, ny))
        return None, None

    async def goto(s, goals, until=None, grass_cost=1.0, run=True, tries=60):
        """Walk to any goal tile. Stops early when until() is true. Returns True when a goal is reached."""
        goals = list(goals); avoid = set()
        for _ in range(tries):
            sn = await s.pump()
            if until and await until(): return False
            if (sn['tx'], sn['ty']) in goals: return True
            path, _ = await s.route(sn['tx'], sn['ty'], goals, grass_cost, avoid)
            if path is None:
                if avoid: avoid = set(); continue
                raise Stuck(f'no route from {(sn["tx"], sn["ty"])} to {goals[:4]}')
            await s.run_key(run and len(path) > 5)
            x, y = sn['tx'], sn['ty']; i = 0; ok = True
            while i < len(path) and ok:
                d = path[i]; j = i
                while j < len(path) and path[j] == d: j += 1
                ex, ey = x + DV[d][0] * (j - i), y + DV[d][1] * (j - i)
                await s.dir_down(d); last = (x, y); lt = time.time()
                while True:
                    await s.wait(25); n = await s.snap()
                    if n['busy']: ok = False; break
                    if (n['tx'], n['ty']) != last: s.steps += abs(n['tx'] - last[0]) + abs(n['ty'] - last[1]); last = (n['tx'], n['ty']); lt = time.time()
                    if last == (ex, ey): break
                    if time.time() - lt > 1.3: avoid.add((last[0] + DV[d][0], last[1] + DV[d][1])); ok = False; break
                x, y = last; i = j
            await s.dir_up(); await s.run_key(False); await s.wait(60)
        raise Stuck(f'goto gave up in {s.stage}')

    async def face(s, d):
        for _ in range(4):
            sn = await s.pump()
            if sn['dir'] == d: return
            await s.dir_down(d); await s.wait(35); await s.dir_up(); await s.wait(160)

    async def interact(s, x, y):
        """Walk next to tile (x,y), face it and press A; then play out whatever happens."""
        adj = [(x - dx, y - dy) for dx, dy in DV]
        await s.goto(adj); sn = await s.pump(); d = next(i for i, (dx, dy) in enumerate(DV) if (sn['tx'] + dx, sn['ty'] + dy) == (x, y))
        await s.face(d); n0 = len(s.dialog)
        if MOB: await s.pg.locator('#btnA').click(force=True)
        else: await s.pg.keyboard.press('z')
        await s.wait(250); await s.pump()
        return s.dialog[n0:]

    async def npc_pos(s, nid):
        return await s.js(f"(()=>{{const n=WB.npcs.find(n=>n.id==='{nid}');return n&&!n.hidden?[n.tx,n.ty]:null}})()")

    async def flag(s, f): return await s.js(f"!!WB.G.flags['{f}']")


async def play(b: Bot):
    pg = b.pg
    # ----- title -----
    b.begin('title')
    await pg.wait_for_function("getComputedStyle(document.getElementById('loading')).display==='none'", timeout=30000)
    await b.wait(800); await b.shot('title')
    b.note('continue button visible on a fresh device:', await pg.locator('#tCont').is_visible())
    await pg.locator('#tNew').click(); await b.wait(400)
    async def who(i): await b.shot('who_are_you'); return 0
    b.plan('Who are you?', who)
    await pg.wait_for_function("getComputedStyle(document.getElementById('ch')).display!=='none'"); await b.on_chooser()
    await pg.wait_for_function("!!WB.G&&!!WB.player", timeout=15000)

    b.begin('opening'); await b.wait(600); await b.shot('opening'); await b.pump(); await b.shot('free_control')
    b.note('music', (await b.js(PARTY))['music'])

    b.begin('village_talk')
    await b.interact(*await b.npc_pos('june'))
    await b.interact(*await b.npc_pos('maribel'))
    await b.interact(21, 58)                      # mailbox
    await b.interact(*await b.npc_pos('elder')); await b.shot('plaza')

    b.begin('gate_without_kith')
    n0 = len(b.dialog); await b.goto([(x, 49) for x in range(24, 37)], until=lambda: asyncio.sleep(0, len(b.dialog) > n0)); sn = await b.pump()
    b.note('gate result: player at', (sn['tx'], sn['ty']), 'lines', [d['text'] for d in b.dialog[n0:]])

    b.begin('lab')
    await b.interact(*await b.npc_pos('cole'))
    await b.interact(45, 60); b.note('intro flag', await b.flag('intro'))       # first look at the table starts Wren's intro
    await b.interact(*await b.npc_pos('cole'))
    tiles = {'foxfern': 44, 'kindlit': 45, 'ottide': 46}
    for sp in [k for k in tiles if k != STARTER]:
        async def keep(i, sp=sp):
            await b.shot('starter_card_' + sp); b.note('card:', i['title'], '|', i['html'].replace('\n', ' ')); return 1
        b.plan('Kith', keep); await b.interact(tiles[sp], 60)
    async def take(i): await b.shot('starter_card_' + STARTER); b.note('card:', i['title'], '|', i['html'].replace('\n', ' ')); return 0
    b.begin('starter_and_cole'); b.plan('Kith', take); await b.interact(tiles[STARTER], 60)
    st = await b.js(PARTY); b.note('after starter scene:', json.dumps(st)); await b.shot('after_cole')

    b.begin('june_heal')
    await b.interact(45, 60)                       # table afterwards
    sn = await b.pump(); fol = await b.js("[WB.follower.tx,WB.follower.ty]");
    try: await b.interact(*fol)
    except Exception as e: b.note('follower talk skipped', e)
    await b.interact(*await b.npc_pos('june')); await b.shot('june_after'); b.note('juneMet', await b.flag('juneMet'))

    b.begin('dad_call')
    await b.goto([(x, y) for x in range(27, 34) for y in range(51, 55)], until=lambda: b.flag('dad')); await b.pump(); b.note('dad flag', await b.flag('dad'))

    b.begin('route1_theo')
    for attempt in range(3):
        if await b.flag('t_theo'): break
        await b.goto([(x, 32) for x in (36, 35, 34, 37)], until=lambda: b.flag('t_theo'), grass_cost=4); await b.pump()
    b.note('theo beaten', await b.flag('t_theo'), json.dumps((await b.js(PARTY))['party'])); await b.shot('route1_after_theo')
    if await b.flag('t_theo'): await b.interact(*await b.npc_pos('theo'))

    await overworld_heal(b)
    b.begin('route1_wild')
    await b.pump(); await (pg.locator('#timeBtn').click() if MOB else pg.keyboard.press('t')); await b.wait(500); await b.shot('route1_evening')
    b.want_catch = True
    grid = (await b.js(GRID))['g']; grass = [(x, y) for y in range(6, 47) for x in range(60) if grid[y][x] == 3]
    b.note('tall grass tiles on Route 1:', len(grass))
    nb = len(b.battles); s0 = b.steps; t0 = time.time(); k = 0
    async def enough(): return len((await b.js(PARTY))['party']) >= 2 and len(b.battles) - nb >= 3
    sn = await b.pump(); near = sorted(grass, key=lambda t: abs(t[0] - sn['tx']) + abs(t[1] - sn['ty']))[:40]
    while not await enough() and time.time() - t0 < 420:
        tgt = near[(k * 13) % len(near)]; k += 1
        try: await b.goto([tgt], until=enough, grass_cost=.3, run=False, tries=6)
        except Stuck as e: b.note('grass target skipped', tgt, e)
        if k % 3 == 0: await overworld_heal(b)
    b.want_catch = False
    b.note(f'wild phase: {len(b.battles) - nb} battles in {b.steps - s0} steps, {round(time.time() - t0)}s', json.dumps((await b.js(PARTY))['party']))

    await overworld_heal(b)
    b.begin('sensor')
    await b.goto([(x, y) for x in (25, 26, 27) for y in range(17, 22)], until=lambda: b.flag('sensor'), grass_cost=3); await b.pump()
    b.note('sensor flag', await b.flag('sensor')); await b.shot('sensor_placed')
    await b.interact(23, 18); await b.interact(*await b.npc_pos('wren'))

    b.begin('route1_mira')
    await (pg.locator('#timeBtn').click() if MOB else pg.keyboard.press('t')); await b.wait(500)
    for attempt in range(3):
        if await b.flag('t_mira'): break
        await b.goto([(x, 15) for x in (26, 27, 25, 28)], until=lambda: b.flag('t_mira'), grass_cost=4); await b.pump()
        if not await b.flag('t_mira'): await overworld_heal(b)
    b.note('mira beaten', await b.flag('t_mira')); await b.shot('route1_night')
    if await b.flag('t_mira'): await b.interact(*await b.npc_pos('mira'))

    b.begin('north_exit')
    b.note('reached Route 2:', await go_north(b, 'route2')); await b.shot('route2_arrive')

    b.begin('route2')
    await b.interact(32, 93)                       # the route sign
    hp0 = (await b.js(PARTY))['party'][0]['hp']; await b.interact(*await b.npc_pos('dell'))
    b.note('farmer heal: lead hp', hp0, '->', (await b.js(PARTY))['party'][0]['hp'])
    for tid, lane in (('nell', [(24, 76), (23, 76)]), ('bram', [(34, 56), (35, 56)]), ('odell', [(26, 36), (25, 36)])):
        for attempt in range(3):
            if await b.flag('t_' + tid): break
            if await b.js("WB.map") != 'route2': b.note('lost a battle; walking back to Route 2'); await go_north(b, 'route2')
            await overworld_heal(b)
            await b.goto(lane, until=lambda tid=tid: b.flag('t_' + tid), grass_cost=4); await b.pump()
        b.note(tid, 'beaten', await b.flag('t_' + tid))
        if await b.flag('t_' + tid) and await b.js("WB.map") == 'route2': await b.interact(*await b.npc_pos(tid))
    if await b.js("WB.map") != 'route2': await go_north(b, 'route2')
    await b.shot('route2_road')
    bag0 = (await b.js(PARTY))['bag']; items = [tuple(int(v) for v in k.split(',')) for k in await b.js("WB.items()")]
    sn = await b.pump(); it = min(items, key=lambda t: abs(t[0] - 50) + abs(t[1] - 53))
    try: await b.interact(*it); b.note('satchel at', it, 'bag', bag0, '->', (await b.js(PARTY))['bag'], 'left', len(await b.js("WB.items()")))
    except Stuck as e: b.note('satchel skipped', e)
    b.note('reached Cindervale:', await go_north(b, 'cindervale'))
    b.note('route 2 trainers beaten:', [t for t in ('nell', 'bram', 'odell') if await b.flag('t_' + t)], json.dumps((await b.js(PARTY))['party']))

    b.begin('cindervale')
    await b.wait(500); await b.shot('cindervale_arrive')
    await b.interact(*await b.npc_pos('attendant')); b.note('rest point', (await b.js(PARTY))['heal'])
    await b.interact(15, 40)                       # Rest Lodge door
    await b.interact(*await b.npc_pos('cole')); await b.shot('cindervale_gym')
    await b.interact(50, 40)                       # Gym door
    await b.interact(38, 45)                       # notice board
    await b.interact(*await b.npc_pos('curator'))
    b.note('sensor delivered', await b.flag('sensor2'), 'done flag', await b.flag('done')); await b.shot('cindervale_square')
    await b.interact(*await b.npc_pos('curator'))
    await b.interact(*await b.npc_pos('foreman')); await b.shot('cindervale_mine_yard')
    await (pg.locator('#timeBtn').click() if MOB else pg.keyboard.press('t')); await b.wait(500)
    await b.goto([(32, 50)]); await b.shot('cindervale_time_2')

    b.begin('menus')
    async def openmenu():
        await b.pump(); await (pg.locator('#menuBtn').click() if MOB else pg.keyboard.press('m')); await b.wait(300)
    async def s_(tag, idx):
        async def f(i): await b.shot(tag); b.note('menu:', i['title'], '|', i['html'].replace('\n', ' ')[:300], '|', [o['t'] for o in i['opts']]); return idx if idx >= 0 else len(i['opts']) + idx
        return f
    b.plan('Field Assistant', await s_('menu_main', 0)); b.plan('Your Kith', await s_('menu_party', 0)); b.plan('', await s_('menu_kith_card', -1))
    b.plan('Your Kith', await s_('menu_party2', -1)); b.plan('Field Assistant', await s_('m', 1)); b.plan('Bag', await s_('menu_bag', -1))
    b.plan('Field Assistant', await s_('m', 2)); b.plan('Survey', await s_('menu_survey', -1)); b.plan('Field Assistant', await s_('m', 3))
    b.plan('Saved', await s_('menu_saved', 0)); b.plan('Field Assistant', await s_('m', -1))
    await openmenu(); await b.pump(); b.note('plans left after menus:', len(b.plans)); b.plans.clear()

    b.begin('reload_continue')
    before = await b.js(PARTY); await pg.reload()
    await pg.wait_for_function("getComputedStyle(document.getElementById('loading')).display==='none'", timeout=30000); await b.wait(800)
    b.note('continue label:', (await pg.locator('#tCont').inner_text()).replace('\n', ' ')); await b.shot('title_continue')
    await pg.locator('#tCont').click(); await pg.wait_for_function("!!WB.G&&!!WB.player&&!WB.busy()", timeout=15000); await b.wait(600); await b.pump()
    after = await b.js(PARTY); same = all(before[k] == after[k] for k in ('party', 'bag', 'flags', 'wins', 'caught', 'pos', 'box', 'map', 'heal'))
    b.note('save survived reload:', same, '' if same else json.dumps([before, after])); await b.shot('after_continue')
    b.begin('end')


async def go_north(b: Bot, target, tries=6):
    """Walk out of the north edge of each area until we are in `target`. Trainers and wild Kith on the way are fought.
    A lost battle sends the player back to where they last rested, so this simply sets off north again."""
    for _ in range(tries):
        m = await b.js("WB.map")
        if m == target: return True
        await overworld_heal(b)
        grid = (await b.js(GRID))['g']
        async def moved(m=m): return await b.js("WB.map") != m
        try: await b.goto([(x, 5) for x in range(len(grid[0])) if grid[5][x] in (0, 3)], until=moved, grass_cost=4)
        except Stuck as e: b.note('go_north retry', e)
        await b.pump(); b.note('now in', await b.js("WB.map"), 'at', (await b.js(PARTY))['pos'])
    return await b.js("WB.map") == target


async def overworld_heal(b: Bot):
    """Use Mending Salves from the pause menu when the lead is under 60%, like a player would."""
    for _ in range(3):
        await b.pump(); p = await b.js(PARTY)
        hurt = [i for i, k in enumerate(p['party']) if 0 < k['hp'] < k['max'] * .6]
        if not hurt or p['bag'].get('salve', 0) < 1: return
        i = hurt[0]; b.note('using a salve from the menu on', p['party'][i]['sp'], f"{p['party'][i]['hp']}/{p['party'][i]['max']}")
        b.plan('Field Assistant', lambda _: 1)
        b.plan('Bag', lambda info: next(k for k, o in enumerate(info['opts']) if o['t'].startswith('Mending Salve')))
        b.plan('Use Mending Salve', lambda info, i=i: i)
        b.plan('Bag', lambda info: len(info['opts']) - 1); b.plan('Field Assistant', lambda info: len(info['opts']) - 1)
        await (b.pg.locator('#menuBtn').click() if MOB else b.pg.keyboard.press('m')); await b.wait(300); await b.pump(); b.plans.clear()


async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        pg = await br.new_page(viewport={'width': W, 'height': H}, is_mobile=MOB, has_touch=MOB, device_scale_factor=2 if MOB else 1)
        b = Bot(pg)
        pg.on('pageerror', lambda e: (b.errs.append(f'{b.stage}: {e}'), b.note('!! PAGE ERROR', e)))
        pg.on('console', lambda m: (b.errs.append(f'{b.stage}: console: {m.text}'), b.note('!! console error', m.text)) if m.type == 'error' else None)
        await pg.goto((REPO / 'dist' / 'index.html').as_uri())
        crash = None
        try: await play(b)
        except Exception as e:
            crash = repr(e); b.note('!! PLAYTHROUGH STOPPED', crash)
            try: await b.shot('crash'); b.note('state', json.dumps(await b.snap())); b.note('party', json.dumps(await b.js(PARTY)))
            except Exception as e2: b.note('no state', e2)
        if b.stages: b.stages[-1]['end'] = time.time() - b.t0
        final = None
        try: final = await b.js(PARTY)
        except Exception: pass
        (OUT / f'{NAME}_report.json').write_text(json.dumps({'crash': crash, 'errors': b.errs, 'suspicious_text': b.flags, 'unexpected_choosers': b.unexpected,
            'stages': b.stages, 'steps': b.steps, 'battles': b.battles, 'dialog': b.dialog, 'final': final, 'total_s': round(time.time() - b.t0)}, indent=1), encoding='utf-8')
        (OUT / f'{NAME}_log.txt').write_text('\n'.join(b.log), encoding='utf-8')
        for c in b.battles:
            if c.get('kind') == 'trainer': print(f"  trainer battle vs {c.get('foe')}: {c['turns']} turns, salves used {sum('salve' in a for a in c['acts'])}", flush=True)
        ok = not crash and not b.errs and not b.flags and not b.unexpected
        print('PASS' if ok else 'FAIL', NAME, STARTER, 'crash:', crash, 'errors:', len(b.errs), 'suspicious text:', len(b.flags), 'battles:', len(b.battles), flush=True)
        await br.close()
        return ok

sys.exit(0 if asyncio.run(main()) else 1)
