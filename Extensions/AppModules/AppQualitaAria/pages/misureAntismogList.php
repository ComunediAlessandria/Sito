<?php

require_once( '../qualitaAria.inc.php');

abortIfNotPermission('QUARIAMIANSM');

$pg = apiPage::newAdminPage();
$pg->setPageDescriptor(__FILE__);
$pg->setPageTitle('Elenco misure antismog');


$cnt = new pgContent();

fxQualitaAria::inc(
	'class/qualitaAriaLister',
	'HTMLFormObjects/HTMLFormBootstrapPaginator',
	'class/dateUtils',
	'HTMLFormObjects/HTMLFormBootstrapQADatepicker'
);


class misureAntismogListerElencoAdmin extends qualitaAriaLister {
	
	const
		tplName = 'template/bo/misureAntismogListerElencoAdmin.html'
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
				QualitaAriaPagesURL .'misureAntismogEdit.php', array(
					'BL' => apiPage::URLParEncode(  $this->linkToSelf()),
				));

		return self::$targetUrl  . '?'.join('&', array('A='.$action, 'ID=' .$id));
	}

	function decorate($recs) {

		$t = array();

			// nota: non posso usare linkfactory con un BL
	 
	 	$now = date('Y-m-d', kAPITime);
		foreach ($recs as $r) {

			// questo formato di data è ordinabile come stringa 
			if (strcmp($r['DataDa'], $now) <= 0 && strcmp( $r['DataA'],$now) >= 0 )
				$r['evidenzia'] = 'success';
			else
				$r['evidenzia'] = '';

			$r['URLEdit'] = $this->urlEdit('E', $r['IDMisureAntismog']);
			$r['URLDel'] = $this->urlEdit('D', $r['IDMisureAntismog']);
			$r['DataDa'] = dateUtils::Mysql2Ita($r['DataDa']);
			$r['DataA'] = dateUtils::Mysql2Ita($r['DataA']);

			$t['row'][] = $r;	
		}

		return $t;
	}

	protected function dLoadResults($v) {

		$this->setTemplateVar('URLNew', $this->urlEdit('N', 0));
	
		$condCommon = array('MisureAntismog');

			// cervellotico accrocchio per cercare i record entro i due range

		$da = ! empty($v['DataDa']) ? q(dateUtils::Ts2Mysql($v['DataDa'])) : null;

		$a = ! empty($v['DataA']) ? q(dateUtils::Ts2Mysql($v['DataA'])) : null;

		$condOr = array();

		if (! is_null($da) && ! is_null($a))
			$condOr[] = '( DataDa >= '.$da . ' AND DataA <= '.$a.' )';
		elseif (! is_null($da))
			$condOr[] = '( DataDa >= '.$da . ' )';
		elseif (! is_null($a))
			$condOr[] = '( DataA >= '.$a . ' )';

			// record che include inizio
		if (! is_null($da))
			$condOr[] = '( DataDa >= '.$da . ' AND DataA <= '.$da.' )';

			// record che include fine
		if (! is_null($a))
			$condOr[] = '( DataDa <= '.$a . ' AND DataA >= '.$a.' )';		

		if (count($condOr) > 0)
			$condCommon[] = sql::where(join(' OR ', $condOr));


		$condPagination = array_merge($condCommon, array());
		$condPagination[] = sql::limit(self::rpp * $v['p'], self::rpp);
		$condPagination[] = sql::order('DataDa DESC');

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

	$l = new misureAntismogListerElencoAdmin();

	if ($l->status() === apiLister::statusError) 
		throw new Exception('Errore lister, riprovare');

	$c = $l->processAndGetPGContent();
	$cnt->add($c);
} catch (Exception $e) {

	$cnt = 'Errore! '.$e->getMessage();
	LG('misureAntismogList', 'Exception: '. $e->getMessage());
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