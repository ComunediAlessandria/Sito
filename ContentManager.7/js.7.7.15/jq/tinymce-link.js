
const pageChooser = (function() {

	var chooserInstance;

	const chooser = function() {

		if (! chooserInstance)
			chooserInstance = new fjs.ui.pageChooser({

				onPageSelected: function(page, addData) {

					callback(page);
				},

				onCancel: function() {

					callback();
				},

				panes: [ 'blob', 'fixed', /*'ex',*/ 'html', 'http'],

				useBootstrap: true
			});

		return chooserInstance;
	};

	var callback;
	const choosePage = function(p, cb) {

		callback = cb;

		const c = chooser();

		p ? c.choosePage({ entity: p, data: null }) : c.chooseNewPage();
	};

	return {
		choosePage: choosePage
	};

})();

/*
				$('.uiPageChooser').on('click', function() {

					el = $($(this).data('for'));
					eld = $($(this).data('description'));
					eli = $(this).find('.page-info');

					var v = el.val();
					if (v === '')
						chooser.chooseNewPage();
					else
						chooser.choosePage({ entity: v, data: null });

					return false;
				});
*/

	// https://github.com/tinymce/tinymce/blob/master/src/plugins/link/

const tmceUtils = (function() {

	const trimCaretContainers = function(text) {

		return text.replace(/\uFEFF/g, '');
	};

		// public

	const getAnchorElement = function(editor, selectedElm) {

		selectedElm = selectedElm || editor.selection.getNode();

		return editor.dom.getParent(selectedElm, 'a[href]');
/*
		if (isImageFigure(selectedElm)) {
		// for an image conained in a figure we look for a link inside the selected element
		return editor.dom.select('a[href]', selectedElm)[0];
		} else {
		return editor.dom.getParent(selectedElm, 'a[href]');
		}
*/
	};

	const link = function(editor, data) { // href, text

		editor.undoManager.transact(function() {

			const selectedElm = editor.selection.getNode();
			const anchorElm = getAnchorElement(editor, selectedElm);

			const linkAttrs = {
				href: data.href,
				target: data.target ? data.target : null,
				rel: data.rel ? data.rel : null,
				class: data.class ? data.class : null,
				title: data.title ? data.title : null
			};

	// if (data.href === attachState.href) {
	// attachState.attach();
	// attachState = {};
	// }

			if (anchorElm) {

				editor.focus();

				if (data.hasOwnProperty('text')) {

					if ('innerText' in anchorElm) {

						anchorElm.innerText = data.text;

					} else
						anchorElm.textContent = data.text;
				}

				editor.dom.setAttribs(anchorElm, linkAttrs);

				editor.selection.select(anchorElm);
				editor.undoManager.add();

			} else {

				/* if (isImageFigure(selectedElm)) {

					linkImageFigure(editor, selectedElm, linkAttrs);

				} else */ if (data.hasOwnProperty('text')) {

					editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(data.text)));

				} else
					editor.execCommand('mceInsertLink', false, linkAttrs);
			}
		});
	};

	const unlink = function(editor) {

		editor.undoManager.transact(function() {

			const node = editor.selection.getNode();

			editor.execCommand('unlink');
		});
	};

	const getAnchorText = function(selection, anchorElm) {

		const text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({ format: 'text' });

		return trimCaretContainers(text);
	};

	return {
		getAnchorElement: getAnchorElement,
		getAnchorText: getAnchorText,
		link: link,
		unlink: unlink
	};

})();

tinymce.PluginManager.add('fx-link', function(editor, url) {

	const toggleActiveState = function() {

		const self = this;
		editor.on('nodechange', function(e) {

			self.active(! editor.readonly && !! tmceUtils.getAnchorElement(editor, e.element));
		});
	};

	editor.addButton('fx-link', {
		// text: 'My button',
		active: false,
		icon: 'link',
		tooltip: 'Insert/edit link',
		onclick: function(e) {

			const
				anchorElm = tmceUtils.getAnchorElement(editor, e.element),
				initialText = tmceUtils.getAnchorText(editor.selection, anchorElm)
			;

			var p;
			if (anchorElm) {

				const href = $(anchorElm).attr('href');

				if (href.substr(0, 19) === 'http://example.com/')
					p = href.substr(19);
				else
					p = href;
			}

			pageChooser.choosePage(p, function(data) {

				if (data) {

					var href, text;

					// {entity: "BLOB:ID=18", title: "Dealer Auto  - Richiesta Contatto Commericale", data: null, kind: "blob"}
					// {entity: "PHP:File=SiteMapTree.php", title: "Mappa del Sito", data: null, kind: "php"}
					// {entity: "http://www.google.com", title: "http://www.google.com", data: null, kind: "http"}

					text = data.title;

					switch (data.kind) {

						case 'blob':
								href = 'http://example.com/' + data.entity;
							break;

						case 'php':
								href = 'http://example.com/' + data.entity;
							break;

						case 'http':
								href = data.entity;
							break;
					}

					tmceUtils.link(editor, {
						href: href,
						text: initialText.length === 0 ? text : initialText
					});
				}

			});


return;





/*
			editor.windowManager.open({
				title: 'Example plugin',
				body: [
					{type: 'textbox', name: 'title', label: 'Title'}
				],
				onsubmit: function(e) {
					// Insert content when the window form is submitted
					editor.insertContent('Title: ' + e.data.title);
				}
			});
*/

		},

		onpostrender: toggleActiveState
	});

	editor.addButton('fx-unlink', {
		// text: 'My button',
		active: false,
		icon: 'unlink',
		tooltip: 'Remove link',
		onclick: function(e) {

			tmceUtils.unlink(editor);
		},

		onpostrender: toggleActiveState
	});

/*
	// Adds a menu item to the tools menu
	editor.addMenuItem('fx-link', {
		text: 'Example plugin',
		context: 'tools',
		onclick: function() {
			// Open window with a specific url
			editor.windowManager.open({
				title: 'TinyMCE site',
				url: 'https://www.tinymce.com',
				width: 800,
				height: 600,
				buttons: [{
					text: 'Close',
					onclick: 'close'
				}]
			});
		}
	});
*/
	return {
		getMetadata: function () {
			return  {
				title: "Example plugin",
				url: "http://exampleplugindocsurl.com"
			};
		}
	};
});
