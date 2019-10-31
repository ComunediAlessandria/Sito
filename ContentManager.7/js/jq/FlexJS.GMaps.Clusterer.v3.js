
var fjs = window.FlexJS || {};
fjs.gMaps = window.fjs.gMaps || {};

	// https://developers.google.com/maps/articles/toomanymarkers
	//
	// Nota: per avere il corretto posizionamento è necessario includere
	// una definizione CSS analoga a questa nella pagina
	//
	// .mapIconLabel {
	// 		position: absolute;
	// 		color: #fff;
	// 		font-family: sans-serif;
	// 		font-size: 14px;
	// 		text-align: center;
	// 		z-index: 9999;
	// }

fjs.gMaps.Clusterer = function(mapHandler, opt) {

	fjs.gMaps.Clusterer.init();

	this.mapHdl = mapHandler;
	this.map = mapHandler.map;

	var me = this;

		// crea un overlay per la gestione del mapping coordinate-pixel

    var ovl = new google.maps.OverlayView();
    ovl.draw = function() {

		if (!this.ready) {

			this.ready = true;
			//google.maps.event.trigger(this, 'ready');

			me.ovlCanDraw = true;
		}
    };

    ovl.setMap(this.map);

    this.ovl = ovl;
    this.ovlCanDraw = false;

	this.opt = $.extend({}, {

		maxVisibleMarkers: 1,
		gridSize: 5,
		minMarkersPerCluster: 2,

			// raggio del cluster in pixel

		clusterRadius: 80,

			// livello massimo di zoom, se -1 usa la mappatura specificata
			// nel parametro maxZoomMap

		maxZoom: -1,
		maxZoomMap: {
			'Map': 19,
			'Sat': 16,
			'Hyb': 16,
			'Ter': 15
		}
	}, opt);

	this.markers = [];
	this.clusters = {};
	this.timeout = null;
	this.boundsDisplay = null;
	this.boundsDisplayOwner = null;

//	this.infoWindow = null;
//	this.icon = G_DEFAULT_ICON;

	this.currentZoomLevel = -1;

	this.latSpan = null;
	this.lngSpan = null;

	google.maps.event.addListener(this.map, 'bounds_changed', fjs.proxy(this.display, this));
//	GEvent.bind(this.map, 'moveend', this, this.display);
//	GEvent.bind(this.map, 'infowindowclose', this, this.popDown);
};



/*
fjs.gMaps.Clusterer.prototype.SetIcon = function(icon) {

	this.icon = icon;
};
*/

// fjs.gMaps.Clusterer.prototype.getIcon = function(n) {

//		var
//			icon = new GIcon()
//		;

//		icon.image = FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/m/m' + n + '.png';

//		icon.iconSize = new GSize(53, 52);
//		icon.iconAnchor = new GPoint(26, 26);

//		icon.infoWindowAnchor = new GPoint(26, 0);

//	/*
//		icon.iconSize = new GSize(26, 28);
//		icon.iconAnchor = new GPoint(13, 28);

//		icon.infoWindowAnchor = new GPoint(13, 0);
//	*/
//		return icon;
//	};

fjs.gMaps.Clusterer.prototype.addMarker = function(marker, title, link) {

//	if (marker.setMap !== null)
	marker.setMap(null);

	marker.title = title;
	marker.link = link;

	marker.onMap = false;
	marker.inCluster = false;
	marker.clusterId = null;

	marker.animation = false;

		// aggiunge il marker alla lista ma ritarda il ricalcolo in modo
		// da non appesantire il caricamento nel caso di impostazione
		// sequenziale di più punti

	this.markers.push(marker);
	this.displayLater();
};

fjs.gMaps.Clusterer.prototype.removeAllMarkers = function() {

//console.log('removeAllMarkers');

	var i;
	for (i in this.markers)
		if (this.markers[i].onMap) {

			this.markers[i].setMap(null);

			this.markers[i].onMap = false;
		}

	for (i in this.clusters) {

//console.log('asked map to remove marker');
		this.clusters[i].marker.setMap(null);

	}
};

