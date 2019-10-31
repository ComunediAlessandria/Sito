
FlexJS.ui = FlexJS.ui || {};

FlexJS.ui.Lookup = function(el, opt) {

	this.el = $(el);

	this.opt = jQuery.extend({

		timeout: 500,		// timeout in ms per l'attivazione
		minlen: 3,			// lunghezza minima per l'attivazione

		onselect: function() {}

	}, opt);

	this.active = false;

	this.timeout = null;
	this.helper = null;

	this.selItem = -1;

	this.attach();
};

FlexJS.ui.Lookup.prototype.attach = function() {

	var self = this;
	this.el.keydown(function(e) {

//		if (self.active) {

			var b = false;
			switch(e.keyCode) {

				case 38: // up
					b = true;
					self.focusPrev();
				break;

				case 40: // down
					b = true;
					self.focusNext();
				break;

				case 9: // tab
				case 13: // return
					b = true;
					self.selectCurrent();
				break;

				case 27:
					b = true;
					self.finish();
				break;

				default:

				if (self.timeout)
					window.clearInterval(self.timeout);

				self.timeout = window.setTimeout(function() {

					self.doAutocomplete();

				}, self.opt.timeout);
			}

			if (b) {

				e.preventDefault();
				return false;
			}
//		}

	});
};

FlexJS.ui.Lookup.prototype.doAutocomplete = function() {

	var v = this.el.val();
	if (v.length < this.opt.minlen)
		return;

	this.active = true;

	if (! this.helper)
		this.openHelper();

	var self = this;
	FlexJS.Ajax.get('sources/mailcomplete/' + v, function(data) {

		self.fillList(data.list);
	});
};

FlexJS.ui.Lookup.prototype.openHelper = function() {

    var offset = this.el.offset();

	this.helper =
		$('<div></div>')
			.hide()
			.addClass('lkResults')
			.css({
				position: 'absolute',
				top: offset.top + this.el.outerHeight(),
				left: offset.left
			})
			.appendTo('body')
	;
};

FlexJS.ui.Lookup.prototype.finish = function() {

	if (this.timeout)
		window.clearInterval(this.timeout);

	this.helper.hide();

	this.active = false;
};

FlexJS.ui.Lookup.prototype.fillList = function(d) {

	var
		ul = $('<ul></ul>'),
		nr = d.length
	;

	var self = this;
	for (var i = 0; i < nr; i++) {

		var li =
			$('<li>' + d[i] + '</li>')
				.click(function() {

					self.selectItem(this);

				})
//				.mousedown(function() {
//				})
//				.mousedown(function() {
//				})
				.data('v', d[i])
		;

		ul.append(li);
	}

	this.helper
		.html(ul)
		.show()
	;

//	var extraWidth = this.helper.outerWidth() - this.helper.width();
//	this.helper.width(this.el.outerWidth() - extraWidth);

};

FlexJS.ui.Lookup.prototype.selectItem = function(item) {

	const i = $(item);

	this.el.val(i.data('v'));

	this.finish();

	this.opt.onselect();
};

FlexJS.ui.Lookup.prototype.selectCurrent = function() {

	var items = $('li', this.helper);

		// così quando uso tab con un solo risultato lo seleziona subito

	this.selectItem(items[ this.selItem > 0 ? this.selItem : 0 ]);
};

FlexJS.ui.Lookup.prototype.focusItem = function(i) {

	var items = $('li', this.helper);
	if (items.length) {

//		if (this.selItem >= 0)
			$(items[ this.selItem ]).removeClass('lkSelect');

		if (i < 0) {

			i = 0;

		} else if (i >= items.length)
			i = items.length - 1;

		$(items[i])
			.addClass('lkSelect')
		;
	}

//	console.log(i);
	this.selItem = i;
};

FlexJS.ui.Lookup.prototype.focusPrev = function() {

	this.focusItem(this.selItem - 1);
};

FlexJS.ui.Lookup.prototype.focusNext = function() {

	this.focusItem(this.selItem + 1);
};