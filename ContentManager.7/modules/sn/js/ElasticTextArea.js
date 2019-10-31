sn = window.sn || {};

sn.ElasticTextArea = function(el, opt) {
	
	this.el = $(el);

	this.opt = jQuery.extend({}, {

			// altezza minima espressa in multipli dell'altezza della linea

		minh: 1
	}, opt);

	this.hLine = -1;	// altezza della linea
	this.hMin = -1;		// min height
	this.hMax = -1;		// max height

	this.attach();
};

sn.ElasticTextArea.sHelper = null;

sn.ElasticTextArea.GetHelper = function() {
	
	if (sn.ElasticTextArea.sHelper == null) {
		
		sn.ElasticTextArea.sHelper =
			$('<div />')
				.css({
					position: 'absolute',
//					top: 10000,
					left: -10000
				})
				.appendTo('body')
		;
	}
	
	return sn.ElasticTextArea.sHelper;
};

sn.ElasticTextArea.prototype.attach = function(el, opt) {

	this.el.css({
		'overflow':'hidden'
	});

	this.hLine	=	parseInt(this.el.css('line-height'), 10) || parseInt(this.el.css('font-size'), 10);
//	this.hMin	=	parseInt(this.el.css('height'), 10) || this.hLine; // * 3;
	this.hMax	=	parseInt(this.el.css('max-height'), 10) || Number.MAX_VALUE;

	this.hMin = this.opt.minh * this.hLine;

		// attacca i gestori degli eventi

	var me = this;
	this.el
		.focus(function() { me.onFocus(); })
		.keyup(function() { me.resize(); })

		.bind('keyup,paste', function() { me.resize(); })

			// nel caso in cui sia aggiunto un return per evitare
			// l'effetto scroll up/down
		
		.keydown(function(e) { if (e.keyCode && e.keyCode == 13) me.resize(true); })
	;

	this.resize();
};

	// imposta l'altezza della TA solamente se è diversa da
	// quella attuale ed il suo overflow

sn.ElasticTextArea.prototype.setHeight = function(h, o) {

	if (this.el.height() != h)
		this.el.css({
			overflow : o,
			height: h
		});
};

sn.ElasticTextArea.prototype.resize = function(cr) {

	var h = sn.ElasticTextArea.GetHelper();

		// copia il testo della textarea dentro il div helper
		
	h.html(
		this.el.val()
			.replace(/<|>/g, ' ')
			.replace(/&/g, '&amp;')
			.replace(/\n/g, '<br />')
			
				// aggiunge una 'i' per tenere conto delle linee vuote
				// ed un eventuale 'cr' nel caso sia invocato dal keydown
			
		+ ( cr ? '<br />' : '') + 'i'
	);

	if (Math.abs(h.height() /*+ this.hLine*/ - this.el.height()) > 3) {
		
		var hh = h.height(); // + this.hLine;
		if (hh >= this.hMax) {
			
			this.setHeight(this.hMax, 'auto');

		} else if (hh <= this.hMin) {

			this.setHeight(this.hMin, 'hidden');

		} else
			this.setHeight(hh,'hidden');
	}
};

sn.ElasticTextArea.prototype.onFocus = function() {

	var p = [
		'paddingTop',
		'paddingRight',
		'paddingBottom',
		'paddingLeft',
		'fontSize',
		'lineHeight',
		'fontFamily',
		'width',
		'fontWeight'
	];

	var h = sn.ElasticTextArea.GetHelper();

		// copia le caratteristiche della textarea
		// nell'helper

	for (var i = 0, m = p.length; i < m; i++)
		h.css(p[i], this.el.css(p[i]));

	this.resize();
};
