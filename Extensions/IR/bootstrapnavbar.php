<?php

FlexInclude(kClsPath . 'clsFlexIndexRendererMenu.php');

// Questo renderer disegna solo il secondo livello

class bootstrapnavbar extends FlexIRMenu {

	function _Render($node, $level = 0) {

		$out = '';

			// il primo nodo è un nodo contenitore, e quindi non
			// va visualizzato nel rendering

		$shouldRenderNode = true;

		if ($level === 0)
			$out .= $this->BeforeTree($node);
		else {

			if ($shouldRenderNode = $this->ShouldRenderNode($node, $level))
				$out .= $this->RenderNode($node, $level);
		}

			// discende nei figli del nodo solo se il nodo è visualizzato
			// e dice di visualizzare i figli

		if ($shouldRenderNode && $this->ShouldDescend($node)) {

			$ch = $node->Children();

				// se ho almeno un child

			if (($m = count($ch)) > 0) {

				$chContent = '';
				for ($i = 0; $i < $m; $i++)
					$chContent .= $this->_Render($ch[ $i ], $level + 1);

					// può succedere che abbia dei figli che per qualche motivo
					// non vengono visualizzati, quindi inserisco i BeforeChildren/AfterChildren
					// solo se ho un effettivo contenuto

				if ($chContent !== '')
					$out .= $this->mybeforeChildren($level) . $chContent . $this->myafterChildren($level);
			}
		}

		if ($level === 0)
			$out .= $this->AfterTree();
		else
			if ($shouldRenderNode)
				$out .= $this->myAfterNode($level);

		return $out;
	}
	
	function RenderNode($n, $level = 0) {

		if ($level > 2)
			return '';

		$hasChildren = (count($n->Children()) > 0);

		$classes = array();
		if ($n->mCurrent)
			$classes[] = 'active';

		if ($hasChildren)
			$classes[] = 'dropdown';

		$out = '<li ' . (count($classes) > 0 ? ' class="' . join(' ',$classes). '" ' : '') . '>' . CR;


		$id = $n->GetValue('mPageDesc', $default = '[No page desc]');
		$meta = $this->mFields[$id];

		if (! FlexMD::HasLanguage($meta, $GLOBALS['gLanguage'])) {
			$url = str_replace('L/IT', 'L/' . $GLOBALS['gLanguage'], $meta['URLview']);
		} else
			$url = $meta['URLview'];

		$pageTitle = ParsePageIndexTitle($meta['PageIndexTitle'], $this->mParserContext);

		if ($hasChildren > 0) {
			$out .= '<a href="' . $url . '">' . $pageTitle . '</a>'; // ' <b class="caret"></b></a>';
		} else {

			$out .= '<a href="' . $url . '">' . $pageTitle . '</a>';
			
		}
		return $out;
	}

		// prima e dopo i figli

	function mybeforeChildren($level) { 
		
		if ($level == 0)
			return '<ul class="nav navbar-nav">' . CR; 
		elseif ($level == 1)
			return '<ul class="dropdown-menu">' . CR;
		else
			return '';
	}
	function myAfterChildren($level) { 
		
		if ($level > 1)
			return '';
		
		return '</ul>' . CR;
	}

		// prima e dopo il contenuto di un nodo


	function myAfterNode($level) {
		if ($level > 1)
			return '';
			
		 return '</li>' . /*'<li class="divider-vertical"></li>' . */ CR;
	}
}

?>