fjs.gMaps.Clusterer.prototype.displayLater = function() {

	if (this.timeout !== null)
		clearTimeout(this.timeout);

	this.timeout = setTimeout(fjs.proxy(this.display, this), 300);
};

fjs.gMaps.Clusterer.prototype.display = function() {

	clearTimeout(this.timeout);

	if (! this.ovlCanDraw)
		return this.displayLater();

//console.log('Should display ' + this.markers.length + ' markers on ' + this.clusters.length + ' clusters');

		// ottiene i confini dell'attuale area
// console.log('display');
// fjs.gMaps.Clusterer.dumpMarkers(this.markers);

	var
		bounds = this.map.getBounds(),
		dLat = bounds.toSpan().lat(),
		dLng = bounds.toSpan().lng()
	;

		// espande leggermente i confini in modo da rendere
		// lo scroll di piccola entità più gradevole

	if (dLat < 180 * 0.85 && dLng < 360 * 0.85) {

		dLat *= 0.1;
		dLng *= 0.1;

		var
			sw = bounds.getSouthWest(),
			ne = bounds.getNorthEast()
		;

		bounds = new google.maps.LatLngBounds(
			new google.maps.LatLng( sw.lat() - dLat, sw.lng() - dLng ),
			new google.maps.LatLng( ne.lat() + dLat, ne.lng() + dLng )
		);
	}

		// nel caso di un nuovo livello di zoom deve ricalcolare tutti i cluster
		// poiché dipendono dalla distanza in pixel che è una funzione dello zoom

	var newZoomLevel = this.map.getZoom(), i, j, k, cluster;
	if (newZoomLevel != this.currentZoomLevel) {

//console.log('recalculating all the clusters');
//		this.map.clearOverlays();
		this.removeAllMarkers();

			// ricalcola tutti gli id dei cluster

		for (i in this.markers) {

			this.markers[i].clusterId = null;

//			this.markers[i].onMap = false;
			this.markers[i].inCluster = false;
		}

			// elimina tutti i cluster

		for (i in this.clusters) {

			cluster = this.clusters[i];

			for (j in cluster.markers)
				cluster.markers[j].inCluster = false;

			delete this.clusters[i];
		}

		this.clusters = []; //{};

		if (this.boundsDisplay !== null) {

			this.boundsDisplay = null;
			this.boundsDisplayOwner = null;
		}

//		this.map.closeInfoWindow();

		this.latSpan = bounds.toSpan().lat();
		this.lngSpan = bounds.toSpan().lng();

		this.currentZoomLevel = newZoomLevel;
	}

		// crea l'elenco dei marker potenzialmente visibili

	var
		visibleMarkers = [],
		nonvisibleMarkers = [],
		marker
	;

	for (i in this.markers) {

		marker = this.markers[i];

		if (bounds.contains(marker.getPosition()))
			visibleMarkers.push(marker);
		else
			nonvisibleMarkers.push(marker);
	}

		// elimina i marker non visibili

	for (i in nonvisibleMarkers) {

		marker = nonvisibleMarkers[i];
		if (marker.onMap) {

			marker.setMap(null);

			marker.onMap = false;

			if (marker.inCluster && marker.clusterId)
				this.clusters[marker.clusterId].recalculateCenter = true;
		}
	}

		// elimina i cluster che non sono visibili

	for (i in this.clusters) {

		cluster = this.clusters[i];

		if (! bounds.contains(cluster.marker.getPosition())) {

				// cancella il marker

			cluster.marker.setMap(null);

				// elimina i marker dal cluster

			for (j in cluster.markers) {

				cluster.markers[j].inCluster = false;
				cluster.markers[j].onMap = false;
			}

			delete this.clusters[i];
		}
	}

	if (visibleMarkers.length >= this.opt.maxVisibleMarkers) {
/*
		var
			latSpan = this.latSpan,
			lngSpan = this.lngSpan,

			latGridSize = latSpan / this.opt.gridSize,
			lngGridSize = lngSpan / this.opt.gridSize,

			nLatGrids = Math.floor(180 / latGridSize) + 1,
			nLngGrids = Math.floor(360 / lngGridSize) + 1
		;

		for (var i in visibleMarkers) {

			var marker = visibleMarkers[i];

			if (marker.inCluster)
				continue;

			marker.inCluster = true;

			if (marker.clusterId == null) {

				var
					iGuessed = Math.floor( (marker.getPoint().lat() + 90) / latGridSize),
					jGuessed = Math.floor( (marker.getPoint().lng() + 180) / lngGridSize),
					clusterId = iGuessed * nLngGrids + jGuessed
				;

				marker.clusterId = clusterId;
			}

			if (marker.clusterId in this.clusters) {

				var cluster = this.clusters[marker.clusterId];
				cluster.markers.push(marker);
				cluster.markerCount++;
				cluster.recalculateCenter = true;

			} else {

				var cluster = new Object();
				cluster.clusterer = this;
				cluster.markers = [marker];
				cluster.marker = null;
				cluster.markerCount = 1;
				cluster.recalculateCenter = true;

				this.clusters[marker.clusterId] = cluster;
			}
		}

	*/

// console.log('begin checking for marker in cluster');
// fjs.gMaps.Clusterer.dumpMarkers(visibleMarkers);

		var clusterId = 0;
		for (i in visibleMarkers) {

			var mm = visibleMarkers[i];

			if (! mm.inCluster) {

					// crea un nuovo cluster

				cluster = {

					clusterer: this,
					markers: [mm],
					marker: null,
					markerCount: 1,
					recalculateCenter: true
				};

				//clusterId++;
				//this.clusters[ clusterId ] = cluster;

				this.clusters.push(cluster);
				clusterId = this.clusters.length;

				mm.inCluster = true;
				mm.clusterId = clusterId;

				for (j in visibleMarkers) {

					marker = visibleMarkers[j];
					if (! marker.inCluster) {

						var
							mmpoint = this.ovl.getProjection().fromLatLngToDivPixel(mm.getPosition()),
							markerpoint = this.ovl.getProjection().fromLatLngToDivPixel(marker.getPosition())
						;

						var d =	Math.sqrt(
							Math.pow(mmpoint.x - markerpoint.x, 2) +
							Math.pow(mmpoint.y - markerpoint.y, 2)
						);

						if (d < this.opt.clusterRadius) {

							cluster.markers.push(marker);
							cluster.markerCount++;

							marker.inCluster = true;
							marker.clusterId = clusterId;
						}
					}
				}
			}
		}
	}

		// se ho dei cluster che non hanno abbastanza punti li elimina

	for (i in this.clusters) {

		cluster = this.clusters[i];

		if (cluster.markerCount < this.opt.minMarkersPerCluster) {

			if (cluster.marker !== null)
				this.map.removeOverlay( cluster.marker );

				// marca i punti all'interno del cluster eliminato in modo
				// che vengano disegnati come punti singoli

			for (j in cluster.markers)
				cluster.markers[j].inCluster = false;

			delete this.clusters[i];
		}
	}

	//	console.log('----');
	//	for (i in this.clusters) {

	//		console.log('Cluster n. ' + i + ': ' + this.clusters[i].markers.length);
	//	}

		// crea i marker per i cluster che non ne hanno

	var
		me = this,
		clusterClick = function(cluster) {

			return function(e) {

				// if (typeof e === 'undefined') return;
				// if (! e.stop) return;

				// e.stop();

				me.popUp(cluster);
			};
		}
	;

	for (i in this.clusters) {

		cluster = this.clusters[i];

		var b;
		if (cluster.marker === null) {

			b = new google.maps.LatLngBounds();
			for (k in cluster.markers)
				b.extend(cluster.markers[k].getPosition());

/*
			cluster.marker = new GMarker(bounds.getCenter(), {
				icon: this.getIcon(cluster.markers.length)
			});

			GEvent.bind(cluster.marker, 'click', cluster, fjs.gMaps.Clusterer.PopUp);
*/

			// cluster.marker = new fjs.gMaps.Clusterer.marker(b.getCenter(), cluster.markers.length, {

			//			image: FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/c01.png',

			//			width: 43,
			//			height: 43,

			//			onclick: FlexJS.proxy(fjs.gMaps.Clusterer.PopUp, cluster)
			//		}
			// );

			// this.map.addOverlay(cluster.marker);
/*
				var mopt = {

					position: b.getCenter(),
					map: this.map,

	//					animation: google.maps.Animation.DROP

					icon: {

						url:  FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/c01.png',

						size: new google.maps.Size(43, 43),

						origin: new google.maps.Point(0,0),

						anchor: new google.maps.Point(43 / 2, 43 / 2)
					}
				};

				cluster.marker = new google.maps.Marker(mopt);


//			GEvent.bind(cluster.marker, 'click', cluster, fjs.gMaps.Clusterer.PopUp);
		google.maps.event.addListener(cluster.marker, 'click', clusterClick(cluster));

fjs.gMaps.Clusterer.init();


		var ml = new MarkerLabel({

			map: this.map,
			marker: cluster.marker,

					text: cluster.markers.length,
					'class' : 'mapIconLabel',

					css: {
//						border: '1px solid red',

						position: 'absolute',

//						top: '-29px',
//						left: '-12px',

						// width: fjs.gMaps.Clusterer.icon.size.x,
						// height: fjs.gMaps.Clusterer.icon.size.y,

						color: '#fff',

						'font-family': 'sans-serif',
						'font-size': '14px',
						'text-align': 'center',

						zIndex: 301
					}
		});

		ml.bindTo('position', cluster.marker, 'position');
*/


			cluster.marker = new MarkerWithLabel({

				position: b.getCenter(),
				map: this.map,

				// per debug posizionamento
				// optimized: false,

//				icon: FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/c01.png',
				icon: fjs.gMaps.Clusterer.icon.url,

//				shadow: '/img/sticker/bubble_shadow.png',
//				transparent: '/img/sticker/bubble_transparent.png',
//				draggable: false,
//				raiseOnDrag: false,

					// nota: non può usare 'label' come nome della proprietà
					// poiché è usata dal Marker di Google

				labelContent: {

					text: cluster.markers.length,
					'class': 'mapIconLabel',

					css: {
//						border: '1px solid red',

						position: 'absolute',

//						top: '-29px',
//						left: '-12px',

						// width: fjs.gMaps.Clusterer.icon.size.x,
						// height: fjs.gMaps.Clusterer.icon.size.y,

						color: '#fff',

						'font-family': 'sans-serif',
						'font-size': '14px',
						'text-align': 'center',

						zIndex: 9999
					},
				}
			});


/*
			cluster.marker = new MarkerWithLabel({

				position: b.getCenter(),
				map: this.map,

				// per debug posizionamento
				// optimized: false,

//				icon: FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/c01.png',
				icon: fjs.gMaps.Clusterer.icon.url
			});
*/


			google.maps.event.addListener(cluster.marker, 'click', clusterClick(cluster));

			cluster.recalculateCenter = false;

		} else if (cluster.recalculateCenter) {

			b = new google.maps.LatLngBounds();
			for (k in cluster.markers)
				b.extend(cluster.markers[k].getPosition());

			cluster.marker.setPosition(b.getCenter());

			cluster.recalculateCenter = false;
		}
	}

		// elimina eventuali marker che erano stati messi sulla mappa
		// ma che adesso appartengono ad un cluster

	for (i in this.clusters) {

		var cl = this.clusters[i];
		for (j in cl.markers) {

			if (cl.markers[j].inCluster && cl.markers[j].onMap) {

				cl.markers[j].setMap(null);

				cl.markers[j].onMap = false;
			}
		}
	}

		// visualizza tutti i marker che non appartengono ad alcun cluster

//console.log('visible markers', visibleMarkers.length);

	for (i = 0; i < visibleMarkers.length; i++) {

		marker = visibleMarkers[i];
		if (! marker.onMap && ! marker.inCluster) {

			marker.setMap(this.map);

			marker.onMap = true;
		}
	}

// console.log('after');
// fjs.gMaps.Clusterer.dumpMarkers(this.markers);
//	this.RePop();
};

