//
// CV - funzioni per la gestione del pannello
//

var gPanelNames = new Array('Page', 'FP', 'PHP', 'HTTP');

	//
	// Visualizza un pannello nascondendo quello attuale e mostrando
	// quello selezionato. Inoltre vengono applicati due stili
	// diversi al controllo selezionato e quelli non selezionati.
	//

function PanelSwitchTo(name) {

		// nasconde tutti i panel

	for (var i=0; i < gPanelNames.length; i++) {

		var el = document.getElementById( gPanelNames[i] );
		if (el) {

			el.style.display = 'none';

			document.getElementById( 'c' + gPanelNames[i] ).className = 'IndexPanelElementUnsel';
		}
	}

		// se specificato abilita quello selezionato

	if (name !== '') {

		document.getElementById( name ).style.display = '';

		document.getElementById( 'c' + name ).className = 'IndexPanelElementSel';

			// tiene traccia del panel selezionato

		document.getElementById('frmSelectedPanel').value = name;

			// annulla l'evento per evitare che <a> segua l'HREF

		if (window.event)
			window.event.returnValue = false;
	}
}