
	// console wrapper for older browser

if (!window.console) window.console = { log: function() {} };

	//
	// definizione del NS FlexJS
	//

window.FlexJS = window.FlexJS || {};

	// alias

window.fjs = FlexJS;

	// browser test (jq ha deprecato $.browser che non esiste più dalla 1.9)

(function(jQuery) {

	var matched, browser;

	const uaMatch = function(ua) {

		ua = ua.toLowerCase();

		var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
			/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
			[];

		return {
			browser: match[ 1 ] || "",
			version: match[ 2 ] || "0"
		};
	};

	matched = uaMatch(navigator.userAgent);
	browser = {};

	if ( matched.browser ) {

		browser[ matched.browser ] = true;
		browser.version = matched.version;
	}

		// Chrome is Webkit, but Webkit is also Safari.

	if ( browser.chrome ) {

		browser.webkit = true;

	} else if ( browser.webkit )
		browser.safari = true;

	jQuery.browser = browser;

})(jQuery);

fjs.isIE = jQuery.browser.msie;
fjs.isGecko = jQuery.browser.mozilla;

	//
	// accesso alle variabili di configurazione di flex
	//

fjs.AppConfigure = window.FlexJS.AppConfigure || {};

fjs.AppConfigure.Get = function (pName) {

	return gAppConfigure[pName];
};

	// proxy per closure

fjs.proxy = function(fn, proxy) { return function() { return fn.apply(proxy, arguments); }; };
fjs.falsy = function() { return false; };

	// ctx è tipicamente un oggetto, mtdh un suo metodo

fjs.bind = function(ctx, mtdh) { return function() { return ctx[mtdh].apply(ctx, arguments); }; };

	//
	// loader dinamico
	//

/*

	FlexJS.Loader.LoadJS('path/to/file.js', function () { use JS });

*/

FlexJS.Loader = window.FlexJS.Loader || {};

FlexJS.Loader.sCache = [];
FlexJS.Loader.sImageCache = [];

	// carica un JS esterno

FlexJS.Loader.LoadJS = function(path, cb, useUniqueID) {

	path = path instanceof Array ? path : [path];
	useUniqueID = useUniqueID || false;

		// se ho già caricato l'include mi limito ad eseguire la CB

	/*jslint loopfunc: true */
	for (var i = 0, m = path.length; i < m; i++) {

		var fName = path[i];

		if (FlexJS.Loader.sCache[ fName ]) {

				// se siamo all'ultimo elemento

			if (i == m - 1) {

				if (cb) cb();

				return;
			}
		}

		var script = document.createElement('script');

			// aggiunge al nome del file un identificativo numerico univoco
			// per forzare il caricamento (no cache) per il debug

		script.type = 'text/javascript';
		script.src = FlexJS.AppConfigure.Get('kBaseURL') + fName + (useUniqueID ? ('?v=' + FlexJS.Utils.Random(1, 9999)) : '');

			// metto la callback solamente sull'ultimo elemento

		var f;
		if (i === m - 1) {

			f = function() {

				FlexJS.Loader.sCache[ fName ] = true;
				if (cb) cb();
			};

		} else {

			f = function() {

				FlexJS.Loader.sCache[ fName ] = true;
			};
		}

		if (FlexJS.isIE)
			script.onreadystatechange = function () {
				if (! script.p && (script.readyState === 'loaded' || script.readyState === 'complete')) {
					f();
					script.p = true;
				}
			};
		else
			$(script).on('load', f /* cb */ );

		document.getElementsByTagName('head')[0].appendChild(script);
	}
};

FlexJS.Loader.LoadCSS = function (path) {

	if (FlexJS.Loader.sCache[path])
		return;

	var css = document.createElement('link');

	css.type = 'text/css';
	css.rel = 'stylesheet';
	css.href = FlexJS.AppConfigure.Get('kBaseURL') + path; //'js/jq/jDialog/jDialog.css';
	css.media = 'screen';

	document.getElementsByTagName('head')[0].appendChild(css);

	FlexJS.Loader.sCache[ path ] = true;
};

	//
	// Funzionalità ajax
	//

fjs.Ajax = window.FlexJS.Ajax || {};
fjs.ajax = fjs.Ajax;

	// installa un gestore globale per gli errori ajax

fjs.ajax.sUnloading = false;
$(window).bind('beforeunload', function() { fjs.ajax.sUnloading = true; });

$(document).ajaxError(function(e, xhr, settings, exception) {

	fjs.ajax.errorCB(e, xhr, settings, exception);
});

	// default implementation