// fjs.gMaps.Clusterer.dumpMarkers = function(ml) {
// return;
//		for (var i in ml) {

//			var m = ml[i];

//			console.log('marker n. ' + i + ': \'' + m.title + '\'', 'on map: ' + (m.onMap ? 'yes' : 'no'), 'in cluster: ' + (m.inCluster ? 'yes' : 'no'), 'cluster ID: ' + m.clusterId);
//		}
//	};

// fjs.gMaps.Clusterer.proxy = function(fn, proxy) { return function() {fn.apply(proxy, arguments); }; };

fjs.gMaps.Clusterer.prototype.popUp = function(cluster) {

	//	var
	//		cluster = this,
	//		clusterer = cluster.clusterer
	//	;

/*
    for (var i = 0; i < cluster.markers.length; i++) {

		var marker = cluster.markers[i];

		clusterer.map.addOverlay(marker);

		if (marker.addedToMap != null)
			marker.addedToMap();

		marker.onMap = true;
	}

	return;
*/


/*
maxZoom: 18,			// livello massimo di zoom, se -1 usa la mappatura qui sotto
maxZoomMap: {
	'Map': 18,
	'Sat': 18,
	'Hyb': 18,
	'Ter': 12
}
*/

		// determina il livello massimo di zoom

	var maxZoom = this.opt.maxZoom;
	if (maxZoom == -1) {

		var mt = this.map.getMapTypeId();
		if (mt == google.maps.MapTypeId.ROADMAP) {
			maxZoom = this.opt.maxZoomMap.Map;
		} else if (mt == google.maps.MapTypeId.SATELLITE) {
			maxZoom = this.opt.maxZoomMap.Sat;
		} else if (mt == google.maps.MapTypeId.HYBRID) {
			maxZoom = this.opt.maxZoomMap.Hyb;
		} else if (mt == google.maps.MapTypeId.TERRAIN) {
			maxZoom = this.opt.maxZoomMap.Ter;
		}
	}

// console.log('Map type: ' + clusterer.map.getCurrentMapType().getName(true) + ', ' + clusterer.currentZoomLevel);
// console.log(clusterer.currentZoomLevel, maxZoom);

	var i, marker;
	if (this.currentZoomLevel < maxZoom) {

		var bounds = new google.maps.LatLngBounds();

		$.each(cluster.markers, function() {

			bounds.extend(this.getPosition());
		});

		this.map.fitBounds(bounds);

		this.map.setZoom(Math.min(this.map.getZoom(), maxZoom));

			// rettangolo per debug dei bounds

		// if (! this.r)
		//	this.r = new google.maps.Rectangle({
		//		strokeColor: '#FF0000',
		//		strokeOpacity: 0.8,
		//		strokeWeight: 2,
		//		fillColor: '#FF0000',
		//		fillOpacity: 0.35,
		//		map: this.map
		//		//bounds: bounds
		//	});

		// this.r.setBounds(bounds);

	} else {

		var
			html = '<div class="gLociInfoWindow gLociMarkerList"><table>',
			n = 0
		;

		for (i = 0; i < cluster.markers.length; i++) {

			marker = cluster.markers[i];
			if (marker !== null) {

				n++;

				var icn = marker.getIcon(), sz = icn.size;

				html += '<tr><td>';
				//	if (marker.getIcon().smallImage)
				//		html += '<img src="' + marker.getIcon().smallImage + '">';
				//	else
				html += '<img src="' + icn.url + '" width="' + ( sz.width / 2 ) + '" height="' + ( sz.height / 2 ) + '" />';

				html += '<a href="' + marker.link + '">' + marker.title + '</a>';
				html += '</td></tr>';
/*
				if (n == clusterer.opt.maxLinesPerInfoBox - 1 && cluster.markerCount > clusterer.opt.maxLinesPerInfoBox) {

					html += '<tr><td colspan="2">...and ' + ( cluster.markerCount - n ) + ' more</td></tr>';
					break;
				}
*/
			}
		}

		html += '</table></div>';

		var cnt = $(html).css({
			margin: '-1px',
			maxWidth: '350px'
		});

//		this.map.closeInfoWindow();
//		cluster.marker.openInfoWindowHtml(html);
//		clusterer.map.openInfoWindowHtml(cluster.marker.getPoint(), html);

		this.mapHdl.openInfoWindow(cnt.get(0), cluster.marker);

//		clusterer.poppedUpCluster = cluster;
	}
};

