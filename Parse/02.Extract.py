import json
SRC = '01.Strip.json'
DST = '02.Extract.json'

def TransformGroup(s: dict):
	pass

def TransformItem(s: dict):
	r = { 'html': s['html'] }
	gs = []
	for g in s['groups']:
		g = TransformGroup(g)
		if g != None:
			gs.append(g)
	if len(gs) > 0:
		r['groups'] = gs
	return r

def Transform(s: list):
	r = []
	iCount = len(s)
	for i in range(iCount):
		print('\rIdentifying Item ' + str(i) + ' / ' + str(iCount), end='\t')
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
print('\rSaving Identified Samples ...', end='\t')
f.write(json.dumps(dst, sort_keys=False, indent=4))
f.close()
print('\r')