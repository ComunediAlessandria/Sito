FlexJS.ui = FlexJS.ui || {};

	// TBD: vecchia versione, le nuove sono ui.modalDialog

(function(_) {

_.Dialog = function(el, opt) {

	this.el = $(el);

	this.opt = $.extend({

		content: null,

		width: 400,
		height: 0,
		dClass: '',

		sync: false,

			// invocata prima della chiamata ajax per ottenere il contenuto del dialog

		beforeload: function() {},

			// invocata al ricevimento del contenuto

		onload: function() {},

			// callback associate ai bottoni del dialog

		oncancel: function() {},
		onselect: function() {}

	}, opt);

	this.selvalue = null;

	this.attach();
};

_.Dialog.sActive =
_.Dialog.sHelper =
_.Dialog.sOverlay = null;

_.Dialog.sElements = [];

_.Dialog.getActive = function() { return _.Dialog.sActive; };

_.Dialog.define = function(name, opt) { _.Dialog.sElements[name] = new _.Dialog($('<a />'), opt); };
_.Dialog.invoke = function(name, opt) { if (opt) jQuery.extend(_.Dialog.sElements[name].opt, opt); _.Dialog.sElements[name].onClick(); };

//_.Dialog.prototype.content = function() { return _.Dialog.sHelper; };

_.Dialog.prototype.setSelValue = function(v) { this.selvalue = v; };

_.Dialog.prototype.attach = function() {

//	var me = this;
	this.el
//		.click(function() { return me.onClick(); })
		.click(FlexJS.proxy(this.onClick, this))
	;
};

_.Dialog.prototype.onClick = function() {

	var me = this;

	if (me.opt.beforeload) me.opt.beforeload(me);

	FlexJS.Ajax.get(this.opt.content /* 'test/formdialog' */, function(data) {

		if (data !== null) {

			me.dismiss();

			_.Dialog.sActive = me;

			me.opt = jQuery.extend(me.opt, data.opt);

			var
				wnd = $(window),
				doc = $(document)
			;

			_.Dialog.sOverlay = $('<div/>').appendTo(document.body)
				.addClass('ui-dialogoverlay')
				.css({
					borderWidth: 0, margin: 0, padding: 0,
					position: 'absolute', top: 0, left: 0,
					width: doc.width(),
					height: doc.height(),
					zIndex: 1000
				})
			;

			var h = _.Dialog.sHelper = $('<div />').appendTo(document.body)
				.addClass('ui-dialog')
				.addClass(me.opt.dClass)
				.css({
					position: 'fixed',
					zIndex: 1001,
					display: 'none',

					width: me.opt.width
				})
			;

				// centra il dialog

			h
				.css({
					top: /* doc.scrollTop() + */ (wnd.height() - h.height()) / 5,
					left: (wnd.width() - h.width()) / 2
				})
				.show()
			;

			me.addAssets(data, h, function() {

					// le callback devono essere invocate in modo asincrono poiché
					// la valutazione del codice 'exec' viene fatta in modo asincrono

				if (me.opt.sync)
					$.each(me.opt.sync, function(i, e) { $('#' + e, h).val( $('#' + i).val() ); });

				if (me.opt.onload) me.opt.onload(me);
			});

				// non posso dare l'altezza al contenitore, quindi
				// l'attribuisco al contenuto supponendo che esista un
				// elemento con classe 'content'

			if (me.opt.height)
				$('.content', h).css('height', me.opt.height);

				// aggiunge gli handler per i bottoni

			$('.button.cancel a', h).click(function() { return me.cancel(); });
			$('.button.confirm a', h).click(function() { me.accept(); });

				// handler per la gestione di ESC

			$(document).bind('keyup', function(e) { if (e.keyCode == 27) return me.dismiss(); });
		}

	}, 'json');

	return false;
};

_.Dialog.prototype.accept = function() {

	if (this.opt.sync)
		$.each(this.opt.sync, function(i, e) { $('#' + i).val( $('#' + e, h).val() ); });

	if (this.opt.onselect) this.opt.onselect(this.selvalue, this);

	this.dismiss();
};

_.Dialog.prototype.cancel = function() {

	if (this.opt.oncancel) this.opt.oncancel(this);

	this.dismiss();
};

	// riceve una struttura così fatta:
	//
	// content: <contenuto HTML>
	// pars: { <configurazione del dialog> }
	// assets: {
	//		exec: ['<codice js da eseguire>', ...]
	//		inc:  ['<css o js da includere>', ...]
	// }

_.Dialog.prototype.addAssets = function(data, el, cb) {

		// inserimento degli assets
		// viene fatto prima dell'inserimento dell'HTML nella speranza
		// di avere eventuali CSS già caricati al rendering degli elementi

	var v = data.assets.inc;
	for (var i in v)
		$(v[i]).appendTo(document.body);

		// inserisce, se presente, il contenuto HTML

	if (data.content && el)
		$(el).html(data.content);

	// TBD: eseguire solo al caricamento
//	setTimeout(function() {

		var e = data.assets.exec;
		for (var j in e)
			eval(e[j]); //NOSONAR

		if (cb) cb();

//	}, 500);
};

_.Dialog.prototype.dismiss = function() {

	if (_.Dialog.sHelper) _.Dialog.sHelper.remove();
	if (_.Dialog.sOverlay) _.Dialog.sOverlay.remove();

	_.Dialog.sActive = _.Dialog.sHelper = _.Dialog.sOverlay = null;

	$(document).unbind('keyup');

	return false;
};

_.Dialog.attachTo = function(el, opt) {

	$(el).each(function() { new _.Dialog(this, opt); });
};

})(FlexJS.ui);
