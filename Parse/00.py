import json
SRC = '../Source/Source.json'
DST = '00.json'

def TransformDict(s:dict):
	ks = list(s.keys())
	d = {}
	for k in ks:
		v = s[k]
		if k == 'html' or k == 'text':
			d[k] = v.strip(' ,\t\n')
		elif type(v) is list:
			r = []
			for li in v:
				if type(li) is dict:
					nd = TransformDict(li)
					if nd != None:
						r.append(nd)
				else:
					r.append(li)
			d[k] = r
		elif type(v) is dict:
			nd = TransformDict(v)
			if nd != None:
				d[k] = nd
		else:
			d[k] = v
	for k in ks:
		if d[k] in ['', [], {}]:
			d.pop(k)
	ks = list(d.keys())
	if len(ks) > 0:
		return d
	return None

f = open(SRC, 'r')
src = json.loads(f.read())
f.close()
dst = TransformDict(src)
f = open(DST, 'w')
f.write(json.dumps(dst, sort_keys=False, indent=4))
f.close()