// fjs.gMaps.Clusterer.prototype.openInfoWindow = function(content, where) {

//		this.closeInfoWindow();

//		this.infoWindow = new google.maps.InfoWindow({

//			content: content,
//			maxWidth: 350
//		});

//		this.infoWindow.open(this.map, where);
//	};

//	fjs.gMaps.Clusterer.prototype.closeInfoWindow = function() {

//		if (this.infoWindow !== null) {

//			this.infoWindow.close();

//			this.infoWindow = null;
//		}
// };


//	fjs.gMaps.Clusterer.prototype.RePop = function() {

//		if (this.poppedUpCluster !== null)
//			fjs.gMaps.Clusterer.popUp.apply(this.poppedUpCluster);
//	};

//	fjs.gMaps.Clusterer.prototype.PopDown = function() {

//			// siccome questa funzione pu essere chiamata subito dopo il popup
//			// verifica chi gestisce il boundsDisplay prima di chiuderlo

//		if (this.boundsDisplay && this.boundsDisplayOwner == this.poppedUpCluster) {

//			this.map.removeOverlay(this.boundsDisplay);

//			this.boundsDisplay = null;
//			this.boundsDisplayOwner = null;
//		}

//		this.poppedUpCluster = null;
//	};

/*
	// aggiunge le funzionalità per la gestione del cluster ai marker
	// in questo modo è possibile crearli e demandare il posizionamento
	// lsula mappa al clusterer

GMarker.prototype.setMap = function(map) { this.map = map; };
GMarker.prototype.addedToMap = function() { this.map = null; };

GMarker.prototype.origOpenInfoWindow = GMarker.prototype.openInfoWindow;
GMarker.prototype.openInfoWindow = function(node, opts) {

//	if (this.map !== null)
	if (this.map)
		return this.map.openInfoWindow( this.getPoint(), node, opts );
	else
		return this.origOpenInfoWindow( node, opts );
};

GMarker.prototype.origOpenInfoWindowHtml = GMarker.prototype.openInfoWindowHtml;
GMarker.prototype.openInfoWindowHtml = function(html, opts) {

//	if (this.map !== null)
	if (this.map)
		return this.map.openInfoWindowHtml( this.getPoint(), html, opts );
	else
		return this.origOpenInfoWindowHtml( html, opts );
};

GMarker.prototype.origOpenInfoWindowTabs = GMarker.prototype.openInfoWindowTabs;
GMarker.prototype.openInfoWindowTabs = function(tabNodes, opts) {

//	if (this.map !== null)
	if (this.map)
		return this.map.openInfoWindowTabs( this.getPoint(), tabNodes, opts );
	else
		return this.origOpenInfoWindowTabs( tabNodes, opts );
};

GMarker.prototype.origOpenInfoWindowTabsHtml = GMarker.prototype.openInfoWindowTabsHtml;
GMarker.prototype.openInfoWindowTabsHtml = function(tabHtmls, opts) {

//	if (this.map !== null)
	if (this.map)
		return this.map.openInfoWindowTabsHtml( this.getPoint(), tabHtmls, opts );
	else
		return this.origOpenInfoWindowTabsHtml( tabHtmls, opts );
};

GMarker.prototype.origShowMapBlowup = GMarker.prototype.showMapBlowup;
GMarker.prototype.showMapBlowup = function (opts) {

//	if (this.map !== null)
	if (this.map)
		return this.map.showMapBlowup( this.getPoint(), opts );
	else
		return this.origShowMapBlowup( opts );
};
*/

