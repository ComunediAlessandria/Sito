fjs.ui = fjs.ui || {};

(function(_) {

_.pageChooser = function(opt) {

	var me = this;
	opt = $.extend({

		buttons: {
			cancel: __('jpc.can') /* Annulla */,
			ok: __('jpc.ok') /* OK */
		},

		title: __('jpc.tt'),
		text: [],

			// pannelli da visualizzare

		panes: ['blob', 'fixed', 'ex', 'html' /* , 'http' */],

			// opzione per la scelta del gruppo

		showGroupChooser: false,

		showHTTPTitle: false, // TBD: non deve stare qui

			// eventi per l'esterno

		onButtonPressed: function(btn) {

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

		useBootstrap: false

	}, opt);

	_.modalDialogWithButtons.call(this, opt);

	this.pageKinds = {
		blob: 'tabBLOB',
		fixed: 'tabFixed',
		html: 'tabHTML',
		ex: 'tabEx',
		http: 'tabHTTP'
	};

	var panes = [];
	$.each(opt.panes, function(k, v) { panes.push(new _.pageChooser[ me.pageKinds[v] ](opt)); });

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

	// statiche per la gestione dei singleton

_.pageChooser.il = {}; // instances
_.pageChooser.addInstance = function(key, i) { _.pageChooser.il[key] = i; };
_.pageChooser.getInstance = function(key) { return _.pageChooser.il[key]; };

_.pageChooser.prototype = new _.modalDialogWithButtons();

_.pageChooser.prototype.buildTextContent = function() {

	/*jslint laxbreak: true */
	var cnt = this.opt.useBootstrap
		? $('<div class="modal-body ui pagechooser content" />').css({ 'max-height': '10000px' })
		: $('<div class="ui pagechooser content" />')
	;

	if (this.opt.showGroupChooser) {

		this.groupControl = this.buildGroupsDropdown();

		cnt.append(
			$('<label for="owner">' + __('jpc.og') /* Gruppo Proprietario */ + ': </label>')
				.append(this.groupControl)
		);
	}

	cnt
		.append(this.tabManager.getCommand())
		.append(this.tabManager.getContent())
	;

	return cnt;
};

/*
_.pageChooser.prototype.buildHelper = function() {

	if (this.opt.useBootstrap)
		this.helper = $('<div />')
			.addClass('modal')
			.css({
				position: 'fixed',
				zIndex: 5000,
				display: 'none',

				marginLeft: 'auto',

				width: this.opt.width
			})
		;
	else
		_.modalDialogWithButtons.prototype.buildHelper.call(this);
};

_.pageChooser.prototype.buildTitle = function() {

	/ *jslint laxbreak: true * /
	return this.opt.useBootstrap
		? $('<div class="modal-header"><h3>' + this.opt.title + '</h3></div>')
		: _.modalDialogWithButtons.prototype.buildTitle.call(this)
	;
};

_.pageChooser.prototype.buildButtonRow = function() {

	if (! this.opt.useBootstrap)
		return _.modalDialogWithButtons.prototype.buildButtonRow.call(this);

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

	return btn;
};
*/

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

		var found = false, me = this;
		$.each(this.tabs, function(k, v) {

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
		it = {}		// content
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
		this.opt = pars;
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

		// commodity
/*
	_setPageList: function(pl, overflow) {

		var cur = this.manager().curPage;

		var li = [];
		if (overflow)
			li.push('<li class=\'overflow\'>Il risultato della ricerca comprende troppi elementi. L\'elenco &egrave; stato limitato ai primi 100.</li>');

		$.each(pl, function() {

			var cc = this.Entity === cur ? ' class="cur"' : '';

			li.push('<li' + cc + '><a href="#" data-desc="' + this.Entity + '">' + this.PageIndexTitle + '</a></li>');
		});

		var ul = $('<ul id="PageList"></ul>')
			.append(li.join(''))
		;

		this.st.$('#pagelist')
			.empty()
			.append(ul)
		;
	},
*/
	setPageList: function(pl, overflow) {

		var
			cur = this.manager().curPage,
			tr = []
		;

		if (overflow)
			tr.push('<tr class=\'overflow\'><td colspan=\'4\'>' + __('jpc.tm') /* Il risultato della ricerca comprende troppi elementi. L\'elenco &egrave; stato limitato ai primi 100 */ + '</td></tr>');

		$.each(pl, function() {

			var cc = this.Entity === cur ? ' class="cur"' : '';

			/*jshint laxbreak:true */
			tr.push(
				'<tr data-desc="' + this.Entity + '"' + cc + '>'
				+ '<td>' + (this.ID ? this.ID : '-') + '</td>'
				+ '<td>' + (this.ShortURL ? this.ShortURL : '') + '</td>'
				+ '<td class=\'t\'>' + this.PageIndexTitle + '</td>'
				+ '<td class=\'t pc-pt\'>' + this.PageTitle + '</td>'
				+ '</tr>'
			);
		});

		var t = $('<table class=\'pagelist table table-condensed table-striped table-bordered table-hover\'><tr><th>ID</th><th>' + __('jpc.thu') /* URL<br />Parlante */ + '</th><th class=\'t\'>' + __('jpc.thti') /* Titolo negli Indici */ + '</th><th class=\'t\'>' + __('jpc.tht') /* Titolo */ + '</th></tr></table>')
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
window.uTemplate = function(t) {

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

	/*jslint boss: true */
	return this.tv = $(t);
};

uTemplate.prototype.$ = function(sel) { return this.tv.find(sel); };

_.pageChooser.tabBLOB = _.pageChooser.tab.extend({

	init: function(pars) {

		this._super(pars);

		/*jshint laxbreak:true */
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
	},

	id: function() { return 'blob'; },
	title: function() { return __('jpc.tblob') /* Pagine Editoriali */; },
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

		/*jshint laxbreak:true */
		this.st = new uTemplate(

			'<div><h3>__(jpc.ft)</h3>'
			+	'<div class=\'info\'>__(jpc.fi)</div>'
			+	'<div id="pagelist" class=\'pagelistcontainer\'></div>'
			+	'</div>'
		);

		this.st.translate();
	},

	id: function() { return 'php'; },
	title: function() { return __('jpc.tfixed') /* Pagine Applicative */; },
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

		/*jshint laxbreak:true */
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
	title: function() { return __('jpc.thtml') /* Documenti HTML */; },
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

		/*jshint laxbreak:true */
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
	title: function() { return __('jpc.tex') /* Special */; },
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

		var tpl = '<h3>__(jpc.xt)</h3>'
			+	'<div class=\'info\'>__(jpc.xi)</div>'
			+	'<div class=\'row-fluid\'><div class=\'span12\'><input type=\'text\' id=\'http\' class=\'span12\' /></div></div>'
		;

		if (this.opt.showHTTPTitle) {

			this.ll = window.fxLanguages; // TBD: definita dalle inclusioni

			tpl += '<h3>__(jpc.xtt)</h3>';

			$.each(this.ll, function() {

				tpl += '<div class=\'row-fluid\'>'
					+ '<div class="input-prepend span8"><span class="add-on">' + this + '</span><input type=\'text\' id=\'http-title-' + this + '\' class=\'span12\' /></div>'
					+ '</div>'
				;
			});
		}

		tpl= '<div>'
			+ tpl
			+ '</div>'
		;

		this.st = new uTemplate(tpl);

		this.st.translate();
		//		'pps.PEClassTitle': 'Link ad una pagina Esterna',
		//		'pps.PEClassInfo': 'Inserisci l\'indirizzo'
		// });
	},

	id: function() { return 'http'; },
	title: function() { return __('jpc.thttp') /* Collegamenti */; },
	canHandle: function(entity) { return true; }, // TBD

	content: function() {

		return this.st.get();
	},

	setPage: function(entity, data) {

		this.resetPage();

		this.st.$('#http').val(entity);

		if (this.opt.showHTTPTitle) {

			var title = data.title, st = this.st;
			$.each(this.ll, function() {

				st.$('#http-title-' + this).val(title[this]);
			});
		}

//console.log('setPage', entity, data);
		this.selPage = entity;
	},

	getPage: function() {

		this.selPage = this.st.$('#http').val();

		var title = {};
		if (this.opt.showHTTPTitle) {

			var st = this.st;
			$.each(this.ll, function() {

				title[this] = st.$('#http-title-' + this).val()
			});
		}

		return {
			entity: this.selPage,
			title: this.selPage,
			data: {
				title: title
			}
		};
	},

	resetPage: function() {

		this.st.$('#http').val('');

		this.selPage = null;
	}
});

})(fjs.ui);
