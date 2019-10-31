<?php

class clsBLOBElementMisureAntismog extends clsBLOBElement{

	//	function canCache() { return false; }

		// informazioni per le icone nelle toolbar e nell'editing BLOB

	function description() { return 'Misure Antismog'; }
	function icon() { 

		require_once( dirname(__FILE__) . '/../qualitaAria.inc.php');
		return kAPIExtensionsURL . QualitaAriaBasePath .'assets/img/quariamiansm20@20.gif';
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

	function inPlaceEditToolbox($index) {


		return new pgContent(
			blh::rowsWithLayout(2, 4, 2, 4)->add(

			blhUILabelWithSelect::create('template' . $index, 'Template: ', $this->GetCValue('template'))
				->withOptions(
					blh::filesFromDir(QualitaAriaPath . 'template/blob/', 'clsBLOBElementMisureAntismog-', false)
				)
				->withNullValue('*', '* Nessun template')
				->selectClass(blhWidth::fillContainer)
		));

	}

	function form($index, $editMode = kBLOBEditModeFull, $pars = '') {

		return '';
	}

	function printElement($index, $final, $pars) {

		$out = new pgContent();

		if ($this->GetCValue('template') !== '*') {

			require_once( dirname(__FILE__) . '/../qualitaAria.inc.php');

			fxQualitaAria::inc('class/misureAntismog');
			$out = misureAntismog::getPgContent('template/blob/'.$this->GetCValue('template'));
		} 	

/*
			// sql::where('DataDa <= NOW() AND DataA >= NOW()'),
			$now = q(date('Y-m-d', kAPITime));
			$recs = i18nQuaria()->getRecordList('MisureAntismog', 
				sql::where('DataDa <= '.$now.' AND DataA >= '.$now),
				sql::limit(0, 1)
			);

			if (count($recs) == 1 ) {

				$recs = reset($recs);
				$out->add(apiPage::fillTemplate(QualitaAriaPath .'template/blob/'.$this->GetCValue('template'),
					self::decoraRisultati($recs)
				));

				$out->add(pgAsset::css(	QualitaAriaURL .'assets/css/misureantismog.css'	));
			}
*/		
		return $out;
	}


	function parseForm($index, &$pars) {    // byref

		foreach (array(
			'template',
		) as $n)
			if (hasPar($n . $index))
				$this->value['*'][$n] = cleanInput(urlPar($n . $index));
	}
/*
	protected static function decoraRisultati($rec) {

		fxQualitaAria::inc(
			'class/dateUtils',
			'class/misureAntismogUtils'
		);
		
		foreach(array('DataDa', 'DataA') as $f)
			$rec[$f] = dateUtils::Mysql2Ita($rec[$f]);

	
		api::inc('MD');
		$rec['urlpaginaantismog'] = apiMD::getPageURL(Config('*appQualitaAria.MisureAntismogTargetPage'));
		$rec['LivelloDescrizione'] = misureAntismogUtils::decodifiche($rec['Livello']);
		$rec['IMGBASEURL'] =  QualitaAriaURL .'assets/img/';

		$rec['Livello'.$rec['Livello']] = array();
		return $rec;
	}
*/	
}
