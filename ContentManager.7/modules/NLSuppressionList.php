Zend 2004072203 65540 2358 8311 x�
�2�Z�o���P����Ss5r)X9��)�"	Y��K�=��K;�쇲���!E��s�-9�0 :�X�^���?о�����İl-ߛ�{o����b��L�ɭη��ɭ�z���ʬ�e.K-���/O�N�ӵ-喏��v�I4����ҫ��b�����m�*���� ����l�����3����jy:�lo�t�o��^�_��ki-���-�[C8��^��G��_ڀ�����=�1�>÷�l&� �_�6�����a��Y��וQ���,�-�֙9� ��4~L]�-[�_h-���ז��	�1P�5�O�@j�t]�[����x�t�8�޺���MW��
Z�?�h�h��v���?�˥!}�H���'S�vq"��H}a1N̦���۴mZ������G�6S�+�h�yH+M`3�K�ϙ��o#&����C@4����ov���#)k�u&k*�/��؁�������d{޵7,x�{��&;�K�"��	�B�+��\�;�R�6�����(�뼐u]-.MӤtr�҇�h��"�w�Π <U�fIR��="�����2��ϼ+���_\7����)���k��ZS�vڝT��.�lx�<��̃e"��s�[�~�����_��2Ǵ����ń_��������L�4]�Io�xPH��X~�uc�r��+����?5.��GJs�����3����¡�H("�t�G��o�H�70��]����џ���l2;���)~�b�z��l����_�v^������0�@��[8n"ʟ��;"D�R�c��5���/P�']K�+J�BK�|,*�
�,)9�XL�:��^-T�w����Z�D���+(���F\AA�����z���LX_���e��+uH�~�PX)��J�:HU�,�������
�ա4}��;|_ա�l5a�� A�b&|t���_S��f���"�����,����h��^�xpz��6� �tMi�s9��aз��Xp���CX��1�$3µ�Ge�L�k�������`�!�sSfu����*��<�ʔC\������; V��f�x�^P'��@�~��� �]��k� ���?%	:�/����j=݌<7�"SY��EAh���[� ��H�/�cD:4���p
s�T���m��P����� )Ll��r"�a�`����NY���ܻߠ�?�e��;����f��ڋ��g�d!�]�{z������\�l�w�inX���u�kL2�?n��Y�?%�g9=��pBN���'�n��G	A�&c�P�&��G.�F:��qy�1��wm�!��&R�r�FE�2<X�Sf�~���(/�:�s�I�@�E�Sc��ԙ�6�\��7�Ɋ��\c醔��v�"������J|X�6(~�P�Y���u��a�����|�7���O�|�0&�)�#�&�i_������IP�^\�4�pRh��A��~�j�r�i�u��݀��8��>$9`m���2�텷#����x^[��\u��i�����ů-roEnO �Y��.�%f��,�kt�N�5�t������Z�!cN�Ib+�ЀD���2� ���+v�rX�#PE�����Ζ�N�%��@j����m�v�}{������'�ٲ�IH�jc*�@W��_�蚽B���Y���4�Sۂ�,Z��ɼř���|�u(�C����$U8Xl�`ݎj?~P�6�R^2H�8E��� ��]�0⠀��UH�y��R)5���o普KS�Yf���g��z�8_���zR��(�/��o��|Y�'�����x��W�t-����G3��I�5LO��v/bvo�S�z=�R��#�=���jm�]�]���@};�6�R4�@y?�I�t´�)t4�1�u�X�)t�MT�е8�47�^�@����L��x94�<���]	J��-���u�@
�?�3�b�`�� �W͖��g�昬�:\Zx<P�v�1DOWl��k!�������1@�9�]�����Čo]�|?l�L�u�`
Z�G�Ŋ���x�Z���%vn��A��;j��T�Bܢ�wR�����z��ٶ���A���<��vh�G�V�p'�ViL��ܕB7�j>��{.�9_#��Nl��/rpRgd3"d�_�����X�Μ�,��;�K�v$A%�my� �T�w�,����)%'�K��*���;��o�nn��J�����U��*X�.D*�+Z���2T'.�a�*z�y}�u�ͤ\�]�����M��r@�|�d9u�0� �uhW����&l�,0)��D���9��������0+__HALT_COMPILER();


modNLSuppression

class FlexIndex {

		// restituisce un array con gli ID di tutti gli indici presenti

	static function enumerateIndexes() {

		return self::getIndexesFields('collectionID');
	}

		// restituisce un array id -> nome indice

