#!/usr/bin/env python3
"""Assemble dist/index.html: one self-contained file (HTML + CSS + JS + art as data URIs).
Usage:  python3 build.py            # assemble from src/
        python3 build.py --data     # rebuild src/data.json from assets/ and data/ first (needs Pillow)"""
import os,subprocess,sys
ROOT=os.path.dirname(os.path.abspath(__file__));S=ROOT+'/src/'
if '--data' in sys.argv or not os.path.exists(S+'data.json'):
    subprocess.run([sys.executable,ROOT+'/tools/build_data.py'],check=True)
h=open(S+'shell.html',encoding='utf-8').read()
for tag,f in [('/*UI*/','ui.js'),('/*BATTLE_CORE*/','battle_core.js'),('/*BATTLE_GAME*/','battle_game.js'),('/*OW_CORE*/','ow_core.js'),('/*MAPS*/','maps.js'),('/*GAME*/','game.js'),('/*DATA*/','data.json')]:
    assert h.count(tag)==1,tag
    h=h.replace(tag,open(S+f,encoding='utf-8').read())
os.makedirs(ROOT+'/dist',exist_ok=True)
open(ROOT+'/dist/index.html','w',encoding='utf-8').write(h)
i=h.index('<script>')+8;j=h.rindex('</script>')
open(ROOT+'/dist/game.check.js','w',encoding='utf-8').write(h[i:j])
print('dist/index.html',len(h)//1024,'KB   (syntax check: node --check dist/game.check.js)')
