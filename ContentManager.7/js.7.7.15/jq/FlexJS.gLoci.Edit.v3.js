
window.fjs = window.FlexJS || {};

fjs.gLoci = window.fjs.gLoci || {};

	// gestione dell'editing: viene usato un campo hidden che contiene le definizioni
	// dei luoghi in formato JSON

// var
//	fromJSON = fjs.Utils.fromJSON,
//	toJSON = fjs.Utils.toJSON
// ;

var
	fromJSON = JSON.parse,
	toJSON = JSON.stringify
;

fjs.gLoci.Editor = function(datael, listel, opt) {

	this.del = $(datael);

	var data = fromJSON(this.del.val());

	this.el = $(listel);
	this.opt = $.extend({}, {
		supportta: null
	}, opt);

	this.lang = opt.lang;
	this.index = opt.index;

		// dall'array di descrizione ottiene gli oggetti per
		// la gestione

	this.loci = [];
	for (var i = 0; i < data.loci.length; i++)
		this.loci[i] = fjs.gLoci.glObject.getInstance(data.loci[i], this.opt);

	this.attach();
};

fjs.gLoci.Editor.prototype.attach = function() {

		// riempie l'elemento con l'elenco dei punti definiti

	this.data2list();

		// rivalorizza la TA, in modo che se non viene fatto l'editing
		// di alcun punto ci sia comunque dentro il valore giusto

	this.del.val(toJSON(fjs.gLoci.glObject.getDataArray(this.loci)));
};

fjs.gLoci.Editor.prototype.data2list = function() {

	var
		els = this.loci,
		me = this,
		dom
	;

	if (els.length === 0) {

		dom = $('<div>' + __('jgle.nn') + '</div>'); // Nessun elemento definito

	} else {

		var desc = '';

		dom = $('<ol />');
		for (var i = 0; i < els.length; i++) {

			var el = els[i];

			$('<li />')
				.html(el.getDescription())
				.append($('<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><a data-op="edit" data-id="' + i + '" href="#">' + __('jgle.mod') + '</a><span>&nbsp;|&nbsp;</span>'))
				.append($('<a data-op="del" data-id="' + i + '" href="#">' + __('jgle.del') + '</a><span>&nbsp;|&nbsp;</span>'))
				.append($('<a data-op="dup" data-id="' + i + '" href="#">' + __('jgle.dup') + '</a>'))
				.appendTo(dom)
			;
		}

		dom.on('click', 'a', function() {

			var el = $(this);

			switch (el.data('op')) {

				case 'edit': me.editPoint(el.data('id')); break;
				case 'del': me.delPoint(el.data('id')); break;
				case 'dup': me.dupPoint(el.data('id')); break;
			}

			return false;
		});
	}

	this.el
		.empty()
		.append(dom)
	;
};

fjs.gLoci.Editor.prototype.addPoint = function() {

	this.editPoint(-1);
};

fjs.gLoci.Editor.prototype.editPoint = function(id) {

	var me = this;

		// l'oggetto responsabile per l'editing

	var hdl = id == -1 ? fjs.gLoci.glObject.getInstance({ kind: 1 }, this.opt) : me.loci[id];

	fjs.Ajax.get('gloci/add/' + this.index, function(data) {

		if (data.css)
			fjs.Loader.LoadCSS(data.css);

		var d = new fjs.ui.modalDialogWithButtons({

			useBootstrap: true,

			width:		800,
			height:		550,

			title: data.title,
//			text: text,
			content: function() { return $('<div />').addClass('modal-body').html(data.html); },

			buttons: {
				cancel: __('jgle.can'),
				ok: __('jgle.ok')
			},

			onButtonPressed: function(btn) {

				if (btn === 'ok') {

					hdl.onUnload();

					if (id == -1) {

						me.loci.push(hdl);

					} else
						me.loci[id] = hdl;

					me.data2list();

					me.del.val(toJSON(fjs.gLoci.glObject.getDataArray(me.loci)));
				}

				d.dismiss();
			}
		});

		d.show();


		// fjs.gLoci.Helper.Dialog(data.title, data.html, function() {

		//	hdl.onUnload();

		//	if (id == -1) {

		//		me.loci.push(hdl);

		//	} else
		//		me.loci[id] = hdl;

		//	me.data2list();

		//	me.del.val(toJSON(fjs.gLoci.glObject.getDataArray(me.loci)));

		//}, {
		//	width: 650,
		//	height: 500,

		//	onresize: function(e, ui) { fjs.gLoci.Helper.DialogGeometryManager(); }
		// });

		hdl.onLoad();

		fjs.Loader.LoadJS(
			'js/jq/FlexJS.GMaps.v3.js',
			function() {

				new fjs.gMaps.map(
					'gmap',

					$('#gmap').width(),
					$('#gmap').height(),

					me.opt.mapcenter[0],
					me.opt.mapcenter[1],
					{
						zoom: me.opt.mapzoom,
						onload: function(mapHandler) {

//							fjs.gLoci.Helper.DialogGeometryManager();

//							var map = fjs.gMaps.getMap('gmap');

							hdl.onMapLoad(mapHandler.map);

//							map.checkResize();
//							google.maps.event.trigger(map, 'resize');
						}
					}
				);
			}
		);

	}, 'json');
};

