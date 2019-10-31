
	//
	// hides/shows elements in the page based on CSS class
	//

function HideShowJSElements() {

	var map = {'jsHide' : 'none', 'jsShow' : 'inline', 'jsShowB' : 'block' };
//	var map = {'jsHide' : 'none', 'jsShow' : 'inline-block', 'jsShowB' : 'block' };

//	var n = 0;
	var tags = ['input', 'img', 'div', 'a', 'textarea', 'label'];

	var el;
	for (var j = 0, m = tags.length; j < m; j++) {

		var tt = document.getElementsByTagName(tags[ j ]);
		for (var i = 0; el = tt[i]; i++) {

			var p = ClassNames(el);
			for (var ii = 0, mmm = p.length; ii < mmm; ii++) {

				var d = map[ p[ii] ];
//				if (d) el.className += ' ' + d;
				if (d) el.style.display = d;
			}
		}
	}
}

	//

function OpenWinScroll(winURL, winName, w, h, top, left) {

	var winOptions = 'scrollbars=yes,resizable=yes,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left + ',status=no,location=no,toolbar=no,titlebar=no';
	var wnd = window.open('', winName, winOptions);
	if (wnd !== null) {

		wnd = window.open(
			winURL,
			winName,
			winOptions
		);
	}

	wnd && wnd.window.focus();

	return false;
}

	//
	// siccome se chiamato a mano in explorer il submit del form non invoca l'onsubmit()
	// bisogna farlo a mano
	//

function SubmitForm(idForm) {

	var f = document.getElementById(idForm);
	if (f) {

			// invoca l'handler solamente se definito

		if (f.onsubmit)
			f.onsubmit();

		f.submit();
	}
}

	//
	// Toggle DIV visibility
	//

function TV(id, controller) {

	const el = document.getElementById(id);
	if (el) {

			// al primo giro verifica se l'oggetto ha il salvataggio della label
			// TBD: 'Mostra' è hardcodeed

		if (controller && ! controller.flexLabel)
			controller.flexLabel = controller.alt.replace('Mostra', '');

		const shouldShow = el.style.display === 'none';
		el.style.display = shouldShow ? 'block' : 'none';

		const label = shouldShow ? 'Nascondi' : 'Mostra';

		if (controller)
			controller.alt = label + ' ' + controller.flexLabel;
	}

		// per l'abilitazione degli iframe all'editing

	if (window.onToggleDIV)
		window.onToggleDIV(el);

	return false;
}

