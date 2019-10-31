<?php

require_once( '../qualitaAria.inc.php');

abortIfNotPermission('QUARIA');

$pg = apiPage::newAdminPage();
$pg->setPageDescriptor(__FILE__);
$pg->setPageTitle('Rilevazione Qualità dell\'aria');

//$cnt = new pgContent();

$id = (int) apiPage::urlPar('ID',0);
$bl = apiPage::urlPar('BL', '');
$bl = apiPage::urlParDecode($bl);
$action = apiPage::urlPar('A', 'E');

fxQualitaAria::inc(
	'class/qualitaAriaWOP',
	'class/dateUtils',
	'HTMLFormObjects/HTMLFormBootstrapQADatepicker'
);


class qualitaAriaWOPEditAdmin extends qualitaAriaWOP { 

	const template = 'template/bo/qualitaAriaWOPEditAdmin';

	public function __construct($id, $p = array()) {

		parent::__construct($id, QualitaAriaBasePath . self::template, $p);
	}

	protected function dValidatePage($n, $d, $cmd) {

		$e = array();

		if ($d['Data'] !== '' && i18nQuaria()->Count('QualitaAria',sql::matches('Data',dateUtils::Ts2Mysql($d['Data'])), sql::where('IDQualitaAria <> '.$this->id))  > 0) 
				$e['Data'] = 'Esiste già una rilevazione corrispondente a questa data';		
// if (i18nQuaria()->Count('QualitaAria',sql::matches('Data',dateUtils::Ts2Mysql($d['Data'])), sql::where('IDQualitaAria <> '.$this->id))  > 0)
		
		return $e;
	}
}

try {

	if ($action === 'D') {

		$db = apiDB::cdb();
		$db->newTransaction();

		$res = i18nQuaria()->deleteRecord('QualitaAria', $id);

		if ($res === false)
			throw new Exception('ERRORE DB Cancellazione record'.$db->error());

		$db->commit();
		$db->closeTransaction();
		apiPage::redirect($bl,302);
		
	} else {
		
		$w = new qualitaAriaWOPEditAdmin($id);

		if ($w->status() === apiWizardOnePage::statusError)
            throw new Exception();

        if ($w->needsData()) {

			if ($id == 0) {

				$data = array(
					'Data'	=> '',	// kAPITime
					'PM10'	=> '',
					'Note'	=> '',
				);
			} else {

				if (($res = i18nQuaria()->getRecordByID('QualitaAria',$id)) !== false) {

					$data = array(
						'Data'	=> dateUtils::Myslq2TS($res['Data'], false),
						'PM10'	=> $res['PM10'],
						'Note'	=> $res['Note'],
					);
				} else 
					die("no rec found");
			}
			$w->setData($data);
        }

		if ($w->previousStatus() === FlexAPIWizard::statusFinished)
        	apiPage::redirect($bl,302);

		switch ($w->process()) {

			case apiWizardOnePage::statusEditing:

				$cnt = $w->getPGContent();			
                break;

            case apiWizardOnePage::statusCanceled:

				apiPage::redirect($bl, 302);

			case apiWizardOnePage::statusFinished:

				$data = $w->values();   
				
				api::inc('User');
                $dts = array(
                	'Data'	=> dateUtils::Ts2Mysql($data['Data']),
                	'PM10'	=> $data['PM10'],
                	'Note'	=> empty($data['Note']) ? null : $data['Note'],
                	'UMDT'	=> i18nDB::now,
                	'UMUser' => apiUser::encodeCurrentUser(),
                );

       //	throw new Exception('ERRORE XXXXX ');

				$db = apiDB::cdb();
				$db->newTransaction();

				if ($w->id() == 0) {

					$res = i18nQuaria()->createRecord('QualitaAria', $dts);

					if ($res === false)
						throw new Exception('ERRORE DB '.$db->error());
				} else {

					$res = i18nQuaria()->updateRecord('QualitaAria',$w->id(), $dts);

					if ($res === false)
						throw new Exception('ERRORE DB '.$db->error());
				}

				$db->commit();
				$db->closeTransaction();
				apiPage::redirect($bl,302);
        }



	}
} catch (Exception $e) {

	if (isset($db)) {

		$cnt = new pgContent('Errore nel salvataggio su database. Riprovare più tardi' . $e->getMessage());
		$db->rollback();
		$db->closeTransaction();
	} else
		$cnt = new pgContent('Si è manifestato un problema. Riprovare più tardi.' . $e->getMessage());	

	LG('quariaEdit', 'Exception: '. $e->getMessage());
}

$pg->setPageContent($cnt)->servePage();
