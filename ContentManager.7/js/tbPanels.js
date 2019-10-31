
	//
	// funzioni per la gestione dei pannelli della TB
	//

	//
	// Visualizza un pannello nascondendo quello attuale e mostrando
	// quello selezionato. Inoltre vengono applicati due stili 
	// diversi al controllo selezionato e quelli non selezionati.
	//



function TBPanelSwitchTo(name, panels) {

		// nasconde tutti i panel

	for (var i=0; i < panels.length; i++) {

		var el = document.getElementById( panels[i] );
		if (el) {
		
			el.style.display = 'none';

			document.getElementById( panels[i] + 'a' ).className = '';
		}
	}
	
		// se specificato abilita quello selezionato
		
	if (name != '') {
	
		document.getElementById( name ).style.display = '';

		document.getElementById( name + 'a' ).className = 'FlexEditToolBarSelectorCurrent';

			// memorizza il pannello selezionato in un campo di testo (se esiste)

		var el = document.getElementById('frmTBSelPanel');
		if (el)
			el.value = name;

    		// non annulla l'evento in modo che il link possa seguire correttamente
			// l'HREF (link interno alla pagina, all'inizio del blocco di contenuto)
    	
//		if (window.event)
//	    	window.event.returnValue = false;
	}
}