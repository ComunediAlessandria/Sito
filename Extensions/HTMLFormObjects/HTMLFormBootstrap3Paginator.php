<?php

class HTMLFormBootstrap3Paginator extends xWizardElPaginator {

	protected $np, $cp;

	function HTML() {

		$this->xl = $this->par('xLister');
		//$this->xl->setBaseURL(apiPage::getURIFull());

		$np = (int)$this->par('numpages');

		if ($np <= 1)
			return null;

		$cp = (int)$this->value();

		$c = array();

		if ($cp === 0)
			$c[] = '<li class="cmd disabled"><a href="' . $this->linkToPage(0) . '#table">&lt;&lt;</a></li>';
		else
			$c[] = "<li class='cmd'><a class='' href='" . $this->linkToPage(0) . "#table'>" . '&lt;&lt;' . '</a></li>';

	
		if (is_null($ws = $this->par('windowsize')) || $ws > $np) {

			$c[] = $this->pageList(0, $np);

		} else {

			$first = (int)($cp - floor(($ws - 1) / 2));
			if ($first < 0)
				$first = 0;

			$last = (int)($first + $ws);
			if ($last > $np) {

				$last = $np;
				$first = $last - $ws;
			}

			$c[] = $this->pageList($first, $last);
		}

		if ($cp === $np - 1)
			$c[] = "<li class='cmd disabled'><a href='" . $this->linkToPage($np - 1) . "#table'>" . '&gt;&gt;' . '</a></li>';
		else
			$c[] = "<li class='cmd'><a class='' href='" . $this->linkToPage($np - 1) . "#table'>" . '&gt;&gt;' . '</a></li>';

		return
			"<nav aria-label='Page navigation'><ul class='pagination "
				. $this->par('class', '')
			. "'>" . join('', $c) . '</ul></nav>'
		;
	}

	function pageList($first, $last) {

		$c = array();

		$cp = (int)$this->value();

		for ($pg = $first; $pg < $last; ++$pg) {

			if ($pg === $first)
				$c[] = "<li class='cmd " . ($cp === 0 ? 'disabled' : '') . "'>"
						. "<a class='' href='" . ($cp === 0 ? '#' : $this->linkToPage($cp - 1)) . "#table'>" . '&lt;' . '</a>'
					. '</li>';

			$c[] = "<li class='item " . ($pg === $cp ? 'active' : '') . "'>"
					. "<a class='' href='" . $this->linkToPage($pg) . "#table'>" . ($pg + 1) . '</a>'
				. '</li>';

			if ($pg === $last - 1)
				$c[] = "<li class='cmd " . ($cp === $last - 1 ? 'disabled' : '') . "'>"
						. "<a class='' href='" . ($cp === $last - 1 ? '#' : $this->linkToPage($cp + 1)) . "#table'>" . '&gt;' . '</a>'
					. '</li>';
		}

		

		return join(CR, $c);
	}
}