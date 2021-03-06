Zend 2004072203 65540 611 1580 x�
�2�X=o1��C
d ?�Ă��w�}����DE����)g�|T�KQ�ube�/����5Ll`����K�Jb?~��~<>]-�����\Y�*fU��#���H�)����,�;�-�:�)��a+'������U!�XB�C�'LP*��"��s�2>}?H�X�I����u榃w�����2=u���f�$��n�Q��v�Mw��V��v�8A�:=l���gh5�ʹ4R"��j�}K�"��P�;K���mp�lW,{����܀��ۓ��~��o�=���>�-a�$��CW|�vt�_Z@e7EN�����"���=������	l �D䬥i�a-�㛚]����G�'&d��%w���[	�*�q!�f�D�^E�"(�M}٨!�Xdq-�����}ݪ6@��-��nv�"�����ʷ� ��U �j�M��Ձ:�0����rY4�+o1NpD����j�Luk�9=rD���ly-��\�l!���U��h=z������c���w��YN���rq�88z}�
��d_��J��v�F3���1k p�]O��j��w��4a1�NՉ�P�R���[��<� �j_0GQR�%��x__HALT_COMPILER();


/*
	//
	// se specificato il parametro DBG non emette il content type
	// TBD: cacheing del contenuto
	// TBD: vedere http://forums.b2evolution.net/viewtopic.php?t=4770

	include_once('../inc/const.inc.php');

	FlexInclude(
		kIncPath . 'func.core.inc.php',
		kClsPath . 'clsNewTemplate.php',
		kIncPath . 'HTMLEncDec.inc.php',
		kModPath . 'modFlexMDUtils.php',
		kModPath . 'modCanali.php'
	);

	$idCanale = URLPar('ID', -1);
	$nomeCanale = URLPar('Name', '');

	$dbg = HasPar('DBG');

	if ($idCanale === -1 && $nomeCanale === '')
		HTTPStatus(400);

	if ($dbg)
		echo 'Asked for channel ID [' . $idCanale . '] or name [' . $nomeCanale . ']<br />';
	else // PA::
		//PA::DisableDump();	// altrimenti l'output inquina il feed

	$info = ChannelRSS($idCanale, $nomeCanale);
	if ($info === FALSE)
		HTTPStatus(410);

	list($filter, $title, $description) = $info;

/*
		// informazioni di canale

	$where = ($idCanale !== -1 ? ('IDCanale = ' . q($idCanale)) : ('DescrizioneIT = ' . q($nomeCanale)));

	// TBD: usare la cache di canale?
	// TBD: non sono pi� informazioni legate al canale
	list($idCanale, $title, $description) = GetFieldFromTable('IDCanale, TitoloRSS, Note', 'DCanali', $where);

		// pu� essere che il canale non esista (qualcuno ha fatto cacheing dell'ID)

	if ($idCanale == '')
		HTTPStatus(410);


	if ($dbg)
		echo '... that is channel ID [' . $idCanale . ']<br />';

		// recupera un elenco delle pagine

	$entValues = FlexMD::GetAttrFromSearch(array(
			new MDFilterBLOBPages(),
			new MDFilterNotExpired(),
			new MDFilterPublished(),
			'IDCommunity'	=> -1,
			$filter
//			new MDFilterCanale($idCanale)
		), $GLOBALS['gLanguage'], array(
			'TitoloStrillo'	=> '',
			'TestoStrillo' => '',
			'TestoLink'	=> '',
			'ValidFrom'	=> -1,
			'URLview'	=> '#',
		), array('EventDate' => kMDSortDESC)
	);

	// intestazione per immagine

//   <image>
//      <title>Logo di Diodati.org</title>
//      <url>http://www.diodati.org/img/logo0.jpg</url>
//      <link>http://www.diodati.org</link>
//   </image>


// <!DOCTYPE rss PUBLIC '-//Netscape Communications//DTD RSS 0.91//EN' 'http://my.netscape.com/publish/formats/rss-0.91.dtd'>
//<!DOCTYPE rss PUBLIC '-//Netscape Communications//DTD RSS 0.91//EN' '" . kTemplatesDTD . "rss-0.91.dtd'>

			$rss20 =
"<?xml version='1.0' encoding='iso-8859-1'?>
<rss version='2.0'>
<channel>
	<title>{Title}</title>
	<link>{Link}</link>
	<description>{Description}</description>
	<language>{Language}</language>
<!-- BEGIN row -->
	<item>
		<title>{ArticleTitle}</title>
		<link>{ArticleLink}</link>
		<description>{ArticleDescription}</description>
		<pubDate>{ArticlePubDate}</pubDate>
	</item>
<!-- END row -->
</channel>
</rss>
";

		$tpl = new clsTemplateEngineAdvancedCompiled(new clsTemplateSourceText($rss20));
		$tpl->SetBlock('row');

//			'Date' => 'Data Ultima Modifica',
//			'StartDate' => 'Data Inizio Validit�',
//			'ExpiryDate' => 'Data Termine Validit�',

//		$pageMetaList->Sort('EventDate');						// Data inizio, data fine, data modifica, alfabetico

		$lastValid = 0;
		for ($i = 0, $m = count($entValues); $i < $m; $i++) {

			$meta = $entValues[$i];

			$titolo = HTMLEncDec::Decode(strip_tags($meta['TitoloStrillo']));
			$strillo = HTMLEncDec::Decode(strip_tags(str_replace('<br />', CR, $meta['TestoStrillo'])));
			$testolink = $meta['TestoLink'];

			if (trim($titolo) !== '' || trim($strillo) !== '' || trim($testolink) !== '') {

				$v = $meta['ValidFrom'];
				if ($v > $lastValid)
					$lastValid = $v;

					// nel testo, prima converte le entit� HTML nel corrispondente carattere ASCII
					// (codepage windows) e poi ritrasforma le '&' in '&amp;' (codifica XML)
					// TBD: anche nel titolo?

				$tpl->SetVar(array(
					'ArticleTitle'			=> $titolo,
					'ArticleLink'			=> $meta['URLview'],
					'ArticleDescription'	=> str_replace('&', '&amp;', nl2br($strillo)),
					'ArticlePubDate'		=> date('r', $v),
				));

				$tpl->InsertBlock('row');
			}
		}

		$tpl->SetVar(array(
			'Language'		=> strtolower($GLOBALS['gLanguage']),
			'Title'			=> $title,
			'Description'	=> $description,
			'Link'			=> kDataURL,
		));

		$cnt = $tpl->Get();

	if ($dbg) {

		echo '<hr />';

		print '<pre>'
			. htmlentities($cnt)
			. '</pre>';

	} else {

		header('Content-type: text/xml');
		print $cnt;
	}
*/

?>
