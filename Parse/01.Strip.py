import json
SRC = '00.Groups.json'
DST = '01.Strip.json'

def TransformElement(s:dict):
	r = {}
	if not type(s) is dict:
		print('Expected dict, got ' + type(s).__name__ + ', In :')
		print(s)
		print()
	ks = list(s.keys())
	# Strip the Text
	if 'text' in ks:
		r['text'] = s['text'].strip(' \n\t,')
		if len(r['text']) < 2:
			r['text'] = r['text'].strip(';.:')
		ks.remove('text')
		if len(r['text']) == 0:
			r.pop('text')
	# Also for children
	if 'children' in ks:
		r['children'] = []
		for ch in s['children']:
			t = TransformElement(ch)
			if t != None:
				r['children'].append(t)
		ks.remove('children')
		if len(r['children']) == 0:
			r.pop('children')
	# Add the rest of the keys Untouched
	for k in ks:
		r[k] = s[k]
	if len(r.keys()) == 0:
		return None
	return r

def TransformGroup(s:list):
	r = []
	for g in s:
		e = TransformElement(g)
		if e != None:
			r.append(e)
	if len(r) == 0:
		return None
	return r

def TransformItem(s:dict):
	if len(s.keys()) > 0:
		html = s['html'].strip(' \t\n').replace('\n', '')
		groups = []
		if not 'groups' in s.keys():
			print(s)
		for g in s['groups']:
			t = TransformGroup(g)
			if t != None:
				groups.append(t)
		return {
			'html': html,
			'groups': groups
		}
	return None

def Transform(s: list):
	r = []
	iCount = len(s)
	for i in range(iCount):
		print('\rStripping Item ' + str(i) + ' / ' + str(iCount), end='\t')
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
print('\rSaving Stripped Samples ...', end='\t')
f.write(json.dumps(dst, sort_keys=False, indent=4))
f.close()
print('\r')