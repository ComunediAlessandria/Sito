FlexJS.ui = FlexJS.ui || {};

(function(_) {

		// funzioni per la gestione di un dialog modale

_.modalDialog = function(opt) {

	this.opt = jQuery.extend({

		content: null,

		width: 400,
		height: 0,

			// callback data

		data: {},

			// callback

		beforeAppear: function() {},
		afterAppear: function() {},

		beforeHide: function() {},
		afterHide: function() {},

			// cb invocata al resize del contenitore con
			// le dimensioni a disposizione

		beforeResize: function(aw, ah) {}

	}, opt);

//		// puntatore al contenuto del dialog
//
//	this.content = null;

	this.helper = null;
};

_.modalDialog.sActive =
_.modalDialog.sOverlay = null;
/*
_.modalDialog.sHelper =
*/
	// create: crea il supporto DOM
	// show: mostra
	// hide: nasconde
	// dismiss: distrugge il supporto DOM

_.modalDialog.prototype.create = function() {

	var doc = $(document);

	_.modalDialog.sOverlay = $('<div/>').appendTo(document.body)
		.addClass('ui-dialogoverlay')
		.css({
			borderWidth: 0, margin: 0, padding: 0,
			position: 'absolute', top: 0, left: 0,
			width: doc.width(),
			height: doc.height(),
			zIndex: 5000,
			display: 'none',

			backgroundColor: 'black',
			opacity: 0.8
		})
	;

/*
	h
		.html(
			this.getInnerContent()
		)
//		.click(FlexJS.proxy(this.onClick, this))
//		.show()
	;
*/

};

_.modalDialog.prototype.content = function() { return this.helper; };

	// c è HTML o oggetti DOM

_.modalDialog.prototype.setContent = function(c) {

	if (this.helper === null) {

		this.buildHelper();
		this.helper.appendTo(document.body);
	}

	this.content().html(c);

		// centra il dialog

	this.position();
};

_.modalDialog.prototype.buildHelper = function() {

	if (this.opt.useBootstrap)
		this.helper = $('<div />')
//			.addClass('modal hide fade')
			.addClass('modal')
			.css({
				position: 'fixed',
				zIndex: 5100,
				//display: 'none',

				marginLeft: 'auto',

				width: this.opt.width
			})
		;
	else
		this.helper = $('<div />')
			.addClass('ui-dialog')
			.css({
				position: 'fixed',
				zIndex: 5100,
				display: 'none',

				width: this.opt.width
			})
		;
};

_.modalDialog.prototype.show = function() {

	if (_.modalDialog.sOverlay === null)
		this.create();

	this.opt.beforeAppear(this.opt.data);

	_.modalDialog.sOverlay.show();

	// if (this.opt.useBootstrap)
	//		this.helper.addClass('in').removeClass('hide');
	// else
		this.helper.show();		// TBD: effect

	this.opt.afterAppear(this.opt.data);

		// handler per la gestione di ESC
		//
		// TBD: trigger di 'cancel'

	var me = this;
	$(document).on('keyup', function(e) { if (e.keyCode == 27) return me.hide(); });

	return this; // chainable
};

_.modalDialog.prototype.hide = function() {

	this.opt.beforeHide(this.opt.data);

	_.modalDialog.sOverlay.hide();

	// if (this.opt.useBootstrap)
	//		this.helper.addClass('hide').removeClass('in');
	// else
		this.helper.hide();

	this.opt.afterHide(this.opt.data);

	$(document).off('keyup');
};

_.modalDialog.prototype.position = function() {

	var
		wnd = $(window),
		wh = wnd.height(),
		ww = wnd.width(),
		h = this.helper
	;

	if (h === null)
		return;

		// invoca il resize e ricalcola le dimensioni del contenuto poiché
		// potrebbero essere cambiate

	this.opt.beforeResize(ww, wh);

	h
		.css({
			top: /* doc.scrollTop() + */ (wh - h.height()) / 5,
			left: (ww - h.width()) / 2
		})
//		.html(
//			this.getInnerHTML()
//		)
//		.click(FlexJS.proxy(this.onClick, this))
//		.show()
	;

		// non posso dare l'altezza al contenitore, quindi
		// l'attribuisco al contenuto supponendo che esista un
		// elemento con classe 'content'

	if (this.opt.height)
		$(this.opt.useBootstrap ? '.modal-body' : '.content', h)
			.css({ height: this.opt.height, maxHeight: 'none' })
		;
};

//_.modalDialog.prototype.getDialogDOMElement = function() { return _.modalDialog.sHelper; };

_.modalDialog.prototype.setData = function(d) { this.opt.data = d; };
/*
_.modalDialog.prototype.getInnerContent = function() {

	return '<div class="content"><h2>innerContent not overridden.</h2></div>';
};
*/
_.modalDialog.prototype.dismiss = function() {

	if (_.modalDialog.sOverlay) _.modalDialog.sOverlay.remove();
	if (this.helper) this.helper.remove();

	_.modalDialog.sActive = this.helper = _.modalDialog.sOverlay = null;

//	$(document).unbind('keyup');

//	this.content = null;
};

	// un dialog con un insieme di bottoni
	// (tipicamente OK/Cancel) ed un testo

_.modalDialogWithButtons = function(opt) {

	opt = $.extend({

		buttons: {
			cancel: 'Annulla',
			ok: 'OK'
		},

		title: 'Title',

			// se fornisco una funzione per la generazione del contenuto,
			// questa ha la precedenza, altrimenti il contenuto viene
			// costruito da 'text' { class: <text|function> }

		text: {},
		content: null,

			// eventi per l'esterno

		onButtonPressed: function(btn) {},

			// proxy eventi per la classe stessa

		afterAppear: FlexJS.proxy(this.attach, this),

		useBootstrap: false

	}, opt);

	_.modalDialog.call(this, opt);
};

_.modalDialogWithButtons.prototype = new _.modalDialog();

_.modalDialogWithButtons.prototype.setTitle = function(t) { this.opt.title = t; };
_.modalDialogWithButtons.prototype.setText = function(node, txt) { this.opt.text[ node ] = txt; };

_.modalDialogWithButtons.prototype.show = function() {

	this.setContent(
		this.buildContent()
	);

	return _.modalDialog.prototype.show.call(this);
};

_.modalDialogWithButtons.prototype.buildContent = function() {

	return $('<div class="inner" />')
		.append(this.buildTitle())
		.append(this.opt.content ? this.opt.content() : this.buildTextContent())
		.append(this.buildButtonRow())
	;
};

_.modalDialogWithButtons.prototype.buildTitle = function() {

	/*jslint laxbreak: true */
	return this.opt.useBootstrap
		? $('<div class="modal-header"><h3>' + this.opt.title + '</h3></div>')
		: $('<h2 class="title">' + this.opt.title + '</h2>')
	;
};

_.modalDialogWithButtons.prototype.buildButtonRow = function() {

	var bHTML = [];
	$.each(this.opt.buttons, function(k, v) {

//		bHTML.push("<span class='button white medium' data-btn='" + k + "'>" + v + "</span>&nbsp;");

		bHTML.push("<button class='btn' data-btn='" + k + "'>" + v + "</button>&nbsp;");
	});

	/*jslint laxbreak: true */
	var btn = this.opt.useBootstrap
		? $('<div class="modal-footer buttons">' + bHTML.join('') + '</div>')
		: $('<div class="buttons">' + bHTML.join('') + '</div>')
	;
	btn
		.children()
			.last()
				.addClass('btn-primary')
	;

	return btn;
};

_.modalDialogWithButtons.prototype.buildTextContent = function() {

	var cHTML = [];
	if ($.isPlainObject(this.opt.text)) {

		$.each(this.opt.text, function(k, v) {

			var t = $.isFunction(v) ? v() : v;

			cHTML.push("<div class='text " + k + "'>" + t + '</div>');
		});

	} else if ($.type(this.opt.text) === 'string')
		cHTML.push("<div class='lead'>" + this.opt.text + '</div>');

	/*jslint laxbreak: true */
	return this.opt.useBootstrap
		? $('<div class="modal-body">' + cHTML.join('') + '</div>')
		: $('<div class="content">' + cHTML.join('') + '</div>')
	;
};

_.modalDialogWithButtons.prototype.attach = function() {

	$(this.content).find('.buttons').on('click', 'button', FlexJS.proxy(this.onClick, this));
};

_.modalDialogWithButtons.prototype.onClick = function(e) {

		// notifica dell'avvenuta pressione
		// del bottone

	this.opt.onButtonPressed(
		$(e.target).data('btn'),
		this.opt.data
	);
};
/*
	// un dialog il cui contenuto è generato via ajax

_.ajaxDialog = function(opt) {

	opt = jQuery.extend({

		buttons: {
			cancel: 'Annulla',
			ok: 'OK'
		},

		title: 'Title',
//		mainText: 'mainText Placeholder',
//		noteText: null,
		text: [],

		ajaxCallback: 'error',

			// eventi per l'esterno

		onButtonPressed: function(btn) {},

			// proxy eventi per la classe stessa

//		afterAppear: FlexJS.proxy(this.attach, this)

	}, opt);

	_.modalDialog.call(this, opt);	// parent constructor
};

_.ajaxDialog.prototype = new _.modalDialog();

_.ajaxDialog.prototype.getInnerHTML = function() {

	var bHTML = [];
	$.each({ok: 'Annulla'}, function(k, v) {

		bHTML.push("<span class='button white medium' data-btn='" + k + "'>" + v + "</span>&nbsp;");
	});

	FlexJS.Ajax.get(this.opt.ajaxCallback, function(data) {

		console.log(data);
	});

	/ *jshint laxbreak:true * /
	return '<div class="inner">'
		+	'<h2 class="title">' + this.opt.title + '</h2>'
		+	'<div class="content">Loading ...'
//		+		cHTML.join('')
		+	'</div>'
//		+	'<div class="buttons">'
//		+	bHTML.join('')
//		+	'</div>'
		+'</div>'
	;
};
*/
})(FlexJS.ui);