/*



var
	OFFSET = 268435456,
	RADIUS = 85445659.4471 // offset / PI
;

function lonToX(lon) { return Math.round(OFFSET + RADIUS * lon * 3.14159265359 / 180); }
function latToY(lat) {

    return Math.round(
		OFFSET - RADIUS *
			Math.log(
				(1 + Math.sin(lat * 3.14159265359 / 180)
			) / Math.LN10 /
			(1 - Math.sin(lat * 3.14159265359 / 180))) / 2
	);
}

function pixelDistance(lat1, lon1, lat2, lon2, zoom) {

	var
		x1 = lonToX(lon1),
		y1 = latToY(lat1),

		x2 = lonToX(lon2),
		y2 = latToY(lat2)
	;

	return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2),2)) >> (21 - zoom);
}
*/

/*
	// marker usato al posto di quello di default delle gmaps

fjs.gMaps.Clusterer.marker = function(latlng, count, opt) {

	this.latlng = latlng;
	this.count = count;

	this.opt = jQuery.extend({}, {

		image: '#',
		height: 50,
		width: 50,

		textColor: 'black',

		padding: 0,

		onclick: null

	}, opt);
};

fjs.gMaps.Clusterer.marker.prototype = new GOverlay();

fjs.gMaps.Clusterer.marker.prototype.initialize = function(map) {

	this.map = map;

	var
		div = document.createElement('div'),
		latlng = this.latlng,
		pos = map.fromLatLngToDivPixel(latlng)
	;

	pos.x -= parseInt(this.opt.width / 2, 10);
	pos.y -= parseInt(this.opt.height / 2, 10);

	var mstyle = document.all ?
		'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="' + this.opt.image + '");'
		:
		'background:url(' + this.opt.image + ');'
	;

	mstyle += 'height:' + this.opt.height + 'px;line-height:' + this.opt.height + 'px;';
	mstyle += 'width:' + this.opt.width + 'px;text-align:center;';

	div.style.cssText = mstyle + 'cursor:pointer;top:' + pos.y + "px;left:" +
		pos.x + "px;color:" + this.opt.textColor +  ";position:absolute;font-size:14px;" +
		'font-family:Arial,sans-serif;font-weight:bold;color:white;'
	;

	div.innerHTML = this.count;

	map.getPane(G_MAP_MAP_PANE).appendChild(div);

	var me = this;
	GEvent.addDomListener(div, 'click', function() { if (me.opt.onclick) me.opt.onclick(); });

	this.div = div;
};

fjs.gMaps.Clusterer.marker.prototype.getPoint = function() { return this.latlng; };

fjs.gMaps.Clusterer.marker.prototype.remove = function() { this.div.parentNode.removeChild(this.div); };

fjs.gMaps.Clusterer.marker.prototype.redraw = function(force) {

	if (! force)
		return;

	var pos = this.map.fromLatLngToDivPixel(this.latlng);

	pos.x -= parseInt(this.opt.width / 2, 10);
	pos.y -= parseInt(this.opt.height / 2, 10);

	this.div.style.top =  pos.y + 'px';
	this.div.style.left = pos.x + 'px';
};

fjs.gMaps.Clusterer.marker.prototype.hide = function() { this.div.style.display = 'none'; };
fjs.gMaps.Clusterer.marker.prototype.show = function() { this.div.style.display = ''; };
fjs.gMaps.Clusterer.marker.prototype.isHidden = function() { return this.div.style.display === 'none'; };

*/

	//	http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclustererplus/2.1.2/src/markerclusterer.js

