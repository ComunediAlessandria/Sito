<?php

class uFototeca {

    static function getSmallImgPath(){
        return kAPIAppDataRedationalPath . 'Fototeca/thumbs/t_';
    }

    static function getSmallImgUrl(){
        return kAPIAppDataRedationalURL . 'Fototeca/thumbs/t_';
    }

    static function getSmallImgUrlPlaceholder(){
        return kAPIExtensionsURL . 'assets/img/na_small.gif';
    }
    
    static function getImgPath(){
        return kAPIAppDataRedationalPath . 'Fototeca/photo/';
    }

    static function getImgUrl(){
        return kAPIAppDataRedationalURL . 'Fototeca/photo/';
    }

    static function getImgUrlPlaceholder(){
        return kAPIExtensionsURL . 'assets/img/na_large.gif';
    }

    static function getFondi(){
        return array(
            1 => 'Fondo Borsalino',
            2 => 'Fondo Guerci',
            3 => 'Fondo Napoleonico',
            4 => 'Fondo Sartorio',
            5 => 'Fondo storico locale',
          // 6 => 'Pinacoteca',
        );
    }
}