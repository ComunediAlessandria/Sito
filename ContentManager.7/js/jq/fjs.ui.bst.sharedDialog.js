fjs.ui = fjs.ui || {};
fjs.ui.bst = fjs.ui.bst || {};

	// gestione di uno shared-dialog che si appoggia al modal di bootstrap
	//
	// definisce un template per il titolo, un template per il contenuto
	// e la struttura dei bottoni
	//
	// per ogni item, valorizza il template e visualizza il dialog

(function(_) {

	'use strict';

_.sharedDialog = function(opt) {

	this.opt = jQuery.extend({

		renderer: 'bootstrap-2'

	}, opt);

	this.$t = null;

	_.sharedDialog.init();
};

_.sharedDialog.init = function() {

	_.sharedDialog.openItem = null;

		// handler per la gestione di ESC

	$(document).on('keyup', function(e) { if (e.keyCode == 27 && _.sharedDialog.openItem !== null) return _.sharedDialog.openItem.hide(); });
};


_.sharedDialog.prototype.open = function(data) {

	this.create();

	$.each(this.pl, function(k) {

		this.html(data[k] || ''); // TBD: default
	});

	this.show();

	this.cb = null;

	return this; // chainable
};

_.sharedDialog.prototype.openWithTemplate = function(tpl, data) {

	var tt = {};

	$.each(tpl, function(k, v) {
		tt[k] = v.replace(/\[\[(\w+)\]\]/, function(a, n) {
			return data[n];
		});
	});

	return this.open(tt);
};

_.sharedDialog.prototype.onButtonOK = function(cb) { this.cb = cb; };

_.sharedDialog.prototype.show = function() {

	_.sharedDialog.openItem = this;

	this.$t.modal('show');
};
_.sharedDialog.prototype.hide = function() {

	_.sharedDialog.openItem = null;

	this.$t.modal('hide');
};

_.sharedDialog.prototype.create = function(data) {

	if (this.$t === null) {

		this.$t = $(this.template())
			.appendTo('body')
		;

			// placeholder per il contenuto

		this.pl = {
			header: this.$t.find('.modal-title'),
			body: this.$t.find('.modal-body'),
			btnOK: this.$t.find('.btn-primary'),
			btnCancel: this.$t.find('.sd-cancel')
		};

		var me = this;
		this.pl.btnOK.click(function() {

			if (me.cb !== null)
				me.cb();
		});

		this.$t.modal({
			show: false
		});
	}
};

_.sharedDialog.prototype.template = function() {

	switch(this.opt.renderer) {

		case 'bootstrap-2':

			return [
				'<div class="modal hide fade" role="dialog" aria-hidden="true">',
				'	<div class="modal-header">',
				'		<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i></button>',
				'		<h3 class="modal-title"></h3>',
				'	</div>',
				'	<div class="modal-body">',
				'	</div>',
				'	<div class="modal-footer">',
				'		<button class="btn sd-cancel" data-dismiss="modal" aria-hidden="true"></button>',
				'		<button class="btn btn-primary"></button>',
				'	</div>',
				'</div>'
			].join('');

		case 'bootstrap-3':

			return [
				'<div class="modal fade" role="dialog" tabindex="-1" aria-hidden="true">',
				'	<div class="modal-dialog">',
				'		<div class="modal-content">',
				'		  <div class="modal-header">',
				'			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
				'			<h4 class="modal-title">Modal title</h4>',
				'		  </div>',
				'		  <div class="modal-body">',
				'		  </div>',
				'		  <div class="modal-footer">',
				'			<button type="button" class="btn sd-cancel btn-default" data-dismiss="modal">Close</button>',
				'			<button type="button" class="btn btn-primary"></button>',
				'		  </div>',
				'		</div>',
				'	</div>',
				'</div>'
			].join('');
	}
};




/*
_.groupDialog = function(els, opt) {

	this.els = $(els);

	this.opt = jQuery.extend({

		dialogKind: 'modalDialogWithButtons',

//		titleTemplate: 'Default title',
//		mainTextTemplate: 'Default text',
//		noteTextTemplate: 'Default text',

			// invocata alla creazione dell'elemento
			// (istanza groupDialog)

		beforeElementCreation: function() {},
		afterElementCreation: function() {},

		beforeElementActivation: function() {},
		afterElementActivation: function() {}

	}, opt);

	this.opt.beforeElementCreation(this);

	// TBD: test per la definizione del dialogKind ed eventualmente
	//      caricamento asincrono + callback
	this.uiElement = new FlexJS.ui[ this.opt.dialogKind ]({

		width: opt.width || 400,

		text: this.opt.text,
		buttons: this.opt.buttons,

		// TBD: questa impostazione non è pertinente al dialogGroup che deve
		// agire solo come proxy
		onButtonPressed: FlexJS.proxy(this.onButtonPressed, this)
	});

	this.opt.afterElementCreation(this);

//	this.uiElement.show();

	this.attach();
};

_.groupDialog.prototype.attach = function() {

	this.els
		.click(FlexJS.proxy(this.onClick, this))
	;
};

_.groupDialog.prototype.onClick = function(e) {

	var
		id = e.delegateTarget.id,
		data = this.opt.templateData[ id ]
	;

	this.opt.beforeElementActivation(this, data);

		// dati che servono per le callback dell'uiElement

	this.uiElement.setData(data);

		// apre il dialog

	this.uiElement.show();

	this.opt.afterElementActivation(this);

	return false;
};

// TBD: spostare da qui
_.groupDialog.expandTemplate = function(tpl, data) {

	return tpl.replace(/\[\[(\w+)\]\]/, function(all, name) { return data[name]; });
};

_.groupDialog.prototype.onButtonPressed = function(btn, data) {

		// guarda se c'è un azione definita per il bottone

	if (this.opt.onButton[ btn ]) {

			// azioni diponibili (per adesso solo redirect)

		var
			what = this.opt.onButton[ btn ][0],
			p1 = this.opt.onButton[ btn ][1]
		;

		if (what === 'redirect') {

			var url = _.groupDialog.expandTemplate(p1, data);

			window.location = url;
		}
	}

	this.uiElement.dismiss();
};
*/

})(fjs.ui.bst);
