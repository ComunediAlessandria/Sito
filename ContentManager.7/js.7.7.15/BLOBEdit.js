/*
		//
		// Funzioni per l'inizializzazione e la terminazione dell'editing
		//

	function TerminateEditing() {

		$('div.editPar').each(function() {

			$('#TA_' + this.id).val( $(this).html() );
		});
	}

	function BeginEditing() {

			// aggancia il gestore del submit al FORM

		$('form').submit(function() {

			TerminateEditing();
		});

			// per le aree di editing, aggiunge il gestore eventi

		$('div.editPar').each(function() {

			this.contentEditable = true;
//			this.onbeforepaste = fnCancelEvent;
			this.onpaste = fnPaste;
			this.ondragenter = fnCancelEvent;

				// tiene traccia nell'apposito campo dell'ultima
				// textarea in cui è stato inserito del testo

			var me = this;
			this.onfocus = function() { $('#PasteBinLocation').val(me.id); };
		});

		FlexJS.Loader.LoadJS(
			'js/jq/FlexJS.PageSelector.js',
			function() {

				$('.addPageBtn').each(function() {

					$(this).click(function(e) {

						e.preventDefault();

						FlexJS.PageSelector.Show({
							set: SetValueTA,
							get: GetValueTA
						});
					});
				});
			}
		);
	}

*/


		//
		// helper per la lettura e l'impostazione di link nelle TA
		//

	window.getTASelection = function() {

		var sel = false;
		if (document.selection && document.selection.createRange) {

			sel = document.selection.createRange().parentElement();

		} else {

			var el = document.getSelection();
			if (el.focusNode)
				sel = el.focusNode.parentNode;
		}

		return sel;
	};

	window.SetValueTA = function(v) {

		//var sel = document.selection.createRange().parentElement();
		var sel = getTASelection();
		if (sel && sel.tagName == 'A') {

				// forza il testo del link a quello che c'era prima
				// perché nel caso di link creati automaticamente dal
				// componente di editing, explorer modifica anche il testo
				// del link stesso

			var text = sel.innerHTML;
			document.execCommand('CreateLink', false, '[[' + v.id + ']]');
			sel.innerHTML = text;

		} else
			document.execCommand('CreateLink', false, '[[' + v.id + ']]');
	};

	window.GetValueTA = function() {

		var value = '', sel = getTASelection();

		if (sel && sel.tagName == 'A') {

				// se sono link interni hanno le quadre, altrimenti no

			var re = new RegExp("\\[\\[([^\\]]+)\\]\\]");
			var match = re.exec(sel.href);

			value = match !== null
				? match[1]
				: sel.href
			;
		}

		return value;
	};

		//
		// fuzioni per l'editing
		//

	function setStyle(obj, s) {

		document.execCommand('fontname', '', s);
		for(var i = 0; i < obj.all.length; i++) {

			var obEl = obj.all[i];

			if (obEl.tagName == 'FONT' && obEl.face == s) {

				obEl.className = obEl.face;
				obEl.removeAttribute('face', 0);
			}
		}
	}

		//
		// funzioni per correggere il problema del paste di dati HTML
		//

	function fnCancelEvent() { event.returnValue = false; }

	function fnPaste() {

			// salva la posizione del contenuto poiché
			// l'helper per il paste sposta il focus

		var st = $(window).scrollTop();

		event.returnValue = false;

		var range, o = document.selection && document.selection.createRange;

			// salva il contenuto della selezione

		// /*jslint laxbreak: true */
		// var sel = o
		//		? document.selection.createRange()
		//		: window.getSelection()
		// ;

		if (o) {

			range = document.selection.createRange();

		} else {

			range = window.getSelection().getRangeAt(0);
		}

			// ottiene il testo HTML che viene incollato

		var
			ph = new FlexJS.PasterHelper(),
			n = ph.getContentNode()
		;

			// test per capire se si tratta di un testo
			// generato da Word
			// in questo caso riempie l'area di testo ed
			// invia il form

		if ($('#edit-enablewordpaste').prop('checked')) {

			var h = $(n).html();

			if (h.search(/<(table|h[1-5])/i) !== -1) {

				$('#PasteBinDIV').html(h);
	//			$('#PasteBinLocation').val(1);

				doWordPaste();

				return;
			}
		}

			// lo inserisce nella selezione salvata in precedenza

			// TBD. pulizia HTML

/*
			// https://code.google.com/p/jquery-clean/

		fjs.Loader.LoadJS('modules/lib/jQuery.htmlClean_1.4.0/jquery.htmlClean.min.js', function() {

			var h = $.htmlClean($(n).html(), {
				allowedTags: ['br', 'b', 'strong', 'em', 'i', 'font', 'span', 'a', 'p', 'div'],
				replace: [
					['b', 'strong'],
					['i', 'em'],
					['font', 'span'],
					['div', 'p'],
				],
				format: false
			});

			range.pasteHTML(h);
		});
*/

		//var ch = $(n).html();

		var ch = cleanHTMLFromPasteArea(n);

		if (o) {

			range.pasteHTML(ch);

		} else {

			range.deleteContents();

			// var el = document.createElement('div');
			// el.innerHTML = html;
			// var frag = document.createDocumentFragment(), node, lastNode;
			// while ( (node = el.firstChild) ) {
			// lastNode = frag.appendChild(node);
			// }
			// range.insertNode(frag);

			// // Preserve the selection
			// if (lastNode) {
			// range = range.cloneRange();
			// range.setStartAfter(lastNode);
			// range.collapse(true);
			// sel.removeAllRanges();
			// sel.addRange(range);
			// }

			var frag = range.createContextualFragment(ch);
//			var frag = range.createContextualFragment('a b c');
			range.insertNode(frag);
		}

			// ripristina il posizionamento poiché è stato
			// passato il focus all'elemento per il paste

		setTimeout(function() {

			$(window).scrollTop(st);

		}, 1);

//		document.selection.createRange().pasteHTML(text);

/*
		var text = window.clipboardData.getData('Text');
console.log(text, window.clipboardData.getData('URL'));
		text = text.replace(/\n/g, '<br />');

		document.selection.createRange().pasteHTML(text);
*/
	}

	function doWordPaste() {

		setTimeout(function() {

			var elSrc = document.getElementById('PasteBinDIV');
			var elDst = document.getElementById('PasteBinTA');

			elDst.value = elSrc.innerHTML;

			//TerminateEditing();

			var formBLOB = document.getElementById('formBLOB');
			formBLOB.submit();

		}, 1);
	}

