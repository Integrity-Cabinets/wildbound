#!/usr/bin/env python3
"""Validate everything under assets/ against the Wildbound asset contract (docs/ART_PIPELINE.md)
and keep assets/manifest.json in step with the files.

  python3 tools/check_assets.py                 # validate files and that the manifest is current
  python3 tools/check_assets.py --write         # validate, then rewrite assets/manifest.json
  python3 tools/check_assets.py --base origin/main --art-only
        # extra pull-request rules: only assets/ and art/ may change, and approved files
        # may not be deleted or altered (set ALLOW_REVISIONS=1 for an agreed revision)

Needs Pillow. Exits non-zero when anything fails."""
import hashlib, json, os, re, subprocess, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'assets')
MANIFEST = os.path.join(ASSETS, 'manifest.json')
MAX_BYTES = 2 * 1024 * 1024

# Kith that use the large story-milestone canvas.
BIG_KITH = {'calderon', 'marivane', 'hollowroot', 'vowling'}
# view -> (sheet width, sheet height, frame width, frame height)
KITH_VIEWS = {'front': (96, 96, 96, 96), 'back': (96, 96, 96, 96), 'follow': (64, 128, 32, 32),
              'icon': (64, 32, 32, 32), 'idle': (192, 96, 96, 96), 'back_idle': (192, 96, 96, 96)}
BIG_VIEWS = {'front': (128, 128, 128, 128), 'back': (128, 128, 128, 128), 'follow': (64, 128, 32, 32),
             'icon': (64, 32, 32, 32), 'idle': (256, 128, 128, 128), 'back_idle': (256, 128, 128, 128)}
CHAR_VIEWS = {'walk': (96, 192, 32, 48), 'run': (96, 192, 32, 48), 'portrait': (384, 96, 96, 96),
              'battle': (96, 128, 96, 128), 'back': (384, 96, 96, 96)}
# folder -> allowed filename prefixes for free-size art
PREFIXES = {'ui': ('icon_type_', 'label_type_', 'item_', 'ui_', 'badge_'),
            'props': ('bld_', 'prop_', 'props_'),
            'tiles': ('tiles_',),
            'battle': ('bg_', 'plat_'),
            'battle/hd2d': ('arena_', 'foreground_')}
FIXED = {'icon_type_': (24, 24), 'label_type_': (32, 14), 'item_': (24, 24), 'bg_': (240, 160), 'plat_': (128, 32),
         'arena_': (1280, 720), 'foreground_': (1280, 720)}
# Atlases delivered before layout sidecars existed; their cells are indexed in docs/world_asset_index.json.
GRANDFATHERED_ATLASES = {'props_hearthmoss_fences', 'props_hearthmoss_large', 'props_hearthmoss_plants',
                         'props_hearthmoss_small', 'props_hearthmoss_trees', 'tiles_hearthmoss_ground', 'tiles_tallgrass'}
NAME_RE = re.compile(r'^[a-z0-9]+(_[a-z0-9]+)*\.png$')
KITH_RE = re.compile(r'^mon_([a-z0-9]+)_(front|back_idle|back|follow|icon|idle)\.png$')
CHAR_RE = re.compile(r'^char_([a-z0-9]+(?:_[a-z0-9]+)*)_(walk|run|portrait|battle|back)\.png$')


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def binary_alpha(im):
    lo, hi = im.getchannel('A').getextrema()
    if lo == hi:
        return lo in (0, 255)
    hist = im.getchannel('A').histogram()
    return sum(hist[1:255]) == 0


