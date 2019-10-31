window.sq = window.sq || {};

sq.ShowHideFromList = function(linkClass, blockClass, hidden, idx) {

	$(linkClass).parent()
		.removeClass('sel')
		.parent()
			.children('li:eq(' + idx + ')').addClass('sel')
	;

	$(blockClass)
		.hide()
		.parent()
			.children('div:eq(' + idx + ')').show()
	;

	var liID = $(linkClass).parent().parent().children('li.sel').attr('id');
	var idxparts = liID.split("-");

//	alert(hidden + '    ' + liID + '    ' +  idxparts[2]);

	$(hidden).val(idxparts[2]);
};

sq.AttachShowHideFromList = function(linkClass, blockClass, hidden, presel) {

	$(linkClass).click(function() {

		var
			t = $(this),
			li = t.parent(),
			ol = li.parent(),
			idx = $('li', ol).index(li)
		;

		sq.ShowHideFromList(linkClass, blockClass, hidden, idx);

		return false;
	});

};



sq.AdjustSQFormTableW = function() {

	var
		tw = $('.flex-page-element-content').width(),
		w = tw - 30
	;

	$('div.sqFormTable').css('width', w + 'px');
};


sq.AttachAlignToggle = function(selector) {

	$(selector).each(function(){

		var
			t = $(this),
			id = t.attr('id'),
			name = t.attr('name')
		;

		t.prev()
			.click(function() {

				$('label.' + name).css('background-color','transparent');

				var align = {'C': 'center', 'R': 'right', 'L': 'left'}[ t.val() ];

				$(this).css('background-color', '#81CEFF');
				$('.example-' + name).css('text-align', align);

			})
			.css('background-color', t.is(':checked') ? '#81CEFF' : 'transparent')
		;
	});
};



sq.AttachBOColumnWidthReset = function(linkSelector) {

	$(linkSelector).click(function() {

		var
			tr = $(this).closest('tr')
		;

		$('input', tr).val('');

		return false;
	});
};

sq.AttachBOColumnWidthCalc = function(linkSelector) {

	$(linkSelector).click(function() {

		var
			tr = $(this).closest('tr'),
			checked = $(tr).parent().parent().find('thead tr th input:checked'),
			w = Math.floor(100 / checked.size())
		;

		$('input', tr).each(function(){

			var
				td = $(this).closest('td'),
				idx = tr.find('td').index(td)
			;

			if (tr.parent().parent().find('thead tr th input:eq(' + idx + ')').is(':checked'))
				$(this).val(w + '%');
			else
				$(this).val('');
		});

		return false;
	});
};



sq.AttachBOUpdateHeaders = function(linkSelector) {

		$(linkSelector).click(function() {

			var
				tr = $(this).closest('tr')
			;

			$('input', tr).each(function() {

				var
					td = $(this).closest('td'),
					idx = $('td', tr).index(td),
					v = tr.parent().parent().find('thead tr th:eq(' + (idx + 1) + ') label').text()
				;

				$(this).val(v);

			});

			return false;
		});
};


sq.AttachBOelsticTextarea = function(selector) {

	$(selector).each(function() {

		new sn.ElasticTextArea(this);
	});
};

sq.EnableDisableColumnByInput = function(checkbox) {

	var
		t = $(checkbox),
		th = t.parent(), //closest('th');
		tr = th.parent(), //$(checkbox).closest('tr');
		idx = $('th', tr).index(th) - 1,
		table = tr.parent().parent(),
		show = t.is(':checked')
	;

	if (show) {

		$(table).find('tbody tr.headers td:eq(' + (idx) + ') input').show();
		$(table).find('tbody tr.alignment td:eq(' + (idx) + ') label').show();
		$(table).find('tbody tr.transform td:eq(' + (idx) + ') select').show();
		$(table).find('tbody tr.largh td:eq(' + (idx) + ') input').show();
		$(table).find('tbody tr.dd td:eq(' + (idx) + ') select').show();
		$(table).find('tbody tr.dd td:eq(' + (idx) + ') label').show();

	} else {
		$(table).find('tbody tr.headers td:eq(' + (idx) + ') input').hide();
		$(table).find('tbody tr.alignment td:eq(' + (idx) + ') label').hide();
		$(table).find('tbody tr.transform td:eq(' + (idx) + ') select').hide();
		$(table).find('tbody tr.largh td:eq(' + (idx) + ') input').hide();
		$(table).find('tbody tr.dd td:eq(' + (idx) + ') select').hide();
		$(table).find('tbody tr.dd td:eq(' + (idx) + ') label').hide();
	}

};

sq.AttachBOEnableDisableColumn = function(selector) {
	$(selector).each(function(){

		var t = $(this);

		t.click(function() {
			sq.EnableDisableColumnByInput(this);
		});

		if (! t.is(':checked'))
			sq.EnableDisableColumnByInput(this);
	});
};



sq.AttachBOAlterTabItem = function(alterLinkClass, idNumEl) {

		$(alterLinkClass).click(function() {

			var
				t = $(this),
				ol = t.closest('ol'),
				li = t.closest('li'),
				idx = $('li', ol).index(li)
			;

			if (t.hasClass('add')) {

				$(idNumEl).val('+' + 1);
				$('#bSave').click();
			}

			if (t.hasClass('del')) {

				var name = $(this).parent().find('a.sqLink').text();

				if (confirm("Confermi l'eliminazione di " + name + "?")) { //NOSONAR

					$(idNumEl).val('-' + idx);
					$('#bSave').click();
				}
			}

			if (t.hasClass('moveLeft')) {

				$(idNumEl).val('L' + idx);
				$('#bSave').click();
			}

			if (t.hasClass('moveRight')) {

				$(idNumEl).val('R' + idx);
				$('#bSave').click();
			}

			if (t.hasClass('refresh'))
				$('#bSave').click();

			return false;
		});
};

sq.AttachBOEditContent = function(editLinkClass, index) {

	$(editLinkClass).click(function() {

		var val = $($(this).data('target')).val();
		if (val !== '-1') {

			var
				kind = val.substring(0, 1),
				id = val.substring(2)
			;

			if (kind === 'Q') {

				$('li#m1m' + index + '-X-1  a').click();
				$('li#m2Q' + index + '-Q-' + id + ' a.sqLink').click();
			}

			if (kind === 'M') {

				$('li#m1m' + index + '-X-2  a').click();
				$('li#m2M' + index + '-M-' + id + ' a.sqLink').click();
			}
		}
//				val = $(this).parent().find('select').val(),

		return false;
	});
};