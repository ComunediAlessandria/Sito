
	//
	// Funzioni per la gestione del D&D - Cris
	//

		// crea un array con tutti gli elementi che possono essere
		// dei DROP target

/*
	for (var i = 0; (el = document.getElementsByTagName('div')[i]); i++) {

		if (el.id.indexOf("TGT") != -1) {

			ar[ ar.length ] = el;
		}
	}
*/

	var ar = [];
	$('div.dropTarget').each(function() { ar[ ar.length ] = this; });

		// e associa agli elementi che possono essere trascinati un gestore
		// (immagini e input/img)
/*
	for (var i = 0; (el = document.getElementsByTagName('img')[i]); i++) {

		if (el.id.indexOf("DRAG") != -1) {

			el.onclick = function (e) { return false; };
			el.onmousedown = function (e) { return DoDragStart(this, e); };
		}
	}
*/
/*
	// TBD: assegnare una classe
	$('img').each(function() {

		if (this.id.indexOf('DRAG') != -1)
			$(this)
				.click(function() { return false; })
				.mousedown(function(e) { return DoDragStart(this, e); })
			;
	});

	for (var i = 0; (el = document.getElementsByTagName('input')[i]); i++) {

		if (el.id.indexOf("DRAG") != -1) {

				// non disabilita l'onclick, altrimenti non è possibile attivare
				// il link via tastiera

//			el.onclick = function (e) { return false; }
			el.onmousedown = function (e)	{ return DoDragStart(this, e); };
		}
	}
*/

	$('.draggable')
		.click(function() { return false; })
		.mousedown(function(e) { return DoDragStart(this, e); })
	;
/*
	var hoverIMG = document.getElementById('HoverIMG');
	hoverIMG.onclick = function (e) { return false; };
	hoverIMG.onmousedown = null;
*/
		// nel caso di IE9/IE10 usa codice standard

	var
		isIE = document.all && parseInt($.browser.version, 10) < 9 ? true : false,
		mRibbonStart = { x: -1, y: -1 },
		mStartElement = null
	;

	function DoDragStart(el, e) {

/*
		if (isIE) {

			x = window.event.x;
			y = window.event.y + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

		} else {

			x = window.pageXOffset + e.clientX;
			y = window.pageYOffset + e.clientY;
		}
*/
			// tiene traccia della posizione dell'elemento di partenza
			// per rimettere a posto nel caso in cui venga fatto il drop
			// su un'area non permessa

		var o = $(el).offset();

		mRibbonStart.x = o.left; //x;
		mRibbonStart.y = o.top; //y;

		mStartElement = el;

		document.onmousemove = function(e) { return DoDrag(e); };
		document.onmouseup = function(e) { return DoDragEnd(e); };

			// imposta il cursore di movimento

		document.body.style.cursor = 'move';

//		if (isIE)  event.returnValue = false;
		return false;
	}

	var
		gRedEl = null,
		gInDrag = false
	;

	function DoDragEnd(e) {

		if (gRedEl !== null) {

				// drop in target!

			document.getElementById('srcIndex').value = mStartElement.id;
			document.getElementById('tgtIndex').value = gRedEl.id;

			$('#formBLOB').submit();

		} else if (! gInDrag) {

				// click su un elemento

			document.getElementById('srcIndex').value = mStartElement.id;
			document.getElementById('tgtIndex').value = '';

			$('#formBLOB').submit();

		} else {

				// rimette l'elemento a posto

			mMoveTimer = setInterval(MoveIt, 100 / 15);

			mStartElement = null;
			gInDrag = false;
		}

		document.onmousemove = null;
		document.onmouseup = null;

			// ripristina il cursore

		document.body.style.cursor = 'default';
	}

	function DoDrag(e) {

		var x, y;
		if (isIE) {

			x = window.event.x;
			y = window.event.y; // + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

		} else {

			x = window.pageXOffset + e.clientX;
			y = window.pageYOffset + e.clientY;
		}

			// inizio il drag unicamente se mi sono mosso

		/*jslint laxbreak: true */
		if (
			! gInDrag
			&& (Math.abs(x - mRibbonStart.x) < 4)
			&& (Math.abs(y - mRibbonStart.y) < 4)
		)
			return;

		gInDrag = true;

            // posiziona l'hover

        var hoverEl = document.getElementById('Hover');

		hoverEl.style.top = (y - 5) + (isIE ? '' : 'px');
		hoverEl.style.left = (x - 5) + (isIE ? '' : 'px');

		hoverEl.style.position = 'absolute';
		hoverEl.style.display = '';

			// verifica se c'è collisione con qualche elemento DROP

		if (gRedEl !== null) {

			gRedEl.style.backgroundColor = 'white';
			gRedEl = null;
		}

		var dragPosition = getDim(hoverEl);

		var i;
		for (i = 0; i < ar.length; i++) {

			if (checkInTarget(dragPosition.x, dragPosition.y,
					hoverEl.offsetWidth, hoverEl.offsetHeight,
					ar[ i ])) {

				ar[ i ].style.backgroundColor = 'red';
				gRedEl = ar[ i ];

				break;
			}
		}

		if (isIE) event.returnValue = false;
		return false;
	}

		// per rimettere a posto l'oggetto

    var
		mMoveTimer = null,
		mMovePosition = null
	;

    function MoveIt() {

		var hoverEl = document.getElementById('Hover');

		if (mMovePosition === null) {

//			var pos = getDim(hoverEl);
			var o = $('#Hover').offset();

			mMovePosition = {
				x: o.left, //pos.x,
				y: o.top, //pos.y,
				step: 15
			};
		}

		mMovePosition.step--;

		var
			x = mRibbonStart.x + (mMovePosition.x -  mRibbonStart.x) / 15 * mMovePosition.step,
			y = mRibbonStart.y + (mMovePosition.y -  mRibbonStart.y) / 15 * mMovePosition.step
		;

		hoverEl.style.top = (y - 5) + (isIE ? '' : 'px');
		hoverEl.style.left = (x - 5) + (isIE ? '' : 'px');

        if (mMovePosition.step == -1) {

			clearInterval(mMoveTimer);

				// nasconde l'elemento al termine del riposizionamento

			hoverEl.style.display = 'none';

			mMovePosition = null;
        }
    }



























		//
		// funzioni di gestione D&D
		//

        // posizione dell'oggetto su cui viene fatto click

