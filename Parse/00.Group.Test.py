import json

SRC = '00.Group.json'
DST = '00.Group.html'

def WriteElement(e: dict):
	ret = ''
	end = ''
	if 'tag' in e:
		ret += '<' + e['tag'].lower() + '>'
		end = '</' + e['tag'].lower() + '>'
	content = ''
	if 'children' in e:
		for ch in e['children']:
			cnt = WriteElement(ch)
			if cnt != None:
				content += cnt
	elif 'text' in e:
		content = e['text']
	if content.strip() == '':
		return None
	return ret + content + end

def WriteGroup(g: list):
	if not type(g) is list:
		print(str(g) + 'Not List')
	ret = '<div class="cGroups">'
	for e in g:
		try:
			txt = WriteElement(e)
		except:
			print(g)
		if txt != None:
			ret += txt
	return ret + '</div>'

def WriteTable(src: list):
	ret = """<style>
	* {
		margin: 0;
		padding: 0;
	}
	body {
		text-align: center
	}
	td {
		padding: 10px;
		border: 1px black solid;
	}
	td.cOriginal {
		max-width: 50vw;
	}
	td.cGroups {
		max-width: 50vw;
	}
	div.cGroups {
		border-bottom: 1px inset red;
	}
</style>"""
	ret += '<table><thead><tr><td class="cOriginal">Original</td><td class="cGroups">Groups</td></td></thead><tbody>'
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

print('\rWriting Groups Result in ' + DST)
f = open(SRC, 'r')
src = json.loads(f.read())
f.close()
dst = WriteTable(src)
f = open(DST, 'w')
f.write(dst)
f.close()