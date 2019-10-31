<?php

	class misureAntismogUtils {

		static $misureAntismog = array(
			0	=> 'Nessuna allerta',
			1	=> 'Superamento 4 gg consecutivi',
			2	=> 'Superamento 10 gg consecutivi',
		);

		static function decodifiche($t = null) {

			return is_null($t) ? self::$misureAntismog : self::$misureAntismog[$t];
		}
	}

