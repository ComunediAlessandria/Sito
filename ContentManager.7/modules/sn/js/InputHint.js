
sn = window.sn || {};

sn.InputHint = function(el, opt) {
	
	this.el = $(el);
	this.opt = jQuery.extend(opt, {
//		hinttext = ''
	});
	
	this.msg = '';
	
	this.attach();
};

sn.InputHint.prototype.attach = function() {

		// estrae il valore del messaggio
		// 
		// (suppone che non possa già contenere un valore)

	this.msg = this.el.val();

		// colora di grigio assegnando la classe

	this.el.addClass('inputFieldHint');

		// attacca i gestori degli eventi

	var me = this;
	this.el
		.focus(function() { me.onFocus(); })
		.blur(function() { me.onBlur(); })
		.keyup(function(e) { me.onKeyUp(e); })
	;

		// evita che al submit del form venga passato
		// il valore del messaggio

	this.el.parents('form')
		.submit(function() { me.onParentSubmit(); })
	;
};

sn.InputHint.prototype.onFocus = function() {

	if (this.msg == this.el.val())
		this.el.val('');

	this.el.removeClass('inputFieldHint');
};

sn.InputHint.prototype.onBlur = function() {

	if (this.el.val() == '') {
		
		this.el.val(this.msg);

		this.el.addClass('inputFieldHint');
	}
};

sn.InputHint.prototype.onKeyUp = function(e) {

		// se premo esc, vuota e cedi il focus

	if (e.keyCode == 27) {
		
		this.el.val('');
		this.el.blur();
	}
};

sn.InputHint.prototype.onParentSubmit = function() {

	if (this.msg == this.el.val())
		this.el.val('');
};
