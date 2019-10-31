<?php 

class customValidations {

	static function NotEmpty($v) {		

		return $v !== '';	
	}
	
	static function NotSelected($v) {		

		return $v != -1;	
	}

	static function isInteger($v) {		

		return preg_match('/^\d+$/',$v) == 1;
	}
}