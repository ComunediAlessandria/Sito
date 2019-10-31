<?php

inc::cls('clsFlexIndexRendererMenu');

	// renderer per i menu di Flex
	// si aspetta che la struttura del menu sia già stata
	// modificata per quello che riguarda il nodo selezionato, il livello
	// aperto e quant'altro
	// js/menuMarika.js nuovo da caricare

class MenuMarika extends FlexIRMenu {

	const
		version = 1.2,
		versionDate = '2018.06.15'
	;

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



//  return '


//           <a href="#demo3" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 3</a>

//           <ul class="collapse" id="demo3">

//           <li data-toggle="collapse" data-target="SubMenu1" data-parent="#SubMenu1">
//             <a href="#" class="list-group-item"  >Subitem 1 <i class="fa fa-caret-down"></i></a>

//             <ul class="collapse list-group-submenu" id="SubMenu1">

//               <li><a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 1 a</a></li>
//               <li><a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 2 b</a></li>

//               <li>
// 	              <a href="#SubSubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubSubMenu1">Subitem 3 c <i class="fa fa-caret-down"></i></a>

// 	              <ul class="collapse list-group-submenu list-group-submenu-1" id="SubSubMenu1">
// 	                <li><a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 1</a></li>
// 	                <li><a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 2</a></li>
// 	              </ul>
// 			</li>
//               <li><a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 4 d</a></li>

//             </ul>
//         </li>
//             <li><a href="javascript:;" class="list-group-item">Subitem 2</a></li>
//             <li><a href="javascript:;" class="list-group-item">Subitem 3</a></li>

//           </ul>
// ';







// return '


//           <a href="#demo3" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 3</a>

//           <ul class="collapse" id="demo3">

//           <li>
//             <a href="#SubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubMenu1">Subitem 1 <i class="fa fa-caret-down"></i></a>

//             <ul class="collapse list-group-submenu" id="SubMenu1">

//               <li><a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 1 a</a></li>
//               <li><a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 2 b</a></li>

//               <li>
// 	              <a href="#SubSubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubSubMenu1">Subitem 3 c <i class="fa fa-caret-down"></i></a>

// 	              <ul class="collapse list-group-submenu list-group-submenu-1" id="SubSubMenu1">
// 	                <li><a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 1</a></li>
// 	                <li><a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 2</a></li>
// 	              </ul>
// 			</li>
//               <li><a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 4 d</a></li>

//             </ul>
//         </li>
//             <li><a href="javascript:;" class="list-group-item">Subitem 2</a></li>
//             <li><a href="javascript:;" class="list-group-item">Subitem 3</a></li>

//           </ul>
// ';

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
					. $this->myRenderNode($node, $level)
				;
			}
		}

			// può succedere che abbia dei figli che per qualche motivo
			// non vengono visualizzati, quindi inserisco i cBeforeChildren/cAfterChildren
			// solo se ho un effettivo contenuto

		if ($chContent !== '')
			$out[] = $this->cBeforeChildren($level)

				. ($level === 0 ? null : $this->renderNodeForAlias($node, $level))

				. $chContent
				. $this->cAfterChildren($level)
			;

		if ($level === 0)
			$out[] = null; // '<hr />';
		else
			if ($shouldRenderNode)
				$out[] = $this->bAfterNode($level);

		return join(CR, $out);
	}

	function renderNodeForAlias($node, $level) {

		return $this->bBeforeNode($level, false)
			. $this->myRenderNode($node, $level, 'Home page ')
			. $this->bAfterNode($level)
		;
	}

	function renderNode($n, $level = 0) {

		e();
	}

	function myRenderNode($n, $level, $at = null) {

		$id = $n->getValue('mPageDesc', /* $default = */ '[No page desc]');

			// estensione indici

		if (substr($id, 0, 3) === 'ex:') {

			inc::mod('indexExtension');

			$meta = indexExtension::getMetadataForEntity($id);

			$url = $meta['URLview'];

			$accessKey = null;

		} else if (substr($id, 0, 4) === 'http') {

			$data = $n->getValue('data');

			$meta['PageIndexTitle'] = '[missing title]';
			if (isset($data['title'][kLang]))
				$meta['PageIndexTitle'] = $data['title'][kLang];

			$url = $id;

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

		$linkTitle = h(
			isset($meta['PageLinkTitle']) ? $meta['PageLinkTitle'] : null
		);


			// ho 4 casi di visualizzazione, cioé le 4 combinazioni di pagina selezionata/corrente

		switch (($n->mSelected ? 'S' : 'N') . ($n->mCurrent ? 'S' : 'N')) {

			case 'NN':		// non selezionata / non corrente

					// <li>
					$out = "<a href='" . $url . "' title='" . $linkTitle . "' $accessKey><span>" . $at . $pageTitle . '</span></a>';

				break;

			case 'SN':		// selezionata / non corrente

					// <li class='LISel'>
					$out = "<a href='" . $url . "' title='" . $linkTitle . "' $accessKey><span>" . $at . $pageTitle . '</span></a>';

				break;

			case 'NS':		// non selezionata / corrente

					// <li class='LIStrong'>
					$out = "<span class='dropdown-strong'>" . $at . $pageTitle . '</span>';

				break;

			case 'SS':		// selezionata / corrente

					// <li class='LISel'>
					$out = "<span class='dropdown-sel'>" . $at . $pageTitle . '</span>';

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
			: '<span class="dropdown-toggle glyphicon glyphicon-chevron-down"></span><ul class="collapse">'
		;
	}

	function cAfterChildren($level) { return '</ul>' . CR;}

	function bBeforeNode($level, $hasDropdown) {

		return $hasDropdown
			? (
				$level > 1
					? '<li class="dropdown dropdown-submenu">'
					: '<li class="dropdown">'
			)
			: '<li>'
		;
	}

	function bAfterNode($level) { return '</li>' . CR;}
}
/*

        <div class="list-group panel">

          <a href="#demo3" class="list-group-item list-group-item-success" data-toggle="collapse" data-parent="#MainMenu">Item 3</a>

          <div class="collapse" id="demo3">

            <a href="#SubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubMenu1">Subitem 1 <i class="fa fa-caret-down"></i></a>

            <div class="collapse list-group-submenu" id="SubMenu1">

              <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 1 a</a>
              <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 2 b</a>
              <a href="#SubSubMenu1" class="list-group-item" data-toggle="collapse" data-parent="#SubSubMenu1">Subitem 3 c <i class="fa fa-caret-down"></i></a>

              <div class="collapse list-group-submenu list-group-submenu-1" id="SubSubMenu1">
                <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 1</a>
                <a href="#" class="list-group-item" data-parent="#SubSubMenu1">Sub sub item 2</a>
              </div>

              <a href="#" class="list-group-item" data-parent="#SubMenu1">Subitem 4 d</a>

            </div>

            <a href="javascript:;" class="list-group-item">Subitem 2</a>
            <a href="javascript:;" class="list-group-item">Subitem 3</a>

          </div>
        </div>

*/