def inspect(rel, errors):
    """Return the manifest entry for one file, appending any problems to errors."""
    path = os.path.join(ASSETS, rel)
    folder, name = os.path.dirname(rel).replace(os.sep, '/'), os.path.basename(rel)
    def err(msg):
        errors.append(f'{rel}: {msg}')
    if not NAME_RE.match(name):
        err('file names are lowercase letters, digits and single underscores, ending in .png (no "@8x" masters)')
    if os.path.getsize(path) > MAX_BYTES:
        err(f'larger than {MAX_BYTES // 1024} KB')
    try:
        im = Image.open(path); im.load()
    except Exception as e:
        err(f'not a readable PNG ({e})'); return None
    if im.format != 'PNG':
        err('must be a PNG')
    entry = {'path': 'assets/' + rel, 'width': im.width, 'height': im.height, 'sha256': sha(path)}
    stem = name[:-4]
    if folder == 'creatures':
        m = KITH_RE.match(name)
        if not m:
            err('expected mon_<id>_<front|back|follow|icon|idle|back_idle>.png'); return entry
        kid, view = m.groups(); spec = (BIG_VIEWS if kid in BIG_KITH else KITH_VIEWS)[view]
        entry.update(kind='kith', id=kid, view=view, frame=[spec[2], spec[3]])
        if im.size != spec[:2]:
            err(f'{view} must be {spec[0]}x{spec[1]}, found {im.width}x{im.height}')
    elif folder == 'characters':
        m = CHAR_RE.match(name)
        if not m:
            err('expected char_<id>[_<outfit>]_<walk|run|portrait|battle|back>.png'); return entry
        cid, view = m.groups(); spec = CHAR_VIEWS[view]
        entry.update(kind='character', id=cid, view=view, frame=[spec[2], spec[3]])
        if im.size != spec[:2]:
            err(f'{view} must be {spec[0]}x{spec[1]}, found {im.width}x{im.height}')
    elif folder in PREFIXES:
        pre = next((p for p in PREFIXES[folder] if name.startswith(p)), None)
        if not pre:
            err(f'files in assets/{folder}/ start with one of: {", ".join(PREFIXES[folder])}'); return entry
        entry.update(kind=folder.replace('/', '_'), id=stem)
        if pre in FIXED and im.size != FIXED[pre]:
            err(f'{pre}* must be {FIXED[pre][0]}x{FIXED[pre][1]}, found {im.width}x{im.height}')
        if pre in ('props_', 'tiles_'):
            side = os.path.join(ASSETS, folder, stem + '.layout.json')
            if os.path.exists(side):
                try:
                    lay = json.load(open(side)); cw, ch = lay['cell']
                    assert im.width % cw == 0 and im.height % ch == 0 and isinstance(lay['cells'], list) and lay['cells']
                    entry['frame'] = [cw, ch]; entry['layout'] = f'assets/{folder}/{stem}.layout.json'
                except Exception:
                    err('layout sidecar must be JSON with "cell": [w, h] dividing the sheet evenly and a non-empty "cells" list')
            elif stem not in GRANDFATHERED_ATLASES:
                err(f'atlases need a sidecar {stem}.layout.json naming each cell (see docs/ART_PIPELINE.md)')
    else:
        err('unknown folder; use creatures, characters, props, tiles, ui, battle or battle/hd2d'); return entry
    if folder != 'battle/hd2d':
        if im.mode not in ('RGBA', 'P', 'RGB'):
            err(f'unexpected colour mode {im.mode}')
        elif im.mode != 'RGB' and not binary_alpha(im.convert('RGBA')):
            err('pixel art needs binary alpha: every pixel fully opaque or fully transparent')
    return entry


def collect():
    errors, files = [], []
    for d, _, fs in os.walk(ASSETS):
        for f in sorted(fs):
            # forward slashes on every OS, so the manifest is identical on Windows
            rel = os.path.relpath(os.path.join(d, f), ASSETS).replace(os.sep, '/')
            if f.endswith('.png'):
                e = inspect(rel, errors)
                if e: files.append(e)
            elif f not in ('manifest.json', 'README.md') and not f.endswith('.layout.json'):
                errors.append(f'{rel}: only .png art, .layout.json sidecars and manifest.json belong in assets/')
    files.sort(key=lambda e: e['path'])
    # every Kith needs its core set
    kith = {}
    for e in files:
        if e.get('kind') == 'kith': kith.setdefault(e['id'], set()).add(e['view'])
    for kid, views in sorted(kith.items()):
        missing = {'front', 'back', 'icon'} - views
        if kid not in BIG_KITH: missing |= {'follow'} - views
        if missing: errors.append(f'creatures: mon_{kid} is missing {", ".join(sorted(missing))}')
        if ('idle' in views) != ('back_idle' in views): errors.append(f'creatures: mon_{kid} needs both idle and back_idle')
    return files, errors


def pr_rules(base, errors):
    out = subprocess.run(['git', 'diff', '--name-status', '-M', f'{base}...HEAD'], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    allow_rev = os.environ.get('ALLOW_REVISIONS') == '1'
    for line in out.splitlines():
        parts = line.split('\t'); status, path = parts[0][0], parts[-1]
        old = parts[1] if len(parts) > 2 else path
        if not (path.startswith('assets/') or path.startswith('art/')):
            errors.append(f'{path}: art pull requests may only change assets/ and art/')
        if old.startswith('assets/') and old.endswith('.png') and status in 'DMR' and not allow_rev:
            what = {'D': 'deletes', 'M': 'changes', 'R': 'renames'}[status]
            errors.append(f'{old}: this {what} approved artwork. Add the "art-revision" label if Derek agreed to the revision.')


def main():
    args = sys.argv[1:]
    files, errors = collect()
    manifest = {'schema': 1, 'generated_by': 'tools/check_assets.py --write', 'count': len(files), 'files': files}
    text = json.dumps(manifest, indent=1) + '\n'
    if '--base' in args:
        pr_rules(args[args.index('--base') + 1], errors)
    if '--write' in args:
        open(MANIFEST, 'w').write(text); print(f'wrote assets/manifest.json ({len(files)} files)')
    else:
        current = open(MANIFEST).read() if os.path.exists(MANIFEST) else ''
        if current != text:
            msg = 'assets/manifest.json is out of date; run: python3 tools/check_assets.py --write'
            if '--art-only' in args: print('note:', msg, '(the integrator will regenerate it)')
            else: errors.append(msg)
    for e in errors: print('FAIL', e)
    print(f'{len(files)} files checked, {len(errors)} problem(s)')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
