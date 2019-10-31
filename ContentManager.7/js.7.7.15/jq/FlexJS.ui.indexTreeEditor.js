FlexJS.ui = FlexJS.ui || {};

	// http://wwwendt.de/tech/dynatree/doc/dynatree-doc.html

(function(_) {

_.indexTreeEditorManager = function(tk, t, opt) {

	this.token = tk;
	this.trees = t;

	this.opt = jQuery.extend({

		redirectOnExit: null,
		pageEditTemplate: null,

		ctrlSave: false,
		ctrlCancel: false,

			// temporaneo (cfr. anche indexTreeEditor)

		useBootstrap: false

	}, opt);

	var me = this;
	$.each(this.trees, function(k, v) { v.setManager(me); });

	if (this.opt.ctrlSave)
		$(this.opt.ctrlSave).click(FlexJS.proxy(this.onCtrlSave, this));

	if (this.opt.ctrlCancel)
		$(this.opt.ctrlCancel).click(FlexJS.proxy(this.onCtrlCancel, this));

		// alert per l'abbandono della pagina

	this.shouldSave = false;

	window.onbeforeunload = function() {

		if (me.shouldSave)
			return __('ite.ab'); /* Abbandonando la pagina le modifiche verranno perse. Si desidera continuare? */
	};

		// inizializza il popover di informazioni

	var ppb = FlexJS.proxy(this.onPopButton, this);

	/*jshint laxbreak:true */
	this.pop = new FlexJS.ui.sharedPopover({

		'class': 'ui pageinfo',
		placement: 'bottom',
		relative: 'left',
//		onClick: function(e) { console.log(e); },

		width: 800,

		title: '<button type="button" class="close" data-popover="hide"><i class="icon-remove-sign"></i></button><span class="title"></span>' /*+ node.data.title*/,
		content: '<div class="pageinfo"></div>',
			// + '<div class=\'modal-footer\'>'
			// + ' <button class="btn btn-mini edit" data-op="edit"><i class="icon-edit"></i>&nbsp;' + __('ite.mod') /* Modifica */ + '</button>'
			// + ' <button class="btn btn-mini del" data-op="del"><i class="icon-trash"></i>&nbsp;' + __('ite.del') /* Elimina */ + '</button>'
			// + ' <button class="btn btn-mini add" data-op="add"><i class="icon-plus"></i>&nbsp;' + __('ite.add') /* Aggiungi Nodo */ + '</button>'
			// + ' <button class="btn btn-mini pedit" data-op="pedit"><i class="icon-pencil"></i>&nbsp;' + __('ite.edit') /* Modifica Pagina */ + '</button>'
			// + '</div>',

		footer: ' <button class="btn btn-small edit" data-op="edit"><i class="icon-edit"></i>&nbsp;' + __('ite.mod') /* Modifica */ + '</button>'
			+ ' <button class="btn btn-small del" data-op="del"><i class="icon-trash"></i>&nbsp;' + __('ite.del') /* Elimina */ + '</button>'
			+ ' <button class="btn btn-small add" data-op="add"><i class="icon-plus"></i>&nbsp;' + __('ite.add') /* Aggiungi Nodo */ + '</button>'
			+ ' <button class="btn btn-small pedit" data-op="pedit"><i class="icon-pencil"></i>&nbsp;' + __('ite.edit') /* Modifica Pagina */ + '</button>',

		placeholders: {
			title: '.title',
//			pageTitle: '.pageTitle'
			content: '.pageinfo'
		},

		handlers: {
			'button.edit': ppb,
			'button.del': ppb,
			'button.add': ppb,
			'button.pedit': ppb
		}
	});
};

	// proxy per la gestione del popover

_.indexTreeEditorManager.prototype.popOpen = function(w, p, cb) {

	this.popCB = cb;
	this.pop.pop(w, p);
};

_.indexTreeEditorManager.prototype.popDismiss = function() {

	this.pop.dismiss();
	this.popCB = null;
};

_.indexTreeEditorManager.prototype.onPopButton = function(e) {

	if (this.popCB !== null)
		this.popCB($(e.target).data('op'));
};

	// salvataggio

_.indexTreeEditorManager.prototype.treeWasModified = function() { this.shouldSave = true; };
_.indexTreeEditorManager.prototype.shouldSaveChanges = function() { return this.shouldSave; };

_.indexTreeEditorManager.prototype.onCtrlSave = function() {

	var me = this;
	this.saveChanges(function() {

		window.location = me.opt.redirectOnExit;
	});
};

_.indexTreeEditorManager.prototype.saveChanges = function(cb) {

	if (! this.shouldSave) {

		cb();

		return;
	}

	var me = this;

	var b = new FlexJS.ui.notificationBubble({
		title: __('ite.sw-tt') /* Operazione in corso */,
		text: __('ite.sw-tx') /* Registrazione delle modifiche */,
		duration: 0,
		onDismiss: cb
	});

	FlexJS.Ajax.post('tree/op', {
		token: this.token,
		op: 'save'
	}, function(data) {

		if (data.status === 'ok') {

			me.shouldSave = false;

			b
				.setTitle(__('ite.sc-tt') /* Operazione conclusa */)
				.setText(__('ite.sc-tx') /* Le modifiche sono state registrate */)
				.dismissIn(1000)
			;

		} else if (data.status === 'error') {

			b
				.setStatus('error')
				.setTitle('Errore')
				.setText(data.message)
			;
		}
	});
};

_.indexTreeEditorManager.prototype.onCtrlCancel = function() {

	var me = this;

		// dialog per conferma

	var d = new FlexJS.ui.modalDialogWithButtons({

		buttons: {
			cancel: __('ite.dc-cancel') /* Riprendi */,
			ok: __('ite.dc-ok') /* Annulla Modifiche */
		},

		title: __('ite.dc-tt') /* Annullamento Modifiche */,
		text: {
			main: __('ite.dc-tx') /* Si desidera annullare le modifiche effettuate all\'indice? */,
			note: __('ite.dc-tn') /* Le modifiche effettuate all\'indice non saranno registrate. */
		},

		onButtonPressed: function(btn) {

			d.dismiss();

			if (btn === 'ok') {

					// disabilita il warning sull'abbandono della pagina

				me.shouldSave = false;

				window.location = me.opt.redirectOnExit;
			}
		},

		useBootstrap: this.opt.useBootstrap
	});

	d.show();
};

_.indexTreeEditorManager.prototype.editPage = function(pagedesc) {

	// TBD: hardcoded

	var
		id = pagedesc.split('=')[1],
		url = this.opt.pageEditTemplate.replace('{page-id}', id)
	;

	window.location = url;
};

	// editor per ogni tree

_.indexTreeEditor = function(el, id, token, opt) {

	this.el = $(el);

	this.id = id;
	this.token = token;
	this.opt = $.extend({

			// temporaneo (cfr. anche indexTreeEditor)

		useBootstrap: false

	}, opt);

	this.attach();
};

_.indexTreeEditor.prototype.setManager = function(m) { this.manager = m; };

_.indexTreeEditor.prototype.attach = function() {

	var me = this;
	this.el.dynatree({

		debugLevel: 0,

		onLazyRead: FlexJS.proxy(this.onLazyRead, this),
		onClick: FlexJS.proxy(this.onNodeClick, this),

		dnd: {
			onDragStart: function(node) {

				me.manager.popDismiss();

					// This function MUST be defined to enable dragging for the tree.
					// Return false to cancel dragging of node.

				if (node.data.unselectable)
					return false;

//				console.log("tree.onDragStart(%o)", node);

				return true;
			},

			onDragStop: function(node) {

					// This function is optional.

//				console.log("tree.onDragStop(%o)", node);
			},

			autoExpandMS: 500,
			preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.

			onDragEnter: function(node, sourceNode) {

					/** sourceNode may be null for non-dynatree droppables.
					*  Return false to disallow dropping on node. In this case
					*  onDragOver and onDragLeave are not called.
					*  Return 'over', 'before, or 'after' to force a hitMode.
					*  Return ['before', 'after'] to restrict available hitModes.
					*  Any other return value will calc the hitMode from the cursor position.
					*/

				if (node.data.unselectable)
					return false;

//				console.log("tree.onDragEnter(%o, %o)", node, sourceNode);

				return true;
			},

			onDragOver: function(node, sourceNode, hitMode) {

					// Return false to disallow dropping this node.

//				console.log("tree.onDragOver(%o, %o, %o)", node, sourceNode, hitMode);

					// Prevent dropping a parent below it's own child

				if (node.isDescendantOf(sourceNode)) {

					return false;
				}
/*
					// Prohibit creating childs in non-folders (only sorting allowed)

				if( ! node.data.isFolder && hitMode === 'over' ) {

					return 'after';
				}
*/
			},

			onDrop: function(node, sourceNode, hitMode, ui, draggable) {

					// This function MUST be defined to enable dropping of items on
					// the tree.

//				console.log("tree.onDrop(%o, %o, %s)", node, sourceNode, hitMode);

// status del nodo

				me.onMove(sourceNode, node, hitMode);
			},

			onDragLeave: function(node, sourceNode) {

					// Always called if onDragEnter was called.

//				console.log("tree.onDragLeave(%o, %o)", node, sourceNode);
			}
		}

	});

	this.tree = this.el.dynatree('getTree');

	this.tree.flexTreeEditor = this;

	this.root = this.el.dynatree('getRoot');
	this.root.data.key = -1;

		// caricamento iniziale

	this.loadSubtreeOfNode(this.root);

		// ultimo nodo selezionato

	this.popKey = null;

		// il chooser per le pagine (TBD: load on demand)

	this.chooser = new FlexJS.ui.pageChooser({

		title: __('ite.pc-tt') /* Modifica voce di Indice */,
//		text: [ '<div style="text-align: center;">Loading ...</div>'],

		panes: ['blob', 'fixed', 'ex', 'html', 'http'],

		showGroupChooser: true,

		// TBD: non deve stare qui
		showHTTPTitle: true,

		buttons: {
			cancel: __('ite.pc-cancel') /* Annulla */,
			ok: __('ite.pc-ok') /* Registra */
		},

		onPageSelected: FlexJS.proxy(this.onPageSelectedInChooser, this),

			// temporaneo

		useBootstrap: this.opt.useBootstrap
	});

		// handling degli elementi esterni per l'interazione
		// col tree

	this.ctrlEls = $();

	if (this.opt.ctrlExpand) {

		$(this.opt.ctrlExpand).click(FlexJS.proxy(this.onCtrlExpand, this));
		this.ctrlEls.add(this.opt.ctrlExpand);
	}

	if (this.opt.ctrlAdd) {

		$(this.opt.ctrlAdd).click(FlexJS.proxy(this.onCtrlAdd, this));
		this.ctrlEls.add(this.opt.ctrlAdd);
	}
};

_.indexTreeEditor.prototype.onLazyRead = function(node) {

	this.loadSubtreeOfNode(node);
};

_.indexTreeEditor.prototype.onNodeClick = function(node, e) {

	var t = node.getEventTargetType(e);

	if (t === 'expander')
		this.manager.popDismiss();

	if (t !== 'title' && t !== 'icon')
		return;

	if (node.data.unselectable)
		return false;

	var
		span = $(node.li).find('span'),
		p = span.position()
	;

	this.popKey = node.data.key;

		// abilita il pulsante di cancellazione solo se
		// questo non è l'ultimo nodo rimasto

	this.manager.pop.$('button.del').attr('disabled', node.isChildOf(this.root) && this.root.countChildren() === 1);

	var me = this;

	me.manager.pop.$('.pageinfo')
		.empty()
		.css({
			position: 'relative' // per lo spinner
//			width: 400,
//			height: 200,
		})
	;

	setTimeout(function() {

		var t = node.data.title;
		if (node.data.id)
			t += ' (' + node.data.id + ')';

		me.manager.popOpen({

				top: p.top + span.height(),
				left: p.left + span.width() / 2

			}, {

				title: t //,
//				pageTitle: node.data.pagetitle,
//				content: 'Contenuto'
			},
			FlexJS.proxy(me.onPopoverButton, me)
		);

		var spinner = new Spinner({
			top: 'auto',
			left: 'auto'
		}).spin(me.manager.pop.$('.pageinfo').get(0));

			FlexJS.Ajax.post('tree/info', {
				id: me.id,
				token: me.token,
				node: me.popKey
			}, function(data) {

				spinner.stop();

				if (data.status === 'ok') {

					me.manager.pop.$('.pageinfo').html(data.info);

						// verifica lo stato di abilitazione dei bottoni
						// TBD: gestione flessibile e non hard coded

					me.manager.pop.$('button.pedit')[ data.bedit ? 'show' : 'hide' ]();

				} else if (data.status === 'error') {

					me.manager.pop.$('.pageinfo').html('There was an error lodaing data.');
				}

				me.manager.pop.reposition();
			});

	}, 10);
};

_.indexTreeEditor.prototype.onPopoverButton = function(op) {

	switch (op) {
		case 'edit': this.onPopoverEdit(); break;
		case 'del': this.onPopoverDelete(); break;
		case 'add': this.onPopoverAdd(); break;
		case 'pedit': this.onPopoverPageEdit(); break;
	}
};

_.indexTreeEditor.prototype.onPopoverEdit = function() {

	this.manager.popDismiss();

	var
		node = this.tree.getNodeByKey(this.popKey),
		e = node.data.entity
	;

	if (e === '')
		this.chooser.chooseNewPage();
	else
		this.chooser.choosePage({
			entity: e,
			owner: node.data.owner,
			data: node.data.data
		});
};

_.indexTreeEditor.prototype.onPopoverPageEdit = function() {

	this.manager.popDismiss();

	var
		node = this.tree.getNodeByKey(this.popKey),
		me = this
	;

	if (this.manager.shouldSaveChanges()) {

		this.confirmOperation(
			__('ite.pe-tt') /* Modifica della Pagina */,
			{
				main: __('ite.pe-tx') /* Verr&agrave; salvato l\'indice. Continuare? */,
				note: __('ite.pe-tn') /* La modifica della pagina richiede la registrazione delle eventuli modifiche all\'indice. */
			},
			function() {

				me.manager.saveChanges(function() {

					me.manager.editPage(node.data.entity);
				});
			}
		);

	} else
		me.manager.editPage(node.data.entity);
};

_.indexTreeEditor.prototype.onPopoverDelete = function() {

	this.manager.popDismiss();

	var me = this;

	this.confirmOperation(
		__('ite.id-tt') /* Eliminazione elemento dall\'indice */,
		{
			main: __('ite.id-tx') /* Confermi l\'eliminazione dell\'elemento dall\'indice? */,
			note: __('ite.id-tn') /* L\'eliminazione del nodo elimina la voce nell\'indice ma non elimina la pagina associata al nodo stesso. Eliminando un nodo che ha altri nodi figli, anche questi saranno eliminati. */
		},
		function() {

			var b = new FlexJS.ui.notificationBubble({
				title: __('ite.nd-tt') /* Operazione in corso */,
				text: __('ite.nd-tx') /* Eliminazione del nodo */,
				duration: 0
			});

				// elimina il riferimento al nodo selezionato

			var key = me.popKey;
			me.popKey = null;

			FlexJS.Ajax.post('tree/op', {
				id: me.id,
				token: me.token,
				op: 'del',
				node: key
			}, function(data) {

				if (data.status === 'ok') {

					var node = me.tree.getNodeByKey(key);

					node.remove();

					me.manager.treeWasModified();

					b
						.setTitle(__('ite.ne-tt') /* Operazione conclusa */)
						.setText(__('ite.ne-tx') /* Il nodo &egrave; stato eliminato. */)
						.dismissIn(1000)
					;

				} else if (data.status === 'error') {

					b
						.setStatus('error')
						.setTitle('Errore')
						.setText(data.message)
					;
				}
			});
		}
	);
};

	// dialog per conferma di un'operazione generica
	//
	// la callback viene invocata solamente sull'ok

_.indexTreeEditor.prototype.confirmOperation = function(title, text, cb) {

	var
		me = this,
		d = new FlexJS.ui.modalDialogWithButtons({

			buttons: {
				cancel: __('ite.nd-can') /* Annulla */,
				ok: __('ite.nd-ok') /* OK */
			},

			title: title,
			text: text,

			onButtonPressed: function(btn) {

				if (btn === 'ok')
					cb(btn);

				d.dismiss();
			},

			useBootstrap: this.opt.useBootstrap
		})
	;

	d.show();
};

_.indexTreeEditor.prototype.onPopoverAdd = function() {

	this.manager.popDismiss();

	var node = this.tree.getNodeByKey(this.popKey);

	this.addNode(node);
};

_.indexTreeEditor.prototype.addNode = function(node) {

	var
		me = this,
		b = new FlexJS.ui.notificationBubble({
			title: __('ite.na-tt') /* Operazione in corso */,
			text: __('ite.na-tx') /* Aggiunta nuovo nodo */,
			duration: 0
		})
	;

	FlexJS.Ajax.post('tree/op', {
		id: this.id,
		token: this.token,
		op: 'add',
		node: node.data.key
	}, function(data) {

		if (data.status === 'ok') {

			if (node.data.key == -1) {

				node.addChild(data.node);

			} else {

					// siccome dynatree non prevede l'aggiunta di un nodo
					// *dopo* un nodo specificato, trovo il next sibling
					// del nodo in questione e aggiungo prima di questo se
					// esiste

				var
					s = node.getNextSibling(),
					p = node.getParent()
				;

				if (s === null) {

					p.addChild(data.node);

				} else
					p.addChild(data.node, s);
			}

			me.manager.treeWasModified();

			b
				.setTitle(__('ite.nt-tt') /* Operazione conclusa */)
				.setText(__('ite.nt-tx') /* Il nodo &egrave; stato aggiunto. */)
				.dismissIn(1000)
			;

		} else if (data.status === 'error') {

			b
				.setStatus('error')
				.setTitle('Errore')
				.setText(data.message)
			;
		}
	});
};

_.indexTreeEditor.prototype.onPageSelectedInChooser = function(page) {

	// { entity: "BLOB:ID=2896", data: null, owner: "1" }

	var b = new FlexJS.ui.notificationBubble({
		title: __('ite.nm-tt') /* Operazione in corso */,
		text: __('ite.nm-tx') /* Modifica voce di indice. */,
		duration: 0
	});

	var
		node = this.tree.getNodeByKey(this.popKey),
		me = this
	;

	FlexJS.Ajax.post('tree/op', {
		id: this.id,
		token: this.token,
		op: 'edit',
		node: this.popKey,
		data: page
	}, function(data) {

		if (data.status === 'ok') {

			node.data.entity = page.entity;
			node.data.data = page.data;
			node.data.owner = page.owner;

			var l = fjs.AppConfigure.Get('lang')

//			node.setTitle(data.node.data.title[l]);
			node.setTitle(data.node.title);

			me.manager.treeWasModified();

			b
				.setTitle(__('ite.nu-tt') /* Operazione conclusa */)
				.setText(__('ite.nu-tx') /* La voce di indice &egrave; stata modificata. */)
				.dismissIn(1000)
			;

		} else if (data.status === 'error') {

			b
				.setStatus('error')
				.setTitle('Errore')
				.setText(data.message)
			;
		}
	});
};

	// abilitazione/disabilitazione dei controlli

_.indexTreeEditor.prototype.enableControls = function() {

	this.ctrlEls.attr('disabled', false);
};

_.indexTreeEditor.prototype.disableControls = function() {

	this.ctrlEls.attr('disabled', true);
};

_.indexTreeEditor.prototype.onCtrlExpand = function() {

	this.manager.popDismiss();
	this.disableControls();

	this.el.dynatree('getRoot').visit(function(node) {

		node.expand(true);
	});
};

_.indexTreeEditor.prototype.onCtrlAdd = function() {

	this.manager.popDismiss();
	this.disableControls();

		// se ho un nodo selezionato lo aggiunge a quello,
		// altrimenti alla radice

	if (this.popKey === null)
		this.addNode(this.root);
	else {

		var node = this.tree.getNodeByKey(this.popKey);

		this.addNode(node);
	}
};

_.indexTreeEditor.prototype.loadSubtreeOfNode = function(node, cb) {

	node.setLazyNodeStatus(DTNodeStatus_Loading);

	var me = this;
	FlexJS.Ajax.post('tree/op', {
		id: this.id,
		token: this.token,
		op: 'load',
		node: node.data.key
	}, function(data) {

		if (data.status === 'ok') {

			node.setLazyNodeStatus(DTNodeStatus_Ok);

			var items = data.items;
			node.addChild(items);

			me.enableControls();

		} else if (data.status === 'error') {

			node.setLazyNodeStatus(DTNodeStatus_Error);

			var b = new FlexJS.ui.notificationBubble({
				title: 'Error',
				text: data.message,

				status: 'error',
				duration: 0
			});
		}

		node.data.isLoaded = true;

		if (cb)
			cb();
	});
};

_.indexTreeEditor.prototype.onMove = function(srcNode, dstNode, hitMode) {

	var me = this;

//console.log(dstNode.data.isLazy, dstNode.bExpanded); return;
	if (dstNode.data.isLazy && ! dstNode.bExpanded && ! dstNode.data.isLoaded) {

		this.loadSubtreeOfNode(dstNode, function() {

			me.onMove(srcNode, dstNode, hitMode);
		});

		return;
	}

	var b = new FlexJS.ui.notificationBubble({
		title: __('ite.nv-tt') /* Operazione in corso */,
		text: __('ite.nv-tx') /* Spostamento del nodo dell\'indice */,
		duration: 0
	});

	this.disableControls();

		// node: nodo su cui viene fatto il drop
		// srcNode: nodo che viene trascinato

//	console.log('dropped %s on %s (%s)', srcNode.data.title, dstNode.data.title, hitMode);
	// expand the drop target
	//        sourceNode.expand(true);

	FlexJS.Ajax.post('tree/op', {
		id: this.id,
		token: this.token,
		op: 'move',
		src: srcNode.data.key,
		srctree: srcNode.tree.flexTreeEditor.id,
		dst: dstNode.data.key,
		mode: hitMode
	}, function(data) {

		if (data.status === 'ok') {

			if (srcNode.tree !== dstNode.tree) {

					// data.node

				if (hitMode === 'over') {

						// as child

					dstNode.addChild(data.node);

					dstNode.expand(true);

				} else if (hitMode === 'before') {

					dstNode.parent.addChild(data.node, dstNode);

				} else if (hitMode === 'after') {

					dstNode.parent.addChild(data.node, dstNode.getNextSibling());
				}

				srcNode.remove();

			} else
				srcNode.move(dstNode, hitMode);

			me.manager.treeWasModified();

			b
				.setTitle(__('ite.nz-tt') /* Operazione conclusa */)
				.setText(__('ite.nz-tx') /* Lo spostamento &egrave; stato effettuato */)
				.dismissIn(1000)
			;

			me.enableControls();

		} else if (data.status === 'error') {

			node.setLazyNodeStatus(DTNodeStatus_Error);

			b
				.setStatus('error')
				.setTitle('Error')
				.setText(data.message)
			;
		}
	});
};

})(FlexJS.ui);
