
	// definizione del NS FlexJS

window.FlexJS = window.FlexJS || {};

	// inclusioni richieste
/*
$().ready(function () {

//	FlexJS.Loader.LoadJS('js/jq/jDimensions.js');
});
*/
	// widget hide/show

FlexJS.HideShow = function(cnt, hdlo, hdlc) {

	this.mContent = $('#' + cnt)[0];
	this.mHandleOpen = $('#' + hdlo)[0];
	this.mHandleClose = $('#' + hdlc)[0];

	var me = this;

	$(this.mHandleOpen).click(function() { me.Open(); });
	$(this.mHandleClose).click(function() { me.Close(); });

	this.Close();
};

FlexJS.HideShow.prototype.Open = function() {

	$(this.mContent).show();

	$(this.mHandleOpen).hide();
	$(this.mHandleClose).show();
};

FlexJS.HideShow.prototype.Close = function() {

	$(this.mContent).hide();

	$(this.mHandleOpen).show();
	$(this.mHandleClose).hide();
};

	//
	// stylesheet handling
	//

FlexJS.CSSUtils = window.FlexJS.CSSUtils || {};

FlexJS.CSSUtils.GetCSS = function(document, name) {

	var ss = null;
	for (var i = 0; i < document.styleSheets.length; i++) {

			// nel caso di stili inline, .href non è definito

		if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf(name) !== -1) {

			ss = document.styleSheets[i];
			break;
		}
	}

	return ss;
};

FlexJS.CSSUtils.AddCSS = function(document, title) {

	var node = document.createElement('style');

	node.type = 'text/css';
	node.rel = 'stylesheet';
	node.media = 'screen';
	node.title = title;

		// inserisce l'elemento nella sezione 'head'
		// creandola se necessario

	var head = document.getElementsByTagName('head');
	if (head.length === 0) {

		head = document.createElement('head');
		document.getElementsByTagName('body')[0].parentNode.appendChild(head);

	} else
		head = head[0];

	head.appendChild(node);

	return node;
};

FlexJS.CSSUtils.GetCSSRule = function(document, ss, ruleName) {

	ruleName = ruleName.toLowerCase();

	var
		j = 0,
		cssRule = false
	;

	do {

		cssRule = ss.cssRules[j];

		if (cssRule && cssRule.selectorText.toLowerCase() === ruleName)
			return cssRule;

		j++;

	} while (cssRule);

	return false;
};

FlexJS.CSSUtils.AddCSSRule = function(document, ss, rule) {

	document.styleSheets[0].insertRule(rule.cssText, 0);
};

FlexJS.CSSUtils.ClassNames = function(el) {

	return el.className.split(' ');
};

FlexJS.CSSUtils.HasClassName = function(el, sClassName) {

	var p = FlexJS.CSSUtils.ClassNames(el);

	for (var i = 0, l = p.length; i < l; i++)
		if (p[i] === sClassName)
			return true;

	return false;
};

	//
	// pulizia di codice HTML
	//

FlexJS.HTMLUtils = window.FlexJS.HTMLUtils || {};

	// 'font' viene messo in fase di editing e trasformato in 'span'
	// 'b' ed 'i' vengono trasformati rispettivamente in 'strong' ed 'em'

FlexJS.HTMLUtils.sAllowedTags = ['br', 'b', 'strong', 'em', 'i', 'font', 'span', 'a', 'p', 'div'];
FlexJS.HTMLUtils.sIgnoreContentTags = ['style', 'script', 'noscript'];

//fjs.HTMLUtils.sIsHTML = /<[a-z]+/i; // fjs.HTMLUtils.sIsHTML.test(text);

	// verifica se il contenuto di un elemento è un solo nodo
	// di testo (per il paste di semplice testo non stilizzato)

fjs.HTMLUtils.isSimpleTextNode = function(el) {

	return el.childNodes.length === 1 && el.childNodes[0].nodeType === 3;
};

fjs.HTMLUtils.getTextFromSimpleTextNode = function(el) {

	return fjs.HTMLUtils.isSimpleTextNode(el) ? el.childNodes[0].nodeValue : null;
};

fjs.HTMLUtils.GetCleanHTML = function(el, l) {

	l = l || 0;

	if (el.nodeType === 3)
		return el.nodeValue;
	else if (el.nodeType === 1) {

		var tag = el.tagName.toLowerCase();

		if (fjs.Utils.InArray(tag, fjs.HTMLUtils.sIgnoreContentTags))
			return '';

		var cnt = '';
		for (var i = 0, m = el.childNodes.length; i < m; i++)
			cnt += fjs.HTMLUtils.GetCleanHTML(el.childNodes[i], l + 1);

		cnt = cnt.trim();

		var out = '';
		if (fjs.Utils.InArray(tag, fjs.HTMLUtils.sAllowedTags)) {

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
				if (tag === 'a') {

					var h = el.getAttribute('href');
					if (h) {

							// corregge alcuni link

						h = h
							.replace(/.*\[\[(.*?)\]\]$/g, '[[$1]]')
							.replace(/.*%5B%5B(.*?)%5D%5D$/g, '[[$1]]')
							.replace(/.*%5B%5B(.*?)\]\]\]\]$/g, '[[$1]]')
						;

						if (h.substring(0, 2) === '[[' || h.substring(0, 4) === 'http' || h.substring(0, 6) === 'mailto')
							href = ' href=\'' + h + '\'';
					}
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
				out = /*FlexJS.HTMLUtils.sIgnoreBRs ? ' ' :*/ '<br />';
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

	// quoting di un valore XML
	// usa virgolette semplici o doppie se all'interno del
	// valore non ne compaiono, altrimenti procede all'escapeing
	// del contenuto

FlexJS.Utils.QuoteXMLAttr = function (v) {

		// ottiene una rappresentazione stringa
		// del valore dell'oggetto

	v = '' + v;

	var apos_pos = v.indexOf("'");
	if (apos_pos === -1)
		return "'" + v + "'";

	var quot_pos = v.indexOf('"');
	if (quot_pos === -1)
		return '"' + v + '"';

	var re = new RegExp("'", 'g');

	return "'" + v.replace(re, '&apos;') + "'";
};

	//
	//
	//

FlexJS.Loader = window.FlexJS.Loader || {};

FlexJS.Loader.LoadImage = function (path) {

	if (FlexJS.Loader.sImageCache[path])
		return FlexJS.Loader.sImageCache[path].src;

	var img = FlexJS.Loader.sImageCache[path] = document.createElement('img');

	img.src = FlexJS.AppConfigure.Get('kBaseURL') + path;

	document.getElementsByTagName('head')[0].appendChild(img);

	return img.src;
};