fjs.ajax.errorCB = function(e, xhr, settings, exception) {

	if (! fjs.ajax.sUnloading && xhr.statusText !== 'abort' && fjs.AppConfigure.Get('isDevel')) {

		fjs.ajax.msgbox(
			fjs.ajax.msgbox.serverError,
			'Status: [' + xhr.status + '] Exception: [' + exception + ']<hr />' + xhr.responseText
		);
	}
};

fjs.ajax.setErrorCallback = function(f) { fjs.ajax.errorCB = f; };

fjs.ajax.urlFromPath = function(path) { return fjs.AppConfigure.Get('kBaseURL') + 'modules/ajax/ajax.php/' + ($.isArray(path) ? path.join('/') : path) };

	// effettua una chiamata all'ajax server con il path specificato
	// path può essere una stringa o un array:
	//
	//     .get('tree/load', ...)
	//     .get(['tree', 'load'], ...)
	//
	// la callback, se presente, deve accettare un parametro: il risultato

fjs.ajax.get = function(path, cb) {

	// var url = fjs.AppConfigure.Get('kBaseURL') + 'modules/ajax/ajax.php/' + ($.isArray(path) ? path.join('/') : path);
	$.get(fjs.ajax.urlFromPath(path), {
		u: new Date().valueOf()
	}, function(data) {

		if (data && data.__flexjs__) {

			if (data.__flexjs__.dbg && fjs.AppConfigure.Get('isDevel'))
				fjs.ajax.msgbox(fjs.ajax.msgbox.debug, data.__flexjs__.dbg);

			if (data.__flexjs__.assets) {

				// TBD: temporaneo
				$.each(data.__flexjs__.assets, function(k, v) {

					for (var i = 0; i < v.length; i++) {

						switch (k) {

							case '__pgassetcssfromurl':
									$('head').append('<link rel="stylesheet" href="' + v + '" type="text/css" />');
								break;

							default: alert('Unrecognized [' + k + '] in ajax __assets for value ' + v); //NOSONAR
						}
					}
				});
			}
		}

			// se si è verificato un errore nel processing
			// della richiesta ajax lato server
			// sono valorizzati:
			// - .error
			// - .errormsg

		if (data.error && fjs.AppConfigure.Get('isDevel')) {

			fjs.ajax.msgbox(fjs.ajax.msgbox.error, data.errormsg);

		} else if (cb)
			cb(data);

	}, 'json');
};

fjs.ajax.post = function(path, p, cb) {

	p = p || {};
	p.u = new Date().valueOf();

	// var url = fjs.AppConfigure.Get('kBaseURL') + 'modules/ajax/ajax.php/' + ($.isArray(path) ? path.join('/') : path);

	return $.post(fjs.ajax.urlFromPath(path), p, function(data) {

		if (data.__flexjs__) {

			if (data.__flexjs__.dbg && fjs.AppConfigure.Get('isDevel'))
				fjs.ajax.msgbox(fjs.ajax.msgbox.debug, data.__flexjs__.dbg);
		}

			// se si è verificato un errore nel processing
			// della richiesta ajax lato server
			// sono valorizzati:
			// - .error
			// - .errormsg

		if (data.error && fjs.AppConfigure.Get('isDevel')) {

			fjs.ajax.msgbox(fjs.ajax.msgbox.error, data.errormsg);

		} else if (cb)
			cb(data);

	}, 'json');
};

	// un semplice gestore per la visualizzazione di un messaggio
	// di errore nel caso in cui la chiamata ajax fallisca lato server
	// oppure di messaggi di debug

