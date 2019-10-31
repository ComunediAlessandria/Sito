
	Costanti:

		kAPILang: contiene la lingua della pagina corrente (due lettere, maiuscole)
		kAPITime: contiene un TS dell'istante di richiesta

Modifiche introdotte nelle API 1.1
----------------------------------

* 29.06.13

	- aggiunto il metodo setPageDescriptor() della apiPage per le fixed in modo che possa specificare anche l'id
		dell'istanza per le pagine fixed con parametri

			$page->setPageDescriptor(<filename> [, <kind | id> [, <id>]]);

				// 	(1) solo con filename
				// 	(2) filename + kind
				// 	(3) filename + id (per fixed con parametri)
				// 	(4) filename + kind + id
				//

		filename può includere o meno 'PHP:File=', e può omettere basename()
		sistema log, indici e breadcrumb ed è chainable:

			$pg = apiPage::newPage('Sezione1.html')
				->setPageDescriptor(__FILE__)
			;

	- aggiunta funzione per determinare se il servizio della pagina avviene attraverso l'uso di
		URL parlanti

			apiPage::getShortURL();

		il risultato è 'false' oppure l'url utilizzata.

* 07.05.13

	- aggiunta la possibilità di specificare, per una pagina utente, la community di restrizione
		in relazione alla classificazione del motore di ricerca

			$page->setSearchCommunity(<id community>);

	- aggiunta la possibilità di inibire lo spider. Esempio di utilizzo:

			if (apiPage::isSpidering())
				return apiPage::dontSpider();

* 28.03.13

	- aggiunte funzionalità alla creazione di pagine utente analoghe a quelle aggiunte per
		le pagine amministrative

	- aggiunta la classe uCTemplate, lightweighting template basato su uTemplate in grado di usare
		oggetti pgContent sia per il template che per i contenuti

* 12.03.13

	- aggiunte funzionalità alla creazione di pagine amministrative

		E' possibile utilizzare un template locale, ed includere condizionalmente sia i css
		di default che i js di default (in vista di una ristrutturazione della pagina, ad esempio,
		con bootstrap)

				// template in posizione diversa da quelli di motore

			$tpl = dirname(__FILE__) . '/t-system-admin.html';

				// pagina senza l'inclusione di CSS e JS di default

			$pg = apiPage::newAdminPageWithoutAssets($tpl);

				// aggiunge in modo esplicito i CSS amministrativi di motore

			$pg->addCSS(kNewTemplatesCssCM . 'AdminAreaV6.css');

				// aggiunge in modo esplicito i JS di default

			$pg->addCoreJS(apiPage::jQuery, apiPage::flexJS);

* 01.08.12

	- nuova classe per la gestione delle community Flex (FlexAPICommunities)

	- nuova funzione della apiDBTable per ottenere la definizione di una tabella i18n:

			apiDBTable::getTableDefinition($tableName)

* 09.07.12

	- migrate a motore alcune statiche della FlexAPIFormControls (da completare)

* 05.06.12

	- nuove funzioni:

		Temporaneamente l'API è in un include a parte, che sostituirà il deprecato
		FlexapiFlexCU.inc.php

		apiFlexCUsers::getAllUsers()				cfr. 1.1/FlexapiFlexCU.v2.inc.php
		apiFlexCUsers::getUserByID()				cfr. 1.1/FlexapiFlexCU.v2.inc.php
		apiFlexCUsers::getUsersByCommunities()		cfr. 1.1/FlexapiFlexCU.v2.inc.php

		Inoltre, per le conversioni da id interni a Universal User ID:

		apiFlexCUsers::UUID2ID()					cfr. 1.1/FlexapiFlexCU.v2.inc.php
		apiFlexCUsers::ID2UUID()					cfr. 1.1/FlexapiFlexCU.v2.inc.php

		apiFlexUsers::UUID2ID()						cfr. 1.1/FlexapiFlexUsers.inc.php
		apiFlexUsers::ID2UUID()						cfr. 1.1/FlexapiFlexUsers.inc.php

* 01.06.12

	- modifiche di nomi nelle funzioni (i vecchi nomi sono deprecati nella 1.1):

		FlexAPIError::isAPIError()		-> apiError::isError()

	- nuove funzioni:

		api::isError(<result>): proxy verso apiError::isError(<result>)

		apiFlexUsers::getAllUsers()					cfr. 1.1/FlexapiFlexUsers.inc.php
		apiFlexUsers::getUserByID()					cfr. 1.1/FlexapiFlexUsers.inc.php
		apiFlexUsers::getUsersByGroups()			cfr. 1.1/FlexapiFlexUsers.inc.php

	- funzioni deprecate:

		api::APIInclude() in favore della api::inc()

* 31.05.12

	- prima versione della classe per la gestione degli utenti Flex Locali, compresi gruppi e permessi:

			useApi('1.1');
			FlexAPI::inc('FlexUsers');

		Esempi di utilizzo in:

			1.1/test/TestapiFlexUserss.php

	- abbreviazioni naming per le classi (i vecchi nomi sono deprecati nella 1.1):

		FlexAPI					-> api
		FlexAPIError			-> apiError
		FlexAPIUser				-> apiUser
		FlexapiFlexUserss		-> apiFlexUsers
		FlexAPIDB				-> apiDB
		FlexAPIFormManager		-> apiFormManager
		FlexAPIi18nTable		-> apiDBTable
		FlexAPILang				-> apiLang
		FlexAPILister			-> apiLister
		FlexAPIMail				-> apiMail
		FlexAPIMailTemplate		-> apiMailTemplate
		FlexAPIMD				-> apiMD
		FlexAPIPage				-> apiPage
		FlexAPITemplate			-> apiTemplate
		FlexAPIWizard			-> apiWizard
		FlexAPIWizardOnePage	-> apiWizardOnePage

	- modifiche di nomi nelle funzioni (i vecchi nomi sono deprecati nella 1.1):

		FlexAPI::isAPIError()		-> api::isError()

* 11.05.12

	- Shorthand per inclusione API:

		FlexAPI::inc('User', 'Community');

* 10.05.12

	- Funzione per ottenere il numero di utenti di una certa community:

		FlexAPIFlexCU::getNumberOfUsersInCommunity(<id community>)

* 08.05.12:

	Le API per l'accesso al DB utenti di community di flex non sono più 'Community' ma 'FlexCU' e contengono
	tutte le funzioni necessarie alla gestione delle tabelle contenenti i dati degli utenti di community flex.

	La funzione CommunityCurrentUserData(), CommunityMemberOf() e isCommunityUser() della classe non sono più supportate.

	Viene introdotta una nuova API per l'accesso ai dati dell'utente community corrente 'CUser' che contiene le
	funzioni di accesso indipendenti dall'identity provider usato.

	Deprecato l'uso del link simbolico 'current' che verrà eliminato nella prossima versione.


Migrazione
----------

	Le nuove applicazioni usano direttamente la versione 1.1.

	Le vecchie applicazioni possono continuare ad usare la 1.0, ma transitano alla 1.1 in caso di manutenzione.

	Funzioni e classi deprecate rimangono disponibili nella 1.1, ma potrebbero non esserlo più nelle successive versioni.
