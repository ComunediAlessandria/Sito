sn = window.sn || {};

sn.ConfirmDialog = function(el, opt) {
	
	this.el = $(el);

//	this.opt = jQuery.extend({}, {
//	}, opt);

	this.attach();
};

sn.ConfirmDialog.sHelper = null;
sn.ConfirmDialog.sOverlay = null;

sn.ConfirmDialog.prototype.attach = function() {
	
	var me = this;
	this.el
		.click(function() { return me.onClick(); })
	;
};

sn.ConfirmDialog.prototype.onClick = function() {

	var me = this;

	var m = sn.Utils.MetaFromEl(this.el, 'dialoginfo');
	if (m) {

			// il nome della view è: ajax/dialog/<parametri>
			// 
			// nel caso in cui sia una view di applicazione,
			// la trasforma in questo modo
			// 
			// app.<application>/ajax/dialog/<parametri>
		
		var url;
		if (m.substr(0, 4) === 'app.') {

			url = sn.kFC + m.split('/')[0] + '/ajax/dialog/' + m.split('/').slice(1).join('/');

		} else
			url = sn.kFC + 'ajax/dialog/' + m;

		var p = {
			ajax: true,
			u: new Date().valueOf()
		};

		jQuery.get(url, p, function(data, textStatus) {

			if (textStatus == 'success') {

				var wnd = $(window), doc = $(document);

				if (sn.ConfirmDialog.sOveray)
					sn.ConfirmDialog.sOveray.remove();

				sn.ConfirmDialog.sOveray = $('<div/>').appendTo(document.body)
					.addClass('snOverlay')
					.css({
						borderWidth: 0, margin: 0, padding: 0,
						position: 'absolute', top: 0, left: 0,
						width: doc.width(),
						height: doc.height(),
						zIndex: 1000
					});

				if (sn.ConfirmDialog.sHelper)
					sn.ConfirmDialog.sHelper.remove();

				sn.ConfirmDialog.sHelper = $('<div />')
					.css({
						position: 'fixed',
						zIndex: 1001,
						display: 'none'
					})
					.addClass('snDialog')
				;

					// aggiunge il contenuto e gli eventuali assets

				sn.utils.addAssets(data, sn.ConfirmDialog.sHelper);
				sn.ConfirmDialog.sHelper.appendTo('body');

/*					//

				$('form', sn.ConfirmDialog.sHelper).each(function() {

					
					console.log(a);
				});
*/
					// centra il dialog

				sn.ConfirmDialog.sHelper.css({
					top: /* doc.scrollTop() + */ (wnd.height() - sn.ConfirmDialog.sHelper.height()) / 5,
					left: (wnd.width() - sn.ConfirmDialog.sHelper.width()) / 2
				});

					// workaround per IE6 che non supporta il
					// posizionamento 'fixed'

				if (sn.isIE6) {
					
					sn.ConfirmDialog.sHelper.css({
						position: 'absolute',
						top: wnd.scrollTop() + 100
					});

					$(window).scroll(function() {
						sn.ConfirmDialog.sHelper.css('top', $(this).scrollTop() + 100);
					});
				}

					// aggiunge gli handler per i comandi

				sn.Utils.getElByRole('cmdok', sn.ConfirmDialog.sHelper).click(function() {

						// se nel dialog è presente un form, deve eseguire
						// un'azione di post invece che di salto

					var f = $('form', sn.ConfirmDialog.sHelper);
					if (f.size() == 1) {

							// se action è vuoto, la eredito
							// dal link

						var a = f.attr('action');
						if (a === '')
							f.attr(
								'action',
								sn.utils.fixRelativeLink(
									me.el.attr('href')
								)
							);

						f.submit();

						return false;
					}

					me.Dismiss();

						// esegue l'azione specificata nell'href originario
						// solamente se diversa da '#'

					var h = me.el.attr('href');
					if (h != '#')
						window.location.href = h;

					return false;
				});

				sn.Utils.getElByRole('cmdcancel', sn.ConfirmDialog.sHelper).click(function() {

					me.Dismiss();
					
					return false;
				});
				
				sn.ConfirmDialog.sHelper.show();
				$('body').keydown(function(e) {
					
					if (e.keyCode == 27)
						me.Dismiss();
				});
			}

		}, 'json');
	}
	
	return false;
};

sn.ConfirmDialog.prototype.Dismiss = function() {

	if (sn.ConfirmDialog.sHelper)
		sn.ConfirmDialog.sHelper.remove();

	if (sn.ConfirmDialog.sOveray)
		sn.ConfirmDialog.sOveray.remove();
};