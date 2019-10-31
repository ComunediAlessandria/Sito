sn = window.sn || {};

	// loosely based on sn.InputNameList

sn.InputNameList = function(el, opt) {

	this.el = $(el)
		.hide()
	;

//	this.opt = jQuery.extend({}, {
//	}, opt);

	this.opt = jQuery.extend({

		sp: 'ac',					// style prefix

		ksep: ' ',					// separatore per il keyboard input
		kquo: '"',					// quoting per l'input

		sep: ';',					// separatore per gli elementi della lista (input/output)
		
		ac: "\\wàèìòùé:/_'\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF-"	// elenco dei caratteri permessi

	}, opt);

		// cache

	this.reReplace =  new RegExp('[^' + this.opt.ksep + this.opt.kquo + this.opt.ac + ']', 'g');
	this.reValidate = new RegExp('^[' + this.opt.ksep + this.opt.kquo + this.opt.ac + ']$');

		// elementi dell'ui

	this.helper = null;
	this.list = null;			// lista che contiene i bit
	this.listlast = null;		// ultimo elemento della lista
	this.input = null;			// input usato per l'aggiunta di nuovi elementi
	
		// elastic
		
	this.elastic = null;

	this.attach();
};

sn.InputNameList.prototype.attach = function() {

	var self = this;

	this.helper = $('<div class="' + this.opt.sp + '-list" />')
		.insertAfter(this.el)
	;
/*
		.click(function(e){ 
			if ((e.target == list.get(0) || e.target == container.get(0)) && (!focused || (current && current.toElement().get(0) != list.find(':last-child').get(0)))) focusLast();
		});			
*/
	this.list = $('<ol class="' + this.opt.sp + '-bits" />')
		.appendTo(this.helper)
		.click(function() { self.input.focus(); })
	;

	this.listlast = $("<li class='" + this.opt.sp + "-bit-input'><input type='text' /></li>")
		.appendTo(this.list)
	;

	this.input = $('input:text', this.listlast)
		.css({
			border: 0
		})
//		.keypress(function(e) { return self.onKeypress(e); })
		.keydown(function(e) { return self.onKeydown(e); })
//		.bind ('paste', function (e) { return self.onPaste(e); })
		.blur(function(e) { return self.onBlur(e); })

			// evento dall'autocomplete

		.bind ('result', function (e, p1, p2) { return self.onResult(e, p1, p2); })
	;
	
	this.elastic = new sn.ElasticText(this.input);
	
	$(this.input).autocomplete(
		sn.kFC + 'ajax/autocomplete/users',
		{
			width: 300
		}
	);

	this.fromText(this.el.val());
};

sn.InputNameList.prototype.onKeydown = function(e) {

	var
		v = this.input.val()
	;

	if (e.keyCode == 8 && v.length === 0) {		// del

			// elimina l'ultimo bit
			
		this.deleteLastBit();
		
		return false;
	}
/*	
	else if (e.keyCode == 13) {

			// aggiungo solo se non è vuoto
			// TBD: duplicato

		if (v != '') {

			this.addBit(v);

			this.input.val('');
			this.elastic.onResize();

			this.toText();
		}

		return false;
	}
*/
};

sn.InputNameList.prototype.onKeypress = function(e) {

	var
		v = this.input.val(),
		k = String.fromCharCode(e.which), // e.keyCode
		shouldEnd = false
	;

		// validazione del carattere

	if (e.which > 32 && ! this.reValidate.test(k))
		return false;

	if (v.substring(0, 1) == this.opt.kquo && k == this.opt.kquo) {

		v = v.substring(1);
		shouldEnd = true;
	}

	if (shouldEnd || (v.substring(0, 1) != this.opt.kquo && k == this.opt.ksep)) {

			// aggiungo solo se non è vuoto
			// TBD: duplicato

		if (v !== '') {

			this.addBit(v);

			this.input.val('');
			this.elastic.onResize();

			this.toText();
		}

		return false;
	}
};

sn.InputNameList.prototype.onResult = function(e, p1, p2) {

	var
		name = p1[0],
		id = p1[1]
	;
	
	var v = this.input.val();

		// aggiungo solo se non è vuoto
		// TBD: duplicato

	if (v !== '') {

		this.addBit(v, id);

		this.input.val('');
		this.elastic.onResize();

		this.toText();
	}
};

sn.InputNameList.prototype.onBlur = function(e) {

	this.input.val('');
/*
	var v = this.input.val();

		// aggiungo solo se non è vuoto
		// TBD: duplicato

	if (v != '') {

		this.addBit(v);

		this.input.val('');
		this.elastic.onResize();

		this.toText();
	}
*/
};

	// uno due tre
	//   uno    due     tre  
	// uno 'due tre' quattro
	// bb al'fa a c
	// al'fa'be
	// alé*{}[]mm
	// alabarda  spaziale

