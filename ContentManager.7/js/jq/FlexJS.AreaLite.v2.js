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

		FlexJS.AreaLite.sIDs = {};

			// imposta una funzione globale, handle per
			// l'abilitazione delle textarea lite che sono
			// nascoste al momento dell'istanziazione

		window.onToggleDIV = FlexJS.AreaLite.onToggleDIV;

			// inizializza la clipboard solamente se ho almeno
			// una TA editabile nel documento

//		FlexJS.Clipboard.Init();
	}

	this.$el = $(el);

	this.$if = this.$el.find('iframe');
	this.if = this.$if.get(0);

	this.cd = this.if.contentDocument;
	this.$cd = $(this.cd);

	this.$body = this.$cd.find('body');

	this.$ta = this.$el.find('.flex-arealight-textarea'); //$(ta); // text area associata

	var ap = this.$el.data('option-allow-word-paste');

	this.opt = $.extend({
		variableheight: true,
		height: 80,
		allowWordPaste: ap == 1 || ap === undefined
	}, opt);

	this.$pb = null; // pasteboard

	this.$if.height(this.opt.height);

		// altezza del contenitore

	this.mCurHeight = 0;

		// inserisce l'elemento nell'array per tenere
		// traccia degli oggetti su cui è stata creata la TA

	FlexJS.AreaLite.sIDs[ el.id ] = this;

	this.attach();
};

FlexJS.AreaLite.getInstances = function() { return FlexJS.AreaLite.sIDs; };

	// funzione per l'abilitazione deferred delle aree
	// editabili (*)

FlexJS.AreaLite.onToggleDIV = function(el) {

		// è un accrocchio: deve ricavare in base all'elemento
		// diventato visibile l'oggetto responsabile della gestione
		// dell'area

	el.find('.flex-arealight-container').each(function() {

		if (FlexJS.AreaLite.sIDs[this.id])
			FlexJS.AreaLite.sIDs[this.id].adjustHeight();
	});

//	//	for (var id in FlexJS.AreaLite.sIDs) {
//		$.each(FlexJS.AreaLite.sIDs, function() {

//			// TBD: un metodo per l'attivazione del designmode
//			// con curryng quando ha successo
//			var al = this; //FlexJS.AreaLite.sIDs[ id ];

//			if (al.cd.designMode !== 'on') {

//				// il codice di abilitazione è duplicato nella FlexJS.AreaLite.prototype.attach
//				try {

//					al.cd.designMode = 'on';

//						// disabilita gli stili inline

//					al.cd.execCommand('styleWithCSS', false, false);

//				} catch (err) {

//					// l'abilitazione può fallire se l'elemento non è visibile
//					// in questo caso l'attivazione viene ritardata al primo focus
//					// dell'elemento (*)
//				}
//			}

//			al.adjustHeight();

//				// baco su FF 11 - è necessario forzare il refresh
//				// del document altrimenti non viene correttamente
//				// evidenziato

//			al.$if.height(al.$if.height() + 1);
//		});
};

