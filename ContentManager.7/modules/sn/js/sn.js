
/*

	Funzionalità JS per sn

*/

$().ready(function() {

	sn.HouseKeeping();

		// facendo click su elementi di questa classe
		// viene visualizzato l'elemento il cui id
		// è specificato nell'anchor
		// inoltre inserisce nel campo specificato come terzo parametro
		// quello selezionato

	var sel = null;
	$('a.cmdShowFromAnchor').click(function() {

		var href = this.href;
		var e = href.match(/#(.*)\-(.*)\-(.*)$/);
		if (e) {

			if (sel)
				$('#' + sel).slideUp('slow', function() {

					$('#' + e[2]).slideDown('slow');
				});
			else
				$('#' + e[2]).slideDown('slow');

			sel = e[2];
			if (e[3])
				$('#' + e[3]).val(sel);
		}

		return false;
	});

		// sul click mostra l'elemento indicato nell'href

	sn.RegisterDOMHandler('a.cmdShowIdInHref', 'click', function(el) {

		var href = el.href;
		var e = href.match(/#(.*)$/);
		if (e) {

			$('#' + e[1])
				.slideDown('fast', function() {

						// una volta mostrato da il focus alla TA

					$('textarea', el)
					.focus();
				})
			;
		}

		return false;
	});

		// debug

	$('.snDebugViewName')
		.css({
			position: 'absolute',
			padding: '4px 4px 4px 20px',
			font: '10px "lucida grande", sans-serif',
			border: '1px solid #EC465D',
			color: 'black',
			backgroundColor: '#E4F036',
			zIndex: 3000
		})
		.show()
		.click(function() { $(this).hide(100); })

		.next()
			.css({
				border: '1px solid green'
			})
	;
});

sn = window.sn || {};

	// costante: URL del front controller

sn.kFC = FlexJS.AppConfigure.Get('kBaseURL') + 'modules/sn/fc.php/';

	// costante per il detect di ie6

sn.isIE6 = window.XMLHttpRequest === undefined && ActiveXObject !== undefined;

	// shorthand

sn.proxy = FlexJS.proxy;

	// questa funzione viene chiamata ogni volta che ci sono delle
	// modifiche al DOM da parte di qualche ricaricamento di oggetti
	//
	// TBD: vedi sn.RegisterDOMHandler

	// TBD: deve farlo solo per gli elementi per cui non sia già
	// stato definito un handler!

sn.HouseKeeping = function() {

	$('.cmdShowNext').click(function() {

		var me = this;

			// trova l'elemento che segue

		$('.snHidden', this.parentElement).slideDown('slow', function() {

			// $(me).hide();
		});
	});

	$('.stopcd, #statustext').click(function() {

//		sn.ReloadCountdown.StopAll();

		return false;
	});
};

	// registra coppie di selettori/funzioni che devono essere
	// eseguite sia al caricamento della pagina sia all'inserimento
	// di nuovi elementi del DOM

sn.RegisterDOMHandler = function(el, ev, cb) {

	if (! cb) {

		cb = ev;
		ev = '*';
	}

		// se non specifico ev, la funzione viene eseguita subito
		// altrimenti viene aggiunta al gestore di eventi

	sn.RegisterDOMHandler.sElements[el] = [ev, cb];

	if (ev == '*')
		$(el).each(function() { cb(this); });
	else
		$(el).bind(ev, function() { return cb(this); });
};

sn.RegisterDOMHandler.sElements = {};

sn.ApplyDOMHandler = function(el) {

	for (var i in sn.RegisterDOMHandler.sElements) {

		var
			ev = sn.RegisterDOMHandler.sElements[i][0],
			cb = sn.RegisterDOMHandler.sElements[i][1]
		;
//console.log(i, ev, cb, el);
		if (ev == '*')
			$(i, el).each(function() { cb(this); });
		else
			(function(cb) { $(i, el).bind(ev, function() { console.log('click'); return cb(this); }); })(cb);
	}
};

	//
	// Utils
	//

sn.utils = sn.utils || {};
sn.Utils = sn.utils;			// deprecated

	// estrae gli attributi meta dalla classe dell'oggetto
	// se è specificato un nome, restituisce solo quel valore
	//
	// la struttura del nome della classe è:
	//      snMeta-<name>-<value>

sn.utils.MetaFromEl = function(el, n) {

	var c = $(el).attr('class').split(' ');

	var mt = {}, e;
	for (var i = 0, m = c.length; i < m; i++) {

		if ((e = c[i].match(/^snMeta\-(.*)\-(.*)$/)))
			mt[ e[1] ] = e[2].replace(/_/g, '/');
	}

	return n ? mt[n] : mt;
};

sn.utils.getElByRole = function(r, s) {

	return $('.snMeta-role-' + r, s);
};

	// estrae tutti gli elementi del tipo specificato
	// appartenenti al gruppo dell'elemento
	// aggiungendo anche l'elemento specificato con chiave 'el'

sn.utils.GroupFromElement = function(el, r) {

	var g = sn.utils.MetaFromEl(el, 'group');

	var res = {el: el};
	for (var i = 0, m = r.length; i < m; i++)
		res[ r[i] ] = $('.snMeta-group-' + g + '.snMeta-role-' + r[i]).get(0);

	return res;
};

	// dato un link, qualora sia un hash link
	// lo completa con l'URL corrente

sn.utils.fixRelativeLink = function(lk) {

	if (lk.substr(0, 1) == '#')
		lk = window.location.toString() + lk.substr(1);

	return lk;
};

	// sn.utils.AjaxRequest('test/layout', function(data) { ... });

sn.utils.AjaxRequest = function(v, pars, cb) {

	if (! cb) {

		cb = pars;
		pars = {};
	}

	var
		url = sn.kFC + 'ajax/' + v,
		i = new Date()
	;

	// var p = {
	// 	ajax: true,
	// 	u: i.valueOf()
	// };

	var p = $.extend(pars, {
		ajax: true,
		u: i.valueOf()
	});

	jQuery.get(url, p, function(data, textStatus) {

		if (textStatus == 'success') {

			if (data.__error || data.__dbg)
				sn.utils.AjaxRequest.errorbox(
					data.__error || '',
					data.__dbg || '',
					i
				);
			else
				cb(data);
		}

	}, 'json');
};

	// un semplice gestore per la visualizzazione di un messaggio
	// di errore nel caso in cui la chiamata ajax fallisca lato server

sn.utils.AjaxRequest.error = null;
sn.utils.AjaxRequest.errorbox = function(m, d, i) {

	if (sn.utils.AjaxRequest.error)
		sn.utils.AjaxRequest.error.remove();

	var
		wnd = $(window),

		t = m ? 'Error (ajax call)' : 'Debug (ajax call)',
		c = m ? 'red' : 'green',
		h = $('<div><div class="i"><em>issued on ' + i.toTimeString() + '</em></div><div class="title">' + t + '</div><div class="content"/></div>')
			.appendTo(document.body)
			.css({
				position: 'fixed',
				zIndex: 10001,

				width: 600,
				border: '1px solid black',

				'font-family': 'tahoma, verdana, arial, sans-serif',

				cursor: 'pointer'
			})
	;

	h.css({
			top: /* doc.scrollTop() + */ (wnd.height() - h.height()) / 5,
			left: (wnd.width() - h.width()) / 2
		})
	;

	$('div.i', h)
		.css({
			color: 'white',
			background: c,

			'float': 'right',

//			'font-weight': 'bold',
			'font-size': '0.8em',

			padding: '6px 20px',
			'margin-top': '4px'
		})
	;

	$('div.title', h)
		.css({
			color: 'white',
			background: c,

			'font-weight': 'bold',
			'font-size': '1.1em',

			padding: '6px 20px'
		})
		.click(function() { h.fadeOut('fast'); })
	;

	$('div.content', h)
		.css({
			'font-size': '0.9em',
			padding: '5px 20px',
			'background-color': 'white'
		})
		.html(m + d)
	;

	sn.utils.AjaxRequest.error = h;
};

	// funzione chiamata quando si ricevono via Ajax, in formato
	// JSON un insieme di Assets
	//
	// el è l'elemento che riceve il contenuto (se specificato)

sn.utils.addAssets = function(data, el) {

		// inserisce, se presente, il contenuto HTML

	if (data.content && el)
		$(el).html(data.content);

		// inserimento degli assets

	for (var i in data.assets) {

		if (data.assets[i][0] === 'inc') {

			var e = $(data.assets[i][1]);

			e.appendTo(document.body);
		}
	}

	// TBD: eseguire solo al caricamento
	setTimeout(function() {

		for (var i in data.assets) {

			if (data.assets[i][0] === 'exec') {

				eval(data.assets[i][1]);
			}
		}
	}, 200);
};

	// esegue, per ogni elemento, la funzione e poi
	// la lega all'evento indicato
	//
	// eg: checkbox il cui stato modifica quello di altri
	// elementi, ma deve essere impostato all'avvio
	//
	//     new sn.utils.execAndBind('.snCheckDT', 'click', function() {
	//
	//         <azione da compiere al click>
	//     });

sn.utils.execAndBind = function(el, ev, fn) {

	$(el)
		.each(fn)
		.bind(ev, fn)
	;
};
