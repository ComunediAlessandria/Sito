FlexJS.ui = FlexJS.ui || {};

(function(_) {

_.lightbox = function(el, opt) {

	this.el = $(el);

	this.opt = jQuery.extend({}, {

//		refimage: false,

		width: 0,
		height: 0,

		effect: 'zoom'		// fade / zoom / grow

	}, opt);

	this.attach();
};

_.lightbox.isOpen = false;

_.lightbox.prototype.attach = function() {

		// nel caso di flottaggio a destra devo avere uno zIndex
		// sufficiente (TBD: modificare gli oggetti che inseriscono il lightbox)

	this.el.closest('div.BLOBFloatRight').css('z-index', 10);
	this.el.css('cursor', 'pointer');

	var me = this;
	this.el.click(function() {

		if (_.lightbox.isOpen)
			return;

		_.lightbox.isOpen = true;

//	var init = _.lightbox.sHelper === null;

		var
			wnd = $(window),
			doc = $(document)
		;

//	if (init)
		_.lightbox.sOverlay = $('<div/>').appendTo(document.body)
			.css({
				borderWidth: 0, margin: 0, padding: 0,
				position: 'absolute', top: 0, left: 0,
				width: doc.width(),
				height: doc.height(),
				zIndex: 1000,
				display: 'none',

				opacity: 0.8,
				'background-color': '#333'
			})
			.slideDown(500)
//			.click(FlexJS.proxy(me.dismiss, me))
		;

		var
			m = 40,		// window margin
			p = 10,		// passpartout padding
			ww = wnd.width() - 2 * m,
			wh = wnd.height() - 2 * m,
			hh = me.opt.height + 2 * p,
			hw = me.opt.width + 2 * p,
			ar = me.opt.height / me.opt.width
		;

		if (hh > wh) {

			hh = wh - 2 * p;
			hw = hh / ar;
		}

		if (hw > ww) {

			hw = ww - 2 * p;
			hh = hw * ar;
		}

		var
			ht = (wh + m - hh) / 2,
			hl = (ww + m - hw) / 2
		;

// if (init)
		_.lightbox.sHelper = $('<div><img /></div>')
			.appendTo(document.body)
			.addClass('fx-lightbox')
			.css({
				position: 'fixed',
				zIndex: 1001,
				display: 'none',

				width: hw,
				height: hh,

				top: ht,
				left: hl,

				'background-color': 'white',
				padding: 2 * p + 'px'
			});


		var img = _.lightbox.sHelper.find('img')
				.attr('src', me.opt.fullsize)
				.css({

					display: 'none',

					width: hw,
					height: hh,

					border: '1px solid black'
				})
//			.end()
//			.fadeIn(1500)
		;

// if (init)
		_.lightbox.sClose = $('<div><img /></div>').appendTo(document.body)
			.addClass('fx-lightbox-close')
			.css({
				cursor: 'pointer',

				position: 'fixed',
				zIndex: 1002,
				display: 'none',

				top: ht - 10,
				left: hl + hw + 2 * p + 5
			})
			.find('img')
				.attr('src', FlexJS.AppConfigure.Get('kBaseURL') + 'TemplatesCM/assets/img/lightbox.close.button.png')
			.end()
//			.fadeIn(1500)
			.click(FlexJS.proxy(me.dismiss, me))
		;

			switch (me.opt.effect) {

				case 'fade':

						img.show();
						_.lightbox.sHelper.fadeIn(1000, function() {

							_.lightbox.sClose.fadeIn(500);
						});

					break;

				case 'zoom':

						_.lightbox.sHelper
							.css({

								width: 0,
								height: 3,

								top: wh / 2,
								left: ww / 2
							})
							.show()
							.animate({

								width: hw,
								height: hh,

								top: ht,
								left: hl

							}, 700, function() {

								_.lightbox.sClose.fadeIn(500);
								img.fadeIn(300);
							})
						;

					break;

				case 'grow':

						_.lightbox.sHelper
							.css({

								width: 0,
								height: 3,

								top: wh / 2,
								left: ww / 2
							})
							.show()
							.animate({

								width: hw,
								left: hl

							}, 700, function() {

								_.lightbox.sHelper.animate({
									height: hh,
									top: ht
								}, 700, function() {

									_.lightbox.sClose.fadeIn(500);
									img.fadeIn(300);
								});
							})
						;

					break;
			}

		return false;
	});
};

_.lightbox.prototype.dismiss = function() {

	_.lightbox.sClose.fadeOut(300, function() { $(this).remove(); });
	_.lightbox.sHelper.fadeOut(300, function() {

		$(this).remove();

		_.lightbox.sOverlay.slideUp(500, function() { $(this).remove(); _.lightbox.isOpen = false; });
	});
};

_.lightbox.sHelper =
_.lightbox.sOverlay =
_.lightbox.sClose = null;

})(FlexJS.ui);
