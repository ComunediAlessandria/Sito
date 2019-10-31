<?php

class HTMLFormBootstrapQADatepicker extends HTMLFormObjectWithAssets {

	function __construct($name, $v = null, $pars = null) {

	//	if (! isset($pars['lang']))
	//	$pars['lang'] = kAPILang;
		parent::__construct($name, $v, $pars);
	}

	protected function build() {

		inc::mod('lib/BootstrapDTPicker');
		$as = libBootstrapDTPicker::assets();
		if (! empty($this->mValue))
			$dv = date('d/m/Y', $this->mValue);
		else
			$dv = '';

		if (isBOBootstrap3) {

			$dtp = new pgContent(
				libBootstrapDTPicker::getDatePicker($this->name() . '_d', $dv, array('width' => '40%'))
			);

		} else {

			$dtp = new pgContent("
				<div class='flex-control-date input-append'>
					<input name='" . $this->name() . '_d' . "' class='input-small' data-format='dd/MM/yyyy' type='text' value='" . $dv . "' />
					<span class='add-on'>
						<i data-time-icon='icon-time' data-date-icon='icon-calendar'></i>
					</span>
				</div>
			");

			$dtp->add(
				libBootstrapDTPicker::language($GLOBALS['gAdminLanguage']),
				new pgAssetJSExecuteOnce("

				$('.flex-control-date').datetimepicker({
					pickTime: false,
					maskInput: false,
					language: '" . strtolower($GLOBALS['gAdminLanguage']) . "'
				});

				$('.flex-control-date').click(function() {

					$(this).data('datetimepicker').show();
				});
			"));
		}
		$dtp->add($as);
		return $dtp;
	}

	function parseForm($post) {

		if (is_null($post))
			$post = $_POST;

		if (isset($post[$this->mName . '_d']) && ! empty($post[$this->mName . '_d'])) {


			list($d, $m, $y) = explode('/',$post[$this->mName . '_d']);

			$this->mValue = mktime(0,0,0,$m,$d,$y);
			$hasData = true;
		} else {
			
			$hasData = false;
			$this->mValue = '';
		}
		
		return array($hasData, true);
	}
}