//    var mClickObjPosition = { x: 0, y: 0 };

		// punto in cui è stato fatto click

//	var mClickPoint = { x: 0, y :0 };

		// stato del drag

//	var inDrag = false;
//    var movingBack = false;

//    var currentX = 0, currentY = 0;
//    var whichEl = null;

//	var redEl = null;

/*
        // ID dell'oggetto di cui viene fatto
        // il trascinamento

    var mDraggedItemID = '';

    function grabEl() {
return;
        currentX = (event.clientX + document.body.scrollLeft);
        currentY = (event.clientY + document.body.scrollTop);

        mClickPoint.x = currentX;
        mClickPoint.y = currentY;

//		if (document.dbg)
//			dbg.value = "Click point: " + mClickPoint.x + ", " + mClickPoint.y;

        whichEl = event.srcElement;

        while (whichEl.id.indexOf('DRAG') == -1) {
            whichEl = whichEl.parentElement;
            if (whichEl == null)
                return;
        }

//        if (whichEl != activeEl) {
//
//			if (activeEl != null) {
//				whichEl.style.zIndex = activeEl.style.zIndex + 1;
//				whichEl.style.cursor = 'move';
//			}
//			activeEl = whichEl;
//        }

        mDraggedItemID = whichEl.id;

		mClickObjPosition = getDim(whichEl);

        var hoverEl = document.all['Hover'];

            // posiziona l'hover sull'oggetto di partenza

        hoverEl.style.pixelLeft = mClickObjPosition.x + 1;
        hoverEl.style.pixelTop = mClickObjPosition.y  + 1;
        hoverEl.style.position = 'absolute';

            // copia l'immagine dall'elemento che stiamo trascinando
            // sull'immagine contenuta nell'hover

        document.all['HoverIMG'].src = whichEl.src;

            // e lo rende visibile

        hoverEl.style.display = '';

            // ed usa l'hover per il trascinamento invece dell'oggetto
            // originale

        whichEl = hoverEl;

//        whichEl.style.pixelLeft = pos.x + 1;
//        whichEl.style.pixelTop = pos.y - document.all.myChaser.offsetTop + 1;
//
//                //        whichEl.style.pixelLeft = whichEl.offsetLeft;
//                //        whichEl.style.pixelTop = whichEl.offsetTop;
//
//			// rende l'elemento in posizione assoluta
//			// (deve essere fatto *dopo* il settaggio della posizione)
//
//        whichEl.style.position = 'absolute';

        return false;
    }

    function moveEl() {

//		checkwhere();

		if (whichEl === null || movingBack)
			return;

		var
			newX = (event.clientX + document.body.scrollLeft),
			newY = (event.clientY + document.body.scrollTop)
		;

			// muovo solo se mi sono spostato di almeno x pixel
			// o in orizzontale o in verticale

		if (
			! inDrag
			&& (Math.abs(newX - mClickPoint.x) < 4)
			&& (Math.abs(newY - mClickPoint.y) < 4)
		)
			return;

		inDrag = true;

		var
			distanceX = newX - currentX,
			distanceY = newY - currentY,
			currentX = newX,
			currentY = newY
		;

		whichEl.style.pixelLeft += distanceX;
		whichEl.style.pixelTop += distanceY;

		if (redEl !== null)
			redEl.style.backgroundColor = 'white';

			// cerca il drop point sotto l'oggetto e lo evidenzia

		var dragPosition = getDim(whichEl);

		for (var i = 0; i < ar.length; i++) {

			if (checkInTarget(dragPosition.x, dragPosition.y,
					whichEl.offsetWidth, whichEl.offsetHeight,
					ar[ i ])) {

				redEl = ar[ i ];
				redEl.style.backgroundColor = 'red';

				break;
			}
		}

        event.returnValue = false;
    }

    function checkEl() {

        if (whichEl !== null)
			return false;
    }
*/
	function getDim(el) {

		var rd = { x: 0, y: 0 };

		if (! el) {

			if (document.dbg)
				dbg.value = 'No element set';

			return rd;
		}

		do {

			rd.x += el.offsetLeft;
			rd.y += el.offsetTop;

			el = el.offsetParent;

		} while (el);

		return rd;
	}

