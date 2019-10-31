
galleryslider = function(data, opt) {
	
	var me = this;
	
	this.opt = opt;
	
	this.h = data.maxh;
	this.w = data.maxw;
	this.n = data.items.length;

	var ww = $(window).width(), wh = $(window).height();

		// backdrop

	this.backdrop = $('<div />')
		.attr('id', 'gBackdrop')
		.css({
			position: 'fixed',
			top: 0,
			left: 0,
			width: ww,
			height: wh,
			zIndex: 3999,
			backgroundColor: '#000' //,
	//		opacity: 0.5
		})
		.appendTo('body')
	;

		// frame esterno

	this.frame = $('<div />')
		.attr('id', 'gFrame')
		.css({
			position: 'fixed',
			top: 0,
			left: 0,
			width: ww,
			height: wh,
			zIndex: 4000
		})
		.appendTo('body')
		.click(function() { me.close(); return false; })
	;


	this.els = [];
	$.each(data.items, function(i, item) {
	
		var
			el = $(item),
			elw = parseInt(el.attr('width'), 10),
			elh = parseInt(el.attr('height'), 10)
		;

		el
			.css({
				position: 'absolute',
				top: (me.h - elh) / 2,
				left: me.w * i + (me.w - elw) / 2
			})
//			.click((function(n) { return function() { console.log('click'); me.gotoPane(n); return false; } })(i))
		;
		
		me.els.push(el.get(0));
	});

		// contenitore per il nastro
		
	this.base = $('<div />')
		.attr('id', 'gBase')
		.css({
			position: 'relative',
			top: (wh - this.h) / 2,
			left: (ww - this.w) / 2,
			width: this.w,
			height: this.h,
			overflow: 'hidden'
		})
		.appendTo(this.frame)
	;
	
		// nastro
		
	this.ribbon = $('<div />')
		.attr('id', 'gRibbon')
		.css({
			position: 'absolute',
			top: 0,
			left: 0,
			width: this.w * this.n,
			height: this.h
		})
		.appendTo(this.base)
		.click(function() { return false; })
	;

	this.ribbon.append(this.els);

	this.curPane = -1;
	this.maxPane = this.n - 1;

	this.next = $('<img />')
		.attr('src', FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/img/next.gif')
		.css({
			position: 'absolute',
			top: (wh - this.h) / 2  + (this.h - 52) / 2,
			right: (ww - this.w) / 2 - 52 / 2,
			zIndex: 4001
		})
		.click(FlexJS.proxy(this.gotoNext, this))
		.appendTo(this.frame)
	;

	this.nextOpacity = 1;
	
	this.prev = $('<img />')
		.attr('src', FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/img/prev.gif')
		.css({
			position: 'absolute',
			top: (wh - this.h) / 2 + (this.h - 52) / 2,
			left: (ww - this.w) / 2 - 52 / 2,
			zIndex: 4001
		})
		.click(FlexJS.proxy(this.gotoPrev, this))
		.appendTo(this.frame)
	;

	this.prevOpacity = 1;
	
	
	if (this.opt.spinner)
		this.opt.spinner.stop();
	
	this.gotoPane(0);
};

galleryslider.prototype.close = function() {
	
	this.backdrop.remove();
	this.frame.remove();
};

galleryslider.prototype.gotoPrev = function() {
	
	if (this.curPane > 0)
		this.gotoPane(this.curPane - 1);
		
	return false;
};

galleryslider.prototype.gotoNext = function() {

	if (this.curPane < this.maxPane)
		this.gotoPane(this.curPane + 1);
		
	return false;
};

galleryslider.prototype.gotoPane = function(n) {

	if (this.curPane === n)
		return;

	this.curPane = n;

	this.lazyLoadImagesInPane(n);
	
	this.ribbon.animate({
		left: - this.w * n
	});

	this.alignControlsOpacity();
};

galleryslider.prototype.alignControlsOpacity = function(n) {

	var po = 1, no = 1;

	if (this.curPane === 0)
		po = 0.5;

	if (this.curPane === this.maxPane)
		no = 0.5;

	if (po != this.prevOpacity) {

		this.prev.css('opacity', po);
		this.prevOpacity = po;
	}

	if (no != this.nextOpacity) {
		
		this.next.css('opacity', no);
		this.nextOpacity = no;
	}
};

galleryslider.prototype.lazyLoadImagesInPane = function(n) {

	for (var i = n; i < n + 2 && i <= this.maxPane; i++) {
		
		var pd = $(this.els[i]);

		pd.find('img').each(function() {
		
			var el = $(this), src = el.attr('src');
			if (src.substr(src.length - 1) == '#')
				el.attr('src', el.next().html());
		});
	}
};