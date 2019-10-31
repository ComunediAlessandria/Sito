fjs.ui = fjs.ui || {};
fjs.ui.bst = fjs.ui.bst || {};

	//
	// gestione di popover che si appoggia al modal di bootstrap
	//
	// definisce un container neutro ed uno che implementa il
	// contenuto con la struttura dei modali bootstrap
	//
	// implementa le funzionalità di apertura del popover e suo posizionamento in
	// in relazione ad un elemento

	// il contenuto può essere:
	//
	//	- stringa HTML
	//	- oggetto DOM (viene distaccato)
	//	- funzione

	// TBD: è usato nel channel-chooser, dove è ridefinito

(function(_) {

	'use strict';

_.popoverFrame = function(/*target,*/ opt) {

//	this.$tg = $(target);

	this.opt = jQuery.extend({

		content: null,		// contenuto del popover (html/funzione)
		'class': 'popover',	// classe del contenitore del popover per scoping

		position: 'n', // n,s,e,w,ne,nw,se,sw,center
		canMirror: true,

		onShow: $.noop,
		onHide: $.noop

	}, opt);

	this.isOpen = false;
	_.popoverFrame.register(this);

	this.$tt = null;
};

_.popoverFrame.items = [];
_.popoverFrame.register = function(pop) {

	if (_.popoverFrame.items.length === 0)
		$('html').click(_.popoverFrame.hideAll);

	_.popoverFrame.items.push(pop);
};

_.popoverFrame.hideAll = function() { $.each(_.popoverFrame.items, function() { this.hide(); }); };

_.popoverFrame.prototype.create = function() {

	this.createContent();

	this.$tt = $('<div class=\'bst-popover\'><div class=\'po-content\'></div><div class=\'pointer\'></div></div>')
		.addClass(this.opt['class'])
		.find('.po-content')
			.html(
				this.$c
			)
		.end()
		.appendTo('body')
		.hide()
		.click(function(e) { e.stopPropagation(); })
	;

//	this.$cnt = this.$tt.find('.po-content');
};

_.popoverFrame.prototype.createContent = function() {

	var cnt;
	switch ($.type(this.opt.content)) {

		case 'string': cnt = this.opt.content; break;
		case 'function': cnt = this.opt.content(this); break;
		default: cnt = this.opt.content.detach().show();
	}

	this.$c = $(cnt);
};

_.popoverFrame.prototype.setContent = function(c) { this.$c.replaceWith($(c)); };

	// apre il popover posizionandolo in relazione all'elemento

_.popoverFrame.prototype.show = function(target) {

	if (! this.isOpen) {

		target = $(target);

		if (this.$tt === null)
			this.create();

		_.popoverFrame.hideAll();

		this.internalShow(target, this.opt.position, this.opt.canMirror);

		this.isOpen = true;
	}
};

_.popoverFrame.prototype.internalShow = function(target, inPosition, canMirror) {

	var
		tg = $(target),
		targetBox = target.offset(),

		tooltipBox = {
			left: 0,
			top: 0,
			width: Math.floor(this.$tt.outerWidth()),
			height: Math.floor(this.$tt.outerHeight())
		},

		pointerBox = {
			left: 0,
			top: 0,
			width: Math.floor(this.$tt.find('.pointer').outerWidth()),
			height: Math.floor(this.$tt.find('.pointer').outerHeight())
		},

		docBox = {
			left: $(document).scrollLeft(),
			top: $(document).scrollTop(),
			width: $(window).width(),
			height: $(window).height()
		}
	;

	targetBox.left = Math.floor(targetBox.left);
	targetBox.top = Math.floor(targetBox.top);
	targetBox.width = Math.floor(target.outerWidth());
	targetBox.height = Math.floor(target.outerHeight());

	this.$tt
		.removeClass('pos_w pos_e pos_n pos_s pos_nw pos_ne pos_se pos_sw pos_center')
		.addClass('pos_' + inPosition)
	;

	switch (inPosition) {

		case 'w':

				tooltipBox.left = targetBox.left - tooltipBox.width - pointerBox.width;
				tooltipBox.top = targetBox.top + Math.floor((targetBox.height - tooltipBox.height) / 2);
				pointerBox.left = tooltipBox.width;
				pointerBox.top = Math.floor(targetBox.height / 2);

			break;

		case 'e':

				tooltipBox.left = targetBox.left + targetBox.width + pointerBox.width;
				tooltipBox.top = targetBox.top + Math.floor((targetBox.height - tooltipBox.height) / 2);
				pointerBox.left = -pointerBox.width;
				pointerBox.top = Math.floor(tooltipBox.height / 2);

			break;

		case 'n':

				tooltipBox.left = targetBox.left - Math.floor((tooltipBox.width - targetBox.width) / 2);
				tooltipBox.top = targetBox.top - tooltipBox.height - pointerBox.height;
				pointerBox.left = Math.floor(tooltipBox.width / 2);
				pointerBox.top = tooltipBox.height;

			break;

		case 's':

				tooltipBox.left = targetBox.left - Math.floor((tooltipBox.width - targetBox.width) / 2);
				tooltipBox.top = targetBox.top + targetBox.height + pointerBox.height;
				pointerBox.left = Math.floor(tooltipBox.width / 2);
				pointerBox.top = -pointerBox.height;

			break;

		case 'nw':

				tooltipBox.left = targetBox.left - tooltipBox.width + pointerBox.width;	// +pointerBox.width because pointer is under
				tooltipBox.top = targetBox.top - tooltipBox.height - pointerBox.height;
				pointerBox.left = tooltipBox.width - pointerBox.width;
				pointerBox.top = tooltipBox.height;

			break;

		case 'ne':

				tooltipBox.left = targetBox.left + targetBox.width - pointerBox.width;
				tooltipBox.top = targetBox.top - tooltipBox.height - pointerBox.height;
				pointerBox.left = 1;
				pointerBox.top = tooltipBox.height;

			break;

		case 'se':

				tooltipBox.left = targetBox.left + targetBox.width - pointerBox.width;
				tooltipBox.top = targetBox.top + targetBox.height + pointerBox.height;
				pointerBox.left = 1;
				pointerBox.top = -pointerBox.height;

			break;

		case 'sw':

				tooltipBox.left = targetBox.left - tooltipBox.width + pointerBox.width;
				tooltipBox.top = targetBox.top + targetBox.height + pointerBox.height;
				pointerBox.left = tooltipBox.width - pointerBox.width;
				pointerBox.top = -pointerBox.height;

			break;

		case 'center':

				tooltipBox.left = targetBox.left + Math.floor((targetBox.width - tooltipBox.width) / 2);
				tooltipBox.top = targetBox.top + Math.floor((targetBox.height - tooltipBox.height) / 2);

				canMirror = false;

				this.$tt.find('.pointer').hide();
	}

		// if the tooltip is out of bounds we first mirror its position

	if (canMirror) {

		var
			newPosition = inPosition,
			doMirror = false
		;

		if (tooltipBox.left < docBox.left) {

			newPosition = newPosition.replace('w', 'e');
			doMirror = true;

		} else if (tooltipBox.left + tooltipBox.width > docBox.left + docBox.width) {

			newPosition = newPosition.replace('e', 'w');
			doMirror = true;
		}

		if (tooltipBox.top < docBox.top) {

			newPosition = newPosition.replace('n', 's');
			doMirror = true;

		} else if (tooltipBox.top + tooltipBox.height > docBox.top + docBox.height) {

			newPosition = newPosition.replace('s', 'n');
			doMirror = true;
		}

		if (doMirror) {

			this.internalShow(target, newPosition, false);

			return;
//			return this;
		}
	}

		// if we're here, it's definitely after the mirroring or the position is center
		// this part is for slightly moving the tooltip if it's still out of bounds

	var
		pointerLeft = null,
		pointerTop = null
	;

	if (tooltipBox.left < docBox.left) {

		pointerLeft = tooltipBox.left - docBox.left - pointerBox.width / 2;
		tooltipBox.left = docBox.left;

	} else if (tooltipBox.left + tooltipBox.width > docBox.left + docBox.width) {

		pointerLeft = tooltipBox.left - docBox.left - docBox.width + tooltipBox.width - pointerBox.width / 2;
		tooltipBox.left = docBox.left + docBox.width - tooltipBox.width;
	}

	if (tooltipBox.top < docBox.top) {

		pointerTop = tooltipBox.top - docBox.top - pointerBox.height / 2;
		tooltipBox.top = docBox.top;

	} else if (tooltipBox.top + tooltipBox.height > docBox.top + docBox.height) {

		pointerTop = tooltipBox.top - docBox.top - docBox.height + tooltipBox.height - pointerBox.height / 2;
		tooltipBox.top = docBox.top + docBox.height - tooltipBox.height;
	}

	this.$tt.css({
		left: tooltipBox.left,
		top: tooltipBox.top
	});

	if (pointerLeft !== null)
		this.$tt.find('.pointer').css('margin-left', pointerLeft);

	if (pointerTop !== null)
		this.$tt.find('.pointer').css('margin-top', '+=' + pointerTop);

	if (typeof this.opt.onShow === 'function')
		this.opt.onShow.call(this);

//	this.$trigger.removeAttr('title');
	this.$tt.show();
//	return this;
};

_.popoverFrame.prototype.hide = function() {

	if (this.isOpen) {

		if (typeof this.opt.onHide === 'function')
			this.opt.onHide.call(this);

		this.$tt.hide();

		this.isOpen = false;
	}
};

	// un popover che si apre posizionato su di un elemento

_.popoverOnElement = function(target, opt) {

	this.$tg = $(target);

	// this.opt = jQuery.extend({
	// }, opt);

	_.popoverFrame.call(this, opt);
};

_.popoverOnElement.prototype = new _.popoverFrame();

_.popoverOnElement.prototype.show = function() {

	_.popoverFrame.prototype.show.call(this, this.$tg);
};

	// un popover stilizzato con bootstrap modal
	// distinguendo titolo, contenuto, footer

_.popover = function(opt) {

	this.opt = jQuery.extend({

		title: null,
		content: null,
		footer: null

	}, opt);

	_.popoverFrame.call(this, opt);
};

_.popover.prototype = new _.popoverFrame();

_.popover.prototype.createContent = function() {

	this.opt.content = [

		'<div class="" role="dialog" aria-hidden="true">',
		'	<div class="modal-header">',
		'		<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i></button>',
		'		<h3>' + this.opt.title + '</h3>',
		'	</div>',
		'	<div class="modal-body">',
		this.opt.content,
		'	</div>',
		'	<div class="modal-footer">',
		this.opt.footer,
		'	</div>',
		'</div>'

	].join('');

	_.popoverFrame.prototype.createContent.call(this);
};

_.popover.prototype.reposition = function(opt) { return $(); };

	// un popover con contenuto accessibile tramite $() e callback
	// (per eventuali elementi interattivi)
	//
	// nella configurazione accetta:
	//
	//	- un elenco di placeholder che identificano gli elementi
	//		all'interno tramite una classe e che vengono valorizzati all'apertura
	//	- un elenco di handler sotto forma di selettori per l'evento click

_.popoverTemplate = function(opt) {

	this.opt = jQuery.extend({

		placeholder: [],
		handler: []

	}, opt);

	_.popover.call(this, opt);
};

_.popoverTemplate.prototype = new _.popover();

_.popoverTemplate.prototype.$ = function(sel) { return $(); };

// _.popover.prototype.createContent = function() {

//	_.popover.prototype.createContent.call(this);

//	this.$map = [];

// };

_.popoverTemplate.prototype.show = function(target, vals) {

	if (this.$tt === null)
		this.create();

	var c = this.$c;
	$.each(vals, function(k, v) {

		c.find('.' + k).html(v);
	});

	_.popover.prototype.show.call(this);
};

/*
_.modalDialogWithButtons.prototype = new _.modalDialog();

	_.modalDialog.prototype.show.call(this);
*/
})(fjs.ui.bst);
