
sn = window.sn || {};

/*
	<small class="reltime snUpdatableTS" id="snTS-1253798037">3 giorni fa</small>
*/

sn.UpdatableTS = function() {

	setInterval(sn.UpdatableTS.onTimeout, 1000 * 60);
};

sn.UpdatableTS.onTimeout = function() {

	var req = Array();
	$('.snUpdatableTS').each(function() {

		var ts = this.id.split('-')[1];

		req.push(this.id);
	});

	if (req.length === 0)
		return;

	var url = sn.kFC + 'ajax/updatets';

	var p = {
		ajax: true,
		u: new Date().valueOf(),
		ts: req.join('|')
	};

	jQuery.post(url, p, function(data, textStatus) {

		if (textStatus === 'success') {

			$.each(data.ts, function(i, val) {

				$('#' + i).html(val);
			});
		}

	}, 'json');
};