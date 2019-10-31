
// gestione della visualizzazione progressiva dei commenti

sn = window.sn || {};

sn.MoreComments = function(el) {

	this.el = $(el);
	
	this.attach();
};

sn.MoreComments.prototype.attach = function() {
	
	var me = this;
	this.el
		.click(function() { me.onClick(); });
};

sn.MoreComments.prototype.onClick = function() {
	
	var me = this;

		// estrae dall'href la parte dopo l'anchor
		
	var h = this.el.attr('href').substring(1);

	var url = sn.kFC + h;

	var p = {
		ajax: true,
		u: new Date().valueOf()
	};

	jQuery.get(url, p, function(data, textStatus) {

		if (textStatus === 'success') {

				// ottiene una 'ol'

			var h = $(data.content);

				// aggiunge gli elementi al DOM al posto
				// del link

			var list = me.el.parents('ol:first');
//			me.el.parents('li:first').replaceWith(h.children());
			$('li:first', list).replaceWith(h.children());
			
				// applica agli elementi appena inseriti i controlli del caso
				// TBD: usare una funzione di sn per la gestione

			$('.snConfirmDialog', list).each(function() { new sn.ConfirmDialog(this); });
		}

	}, 'json');

	return false;
};
