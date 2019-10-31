/*

user_pref("capability.policy.policynames", "allowclipboard");
user_pref("capability.policy.allowclipboard.sites", "http://www.example.com");
user_pref("capability.policy.allowclipboard.Clipboard.cutcopy", "allAccess");
user_pref("capability.policy.allowclipboard.Clipboard.paste", "allAccess");


https://addons.mozilla.org/extensions/moreinfo.php?application=firefox&id=852


http://www.mozilla.org/editor/midasdemo/securityprefs.html

*/

window.FlexJS = window.FlexJS || {};

FlexJS.AreaLite = function(el, opt) {

		// inizializza i membri statici

	if (typeof FlexJS.AreaLite.sCSSRule === 'undefined') {

			// estrae dal CSS di pagina le regole che servono

		var styles = ['.userFormat1', '.userFormat2', '.userFormat3', '.editPar'];

		FlexJS.AreaLite.sCSSRule = [];

		var ss = FlexJS.CSSUtils.GetCSS(document, 'BlobEdit');
		if (ss !== null) {

			for (var i = 0, m = styles.length; i < m; i++) {

				var r = FlexJS.CSSUtils.GetCSSRule(document, ss, styles[ i ]);

					// gli stili potrebbero non essere stati definiti

				if (r !== false)
					FlexJS.AreaLite.sCSSRule[ FlexJS.AreaLite.sCSSRule.length ] = r;
			}
		}

			// un array che contiene gli ID degli oggetti su cui
			// è stata attivata l'area

		FlexJS.AreaLite.sIDs = [];

			// imposta una funzione globale, handle per
			// l'abilitazione delle textarea lite che sono
			// nascoste al momento dell'istanziazione

		window.onToggleDIV = FlexJS.AreaLite.onToggleDIV;

			// inizializza la clipboard solamente se ho almeno
			// una TA editabile nel documento

		FlexJS.Clipboard.Init();
	}

	this.el = el;

	this.opt = $.extend({
		variableheight: true,
		height: 80
	}, opt);

	$(this.el).height(this.opt.height);

		// altezza del contenitore

	this.mCurHeight = 0;

		// inserisce l'elemento nell'array per tenere
		// traccia degli oggetti su cui è stata creata la TA

	FlexJS.AreaLite.sIDs[ el.id ] = this;

	this.attach();
};

	// funzione per l'abilitazione deferred delle aree
	// editabili (*)

FlexJS.AreaLite.onToggleDIV = function(el) {

	for (var id in FlexJS.AreaLite.sIDs) {

		// TBD: un metodo per l'attivazione del designmode
		// con curryng quando ha successo
		var o = FlexJS.AreaLite.sIDs[ id ];

		if (o.el.contentDocument.designMode !== 'on') {

			// il codice di abilitazione è duplicato nella FlexJS.AreaLite.prototype.attach
			try {

				o.el.contentDocument.designMode = 'on';

					// disabilita gli stili inline

				o.el.contentDocument.execCommand('styleWithCSS', false, false);

			} catch (err) {

				// l'abilitazione può fallire se l'elemento non è visibile
				// in questo caso l'attivazione viene ritardata al primo focus
				// dell'elemento (*)
			}
		}

		o.adjustHeight();

			// baco su FF 11 - è necessario forzare il refresh
			// del document altrimenti non viene correttamente
			// evidenziato

		$(o.el).height($(o.el).height()+1);
	}
};

