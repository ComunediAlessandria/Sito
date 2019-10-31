
(function() {

		// <meta name='generator' content='FlexCMP - www.flexcmp.com' />

	var found = false;
	$('meta').each(function() {

		if ($(this).attr('name') === 'generator' && $(this).attr('content') === 'FlexCMP - www.flexcmp.com')
			found = true;
	});

	if (! found) {

		alert('Doesn\'t look like a Flex site!'); //NOSONAR
		return;
	}

//	alert('YES! It\'s a Flex site!');

	var base = fjs.AppConfigure.Get('kBaseURL');

	$('head').append("<link rel='stylesheet' type='text/css' href='" + base + 'js/bookmarklet/bookmarklet.css'+ "'>");

	var overlay = $('<div />').attr('id', 'fbk-overlay').hide();

	var dash = $('<div />').attr('id', 'fbk-topline')
		.append('<div style="background-color: #3E4574;"></div>')
		.append('<div style="background-color: #5584B6;"></div>')
		.append('<div style="background-color: #42B0EE;"></div>')
		.append('<div style="background-color: #8ED9F6;"></div>')
	;

	overlay.append(dash);

	var inner = $('<div />').attr('id', 'fbk-inner');

	var logo = $('<a />').attr('id', 'fbk-logo').attr('href', 'http://www.flexcmp.com/')
		.css('background', 'url(' + base + 'js/bookmarklet/logo.png) left center no-repeat');

	inner.append(logo);

	var labelInfo = $('<div />').attr('id', 'fbk-label-info').html('Loading...');

	inner.append(labelInfo);

	var content = $('<div />').attr('id', 'fbk-content');

	inner.append(content);

	var btnClose = $('<a />').attr('id', 'fbk-btn-close').addClass('fbk-btn gray').html('Close')
		.click(function() {

			overlay.fadeOut(500, function() { overlay.remove(); });
		})
	;

	content.append(btnClose);

	var info = $('<div />').attr('id', 'fbk-info');

	content.append(info);

	overlay.append(inner);
	overlay.css('top', -999).show();

	$('body').append(overlay);
//	overlay.slideDown(1000);

	setTimeout(function() {

		overlay
			.css('top', - overlay.height())
			.animate({ top: 0 })
		;

	}, 500);

	fjs.ajax.post('bookmarklet', { op: 'info' }, function(data) {

		var version = data.version;

		info.html('Version: ' + version);

		labelInfo.fadeOut(500);
	});
})();

