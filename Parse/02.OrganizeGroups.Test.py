import json

SRC = '02.OrganizeGroups.json'
DST = '02.OrganizeGroups.html'

def WriteElement(e: dict):
	bgn = ''
	end = ''
	cnt = []
	if 'tag' in e:
		bgn += '<' + e['tag'].lower() + '>'
		end = '</' + e['tag'].lower() + '>'
	if 'children' in e:
		for ch in e['children']:
			txt = WriteElement(ch)
			if txt != None:
				cnt.append(txt)
	elif 'text' in e:
		cnt.append(e['text'])
	txt = '<br/>'.join(cnt)
	if txt.strip() == '':
		return None
	return bgn + txt + end

def WriteGroup(g: list):
	if not type(g) is list:
		print(str(g) + 'Not List')
	bgn = '<div class="cGroups">'
	end = '</div>'
	cnt = []
	for e in g:
		try:
			txt = WriteElement(e)
			if txt != None:
				cnt.append(txt)
		except:
			print(g)
	return bgn + '<br/>'.join(cnt) + end

def WriteTable(src: list):
	ret = """<style>
	body, table, tr {
		margin: 0;
		padding: 0;
		width: 100%;
		text-align: center;
	}
	td {
		padding: 10px;
		text-align: justify;
		border: 1px black solid;
	}
	td.cOriginal {
		width: 50vw;
	}
	td.cGroups {
		width: 50vw;
	}
	div.cGroups {
		border-bottom: 1px inset red;
	}
</style>"""
	ret += '<table><thead><tr>'
	ret += '<td class="cOriginal">Original</td>'
	ret += '<td class="cGroups">Groups</td>'
	ret += '</tr></thead><tbody>'
	for s in src:
		ret += '<tr><td class="cOriginal">'
		if 'html' in s:
			ret += s['html']
		else:
			ret += 'ERROR : NO-ORIGINAL-CONTENT<pre>' + json.dumps(s) + '</pre>'
		ret += '</td><td class="cGroups">'
		if 'groups' in s:
			for g in s['groups']:
				ret += WriteGroup(g)
		else:
			ret += 'ERROR : NO-GROUP-CONTENT<pre>' + json.dumps(s) + '</pre>'
		ret += '</td></td>'
	ret += '</tbody></table>'
	return ret

print('\rWriting Strip Result in ' + DST)
f = open(SRC, 'r')
src = json.loads(f.read())
f.close()
dst = WriteTable(src)
f = open(DST, 'w')
f.write(dst)
f.close()