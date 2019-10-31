FlexJS.ui = FlexJS.ui || {};

(function(_) {

		// attacca un dialog modale ad un insieme di elementi
		// e ne personalizza l'azione

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

})(FlexJS.ui);
