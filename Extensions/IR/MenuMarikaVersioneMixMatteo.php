<?php

inc::cls('clsFlexIndexRendererMenu');

	// renderer per i menu di Flex
	// si aspetta che la struttura del menu sia già stata
	// modificata per quello che riguarda il nodo selezionato, il livello
	// aperto e quant'altro

class MenuMarikaVersioneMixMatteo extends FlexIRMenu {

	var
		$mFields = null,
		$mStartLevel = 0,
		$mParserContext = null
	;

	function setRenderOptions($sl, $pc) {

		$this->mStartLevel = $sl;
		$this->mParserContext = $pc;
	}

	function render($idx) {

		return parent::render($idx);
	}

/*
	function beforeRender($idx) {

		static $ra = null;
		if (is_null($ra))
			$ra = array(
				'PageIndexTitle'			=> ':' . kMainLanguage,	// usa IT come default

					// lo stato della pagina viene preso dalla pagina originale - se questa non esiste
					// la pagina non va inserita negli indici

//				'ReadyStatus'				=> ':' . kMainLanguage . ':-1',
				'ReadyStatus'				=> -1,
				'PageIndexIcon'				=> '',
				'PageIndexIconDescription'	=> '',
				'PageLinkTitle' 			=> '',
				'URLview'					=> ':' . kMainLanguage,	// default su quella italiana, poi il codice mette a posto il link
				'ValidFrom'					=> ':' . kMainLanguage . ':-1',
				'ValidTo'					=> ':' . kMainLanguage . ':-1',
			);

			// ottiene un elenco degli id dei nodi
			// in modo da caricare i metadati relativi solo
			// a questi nodi

		inc::mod('modFlexMDUtils');

			// raccoglie gli id di tutti i nodi per fare
			// un'unica query sui metadati
			// (attenzione agli indici vuoti)

		$ids = $this->collectIDs($idx);
		if (count($ids) === 0)
		  return;

		$this->mFields = FlexMD::reindexMDArray(FlexMD::getAttrFromDesc(
			$ids,
			kLang,
			$ra,
			 null,
			 null,
			 null
		));

			// include le funzioni per il controllo dell'accesso alle
			// pagine flex che verranno usate durante la stampa dell'indice

		inc::mod('modFlexPageAccess');
	}

	function collectIDs($idx) {

		$ids = array();

			// aggiunge in testa il nodo corrente
			// solo se non è root

		if (! $idx->isRoot())
			$ids[] = $idx->getValue('mPageDesc', / *$default = * /'');

		$ch = $idx->children();
		for ($i = 0, $m = count($ch); $i < $m; $i++)
			$ids = array_merge($ids, $this->collectIDs($ch[ $i ]));

		return $ids;
	}


	function shouldRenderNode($n, $level = 0) {

//		if ($level < $this->mStartLevel)
//			return FALSE;

			// può essere che un nodo abbia un descrittore vuoto
			// (inserito nell'indice, ma non associato ad alcuna pagina)

		$id = $n->getValue('mPageDesc');
		if ($id == '')
			return false;

			// estensione indici

		if (substr($id, 0, 3) === 'ex:') {

			return
					$n->mShouldView
				&&
					$n->getValue('mVisible', true)
			;

		} else {

			if (! isset($this->mFields[ $id ]))
				return false;

			$v = $this->mFields[ $id ];

			return
					$n->mShouldView
				&&
					$n->getValue('mVisible', true)
				&&
					(int)$v['ReadyStatus'] !== 4
				&&
					(int)$v['ReadyStatus'] !== -1
				&&
				 	FlexPageAccess::inValidityInterval(
						(int)$v['ValidFrom'],
						(int)$v['ValidTo']
					)
			;
		}
	}
*/

	function _render($node, $level = 0) {

		$out = array();

			// il primo nodo è un nodo contenitore, e quindi non
			// va visualizzato nel rendering

		$shouldRenderNode = $level === 0 || $this->shouldRenderNode($node, $level);
		$shouldDescend = $level === 0 || $this->shouldDescend($node);

		$ch = $node->children();

			// discende nei figli del nodo solo se il nodo è visualizzato
			// e visualizza i figli

		$chContent = '';
		if ($shouldRenderNode && $shouldDescend) {

				// se ho almeno un child

			if (($m = count($ch)) > 0) {

				for ($i = 0; $i < $m; $i++)
					$chContent .= $this->_render($ch[ $i ], $level + 1);
			}
		}

		if ($level === 0)
			$out[] = null; //'<hr />';
		else {

			if ($shouldRenderNode) {

				$shouldDescend = $this->shouldDescend($node);

				$out[] =
					$this->bBeforeNode($level, $shouldDescend && $chContent !== '')
					. $this->renderNode($node, $level)
				;
			}
		}

			// può succedere che abbia dei figli che per qualche motivo
			// non vengono visualizzati, quindi inserisco i cBeforeChildren/cAfterChildren
			// solo se ho un effettivo contenuto

		if ($chContent !== '')
			$out[] = $this->cBeforeChildren($level) . $chContent . $this->cAfterChildren($level);

		if ($level === 0)
			$out[] = null; // '<hr />';
		else
			if ($shouldRenderNode)
				$out[] = $this->bAfterNode($level);

		return join(CR, $out);
	}



