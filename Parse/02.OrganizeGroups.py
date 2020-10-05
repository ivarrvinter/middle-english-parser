import json
from Funcs.Extract import FindAllWithTag, FindNthFirstWithTag, FindFirstParentWithChild
SRC = '01.Strip.json'
DST = '02.OrganizeGroups.json'

def TransformItem(s: dict):
	r = { 'html': s['html'] }
	sgs = s['groups']
	cg = []
	rgs = []
	for g in sgs:
		if len(g) > 0:
			if len(cg) > 0:
				bolds = FindAllWithTag(g[0], 'B')
				if len(bolds) > 0:
					rgs.append(cg)
					cg = []
			for ch in g:
				cg.append(ch)
	if len(cg) > 0:
		rgs.append(cg)
	if len(rgs) > 0:
		r['groups'] = rgs
	return r

def Transform(s: list):
	r = []
	iCount = len(s)
	for i in range(iCount):
		print('\rExtracting Item ' + str(i) + ' / ' + str(iCount), end='\t')
		t = TransformItem(s[i])
		if t != None:
			r.append(t)
	print()
	return r

f = open(SRC, 'r')
src = json.loads(f.read())
f.close()
dst = Transform(src)
f = open(DST, 'w')
print('\rSaving extracted Samples ...', end='\t')
f.write(json.dumps(dst, sort_keys=False, indent=4))
f.close()
print('\r')