
ly = window.ly || {};

ly.EditorManager = function () {

	ly.EditorManager.loadEditPalette();
};

ly.EditorManager.sEditPalette = null;
ly.EditorManager.sEditPaletteLoading = false;
ly.EditorManager.loadEditPalette = function () {

	if (ly.EditorManager.sEditPalette == null && ! ly.EditorManager.sEditPaletteLoading) {

		ly.EditorManager.sEditPaletteLoading = true;
		sn.Utils.AjaxRequest('test/layout/editbox', function(d) {

			console.log(d);
		});
	}
};

new ly.EditorManager();


$('.lyEditable')
	.hover(function() {
	
		$(this).addClass('lyEditableHighlight');

	}, function() {

		$(this).removeClass('lyEditableHighlight');
	})
	.draggable({
		helper: 'clone',
		opacity: 0.5,
		zIndex: 10000,
		revert: 'invalid',
		revertDuration: 300,
		cursor: 'crosshair'
	})
;

/*
.hover(function() {

	$(this)
		.animate({height: 10})
//		.addClass('lyEditableHighlight')
	;

}, function() {

	$(this)
		.animate({height: 3})
//		.removeClass('lyEditableHighlight')
	;
})


*/
$('.lyDropZone')
	.droppable({
		accept: '.lyEditable',
		tolerance: 'pointer',
		activeClass: 'active',
		hoverClass: 'hover'
	})
;
