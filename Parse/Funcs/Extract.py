def FindAllWithTag(root, tag):
	ret = []
	rootType = type(root)
	if rootType is dict:
		if 'tag' in root and root['tag'] == tag:
			ret.append(root)
		elif 'children' in root:
			for ch in root['children']:
				found = FindAllWithTag(ch, tag)
				for f in found:
					ret.append(f)
	elif rootType is list:
		for ch in root:
			found = FindAllWithTag(ch, tag)
			for f in found:
				ret.append(f)
	return ret

def FindNthFirstWithTag(sElement, tag, nth):
	cFound = 0
	sType = type(sElement)
	if sType is dict:
		if 'tag' in sElement and sElement['tag'] == tag:
			cFound += 1
			if cFound >= nth:
				return sElement, cFound
		elif 'children' in sElement:
			for ch in sElement['children']:
				bElement, cFoundInside = FindNthFirstWithTag(ch, tag, nth)
				cFound += cFoundInside
				if bElement != None and cFound >= nth:
					return bElement, cFound
	elif sType is list:
		for ch in sElement:
			bElement, cFoundInside = FindNthFirstWithTag(ch, tag, nth)
			cFound += cFoundInside
			if bElement != None and cFound >= nth:
				return bElement, cFound
	return None, cFound

def FindFirstParentWithChild(rootElement, sTarget):
	rootType = type(rootElement)
	if rootType is dict:
		ks = list(rootElement.keys())
		for k in ks:
			if rootElement[k] == rootElement:
				return rootElement
			parentElement = FindFirstParentWithChild(s[k], sTarget)
			if parentElement != None:
				return parentElement
	elif rootType is list:
		for item in rootElement:
			if item == rootElement:
				return rootElement
			parentElement = FindFirstParentWithChild(item, sTarget)
			if parentElement != None:
				return parentElement
	return None