	static function getIndexesName() {

		$v = array();
		foreach (self::getIndexesFields(array('IndexName', 'collectionID')) as $i)
			$v[ $i['collectionID'] ] = $i['IndexName'];

		return $v;
	}

	static function getIndexName($id) {

		return getFieldFromTable('IndexName', 'tIndexCache', 'collectionID=' . $id);
	}

	static function getIndexFields($id, $f) {

		$f = (array)$f;

		return getFieldListFromTable($f, 'tIndexCache', 'collectionID=' . $id, /*$oby = */$f[0]);
	}

	static function getIndexesFields($f) {

		$f = (array)$f;

		return getFieldListFromTable($f, 'tIndexCache', /*$where = '1=1'*/ null, /*$oby = */$f[0]);
	}

	static function loadIndex($id) {

		$objData = getFieldFromTable('indexData', 'tIndexCache', 'collectionID = ' . $id);
		if ($objData != '') {

			inc::cls('clsTreeIndex');

				// controlla se � un vecchio indice, e nel caso lo converte

			if (substr($objData, 0, 15) === 'O%3A4%3A%22menu') {

				inc::mod('modFlexIndexConvert.v1');

				IndexConvertV1::convertAllIndexes();

				$objData = getFieldFromTable('indexData', 'tIndexCache', 'collectionID = ' . $id);
				$t = unserialize($objData);
				$t->adjustParents();

				return $t;

			} else {

				$t = unserialize($objData);
				$t->adjustParents();

				return $t;
			}
		}

		return false;
	}

	static function saveIndex($id, $idx) {

		$idx->cleanup();

			// guarda se deve alterare o inserire

		$isNew = false;
		if ((int)countRecords('tIndexCache', 'collectionID=' . $id) === 0) {

			$v = array(
				'collectionID'	=> $id,
				'IndexName'		=> q(''),
				'ShowInMap'		=> 1,
				'MapMaxDeep'	=> -1,
				'lang'			=> q('IT'),				// non pi� usato
				'indexData'		=> q(serialize($idx)),
			);

			insertIntoArray('tIndexCache', $v);

			$isNew = true;

		} else {

			self::doVersionForIndex($id);

			$v = array(
				'indexData'		=> q(serialize($idx)),
			);

			updateArray('tIndexCache', $v, 'collectionID=' . $id);
		}

			// la cancellazione della cache viene fatta dal gestore dell'evento
			// invocando FlexIndex::InvalidateRenderedIndexInCache($id);

			/**
			*	@type: event
			*	@when: al salvataggio di un indice su DB
			*	@par(ID): id dell'indice salvato
			*	@par(Kind): 'NEW': nel caso di indice nuovo | 'MOD': nel caso di indice modificato
			*/

		raiseEvent('Index.onSave', array('ID' => $id, 'Kind' => ($isNew ? 'NEW' : 'MOD')));

		LogEvents::log('index.save', array(
			'id'	=> $id,
		));

		self::buildIndexesReverseCache();
	}

	static function duplicateIndex($id) {

		// TBD: pericoloso ma ragionevole
		$nid = (int)getFieldFromTable('MAX(collectionID)', 'tIndexCache', '1=1') + 1;

		executeSQL('
			INSERT INTO tIndexCache (
				collectionID,
				IndexName,
				ShowInMap,
				MapMaxDeep,
				indexData,
				IDOwner,
				TS
			)

				SELECT
					' . $nid . ',
					IndexName,
					ShowInMap,
					MapMaxDeep,
					indexData,
					IDOwner,
					NOW()

				FROM tIndexCache
				WHERE collectionID = ' . $id . '
			'
		);

			/**
			*	@type: event
			*	@when: al salvataggio di un indice su DB
			*	@par(ID): id dell'indice salvato
			*	@par(Kind): 'NEW': nel caso di indice nuovo | 'MOD': nel caso di indice modificato
			*/

		raiseEvent('Index.onSave', array('ID' => $nid, 'Kind' => 'NEW'));

		LogEvents::log('index.save', array(
			'id'	=> $nid,
		));

		self::buildIndexesReverseCache();
	}

	static function deleteIndex($id) {

		self::doVersionForIndex($id);

		executeSQL('DELETE FROM tIndexCache WHERE collectionID = ' . $id);

		self::buildIndexesReverseCache();
	}

	static function buildIndexesReverseCache() {

		inc::mod('modFlexIndexReverseCache');

		FlexIndexReverseCache::build();
	}

		// restituisce gli ID degli indici in cui compare una pagina

