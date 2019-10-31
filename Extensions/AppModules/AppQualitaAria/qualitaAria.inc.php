<?php

include_once(dirname(__FILE__) . '/../../../cm/inc/const.inc.php');

useAPI('1.1');

api::inc(
	'Page',
	'flexDB',
	'i18nTable',
	'dbg'
);

define('QualitaAriaBasePath', 'AppModules/AppQualitaAria/');
define('QualitaAriaPath', kAPIExtensionsPath . QualitaAriaBasePath);
define('QualitaAriaURL', kAPIExtensionsURL . QualitaAriaBasePath);
define('QualitaAriaPagesURL', kAPIExtensionsURL . QualitaAriaBasePath .'pages/');
	
class fxQualitaAria {

	static function inc($n) { 

		foreach (func_get_args() as $f)
			inc::ext(QualitaAriaBasePath . $f); 
	}

//	foreach (func_get_args() as $f) flexInclude(kExtensionsPath . $f . '.php');
//	static function inc($n) { inc::ext(QualitaAriaBasePath . $n); }	
}

FlexAPIi18nTable::create(
	'i18nQuaria',
	apiDB::cdb(),
	array(
	   'languages'       => array('IT'),
	   'defaultlanguage' => kAPILang,
	   'autoload'        => QualitaAriaPath . 'class/i18nTables/%s.php',
	   'on-error'		=> 'throw'
	)
);

if (config('*appQualitaAria.radenabled', false)) {

	fxQualitaAria::inc('class/i18nTables/i18nTableRAD');

	class i18nAppQualitaAriaTable extends i18nTableRAD {}

} else {

	class i18nAppQualitaAriaTable extends i18nTable {}
}

