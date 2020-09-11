import json

def GetItem(w, d):
	if d == None:
		print('Null Def for "' + w + '"')
		return [w, '-----', '-----']
	return [
		w,
		'<br/>'.join(d['pos']) if 'pos' in d else '-----',
		d['src']['html']
	]

def Execute(src:dict):
	ret = '<table><thead><tr><td>Word</td><td style="width: 256px;">POS</td><td>Html</td></tr></thead><tbody>'
	for k in src.keys():
		defs = src[k]
		for d in defs:
			ret += '<tr>'
			for r in GetItem(k, d):
				ret += '<td style="border: 1px solid black; padding: 5px;">' + r + '</td>'
			ret += '</tr>'
	ret += '</tbody></table>'
	return ret

f = open('03.json', 'r')
src = json.loads(f.read())
f.close()
f = open('03.InitCheck.html', 'w')
f.write(Execute(src))
f.close()