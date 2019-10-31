
var winResizer = {
	
	cbs: [],
	
	add: function(cb) { this.cbs.push(cb); },

	addAndExecute: function(cb) { this.cbs.push(cb); this.onResize(cb); },
	
	waitForFinalEvent: (function() {

		var timers = {};
		return function(callback, ms, uniqueId) {
		
			if (!uniqueId)
				uniqueId = "Don't call this twice without a uniqueId";

			if (timers[uniqueId])
				clearTimeout(timers[uniqueId]);
			
			timers[uniqueId] = setTimeout(callback, ms);
		};
	})(),
	
	init: function() {
		
		$(window).on('resize', function() {
		
			winResizer.waitForFinalEvent(function() {

				winResizer.onResize();
			
			}, 200, 'windowResize');
	    });
	},

	onResize: function(cb) {
	
		var
			w = $(window),
			ww = w.width(),
			wh = w.height()
		;
//console.log('onResize', ww);
		if (cb)
			cb(ww, wh);
		else
			$.each(this.cbs, function() {
		
				this(ww, wh);
			});
	}
};

winResizer.init();
