
	//
	// gestione dello switch dei pannelli per le lingue negli oggetti BO
	//

	// new FlexJS.BOPanelSwitch('<nome dell'elemento>');

FlexJS.BOPanelSwitch = function(name) {

		// inizializza i membri statici

	if (typeof FlexJS.BOPanelSwitch.sCurLanguage === 'undefined') {

			// inizializzazione dei membri statici (hanno bisogno della gAppConfigure
			// che per adesso viene definita dopo le include)

		var al = FlexJS.AppConfigure.Get('kBOLanguagesAvail');

		FlexJS.BOPanelSwitch.sCurLanguage = FlexJS.AppConfigure.Get('kBOLanguagesCur');
		FlexJS.BOPanelSwitch.sAllLanguages = al;
		FlexJS.BOPanelSwitch.sElements = [];

		var html = '';
		for (var l in al)
			html += "<a href='#' id ='BOPanelSwitch_" + al[l] + "'>" + al[l] + "</a> |";

		html += "<a href='#' id ='BOPanelSwitch_ALL'>All</a>";

		$('#BOPanelSwitchPanel').html(html);

		$('#BOPanelSwitchPanel a').click(function() {

			var selLang = this.id.split('_')[1];

			FlexJS.BOPanelSwitch.SelectLanguage(selLang);

			return false;
		});
	}

	this.name = name;

	this.Attach();
};

FlexJS.BOPanelSwitch.prototype.Attach = function () {

	var name = this.name;

	FlexJS.BOPanelSwitch.sElements.push(name);

	FlexJS.BOPanelSwitch._UpdateEl(name, FlexJS.BOPanelSwitch.sCurLanguage);
	$('#BOPanelSwitchCurLanguage').html(FlexJS.BOPanelSwitch.sCurLanguage);
};

FlexJS.BOPanelSwitch.SelectLanguage = function(nl) {

		// i div contenitori hanno id 'D_' + <nome>

	for (var n in this.sElements)
		FlexJS.BOPanelSwitch._UpdateEl(this.sElements[n], nl);

	FlexJS.BOPanelSwitch.sCurLanguage = nl;
	$('#BOPanelSwitchCurLanguage').html(nl);
};

FlexJS.BOPanelSwitch._UpdateEl = function(el, nl) {

	for (var l in FlexJS.BOPanelSwitch.sAllLanguages) {

			// nl può valere 'ALL'

		var fn = nl === 'ALL' || FlexJS.BOPanelSwitch.sAllLanguages[l] == nl ? 'show' : 'hide';
		$('#D_' + el + '_' + FlexJS.BOPanelSwitch.sAllLanguages[l])[fn]();
	}
};
