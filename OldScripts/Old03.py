import re
import json

posList = {
	'n.': 'Noun',
	'v.': 'Verb',
	'sb.': 'Subjunctive',
	'subj.': 'Subjunctive',
	'pron.': 'Pronoun',
	'adj.': 'Adjective',
	'conj.': 'Conjunction',
	'num.': 'Numeral',
	'card.': 'Cardinal Adjective',
	'ord.': 'Ordinal Adjective',
	'adv.': 'Adverb',
	'prep.': 'Preposition',
	'det.': 'Determiner',
	'art.': 'Article',
	'pp.': 'Past Participle',
	'inter.': 'Interjection',
	'interj.': 'Interjection',
	'prefix': 'Prefix',
	'prefix.': 'Prefix',
	'suffix': 'Suffix',
	'suffix.': 'Suffix',
	'pl.': 'Plural',
	'gen.': 'Genitive',
	'comp.': 'Comperative Adjective',
	'dat.': 'Dative',
	'pt.': '?POS:pt.?',
	'vb.': 'Verb',
	'intrans.' : 'Interansitive',
	'imp.' : 'Imperative',
	's.' : "Singular",
	'1 pr.': '1st Person',
	'2 pr.': '2nd Person',
	'tr.': 'Transitive'
}

def PosMapFunc(x):
	if len(x) <= 0:
		return [None, False]
	if not x.endswith('.'):
		x += '.'
	if x in posList:
		return [posList[x], True]
	return ['<span style="color: red;">SKIPPED : ' + x + '</span>', False]

def XfChild(w: str, ch:dict, trg:dict, html:str):
	nextIdx:bool
	tmp = []
	# Parse
	if 'tag' in ch and ch['tag'] == 'I':
		# Find in Italics
		p = ch['text']
		mapped = list(map(PosMapFunc, re.split('\. ', p)))
		# Count Corrects
		mCount = 0
		for m in mapped:
			tmp.append(m[0])
			if m[1]:
				mCount += 1
		# If parsed, There may be more, Continue
		nextIdx = (mCount > 0)
	# Parse other forms
	elif ('text' in ch):
		# Check if There's an 'and', and Continue if required
		if ('text' in ch) and ('and' in ch['text'].lower()):
			nextIdx = True
		# Add 'Phrase' if conditions match
		elif not ('pos' in trg or 'see' in html):
			tmp.append('Phrase')
			nextIdx = False
		else:
			nextIdx = False
	else:
		# Unknown Element, Terminate
		nextIdx = False
	# Add up
	if not 'pos' in trg:
		trg['pos'] = []
	for t in tmp:
		if not t in trg['pos']:
			trg['pos'].append(t)
	# Clean UP
	while None in trg['pos']:
		trg['pos'].remove(None)
	if len(trg['pos']) == 0:
		trg.pop('pos')
	# Return
	return trg, nextIdx
def XfDef(w: str, s:dict):
	if s['tag'] == 'SPAN' and 'pagenum' in s['class'].values():
			# It's a page number
			return None
	d = {}
	chs = s['children']
	shouldContinue = True
	for ch in chs:
		d, shouldContinue = XfChild(w, ch, d, s['html'])
	d['src'] = s
	return d

def Execute(src:dict):
	words = list(src.keys())
	ret = {}
	for w in words:
		defs = src[w]
		for i in range(0, len(defs)):
			defs[i] = XfDef(w, defs[i])
		while None in defs:
			defs.remove(None)
		if len(defs) > 0:
			ret[w] = defs
	return ret

f = open('01.json', 'r')
src = json.loads(f.read())
f.close()
dst = Execute(src)
f = open('02.json', 'w')
f.write(json.dumps(dst, sort_keys=True, indent=4))
f.close()