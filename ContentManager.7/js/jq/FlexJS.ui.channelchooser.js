fjs.ui = fjs.ui || {};

(function(_) {

	'use strict';

_.ccControl = function(field) {

	this.field = $(field);

	var v = this.field.val();
	this.initialIDs = v === '' ? [] : v.split(',');

	this.items = [];

	this.add(
		this.field.parent().find('.role-cc')
	);
};

_.ccControl.prototype.add = function(el) {

	var me = this;
	$(el).each(function() {

		var i = new fjs.ui.ccItem(this, me);

		me.items.push(i);
	});
};

_.ccControl.prototype.idChanged = function() { this.collectIDs(); };

_.ccControl.prototype.collectIDs = function() {

	var ids = [];
	$.each(this.items, function() {

		$.merge(ids, this.getIDs());
	});

	this.field.val(ids.join(','));
};

	// item del channel chooser

_.ccItem = function(el, owner, opt) {

	this.el = $(el);
	this.owner = owner;

	// this.opt = jQuery.extend({
	// }, opt);

	this.ids = [];

	this.attach();

	this.initialLoad = true;
	this.loadInitialIDsFrom(owner.initialIDs);
	this.initialLoad = false;
};

_.ccItem.prototype.attach = function() {

	this.menu = this.el.find('.cc-popover-content').hide();
	this.sel = this.el.find('.selecteditems');
	this.trigger = this.el.find('a.dropdown-toggle');

	var ul = this.el.find('ul');

	this.mode = ul.data('mode');
	this.inherit = ul.data('inherit') === 1;

	this.pop = null;

	var me = this;
	this.trigger.on('click', function() {

		me.getPopover().show();

		return false;
	});

	if (this.mode === 'select') {

			// select

		this.menu.on('click', 'li', function() {

			var el = $(this);

//			console.log('click', el.data('value'));

			me.pop.hide();

			me.removeAllID();
			me.addID(el.data('value'), el.find('span').text());

			return false;
		});

	} else {

			// tree

		this.menu.on('click', 'input[type="checkbox"]', function() {

			var el = $(this);

			if (el.data('unselectable'))
				return false;

//			console.log('click', el.data('value'), el.parent().text());

			if (el.prop('checked')) {

				me.addID(el.data('value'), el.parent().text());

				if (me.inherit)
					el.parents('ul').each(function() {

						if ($(this).data('mode') !== undefined)
							return false;

						var el = $(this).prev().find('input[type="checkbox"]');

						me.addID(el.data('value'), el.parent().text());
						el.prop('checked', true);
					});

			} else
				me.removeID(el.data('value'));
		});
	}

	this.sel.on('click', '.do-remove', function() {

		var
			el = $(this),
			id = el.parent().data('id')
		;

//		console.log('remove', el.parent().data('id'));

		me.removeID(id);
//		el.parent().remove();

		if (me.mode === 'tree')
			me.menu.find('input[type="checkbox"][data-value=\'' + id + '\']')
				.prop('checked', false)
			;

		return false;
	});

	this.adjustSelClass();
};

_.ccItem.prototype.getIDs = function() { return this.ids; };
_.ccItem.prototype.hasID = function(id) { return $.inArray(id, this.ids) !== -1; };

_.ccItem.prototype.addID = function(id, desc, locked) {

	locked = locked || false;

	id = parseInt(id, 10);
	if (! this.hasID(id)) {

		this.ids.push(id);

		if (! this.initialLoad)
			this.owner.idChanged();

	//	console.log('add', id, desc);

		this.addPill(id, desc, locked);
		this.adjustSelClass();
	}
};

_.ccItem.prototype.removeID = function(id) {

	id = parseInt(id, 10);
	if (this.hasID(id)) {

		this.removePill(id);
		this.adjustSelClass();

		this.ids.splice($.inArray(id, this.ids), 1);

		if (! this.initialLoad)
			this.owner.idChanged();
	}
};

_.ccItem.prototype.removeAllID = function() {

	this.sel.empty();
	this.adjustSelClass();

	this.ids = [];

	if (! this.initialLoad)
		this.owner.idChanged();
};

_.ccItem.prototype.adjustSelClass = function() {

	this.sel.removeClass('empty');
	if (this.sel.children().length === 0)
		this.sel.addClass('empty');
};

_.ccItem.prototype.loadInitialIDsFrom = function(ids) {

	var me = this, myids = this.ids;
	if (this.mode === 'select') {

			// select

		$.each(ids, function() {

			var id = this;
			me.menu.find('li[data-value=\'' + id + '\']').each(function() {

				me.addID(id, $(this).find('span').text());
			});
		});

	} else {

			// tree

		$.each(ids, function() {

			var id = this;
			me.menu.find('input[type="checkbox"][data-value=\'' + id + '\']').each(function() {

				var el = $(this);

				me.addID(id, el.parent().text(), el.data('unselectable') ? true : false);

				el.prop('checked', true);
			});
		});
	}
};

_.ccItem.prototype.addPill = function(id, desc, locked) {

/*jslint laxbreak: true */
	var pill = $(
		locked
			? "<span data-id='" + id + "' class='label label-default cc-pill'>" + desc + "</span>"
			: "<span data-id='" + id + "' class='label label-default cc-pill'>" + desc + " <i class='moon-icon-close-3 icon-white do-remove'></i></span>"
	);

	pill.appendTo(this.sel);
};

_.ccItem.prototype.removePill = function(id, desc) {

	this.sel.find('span.label[data-id="' + id + '"]').remove();
};

_.ccItem.prototype.getPopover = function() {

	if (this.pop === null) {

		this.pop = new _.bst.popoverOnElement(this.el.find('.dropdown-toggle'), {
			position: 'e',
			content: this.menu,

			'class': 'cc-popover'
		});
	}

	return this.pop;
};

})(fjs.ui);