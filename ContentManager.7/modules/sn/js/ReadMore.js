
sn = window.sn || {};

/*
<span class='snMeta-group-{id} snMeta-role-tt'>{tt}</span>
<span class='snReadMore snMeta-group-{id} snMeta-role-mt'><a href='#'>{mt}</a></span>
<span class='snMeta-group-{id} snMeta-role-texte snHidden'>{texte}</span>
*/

sn.ReadMore = function() {
	
	$('body').on('click', '.snReadMore', function() {
		

		var els = sn.Utils.GroupFromElement(this, ['tt', 'mt', 'texte']);

		$(els.tt).hide();
		$(els.mt).hide();
		$(els.texte).css('display', 'inline');

		return false;
	});
};
/*
sn.ReadMore = function(el) {

	this.els = sn.Utils.GroupFromElement(el, ['tt', 'mt', 'texte']);
	
	this.attach();
};

sn.ReadMore.prototype.attach = function() {
	
	var el = $(this.els.el);
	if (true ||! el.data('sn.ReadMore')) {

		el.data('sn.ReadMore', true);
console.log('attaching to ', this.els.mt);		
$(this.els.mt).html($(this.els.mt).html() + ' ***');
		//var me = this;
		$(this.els.mt).click($.proxy(this.onClick, this));
		//	.click(function() { return me.onClick(); });
	}
};

sn.ReadMore.prototype.onClick = function(el) {
	
	$(this.els.tt).hide();
	$(this.els.mt).hide();
	$(this.els.texte).css('display', 'inline');

	return false;
};
*/