fjs.ajax.msgbox = function(k, m) {

	var
		wnd = $(window),

		date = new Date(),

		ss = date.getSeconds(),
		mm = date.getMinutes(),

		t = [
			'Debug',
			'Error in ajax call',
			'Server Error in ajax call'
		][ k ],

		h = $('<div><div class="title">[' + fjs.ajax.msgbox.instance + ' - ' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss + '] ' + t + '<div class="dbg-close" style="float: right">X</div></div><div class="content"/></div>')
			.appendTo(document.body)
			.css({
				position: 'absolute',
				zIndex: 1001,

				width: 600,
				height: 400,
				overflowY: 'scroll',

				border: '1px solid ' + (FlexJS.Ajax.msgbox.debug ? 'red' : '#0095CD'),
				backgroundColor: 'white',

				fontFamily: 'tahoma, verdana, arial, sans-serif',

				cursor: 'pointer'
			})
	;

	h.css({
			top: /* doc.scrollTop() + */ (wnd.height() - h.height()) / 5 + fjs.ajax.msgbox.instance * 10,
			left: (wnd.width() - h.width()) / 2 + fjs.ajax.msgbox.instance * 10
		})
		.addClass('dbg-drag-container')
	;

	fjs.ajax.msgbox.instance++;

	$('div.title', h)
		.css({
			color: 'white',
			background: FlexJS.Ajax.msgbox.debug ? 'red' : '#0095CD',

			fontWeight: 'bold',
			fontSize: '1.1em',

			padding: '6px 20px'
		})
	;

	$('div.dbg-close', h).click(function() { h.fadeOut(); });

	$('div.content', h)
		.css({
			fontSize: '0.9em',
			padding: '5px 20px',
			backgroundColor: 'white'
		})
		.html(m)
	;

		// init only when needed

	if (fjs.Ajax.msgbox.dragging === 1337) {

		$(document.body).on('mousedown', '.dbg-drag-container', function (e) {

			var parentOffset = $(this).offset();
			//or $(this).offset(); if you really just want the current element's offset

			fjs.Ajax.msgbox.dragging = {
				ox: e.pageX - parentOffset.left,
				oy: e.pageY - parentOffset.top,
				e: $(this),
			};
		});

		$(document.body).on('mouseup', function (e) {

			fjs.Ajax.msgbox.dragging = false;
		});

		$(document.body).on('mousemove', function(e) {

			if (fjs.Ajax.msgbox.dragging !== false)

				fjs.Ajax.msgbox.dragging.e.offset({
					top: e.pageY - fjs.Ajax.msgbox.dragging.oy,
					left: e.pageX - fjs.Ajax.msgbox.dragging.ox
				});
		});

		fjs.Ajax.msgbox.dragging = false;
	}
//	h.click(function() { $(this).fadeOut(); });
};

fjs.ajax.msgbox.instance = 0;
fjs.Ajax.msgbox.dragging = 1337;
fjs.Ajax.msgbox.debug = 0;
fjs.Ajax.msgbox.error = 1;
fjs.Ajax.msgbox.serverError = 2;

	//
	// utility generiche
	//

FlexJS.Utils = window.FlexJS.Utils || {};

FlexJS.Utils.InArray = function(needle, haystack) {

	for (var i = 0, m = haystack.length; i < m; i++) {

		if (haystack[i] === needle)
			return true;
	}

	return false;
};

FlexJS.Utils.Random = function(min, max) {

	if (! min) min = 0;
	if (! max) max = 1e10;

	return Math.round(max * Math.random() + min);
};

	// conversione da e verso JSON

FlexJS.Utils.toJSON = function(o) {

	if (typeof(JSON) == 'object' && JSON.stringify)
		return JSON.stringify(o);

	var type = typeof(o);

	if (o === null)
		return 'null';

	if (type == 'undefined')
		return undefined;

	if (type == 'number' || type == 'boolean')
		return o + '';

	if (type == 'string')
		return FlexJS.Utils.q(o);

	if (type == 'object') {

			// caso speciale per la codifica delle date

		if (o.constructor === Date) {

			var month = o.getUTCMonth() + 1;
			if (month < 10) month = '0' + month;

			var day = o.getUTCDate();
			if (day < 10) day = '0' + day;

			var year = o.getUTCFullYear();

			var hours = o.getUTCHours();
			if (hours < 10) hours = '0' + hours;

			var minutes = o.getUTCMinutes();
			if (minutes < 10) minutes = '0' + minutes;

			var seconds = o.getUTCSeconds();
			if (seconds < 10) seconds = '0' + seconds;

			var milli = o.getUTCMilliseconds();
			if (milli < 100) milli = '0' + milli;
			if (milli < 10) milli = '0' + milli;

			return '"' + year + '-' + month + '-' + day + 'T' +
				hours + ':' + minutes + ':' + seconds +
				'.' + milli + 'Z"'
			;
		}

		if (o.constructor === Array) {

			var ret = [];
			for (var i = 0, m = o.length; i < m; i++)
				ret.push( FlexJS.Utils.toJSON(o[i]) || 'null' );

			return '[' + ret.join(',') + ']';
		}

		var pairs = [];
		for (var k in o) {

			var name;
			type = typeof k;

			if (type === 'number')
				name = '"' + k + '"';
			else if (type === 'string')
				name = FlexJS.Utils.q(k);
			else
				continue;  // salta chiavi che non siano stringhe o numeri

			if (typeof o[k] == 'function')
				continue;  // salta elementi funzione

			var val = FlexJS.Utils.toJSON(o[k]);

			pairs.push(name + ':' + val);
		}

		return '{' + pairs.join(', ') + '}';
	}
};