	static function indexesForPage($pageDesc) {

			// TBD: in attesa di una cache inversa, restituisce
			// tutti gli indici

		return self::enumerateIndexes();
	}

	static function doVersionForIndex($id) {

		executeSQL('

			INSERT INTO vIndexes (
				collectionID,
				IndexName,
				ShowInMap,
				MapMaxDeep,
				indexData,
				IDOwner,
				vTS,
				vUser
			)

				SELECT
					collectionID,
					IndexName,
					ShowInMap,
					MapMaxDeep,
					indexData,
					IDOwner,
					' . DBTimeToSQL(kTime) . ',
					' . q(user::identification()) . '
				FROM tIndexCache
				WHERE CollectionID = ' . $id . '
		');
	}

		// ripristino dell'indice dal versioning
		//
		// $id � l'id della riga del versioning

	static function rollbackIndex($id) {

		$cid = self::getIndexIDFromRollback($id);

		executeSQL('DELETE FROM tIndexCache WHERE CollectionID = ' . $cid);

		executeSQL('

			INSERT INTO tIndexCache (
				collectionID,
				IndexName,
				ShowInMap,
				MapMaxDeep,
				indexData,
				IDOwner,
				lang
			)

				SELECT
					collectionID,
					IndexName,
					ShowInMap,
					MapMaxDeep,
					indexData,
					IDOwner,
					\'IT\'
				FROM vIndexes
				WHERE id = ' . $id . '
		');

		self::invalidateRenderedIndexInCache($cid);

		self::buildIndexesReverseCache();
	}

	static function rollbackExists($id) {

		return (int)countRecords('vIndexes', 'id = ' . $id) === 1;
	}

	static function getIndexIDFromRollback($id) {

		return getFieldFromTable('CollectionID', 'vIndexes', 'id = ' . $id);
	}

		// cacheing delle renderizzazioni degli indici
/*
	static function LoadRenderedIndexFromCache($id) {

	}

	static function SaveRenderedIndexInCache($id, $idx) {

	}
*/

	// nota: in apparenza la funzione viene invocata con l'ID
	// dell'indice da invalidare

/*
	static function invalidateRenderedIndexInCache($pageID) {

			// $id � l'id della pagina da cui devo determinare
			// l'indice

		foreach (
			self::indexesForPage('BLOB:ID=' . $pageID)
		as $i)
			clsFlexCache::invalidateTag(array('RenderedIndex', $i), / *$storage = * /null);
	}
*/

	static function invalidateRenderedIndexInCache($id) {

		clsFlexCache::invalidateTag(array('RenderedIndex', $id), /*$storage = */null);
	}

		// restituisce una cache che ha come primo parametri l'ID dell'indice
		// cos� da rendere possibile l'invalidazione di tutte le cache relative
		// ad un indice

	static function renderedIndexCache($indexID /* , ... */) {

			// l'elenco dei parametri � interpretato in modo che il primo venga aggiunto
			// all'identificatore di cache

		inc::cls('clsFlexCache');

		$sv = md5(serialize(func_get_args()));

		return new clsFlexCache(
			array('RenderedIndex', $indexID),
			$sv, // non pu� usare func_get_args() qui
			new clsFlexCacheStorageFile()
		);
	}
}

//
// Funzioni per la gestione della HP del sito
//

function getHomePageURL($lang = null) {

	inc::mod('modHomePage');

	return FlexHomePage::url($lang);
}

function findIndexOfPage($pd) {

	inc::mod('modFlexIndexReverseCache');

	return FlexIndexReverseCache::getMainIndexForPage($pd);
}

/*
	// TBD: implementarla con una cache BLOB -> id indice

function findIndexOfPage($openLeaf) {

inc::i('uTimer');
uTimer()->findIndexOfPage;

	$iid = -1;
	foreach (FlexIndex::enumerateIndexes() as $id) {

		$m = FlexIndex::loadIndex($id);
		$node = $m->find($openLeaf, 'mPageDesc');
		if (! is_null($node)) {

			$iid = $id;
			break;
		}
	}

uTimer()->findIndexOfPage;

uTimer()->lookupReverse;

inc::mod('modFlexIndexReverseCache');
	$cii = FlexIndexReverseCache::getMainIndexForPage($openLeaf);

d('Index ID scan', $iid, 'Index ID reverse', $cii );

uTimer()->lookupReverse;

	if ($cii != $iid) die('fail: ' . $cii . ' - ' . $iid);

d(	uTimer()->dump());

	return $iid;
}
*/