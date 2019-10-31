/*
jquery.fixSelect

Fixes an whereby IE chops long options in a select box with fixed width. It does this by
surrounding the element within a span of the same width with overflow-x set to hidden,
and setting the select width to auto on a mousedown or keyup event then back to its
previous value on blur.

Syntax:

	$jQueryCollection.fixSelect([minWidth]);

The minWidth parameter is optional, but can be used to hard set a width for the elements.
If the result doesn't look quite right, you can use CSS to fix the result: the added span
wrapping the select element has the class "selectFix" to make this possible.

Two custom events are exposed:

	- "initfix" will recompute the natural width of the element; and
	- "applyfix" will resize the select element (e.g. after assigning focus programmatically).

(Merciful heavens, IE should just be taken outside and *shot*. This apparently simple code
involved more obscure bug workarounds than I have time or space to document.)
*/

(function($) {

$.fn.fixSelect = function(minWidth) {
	/* Fix only applies to IE 8 and below. */
	return (!($.browser.msie && $.browser.version < 9)) ? this : this.each(function() {
		if (this.tagName.toLowerCase() == 'select') { // Also only applies to select elements.

			var el = this,
				$this = $(this)
			;

			minWidth = minWidth ? minWidth : el.offsetWidth; // Current width used as minimum.

			var
				elementWidth = $this.outerWidth(),
				$wrapper = $('<span class="selectFix"></span>').css({ // Wraps the select element.
					display: ($this.css('display') == 'block') ? 'block' : 'inline-block',
					cssFloat: $this.css('float'),
					overflowX: 'hidden',
					overflowY: 'visible',
					width: minWidth
				}),
				naturalWidth
			;

			/* Set up element margins on wrapper instead. (For more complex styles, use CSS.) */
			$.each('marginTop marginRight marginBottom marginLeft'.split(' '), function(i, prop) {
				$wrapper.css(prop, $this.css(prop));
				$this.css(prop, 0);
			});

			if ($this.is(':visible')) { // Doesn't work for invisible elements, they have zero width!
				/* Determine what the "natural" (i.e. automatic) width would be. */
				$this.width('auto');
				naturalWidth = $this.outerWidth();
				$this.width(minWidth);

				$this
				.wrap($wrapper)
				.bind('mousedown keyup applyfix', function() {
					/* Use "auto" or fixed width, whichever is biggest. */
					$this.width((naturalWidth < elementWidth) ? minWidth : 'auto');
					/* Horribly, IE 6 will ignore the overflow anyway unless some part of the
					select element is already hidden before the options list is displayed. */
					if ($.browser.version == 6) $this.css('marginLeft', 1);
				})
				.blur(function() {
					/* Reset the element to fixed width. */
					$this.width(minWidth);
					if ($.browser.version == 6) $this.css('marginLeft', 0);
				})
				.bind('initfix', function() {
					/* Recalculate "natural" width. */
					$this.width('auto');
					naturalWidth = $this.outerWidth();
					$this.width(minWidth);
				});
			}
		}
	});
}

})(jQuery);
