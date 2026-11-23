import json,csv,sys,os,collections
sys.path.insert(0,'.')
from moves import MOVES
from typechart import TYPES,eff
import systems as S
import openpyxl
from openpyxl.styles import Font,PatternFill,Alignment
os.makedirs('out',exist_ok=True)
CAT={'P':'Physical','S':'Special','X':'Status'}
TGT={'foe':'One foe','foes':'All foes','others':'All others','self':'Self','ally':'Ally','side':"User's side",'foeside':"Foe's side",'field':'Field','any':'Any one'}
order={t:i for i,t in enumerate(TYPES)}
SIG={'Canopy Crown','Vent Eruption','Crashing Mane','Caldera Wrath','Tidal Requiem','Grey Bloom','First Oath','Struggle'}
rows=sorted(MOVES,key=lambda m:(99 if m['name']=='Struggle' else order[m['type']], {'P':0,'S':1,'X':2}[m['cat']], m['power'] or 0, m['name']))
HDR=['Move','Type','Category','Power','Accuracy','PP','Priority','Target','Contact','Effect','Resonance','Flags','Signature','Effect code']
def rowof(m):
    return [m['name'],'Typeless' if m['name']=='Struggle' else m['type'],CAT[m['cat']],m['power'] or '—',m['acc'] or '—',m['pp'],m['prio'],TGT[m['target']],'Yes' if m['contact'] else 'No',m['desc'],m['resonance'],m['flags'].replace(';',', '),'Yes' if m['name'] in SIG else 'No',m['effect']]
with open('../wildbound_moves.csv','w',newline='') as f:
    w=csv.writer(f);w.writerow(HDR);[w.writerow(rowof(m)) for m in rows]
json.dump([dict(m,id=m['name'].lower().replace("'",'').replace(' ','_').replace('-','_'),signature=m['name'] in SIG) for m in rows],open('../moves.json','w'),indent=1,ensure_ascii=False)
json.dump({'types':TYPES,'chart':{a:{d:eff(a,d) for d in TYPES} for a in TYPES}},open('../types.json','w'),indent=1)
json.dump([{'name':v,'up':k[0],'down':k[1]} for k,v in S.NATURES.items()],open('../natures.json','w'),indent=1)
json.dump([{'name':n,'category':c,'effect':e} for n,c,e in S.TRAITS],open('../traits.json','w'),indent=1,ensure_ascii=False)
json.dump([{'name':n,'category':c,'effect':e} for n,c,e in S.ITEMS],open('../items.json','w'),indent=1,ensure_ascii=False)
json.dump({'statuses':S.STATUSES,'weather':S.WEATHER,'terrain':S.TERRAIN,'hazards':S.HAZARDS,'side_effects':S.SCREENS},open('../field.json','w'),indent=1,ensure_ascii=False)
COL={'Beast':'B8A48C','Ember':'E8673A','Tide':'3E8ED8','Bloom':'5DBB4C','Volt':'F2C94C','Gale':'9CC8EE','Stone':'A8865A','Frost':'8EDBE8','Brawl':'C0453A','Venom':'9B57C2','Mind':'EE6FA8','Shade':'5B4E8C','Metal':'8C98A8','Fae':'F3A6D8','Wyrm':'5E6BD8','Swarm':'9DB83A','Typeless':'DDDDDD'}
def light(h,a=0.55):
    r,g,b=(int(h[i:i+2],16) for i in (0,2,4));return '%02X%02X%02X'%tuple(int(c+(255-c)*a) for c in (r,g,b))
bold=Font(bold=True,color='FFFFFF');hf=PatternFill('solid',fgColor='33384A')
wb=openpyxl.Workbook();ws=wb.active;ws.title='Moves';ws.append(HDR)
for m in rows: ws.append(rowof(m))
for c in ws[1]: c.font=bold;c.fill=hf
for i,w in enumerate([18,10,10,8,10,6,8,12,8,48,40,14,10,30]): ws.column_dimensions[openpyxl.utils.get_column_letter(i+1)].width=w
for row in ws.iter_rows(min_row=2):
    row[1].fill=PatternFill('solid',fgColor=light(COL[row[1].value]))
    for c in (row[9],row[10]): c.alignment=Alignment(wrap_text=True,vertical='top')
ws.freeze_panes='B2'
def simple(name,hdr,data,widths):
    sh=wb.create_sheet(name);sh.append(hdr)
    for d in data: sh.append(list(d))
    for c in sh[1]: c.font=bold;c.fill=hf
    for i,w in enumerate(widths): sh.column_dimensions[openpyxl.utils.get_column_letter(i+1)].width=w
    sh.freeze_panes='A2' if name!='Type chart' else 'B2'; return sh
tc=simple('Type chart',['Attacking ↓ / Defending →']+TYPES,[[a]+[eff(a,d) for d in TYPES] for a in TYPES],[24]+[7]*16)
for row in tc.iter_rows(min_row=2):
    row[0].font=Font(bold=True)
    for c in row[1:]: c.fill=PatternFill('solid',fgColor={2.0:'C6EFCE',0.5:'FFD7D7',0.0:'BFBFBF',1.0:'FFFFFF'}[c.value]);c.alignment=Alignment(horizontal='center')
simple('Traits',['Trait','Category','Effect'],S.TRAITS,[20,12,80])
simple('Natures',['Nature','Raises','Lowers'],[[n,S.SN[u] if u!=d else '—',S.SN[d] if u!=d else '—'] for (u,d),n in S.NATURES.items()],[14,12,12])
simple('Held items',['Item','Category','Effect'],S.ITEMS,[24,12,80])
wb.save('../Wildbound_Moves.xlsx')
print(len(rows),'moves exported')
