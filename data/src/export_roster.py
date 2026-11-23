import json,openpyxl,sys
sys.path.insert(0,'.')
from openpyxl.styles import Font,PatternFill,Alignment
from roster import S,ENCOUNTERS,TEAMS
from moves import MOVES
from export import COL,light
MV={m['name']:m for m in MOVES}
CAT={'P':'Physical','S':'Special','X':'Status'}
bold=Font(bold=True,color='FFFFFF');hf=PatternFill('solid',fgColor='33384A')
wb=openpyxl.Workbook();ws=wb.active;ws.title='Kith'
H=['No.','Kith','Type 1','Type 2','HP','Atk','Def','Sp. Atk','Sp. Def','Speed','Total','Traits','Latent trait','Evolution','Growth','Catch rate','Base XP','Conditioning yield','Egg groups','Height (m)','Weight (kg)','Gender','Habitat','Concept','Dex entry','Art status']
ws.append(H)
for s in S:
    st=s['stats'];t=s['types']
    ws.append([s['no'],s['name'],t[0],t[1] if len(t)>1 else '',st['hp'],st['atk'],st['def'],st['spa'],st['spd'],st['spe'],f"=SUM(E{ws.max_row+1}:J{ws.max_row+1})",', '.join(s['traits']),s['latent'],s['evolution'],s['growth'],s['catch'],s['base_xp'],s['cond_yield'],s['egg_groups'],s['height_m'],s['weight_kg'],('Genderless' if s['gender_female_pct'] is None else f"{100-s['gender_female_pct']}% M / {s['gender_female_pct']}% F"),s['habitat'],s['concept'],s['dex'],'Approved' if s['art'] is None else 'Brief ready'])
for c in ws[1]: c.font=bold;c.fill=hf;c.alignment=Alignment(wrap_text=True,vertical='center')
for i,w in enumerate([5,12,8,8,5,5,5,7,7,6,6,24,14,22,13,8,7,14,14,8,9,16,30,40,50,11]): ws.column_dimensions[openpyxl.utils.get_column_letter(i+1)].width=w
for row in ws.iter_rows(min_row=2):
    for c in (row[2],row[3]):
        if c.value: c.fill=PatternFill('solid',fgColor=light(COL[c.value]))
    for c in row[22:25]: c.alignment=Alignment(wrap_text=True,vertical='top')
ws.freeze_panes='C2'
ls=wb.create_sheet('Learnsets');ls.append(['No.','Kith','Level','Move','Type','Category','Power','Accuracy','PP'])
for s in S:
    for lv,mn in s['learnset']:
        m=MV[mn];ls.append([s['no'],s['name'],'Evolve' if lv==0 else lv,mn,m['type'],CAT[m['cat']],m['power'] or '—',m['acc'] or '—',m['pp']])
for c in ls[1]: c.font=bold;c.fill=hf
for i,w in enumerate([5,12,7,18,8,9,7,9,5]): ls.column_dimensions[openpyxl.utils.get_column_letter(i+1)].width=w
ls.freeze_panes='A2'
en=wb.create_sheet('Encounters');en.append(['Area','Method','Kith','Chance (%)','Levels'])
for a,mth,tab in ENCOUNTERS:
    for n,p,l in tab: en.append([a,mth,n,p,l])
for c in en[1]: c.font=bold;c.fill=hf
for i,w in enumerate([18,22,12,10,24]): en.column_dimensions[openpyxl.utils.get_column_letter(i+1)].width=w
en.freeze_panes='A2'
tm=wb.create_sheet('Trainer teams');tm.append(['Battle','Team','Notes'])
for t in TEAMS: tm.append(list(t))
for c in tm[1]: c.font=bold;c.fill=hf
for i,w in enumerate([32,48,50]): tm.column_dimensions[openpyxl.utils.get_column_letter(i+1)].width=w
tm.freeze_panes='A2'
wb.save('../Wildbound_Kith_Roster.xlsx')
json.dump(S,open('../species.json','w'),indent=1,ensure_ascii=False)
json.dump({'encounters':[{'area':a,'method':m,'table':[{'kith':n,'chance':p,'levels':l} for n,p,l in t]} for a,m,t in ENCOUNTERS],'trainer_teams':[dict(zip(['battle','team','notes'],t)) for t in TEAMS]},open('../encounters.json','w'),indent=1,ensure_ascii=False)
print('ok', sum(len(s['learnset']) for s in S),'learnset rows')
