
fjs.ui = fjs.ui || {};

(function(_) {

_.richEditor = function(opt) {

	const me = this;

	this.opt = jQuery.extend({

		content: null,

		width: '95%',
		height: 0,

		buttons: {
			cancel: 'Annulla',
			ok: 'Registra'
		},

		title: 'Modifica Testo',
		//text: [],

		onButtonPressed: function(btn) {

				// per risolvere problema di popover imgtools

			me.mce.selection.select(me.mce.getBody(), true);
			me.mce.selection.collapse(false);

			if (btn === 'cancel') {

				me.hide();
				//me.opt.onCancel();

			} else if (btn === 'ok') {

				const cnt = me.mce.getContent();

/*
				const el = $(cnt);

				if (el.hasClass('container-fluid mceNonEditable')) {
					console.log('ok');
				}
//new tinymce.html.Serializer().serialize(new tinymce.html.DomParser().parse('<p>text</p>'));
*/
				fjs.ajax.post('blobeditor', { op: 'set', id: me.current.id, cnt: cnt })
					.then(function(d) {

						if (d.status === 'ok') {

							const contents = $(me.current.container).contents();
							const body = contents.find('body');

// $('<div>foo bar</div>').appendTo(body);

							body.html(d.html);

							//$(me.current.container).html(d.html);

							me.current = null;

							me.hide();
						}
					})
				;

				// me.pageWasSelected();
			}
		},

	}, opt);

	this.helper = null;
	this.overlay = null

	this.hasContent = false;

	this.current = null;
};

	// create: crea il supporto DOM
	// show: mostra
	// hide: nasconde
	// dismiss: distrugge il supporto DOM

_.richEditor.prototype.create = function() {

	var doc = $(document);

	this.overlay = $('<div/>').appendTo(document.body)
		.addClass('ui-dialogoverlay')
		.css({
			borderWidth: 0,
			margin: 0, padding: 0,
			position: 'absolute',
			top: 0, left: 0,
			width: doc.width(),
			height: doc.height(),
			zIndex: 5000,
			display: 'none',

			backgroundColor: 'black',
			opacity: 0.8
		})
	;
};

// _.richEditor.prototype.content = function() { return this.helper; };

	// c è HTML o oggetti DOM

_.richEditor.prototype.setContent = function(c) {

	if (this.helper === null) {

		this.buildHelper();
		this.helper.appendTo(document.body);
	}

	this.helper.html(c);

		// centra il dialog

	this.position();
};

_.richEditor.prototype.buildHelper = function() {

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
};

_.richEditor.prototype.show = function(pars) {

	this.current = pars;

	if (this.overlay === null)
		this.create();

	this.overlay.show();

	if (! this.hasContent) {

		this.hasContent = true;

		this.setContent(
			this.buildContent() // invoca la fillMCE() al completamento
		);

	} else
		this.fillMCE();

	this.helper.show();


//		tinymce.EditorManager.execCommand('mceAddEditor', false, me.mce.get(0));

		// handler per la gestione di ESC
		//
		// TBD: trigger di 'cancel'

	var me = this;
	$(document).one('keyup', function(e) { if (e.keyCode == 27) return me.hide(); });

	return this; // chainable
};

_.richEditor.prototype.fillMCE = function() {

	this.mce.setProgressState(true); // Show progress

	var me = this;
	fjs.ajax.post('blobeditor', { op: 'get', id: this.current.id })
		.then(function(d) {

			if (d.status === 'ok') {

				me.mce.setContent([
					//'<div class=\'container-fluid mceNonEditable\'>',
					d.html,
					//'</div>'
				].join(''));

				me.mce.setProgressState(false);
			}
		})
	;
};

_.richEditor.prototype.hide = function() {

	this.overlay.hide();

	this.helper.hide();

	// $(document).off('keyup');
};

_.richEditor.prototype.position = function() {

	var
		wnd = $(window),
		wh = wnd.height(),
		ww = wnd.width(),
		h = this.helper
	;

	if (h === null)
		return;

	h
		.css({
			top: 40, ///* doc.scrollTop() + */ (wh - h.height()) / 5,
			left: (ww - h.width()) / 2
		})
	;

		// non posso dare l'altezza al contenitore, quindi
		// l'attribuisco al contenuto

	if (this.opt.height)
		$('.modal-body', h)
			.css({ height: this.opt.height, maxHeight: 'none' })
		;
};

_.richEditor.prototype.dismiss = function() {

	this.overlay.remove();
	if (this.helper) this.helper.remove();

	this.overlayctive = this.helper = null;
};

_.richEditor.prototype.buildContent = function() {

	return $('<div class="inner" />')
		.append(this.buildTitle())
		.append(this.buildTextContent())
		.append(this.buildButtonRow())
	;
};

_.richEditor.prototype.buildTitle = function() {

	return $('<div class="modal-header"><h3>' + this.opt.title + '</h3></div>');
};

_.richEditor.prototype.buildButtonRow = function() {

	var bHTML = [];
	$.each(this.opt.buttons, function(k, v) {

//		bHTML.push("<span class='button white medium' data-btn='" + k + "'>" + v + "</span>&nbsp;");

		bHTML.push("<button class='btn' data-btn='" + k + "'>" + v + "</button>&nbsp;");
	});

	var btn = $('<div class="modal-footer buttons">' + bHTML.join('') + '</div>');

	btn
		.children()
			.last()
				.addClass('btn-primary')
	;

	btn.on('click', 'button', FlexJS.proxy(this.onClick, this));

	return btn;
};

_.richEditor.prototype.onClick = function(e) {

		// notifica dell'avvenuta pressione
		// del bottone

	this.opt.onButtonPressed(
		$(e.target).data('btn'),
		this.opt.data
	);
};

_.richEditor.prototype.buildTextContent = function() {

	// var cnt = $('<div class="modal-body ui pagechooser content" />').css({ 'max-height': '10000px' });
	var cnt = $('<div class="modal-body container-tinymce" />').css({ 'max-height': '10000px' });

	const mce = $('<textarea id="mceEditorID" class="mceEditorID form-control" cols="10" name="description" rows="5" placeholder="Description"></textarea>');

	cnt.append(mce);

	const me = this;
	setTimeout(function() {

		// tinymce.EditorManager.execCommand('mceAddEditor', false, me.mce.get(0));

		// tinymce.EditorManager.createEditor('mce', {
		// 	target: me.mce.get(0)
		// });

		me.mce = new tinymce.Editor(mce.get(0), { // Create new editor for each desired element on the screen
			//selector: '#' + me.mce.get(0).id,
			inline: false,
			menubar: false,
			theme: 'modern',

			forced_root_block: 'div',

			content_css : [
				'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
				me.opt.css
			],
			content_style: [
				''
			].join(''),
			// toolbar: 'styleselect | fx-link fx-unlink | undo redo | formatselect | bold italic backcolor hr | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table template | removeformat code',
			toolbar: 'fx-link fx-unlink | undo redo | formatselect | bold italic backcolor hr | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table template | removeformat code',
			plugins: [
				//'help',
				'lists', 'advlist',
				/* 'link',*/ 'fx-link',
				'table',
				'hr',
				'code',
				// 'image',
				'imagetools',
				'paste',
				'template',
				'noneditable' , 'preventdelete'
			],
			language: 'it',
			branding: false,
			elementpath: false,
			height : 550,

				// table

			table_appearance_options: false,
			table_default_attributes: {
				class: 'table'
			},
			table_class_list: [
				{ title: 'Nessuna', value: ''},
				{ title: 'Striped', value: 'table-striped'},
				{ title: 'Bordi', value: 'table-bordered'},
				{ title: 'Hover', value: 'table-hover'},
				{ title: 'Condensed', value: 'table-condensed'}
			],
			invalid_styles: {
				//'table' : 'style'
				// 'td' : 'width height'
			},

				// template

			templates: [
				{
					title: 'Due Colonne',
					description: 'Contenitore Bootstrap a due colonne',
					content: [
						'<div class=\'row mce-row mceNonEditable\'>',
							'<div class=\'col-xs-6 mce-col mceEditable\'>',
								'INSERIRE TESTO',
							'</div>',
							'<div class=\'col-xs-6 mce-col mceEditable\'>',
								'INSERIRE TESTO',
							'</div>',
						'</div>',
					].join('')
				},
				{
					title: 'Tre Colonne',
					description: 'Contenitore Bootstrap a tre colonne',
					content: [
						'<div class=\'row mce-row mceNonEditable\'>',
							'<div class=\'col-xs-4 mce-col mceEditable\'>',
								'INSERIRE TESTO',
							'</div>',
							'<div class=\'col-xs-4 mce-col mceEditable\'>',
								'INSERIRE TESTO',
							'</div>',
							'<div class=\'col-xs-4 mce-col mceEditable\'>',
								'INSERIRE TESTO',
							'</div>',
						'</div>',
					].join('')
				}
			],
/*
			style_formats: [
				{title: 'Bold text', inline: 'b'},
				{title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
				{title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
				{title: 'Example 1', block: 'ul', classes: 'example1'},
				{title: 'Example 2', inline: 'span', classes: 'example2'},
				{title: 'Table styles'},
				{title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
			],
			style_formats_merge: true,
*/
				// plugin: paste

			paste_data_images: true,
			paste_enable_default_filters: true,

				// image upload

			relative_urls: false,
			remove_script_host: false,
			images_upload_handler: function (blobInfo, success, failure) {

				const formData = new FormData();
				formData.append('op', 'upload-image');
				formData.append('id', me.current.id);
				formData.append('image', blobInfo.blob());

				$.ajax({
				    url: fjs.ajax.urlFromPath('blobeditor'),
				    type: 'POST',
				    cache: false,
				    contentType: false,
				    processData: false,
				    dataType: 'json',
				    data: formData
				})
					.done(function(data) {

						if (data.status === 'ok') {

							success(data['file-url']);

						} else
							failure(data.message);
					})
				;
			}

		}, tinymce.EditorManager);

		me.mce.render();

		me.mce.on('postRender', function(e) { me.fillMCE(); });

	}, 10);

	return cnt;
};


/*
_.richEditor = function(opt) {

	var me = this;
	opt = $.extend({

		buttons: {
			cancel: 'Annulla',
			ok: 'OK'
		},

		title: 'Modifica',
		text: [],


			// opzione per la scelta del gruppo

		showGroupChooser: false,

			// eventi per l'esterno

		onButtonPressed: function(btn) {

	var editorID = 'mceEditorID';

tinyMCE.EditorManager.execCommand('mceFocus', false, editorID);
tinyMCE.EditorManager.execCommand('mceRemoveEditor', true, editorID);

			if (btn === 'cancel') {

				me.hide();
				me.opt.onCancel();

			} else if (btn === 'ok') {

				me.hide();
				me.pageWasSelected();
			}
		},

			// evento di selezione della pagina

		onPageSelected: function(page, addData) {},

			// bottone annulla

		onCancel: function() {},

			// proxy eventi per la classe stessa

//		afterAppear: FlexJS.proxy(this.attach, this)

		beforeResize: $.proxy(this.onResize, this),

		width: 800,

			// temporaneo (cfr. anche indexTreeEditor)

		useBootstrap: true

	}, opt);

	this.isBuilt = false;

	_.modalDialogWithButtons.call(this, opt);
return;
	this.pageKinds = {
		blob: 'tabBLOB',
		fixed: 'tabFixed',
		html: 'tabHTML',
		ex: 'tabEx',
		http: 'tabHTTP'
	};

	var panes = [];
	$.each(opt.panes, function(k, v) { panes.push(new _.pageChooser[ me.pageKinds[v] ]()); });

	this.tabManager = new _.pageChooser.tabManager(panes, this);

	if (this.opt.showGroupChooser) {

			// precarica l'elenco dei gruppi dell'utente
			//
			// usergroups (array di id)
			// groups (id -> gruppo)

		this.groups = null;		// TBD: deferred

		fjs.Ajax.get('tree/groups', function(data) {

			me.usergroups = data.usergroups;
			me.groups = data.groups;
		});
	}
};

_.richEditor.prototype = new _.modalDialogWithButtons();

	// override perché voglio creare il contenuto una sola volta

_.richEditor.prototype.show = function() {

	if (! this.isBuilt) {

		this.setContent(
			this.buildContent()
		);

		this.isBuilt = true;
	}

	return _.modalDialog.prototype.show.call(this);
};



_.pageChooser.prototype.buildGroupsDropdown = function() {

	var s = $('<select id="owner"><option value="-1">---</option></select>');
	$.each(this.groups, function(id, name) {
		s.append('<option value="' + id + '">' + name + '</option>');
	});

	return s;
};

_.pageChooser.prototype.resized = false;
_.pageChooser.prototype.onResize = function(aw, ah) {

	if (_.pageChooser.prototype.resized)
		return;

//	console.log('onResize', this.helper, this.helper.height());
//	console.log(this.helper.find('.pagelistcontainer'));

		// ridimensiona il contenitore con l'elenco delle pagine
		// in modo da avere il dialog di dimensioni corrette

	var
		hh = this.helper.height(),
		h = ah - hh - 30
	;

	this.helper.find('.pagelistcontainer').height(h);

	_.pageChooser.prototype.resized = true;
};

_.pageChooser.prototype.choosePage = function(page) {
//console.log('choosePage', page);
	this.show();

	// page: { entity, owner, data }

	if (this.opt.showGroupChooser)
		this.groupControl.val(page.owner);

	this.tabManager.setPage(page.entity, page.data);
};

_.pageChooser.prototype.chooseNewPage = function() {

	this.choosePage({
		entity: null,
		data: null
	});
};

	// invocato per forzare la selezione della pagina

_.pageChooser.prototype.pageWasSelected = function() {

	var p = this.tabManager.getSelectedPage();

		// aggiunge valori globali

	if (this.opt.showGroupChooser)
		p.owner = this.groupControl.val();

	p.kind = this.tabManager.active;

	this.hide();
	this.opt.onPageSelected(p);
};

_.pageChooser.tabManager = function(tabs, container) {

	this.tabs = tabs;

	var me = this;
	$.each(tabs, function() { this.setManager(me); });

	this.container = container;

		// tab attivo

	this.active = null;
	this.curPage = null;

	this.build();
};

_.pageChooser.tabManager.prototype.getCommand = function() { return this.c; };
_.pageChooser.tabManager.prototype.getContent = function() { return this.t; };

_.pageChooser.tabManager.prototype.getSelectedPage = function() {

	var id = this.active, at = null;
	$.each(this.tabs, function() { if (this.id() === id) at = this; });

	return at !== null ? at.getPage() : {};
};

_.pageChooser.tabManager.prototype.setPage = function(entity, data) {

	this.curPage = entity;
	this.curPageData = data;

		// se è una pagina nuova, imposta il controllo per
		// le BLOB page

	if (entity === null) {

		$.each(this.tabs, function(k, v) {

			v.resetPage();
		});

		this.setActive('blob');

	} else {

//		var tab = entity.split(':')[0].toLowerCase();

		var found = false, me = this;
		$.each(this.tabs, function(k, v) {

//console.log('Entity check:', entity, v.canHandle(entity));

				// l'ultimo (http) è una sorta di catch-all

			if (v.canHandle(entity) && ! found) {

				v.setPage(entity, data);
				me.setActive(v.id());

				found = true;

			} else
				v.resetPage();
		});

		if (! found)
			this.setActive('http');
	}
};

_.pageChooser.tabManager.prototype.pageWasSelected = function() {

	this.container.pageWasSelected();
};

_.pageChooser.tabManager.prototype.setActive = function(id) {

	if (this.active !== id) {

		if (this.active !== null) {

			this.ic[ this.active ].removeClass('active');
			this.it[ this.active ].removeClass('active');
		}

		this.active = id;

		this.ic[ id ].addClass('active');
		this.it[ id ].addClass('active');

	//	this.container.reposition();
	}
};

_.pageChooser.tabManager.prototype.build = function() {

	var
		ic = {},	// control
		it = {}	// content
	;

	var
		c = $('<ul class="nav nav-tabs"></ul>'),
		t = $('<div id="my-tab-content" class="tab-content">')
	;

	$.each(this.tabs, function(k, tab) {

		var id = tab.id();
		ic[ id ] = $('<li><a href="#" style="text-decoration: none; color: #0088cc;">' + tab.title() + '</a></li>')
			.find('a')
				.data('target', id)
			.end()
			.appendTo(c)
		;

		it[ id ] = $('<div class="tab-pane" id="' + tab.id() + '" />')
			.html(tab.content())
			.appendTo(t)
		;
	});

	var me = this;
	c.on('click', 'a', function(e) {

		me.setActive($(e.target).data('target'));
	});

		// container

	this.t = t;
	this.c = c;

		// elementi indicizzati per id

	this.it = it;
	this.ic = ic;

	this.setActive('blob');
};

_.pageChooser.tab = Class.extend({

	init: function(pars) {
//    this.dancing = isDancing;
	},

	setManager: function(m) { this.mgr = m; },
	manager: function() { return this.mgr; },

	id: function() {},

		// elementi di contenuto

	title: function() {},
	content: function() {},

		// il tab è in grado di gestire una determinata entità?

	canHandle: function(entity) {},

		// set/get/reset dell'elemento modificato

	setPage: function(entity, data) {},
	getPage: function() {},
	resetPage: function() {},

	setPageList: function(pl, overflow) {

		var
			cur = this.manager().curPage,
			tr = []
		;

		if (overflow)
			tr.push('<tr class=\'overflow\'><td colspan=\'4\'>' + __('jpc.tm') / * Il risultato della ricerca comprende troppi elementi. L\'elenco &egrave; stato limitato ai primi 100 * / + '</td></tr>');

		$.each(pl, function() {

			var cc = this.Entity === cur ? ' class="cur"' : '';

			tr.push(
				'<tr data-desc="' + this.Entity + '"' + cc + '>'
				+ '<td>' + (this.ID ? this.ID : '-') + '</td>'
				+ '<td>' + (this.ShortURL ? this.ShortURL : '') + '</td>'
				+ '<td class=\'t\'>' + this.PageIndexTitle + '</td>'
				+ '<td class=\'t pc-pt\'>' + this.PageTitle + '</td>'
				+ '</tr>'
			);
		});

		var t = $('<table class=\'pagelist table table-condensed table-striped table-bordered table-hover\'><tr><th>ID</th><th>' + __('jpc.thu') / * URL<br />Parlante * / + '</th><th class=\'t\'>' + __('jpc.thti') / * Titolo negli Indici * / + '</th><th class=\'t\'>' + __('jpc.tht') / * Titolo * / + '</th></tr></table>')
			.append(tr.join(''))
		;

		this.st.$('#pagelist')
			.empty()
			.append(t)
		;

			// se trova un'entry selezionata ci si posiziona sopra
			//
			// disabilitato per un problema di scroll del contenuto della pagina

		if (cur !== null) {

//			var se = this.st.$('#pagelist tr[data-desc="' + cur + '"]');
			// if (se.length > 0)
			//	se.get(0).scrollIntoView();
		}
	}
});


// TBD: flexjs
uTemplate = function(t) {

	this.t = t;
};

uTemplate.prototype.translate = function() {

	this.t = this.t.replace(/__\(([A-Za-z.]+)\)/g, function(m, t) {

		return __(t);
	});
};

uTemplate.prototype.get = function(v) {

	var t = this.t;
	if (v)
		t = this.t.replace(/\{([A-Za-z.]+)\}/g, function(m, t) {

			return v[ t ];
		});

	return this.tv = $(t);
};

uTemplate.prototype.$ = function(sel) { return this.tv.find(sel); };

_.pageChooser.tabBLOB = _.pageChooser.tab.extend({

	init: function(pars) {

		this._super(pars);

		this.st = new uTemplate(

			'<div><h3>__(jpc.PEBLOBTitle)</h3>'
			+	'<div class=\'info\'>__(jpc.PEBLOBInfo)</div>'
			+	'<div class=\'row-fluid form-inline filter\'>'
			+		'<input type="text" id="st" size=\'40\' />'
			+		'<button id="filter" class="btn btn-small"><i class="moon-icon-filter"></i> __(jpc.filtra)</button>'
			+		'<button id="all" class="btn btn-small"><i class="moon-icon-loop-2"></i> __(jpc.mtlp)</button>'
			+	'</div>'
			+	'<div id="pagelist" class=\'pagelistcontainer\'></div>'
			+	'</div>'
		);

		this.st.translate();
		// this.st.translate({
		//		'pps.PEBLOBTitle': 'Link ad una pagina interna',
		//		'pps.PEBLOBInfo': 'Per limitare le pagine presenti nell\'elenco sosottostante &egrave; possibile filtrarle in'
		//			+ ' base ad una parola presente nel titolo, oppure digitando il numero pagina, oppure digitando la url parlante:'
		//			+ ' digitare la parola (o parte di essa) nel campo di testo e premere il pulsante \'filtra\'.',
		//		'pps.filtra': 'Filtra',
		//		'pps.mtlp': 'Mostra tutte le Pagine'
		// });
	},

	id: function() { return 'blob'; },
	title: function() { return __('jpc.tblob') / * Pagine Editoriali * /; },
	canHandle: function(entity) { return entity.substr(0, 5) === 'BLOB:'; },

	content: function() {

		var t = this.st.get();

			// installa i gestori per l'interazione

		var me = this;

		this.st.$('input#st')
			.on('focus blur', function(e) {

				var el = $(this);

				if (e.type === 'focus') {

					if (el.val() === '-')
						el.val('');
					else
						el.select();

				} else if (e.type === 'blur' && el.val() === '')
					el.val('-');

				return false;
			})
			.on('keyup', function(e) {

				if (e.keyCode === 13)
					return me.st.$('button#filter').click();
			})
		;

		this.st.$('button#filter').on('click', function() {

			var t = $.trim(me.st.$('input#st').val());
			if (t !== '')
				me.loadPageList(t);
		});

		this.st.$('button#all').on('click', function() {

//			me.st.$('input#st').val('*');
//			me.st.$('button#filter').click();
			me.loadPageList('*');
		});

//		this.st.$('#AdminIndexLinkList').on('click', 'a', function(e) {
		this.st.$('#pagelist').on('click', 'tr', function(e) {

			var
				tr = $(e.target).parents('tr'),
				d = tr.data('desc'),
				t = tr.find('.pc-pt').html()
			;

			if (d) {

				me.selPage = d;
				me.selPageTitle = t;

				me.manager().pageWasSelected();
			}
		});

		return t;
	},

	loadPageList: function(t) {

		var me = this;
		fjs.Ajax.get(['tree', 'chooser', 'list', t], function(data) {

			if (data.status === 'ok') {

					// evidenzia il testo ricercato all'interno dei titoli
					// delle pagine

				if (t !== '*' && t !== '-') {

					var r = new RegExp(t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), 'gi'), rp = '<b>' + t + '</b>';

					$.each(data.info, function(k, v) {
						v.PageTitle = v.PageTitle.replace(r, rp);
						v.PageIndexTitle = v.PageIndexTitle.replace(r, rp);
					});
				}

				me.setPageList(
					data.info,
					data.overflow
				);
			}
		});
	},

	setPage: function(entity, data) {

		this.resetPage();

		this.selPage = entity;

			// imposto la pagina richiedendo i dati via ajax

		var me = this;
		fjs.Ajax.get(['tree', 'chooser', 'info', entity], function(data) {

			if (data.status === 'ok') {

				me.setPageList([data.info]);
			}
		});
	},

	getPage: function() {

		return {
			entity: this.selPage,
			title: this.selPageTitle,
			data: null
		};
	},

	resetPage: function() {

		this.st.$('#pagelist')
			.empty()
		;

		this.st.$('input#st').val('-');

		this.selPage = null;
		this.selPageTitle = null;
	}
});

_.pageChooser.tabFixed = _.pageChooser.tab.extend({

	init: function(pars) {

		this._super(pars);

		this.st = new uTemplate(

			'<div><h3>__(jpc.ft)</h3>'
			+	'<div class=\'info\'>__(jpc.fi)</div>'
			+	'<div id="pagelist" class=\'pagelistcontainer\'></div>'
			+	'</div>'
		);

		this.st.translate();
		//		'pps.PEClassTitle': 'Link ad una pagina Applicativa (Fixed)',
		//		'pps.PEClassInfo': 'Seleziona la pagina desiderata dall\'elenco sottostante'
		// });
	},

	id: function() { return 'php'; },
	title: function() { return __('jpc.tfixed') / * Pagine Applicative * /; },
	canHandle: function(entity) { return entity.substr(0, 4) === 'PHP:'; },

	content: function() {

		var t = this.st.get(), me = this;

		fjs.Ajax.get(['tree', 'chooser', 'fixed'], function(data) {

			if (data.status === 'ok') {

				me.setPageList(data.info);
			}
		});

		this.st.$('#pagelist').on('click', 'tr', function(e) {

			var
				tr = $(e.target).parents('tr'),
				d = tr.data('desc'),
				t = tr.find('.pc-pt').html()
			;

			if (d) {

				me.selPage = d;
				me.selPageTitle = t;

				me.manager().pageWasSelected();
			}

			// var d = $(e.target).parent('tr').data('desc');
			// if (d) {

			//	me.selPage = d;

			//	me.manager().pageWasSelected();
			// }
		});

		return t;
	},

	setPage: function(entity, data) {

		this.resetPage();

		this.st.$('#pagelist tr[data-desc="' + entity + '"]')
			.addClass('cur')
		;

		this.selPage = entity;
		this.selPageTitle = null;
	},

	getPage: function() {

		return {
			entity: this.selPage,
			title: this.selPageTitle,
			data: null
		};
	},

	resetPage: function() {

		this.st.$('#pagelist .cur')
			.removeClass('cur')
		;

		this.selPage = null;
	}

});

_.pageChooser.tabHTML = _.pageChooser.tab.extend({

	init: function(pars) {

		this._super(pars);

		this.st = new uTemplate(

			'<div><h3>__(jpc.ht)</h3>'
			+	'<div class=\'info\'>__(jpc.hi)</div>'
			+	'<div id="pagelist" class=\'pagelistcontainer\'></div>'
			+	'</div>'
		);

		this.st.translate();
		//		'pps.PEClassTitle': 'Link ad una pagina HTML',
		//		'pps.PEClassInfo': 'Seleziona la pagina desiderata dall\'elenco sottostante'
		// });
	},

	id: function() { return 'html'; },
	title: function() { return __('jpc.thtml') / * Documenti HTML * /; },
	canHandle: function(entity) { return entity.substr(0, 5) === 'HTML:'; },

	content: function() {

		var t = this.st.get(), me = this;

		fjs.Ajax.get(['tree', 'chooser', 'html'], function(data) {

			if (data.status === 'ok') {

				me.setPageList(data.info);
			}
		});

		this.st.$('#pagelist').on('click', 'tr', function(e) {

			var
				tr = $(e.target).parents('tr'),
				d = tr.data('desc'),
				t = tr.find('.pc-pt').html()
			;

			if (d) {

				me.selPage = d;
				me.selPageTitle = t;

				me.manager().pageWasSelected();
			}

			// var d = $(e.target).parent('tr').data('desc');
			// if (d) {

			//	me.selPage = d;

			//	me.manager().pageWasSelected();
			// }
		});

		return t;
	},

	setPage: function(entity, data) {

		this.resetPage();

		this.st.$('#pagelist tr[data-desc="' + entity + '"]')
			.addClass('cur')
		;

		this.selPage = entity;
	},

	getPage: function() {

		return {
			entity: this.selPage,
			title: this.selPageTitle,
			data: null
		};
	},

	resetPage: function() {

		this.st.$('#pagelist .cur')
			.removeClass('cur')
		;

		this.selPage = null;
		this.selPageTitle = null;
	}
});

_.pageChooser.tabEx = _.pageChooser.tab.extend({

	init: function(pars) {

		this._super(pars);

		this.st = new uTemplate(

			'<div><h3>__(jpc.et)</h3>'
			+	'<div class=\'info\'>__(jpc.ei)</div>'
			+	'<div id="pagelist" class=\'pagelistcontainer\'></div>'
			+	'</div>'
		);

		this.st.translate();
		//		'pps.PEClassTitle': 'Link ad una pagina (ex)',
		//		'pps.PEClassInfo': 'Seleziona la pagina desiderata dall\'elenco sottostante'
		// });
	},

	id: function() { return 'ex'; },
	title: function() { return __('jpc.tex') / * Special * / ; },
	canHandle: function(entity) { return entity.substr(0, 3).toUpperCase() === 'EX:'; },

	content: function() {

		var t = this.st.get(), me = this;

		fjs.Ajax.get(['tree', 'chooser', 'ex'], function(data) {

			if (data.status === 'ok') {

				me.setPageList(data.info);
			}
		});

		this.st.$('#pagelist').on('click', 'tr', function(e) {

			var
				tr = $(e.target).parents('tr'),
				d = tr.data('desc'),
				t = tr.find('.pc-pt').html()
			;

			if (d) {

				me.selPage = d;
				me.selPageTitle = t;

				me.manager().pageWasSelected();
			}

			// var d = $(e.target).parent('tr').data('desc');
			// if (d) {

			//	me.selPage = d;

			//	me.manager().pageWasSelected();
			// }
		});

		return t;
	},

	setPage: function(entity, data) {

		this.resetPage();

		// entity ha il tipo in maiuscolo, mentre

		// var es = entity.split(':');
		// es[0] = es[0].toLowerCase();
		// entity = es.join(':');

		this.st.$('#pagelist tr[data-desc="' + entity + '"]')
			.addClass('cur')
		;

		this.selPage = entity;
	},

	getPage: function() {

		return {
			entity: this.selPage,
			title: this.selPagtitle,
			data: null
		};
	},

	resetPage: function() {

		this.st.$('#pagelist .cur')
			.removeClass('cur')
		;

		this.selPage = null;
		this.selPageTitle = null;
	}
});

_.pageChooser.tabHTTP = _.pageChooser.tab.extend({

	init: function(pars) {

		this._super(pars);

		this.st = new uTemplate(

			'<div><h3>__(jpc.xt)</h3>'
			+	'<div class=\'info\'>__(jpc.xi)</div>'
			+	'<div class=\'row-fluid\'><div class=\'span12\'><input type=\'text\' id=\'http\' class=\'span12\' /></div></div>'
			+	'</div>'
		);

		this.st.translate();
		//		'pps.PEClassTitle': 'Link ad una pagina Esterna',
		//		'pps.PEClassInfo': 'Inserisci l\'indirizzo'
		// });
	},

	id: function() { return 'http'; },
	title: function() { return __('jpc.thttp') / * Collegamenti * /; },
	canHandle: function(entity) { return true; }, // TBD

	content: function() {

		var t = this.st.get(), me = this;
		return t;
	},

	setPage: function(entity, data) {

		this.resetPage();

		this.st.$('#http').val(entity);

//console.log('setPage', entity, data);
		this.selPage = entity;
	},

	getPage: function() {

		this.selPage = this.st.$('#http').val();

		return {
			entity: this.selPage,
			title: this.selPage,
			data: null
		};
	},

	resetPage: function() {

		this.st.$('#http').val('');

		this.selPage = null;
	}
});
*/

})(fjs.ui);
