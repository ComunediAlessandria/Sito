"use strict";

sn = window.sn || {};

sn.SearchField = function(el, opt) {
	
	this.el = $(el);

	this.opt = jQuery.extend(opt, {
//		hinttext = ''
	});

	this.attach();
};

sn.SearchField.prototype.attach = function() {

	this.btn = this.el.parent().next();
	this.submit = this.el.parent().prev();
	this.urlEmpty = this.btn.css('background-image');
	this.urlBtn = this.urlEmpty.replace('-empty', '-btn');

	if (this.el.val() != '')
		this.btn.css('background-image', this.urlBtn);

	var me = this;
	this.el.keyup(function() { return me.check(); });
	this.btn.click(function() { return me.empty(); });
	this.submit.click(function() { return me.doSubmit(); });
};

sn.SearchField.prototype.check = function() {

	if (this.el.val() != '')
		this.btn.css('background-image', this.urlBtn);
	else
		this.btn.css('background-image', this.urlEmpty);
};

sn.SearchField.prototype.empty = function() {

	this.el.val('');

	this.btn.css('background-image', this.urlEmpty);
	
	this.doSubmit();
};

sn.SearchField.prototype.doSubmit = function() {
	
	this.el.parents('form').submit();
};
