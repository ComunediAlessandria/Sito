<?php
class iMisureAntismog extends i18nAppQualitaAriaTable  {

	public
		$t = 'MisureAntismog',
		$f = array(
			'IDMisureAntismog',
			'DataDa:d:date DEFAULT NULL',
			'DataA:d:date  DEFAULT NULL',
			'Livello:n:int DEFAULT 0',
			'Note:s:varchar(50) NOT NULL',
			'UMDT:d:datetime DEFAULT NULL',
			'UMUser:s:varchar(50) NOT NULL'
		)
		;
}
