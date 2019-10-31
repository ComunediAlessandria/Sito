FlexJS.ui = FlexJS.ui || {};

FlexJS.ui.vTicker = function(el, opt) {

	this.el = $(el);

	this.opt = jQuery.extend({

			// se height vale 0, usa il numero di elementi per
			// determinare l'altezza

		height: 0,
		showItems: 0,

		speed: 50,

			// pausa su hover

		mousePause: true,

			// oggetto da usare per start/stop

		startStop: false

	}, opt);

	this.attach();
};

FlexJS.ui.vTicker.prototype.attach = function() {

	this.p = this.el.wrap('<div class="vTicker wrapper" />').parent();

	this.p
		.css({
			overflow: 'hidden',
			position: 'relative'
		})
		.children('ol')
			.css({
				position: 'absolute'
			})
		.children('li')
			.children('a')
				.css({
					'margin-bottom': 0
				})
	;

	if (this.opt.height == 0) {

		var mh = 0;
		this.p.children('ol').children('li').each(function() {

			mh = Math.max(mh, $(this).outerHeight());
		});

		this.p.height(mh * this.opt.showItems);

	} else
		this.p.height(this.opt.height);

	var me = this;

	this.isPaused = false;
	if (this.opt.mousePause) {

		this.p.bind('mouseenter', function() {

			me.isPaused = true;

		}).bind('mouseleave', function() {

			me.isPaused = false;
		});
	}

	if (this.opt.startStop)
		$(this.opt.startStop).click(function() {

			me.isPaused = ! me.isPaused;

			return false;
		});

	this.v = this.to = 0;
	this.ol = this.p.children('ol');

	setInterval(FlexJS.proxy(this.animate, this), this.opt.speed);
};

FlexJS.ui.vTicker.prototype.animate = function() {

	if (! this.isPaused) {

		var ol = this.ol;
		if (this.v >= this.to) {

		   	var clone = ol.children('li:first').clone(true);
			clone.appendTo(ol);

			ol.children('li:first').remove();

			this.to = ol.children('li:first').outerHeight(true);
			this.v = 0;

		} else
			this.v += 1;

		ol.css('top', - this.v);
	}
};

/*
FlexJS.ui.vTicker.prototype.animate2 = function() {

	if (this.isPaused)
		return;

	this.animating = true;

	var ol = this.p.children('ol');

   	var clone = ol.children('li:first').clone(true);
	clone.appendTo(ol);

	var h = ol.children('li:first').outerHeight(true);

	var me = this;
	ol.animate({top: '-=' + h + 'px'}, this.opt.speed, 'linear', function() {

		me.animating = false;

		$(this).children('li:first').remove();
		$(this).css('top', 0);

		me.animate();
	});
};
*/