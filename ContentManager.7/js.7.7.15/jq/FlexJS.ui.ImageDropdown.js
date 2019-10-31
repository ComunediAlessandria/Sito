

FlexJS.ui = window.FlexJS.ui || {};

FlexJS.ui.sWidgets = {};
FlexJS.ui.registerWidget = function(n, w) { FlexJS.ui.sWidgets[n] = w; };
FlexJS.ui.getWidget = function(n) { return FlexJS.ui.sWidgets[n]; };


FlexJS.ui.ImageDropdown = function(el, opt) {

	this.el = $(el);

	FlexJS.ui.registerWidget(this.el.attr('id'), this);

	this.value = null;
	this.isOpen = false;

	this.options = jQuery.extend({

		initialText: 'Marker',

		width: 50,
		height: 200,

		switcherwidth: 150,

//		closeOnSelect: true,
		buttonHeight: 30,

		onOpen: function() {},
		onClose: function() {},
		onSelect: function() {},
		
		elements: ''
	}, opt);

//	this.button = $('<a href="#" class="flex-ui-imagedropdown-button"><span class="flex-ui-imagedropdown-icon"></span><span class="flex-ui-imagedropdown-title">'+ this.options.initialText +'</span><img class="flex-ui-imagedropdown-selected" /></a>');
	this.button = $('<a href="#" class="flex-ui-imagedropdown-button"><span class="flex-ui-imagedropdown-icon"></span><img class="flex-ui-imagedropdown-selected" /></a>');

	this.switcherpane = $(this.options.elements);

	var me = this;

	this.button.click(function() {

		me.isOpen ? spHide() : spShow();

		return false;
	});

	//show/hide panel functions
	var spShow = function() {
		
		me.isOpen = true;
		
		/* $( */ me.switcherpane /*)*/			.css({
				top: me.button.offset().top + me.options.buttonHeight + 6,
				left: me.button.offset().left
			})
			.slideDown(50)
		;
		
		me.button.css(button_active);
		me.options.onOpen();

		$(document).mousedown(checkExternalMouse);
	};

	var spHide = function() {

		me.isOpen = false;

		$(me.switcherpane)
			.slideUp(50, function() {

				me.options.onClose();
			})
		;
			
		me.button.css(button_default);
		
		$(document).unbind('mousedown', checkExternalMouse);
	};

	var checkExternalMouse = function(e) {
		
		if (! me.isOpen)
			return;

		var t = $(e.target);
		if (
				! t.hasClass('elements') &&
				! t.hasClass('flex-ui-imagedropdown-button') &&
				t.parents('.elements').length === 0
			)
			spHide();
	};

	this.switcherpane.find('a').click(function() {

		me.value = $(this).find('span.value').text();

		me.showValue();

		me.options.onSelect();

		if (me.isOpen)
			spHide();

		return false;
	});

	var assets = FlexJS.AppConfigure.Get('kBaseURL') + 'TemplatesCM/assets/imagedropdown/';

	var button_default = {
		fontFamily: 'Trebuchet MS, Verdana, sans-serif',
		fontSize: '11px',
		color: '#666',
//		background: '#eee',
		background: '#eee url(' + assets + 'buttonbg.png) 50% 50% repeat-x',
		border: '1px solid #ccc',
		'-moz-border-radius': '6px',
		'-webkit-border-radius': '6px',
		textDecoration: 'none',
		padding: '3px 3px 3px 8px',
		width: this.options.width - 11,//minus must match left and right padding 
		display: 'inline-block',
		height: this.options.buttonHeight,
		outline: '0'
	};

	var button_hover = {
		'borderColor':'#bbb',
		'background': '#f0f0f0',
		cursor: 'pointer',
		color: '#444'
	};

	var button_active = {
		color: '#aaa',
		background: '#000',
		border: '1px solid #ccc',
		borderBottom: 0,
		'-moz-border-radius-bottomleft': 0,
		'-webkit-border-bottom-left-radius': 0,
		'-moz-border-radius-bottomright': 0,
		'-webkit-border-bottom-right-radius': 0,
		outline: '0'
	};
	
		// css del bottone

	this.button
		.css(button_default)
		.hover(
			function() {
				me.isOpen ? null : me.button.css(button_hover); 
			},
			function() {

				me.isOpen ? null : me.button.css(button_default); 
			}	
		)
//		.find('.flex-ui-imagedropdown-title').css({
//			'float': 'left',
//			'margin-top': 5,
//			'margin-right': 20,
//			fontSize: '14px'
//		}).end()
		.find('.flex-ui-imagedropdown-selected').css({
//			'float': 'left',
			'margin-top': -10,
			'margin-right': 20
//			fontSize: '14px'
		}).end()
		.find('.flex-ui-imagedropdown-icon').css({
			'float': 'right',
			width: '16px',
			height: '16px',
//			background: '#ccc',
			background: 'url(' + assets + 'icon_color_arrow.gif) 50% 50% no-repeat'
		})
	;	

		// css del menu

	this.switcherpane
		.css({
			position: 'absolute',
			'float': 'left',
			fontFamily: 'Trebuchet MS, Verdana, sans-serif',
			fontSize: '12px',
			background: '#000',
			color: '#fff',
			padding: '8px 3px 3px',
			border: '1px solid #ccc',
			'-moz-border-radius-bottomleft': '6px',
			'-webkit-border-bottom-left-radius': '6px',
			'-moz-border-radius-bottomright': '6px',
			'-webkit-border-bottom-right-radius': '6px',
			borderTop: 0,
			zIndex: 999999,
			width: this.options.switcherwidth - 6 //minus must match left and right padding
		})
		.find('ul').css({
			listStyle: 'none',
			margin: '0',
			padding: '0',
			overflow: 'auto',
			height: this.options.height
		}).end()
		.find('li').hover(
		
			function() {

				$(this).css({
					'borderColor':'#555',
//					background: '#555',
					'background': 'url(' + assets + 'menuhoverbg.png) 50% 50% repeat-x',
					cursor: 'pointer'
				}); 
			},

			function() {

				$(this).css({
					'borderColor':'#111',
					'background': '#000',
					cursor: 'auto'
				}); 
			}
		
		).css({
			width: this.options.width - 30,
			height: '',
			padding: '2px',
			margin: '1px',
			border: '1px solid #111',
			'-moz-border-radius': '4px',
			clear: 'left',
			'float': 'left'
		}).end()
		.find('a').css({
			color: '#aaa',
			textDecoration: 'none',
			'float': 'left',
			width: '100%',
			outline: '0'
		}).end()
		.find('img').css({
			'float': 'left',
			border: '1px solid #333',
			margin: '0 2px'
		}).end()
		.find('.filename').css({
			'float': 'left',
			margin: '3px 0'
		}).end()
		.find('.value').css({
			display: 'none'
		}).end()
	;

	this.el.append(this.button);

	$('body').append(this.switcherpane);

	this.switcherpane.hide();
};

FlexJS.ui.ImageDropdown.prototype.setValue = function(v) {

	this.value = v;
	
	this.showValue();
};

FlexJS.ui.ImageDropdown.prototype.getValue = function() {

	return this.value;
};

FlexJS.ui.ImageDropdown.prototype.showValue = function() {

		// s:<filename>

	if (this.value) {

		var
			parts = this.value.split(':'),
			assets = FlexJS.AppConfigure.Get(parts[0] == 's' ? 'kBaseURL' : 'kDataURL') + 'TemplatesUSR/assets/gLoci/markers/',
			src = assets + parts[1]
		;

	}// else
	//	var src = assets + 'default.png';

	this.button
		.find('.flex-ui-imagedropdown-selected')
			.attr('src', src)
	;
};