FlexJS.AreaLite.prototype.attach = function() {

	var el = this.el;

		// abilita la modalità di editing

	try {

		el.contentDocument.designMode = 'on';

			// disabilita gli stili inline
			// per qualche motivo non documentato è necessario impostare
			// il comando con un po' di ritardo ...

		setTimeout(function () { try { el.contentDocument.execCommand('styleWithCSS', false, false); } catch(e) {} }, 1000);
//		el.contentDocument.execCommand('useCSS', false, false);

	} catch (err) {

		// l'abilitazione può fallire se l'elemento non è visibile
		// in questo caso l'attivazione viene ritardata al primo focus
		// dell'elemento (*)
	}

		// trova i bottoni sapendo che il loro ID
		// è costruito come AL_<function>_<name>
		// con <function> che vale 'B', 'I', 'U', 'X'

		// TBD: produrre dinamicamente il DOM dei bottoni

	var me = this;

	$('#AL_' + 'B' + '_' + el.id).click(function(e) { return me.onBold(e); });
	$('#AL_' + 'I' + '_' + el.id).click(function(e) { return me.onItalic(e); });
	$('#AL_' + 'U' + '_' + el.id).click(function(e) { return me.onUnderline(e); });
	$('#AL_' + 'X' + '_' + el.id).click(function(e) { return me.onCancelFormat(e); });
	$('#AL_' + 'L' + '_' + el.id).click(function(e) { return me.onLink(e); });

//		// aggiunge due gestori per il get/set di un link
//
//	el.FlexSetLink = function(v) { return me.onSetLink(v); };
//	el.FlexGetLink = function(v) { return me.onGetLink(v); };

		// operazioni sul documento

	var elCD = this.el.contentDocument;

		// disabilita lo spell checking

	elCD.body.spellcheck = false;

		// aggiunge handler per la gestione del cut/paste

//	elCD.addEventListener('keydown', function(e) { return me.onKeyDown(e); }, false);
//	elCD.addEventListener('keyup', function(e) { return me.onKeyUp(e); }, false);
//	elCD.addEventListener('keypress', function(e) { return me.onKeyPress(e); }, false);

	$(elCD).keypress(function(e) { return me.onKeyPress(e); });

		// aggiunge alle classi del body la editPar

	$('body', elCD).addClass('editPar').css({ margin: 1 });
	$(el).css({ overflow: 'hidden' });

	$('html > head', elCD).append(
		$('<style>.editPar { font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; font-size: 12px; }</style>')
	);

/*
	elCD.addEventListener('focus', function(e) { $('body', this.contentDocument).addClass('editPar').css({margin: 5}); }, false);
	elCD.addEventListener('blur', function(e) { $('body', this.contentDocument).addClass('editPar').css({margin: 0}); }, false);

	var sn = elCD.createElement('style');
	sn.setAttribute('type', 'text/css');
	sn.setAttribute('media', 'screen');
//	sn.appendChild(document.createTextNode(selector + ' {' + declaration + '}'));
	sn.appendChild(elCD.createTextNode('body::-moz-selection' + ' {' + 'background-color: black; color: yellow; ' + '}'));
	sn.appendChild(elCD.createTextNode('body:focus::-moz-selection' + ' {' + 'background-color: red; color: yellow; ' + '}'));

	elCD.getElementsByTagName('head')[0].appendChild(sn);
*/

		// disabilita il menu contestuale per evitare
		// il paste

	elCD.addEventListener('contextmenu', function(e) { return me.onMouseDown(e); }, false);

		// aggiunge un CSS per la definizione degli stili custom

	var css = FlexJS.CSSUtils.AddCSS(elCD, 'FlexDynamicCSS');
	for (var i = 0, m = FlexJS.AreaLite.sCSSRule.length; i < m; i++)
		FlexJS.CSSUtils.AddCSSRule(elCD, css, FlexJS.AreaLite.sCSSRule[i]);

	this.adjustHeight();
};

FlexJS.AreaLite.prototype.adjustHeight = function() {

	if (! this.opt.variableheight)
		return;

		// adatta la dimensione dell'iframe al contenuto
		// ma con un minimo di 15 pt, in questo modo se il paragrafo
		// è vuoto non collassa

	var h = Math.max(this.el.contentDocument.body.offsetHeight, 15);

		// siccome questo codice viene eseguito alla pressione di ogni tasto,
		// per evitare di modificare l'altezza troppo frequentemente tengo
		// traccia del suo valore attuale e la modifico solo se cambiata
		// effettivamente

	if (h != this.mCurHeight) {

		this.mCurHeight = h;
		$(this.el).height(h);
	}
};

