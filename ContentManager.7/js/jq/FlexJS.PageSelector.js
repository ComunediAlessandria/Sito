
	//
	// Selettore di pagina
	//

window.FlexJS = window.FlexJS || {};

FlexJS.PageSelector = window.FlexJS.PageSelector || {};

	// suppone che un'unica finestra sia attiva per volta, in questo
	// modo può tenere in questa statica il valore dell'id che
	// ha fatto la richiesta della pagina

/*
FlexJS.PageSelector.id = null;
FlexJS.PageSelector.opts = null;


FlexJS.PageSelector.Show = function(id, opts) {

		// ho due elementi:
		// - <id>: il campo di testo vero e proprio
		// - <id>_DESC: il campo per la descrizione

		// mi attacco al click dell'<a> esterno all'immagine

	$('#' + id).parent().click(function(e) {

		e.preventDefault();

		FlexJS.PageSelector.Show = function(id, opts);
	});
}
*/

FlexJS.PageSelector._o = null;
FlexJS.PageSelector.Show = function(opts) {

	FlexJS.PageSelector._o = $.extend({
		mode: 'window',
		set: function() {},
		get: function() {},
		panels: ['blob', 'html', 'php', 'http']
	}, opts);

		// guarda se ho una pagine preselezionata

	var v = FlexJS.PageSelector._o.get();
	if (v !== '') {

			// il link può avere componenti come ftp:// o http://
			// che anche se encodate creano dei problemi lato server
			// per questo motivo vengono sostituite:
			//
			// '/' -> '_'

		v = '/P/' + encodeURIComponent(v.replace(/\//g, '~'));
	}

		// parametro per specificare quali pannelli aprire

	var panels = '/panels/' + FlexJS.PageSelector._o.panels.join(',');

	var url  = FlexJS.AppConfigure.Get('kBaseURL') + '/pages/PopupPageSelector.v2.php' + '/L/' + FlexJS.AppConfigure.Get('lang') + panels + v;

		// a seconda della modalità impostata genera l'elemento richiesto

	switch (FlexJS.PageSelector._o.mode) {

		case 'window': FlexJS.PageSelector.OpenWindow(url); break;
		case 'dialog': FlexJS.PageSelector.OpenDialog(url); break;
		case 'iframe':

				var d = $('#' + FlexJS.PageSelector._o.id).get(0);
				d.setAttribute('src', url);

			break;
	}
};

FlexJS.PageSelector.OpenWindow = function(url) {

	var w = 760;
	var h = 350;		// valore minimo 100 px in IE?

		// centra la finestra

	var top = (screen.height - h) / 2;
	var left = (screen.width - w) / 2;

	window.open(
		url,
		'FlexPageSel',
		'left=' + left + ', top=' + top + ', height=' + h + ',  width=' + w + ', resizable=yes,  status=no, scrollbars=no'
	);
};

/*
FlexJS.PageSelector.sDiv = null;
FlexJS.PageSelector.OpenDialog = function(url) {

	FlexJS.Loader.LoadJS(
		[ 'js/jq/ui.core.js', 'js/jq/ui.dialog.js' ],
		function() {

			var d = document.createElement('div');
//			d.setAttribute('id', 'FlexPageSelector');

			d.style.width = d.style.height
				= d.style.width = d.style.height = 0;

			$(d).attr({
				id: 'FlexPageSelector',
				margin: 0
			});

			FlexJS.PageSelector.sDiv = document.body.appendChild(d);

//			$('#FlexPageSelector').dialog({ modal: true, overlay: { opacity: 0.5, background: 'black' } });
			$(FlexJS.PageSelector.sDiv).load(url);
			$('#FlexPageSelector').dialog({ modal: true, resizable: false, autoResize: false, overlay: { opacity: 0.5, background: 'black' } });
		}
	);
}
*/

	// invocata dalla pagina esterna sia per leggere
	// il valore correntemente impostato che per
	// impostare il nuovo valore
	// v = { id: <id pagina>, desc: <descrizione> }

FlexJS.PageSelector.CB = function(what, v) {

	var o = FlexJS.PageSelector._o;
	switch (what) {

		case 'get':
				return o.get();

		case 'set':
				return o.set(v);

		case 'opt':
				return o;
	}
};

	// invocata all'apertura per stabilire le opzioni del
	// pannello

FlexJS.PageSelector.GetOptions = function() {

	return FlexJS.PageSelector.opts;
};

/*
	// imposta il valore per un campo di testo con associato span di descrizione

FlexJS.PageSelector.SetValue = function(selid, desc) {

	id = FlexJS.PageSelector.id;

	$('#' + id).val(selid);
	$('#' + id + '_DESC').html(desc).addClass('FlexEditAdminPageSelector');

//	alert('From parent into ' + id + ': ' + selid + ': ' + desc);

	FlexJS.PageSelector.id = null;
}

FlexJS.PageSelector.GetValue = function(id) {

	return $('#' + id).val();
}

	// imposta il valore di un link in una TA

FlexJS.PageSelector.SetValueTA = function(selid, desc) {

	var sel = document.selection.createRange().parentElement();
	if (sel.tagName == 'A') {

			// forza il testo del link a quello che c'era prima
			// perché nel caso di link creati automaticamente dal
			// componente di editing, explorer modifica anche il testo
			// del link stesso

		var text = sel.innerHTML;
		document.execCommand('CreateLink', false, '[[' + selid + ']]');
		sel.innerHTML = text;

	} else
		document.execCommand('CreateLink', false, '[[' + selid + ']]');
//		document.execCommand('inserthtml', false, 'bau!');
//		document.execCommand('inserthtml', false, '<a href="[[' + selid + ']]">' + desc + '</a>');
}


FlexJS.PageSelector.GetValueTA = function(id) {
/ *
		// AL_L_DIV_1 -> DIV_1

	var p = id.split('_');

	var divid = p[2] . '_' . p[3];
* /
	var value = '';

	var sel = document.selection.createRange().parentElement();
	if (sel.tagName == 'A') {

			// se sono link interni hanno le quadre, altrimenti no

		var re = new RegExp("\\[\\[([^\\]]+)\\]\\]");
		var match = re.exec(sel.href);

		if (match != null)
			value = match[1];
		else
			value = sel.href;
	}

	return value;
}


*/