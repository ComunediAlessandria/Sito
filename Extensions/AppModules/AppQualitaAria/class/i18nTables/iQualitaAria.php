<?php
class iQualitaAria extends i18nAppQualitaAriaTable  {

	public
		$t = 'QualitaAria',
		$f = array(
			'IDQualitaAria',
			'Data:d:date DEFAULT NULL',
			'PM10:n:int NOT NULL DEFAULT 0',
			'Note:s:varchar(50) NOT NULL',
			'UMDT:d:datetime DEFAULT NULL',
			'UMUser:s:varchar(50) NOT NULL'
		),
		$idx = array(
			'idxdata' => array(
				'type'	=> 'unique',
				'columns' => array('Data'),
			)
		)
		;
}
