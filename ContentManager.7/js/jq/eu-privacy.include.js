window.__flex__eu_cookie_enabled = true;

$(window).on('load', function() {

	if (! window.__flex__eu_cookie_enabled)
		return;

		// nel caso di contenuto in cache (usa il doppio if per non inserire il doppio ampersand - cfr. w3c)

	if (document.cookie)
		if (document.cookie.match(/fx-eu-privacy/))
			return;

	var
		lt = String.fromCharCode(60),
		amp = String.fromCharCode(38),
		tpl = $('#eu-privacy-tpl').html().replace(/&lt;/g, lt).replace(/&gt;/g, '>').replace(/&amp;/g, amp),
		div = lt + 'div />'
	;

	var d = $(div)
		.attr({
			id: 'eu-privacy'
		})
		.on('click', '#eu-privacy-close', function() { sc(); d.removeClass('open').addClass('close'); return false; })
		.append(
			$(div).attr('id', 'eu-privacy-inner').html(tpl)
		)
		.appendTo('body')
	;

	setTimeout(function() { d.addClass('open'); }, 500);

	var sc = function() {

		fjs.ajax.get('euCookie', fjs.noop);
	};
});