FlexJS.Utils.fromJSON = function(src) {

	if (typeof(JSON) == 'object' && JSON.parse)
		return JSON.parse(src);

	var filtered = src;
	filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
	filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
	filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

	if (/^[\],:{}\s]*$/.test(filtered))
		return eval('(' + src + ')'); //NOSONAR
	else
		throw new SyntaxError('Error parsing JSON, source is not valid.');
};

FlexJS.Utils._escapable = /["\\\x00-\x1f\x7f-\x9f]/g;

FlexJS.Utils._meta = {
	'\b': '\\b',
	'\t': '\\t',
	'\n': '\\n',
	'\f': '\\f',
	'\r': '\\r',
	'"' : '\\"',
	'\\': '\\\\'
};

FlexJS.Utils.q = function(s) {

	if (s.match(FlexJS.Utils._escapable)) {

		return '"' + s.replace(FlexJS.Utils._escapable, function (a) {

				var c = FlexJS.Utils._meta[a];
				if (typeof c === 'string') return c;

				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"'
		;
	}

	return '"' + s + '"';
};

	//
	// apertura in una nuova finestra dei link
	//

FlexJS.TBHack = window.FlexJS.TBHack || {};

FlexJS.TBHack.sKeyCode = [13, 32];

FlexJS.TBHack.Init = function() {

	var blm = FlexJS.AppConfigure.Get('kBlankLinkMessage');

	$('a.target_blank').each(function() {

		this.title += blm;
		this.setAttribute('target', '_blank');
		this.setAttribute('rel', 'noopener noreferrer'); // nofollow
	})
// 	.click(function(e) {

// 		FlexJS.TBHack.Open(this.href);

// //			return e.preventDefault();
// 		return false;
// 	})
// 	.keypress(function(e) {

// 		if (FlexJS.Utils.InArray(e.keyCode, FlexJS.TBHack.sKeyCode)) {

// 			FlexJS.TBHack.Open(this.href);

// //			return e.preventDefault();
// 			return false;
// 		}
// 	});
};

FlexJS.TBHack.Open = function(url) {

		// apre in una finestra nuova

	window.open(url, 'TBH' + FlexJS.Utils.Random(), 'noopener,noreferrer');
};

	// funzione usata per replicare il comportamento del click nel keypress

FlexJS.TBHack.InitKeypress = function() {

	$('.InputIMG').keypress(function(e) {

		if (FlexJS.Utils.InArray(e.keyCode, FlexJS.TBHack.sKeyCode)) {

			this.click();

			return false;
		}
	});
};

	// estrae gli attributi meta dalla classe dell'oggetto
	// se è specificato un nome, restituisce solo quel valore
	//
	// la struttura del nome della classe è:
	//		snMeta-<name>-<value>
	//
	// TBD: duplicata in sn.js

FlexJS.Utils.MetaFromEl = function(el, n) {

	var
		c = $(el).attr('class').split(' '),
		mt = {},
		e
	;

	for (var i = 0, m = c.length; i < m; i++) {

		if ((e = c[i].match(/^snMeta\-(.*)\-(.*)$/)))
			mt[ e[1] ] = e[2].replace(/_/g, '/');
	}

	return n ? mt[n] : mt;
};

	//
	// inizializzazioni
	//

FlexJS.jq = $.fn.jquery;
$().ready(function() {

		// evita doppie inclusioni di versioni diverse

	if (FlexJS.jq !== $.fn.jquery)
		$('body').html('<h1>jquery version conflict</h1>');

	setTimeout(function() {

		FlexJS.TBHack.Init();
		FlexJS.TBHack.InitKeypress();

	}, 500);
});

	//
	// JS inheritance
	//
	// cfr: http://ejohn.org/blog/simple-javascript-inheritance/
	//

(function() {

	/*jslint expr: true */
	var
		initializing = false,
		fnTest = /xyz/.test(function() { xyz; }) ? (/\b_super\b/) : /.*/	//NOSONAR
	;

		// The base Class implementation (does nothing)

	this.Class = function() {};

		// Create a new Class that inherits from this class

	Class.extend = function(prop) {

		var _super = this.prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)

		initializing = true;
		var prototype = new this();
		initializing = false;

			// Copy the properties over onto the new prototype

		/*jslint loopfunc: true */
		for (var name in prop) {

				// Check if we're overwriting an existing function

			prototype[name] = typeof prop[name] == 'function' &&
				typeof _super[name] == 'function' && fnTest.test(prop[name]) ?
					(function(name, fn) {
						return function() {
							var tmp = this._super;

								// Add a new ._super() method that is the same method
								// but on the super-class

							this._super = _super[name];

								// The method only need to be bound temporarily, so we
								// remove it when we're done executing

							var ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(name, prop[name]) :
					prop[name];
		}

			// The dummy class constructor

		function Class() {

			// All construction is actually done in the init method

			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}

			// Populate our constructed prototype object

		Class.prototype = prototype;

			// Enforce the constructor to be what we expect

		Class.constructor = Class;

			// And make this class extendable

		Class.extend = arguments.callee;

		return Class;
	};

})();

fjs.sprintf = (function() {

	/*jslint boss: true */

	var
		r = function(c, n) { for (var o = []; n > 0; o[--n] = c); return o.join(''); },
		re1 = /^[^\x25]+/, // tutto fino al primo '%'
		re2 = /^\x25{2}/, // escape di '%%'
		re3 = /^\x25(?:(\d+)\$)?(\d+)?(?:\.(\d+))?([dfs])/
	;

	return function(/*s, a1, ...*/) {

		var i = 0, a, f = arguments[i++], o = [], s = '', m, p;
		while (f) {

			if (m = re1.exec(f))
				o.push(m[0]);
			else if (m = re2.exec(f))
				o.push('%');
			else if (m = re3.exec(f)) {

				if (((a = arguments[m[1] || i++]) === null) || (a === undefined))
					throw('fjs.sprintf(): too few arguments');

				switch (m[4]) {
					case 'd': a = parseInt(a, 10); break;
					case 'f': a = m[3] ? parseFloat(a).toFixed(m[3]) : parseFloat(a); break;
					case 's': a = ((a = String(a)) && m[3] ? a.substring(0, m[3]) : a); break;
				}

				p = m[2] ? r('0', m[2] - String(a).length) : s;

				o.push(s + p + a);
			}

			f = f.substring(m[0].length);
		}

		return o.join('');
	};

}());

/*
console.log(fjs.sprintf('this is a %s of %s -- %% --', 'test', 'sprintf'));
console.log(fjs.sprintf('this is a %2$s of %1$s', 'test', 'sprintf'));
console.log(fjs.sprintf('-- %10d --', 100));
console.log(fjs.sprintf('-- %2.5f --', Math.PI));
*/

window.__st = {};
window.__d = function(g, v) { __st[g] = v; };
window.__ = function(tag) {

	var
		t = [].shift.call(arguments),
		a = t.split('.')
	;

	if (arguments.length === 0)
		return __st[ a[0] ][ a[1] ];

	[].unshift.call(arguments, __st[ a[0] ][ a[1] ]);
	return fjs.sprintf.apply(null, arguments);
};

/*
__d('test', { uno: 'Simple Message % % %', due: 'Interpolated message [%s]' });
console.log(__('test.uno'));
console.log(__('test.due', 'this is interpolated'));
*/

	// funzione da eseguire allo scadere del tempo impostato (eg: 500 ms),
	// tempo che può essere rinnovato (debounce) oppure annullato
	//
	// var a = new fjs.delayedFunction(500, function() { alert 'now'; });
	//
	// a.activate();	// schedulazione dell'esecuzione
	// a.suspend();		// sospende l'esecuzione
	// a.fire();		// esegue immediatamente

fjs.delayedFunction = function(timeout, fn) {

	this.tm = timeout;
	this.fn = fn;

	this.t = null; // timer
};

fjs.delayedFunction.prototype.activate = function() {

	if (this.t !== null)
		clearTimeout(this.t);

	var me = this;
	this.t = setTimeout(function() {

		this.t = null;
		me.fn();

	}, this.tm);
};

fjs.delayedFunction.prototype.fire = function() {

	this.cancel();
	this.fn();
};

fjs.delayedFunction.prototype.suspend = function() {

	clearTimeout(this.t);
	this.t = null;
};

fjs.delayedFunction.prototype.cancel = function() {

	if (this.t !== null) {

		clearTimeout(this.t);

		this.t = null;
	}
};
