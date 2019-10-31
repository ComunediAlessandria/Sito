

	// funzioni per la gestione del menu amministrativo
	
sn = window.sn || {};
sn.admin = sn.admin || {};

	// menu è il contenitore di una struttura a menu
	// content è l'elemento all'interno del quale inserire il contenuto

sn.admin.context = function(menu, cnt) {
	
	this.menu = $(menu);
	this.cnt = $(cnt);
	
	this.attach();
};

sn.admin.context.sActivePanel = null;

sn.admin.context.prototype.attach = function() {

	var me = this;

		// deterima tutti i link all'interno del menu
		// ed attacca i gestori

	$('.snAdminMenuItem', this.menu).click(function() {
		
		var p = sn.Utils.MetaFromEl(this, 'panel');
		if (p) {
		
				// verifica se il pannello richiesto è quello attuale

			if (p != sn.admin.context.sActivePanel) {
				
					// TBD: richiede al pannello corrente se può essere chiuso
					
					// TBD: layer di mascheratura per il caricamento del pannello
				
				sn.utils.AjaxRequest('admin/panel/' + p, function(data) {

					me.load(data);

					sn.admin.context.sActivePanel = p;
				});

/*				
				var
					url = sn.kFC + 'ajax/admin/panel/' + p,
					pars = {
						ajax: true,
						u: new Date().valueOf()
					}
				;

				jQuery.get(url, pars, function(data, textStatus) {

					if (textStatus == 'success') {

//						me.cnt.html(data.cnt);
						me.load(data);

						sn.admin.context.sActivePanel = p;

					} else {
						
					}

				}, 'json');
*/
			}
		}
		
		return false;
	});
};

// duplicata in utils
sn.admin.context.prototype.load = function(data) {

		// inserisce, se presente, il contenuto HTML

	if (data.content)
		this.cnt.html(data.content);

		// inserimento degli assets
		
	for (var i in data.assets) {

		if (data.assets[i][0] === 'inc')
			$(document.body).append(data.assets[i][1]);
	}

	// TBD: eseguire solo al caricamento
	setTimeout(function() {
	
		for (var i in data.assets) {
		
			if (data.assets[i][0] === 'exec')
				eval(data.assets[i][1]);
		}
	}, 1000);

};

new sn.admin.context('#leftmenu', '#content');