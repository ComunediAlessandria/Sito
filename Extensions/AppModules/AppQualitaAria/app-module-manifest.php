<?php

class AppQualitaAria extends fxAppModule {

	function id() { return 'quaria'; }
	function version() { return '1.1.0'; }

	function enumerate($what) {

		if ($what === self::resourceBLOBElement)
			return new fxAppResourceList(array(
				new fxAppResourceBLOBElement(array(
					'tbTag' => 'clsblobelementqualitaaria',
					'tbIcon' => $this->baseURL() . 'assets/img/quaria20@20.gif',
					'tbDescription' => 'Qualità dell\'aria',
					'tbAlt' => 'Qualita dell\'aria',
				)),
				new fxAppResourceBLOBElement(array(
					'tbTag' => 'clsblobelementmisureantismog',
					'tbIcon' => $this->baseURL() . 'assets/img/quariamiansm20@20.gif',
					'tbDescription' => 'Misure antismog',
					'tbAlt' => 'Misure antismog',
				))

			));
	
		if ($what === self::resourcePermission)
			return new fxAppResourceList(array(
				new fxAppResourcePermission(
					'Qualità aria',
					'QUARIA',
					'Pu&ograve; accedere alla console inserimento dei dati di Qualità dell\'aria'
				),
				new fxAppResourcePermission(
					'Qualità aria',
					'QUARIAMIANSM',
					'Pu&ograve; accedere alla console inserimento dei dati delle Misure Antismog'
				),
			));

		if ($what === self::resourceAdminMenu)
			return new fxAppResourceList(array(
				new fxAppResourceAdminMenu(
					file_get_contents(dirname(__FILE__) . '/extensions.local/AdminCustomExtensions.xml')
					/*str_replace(
						'url=\'ext:ExportJson',
						'url=\'ext:AppExportJson',
						file_get_contents(dirname(__FILE__) . '/extensions.local/AdminCustomExtensions.xml')
					)
					*/
				)
			));	
	}



	function instantiateClass($className, $classKind = null) {

		if ($classKind === self::classBLOBElement) {

			switch ($className) {

				case 'clsblobelementqualitaaria': 

					include_once($this->basePath() . '/blobelements/clsBLOBElementQualitaAria.php');
					return new clsBLOBElementQualitaAria();

				case 'clsblobelementmisureantismog': 	

					include_once($this->basePath() . '/blobelements/clsBLOBElementMisureAntismog.php');
					return new clsBLOBElementMisureAntismog();
			}
		}
	}
}

fxAppModuleHandler::register('AppQualitaAria');