window.FlexJS = window.FlexJS || {};

FlexJS.PasterHelper = function () {

};

FlexJS.PasterHelper.sTarget = null;

FlexJS.PasterHelper.prototype.getContentNode = function() {

	var t = this.getTarget();

	t.focus();

	var r = document.body.createTextRange();
	r.moveToElementText(t);
	r.execCommand('Paste');

	return t;
};

FlexJS.PasterHelper.prototype.getTarget = function() {

	if (FlexJS.PasterHelper.sTarget === null) {

		FlexJS.PasterHelper.sTarget = $('<div />')
			.css({
				position: 'absolute',
				// top: -10000,
				// left: -10000
				width: 1,
				height: 1,

				overflow: 'hidden'
			})
			.attr('contentEditable', true)
			.appendTo(document.body)
		;
	}

		// si assicura che sia vuoto

	this.clean();

	return FlexJS.PasterHelper.sTarget.get(0);
};

FlexJS.PasterHelper.prototype.clean = function() {

	FlexJS.PasterHelper.sTarget
		.html('')
	;
};

	// versione locale per il paste da word

var sAllowedTags = ['br', 'b', 'strong', 'em', 'i', 'font', 'span', 'a', 'p', 'div'];
var sIgnoreContentTags = ['style', 'script', 'noscript'];
var sIgnoreBRs = true;

var cleanHTMLFromPasteArea = function(el, l) {

	l = l || 0;

	if (el.nodeType === 3)
		return el.nodeValue;
	else if (el.nodeType === 1) {

		var tag = el.tagName.toLowerCase();

		if (fjs.Utils.InArray(tag, sIgnoreContentTags))
			return '';

		var cnt = '';
		for (var i = 0, m = el.childNodes.length; i < m; i++)
			cnt += cleanHTMLFromPasteArea(el.childNodes[i], l + 1);

		cnt = cnt.trim();

		var out = '';
		if (fjs.Utils.InArray(tag, sAllowedTags)) {

				// risolve alcuni problemi in alcune versioni di FF che
				// effettuano l'editing non inserendo i tag corretti
				// ma stilizzando il testo attraverso span

			if (el.style.cssText === 'font-weight: bold;')
				tag = 'strong';
			else if (el.style.cssText === 'font-style: italic;')
				tag = 'em';

				// converte alcuni tag

			switch (tag) {

				case 'b':		tag = 'strong'; break;
				case 'i':		tag = 'em'; break;
				case 'font':	tag = 'span'; break;
				case 'div':		tag = 'p'; break;
			}

				// se il tag ha contenuto lo emetto,
				// se invece non ne ha mi limito al singolo tag
				// a meno che non sia un <p> che Word inserisce senza motivo

			if (cnt !== '') {

					// classe solo per gli 'span' e solo per 'userFormat3'

				var cl = '';
				if (tag === 'span' && el.className === 'userFormat3')
					cl = " class='" + el.className + "'";

				var href = '';
				if (tag === 'a' && el.href && el.href !== '') {

						// compatibilità IE6/7:
						// se viene aggiunta una componente esterna al link flex
						// la elimina

					var h = el.href
						.replace(/.*\[\[(.*?)\]\]$/g, '[[$1]]')
						.replace(/.*%5B%5B(.*?)%5D%5D$/g, '[[$1]]')
					;

					if (h.substring(0, 2) === '[[' || h.substring(0, 4) === 'http' || h.substring(0, 6) === 'mailto')
						href = ' href=\'' + h + '\'';
				}

					// nel caso di 'span' senza classe, lo elimina
					// mentre nel caso di <p> aggiungo un'interruzione di riga

				if (tag === 'span' && cl === '')
					out = ' ' + cnt;
				else if (tag === 'p')
					out = cnt + (l === 0 ? '' : '<br />');
				else
					out = '<' + tag + cl + href + '>' + cnt + '</' + tag + '>';

			} else if (tag === 'p')
				out = '';
			else if (tag === 'br')
				out = sIgnoreBRs ? ' ' : '<br />';
//			else
//				console.log('Empty tag', tag, 'skipped');
//				out = '<' + tag + ' />';

		} else
			out = cnt; // !== '' ? (cnt + ' ') : '';
// if (out.indexOf('<img') !== -1)
//	console.log(out);

		return out;
	}

	return '';
};