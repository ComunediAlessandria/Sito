<?php

require_once( '../qualitaAria.inc.php');

abortIfNotPermission('QUARIAMIANSM');

$pg = apiPage::newAdminPage();
$pg->setPageDescriptor(__FILE__);
$pg->setPageTitle('Scheda misure antismog');

//$cnt = new pgContent();

$id = (int) apiPage::urlPar('ID',0);
$bl = apiPage::urlPar('BL', '');
$bl = apiPage::urlParDecode($bl);
$action = apiPage::urlPar('A', 'E');

fxQualitaAria::inc(
	'class/qualitaAriaWOP',
	'class/dateUtils',
	'HTMLFormObjects/HTMLFormBootstrapQADatepicker',
	'class/misureAntismogUtils'
);


class misureAntismogWOPEditAdmin extends qualitaAriaWOP { 

	const template = 'template/bo/misureAntismogWOPEditAdmin';

	public function __construct($id, $p = array()) {

		parent::__construct($id, QualitaAriaBasePath . self::template, $p);
	}

	protected function dValidatePage($n, $d, $cmd) {

		$e = array();

		if (! empty($d['DataDa'])) {

			$lb = q(dateUtils::Ts2Mysql($d['DataDa']));
			if (i18nQuaria()->Count('MisureAntismog',
				sql::where('DataDa <= '.$lb .' AND DataA  >= '.$lb),
				sql::where('IDMisureAntismog <> '.$this->id())
			) >0)
				$e['DataDa'] = 'La data iniziale è già inserita in una misura';
		}

		if (! empty($d['DataA'])) {

			$ub = q(dateUtils::Ts2Mysql($d['DataA']));
			if (i18nQuaria()->Count('MisureAntismog',
				sql::where('DataDa <= '.$ub .' AND DataA  >= '.$ub),
				sql::where('IDMisureAntismog <> '.$this->id())
			) >0)
				$e['DataA'] = 'La data finale è già inserita in una misura';
		}
		
		if (! empty($d['DataDa'])  && ! empty($d['DataA']) && $d['DataA'] < $d['DataDa'] )
			$e['DataA'] = 'La data finale è inferiore alla data iniziale';

		return $e;
	}
}
	


try {

	if ($action === 'D') {

		$db = apiDB::cdb();
		$db->newTransaction();

		$res = i18nQuaria()->deleteRecord('MisureAntismog', $id);

		if ($res === false)
			throw new Exception('ERRORE DB Cancellazione record'.$db->error());

		$db->commit();
		$db->closeTransaction();
		apiPage::redirect($bl,302);
	
	} else {

		$w = new misureAntismogWOPEditAdmin($id);

		if ($w->status() === apiWizardOnePage::statusError)
	        throw new Exception();

        if ($w->needsData()) {

			if ($id == 0) {

				$data = array(
					'DataDa'	=> '',	
					'DataA'		=> '',	
					'Livello'	=> -1,
					'Note'		=> '',
				);
			} else {

				if (($res = i18nQuaria()->getRecordByID('MisureAntismog',$id)) !== false) {

					$data = array(
						'DataDa'	=> dateUtils::Myslq2TS($res['DataDa'], false),
						'DataA'		=> dateUtils::Myslq2TS($res['DataA'], false),
						'Livello'	=> $res['Livello'],
						'Note'		=> $res['Note'],
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
	            	'DataDa'	=> dateUtils::Ts2Mysql($data['DataDa']),
	            	'DataA'		=> dateUtils::Ts2Mysql($data['DataA']),
	            	'Livello'	=> $data['Livello'],
	            	'Note'		=> empty($data['Note']) ? null : $data['Note'],
	            	'UMDT'		=> i18nDB::now,
	            	'UMUser' 	=> apiUser::encodeCurrentUser(),
	            );

	   //	throw new Exception('ERRORE XXXXX ');

				$db = apiDB::cdb();
				$db->newTransaction();

				if ($w->id() == 0) {

					$res = i18nQuaria()->createRecord('MisureAntismog', $dts);

					if ($res === false)
						throw new Exception('ERRORE DB '.$db->error());
				} else {

					$res = i18nQuaria()->updateRecord('MisureAntismog',$w->id(), $dts);

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

	LG('misureAntismogEdit', 'Exception: '. $e->getMessage());
}

$pg->setPageContent($cnt)->servePage();
