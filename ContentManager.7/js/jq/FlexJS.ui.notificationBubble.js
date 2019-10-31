FlexJS.ui = FlexJS.ui || {};

(function(_) {

	// box di notifica

_.notificationBubble = function(opt) {

	this.opt = jQuery.extend({

		title: null,
		text: null,

		width: 400,
		height: 0,
		
		status: 'info',
		
		duration: 3000,		// in usec, se zero niente dismiss automatico
		
		onDismiss: function() {},
		
	}, opt);

	this.helper = null;
	this.pop();
};

_.notificationBubble.prototype.pop = function() {
	
	var
		wnd = $(window),
		doc = $(document)
	;

	this.helper = $('<div />').appendTo(document.body)
		.addClass('ui-bubble')
		.addClass(this.opt.status)
		.css({
			position: 'fixed',
			zIndex: 1001,
			display: 'none',

			width: this.opt.width
		})
	;

		// posiziona il dialog
		
	var h = this.helper;
	h
		.css({
			top: /* doc.scrollTop() + */ (wnd.height() - h.height()) / 5,
			left: (wnd.width() - h.width()) / 2
		})
		.html(
			this.getInnerHTML()
		)
//		.click(FlexJS.proxy(this.onClick, this))
		.show()
	;
	
	var me = this;
	$(document).bind('keyup', function(e) { if (e.keyCode == 27) return me.dismiss(); });

	if (this.opt.duration > 0)
		setTimeout(FlexJS.proxy(this.dismiss, this), this.opt.duration);
};

_.notificationBubble.prototype.getInnerHTML = function() {

	return '<div class="content"><h2>' + this.opt.title + '</h2><p>' + this.opt.text + '</p></div>';
};

_.notificationBubble.prototype.setTitle = function(t) {
	
	this.opt.title = t;
	this.helper.html(this.getInnerHTML());
	
	return this; // chainable
};

_.notificationBubble.prototype.setStatus = function(s) {

	this.helper
		.removeClass('info')
		.removeClass('error')
		.addClass(s)
	;

	return this; // chainable
};
_.notificationBubble.prototype.setText = function(t) {
	
	this.opt.text = t;
	this.helper.html(this.getInnerHTML());
	
	return this; // chainable
};

_.notificationBubble.prototype.dismissIn = function(usec) {
	
	// TBD: no multiple timeouts
	setTimeout(FlexJS.proxy(this.dismiss, this), usec);
};

_.notificationBubble.prototype.dismiss = function() {

	var me = this;

	if (this.helper) this.helper.animate({
		opacity: 0.25,
		top: -100
	}, 500, function() {
		
		me.helper.remove();
		me.helper = null;
		
		me.opt.onDismiss();
	});

	$(document).unbind('keyup');
	
	return false;
};

})(FlexJS.ui);