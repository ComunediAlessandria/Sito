/*

	Gestione show/hide Menu-Marika

	Per abilitare il discovery automatico, aggiungere al contenitore del menu la classe:

		js-menu-marika

	Ad esempio:

		<div
			class="... js-menu-marika"
		>


*/

function MenuMarika(el, opt) {

	this.el = $(el);

	this.attach();
}

MenuMarika.prototype.attach = function() {

	this.el.on('click', 'li.dropdown', function(event) {

		const el = $(this);
		if (! el.hasClass('open')) {

			$('li.dropdown').removeClass('open');
			el.addClass('open');

		} else
			el.removeClass('open');
	});

	this.el.on('click', 'li.dropdown.dropdown-submenu', function() {

		 $(this).toggleClass('active');
	});

	this.el.find('.collapse').collapse({ toggle: false });

	this.el.on('click', 'li', function() {

		const
			el = $(this),
			cl = el.children('ul')
		;

		if (cl.length > 0) {

			cl.collapse('toggle');

			return false;

		} else
			el.children('a:first-child').click();
	});
};

MenuMarika.discover = function(els) {

	$(els).each(function() { new MenuMarika(this, {}); });
};

$(function() { MenuMarika.discover('.js-menu-marika'); });

/*

	Gestione Off-canvas menu

	Per abilitare il discovery automatico, aggiungere gli attributi:

		- data-toggle='marika-offcanvas'
		- data-target='<selettore jquery del pannello>'

	Ad esempio:

	<button
		...
		data-toggle='marika-offcanvas'
		data-target='#sidebar'
	>...</button>

*/

function OCPanel(el, opt) {

	this.el = $(el);
	this.opt = opt;

	this.offcanvas = $(this.el.data('target'));

	this.open = false;
	this.overlay = null;

	this.attach();
}

OCPanel.prototype.attach = function() {

	const me = this;
	this.el.on('click', function() { me.doToggle(); });

	$(document).keyup(function(e) {

		if (e.which === 27)
			me.doClose();
	});
};

OCPanel.prototype.getOverlay = function() {

	if (this.overlay === null) {

		this.overlay = $('<div></div>');
		this.overlay.css({
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			bottom: 0,
			left: 0,
			right: 0,
			top: 0,
			// display: 'none',
			height: '100%',
			width: '100%',
			position: 'fixed',
			zIndex: 1
		}).hide().appendTo($('body'));

		const me = this;
		this.overlay.on('click', function(e) { me.doClose(); });
	}

	return this.overlay;
};

OCPanel.prototype.doToggle = function() {

	this[ this.open ? 'doClose' : 'doOpen' ]();
};

OCPanel.prototype.doOpen = function() {

	this.getOverlay().show();

	this.el.removeClass('is-closed').addClass('is-open');
	this.offcanvas.addClass('active');

	$(this.opt.active).addClass('active');

	this.open = true;
};

OCPanel.prototype.doClose = function() {

	this.getOverlay().hide();

	this.el.removeClass('is-open').addClass('is-closed');
	this.offcanvas.removeClass('active');

	$(this.opt.active).removeClass('active');

	this.open = false;
};

OCPanel.discover = function(els) {

	$(els).each(function() {

		new OCPanel(this, {

				// aggiunge/rimuove la classe 'cative' a questi elementi

			active: '.push_container',
		});
	});
};

$(function() { OCPanel.discover('[data-toggle=\'marika-offcanvas\']'); });




/*
$(function() {

		var
			trigger = $('.hamburger'),
			overlay = $('<div style="display: block;"></div>'),
			isClosed = false
		;

		overlay.css({
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			bottom: 0,
			left: 0,
			right: 0,
			top: 0,
			// display: 'none',
			height: '100%',
			width: '100%',
			position: 'fixed',
			zIndex: 1
		}).hide().appendTo($('body'));

		overlay.on('click', function(e) {

		trigger.click(function () {

			hamburger_cross();
		});

			// $('.row-offcanvas').removeClass('active');
			// $('.push_container').removeClass('active');

			// $('#wrapper').toggleClass('toggled');
			// overlay.hide();
			// 	trigger.removeClass('is-open');
			// 	trigger.addClass('is-closed');
			// 	isClosed = false;
		})

		function hamburger_cross() {

			  if (isClosed) {
				overlay.hide();
				trigger.removeClass('is-open');
				trigger.addClass('is-closed');
				isClosed = false;
			  } else {
				overlay.show();
				trigger.removeClass('is-closed');
				trigger.addClass('is-open');
				isClosed = true;
			  }
		  }

		// trigger.click(function () {

		// 	hamburger_cross();
		// });
*/


/*
	 $('li.dropdown').on('click', function(event) {
		 if ($(this).hasClass('open')){
			  $(this).removeClass('open');
		  }else{
			  $('li.dropdown').removeClass('open');
			 $(this).addClass('open');
		 }
	 });

	 $('.MenuVBIG').find('li').on('click', '.dropdown.dropdown-submenu', function() {

		 $(this).toggleClass('active');
	 });

	var ct = $('.MenuVBIG').find('.collapse').collapse({ toggle: false });

	$('.MenuVBIG').on('click', 'li', function() {

		var
			el = $(this),
			cl = el.children('ul')
		;

		if (cl.length > 0) {

			cl.collapse('toggle');

			return false;

		} else
			el.children('a:first-child').click();
	});
*/

/*
	$('[data-toggle="offcanvas"]').click(function (e) {
	  e.preventDefault();
	  $('.row-offcanvas').toggleClass('active');
	  $(this).toggleClass('active');
	  $('body > div').toggleClass('active');
	});

	$('.row-offcanvas').click(function(e){
	  if ($(e.target).hasClass('row-offcanvas') && $(this).is('.active')) {
		$(this).removeClass('active');
	  }
	});

	$(document).keyup(function (e) {

		if (e.which === 27)
			$('[data-toggle="offcanvas"]').click().focus();
	});

});
*/
