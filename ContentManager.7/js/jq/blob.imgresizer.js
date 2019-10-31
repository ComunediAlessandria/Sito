var blob = window.blob || {};

blob.imgresizer = function(prefix, opt) {

	this.prefix = prefix;
	this.el = $('#' + prefix + 'cnt');

	this.opt = jQuery.extend({}, {

		fuBox: false

	}, opt);

	this.attach();
};

blob.imgresizer.prototype.attach = function() {

	$('#' + this.prefix + 'enabled').click(fjs.proxy(this.onEnableToggle, this));
	$('#' + this.prefix + 'constrain').click(fjs.proxy(this.onConstrainToggle, this));

	// $('#' + this.prefix + 'width, #' + this.prefix + 'height')
	//	.keydown(blob.imgresizer.numericInputFilter)
	//	.blur(FlexJS.proxy(this.onTextSizeChanged, this))
	// ;

	$('#' + this.prefix + 'width')
		.keydown(blob.imgresizer.numericInputFilter)
		.blur(FlexJS.proxy(this.onTextSizeWidthChanged, this))
	;

	$('#' + this.prefix + 'height')
		.keydown(blob.imgresizer.numericInputFilter)
		.blur(FlexJS.proxy(this.onTextSizeHeightChanged, this))
	;

	this.refimage = $(this.opt.fuBox).find('.preview img');

	$(this.opt.fuBox).data('flex-resizer', this);

	this.el.on('click', '.command', fjs.proxy(this.onCommand, this));

	var
		ow = this.refimage.data('owidth'),
		oh = this.refimage.data('oheight')
	;

	this.originalSize = [ow, oh];
	this.ar = ow / oh;

	this.onEnableToggle();
};

	// invocata dall'esterno se l'immagine cambia (eg, ajax upload)

blob.imgresizer.prototype.resetSize = function(w, h) {

	this.originalSize = [w, h];
	this.ar = w / h;

	this.resetValues();
	this.onEnableToggle();
};


// blob.imgresizer.prototype.reset = function() {

//	$('#' + this.prefix + 'enabled').prop('checked', false);

//	$('#' + this.prefix + 'width').val('');
//	$('#' + this.prefix + 'height').val('');

//	this.rsDestroy();
//	this.rsCreate();
// };

	// reimposta i valori iniziali nell'immagine

blob.imgresizer.prototype.resetValues = function() {

	$('#' + this.prefix + 'width').val(this.originalSize[0]);
	$('#' + this.prefix + 'height').val(this.originalSize[1]);
};

	// abilitazione / disabilitazione

blob.imgresizer.prototype.enableResize = function() {

	this.attachResizeable();
};

blob.imgresizer.prototype.disableResize = function() {

	this.detachResizeable();
};

blob.imgresizer.prototype.hasImage = function() {

	return $(this.opt.fuBox).find('.preview').hasClass('with-file');
};

	// resizeable lifetime

blob.imgresizer.prototype.attachResizeable = function() {

	this.refimage.resizable({

		aspectRatio: false,
		handles: 'se',

//		ghost: true,
//			animate: true,

		resize: FlexJS.proxy(this.onImageSizeChanged, this)
	});

	this.hasResizeable = true;
};

blob.imgresizer.prototype.detachResizeable = function() {

	if (this.hasResizeable) {

		this.refimage.resizable('destroy');

		this.refimage.css({ width: this.originalSize[0], height: this.originalSize[1] });

		this.hasResizeable = false;
	}
};

blob.imgresizer.prototype.onCommand = function(e) {

	var el = $(e.target), cmd = el.data('command');

	if (cmd === 'reset') {

		this.resetValues();
		this.onEnableToggle();
	}

	return false;
};

blob.imgresizer.prototype.onEnableToggle = function() {

	var en = $('#' + this.prefix + 'enabled').is(':checked');
	if (en) {

		this.enableResize();

		if (this.hasResizeable) {

			this.onConstrainToggle();

				// euristica

			if (parseInt($('#' + this.prefix + 'width').val(), 10) < 10) {

				$('#' + this.prefix + 'width').val(this.refimage.width());
				$('#' + this.prefix + 'height').val(this.refimage.height());

			} else
				this.onTextSizeChanged();
		}

	} else {

		this.disableResize();
	}

	$('.controls', this.el)[en ? 'slideDown' : 'slideUp']();
//	$('.controls', this.el)[en ? 'fadeIn' : 'fadeOut']();

// tolto perchè gli oggetti disabilitati non vengono inseriti nel POST
//	$('.controls input', this.el)[en ? 'removeAttr' : 'attr']('disabled', 'disabled');
};

blob.imgresizer.prototype.onConstrainToggle = function() {

	var m = $('#' + this.prefix + 'constrain').is(":checked");

	this.refimage.resizable('option', 'aspectRatio', m);
};

