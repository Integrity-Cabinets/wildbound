TYPES=["Beast","Ember","Tide","Bloom","Volt","Gale","Stone","Frost","Brawl","Venom","Mind","Shade","Metal","Fae","Wyrm","Swarm"]
# attacker: (super effective, not very effective, no effect)
CHART={
 "Beast":([],["Stone","Metal"],["Shade"]),
 "Ember":(["Bloom","Frost","Swarm","Metal"],["Ember","Tide","Stone","Wyrm"],[]),
 "Tide":(["Ember","Stone"],["Tide","Bloom","Wyrm"],[]),
 "Bloom":(["Tide","Stone"],["Ember","Bloom","Venom","Gale","Swarm","Wyrm","Metal"],[]),
 "Volt":(["Tide","Gale"],["Volt","Bloom","Wyrm"],["Stone"]),
 "Gale":(["Bloom","Brawl","Swarm"],["Volt","Stone","Metal"],[]),
 "Stone":(["Ember","Gale","Frost","Volt","Venom"],["Brawl","Bloom","Metal"],[]),
 "Frost":(["Bloom","Gale","Stone","Wyrm"],["Ember","Tide","Frost","Metal"],[]),
 "Brawl":(["Beast","Frost","Stone","Metal"],["Venom","Gale","Mind","Swarm","Fae","Shade"],[]),
 "Venom":(["Bloom","Fae"],["Venom","Stone","Shade"],["Metal"]),
 "Mind":(["Brawl","Venom"],["Mind"],["Shade"]),
 "Shade":(["Mind","Shade"],["Brawl"],["Beast"]),
 "Metal":(["Frost","Stone","Fae"],["Ember","Tide","Volt","Metal"],[]),
 "Fae":(["Brawl","Wyrm","Shade"],["Ember","Venom","Metal"],[]),
 "Wyrm":(["Wyrm"],["Metal"],["Fae"]),
 "Swarm":(["Bloom","Mind","Shade"],["Ember","Brawl","Venom","Gale","Fae","Metal"],[]),
}
def eff(a,d):
    se,nve,imm=CHART[a]
    return 2.0 if d in se else 0.5 if d in nve else 0.0 if d in imm else 1.0
if __name__=='__main__':
    print(f"{'type':7} off:SE NVE IMM | def: weak resist immune")
    for t in TYPES:
        se,nve,imm=CHART[t]
        weak=[a for a in TYPES if eff(a,t)==2]; res=[a for a in TYPES if eff(a,t)==.5]; im=[a for a in TYPES if eff(a,t)==0]
        print(f"{t:7} {len(se):2} {len(nve):3} {len(imm):3} | {len(weak):2} {len(res):2} {len(im):2}  weak={weak} res={res} imm={im}")
