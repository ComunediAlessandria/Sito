<?php

class clsBLOBElementQualitaAria extends clsBLOBElement{

	const sogliaLimite = 51;
	

	//	function canCache() { return false; }

		// informazioni per le icone nelle toolbar e nell'editing BLOB

	function description() { return 'Qualità dell\'aria'; }
	function icon() { 

		require_once( dirname(__FILE__) . '/../qualitaAria.inc.php');
		return kAPIExtensionsURL . QualitaAriaBasePath .'assets/img/quaria20@20.gif';
	}

	function channelProfileDefault() { return 3; }

/*
		// funzioni di accesso

	function SetCValue($id, $value)     { $this->value['*'][$id] = $value; }
	function GetCValue($id)             { return isset($this->value['*'][$id]) ? $this->value['*'][$id] : null; }

	function SetValue($id, $value)      { if ($id == -1) { $this->value[ $this->curLanguage ] = $value; } else { $this->value[ $this->curLanguage ][$id] = $value; }    }
	function GetValue($id = null)       { return is_null($id) ? $this->value[ $this->curLanguage ] : (isset($this->value[ $this->curLanguage ][$id]) ? $this->value[ $this->curLanguage ][$id] : NULL); }
*/

//	function setDefault() { }

	function form($index, $editMode = kBLOBEditModeFull, $pars = '') {

		return '';
	}

	function printElement($index, $final, $pars) {

		require_once( dirname(__FILE__) . '/../qualitaAria.inc.php');

		$recs = i18nQuaria()->getRecordList('QualitaAria', 
			sql::where('1>0'),
			sql::order('Data DESC'),
			sql::limit(0, 7)
		);

		//DD($recs);

		if (count($recs) > 0 ) {

			return apiPage::fillTemplate(QualitaAriaPath .'template/blob/clsBLOBElementQualitaAria-default.html', 
				array('row' => self::decoraRisultati($recs))
			);
		} else 
			return '';

	}

	protected static function decoraRisultati($recs) {

		$t = array();
		fxQualitaAria::inc('class/dateUtils');

		foreach ($recs as $r)
			$t[] = array (
				'Data' 		=> dateUtils::Mysql2Ita($r['Data']),
				'PM10'		=> $r['PM10'] == 0 ? 'N.D.' : $r['PM10'],
				'evidenzia' => $r['PM10'] >= self::sogliaLimite ? 'danger' : '',
				'Note'		=> $r['Note'],
			);

		return $t;
	}
}
