
	//
	// funzioni per l'aggiunta o l'eliminazione di una classe da un elemento
	//

function AddClassName(el, sClassName) {

//	var s = el.className;
//	var p = s.split(' ');
	var p = ClassNames(el);
	
	var l = p.length;
	for (var i = 0; i < l; i++) {
		if (p[i] == sClassName)
			return;
	}
	p[p.length] = sClassName;
	el.className = p.join(' ');
}

	// begin booleano che indica se inserire in testa (TRUE) o in coda (FALSE)

function AddClassNameBeginEnd(el, sClassName, begin) {

//	var n = el.className.split(' ');
	var n = ClassNames(el);

		// elimina dall'array l'elemento
	
	var pos = -1;
	for (var i = 0; i < n.length; i++) {

		if (n[i] == sClassName) {
		
			pos = i;
			break;
		}
	}
		
	if (pos != -1)
		n.splice(pos, 1);

		// lo aggiunge in testa o in coda

	var s = new Array(sClassName);
	var res = (begin ? s.concat(n) : n.concat(s));
		
	el.className = res.join(' ');
}

function RemoveClassName(el, sClassName) {

//	var s = el.className;
//	var p = s.split(' ');
	var p = ClassNames(el);
	
	var np = [];
	var l = p.length;
	var j = 0;
	for (var i = 0; i < l; i++) {
		if (p[i] != sClassName)
			np[j++] = p[i];
	}

	el.className = np.join(' ');
}

function HasClassName(el, sClassName) {

//	var s = el.className;
//	var p = s.split(' ');

	var p = ClassNames(el);

	var l = p.length;
	for (var i = 0; i < l; i++) {
//	alert(p[i] + ' - ' + sClassName);
		if (p[i] == sClassName)
			return true;
	}
	
	return false;
}

function ClassNames(el) {

	return el.className.split(' ');
}