	function renderNode($n, $level = 0) {

		$id = $n->getValue('mPageDesc', /* $default = */ '[No page desc]');

			// estensione indici

		if (substr($id, 0, 3) === 'ex:') {

			inc::mod('indexExtension');

			$meta = indexExtension::getMetadataForEntity($id);

			$url = $meta['URLview'];

			$accessKey = null;

		} else {

			$meta = $this->mFields[$id];

				// se la pagina non ha metadati nella lingua specificata
				// carica quelli in italiano
				// i dati nell'array ci sono perché la pagina esiste, ma sono vuoti

	//		if ($meta['URLview'] === '#') {
			if (! FlexMD::hasLanguage($meta, kLang)) {

	//			$meta = FlexMD::GetPageAttr($id, '*', 'IT');

					// l'URL riporta la lingua sbagliata, quindi la sostituisco

				$url = str_replace('L/IT', 'L/' . kLang, $meta['URLview']);

			} else
				$url = $meta['URLview'];

			$ak = $n->getValue('mAccessKey');
	//		$accessKey = strlen($ak) === 1 ? ("accesskey='" . h($ak) . "'") : '';
			$accessKey = onlyIf(strlen($ak) === 1, "accesskey='" . h($ak) . "'");
		}

		$pageTitle = parsePageIndexTitle($meta['PageIndexTitle'], $this->mParserContext);

			// immagine associata alla pagina

		// $img = '';
		// $imgPath = $meta['PageIndexIcon'];
		// if ($imgPath != '')
		// 	$img = "<img src='" . kImagesURL  . $imgPath . "' alt='" . h($meta['PageIndexIconDescription']) . "' />";

		$linkTitle = h($meta['PageLinkTitle']);

			// ho 4 casi di visualizzazione, cioé le 4 combinazioni di pagina selezionata/corrente

		switch (($n->mSelected ? 'S' : 'N') . ($n->mCurrent ? 'S' : 'N')) {

			case 'NN':		// non selezionata / non corrente

					// <li>
					$out = "<a href='" . $url . "' title='" . $linkTitle . "' $accessKey><span>" . $pageTitle . '</span></a>';

				break;

			case 'SN':		// selezionata / non corrente

					// <li class='LISel'>
					$out = "<a href='" . $url . "' title='" . $linkTitle . "' $accessKey><span>" . $pageTitle . '</span></a>';

				break;

			case 'NS':		// non selezionata / corrente

					// <li class='LIStrong'>
					$out = "<span class='dropdown-strong'>" . $pageTitle . '</span>';

				break;

			case 'SS':		// selezionata / corrente

					// <li class='LISel'>
					$out = "<span class='dropdown-sel'>" . $pageTitle . '</span>';

				break;
		}

		return $out;
	}

		// elementi HTML per il rendering

	// function cBeforeTree($n) {}
	// function cAfterTree() {}

	function cBeforeChildren($level) {

		return $level === 0
			? '<ul class="nav navbar-nav">'
			: (($level === 1)  
				? '<ul class="dropdown-menu">'
				: '<span class="dropdown-toggle glyphicon glyphicon-chevron-down" data-toggle="dropdown"></span><ul class="dropdown-menu">'
			) 
		;
		/*return $level === 0
			? '<ul class="nav navbar-nav">'
			: '<span class="dropdown-toggle glyphicon glyphicon-chevron-down" data-toggle="dropdown"></span><ul class="dropdown-menu">' 
		;*/
	}

	function cAfterChildren($level) { return '</ul>' . CR;}

	function bBeforeNode($level, $hasDropdown) {

		return $hasDropdown
			? (
				$level > 1
					? '<li class="dropdown dropdown-submenu">'
					: '<li class="dropdown open">'
			)
			: '<li>'
		;
	}

	function bAfterNode($level) { return '</li>' . CR;}
}
/*

            <span class="dropdown-toggle glyphicon glyphicon-chevron-down" data-toggle="dropdown"></span>

            <ul class="dropdown-menu">


    <ul class="nav navbar-nav">
        <li><a href=""><span>Voce 1</span></a></li>
        <li><a href=""><span>Voce 2</span></a></li>
        <li class="dropdown">

            <a href="#"><span>Voce 3</span></a>
            <span class="dropdown-toggle glyphicon glyphicon-chevron-down" data-toggle="dropdown"></span>

            <ul class="dropdown-menu">
*/
