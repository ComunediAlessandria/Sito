<?php

// {MODULE:AppQualitaAriaMisureAntismog:template=alfa}
class clsExtMisureAntismog extends clsExtensionCached {

	function __construct() {

		parent::__construct();
		$this->mCacheEnabled = false;
		$this->mCacheExpireTime = 60 * 10; // dieci minuti
	}

	function CreateContent() {	

		//require_once( '../qualitaAria.inc.php');
		$tpl = $this->par('template', 'default');
		require_once( dirname(__FILE__) . '/../qualitaAria.inc.php');

		fxQualitaAria::inc('class/misureAntismog');
		$cnt = misureAntismog::getPgContent('template/ext/qualitaAria-'.$tpl.'.html');

		$this->addPageAssets($cnt->getAssets());
		return $cnt->asString();
			
	}
	protected function addPageAssets($a) {

		pgAsset::adapt(
			RaiseEvent('FlexPage.onGetCurrentPage'),
			$a
		);
	}
}