fjs.gMaps.Clusterer.sInit = false;
fjs.gMaps.Clusterer.init = function() {

	if (fjs.gMaps.Clusterer.sInit)
		return;

	fjs.gMaps.Clusterer.sInit = true;

fjs.gMaps.Clusterer.icon = {
	url: FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/c01.png',
	size: { x: 43, y: 43 }

	// size: new google.maps.Size(43, 43),
	// origin: new google.maps.Point(0,0),
	// anchor: new google.maps.Point(43 / 2, 43 / 2)
};

function inherits(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
}


//MarkerWithLabel = function(options) { google.maps.Marker.apply(this, arguments); };
//MarkerWithLabel.prototype = $.extend(new google.maps.Marker({ position: new google.maps.LatLng(0, 0) }), {});

window.MarkerWithLabel = function(options) {

	google.maps.Marker.apply(this, arguments);

	if (options.labelContent) {

		this.MarkerLabel = new MarkerLabel({

			map: this.map,
			marker: this,

			text: options.labelContent.text,
			'class': options.labelContent.class,
//			css: options.labelContent.css
		});

		this.MarkerLabel.bindTo('position', this, 'position');
	}
};

inherits(window.MarkerWithLabel, google.maps.Marker);

window.MarkerWithLabel.prototype.setMap = function() {

	google.maps.Marker.prototype.setMap.apply(this, arguments);
	if (this.MarkerLabel) this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
};

/*
MarkerWithLabel.prototype = $.extend(new google.maps.Marker(), {
	// If we're adding/removing the marker from the map, we need to do the same for the marker label overlay
	setMap: function() {

		google.maps.Marker.prototype.setMap.apply(this, arguments);
		if (this.MarkerLabel) this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
	},

	redraw: function() {
console.log(this.get('position'));

		google.maps.Marker.prototype.redraw.apply(this, arguments);
	}

});
*/

// Our custom marker label overlay
var MarkerLabel = function(options) {

	var self = this;

	this.setValues(options);

	// Create the label container
	this.div = document.createElement('div');
	this.div.className = options.class; //'map-marker-label';

	$(this.div)/*.css(options.css)*/.html(options.text);

	// Trigger the marker click handler if clicking on the label
	google.maps.event.addDomListener(this.div, 'click', function(e){
		if (e.stopPropagation) e.stopPropagation();
		google.maps.event.trigger(self.marker, 'click');
	});
};

MarkerLabel.prototype = $.extend(

	new google.maps.OverlayView(),
	{

		onAdd: function() {

			this.getPanes().overlayImage.appendChild(this.div);

			// Ensures the label is redrawn if the text or position is changed.
			var self = this;
			this.listeners = [
				google.maps.event.addListener(this, 'position_changed', function() { self.draw(); }),
				google.maps.event.addListener(this, 'text_changed', function() { self.draw(); }),
				google.maps.event.addListener(this, 'zindex_changed', function() { self.draw(); })
			];
		},

		onRemove: function() {

			this.div.parentNode.removeChild(this.div);
			// Label is removed from the map, stop updating its position/text
			for (var i = 0, l = this.listeners.length; i < l; ++i) {
				google.maps.event.removeListener(this.listeners[i]);
			}
		},

		draw: function() {

			var
				text = String(this.get('text')),
	//			markerSize = this.marker.icon.size,
				markerSize = fjs.gMaps.Clusterer.icon.size,
				position = this.getProjection().fromLatLngToDivPixel(this.get('position'))
			;

			var
				// cx = position.x - markerSize.x / 2,
				// cy = position.y - markerSize.y / 2,

				lh = $(this.div).height(),
				lw = $(this.div).width()
			;

			//this.div.innerHTML = text;
			// // this.div.style.left = (position.x - (markerSize.x / 2)) - (text.length * 3) + 'px';

			this.div.style.top = Math.floor(5 + position.y - (markerSize.y / 2) - (markerSize.y - lh) / 2) + 'px';
			this.div.style.left = Math.floor(position.x - (markerSize.x / 2) + (markerSize.x - lw) / 2) + 'px';

			// this.div.style.left = position.x + 'px';
			// this.div.style.top = position.y + 'px';

			// this.div.style.top = Math.round(position.y - (markerSize.y - lh) / 2) + 'px';
			// this.div.style.left = Math.round(position.x - (markerSize.x - lw) / 2) + 'px';
		}
	});
};


