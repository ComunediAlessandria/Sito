
window.FlexJS = window.FlexJS || {}

FlexJS.UI = window.FlexJS.UI || {}

	// gestione di un dialog semimodale

FlexJS.UI.Dialog = window.FlexJS.UI.Dialog || function (title, content, w, h, opt) {

	if (typeof FlexJS.UI.Dialog.sInitted === 'undefined')
		this.Init();

	this.mOptions = jQuery.extend({

		width: 400,
		height: 400,

		animate: false

	}, opt || {});

	this.mHeight = h || this.mOptions.height;
	this.mWidth = w || this.mOptions.width;
	this.mTitle = title;
	this.mContent = content;
	this.mShouldAnimate = this.mOptions.animate;

	this.Show();
};

FlexJS.UI.Dialog.prototype.Init = function () {

	if (! FlexJS.UI.Dialog.sInitted) {

		FlexJS.Loader.LoadCSS('js/jq/jDialog/jDialog.css');

		// TBD. fare in modo che il path a se stesso sia una caratteristica impostata
		// senza accedere ad AppConfigure
	    $(document.body)
	      .append("<div id='jD_overlay'></div><div id='jD_window'><div id='jD_caption'></div>"
	        + "<img src='" + FlexJS.AppConfigure.Get('kBaseURL') + "js/jq/jDialog/close.gif' alt='Close window'/></div>");

		$('#jD_window img').click(this.Hide);
		$('#jD_overlay').click(this.Hide);

		var me = this;

		$(window).resize(function () { me.Position(); });
		$(window).scroll(function () { me.Position(); });

		FlexJS.UI.Dialog.sInitted = true;
	}
}

FlexJS.UI.Dialog.prototype.Show = function () {

	$('#jD_frame').remove();
	$('#jD_window').append("<div id='jD_frame' style='border: 1px solid red'>" + this.mContent + "</div>");

	$('#jD_caption').html(this.mTitle);
	$('#jD_overlay').show();

		// dimensiona l'overlay in modo da coprire il contenuto di
		// tutta la pagina

	$('#jD_overlay').css({
		width: Math.max($(document).width(), $(window).width()) + 'px',
		height: Math.max($(document).height(), $(window).height()) + 'px'
	});
/*
	$('#jD_overlay').css({
		width: Math.max($(document).innerWidth(), $(window).innerWidth()) + 'px',
		height: Math.max($(document).innerHeight(), $(window).innerHeight()) + 'px',
		top: $(window).scrollTop() + 'px'
	});
*/
	this.Position();

	if (this.mShouldAnimate)
		$('#jD_window').slideDown('fast');
	else
		$('#jD_window').show();

}

FlexJS.UI.Dialog.prototype.Hide = function () {

  $('#jD_window,#jD_overlay').hide();
}

FlexJS.UI.Dialog.prototype.Position = function () {

	var jWindow = $(window);

	var w = jWindow.width();
	var h = jWindow.height();

	var st = jWindow.scrollTop();
	var sl = jWindow.scrollLeft();

	$('#jD_window').css({
		width: this.mWidth + 'px',
		height: this.mHeight + 'px',
		left: sl + ((w - this.mWidth) / 2) + 'px',
		top: st + ((h - this.mHeight) / 2) + 'px',
		overflow: 'hidden'
	});

	$('#jD_frame').css({
		width: (this.mWidth - 2 - 10) + 'px',
		height: (this.mHeight - 22 - 10) + 'px'
	});

	$('#jD_overlay').css({
		top: st,
		left: sl
	});
}
