<?php

class misureAntismog {
		// tpl = template di presentazione figlio di AppModules/AppQualitaAria/
	static function getPgContent($tpl, $when = kAPITime) {

		$out = new pgContent();
		$now = q(date('Y-m-d', $when));
		$recs = i18nQuaria()->getRecordList('MisureAntismog', 
				sql::where('DataDa <= '.$now.' AND DataA >= '.$now),
				sql::limit(0, 1)
			);

		if (count($recs) == 1 ) {

			$recs = reset($recs);
			$out->add(apiPage::fillTemplate(QualitaAriaPath . $tpl, 
				self::decoraRisultati($recs)
			));
			$out->add(pgAsset::css(	QualitaAriaURL .'assets/css/misureantismog.css'	));
		}

		return $out;
	}



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
}
