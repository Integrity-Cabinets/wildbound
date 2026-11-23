import asyncio,sys,json
from playwright.async_api import async_playwright
# t.py name w h mobile  -- then reads commands from stdin: js <code> | shot <tag> | wait <ms> | key <k> | keys <k> <n> <gap> | click <selector>
async def main():
    name,w,h,mob=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]=='1'
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport={'width':w,'height':h},is_mobile=mob,has_touch=mob,device_scale_factor=2 if mob else 1)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' else None)
        await pg.goto('file://'+__import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__)))+'/dist/index.html');await pg.wait_for_timeout(2500)
        for line in sys.stdin.read().split('\n'):
            line=line.strip()
            if not line or line.startswith('#'): continue
            c,_,a=line.partition(' ')
            try:
                if c=='js': r=await pg.evaluate(a); print('js>',json.dumps(r)[:600]) if r is not None else None
                elif c=='shot': await pg.screenshot(path=f'tests/shots/{name}_{a}.png')
                elif c=='wait': await pg.wait_for_timeout(int(a))
                elif c=='key': await pg.keyboard.press(a)
                elif c=='keys':
                    k,n,g=a.split();
                    for _ in range(int(n)): await pg.keyboard.press(k);await pg.wait_for_timeout(int(g))
                elif c=='hold':
                    k,ms=a.split();await pg.keyboard.down(k);await pg.wait_for_timeout(int(ms));await pg.keyboard.up(k)
                elif c=='click': await pg.click(a,timeout=3000)
                elif c=='until':  # until <ms> <js predicate>
                    ms,_,js=a.partition(' ');t=0
                    while t<int(ms):
                        if await pg.evaluate(js): break
                        await pg.wait_for_timeout(100);t+=100
                    else: print('TIMEOUT until',js[:80])
            except Exception as e: print('ERR',line[:80],str(e)[:200])
        print(name,'errors:',errs[:8])
        await b.close()
asyncio.run(main())