FlexJS.AreaLite.prototype.onBold = function(e) {

	this.el.contentDocument.execCommand('bold', false, null);

	this.el.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onItalic = function(e) {

	this.el.contentDocument.execCommand('italic', false, null);

	this.el.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onUnderline = function(e) {

	var elCD = this.el.contentDocument;
	var styleName = 'userFormat3';

		// usa l'editor per assegnare un tag FONT alla selezione ...

	elCD.execCommand('fontsize', false, 7 /*styleName*/);
//	elCD.execCommand('italic', false, null);

		// ... poi lo cerca per cambiare stile all'elemento

	var innerEls = elCD.getElementsByTagName('font'), innerEl;
	for (var idx = 0; (innerEl = innerEls[idx]); idx++) {

/*
		if (innerEl.style.fontFamily === styleName) {

			innerEl.className = innerEl.style.fontFamily;
			innerEl.removeAttribute('style', 0);
		}
*/

		if (innerEl.size == 7 /*styleName*/) {

//			innerEl.size = '+0';

			innerEl.className = styleName;
			innerEl.removeAttribute('size', 0);
		}
	}

	this.el.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onCancelFormat = function(e) {

	this.el.contentDocument.execCommand('unlink', false, null);
	this.el.contentDocument.execCommand('removeformat', false, null);

	this.el.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onLink = function(e) {

	e.preventDefault();

	var me = this;
	FlexJS.Loader.LoadJS(
		'js/jq/FlexJS.PageSelector.js',
		function() {

			FlexJS.PageSelector.Show({
				set: function(v) { return me.onSetLink(v); },
				get: function(v) { return me.onGetLink(v); }
//				sieet: function(v) {
//
//					return me.onSetLink(v);
//				},
//				giet: me.FlexGetLink /* GetValueTA */
			});
		}
	);
};

FlexJS.AreaLite.prototype.onSetLink = function(v) {

	const s = this.el.contentWindow.getSelection();
	const r = s.getRangeAt(0);

		// se è un nodo interno, davanti viene messo un finto
		// protocollo, altrimenti non si riesce ad inserire il nodo

	const url = 'link:[[' + v.id + ']]';

	if (r.collapsed) {

		this.el.contentDocument.execCommand('inserthtml', false, "<a href='" + url + "'>" + v.desc + "</a>");

	} else
		this.el.contentDocument.execCommand('createlink', false, url);

	return false;
};

FlexJS.AreaLite.prototype.onGetLink = function() {

	var s = this.el.contentWindow.getSelection();
	var r = s.getRangeAt(0);

	if (r.collapsed)
		return '';

	var selNode = null;

    if ( s.anchorNode.childNodes.length > s.anchorOffset && s.anchorNode.childNodes[s.anchorOffset].nodeType === 1 ) {

      selNode = s.anchorNode.childNodes[ s.anchorOffset ];

    } else if ( s.anchorNode.nodeType === 1 ) {

      selNode = s.anchorNode;
    }

	if (selNode !== null && selNode.nodeType === 1 && selNode.tagName === 'A') {

			// se è un nodo interno, davanti viene messo un finto
			// protocollo, altrimenti non si riesce ad inserire il nodo

		return selNode.href.replace(/^link:\[\[([^\]]+)\]\]/, '$1');
	}

	return '';
};

	// per adesso keydown e keyup non sono usati

// FlexJS.AreaLite.prototype.onKeyDown = function(e) {};
// FlexJS.AreaLite.prototype.onKeyUp = function(e) {};

FlexJS.AreaLite.prototype.onKeyPress = function(e) {

		// 118: v
		// 45: INS

     if (((e.ctrlKey || e.metaKey) && e.charCode == 118) || (e.shiftKey && e.keyCode == 45)) {

			// gestisce il paste
			//
			// recupera il contenuto della clipboard

		var text = FlexJS.Clipboard.Get();
		if (text === false) {

				// si è verificato un errore al caricamento della clipboard
				// è probabile che l'utente non abbia le impostazioni corrette
				// per poter accedere
/*
			FlexJS.Loader.LoadCSS('js/jq/ui/dialog.css');
			FlexJS.Loader.LoadJS(['js/jq/ui.core.js', 'js/jq/ui.dialog.js'], function () {

				$(document.body)
					.append('<div id="example" class="flora" title="Attenzione">'
						+ "Non &egrave; possibile effettuare azioni di copia e incolla nei paragrafi di testo "
						+ "poich&eacute; il browser &egrave; attualmente impostato per non "
						+ "consentire tali azioni.<br />"
						+ "Per maggiori informazioni sulle regole di sicurezza di utilizzo "
						+ "dell'editor visuale di Mozilla consultare questo documento:<br />"
						+ "<a href='http://www.mozilla.org/editor/midasdemo/securityprefs.html' xml:lang='en' onclick='TBHack.Open(this.href); return false;'>"
						+ "Setting Prefs for the Mozilla Rich Text Editing Demo"
						+ "</a>."
						+ "<br /><br />"
						+ "&Egrave; disponibile una "
						+ "<a href='https://addons.mozilla.org/en-US/firefox/addon/852' onclick='TBHack.Open(this.href); return false;'>estensione</a> "
						+ "che permette in modo rapido ed agevole di modificare le regole di "
						+ "sicurezza ed abilitare il copia e incolla."
						+ '</div>');

				$("#example").dialog();

			}, true);

*/
			FlexJS.Loader.LoadJS('js/jq/jDialog/jDialog.js', function () {

				/* jshint laxbreak:true */

				new FlexJS.UI.Dialog('Attenzione',
						"Non &egrave; possibile effettuare azioni di copia e incolla nei paragrafi di testo "
						+ "poich&eacute; il browser &egrave; attualmente impostato per non "
						+ "consentire tali azioni.<br />"
						+ "Per maggiori informazioni sulle regole di sicurezza di utilizzo "
						+ "dell'editor visuale di Mozilla consultare questo documento:<br />"
						+ "<a href='http://www.mozilla.org/editor/midasdemo/securityprefs.html' xml:lang='en' onclick='FlexJS.TBHack.Open(this.href); return false;'>"
						+ "Setting Prefs for the Mozilla Rich Text Editing Demo"
						+ "</a>.",
					470, 200);
			}, true);

		} else {

			// TBD: bisognerebbe pulire l'html

			// text = text.replace(/\n/g, '<br />');
			this.el.contentDocument.execCommand('inserthtml', false, text);
		}

		return e.preventDefault();
    }

		// deve aspettare che il carattere sia inserito
		// il timeout di 1/1000 di secondo sfrutta il fatto che JS
		// non è multithread, quindi quest'azione sarà eseguita al termine
		// del servizio dell'evento

	var me = this;
	setTimeout(function() { me.adjustHeight(); }, 1);

	return true;
};

FlexJS.AreaLite.prototype.onMouseDown = function(e) {

	e.stopPropagation();

	return false;
};


	//
	// gestione del clipboadr per Mozilla
	//

FlexJS.Clipboard = window.FlexJS.Clipboard || function () {

		// quando ho il DOM creato, aggiungo l'iframe

	// $(document).ready(function () { FlexJS.Clipboard.Init(); });

	return {};
}();

FlexJS.Clipboard.Init = function () {

	if (typeof FlexJS.Clipboard.sFrameObj === 'undefined') {

		var iframe = document.createElement('iframe');

		iframe.setAttribute('id', 'FlexPasteFrame');
		iframe.style.border = iframe.style.width = iframe.style.height =
			iframe.style.width = iframe.style.height = '0px';

			// in questo modo quando si fa il paste non ottengo lo scroll
			// nella posizione corrente dell'iframe

		iframe.style.position = 'fixed';

		iframe.onload = FlexJS.Clipboard._InitCont;

		FlexJS.Clipboard.sFrameObj = document.body.appendChild(iframe);
	}
};

FlexJS.Clipboard._InitCont = function () {

	if (typeof FlexJS.Clipboard.sFrameObj !== 'undefined') {

			// abilita la modalità di editing

		try {

			FlexJS.Clipboard.sFrameObj.contentDocument.designMode = 'on';

		} catch (err) {}
	}
};

FlexJS.Clipboard.Put = function (text) {

	alert('FlexJS.Clipboard.Put: TBD'); //NOSONAR

	return;
};

FlexJS.Clipboard.Get = function () {

	var elCD = FlexJS.Clipboard.sFrameObj.contentDocument;

//	try {

			// prima di fare il paste, seleziona tutto: in questo modo
			// il nuovo contenuto sostituisce il vecchio

		elCD.execCommand('selectall', false, null);
		elCD.execCommand('paste', false, null);

		FlexJS.HTMLUtils.CleanMozDOM(elCD.body);

		var t = FlexJS.HTMLUtils.GetCleanHTML(elCD.body);


		return t;

//	} catch (e) {

			// non ho i permessi per cut/paste

//		return false;
//	}
};