fjs.gLoci.Editor.prototype.delPoint = function(id) {

	var me = this;

		var d = new fjs.ui.modalDialogWithButtons({

			useBootstrap: true,

	//		width: 650,

			title: __('jgle.ddtt'),
			text: __('jgle.ddtx'),

			buttons: {
				cancel: __('jgle.can'),
				ok: __('jgle.ok')
			},

			onButtonPressed: function(btn) {

				if (btn === 'ok') {

					me.loci[id] = null;

					me.loci.splice(id, 1);

					me.data2list();

					me.del.val(toJSON(fjs.gLoci.glObject.getDataArray(me.loci)));
				}

				d.dismiss();
			}
		}).show();




	// fjs.gLoci.Helper.Dialog('Conferma di cancellazione', 'sei sicuro di voler eliminare ...', function() {

	//		me.loci[id] = null;

	//		me.loci.splice(id, 1);

	//		me.data2list();

	//		me.del.val(toJSON(fjs.gLoci.glObject.getDataArray(me.loci)));

	//	}, {
	//		nameOK:	'Elimina',

	//		width: 650,
	//		height: 200
	// });
};

fjs.gLoci.Editor.prototype.dupPoint = function(id) {

	this.loci.push(
		$.extend(true, {}, this.loci[id])
	);

	this.data2list();
	this.del.val(toJSON(fjs.gLoci.glObject.getDataArray(this.loci)));
};

fjs.gLoci.Helper = window.fjs.gLoci.Helper || {};

fjs.gLoci.Helper.Dialog = function(title, text, cb, pars) {

	pars = $.extend({

		useBootstrap: true,

		width:		500,
		height:		450,

		title: title,
		text: text,

		onButtonPressed: function(btn) {

			d.dismiss();

			if (btn === 'ok')
				cb();
		}

	}, pars);

	var d = new fjs.ui.modalDialogWithButtons(pars);

	d.show();
/*
	pars = $.extend({
		nameOK:		'Registra',
		nameCancel:	'Annulla',

		width:		500,
		height:		450,

		onresize: null
	}, pars);

		// injection nel DOM del placeholder per
		// il dialog

	$(document.body)
		.append(
			$('<div id=\"dialog\" title=\"' + title + '\">' + text + '</div>')
			.css('display', 'none')
		)
	;

	var b = {};
	b[ pars.nameOK ] = function() {

		cb();

		$(this).dialog('close');
	};

	b[ pars.nameCancel ] = function() {

		$(this).dialog('close');
	};

	$('#dialog').dialog({

		bgiframe: true,
		width: pars.width,
		height: pars.height,
		position: ['center', 100],
		resizable: true,
		modal: true,
		buttons: b,

		resizeStop: pars.onresize || function(event, ui) {  }

	}).bind('dialogclose', function(event) {

		$('#dialog').remove();
	});
*/
};
/*
fjs.gLoci.Helper.DialogGeometryManager = function() {
return;
	var
		p = 4,	// padding
		hs = 4,		// h space
		vs = 4,		// v space
		h = $('#dialog').innerHeight() - 2 * p,
		w = $('#dialog').innerWidth() - 2 * p,
		ih = 150,
		sw = 300, sh = 100
	;

	$('#dialog')
		.css({
			position: 'relative',
			overflow: 'hidden'
		})
//		.css('background', '#eee')
	;

	$('#descPanel')
		.css({
			padding: 4,
			position: 'absolute',
			left: p,
			top: p,
			width: w - 2 * 4,
			height: ih - 2 * 4,

			border: '1px solid #999'
		})
	;

	$('#gmap')
		.css({
			position: 'absolute',
			left: p,
			top: p + ih + vs,
			width: w - sw - hs,
			height: h - vs - ih,

			border: '1px solid #999'
		})
	;

	$('#infoPanel')
		.css({
			padding: 4,
			position: 'absolute',
			left: w - sw + p,
			top: p + ih + vs,
			width: sw - 2 * 4,
			height: h - 2 * vs - ih - sh,

			border: '1px solid #999'
		})
	;

	$('#searchPanel')
		.css({
			padding: 4,
			position: 'absolute',
			left: w - sw + p,
			top: h - sh + p + 2 * vs,
			width: sw - 2 * 4,
			height: sh - 2 * vs - 2 * 4,

			border: '1px solid #999'
		})
	;

	var map = fjs.GMaps.GetMap('gmap');
	map.checkResize();
//	google.maps.event.trigger(map, 'resize');
};
*/