fjs.ui = fjs.ui || {};

(function(_) {

'use strict';

_.ajaxUploadForm = function(el, opt) {

	this.el = $(el);

	this.opt = opt;

	this.attach();
};

_.ajaxUploadForm.init = function() {

	$(document).bind('drop dragover', function (e) { e.preventDefault(); });
};

_.ajaxUploadForm.prototype.attach = function() {

	var me = this;

	this.fi = this.el.find('input[type=file]');
	var id = this.fi.attr('id');

	this.iel = $('<input type="hidden" name="ajax-upload-' + id + '" />')
		.insertAfter(this.fi)
	;

	this.pw = this.el.find('.preview');

	this.el.find('button.remove-image').click(function() {

		me.pw.removeClass('with-file').addClass('without-file');

		me.iel.val('xxxDELxxx');

		var fr = me.el.data('flex-resizer');
		if (fr) {

			me.pw.find('img').removeAttr('src');
			fr.imageWasDeleted();
		}

		return false;
	});

	this.progress = this.el.find('.progress');
	this.progressBar = this.progress.find('.bar');

	this.fi.fileupload({

		dropZone: this.pw, //this.el,
		pasteZone: null,
		dataType: 'json',
		formData: { forFieldName: id, kind: this.opt.kind },
		url: this.opt.url,
		done: function (e, data) {

// console.log(data.result);

			if (data.result.status === 'ok') {

				me.iel.val(data.result.token);

				if (me.opt.kind == 1) {

					var
						i = me.pw.find('img'),
						fr = me.el.data('flex-resizer')
					;

					i.attr('src', data.result.fileurl);

					if (fr)
						fr.resetSize(data.result.width, data.result.height);

				} else {

					me.pw
						.find('.fu-filename a')
							.attr('href', data.result.fileurl)
							.html(data.result.filename)
					;
				}

				me.pw.removeClass('without-file').addClass('with-file');
			}

			me.progress.hide();
		},
		start: function() { me.progressBar.css('width', 0); me.progress.show(); },
		progressall: function (e, data) {

			var p = parseInt(data.loaded / data.total * 100, 10);

			me.progressBar
				.css('width', p + '%')
			;
		},
	});
};

_.ajaxUploadForm.init();

})(fjs.ui);
