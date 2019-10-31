javascript: (function(b) {

	if (fjs) {
		if (b = fjs.AppConfigure.Get('kBaseURL')) {

			var js = document.createElement('script');
			js.setAttribute('src', b + 'js/bookmarklet/bookmarkletPayload.js?x=' + (new Date()).getTime());
			document.body.appendChild(js);
		}
	}
}());
