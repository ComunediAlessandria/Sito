
sn = window.sn || {};

/*

	Aggiornamento del wall
	
	all: mostra tutti i contenuti (0) o solo quelli dell'utente (1)

*/

sn.UpdateWall = function(el, eid, tm, lasttm, all) {

	this.all = all || 0;
	this.eid = eid;

	this.$el = $(el);
	
		// TS che indica a quale data sono aggiornati
		// i post presenti sul wall

	this.tm = tm;

		// TS che indica il ts dell'ultimo post visualizzato

	this.lasttm = lasttm;

//	var me = this;
//	setInterval(function() { me.onTimeout(); }, 1000 * 10);
	setInterval(sn.proxy(this.onTimeout, this), 1000 * 10);
};

sn.UpdateWall.prototype.onTimeout = function() {

	var url = 'updatewall/' + this.eid + '/+' + this.tm + (this.all == 0 ? '/all' : '/user');

	var me = this;
	sn.utils.AjaxRequest(url, function(data) {

		me.tm = data['tm'];
		if (data['n'] > 0) {

			var els = $(data['cnt']).hide();
			$('ol', me.$el).prepend(els);
			els.fadeIn(1500);

				// aggiorna i gestori degli eventi per il sn

			sn.ApplyDOMHandler(me.$el);
		}

	});
};

sn.UpdateWall.prototype.setPagerControl = function(el) {

	this.ctl = $(el);
	
	this.ctl.click(sn.proxy(this.onClick, this));
};

sn.UpdateWall.prototype.onClick = function() {
	
	var url = 'updatewall/' + this.eid + '/-' + this.lasttm + (this.all == 0 ? '/all' : '/user');

	var me = this;
	sn.utils.AjaxRequest(url, function(data) {

		me.lasttm = data['tm'];
		if (data['n'] > 0) {

			var h = me.ctl.attr('href');

			var els = $(data['cnt']).hide();
			$(h).append(els);
			els.fadeIn(1500);

				// aggiorna i gestori degli eventi per il sn

			sn.ApplyDOMHandler(me.$el);

		} else
			me.ctl.fadeOut();

	});
	
	return false;
};
