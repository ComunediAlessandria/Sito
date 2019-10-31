fjs.ui = fjs.ui || {};
fjs.ui.extTable = fjs.ui.extTable || {};


fjs.ui.extTable = function(el) {

	this.el = $(el);

	this.sel = null;

	this.attach();
};

fjs.ui.extTable.prototype.attach = function() {

	this.el.find('td .PETableTableBlock').hide();

	var me = this;
	this.el.on('click', '.fxExpandCol', function() {

		var
			el = $(this),
			td = el.closest('td'),
			col = td.parent().children().index(td)
		;

		me.selCol(col);

		return false;
	});

	this.selCol(1);
};

fjs.ui.extTable.prototype.selCol = function(col) {

	if (this.sel === col)
		return;

	this.el.find('.fxExpandCol').removeClass('btn-warning');

	var a;

	if (this.sel !== null) {

		a = this.el.find('tr>td:nth-child(' + (this.sel + 1) + ')');

//		a.css('width', 50);
		a.find('.PETableTableBlock').hide();
	}

	this.sel = col;

	a = this.el.find('tr>td:nth-child(' + (this.sel + 1) + ')');

//	a.css('width', 'auto');
	a.find('.PETableTableBlock').show();

	this.el.find('tr:nth-child(1)>td:nth-child(' + (this.sel + 1) + ') .fxExpandCol').addClass('btn-warning');
};