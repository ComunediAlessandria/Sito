
(function(w) {

	w.DropDownMenu = function(el) {

		this.el = $(el);

		this.attach();
	};

	var _ = w.DropDownMenu.prototype;

	_.attach = function() {

		this.openItem = null;

		this.el.find('ol li .voce + ol').hide();

		var me = this;
		this.el.find('> ol > li').each(function() {

			var
				el = $(this),
				ol = el.find('> ol')
			;

			if (ol.length === 1)
				el.hover(
					function() { me.onEnter(ol); },
					FlexJS.proxy(me.onExit, me)
				);
		});

		this.openAction = new delayedFunction(300, fjs.proxy(me.delayedOpen, me));
		this.closeAction = new delayedFunction(100, fjs.proxy(me.delayedClose, me));

		$('#Overlay')
			.width('100%')
			.height($('body').height() - 182)
			.css({
				display: 'none',
				backgroundColor: 'black',
				opacity: 0.8,
				position: 'absolute',
				top: 182,
				zIndex: 100
			})
		;
	};

	_.onEnter = function(el) {

		this.closeAction.cancel();

		if (this.openItem !== null)
			this.open(el);
		else {

			this.shouldOpen = el;
			this.openAction.activate();
		}
	};

	_.onExit = function() {

		this.closeAction.activate();

		this.openAction.cancel();
	};

	_.delayedOpen = function() {

		if (this.shouldOpen !== null) {

			this.open(this.shouldOpen);
			this.shouldOpen = null;
		}
	};

	_.delayedClose = function() {

		this.close();
	};

	_.open = function(el) {

		if (this.openItem !== null)
			this.close();

		this.openItem = el;

		el.show(); //slideDown(0);

		$('#Overlay').show(); //.css('display' , 'block').animate({'opacity' : '.8'}, 5);
	};

	_.close = function() {

		if (this.openItem !== null) {

			this.openItem.stop(true, true).hide();
			this.openItem = null;

			$('#Overlay').hide(); //.animate({'opacity' : '0'}, 5).css('display' , 'none');
		}
	};

	delayedFunction = function(timeout, fn) {

		this.tm = timeout;
		this.fn = fn;

		this.t = null; // timer
	};

	delayedFunction.prototype.activate = function() {

		if (this.t !== null)
			clearTimeout(this.t);

		var me = this;
		this.t = setTimeout(function() {

			this.t = null;
			me.fn();

		}, this.tm);
	};

	delayedFunction.prototype.fire = function() {

		this.cancel();
		this.fn();
	};

	delayedFunction.prototype.suspend = function() {

		clearTimeout(this.t);
		this.t = null;
	};

	delayedFunction.prototype.cancel = function() {

		if (this.t !== null) {

			clearTimeout(this.t);

			this.t = null;
		}
	};

})(window);