/*
	function dropEl() {

		if (whichEl === null)
			return;

//		dropLeft = event.clientX + document.body.scrollLeft;
//		dropTop = event.clientY + document.body.scrollTop;

		if (redEl !== null)
			redEl.style.backgroundColor = 'white';

			// cerca su quale elemento sono

		var dragPosition = getDim(whichEl);

		for (var i = 0; i < ar.length; i++) {

			if (checkInTarget(dragPosition.x, dragPosition.y,
					whichEl.offsetWidth, whichEl.offsetHeight,
					ar[ i ])) {

				ar[ i ].style.backgroundColor = 'green';
				break;
			}
		}

		if (i < ar.length) {
alert("???");
/ *
				// drop in target!

			document.formBLOB.tgtIndex.value = ar[ i ].id;
			document.formBLOB.srcIndex.value = mDraggedItemID;

				// prima di fare il submit chiama la funzione
				// per la copia del contenuto delle DIV editabili

			/ * if (isIE) * / TerminateEditing();

			document.formBLOB.submit();
* /
		} else if (! inDrag) {
alert("???");

/ *
//			document.formBLOB.tgtIndex.value = ar[ i ].id;
			document.formBLOB.srcIndex.value = mDraggedItemID;

				// prima di fare il submit chiama la funzione
				// per la copia del contenuto delle DIV editabili

			/ * if (isIE) * / TerminateEditing();

			document.formBLOB.submit();
* /
		} else {

				// rimette l'elemento a posto

//			mXPosition = whichEl.style.pixelLeft;
//			mYPosition = whichEl.style.pixelTop;

			movingBack = true;

//			mStep = 15;
			mMoveTimer = setInterval(MoveIt, 1000 / 15);
		}

		inDrag = false;

		return false;
    }
*/
//	var
//		mMoveTimer = null,
//		mXPosition = -1,
//		mYPosition = -1 //,
//		mStep = -1
//	;
/*
    function _MoveIt() {

        mStep--;

        whichEl.style.pixelLeft = mClickObjPosition.x + (mXPosition -  mClickObjPosition.x) / 15 * mStep;
        whichEl.style.pixelTop = mClickObjPosition.y + (mYPosition -  mClickObjPosition.y) / 15 * mStep;

        if (mStep == -1) {

            clearInterval(mMoveTimer);

                // nasconde l'elemento al termine del riposizionamento

            whichEl.style.display = 'none';

			whichEl = null;
            movingBack = false;
        }
    }
*/
	function checkInTarget(x, y, w, h, tgt) {

		if (! tgt)
			return false;

		var
			tgtTL = getDim(tgt),

			tgtLeft = tgtTL.x,
			tgtTop = tgtTL.y,

			tgtWidth = tgt.offsetWidth,
			tgtHeight =  tgt.offsetHeight
		;

		/*jslint laxbreak: true */
		return (
			(isInside(x, tgtLeft, tgtWidth) || isInside(x + w, tgtLeft, tgtWidth) || isInside(tgtLeft, x, w) || isInside(tgtLeft + tgtWidth, x, w))
			&&
			(isInside(y, tgtTop, tgtHeight) || isInside(y + h, tgtTop, tgtHeight) || isInside(tgtTop, y, h) || isInside(tgtTop + tgtHeight, y, h))
		);
	}

	function isInside(pt, left, width) { return pt >= left && pt <= (left + width); }
/*
    function cursEl() {

        if (event.srcElement.id.indexOf("DRAG") != -1) {
//            event.srcElement.style.cursor = 'hand'; //"move"
        }
    }

    function DragHandle() {

        return false;
    }
*/

/*
    document.onmousedown = grabEl;
    document.onmousemove = moveEl;
    document.onmouseup = dropEl;
//    document.onmouseover = cursEl;
    document.onselectstart = checkEl;

    document.ondragstart = DragHandle;
*/
