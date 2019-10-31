<?php

api::inc( 'flexDB', 'i18nTable');

class customDBException extends Exception {}

//define('customLanguages', 'IT|EN');

FlexAPIi18nTable::create('cDBI', apiDB::cdb(), array(
	'languages' 		=> array('IT'),
	'defaultlanguage' 	=> 'IT',
	'autoload'			=> kAPIExtensionsPath . 'class/i18nTables/%s.php',
	'on-error'			=> 'throw'
));
