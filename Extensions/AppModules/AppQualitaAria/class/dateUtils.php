<?php


class dateUtils {

/*	static function Ita2Mysql($d, $sep = '/') {
		
		$parts = explode($sep, $d);	
		return join('-', array_reverse($parts,true));
	}
*/

	static function Mysql2Ita($d, $sep = '/', $full = false) {

		if ($d === '') 
			return '';

/*			
		if ($full === false) {

			if (strpos($d, ' ') === false)
				$date = $d;
			else	
				list($date,$time) = explode(' ', $d);

			$parts = explode('-', $date);
			return join($sep, array_reverse($parts,true));			
		} 
*/

		if (strpos($d, ' ') === false) {

			$date = $d;
			$time = '00:00:00';
		} else	
			list($date,$time) = explode(' ', $d);

		$parts = explode('-', $date);
		
		if ($full === false) 
			return join($sep, array_reverse($parts,true));
		else 
			return join($sep, array_reverse($parts,true)) .' '. $time;
	}

	static function Ts2Mysql($ts) {
	
		return date("Y-m-d H:i:s", $ts);
	}

	static function Myslq2TS($d, $full = true) {

		if ($full) {
		
			list($dat,$tim) = explode(' ', $d);
			$ti = explode(':', $tim);
			$da = explode('-',$dat);
		} else {
			
			$da = explode('-',$d);
			$ti = array(0,0,0);
		}	
		return  mktime($ti[0],$ti[1],$ti[2], $da[1], $da[2], $da[0]);
	}
	

}