blob.imgresizer.prototype.onImageSizeChanged = function(e, ui) {

	$('#' + this.prefix + 'width').val(Math.floor(ui.size.width));
	$('#' + this.prefix + 'height').val(Math.floor(ui.size.height));
};

blob.imgresizer.prototype.onTextSizeWidthChanged = function() {

	if ($('#' + this.prefix + 'constrain').is(":checked")) {

		var w = parseInt($('#' + this.prefix + 'width').val(), 10);

		if (w > 0)
			$('#' + this.prefix + 'height').val(Math.floor(w / this.ar));
	}

	this.onTextSizeChanged();
};

blob.imgresizer.prototype.onTextSizeHeightChanged = function() {

	if ($('#' + this.prefix + 'constrain').is(":checked")) {

		var h = parseInt($('#' + this.prefix + 'height').val(), 10);

		if (h > 0)
			$('#' + this.prefix + 'width').val(Math.floor(h * this.ar));
	}

	this.onTextSizeChanged();
};

blob.imgresizer.prototype.onTextSizeChanged = function() {

	var
		w = parseInt($('#' + this.prefix + 'width').val(), 10),
		h = parseInt($('#' + this.prefix + 'height').val(), 10)
	;

	// this.refimage.parent()
	//	.width(w)
	//	.height(h)
	// ;

	if (w > 0 && h > 0) {

		this.refimage
			.width(w)
			.height(h)
		;

		this.refimage.parent()
			.width(w)
			.height(h)
		;
	}
};

blob.imgresizer.numericInputFilter = function(e) {

	if (e.keyCode !== 8 && e.keyCode !== 9 && (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 95 || e.keyCode > 106))
		e.preventDefault();
};


	// funzione esterne

blob.imgresizer.prototype.imageWasDeleted = function() {

	$('#' + this.prefix + 'enabled').prop('checked', false);

	this.onEnableToggle();

	this.refimage.removeAttr('style');
};

/*
blob.imgresizer.prototype.blur = function() {

		// allinea solo se il ridimensionamento è abilitato

	var en = $('#' + this.prefix + 'enabled').is(':checked');
	if (en) {

		var
			w = parseInt($('#' + this.prefix + 'width').val(), 10),
			h = parseInt($('#' + this.prefix + 'height').val(), 10)
		;

		this.refimage.parent()
			.width(w)
			.height(h)
		;

		this.refimage
			.width(w)
			.height(h)
		;
	}
};

blob.imgresizer.prototype.endis = function() {

	var en = $('#' + this.prefix + 'enabled').is(':checked');
	if (en)
		this.controlsToImage();

// tolto perchè gli oggetti disabilitati non vengono inseriti nel POST
//	$('.controls input', this.el)[en ? 'removeAttr' : 'attr']('disabled', 'disabled');

	$('.controls', this.el)[en ? 'slideDown' : 'slideUp']();

	this[en ? 'rsActivate' : 'rsDeactivate']();

	this.rsAspect();
};


	// gestione del resize dinamico dell'immagine

blob.imgresizer.prototype.rsActivate = function() {

//	this.refimage.siblings('.ui-resizable-handle').show();
	this.refimage.resizable( "enable" );
};

blob.imgresizer.prototype.rsDeactivate = function() {

//	this.refimage.siblings('.ui-resizable-handle').hide();
	this.refimage.resizable( "disable" );
	this.refimage.parent().css('opacity', 1);
};

blob.imgresizer.prototype.rsAspect = function() {

	var m = $('#' + this.prefix + 'constrain').is(":checked");

	this.refimage.resizable('option', 'aspectRatio', m);
};

blob.imgresizer.prototype.controlsToImage = function() {

	$('#' + this.prefix + 'width').val(this.refimage.width());
	$('#' + this.prefix + 'height').val(this.refimage.height());
};

blob.imgresizer.prototype.rsChange = function(event, ui) {

//	var i = $(this.opt.refimage);

	this.controlsToImage();

	// ui.size.width += (ui.size.width - ui.originalSize.width);
	// //if you need vertical resize also i can image you figured out how to do that
	// //hint: ui.size.height += ....

	// //not knowing how you center your stuff i do it the jquery-ui way can be left out
	// $(this).position({
	//		of: $(this).parent(),
	//		my: "center center",
	//		at: "center center"
	// });

};
*/
	// fix problema di ui.resizeable
	// che non riesce ad attivare/deattivare il mantenimento
	// dell'aspect ratio una volta inizializzato

$.extend($.ui.resizable.prototype, (function(o) {

	return {

		_mouseStart: function (e) {

			this._aspectRatio = !! this.options.aspectRatio;

			return(o.call(this, e));
		}
	};

})($.ui.resizable.prototype._mouseStart));

