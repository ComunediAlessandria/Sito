
(function(_) {

	return;

/*
	var findComments = function(el) {

		var arr = [];

		for(var i = 0; i < el.childNodes.length; i++) {

			var node = el.childNodes[i];

			if(node.nodeType === 8) {

				var tx = node.nodeValue;
				if (tx.match(/^\s*EL\(/))
					arr.push({
						text: tx,
						node: node.nextSibling
					});

			} else
				arr = arr.concat(findComments(node));
		}

		return arr;
	};

	$(function() {

		var commentNodes = findComments(document);

		console.log(commentNodes);

		$.each(commentNodes, function() {

			var el = $(this.node);

			el.hover(function() {

				el.css('outline', '1px solid red');

			}, function() {

				el.css('outline', 'none');
			}).css('outline', '1px solid blue');
		});
	});
*/

})(fjs);
