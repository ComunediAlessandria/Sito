<?php


class i18nTableRAD extends i18nTable {

	public

			// definizione degli indici
			// '<name>' => array(
			// 	'type' => 'index|unique',
			// 	'columns' => array('codiceAzienda', 'sku', 'tipoAlternativo')
			// ),

			// ak
		$engine = null,

		$idx = array(),
		$log = false
	;

	function __construct($i18ndb) {

		parent::__construct($i18ndb);

		$db = $i18ndb->db();

			// verifica se la tabella esiste nel DB

		$r = $db->select('SHOW TABLES LIKE ' . $db->q($this->t));
		if ((/*$rec =*/ $r->getNext()) === false) {

			$cf = array();
			foreach ($this->f as $i => $f)
				if ($i === 0)
					$cf[] = $f . ' ' . $this->fieldDefinition($f) . ' COMMENT \'i18nTable::auto\'';
				else
					$cf[] = $f . ' ' . $this->fieldDefinition($f) . ' NULL COMMENT \'i18nTable::auto\'';

				// ak
			if (is_null($this->engine ))
				$engi = '';
			else
				$engi = 'ENGINE='.  $this->engine;

			$cr = $db->query(
				$sql = 'CREATE TABLE ' . $this->t . ' (' . join(', ', $cf) . ') '.$engi.' COMMENT =  \'i18nTable::auto\''
			);

			if ($cr === false) {}

			if ($this->log)
				d($sql);

		} else {

				// verifica che i campi siano allineati
				//
				// (solo verifica di esistenza)

			$ef = $this->f;

			$r = $db->select('SHOW FIELDS FROM ' . $this->t);

			while ($rec = $r->getNext()) {

				if (($k = array_search($rec['Field'], $ef)) === false) {

						// campo esiste su DB ma non nella definizione

//d('no def', $rec['Field']);

				} else
					unset($ef[$k]);
			}

			foreach ($ef as $i => $f) {

					// campo esiste nella definizione ma non nel DB

				$cr = $db->query(
					$sql = 'ALTER TABLE ' . $this->t . ' ADD ' . $f . ' ' . $this->fieldDefinition($f) . ' NULL COMMENT \'i18nTable::auto\''
				);

				if ($cr === false) {}

				if ($this->log)
					d($sql);
			}
		}

			// campi i18N

		if (count($this->g) > 0) {

				// verifica se la tabella esiste nel DB

			$r = $db->select('SHOW TABLES LIKE ' . $db->q($this->t . 'I18N'));
			if ($r->getNext() === false) {

/*
CREATE TABLE `CategoriesI18N` (
  `IDCategory` int(11) NOT NULL,
  `LANG` char(2) character set utf8 collate utf8_unicode_ci NOT NULL,
  `KIND` varchar(50) character set utf8 collate utf8_unicode_ci NOT NULL,
  `TEXT` text,
  PRIMARY KEY  (`IDCategory`,`LANG`,`KIND`),
  KEY `LANG` (`LANG`,`KIND`,`TEXT`(250))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/
				$cf = array(
					$this->f[0] . ' int(11) NOT NULL',
					'LANG char(2) NOT NULL',
					'KIND varchar(50) NOT NULL',
					'TEXT text',
					'PRIMARY KEY  (' . $this->f[0] . ', LANG, KIND)',
					'KEY LANG (LANG, KIND, TEXT(250))'
				);

				$cr = $db->query(
					'CREATE TABLE ' . $this->t . 'I18N (' . join(', ', $cf) . ') '.$engi.' COMMENT =  \'i18nTable::auto\''
				);

				if ($cr === false) {}
			}
		}

			// indici (al momento solo creazione di quelli che non fanno match)

		if (count($this->idx) > 0) {

			$r = $db->select('SHOW INDEXES FROM ' . $this->t);

				// raggruppa le definizioni degli indici per nome

			$dbIdx = array();
			while ($rec = $r->getNext())
				$dbIdx[ $rec['Key_name'] ] = true;

			foreach (array_unique(array_keys($this->idx) + array_keys($dbIdx)) as $idxName) {

				if (isset($dbIdx[$idxName]) && isset($this->idx[$idxName])) {

						// indice presente sia sulla tabella che nella definizione

				} else if (isset($dbIdx[$idxName])) {

						// indice presente sul DB ma non nella definizione

				} else {

					$idd = $this->idx[$idxName];

						// indice presente nella definizione ma non sul DB

						// '<name>' => array(
						// 	'type' => '<null>|index|unique',
						// 	'columns' => array('codiceAzienda', 'sku', 'tipoAlternativo')
						// ),

					if ($idxName === 'PRIMARY') {

						$sql = 'ALTER TABLE ' . $this->t . ' ADD PRIMARY KEY (' . join(', ', $idd['columns']) . ')';

					} else {

						$sql = 'CREATE ' . (isset($idd['type']) && $idd['type'] === 'unique' ? 'UNIQUE' : null) . ' INDEX `' . $idxName . '` ON ' . $this->t . ' (' . join(', ', $idd['columns']) . ')';
					}

					$cr = $db->query($sql);

					if ($cr === false) {}

					if ($this->log)
						d($sql);
				}
			}
		}
	}
/*
	protected static $km = array(
		1 => 'INT', / * number * /
		2 => 'VARCHAR(255)', / * string * /
		3 => 'DATETIME', / * date * /
	);
*/
		// :n (int)
		// :n:<kind> (float, double, decimal, timestamp, tinyint, smallint, mediumint, int, bigint)

		// :s (varchar(255))
		// :s:<number> (varchar(<number>))
		// :s:<kind> (text, tinytext, mediumtext, longtext, blob, tinyblob, mediumblob, longblob)

	protected function fieldDefinition($fn) {

		$fd = $this->fk[$fn];
		switch ($fd[0]) {

			case 1: /* number */ return isset($fd[1]) ? $fd[1] : 'int';
			case 2: /* string */ return isset($fd[1]) ? (is_numeric($fd[1]) ? ('varchar(' . $fd[1] . ')') : $fd[1]) : 'varchar(255)';
			case 3: /* date */ return isset($fd[1]) ? $fd[1] : 'datetime';
			case 10: /* number autoincrement */ return 'INT NOT NULL AUTO_INCREMENT PRIMARY KEY';
		}
	}
}
