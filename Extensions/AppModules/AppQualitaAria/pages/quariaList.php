<?php

require_once( '../qualitaAria.inc.php');

abortIfNotPermission('QUARIA');

$pg = apiPage::newAdminPage();
$pg->setPageDescriptor(__FILE__);
$pg->setPageTitle('Elenco rilevazioni qualità dell\'aria');


$cnt = new pgContent();

fxQualitaAria::inc(
	'class/qualitaAriaLister',
	'HTMLFormObjects/HTMLFormBootstrapPaginator',
	'class/dateUtils',
	'HTMLFormObjects/HTMLFormBootstrapQADatepicker'
);


class qualitaAriaListerElencoAdmin extends qualitaAriaLister {
	
	const
		tplName = 'template/bo/qualitaAriaListerElencoAdmin.html'
	//	,rpp = 2
	;

	function __construct($pars = array()) {	

		parent::__construct(! isset($pars['tpl']) ? QualitaAriaPath . self::tplName : $pars['tpl']); 
		if (isset($pars['baseurl']))
			$this->setBaseURL($pars['baseurl']);
	}

	protected function dLoadDefaults() {

		return array(
			'p'	=> 0,
			'DataDa' => '',
			'DataA' => '',
			);
	}		

	static $targetUrl = null;

	function urlEdit($action, $id) {

		if (is_null(self::$targetUrl)) 
			self::$targetUrl = apiPage::addParameter(
				QualitaAriaPagesURL .'quariaEdit.php', array(
					'BL' => apiPage::URLParEncode(  $this->linkToSelf()),
				));

		return self::$targetUrl  . '?'.join('&', array('A='.$action, 'ID=' .$id));
	}

	function decorate($recs) {

		$t = array();

			// nota: non posso usare linkfactory con un BL
	 
		foreach ($recs as $r) {

			$r['URLEdit'] = $this->urlEdit('E', $r['IDQualitaAria']);
			$r['URLDel'] = $this->urlEdit('D', $r['IDQualitaAria']);
			$r['Data'] = dateUtils::Mysql2Ita($r['Data']);

			$t['row'][] = $r;	
		}

		return $t;
	}

	protected function dLoadResults($v) {

		$this->setTemplateVar('URLNew', $this->urlEdit('N', 0));
	
		$condCommon = array('QualitaAria');

		if (! empty($v['DataDa']))
			$condCommon[] = sql::where('Data >= '.q(dateUtils::Ts2Mysql($v['DataDa'])));

		if (! empty($v['DataA'])) 
			$condCommon[] = sql::where('Data <= '.q(dateUtils::Ts2Mysql($v['DataA'])));	

		$condPagination = array_merge($condCommon, array());
		$condPagination[] = sql::limit(self::rpp * $v['p'], self::rpp);
		$condPagination[] = sql::order('Data DESC');

		$recs = call_user_func_array(array(i18nQuaria(), 'getRecordList'), $condPagination);

		$t = array('nrec' => 0);
		if (count($recs) > 0) {

			$section = 'results';
			$ntot = call_user_func_array(array(i18nQuaria(), 'Count'), $condCommon);
			$t = $this->decorate($recs);
			$t['nrec'] = $ntot;

			$this->setElPar('p', 'numpages', ceil($ntot / self::rpp));
		} else
			$section = 'noresults';

		list($tpl) = apiTemplate::getSection($this->b, $section);

  		return apiPage::fillTemplate($tpl,$t). $this->modalHTML();
	}
}

$bl = apiPage::urlPar('BL', '');
$bl = apiPage::urlParDecode($bl);

$cnt = new pgContent();

try {

	$l = new qualitaAriaListerElencoAdmin();

	if ($l->status() === apiLister::statusError) 
		throw new Exception('Errore lister, riprovare');

	$c = $l->processAndGetPGContent();
	$cnt->add($c);
} catch (Exception $e) {

	$cnt = 'Errore! '.$e->getMessage();
	LG('quariaList', 'Exception: '. $e->getMessage());
}

$pg->setPageContent($cnt)->servePage();


/*

		foreach (array('Nome' => 'Nome', 'Cognome' => 'Cognome', ) as $field => $fieldDB)
			if (! empty($v[$field]))
				$condCommon[] = sql::where($fieldDB .' LIKE '. q('%'.$v[$field].'%'));

		if (! empty($v['datada']))
			$condCommon[] = sql::where('DTCreazione >= '.q(date('Y-m-d 00:00:00', $v['datada'])));

		if (! empty($v['dataa']))
			$condCommon[] = sql::where('DTCreazione <= '.q(date('Y-m-d 23:59:59', $v['dataa'])));
		
		$condPagination = array_merge($condCommon, array());

		$condPagination[] = sql::limit(self::rpp * $v['p'], self::rpp);
		$condPagination[] = sql::order('IDPatente DESC');

*/