
FlexJS.ui = FlexJS.ui || {};

(function(_) {

	_.editorManager = function() {

		this.tb = null; // toolbar
		this.ei = {}; // editor instances
		this.ai = null; // active editor instance

		this.blurHandler = new fjs.delayedFunction(200, fjs.proxy(this.hideToolbar, this));

		$('form').on('submit', fjs.proxy(this.sync, this));

		this.grabCSS();
	};

	_.editorManager.sCSSRules = null;
	_.editorManager.prototype.grabCSS = function() {

		var styles = ['.userFormat1', '.userFormat2', '.userFormat3', '.editPar'];

		var rs = [];

		var ss = _.editorManager.getCSS(document, 'BlobEdit');
		if (ss !== null) {

			for (var i = 0, m = styles.length; i < m; i++) {

				var r = _.editorManager.getCSSRule(document, ss, styles[ i ]);

					// gli stili potrebbero non essere stati definiti

				if (r !== false)
					rs.push(r.cssText);
			}
		}

		_.editorManager.sCSSRules = rs.join(' ');
	};

	_.editorManager.getCSS = function(document, name) {

		var ss = null;
		for (var i = 0; i < document.styleSheets.length; i++) {

				// nel caso di stili inline, .href non è definito

			if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf(name) !== -1) {

				ss = document.styleSheets[i];
				break;
			}
		}

		return ss;
	};

	_.editorManager.getCSSRule = function(document, ss, ruleName) {

		ruleName = ruleName.toLowerCase();

		var
			j = 0,
			cssRule = false
		;

		do {

			cssRule = ss.cssRules[j];

			if (cssRule && cssRule.selectorText.toLowerCase() === ruleName)
				return cssRule;

			j++;

		} while (cssRule);

		return false;
	};
/*
	_.editorManager.addCSS = function(document, title) {

		var node = document.createElement('style');

		node.type = 'text/css';
		node.rel = 'stylesheet';
		node.media = 'screen';
		node.title = title;

			// inserisce l'elemento nella sezione 'head'
			// creandola se necessario

		var head = document.getElementsByTagName('head');
		if (head.length === 0) {

			head = document.createElement('head');
			document.getElementsByTagName('body')[0].parentNode.appendChild(head);

		} else
			head = head[0];

		head.appendChild(node);
console.log(node);
		return node;
	};

	_.editorManager.addCSSRule = function(document, ss, rule) {
//	_.editorManager.addCSSRule = function(ss, rule) {
console.log(document.styleSheets[0]);
//		document.styleSheets[0].insertRule(rule.cssText, 0);
		ss.insertRule(rule.cssText, 0);
	};
*/

		// els è/sono textarea

	_.editorManager.prototype.add = function(els) {

		var me = this;
		$(els).each(function() { me.addSingleElement($(this)); });
	};

	_.editorManager.prototype.addSharedToolbar = function(el) {

		this.tb = new _.toolbar(el, {}, this);
	};

	_.editorManager.prototype.addSingleElement = function(el) {

		this.ei[ el.attr('id') ] = new _.editor(el, {}, this);
	};

	_.editorManager.prototype.setActiveEditor = function(editor) {

		this.ai = editor;

		if (editor !== null) {

			editor.positionToolbar(this.tb);

			this.blurHandler.suspend();

		} else
			this.blurHandler.activate();
	};

	_.editorManager.prototype.getActiveEditor = function() {

		return this.ai;
	};

	_.editorManager.prototype.hideToolbar = function() {

		this.tb.hide();
	};

		// effettua la sincronia prima di un submit() poiché
		// se eseguito via codice non invoca gli eventi impostati

	_.editorManager.prototype.sync = function() {

		$.each(this.ei, function() { this.sync(); });
	};

		// singleton

	_.editorManager.si = null;
	_.editorManager.i = function() {

		if (_.editorManager.si === null)
			_.editorManager.si = new _.editorManager();

		return _.editorManager.si;
	};

		//
		// E D I T O R
		//

	_.editor = function(el, opt, mgr) {

		this.el = $(el);
		this.id = this.el.get(0).id;
		this.opt = opt;
		this.mgr = mgr;

		this.attach();
	};

	_.editor.prototype.attach = function() {

//		console.log('attach to', this.id);

		var e = this.editor = new wysihtml5.Editor(this.id, {
//  toolbar:      "wysihtml5-toolbar", // id of toolbar element
			parserRules: {
				tags: {
					strong: {
						set_attributes: {
							'class': 'userFormat1'
						}
					},
//					b:      {},
//					i:      {},
					em:     {
						set_attributes: {
							'class': 'userFormat2'
						}
					},
					br:     {},
					// p:      {

					// },
					div:    {
						rename_tag: 'div'
					},
					span:   {

						check_attributes: {
							'class':   function(av) {
								return av;
							}
						},
					},
//					ul:     {},
//					ol:     {},
//					li:     {},
					a:      {
//						set_attributes: {
//							href: ''
//							target: '_blank',
//							rel:    'nofollow'
//						},
						check_attributes: {
							href:   function(av) { return '[[' + _.editor.normalizeHREF(av) + ']]'; }
						},
					}
				}
			}
		});

		var c = this.composer = this.editor.composer;

		var self = this;
		e
			.on('focus', function() { self.mgr.setActiveEditor(self); })
			.on('blur', function() { self.mgr.setActiveEditor(null); })
			.on('paste', function() {

				setTimeout(rif, 10);
			});
		;

		var rif = $.proxy(this.resize, this);
		e.on('load', function() {

			c.element.addEventListener('keyup', rif, false);
			c.element.addEventListener('blur', rif, false);
			c.element.addEventListener('focus', rif, false);

			rif();
		});

		var ifr = this.el.nextAll('iframe').first().get(0).contentDocument; // TBD: cache

			// copia all'interno dell'iFrame i CSS significativi per
			// la gestione delle stilizzazioni di paragrafo
			//
			// TBD: opzione di configurazione
/*
		var css = _.editorManager.addCSS(ifr, 'FlexDynamicCSS');
		for (var i = 0, m = _.editorManager.sCSSRule.length; i < m; i++)
			_.editorManager.addCSSRule(ifr, css, _.editorManager.sCSSRule[i]);
//			_.editorManager.addCSSRule(css, _.editorManager.sCSSRule[i]);
*/
        $(ifr).contents()
			.find('head')
				.append('<style type="text/css" media="screen" title="FlexDynamicCSS">' + _.editorManager.sCSSRules + '</style>')
			.end()
			.find('body')
				.addClass('editPar')
		;

//		$('body', ifr).addClass('editPar'); //.css({margin: 1});

		this.composer.element.style.overflow = 'hidden';
	};

	_.editor.prototype.resize = function() {

//        return this.$iframe.css('min-height', this.$body.height() + this.extraBottomSpacing());

		var
			cIFrame = this.composer.sandbox.getIframe(),
			cBody = this.composer.element
		;

		cIFrame.style.margin = 0;
		cIFrame.style.padding = 0;
//		this.composer.element.style.overflow = 'hidden';

//console.log(this.composer.element.scrollHeight, $(this.composer.element).height());

if (this.composer.element.scrollHeight > 0)
	$(cIFrame).height(this.composer.element.scrollHeight + 0);

return;

/*
		document.documentElement.style.height = '';
		document.body.style.height = '';


		cIFrame.style.margin = 0;
		cIFrame.style.padding = 0;
//		this.composer.element.style.overflow = 'hidden';

		cIFrame.style.height = (this.composer.element.scrollHeight + 1) + 'px';

return;
*/


/*
		if ($(cIFrame).is(':hidden'))
			return;

		var h = Math.max(this.composer.element.scrollHeight, 100);
//		var h = Math.max($(this.composer.element).height(), 100);

//		if (this.composer.element.scrollHeight > 200)
			cIFrame.style.height = h + 'px';

		cIFrame.style.margin = 0;
		cIFrame.style.padding = 0;
		this.composer.element.style.overflow = 'hidden';
*/
	};

	_.editor.prototype.focus = function() { this.editor.focus(); };

	_.editor.prototype.positionToolbar = function(tb) {

		/*jshint laxbreak:true */
		var i = this.editor.currentView === this.editor.textarea
				? this.el
				: this.el.nextAll('iframe').first(),	// cacheare
			o = i.offset() //,
		;
/*
		var
			i = this.el.nextAll('iframe').first(),	// cacheare
			o = i.offset() //,
//			h = i.height()
		;
*/
		tb.setPosition(o.top/* + h*/, o.left);
	};

	_.editor.prototype.performCommand = function(cmd, a1, a2) {

		this.composer.commands.exec(cmd, a1, a2);
	};

	// _.editor.prototype.performCommandWithToggle = function(cmd, a1, a2) {

 //        wysihtml5.commands.formatInline.execWithToggle(this.composer, cmd, a1, a2);
	// };

	_.editor.prototype.removeFormat = function() {

		var range = this.composer.selection.getRange();

		// var applier = new wysihtml5.selection.HTMLApplier(['span'], 'userFormat3', /userFormat3/, true);
		// applier.undoToRange(range);

		range.splitBoundaries();

		var formattingEls = range.getNodes([1], function(el) {

			return (el.tagName === 'SPAN' && el.className.indexOf('userFormat3') !== -1) || el.tagName === 'A'; // && getComputedDisplay(el) == "inline";
		});

		var replaceWithOwnChildren = function(el) {

			var parent = el.parentNode;
			while (el.hasChildNodes())
				parent.insertBefore(el.firstChild, el);

			parent.removeChild(el);
		}

		for (var i = 0, el; el = formattingEls[i++]; )
			replaceWithOwnChildren(el);

		// var s = wysihtml5.commands.formatInline.state(this.composer, 'removeFormat', 'SPAN');
		// if (s.length > 0)
		//		$(s[0]).removeAttr('class');

		this.composer.commands.exec('removeFormat');
	};

	_.editor.prototype.removeAllFormat = function() {

		var h = this.editor.getValue(), CR = '\n';

		h = h.replace(/\n+/g, CR);

			// cfr. gmail

		h = h.replace(/<style([\s\S]*?)<\/style>/gi, '');
		h = h.replace(/<script([\s\S]*?)<\/script>/gi, '');
		h = h.replace(/<\/div>/ig, CR);
		h = h.replace(/<\/li>/ig, CR);
		h = h.replace(/<li>/ig, '  *  ');
		h = h.replace(/<\/ul>/ig, CR);
		h = h.replace(/<\/p>/ig, CR);
		h = h.replace(/<br\s*[\/]?>/gi, CR);
		h = h.replace(/<[^>]+>/ig, '');

			// elimina i CR in testa, in coda

		// ... TBD ...

			// ripristina le andate a capo in html
			// (occorrenze multiple sono collassate)

		h = h.replace(/\n/g, '<br />');

		this.editor.setValue(h, /* parse = */ false);
	};

		// view: composer o HTML

	_.editor.prototype.setViewHTML = function() { this.editor.fire('change_view', 'textarea'); };
	_.editor.prototype.setViewComposer = function() { this.editor.fire('change_view', 'composer'); };
	_.editor.prototype.toggleView = function() {

		if (this.editor.currentView === this.editor.textarea)
			this.setViewComposer();
		else
			this.setViewHTML();
	};

		// sincronia TA <-> editor

	_.editor.prototype.sync = function() {

		this.editor.synchronizer.sync(true);

//console.log(this.el.val());
	};

		// gestione dei link

	_.editor.prototype.getHREFOfSelection = function() {

		var s = this.composer.commands.state('createLink');

			// array di 'a' oppure 'false'

		if ($.isArray(s)) {

			if (s.length === 1)
				return _.editor.normalizeHREF(s[0].href);
		}

		return null;
	};

	_.editor.prototype.createLinkWithSelection = function(href, title) {

		href = '[[' + href + ']]';

			// 'createLink' ha una funzionalità 'toggle', per cui nel caso si
			// debba modificare il link ad un elemento esistente
			// agisce direttamente sul DOM

		var s = this.composer.commands.state('createLink');
		if ($.isArray(s)) {

			if (s.length === 1) {

				s[0].href = href;

				return;
			}
		}

			// crea un nuovo link

		var r = this.composer.selection.getRange();
		if (r.startOffset === r.endOffset) {

			this.composer.commands.exec('insertHTML', '<a href=\'' + href + '\'>' + title + '</a>');

		} else
			this.composer.commands.exec('createLink', href);
	};

		// i link vengono passati col 'protocol' minuscolo ...
		// che quindi va in conflitto con i descrittori flex

	_.editor.normalizeHREF = function(h) {

		if (! h) return;

			// poiché i link vengono visti senza protocollo, l'attributo href
			// lo restituisce completo ...
			//
			// http://pollon-v.furuz/cverond/FlexCMP2/cm/pages/[[BLOB:ID=3726]]

		var m = h.match(/\[\[(.*)\]\]/);
		if (m !== null)
			h = m[1];

		if (h.substr(0, 2) === '[[')
			h = h.substr(2, h.length - 4);

		if (h.match(/^(blob|html|php|ex):/i)) {

			var c = h.split(':');
			c[0] = c[0].toUpperCase();
			return c.join(':');
		}

		return h;
	};

	/*

		TOOLBAR

	*/

	_.toolbar = function(el, opt, mgr) {

		this.el = $(el);

		this.opt = opt;
		this.mgr = mgr;

		this.attach();
	};

	_.toolbar.prototype.attach = function() {

		this.usePop = true;

			// estrae l'elemento dal DOM e lo riposiziona

		if (this.usePop) {

			this.el
	//			.hide()
				.detach()
	//			.css({
	//				position: 'absolute'
	//			})
	//			.appendTo('body')
			;

			/*jshint laxbreak:true */
			this.pop = new FlexJS.ui.popover({

		//		class: 'ui pageinfo',
				placement: 'top',
				relative: 'left',
		//		onClick: function(e) { console.log(e); },

		//		width: 800,

		//		title: '<button type="button" class="close" data-popover="dismiss"><i class="icon-remove-sign"></i></button><span class="title"></span>' /*+ node.data.title*/,
				content: this.el

		//		placeholders: {
		//			title: '.title',
		//			content: '.pageinfo'
		//		},
		//
		//		handlers: {
		//			'button.edit': ppb,
		//			'button.del': ppb,
		//			'button.add': ppb,
		//			'button.pedit': ppb
		//		}
			});

			// fixthis
			this.pop.getHelper().find('h3').remove();

		} else {

			this.el
				.hide()
				.detach()
				.css({
					position: 'absolute'
				})
				.appendTo('body')
			;
		}

		var me = this;

		this.el.find('.command')
			.click(function(e) {

				var
					el = $(this),
					editor = me.mgr.getActiveEditor()
				;

				if (editor !== null) {

					switch (el.data('command')) {

						case 'bold':

//								editor.performCommand('bold');
								editor.performCommand('formatInline', 'strong');

							break;

						case 'italic':

//								editor.performCommand('italic');
								editor.performCommand('formatInline', 'em');

							break;

						case 'underline':

//								editor.performCommand('underline');
//								editor.performCommandWithToggle('formatInline', 'span', 'userFormat3', /userFormat3/);

								editor.performCommand('setHighlight');
							break;

						case 'x':

								editor.removeFormat();

							break;

						case 'xf':

								editor.removeAllFormat();

							break;

						case 'link':

								var page = editor.getHREFOfSelection();

								me.choosePage(page);

							break;

						case 'html':

								editor.toggleView();

							break;
					}
				}

	//			editor.focus();

				e.preventDefault();
			})
			.mousedown(function(e) { e.preventDefault(); })
		;

	};

	_.toolbar.prototype.setPosition = function(top, left) {

		if (this.usePop) {
			this.pop.pop(top, left);
		} else
			this.el.css({ top: top, left: left }).show();
	};

	_.toolbar.prototype.hide = function() {

		if (this.usePop) {
			this.pop.hide();
		} else
			this.el.hide();
	};

	_.toolbar.prototype.show = function() {

		if (this.usePop) {
			this.pop.show();
		} else
			this.el.show();
	};

	_.toolbar.prototype.choosePage = function(page) {

		this.hide();

			// tiene traccia dell'ultima istanza dell'editor, poiché
			// il widget per la scelta delle pagine ne ruba il focus

		this.lastEditor = this.mgr.getActiveEditor();

		var c = this.getChooser();

		if (page === null)
			c.chooseNewPage();
		else
			c.choosePage({ entity: page, data: null });
/*
		c.choosePage = function(page) {

		c.beginEditWithEmptySelection(page === null ? {} : { entity: page, data: null });
*/
	};

	_.toolbar.sChooser = null;
	_.toolbar.prototype.getChooser = function() {

		if (_.toolbar.sChooser === null) {

				// il chooser per le pagine (TBD: load on demand)

			_.toolbar.sChooser = new FlexJS.ui.pageChooser({

				title: 'Modifica Collegamento',
		//		text: [ '<div style="text-align: center;">Loading ...</div>'],

				buttons: {
					cancel: 'Annulla',
					ok: 'OK'
				},

				panes: ['blob', 'fixed', 'html', /*'ex',*/ 'http'],

				onPageSelected: FlexJS.proxy(this.onChooserPageSelected, this),
				onCancel:  FlexJS.proxy(this.onChooserCancel, this),

				useBootstrap: true

			});
		}

		return _.toolbar.sChooser;
	};

	_.toolbar.prototype.onChooserPageSelected = function(page) {

		// { entity: "BLOB:ID=2896", data: null, owner: "1" }

//console.log('onChooserPageSelected()', page);

		var editor = this.lastEditor;
		editor.focus(false);

		editor.createLinkWithSelection(page.entity, page.title);

		this.show();
	};

	_.toolbar.prototype.onChooserCancel = function() {

		this.lastEditor.focus(false);

		this.show();
	};


(function(wysihtml5) {

	var
		element = 'span',
		newclass = 'userFormat3',

		REG_EXP = new RegExp(newclass, 'g')
	;

	wysihtml5.commands.setHighlight = {

		exec: function(composer, command, element_class) {

			//element_class=element_class.split(/:/);

				//register custom class

//			wysihtml5ParserRules['classes'][newclass]=1;

			return wysihtml5.commands.formatInline.exec(composer, command, element, newclass, REG_EXP);
		},

		state: function(composer, command, element_class) {

			return wysihtml5.commands.formatInline.state(composer, command, element, newclass, REG_EXP);
		}
	};

})(wysihtml5);

})(FlexJS.ui);