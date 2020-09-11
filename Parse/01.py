import json
SRC = '00.json'
DST = '01.json'

def TransformParagraphs(s:list):
	ret = {}
	for i in s:
		ch = i['children'] if 'children' in i else []
		if len(ch) == 0:
			continue
		w = (i['children'].pop(0))['text']
		if not w in ret:
			ret[w] = []
		ret[w].append(i)
	return ret

f = open(SRC, 'r')
src = json.loads(f.read())
f.close()
dst = TransformParagraphs(src['children'])
f = open(DST, 'w')
f.write(json.dumps(dst, sort_keys=True, indent=4))
f.close()