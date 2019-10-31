<?php

api::inc('Template', 'Lister');

class FototecaLister extends apiLister {

    protected 
        $rpp = 10,
        $tabella = 'Fototeca',
        $tpl = '';

    public function __construct($tpl, $p = array()) {
        
        $this->tpl = $tpl;
        parent::__construct($tpl, $p);
        if(isset($p['baseurl']))
            $this->setBaseUrl($p['baseurl']) ;
    }

    protected function dLoadDefaults() {
        
        return array(
            'p' => 0,
            'AUTORE' => '',
            'OGGETTO' => '',
            'NUMCATGEN' => '',
            'SOGGETTO' => '',
            'INVN' => '',
            'UBICAZIONE' => -1
        );
    }

    protected function dFormatInlineError($n, $m) {

        return '<div class="alert alert-danger">' . $m . '</div>';
    }

    protected function dLoadResults($v) {

        $c = $this->countRecords($v);

        if ($c == 0) {

            list($cnt) = apiTemplate::getSection($this->tpl, 'nores');
            
            return apiPage::FillTemplate($cnt);
        }

        $rs = $this->executeQuery($v);
        $rows = $this->rowDecorator($rs);

        $this->setElPar('p', 'numpages', ceil($c / $this->rpp));
        list($cnt) = apiTemplate::getSection($this->tpl, 'table');
        
        return apiPage::FillTemplate($cnt, array(
                'Row' => $rows,
                'totRecs' => $c
            )
        );
    }

    protected function executeQuery($v) {
        

        return cDBI()->getRecordList(
            $this->tabella,
            sql::where(join(' AND ', $this->getConds($v))),
            sql::order($this->getOrder($v)),
            sql::limit($v['p'] * $this->rpp, $this->rpp)
        );
    }

    protected function getConds($v) {
        //d($v);

        $conds = array();

        // 20191017 richiesta di escludere pinacoteca
        $conds[] = $this->tabella.'.UBICAZIONE != ' . cDBI()->q( 'Pinacoteca' );


        if (! empty($v['AUTORE']))
            $conds[] = $this->tabella.'.AUTORE LIKE  ' . cDBI()->q('%'. $v['AUTORE'] . '%');

        if (! empty($v['OGGETTO'])){

            $conds[] = '(' . 
                $this->tabella.'.OGGETTO LIKE ' . cDBI()->q('%'. $v['OGGETTO'] . '%') . 
                ' OR ' . $this->tabella.'.OGGETTO2 LIKE ' . cDBI()->q('%'. $v['OGGETTO'] . '%') .
                ' OR ' . $this->tabella.'.TITOLO LIKE ' . cDBI()->q('%'. $v['OGGETTO'] . '%') .
                ')';
        }

        if (! empty($v['SOGGETTO']))
            $conds[] = $this->tabella.'.SOGGETTO LIKE  ' . cDBI()->q('%'. $v['SOGGETTO']. '%') ;

        if (! empty($v['INVN']))
            $conds[] = $this->tabella.'.INVN LIKE  ' . cDBI()->q('%'. $v['INVN'] . '%');
        
        if (! empty($v['NUMCATGEN']))
            $conds[] = $this->tabella.'.NUMCATGEN LIKE  ' . cDBI()->q('%'. $v['NUMCATGEN'] . '%');
        /*   
        foreach(array('AUTORE' => 'AUTORE' ) as $ff => $dbf )
            if (! empty($v[$ff]))
              $conds[] = $this->tabella.'.'.$dbf.' LIKE ' . cDBI()->q('%'.$v[$ff] . '%') ;
        */
        $fondi = uFototeca::getFondi();
        if ((int)$v['UBICAZIONE'] !== -1)
            $conds[] = $this->tabella.'.UBICAZIONE = ' . cDBI()->q( $fondi[(int)$v['UBICAZIONE']] );


        if(empty($conds))
            $conds = array('1>0');

        return $conds;
    }

    protected function getOrder($v){
        return ' 1';
    }

    protected function rowDecorator($rows) { 

        foreach ($rows as &$r) {

            $r['IMMAGINE'] = is_file(uFototeca::getSmallImgPath() . $r['IMMAGINE']) ? uFototeca::getSmallImgUrl() . $r['IMMAGINE'] : uFototeca::getSmallImgUrlPlaceholder();
            $r['linkDetails'] = $this->bu .'?ID='.$r['CODICE_OGGETTO'];
            if(!empty($r['OGGETTO']) && !empty($r['OGGETTO2'])){
                $r['OGGETTO'] .= ' - ' . $r['OGGETTO2'];
            }else{
                $r['OGGETTO'] .= $r['OGGETTO2']; 
            }
            $r['TITOLO'] = empty($r['TITOLO']) ? $r['OGGETTO'] : $r['TITOLO'];
            
            /*$linkToDetails = apiPage::addParameter(
                kAPIFPCommonURL . 'Fototeca.php',
                    array(
                        'ID' => $r['CODICE_OGGETTO'],
                        'BL' => apiPage::urlParEncode($this->linkToSelf())
                    )
            );*/
        }

        return $rows;
    }

    protected function countRecords($v) {
        
        $conds = $this->getConds($v);        
        return cDBI()->count(
            $this->tabella,
            sql::where(join(' AND ', $conds))
        );
    }
}