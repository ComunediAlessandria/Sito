(function(w) {
	
	w.euroMenu = function(el) {
		
		this.el = $(el);
		
		this.attach();
	};
	
	var _ = w.euroMenu.prototype;
	
	_.attach = function() {
		
		this.open = null;

		this.el.find('ol ol').hide();

		var me = this;
		this.el.find('> ol > li').each(function() {
		
			var
				el = $(this),
				ol = el.find('ol')
			;

			if (ol.length === 1)
				el.hover(
					function() { me.onEnter(ol); },
					FlexJS.proxy(me.onExit, me)
				);
		});
	};
	
	_.onEnter = function(el) {
		
		if (this.open !== null)
			this.open.close();
		
		this.open = el;

		el.slideDown('fast');
	};

	_.onExit = function() {

		this.open.stop(true, true).hide();
		this.open = null;
	};
	
})(window);
