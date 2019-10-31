FlexJS.ui = FlexJS.ui || {};

(function(_) {

	// box di notifica

_.popover = function(opt) {

	this.opt = jQuery.extend({

		'class': null,
		placement: 'right',
		relative: 'center',	// TBD: sperimentale

		title: null,
		content: null,
		footer: null,

		width: 400,
		height: 0,

		onClick: function() {}
	}, opt);

	this.h = $('<div><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title t-title"></h3><div class="popover-content t-content"></div><h3 class="popover-title t-footer">GGG</h3></div></div>')
		.appendTo(document.body)
		.addClass('ui popover ' + this.opt.placement.replace(/-/, ' '))
//		.css({
//			width: this.opt.width
//		})
	;

	if (this.opt['class'])
		this.h.addClass(this.opt['class']);

	this.h
		.find('.t-title')
			.html(this.opt.title)
		.end()
		.find('.t-content')
			.html(this.opt.content)
		.end()
		.find('.t-footer')
			.html(this.opt.footer)
	;

//	$(document).on('click', FlexJS.proxy(this.dismiss, this));

		// se ho un elemento con 'data-popover' gestisce
		// internamente le funzionalità

	this.h.find("[data-popover='dismiss']")
		.on('click', FlexJS.proxy(this.dismiss, this))
	;

	this.h.find("[data-popover='hide']")
		.on('click', FlexJS.proxy(this.hide, this))
	;
};

_.popover.prototype.getHelper = function() {

	return this.h;
};

_.popover.prototype.pop = function(top, left) {

	this.position = [top, left];

	this.reposition();
};

	// riposiziona il popover
	//
	// http://stackoverflow.com/questions/10238089/how-can-you-ensure-twitter-bootstrap-popover-windows-are-visible

_.popover.prototype.reposition = function() {

	var
		rTop = this.position[0],
		rLeft = this.position[1],
		he = this.h,
		h = he.height(),
		w = he.width(),
		top, left
	;

	if (w > this.opt.width)
		he.width(w = this.opt.width);

	switch (this.opt.placement) {

		case 'bottom':

			if (this.opt.relative === 'left') {
				top = rTop; left = rLeft;
			} else if (this.opt.relative === 'right') {
				top = rTop; left = rLeft - w;
			} else {
				top = rTop; left = rLeft - w / 2;
			}
		break;
		case 'top':
			top = rTop - h; left = rLeft - w / 2;
		break;
		case 'left':
			top = rTop - h / 2; left = rLeft - w;
		break;
		case 'right':
			top = rTop - h / 2; left = rLeft;
		break;
	}

	var
		d = $(document),
		bTop = d.scrollTop(),
		bLeft = d.scrollLeft(),
		wi = $(window),
		bRight = bLeft + wi.width(),
		bBottom = bTop + wi.height()
	;

	if (top < bTop) top = bTop;
	if (top + h > bBottom) top = bBottom - h;
	if (left < bLeft) left = bLeft;
	if (left + w > bRight) left = bRight - w;

	if (this.opt.relative === 'left')
		he.find('.arrow').css({
			left: rLeft - left + 15
		});
	else if (this.opt.relative === 'right')
		he.find('.arrow').css({
			left: w - left - 15
		});

	he.css({ top: top, left: left }).show();
};


/*
_.popover.prototype.getHelper = function() {

	if (this.h !== null)
		return;

		/ *
	<div class="popover fade right in" style="top: 5.5px; left: 414.5px; display: block;">
		<div class="arrow"></div>
		<div class="popover-inner">
			<h3 class="popover-title">Popover on right</h3>
			<div class="popover-content">
				<p>
					Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
				</p>
			</div>
		</div>
	</div>
* /

	this.h = $('<div><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title">Popover on right</h3><div class="popover-content"></div></div></div>').appendTo(document.body)
			.addClass('popover fade right in')
	//		.css({
	//			position: 'fixed',
	//			zIndex: 1001,
	//			display: 'none',
	//
	//			width: this.opt.width
	//		})
			.on('click', this.opt.onClick)
		;

	this.title = this.h.find('.popover-title');
	this.content = this.h.find('.popover-content');

//		$(document).on('click', _.popover.dismiss);
};
*/
_.popover.prototype.hide = function() {

	this.h.fadeOut('fast');
};

_.popover.prototype.show = function() {

	this.h.show();
};

_.popover.prototype.dismiss = function() {

	this.h.remove();
};

	// popover con placeholder per condividere
	// lo stesso elemento fra più entità

_.sharedPopover = function(opt) {

	this.opt = jQuery.extend({

		title: null,
		content: null,

//		width: 400,
//		height: 0,

		placeholders: {} // mappa tag -> selettore

	}, opt);

	this.init();
};

_.sharedPopover.prototype.init = function() {

	this.p = new _.popover(this.opt);

	var h = this.p.getHelper();

	var e = this.els = {};
	$.each(this.opt.placeholders, function(k, v) {

		e[ k ] = $(v, h);
	});

	$.each(this.opt.handlers, function(k, v) {

		$(k, h).on('click', v);
	});
};

	// accesso al contenuto

_.sharedPopover.prototype.$ = function(sel) {

	return $(sel, this.p.getHelper());
};

_.sharedPopover.prototype.pop = function(where, data) {

		// data è un set tag -> valori

	var els = this.els;
	$.each(data, function(k, v) {

		els[k].html(v);
	});

	this.p.pop(where.top, where.left);
};

_.sharedPopover.prototype.dismiss = function() {

	this.p.hide();
};

_.sharedPopover.prototype.reposition = function() {

	this.p.reposition();
};

})(FlexJS.ui);