sn.InputNameList.prototype.onPaste = function(e) {

	var self = this;
	setTimeout(function() {

		var
			v = $.trim(self.input.val()).replace(self.reReplace, ''),
			s = false,
			nv = ''			// TBD: delayed assignment con nv
		;

		do {

			var inq = false;

			for (var i = 0; i < v.length; i++) {

				var
					ch = v.charAt(i),
					tg = ''
				;

				if (i > 0 && ch == self.opt.kquo) {

					if (inq) {
						
						tg = $.trim(v.substr(1, i - 1));
						v = v.substr(i + 2);

					} else {
						
						tg = $.trim(v.substr(0, i));
						v = v.substr(i);
					}
				}

				if (! inq && ch == self.opt.kquo)
					inq = true;

				if (! inq && ch == self.opt.ksep) {

					tg = $.trim(v.substr(0, i));
					v = v.substr(i + 1);
				}

				if (i == v.length - 1) {
					
					tg = $.trim(v.substr(inq ? 1 : 0));
					v = '';
				}

				if (tg !== '') {

					self.addBit(tg);

					break;
				}
			}

		} while (v.length > 0);
		
		self.input.val('');
		self.toText();

	}, 50);
};

sn.InputNameList.prototype.addBit = function(text, id) {

		// lo aggiunge solamente se non c'è già

	if (FlexJS.Utils.InArray(text, this.getTags()))
		return;

	var
		li = $("<li class='" + this.opt.sp + "-bit'>" + text + "</li>"),
		a = $("<a href='#' class='" + this.opt.sp + "-bit-deletebutton'></a>").appendTo(li)
	;

	li.data('v', text);
	li.data('id', id);

	var self = this;
	a.click(function() {

		$(this).parent().remove();
		self.toText();

		return false;
	});

	if (this.list.children().length == 1)
		li.addClass(this.opt.sp + '-first');

		// rende il bit non selezionabile

	if ($.browser.mozilla)
		li.css('MozUserSelect', 'none');
	else if ($.browser.msie)
		li.bind('selectstart', function() { return false; });
	else
		$(li).mousedown(function() { return false; });

	this.listlast.before(li);
};

sn.InputNameList.prototype.deleteLastBit = function() {

	var p = this.list.children().length - 2;
	if (p >= 0) {

		this.list.children(':eq(' + p + ')').remove();
		this.toText();
	}
};

sn.InputNameList.prototype.getTags = function() {

	var a = [];
	this.list.children().each(function() {

		a.push($(this).data('id'));
	});
	
		// togllie l'ultimo elemento che
		// è usato come campo di input
	
	a.pop();

	return a;
};

sn.InputNameList.prototype.toText = function() {

	this.el.val(
		this.getTags()
			.join(this.opt.sep)
	);
};

sn.InputNameList.prototype.fromText = function(text, sep) {

	if (text === '')
		return;
	
	var
		s = sep || this.opt.sep,
		r = text.split(s)
	;

	for (var i = 0; i < r.length; i++)
		this.addBit(r[i]);
};

	// *************************************************************************
	
sn.ElasticText = function(el, opt) {

	this.el = $(el);

	this.opt = jQuery.extend({

		minwidth: 50,
		adjust: 10

	}, opt);

		// elementi dell'ui

	this.helper = null;

	this.attach();
};

sn.ElasticText.prototype.attach = function() {

	var 
		h =
			this.helper =
			$('<span></span>').css({
				'float': 'left',
				'display': 'inline-block',
				'position': 'absolute',
				'left': -1000
			})
			.insertAfter(this.el),
		el = this.el
	;

	$.each([
			'font-size',
			'font-family',
			'padding-left',
			'padding-top',
			'padding-bottom',
			'padding-right',
			'border-left',
			'border-right',
			'border-top',
			'border-bottom', 
			'word-spacing',
			'letter-spacing',
			'text-indent',
			'text-transform'
		], function(i, p){ h.css(p, el.css(p)); }
	);
	
	var
		t = this,
		f = function() { t.onResize(); }
	;
	
	el
		.blur(f)
//		.keyup(f)
		.keydown(f)
//		.keypress(f)
	;
	
	this.onResize();
};

sn.ElasticText.prototype.onResize = function() {

	var
		v = this.el.val()
	;

	this.el.width(this.computeWidth(v));
};

sn.ElasticText.prototype.computeWidth = function(t) {

	this.helper.text(t);
	
	var w = this.helper.width() + this.opt.adjust;
	
	return w < this.opt.minwidth ? this.opt.minwidth : w;
};