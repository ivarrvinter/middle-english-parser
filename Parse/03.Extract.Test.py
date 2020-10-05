import json

SRC = '02.OrganizeGroups.json'
DST = '02.OrganizeGroups.html'
STYLE = """<style>
	body, table, tr {
		margin: 0;
		padding: 0;
		text-align: center;
	}
	td, th {
		padding: 10px;
		border: 1px black solid;
	}
	td {
		text-align: justify;
	}
	th {
		text-align: center;
	}
	th.cOriginal {
		width: 40vw;
	}
	th.cGroups {
		width: 60vw;
	}
	th.gId {
		width: 5vw;
	}
	th.gPos {
		width: 5vw;
	}
</style>"""

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

def WriteRow(s):
	gs = s['groups'] if 'groups' in s else [{}]
	rCnt = []
	rBgn = '<tr>'
	rEnd = '</tr>'
	gCount = len(gs)
	for i in range(gCount):
		g = gs[i]
		# Id Col
		txt = g['id'] if 'id' in g else 'ERR: No ID'
		rCnt.append('<td>' + txt + '</td>')
		# POS Col
		txt = g['pos'] if 'pos' in g else 'ERR: NO POS'
		rCnt.append('<td>' + txt + '</td>')
		# ??? Col
		txt = g['???'] if '???' in g else '-'
		rCnt.append('<td>' + txt + '</td>')
		# ??? Col
		txt = g['???'] if '???' in g else '-'
		rCnt.append('<td>' + txt + '</td>')
		# ??? Col
		txt = g['???'] if '???' in g else '-'
		rCnt.append('<td>' + txt + '</td>')
		# ??? Col
		txt = g['???'] if '???' in g else '-'
		rCnt.append('<td>' + txt + '</td>')
		# Html Col
		if i == 0:
			rCnt.append('<td rowspan="' + str(gCount) + '">' + s['html'] + '</td>')
		# Return
	return rBgn + '\n\t'.join(rCnt) + rEnd

def WriteTable(src: list):
	tCnt = []
	tBgn = '<table>\n\t<thead>'
	tBgn += '\n\t\t<tr>'
	tBgn += '\n\t\t\t<th id="hdrGroups" colspan="6" class="cGroups">Groups</th>'
	tBgn += '\n\t\t\t<th id="hdrOriginal" rowspan="2" class="cOriginal">Original Html</th>'
	tBgn += '\n\t\t</tr>'
	tBgn += '\n\t\t<tr class="cGroups">'
	tBgn += '\n\t\t\t<th header="hdrGroups" class="gId">Id</th>'
	tBgn += '\n\t\t\t<th header="hdrGroups" class="gPos">POS</th>'
	tBgn += '\n\t\t\t<th header="hdrGroups" class="g???">Definition</th>'
	tBgn += '\n\t\t\t<th header="hdrGroups" class="g???">???</th>'
	tBgn += '\n\t\t\t<th header="hdrGroups" class="g???">???</th>'
	tBgn += '\n\t\t\t<th header="hdrGroups" class="g???">???</td>'
	tBgn += '\n\t\t</tr>'
	tBgn += '\n\t</thead>\n\t<tbody>\n\t\t'
	for s in src:
		tCnt.append(WriteRow(s))
	tEnd = '\n\t</tbody>\n</table>'
	return tBgn + '\n\t\t'.join(tCnt) + tEnd

def WriteDocument(src: list):
	cnt = []
	cnt.append(STYLE)
	cnt.append(WriteTable(src))
	return '\n'.join(cnt)

print('\rWriting Strip Result in ' + DST)
f = open(SRC, 'r')
src = json.loads(f.read())
f.close()
dst = WriteDocument(src)
f = open(DST, 'w')
f.write(dst)
f.close()