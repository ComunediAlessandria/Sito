<?php

api::inc( 'Wizard', 'WizardOnePage', 'Template');

class qualitaAriaWOP  extends apiWizardOnePage {

	protected 
		$id = 0
	;

	public function __construct($id, $t, $p = array()) {

		$this->id = $id;
		fxQualitaAria::inc('class/customValidations');
		$p['validations'] = array('customValidations');
		parent::__construct($t, $p);
	}

	protected function dFormatInlineError($n, $m) {	return '<p class="alert alert-error">' . $m . '</p>';	}

	public function ID() {	return $this->id;	}
	
	public function ud($field) {	return $this->userData($field);	}
	
	public function ReadOnly() {return $this->id !== 0; }
}