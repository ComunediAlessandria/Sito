
var gallery = function(el) {

	this.el = $(el);

	this.el.find('li').click(function() {

		var s = new Spinner({
			lines: 12,
			length: 7,
			width: 5,
			radius: 10,
			color: '#fff',
			speed: 1,
			trail: 100,
			shadow: true
		}).spin($('body').get(0));

		var
			el = $(this).find('a'),
			ida = el.attr('href').match(/\/GPA\/([0-9]+)/)[1],
			l = el.attr('href').match(/\/L\/([A-Z]{2})/)[1]
		;
		
		FlexJS.Ajax.get('gallery/' + ida + '?L=' + l, function(data) {

			new galleryslider(data, {
				
				spinner: s
			});
		});
		
		return false;
	}).find('a').click(function(e) { e.preventDefault(); });
};
