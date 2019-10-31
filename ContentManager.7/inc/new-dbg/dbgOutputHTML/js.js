(function(window) {

	'use strict';

	var $ = window.Kimbo;

	$(function() {

		// TBD: delegate per Kimbo
		$('.dbg-stack-openclose').on('click', function() {

			var
				el = $(this),
				t = $(el.data('target'))
			;

			if (el.data('open')) {

				t.hide();
				el.html('&#x25ba;');

				el.data('open', false);

			} else {

				t.show();
				el.html('&#x25bc;');

				el.data('open', true);
			}

			return false;
		});

		// TBD: delegate
		$('.dbg-string-show').on('click', function() {

			var
				el = $(this),
				t = $(el.data('target'))
			;

			t.show();
			el.hide();

			return false;
		});

		$('#dbg-rich-display-toggle').on('click', function() {

			$.getJSON(dbgAjaxServer, { op: 'set', 'var': 'optRichVariableDump', val: $(this).is(':checked') }, function(data) {});
		});

		$('#dbg-par-options').on('change', function() {

			$.getJSON(dbgAjaxServer, { op: 'set', 'var': 'optParameterCheck', val: $(this).val() }, function(data) {});
		});

		$('#dbg-par-fontsize').on('change', function() {
//console.log($(this).val());
			$.getJSON(dbgAjaxServer, { op: 'set', 'var': 'optFontSize', val: $(this).val() }, function(data) { console.log(data); });
		});

/*
		if (typeof(ZeroClipboard) === 'function') {

			ZeroClipboard.config({ moviePath: dbgZCSWF });

			$('.dbg-copybutton').each(function() {

				var zc = new ZeroClipboard(this.id);

				zc.on('complete', function(e, a) {

					//console.log(this, a);

					var el = $(this).closest('span').addClass('done');

					setTimeout(function() { el.removeClass('done'); }, 1000);
				});
			});
		}
*/

		if (typeof(Clipboard) === 'function') {

			new Clipboard('.dbg-copybutton');
		}

	});

})(window);