FlexJS.AreaLite.prototype.attach = function() {

	var cd = this.cd;

		// abilita la modalità di editing

	try {

//		cd.designMode = 'on';
		this.$body.attr('contenteditable', true);


			// disabilita gli stili inline
			// per qualche motivo non documentato è necessario impostare
			// il comando con un po' di ritardo ...

		setTimeout(function () { try { cd.execCommand('styleWithCSS', false, false); } catch(e) {} }, 1000);
//		el.contentDocument.execCommand('useCSS', false, false);

	} catch (err) {

		// l'abilitazione può fallire se l'elemento non è visibile
		// in questo caso l'attivazione viene ritardata al primo focus
		// dell'elemento (*)
	}

	this.$el.on('click', 'button', $.proxy(this.onCommandClick, this));

//		// aggiunge due gestori per il get/set di un link
//
//	el.FlexSetLink = function(v) { return me.onSetLink(v); };
//	el.FlexGetLink = function(v) { return me.onGetLink(v); };

		// operazioni sul documento

//	var elCD = this.el.contentDocument;

		// disabilita lo spell checking

	cd.body.spellcheck = false;

		// aggiunge handler per la gestione del cut/paste

//	elCD.addEventListener('keydown', function(e) { return me.onKeyDown(e); }, false);
//	elCD.addEventListener('keyup', function(e) { return me.onKeyUp(e); }, false);
//	elCD.addEventListener('keypress', function(e) { return me.onKeyPress(e); }, false);

//	$(cd).keypress(function(e) { return me.onKeyPress(e); });
	$(cd).on('keypress', $.proxy(this.onKeyPress, this));

		// aggiunge alle classi del body la editPar

	$('body', cd).addClass('editPar').css({ margin: 1 });
	this.$if.css({ overflow: 'hidden' });

	$('html > head', cd).append(
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
		// il paste (che non potrebbe essere intercettato)

//	cd.addEventListener('contextmenu', function(e) { return false; }, false);
	this.$cd.on('contextmenu', function(e) { return false; });

		// aggiunge un CSS per la definizione degli stili custom

	var css = FlexJS.CSSUtils.AddCSS(cd, 'FlexDynamicCSS');
	for (var i = 0, m = FlexJS.AreaLite.sCSSRule.length; i < m; i++)
		FlexJS.CSSUtils.AddCSSRule(cd, css, FlexJS.AreaLite.sCSSRule[i]);

		// sostituisce le '[[' entro cui sono racchiusi i link
		// flex mettendo davanti un finto protocollo 'link:'
		// poiché altrimenti moz non fa vedere il link come tale
		// pur mantenendo l'href
		// questo viene fatto solo per i protocolli riconosciuti da
		// flex, tutto il resto viene considerato link esterno

	this.setText(this.$ta.val().replace(/\[\[BLOB/g, 'link:[[BLOB'));

	this.adjustHeight();
};

FlexJS.AreaLite.prototype.setText = function(t) {

	this.cd.body.innerHTML = t;
};

FlexJS.AreaLite.prototype.getText = function() {

	this.removePasteBin();

	//var b = this.cd.body;
	var b = this.$body.get(0);

	FlexJS.AreaLite.CleanMozDOM(b);

	return FlexJS.HTMLUtils.GetCleanHTML(b);
};

FlexJS.AreaLite.prototype.terminateEditing = function(e) {

	this.$ta.val(this.getText());
};

FlexJS.AreaLite.prototype.onCommandClick = function(e) {

	// fix per FF 66+
	// switch ($(e.target).data('command')) {
	switch ($(e.currentTarget).data('command')) {
		case 'bold':		return this.onBold();
		case 'italic':		return this.onItalic();
		case 'underline':	return this.onUnderline();
		case 'x':			return this.onCancelFormat();
		case 'xf':			return this.onCancelAllFormat();
		case 'link':		return this.onLink();
	}

	return false;
};

FlexJS.AreaLite.prototype.adjustHeight = function() {

	if (! this.opt.variableheight)
		return;

		// adatta la dimensione dell'iframe al contenuto
		// ma con un minimo di 15 pt, in questo modo se il paragrafo
		// è vuoto non collassa

	var h = Math.max(this.cd.body.offsetHeight, 15);

		// siccome questo codice viene eseguito alla pressione di ogni tasto,
		// per evitare di modificare l'altezza troppo frequentemente tengo
		// traccia del suo valore attuale e la modifico solo se cambiata
		// effettivamente

	if (h != this.mCurHeight) {

		this.mCurHeight = h;
		this.$if.height(h);
	}
};

FlexJS.AreaLite.prototype.onBold = function() {

	this.cd.execCommand('bold', false, null);

	this.if.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onItalic = function() {

	this.cd.execCommand('italic', false, null);

	this.if.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onUnderline = function() {

//	var elCD = this.el.contentDocument;
	var styleName = 'userFormat3';

		// usa l'editor per assegnare un tag FONT alla selezione ...

	this.cd.execCommand('fontsize', false, 7 /*styleName*/);
//	elCD.execCommand('italic', false, null);

		// ... poi lo cerca per cambiare stile all'elemento

	var innerEls = this.cd.getElementsByTagName('font'), innerEl;
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

	this.if.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onCancelFormat = function() {

	this.cd.execCommand('unlink', false, null);
	this.cd.execCommand('removeformat', false, null);

	this.if.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onCancelAllFormat = function() {

	var h = this.getText();

	h = h.replace(/\n/g, '');

		// cfr. gmail

	h = h.replace(/<style([\s\S]*?)<\/style>/gi, '');
	h = h.replace(/<script([\s\S]*?)<\/script>/gi, '');
	h = h.replace(/<\/div>/ig, '\n');
	h = h.replace(/<\/li>/ig, '\n');
	h = h.replace(/<li>/ig, '  *  ');
	h = h.replace(/<\/ul>/ig, '\n');
	h = h.replace(/<\/p>/ig, '\n');
	h = h.replace(/<br\s*[\/]?>/gi, '\n');
	h = h.replace(/<[^>]+>/ig, '');

		// ripristina le andate a capo in html

	h = h.replace(/\n/g, '<br />');

	this.setText(h);

	this.if.contentWindow.focus();

	return false;
};

FlexJS.AreaLite.prototype.onLink = function() {

//	e.preventDefault();

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

	return false;
};

FlexJS.AreaLite.prototype.onSetLink = function(v) {

	const s = this.if.contentWindow.getSelection();
	const r = s.getRangeAt(0);

		// se è un nodo interno, davanti viene messo un finto
		// protocollo, altrimenti non si riesce ad inserire il nodo

	const url = 'link:[[' + v.id + ']]';

	if (r.collapsed) {

		this.cd.execCommand('inserthtml', false, "<a href='" + url + "'>" + v.desc + "</a>");

	} else
		this.cd.execCommand('createlink', false, url);

	return false;
};

FlexJS.AreaLite.prototype.onGetLink = function() {

	var s = this.if.contentWindow.getSelection();
	var r = s.getRangeAt(0);

	if (r.collapsed)
		return '';

	var selNode = null;

    if (s.anchorNode.childNodes.length > s.anchorOffset && s.anchorNode.childNodes[s.anchorOffset].nodeType === 1) {

      selNode = s.anchorNode.childNodes[ s.anchorOffset ];

    } else if (s.anchorNode.nodeType === 1) {

      selNode = s.anchorNode;
    }

	if (selNode !== null && selNode.nodeType === 1 && selNode.tagName === 'A') {

			// se è un nodo interno, davanti viene messo un finto
			// protocollo, altrimenti non si riesce ad inserire il nodo

//		return selNode.href.replace(/^link:\[\[([^\]]+)\]\]/, '$1');

			// restituisce l'attributo altrimenti il browser lo altera

		return $(selNode).attr('href').replace(/^(?:link:)?\[\[([^\]]+)\]\]/, '$1');
	}

	return '';
};

FlexJS.AreaLite.prototype.onKeyPress = function(e) {

	if (((e.ctrlKey || e.metaKey) && e.charCode === 118) || (e.shiftKey && e.keyCode === 45)) {

        this.sel = this.if.contentWindow.getSelection().getRangeAt(0);

		if (this.$pb === null)
			this.$pb = this.createPasteBin();


//					pastebinElm.firstChild.innerText = '';

// if (shouldPasteAsPlainText()) {
// processText(innerText(pastebinElm.firstChild));
// } else {
// processHtml(pastebinElm.firstChild.innerHTML);
// }
// }, 0);

//					});

//			el.contentDocument.designMode = 'off';

		this.$pb
			.show()
			.find('div')
				.html('')
				.get(0)
					.focus()
		;

//					return true;
	} else
		setTimeout($.proxy(this.adjustHeight, this), 10);

	return true;
};
	// per adesso keydown e keyup non sono usati

// FlexJS.AreaLite.prototype.onKeyDown = function(e) {};
// FlexJS.AreaLite.prototype.onKeyUp = function(e) {};

// FlexJS.AreaLite.prototype.__onKeyPress = function(e) {

//			// 118: v
//			// 45: INS

//		if (((e.ctrlKey || e.metaKey) && e.charCode === 118) || (e.shiftKey && e.keyCode === 45)) {

//				// gestisce il paste
//				//
//				// recupera il contenuto della clipboard

//			var text = FlexJS.Clipboard.Get();
//			if (text === false) {

//					// si è verificato un errore al caricamento della clipboard
//					// è probabile che l'utente non abbia le impostazioni corrette
//					// per poter accedere

//				FlexJS.Loader.LoadJS('js/jq/jDialog/jDialog.js', function () {

//					/* jshint laxbreak:true */

//					new FlexJS.UI.Dialog('Attenzione',
//							"Non &egrave; possibile effettuare azioni di copia e incolla nei paragrafi di testo "
//							+ "poich&eacute; il browser &egrave; attualmente impostato per non "
//							+ "consentire tali azioni.<br />"
//							+ "Per maggiori informazioni sulle regole di sicurezza di utilizzo "
//							+ "dell'editor visuale di Mozilla consultare questo documento:<br />"
//							+ "<a href='http://www.mozilla.org/editor/midasdemo/securityprefs.html' xml:lang='en' onclick='FlexJS.TBHack.Open(this.href); return false;'>"
//							+ "Setting Prefs for the Mozilla Rich Text Editing Demo"
//							+ "</a>.",
//						470, 200);
//				}, true);

//			} else {

//				// TBD: bisognerebbe pulire l'html

//				// text = text.replace(/\n/g, '<br />');
//				this.cd.execCommand('inserthtml', false, text);
//			}

//			return e.preventDefault();
//		}

//			// deve aspettare che il carattere sia inserito

//		var me = this;
//		setTimeout(function() { me.adjustHeight(); }, 1);

//		return true;
// };

FlexJS.AreaLite.prototype.createPasteBin = function() {

	var pb = $('<div />')
		.attr('contentEditable', false)
		.css({
//						position: 'absolute',

			top: this.$body.scrollTop(),
			left: 0,
			width: 1,
			height: 51,
			overflow: 'hidden'

//						border: '1px solid red'
		})
	;

	$('<div />')
		.attr('contentEditable', true)
		.appendTo(pb)
	;

	pb.on('beforedeactivate focusin focusout', function() { return false; });

	var me = this;
	pb.on('paste', function(e) {

		setTimeout(function() {

			// editor.selection.setRng(lastRng);

			pb.hide();

			if (me.opt.allowWordPaste && $('#edit-enablewordpaste').prop('checked')) {

				var t = pb.find('div').html();

				if (t.match(/<(table|h[1-5])/i)) {

					setTimeout(function() {

						var
							fb = $('#formBLOB'),
							ta = $('<input type=\'text\' />')
								.attr('name', 'PasteBinTA')
								.val(t)
								.hide()
								.appendTo(fb)
						;

						fb/*.get(0)*/.submit();
					}, 1);

					return false;
				}
			}

				// me.sel è un oggetto Range (https://developer.mozilla.org/en-US/docs/Web/API/range)

			me.sel.deleteContents();

				// pulizia del contenuto
				//
				// se ho del semplice testo lo inserisco senza elaborazioni,
				// altrimenti esegue una pulizia del codice

			var pbel = pb.find('div').get(0), h;

			if (fjs.HTMLUtils.isSimpleTextNode(pbel)) {

				h = fjs.HTMLUtils.getTextFromSimpleTextNode(pbel);
				if (h !== '')
					me.sel.insertNode(document.createTextNode(h));

			} else {

				FlexJS.AreaLite.CleanMozDOM(pbel);
				h = fjs.HTMLUtils.GetCleanHTML(pbel);

				if (h !== '') {

					me.sel.insertNode($('<div class=\'fx-placeholder\'>' + h + '</div>').get(0));
					me.$body.find('.fx-placeholder').contents().unwrap();
				}
			}

				// ripristina l'insertion point

			me.sel.collapse(false);

			var sel = me.if.contentWindow.getSelection();
			sel.removeAllRanges();
			sel.addRange(me.sel);

//            me.sel.insertNode(pb.find('div').get(0));

			me.removePasteBin(); // necessario per dare il focus al div col contenuto
			me.$body.get(0).focus();

			setTimeout($.proxy(me.adjustHeight, me), 10);

// return;

//var range = me.sel.getRangeAt(0);
// range.deleteContents();
// range.insertNode( me.cd.createTextNode('piro') );

//			setTimeout(function() {

//try {

//			me.cd.execCommand('inserthtml', false, t);
//} catch(e) { console.log('error', e);}

		}, 10);
	});

	pb.appendTo(this.$body);

	return pb;
};

FlexJS.AreaLite.prototype.removePasteBin = function() {

	if (this.$pb !== null) {

		this.$pb.remove();

		this.$pb = null;
	}
};

	// CleanMozHTML modifica il DOM in modo da eliminare
	// alcuni elementi

FlexJS.AreaLite.CleanMozDOM = function (el) {

		// se è un <p> o <div> al termine del quale ci sono <br> vuoti, li elimina

	if (el.nodeType === 1 && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div' || el.tagName.toLowerCase() === 'span') && el.childNodes.length > 1) {

		if (el.lastChild !== null && el.lastChild.nodeName.toLowerCase() === 'br')
			el.removeChild(el.lastChild);
	}

	for (var i = 0, m = el.childNodes.length; i < m; i++)
		FlexJS.AreaLite.CleanMozDOM(el.childNodes.item(i));
};
// FlexJS.AreaLite.prototype.onMouseDown = function(e) {

//	e.stopPropagation();

//	return false;
// };
