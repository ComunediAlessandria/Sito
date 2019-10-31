
window.FlexJS = window.FlexJS || {};
FlexJS.GMaps = window.FlexJS.GMaps || {};

FlexJS.GMaps.Clusterer = function(map, opt) {

	this.map = map;

	this.opt = jQuery.extend({}, {

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

//	this.icon = G_DEFAULT_ICON;

	this.currentZoomLevel = -1;

	this.latSpan = null;
	this.lngSpan = null;

	GEvent.bind(this.map, 'zoomend', this, this.Display);
	GEvent.bind(this.map, 'moveend', this, this.Display);
	GEvent.bind(this.map, 'infowindowclose', this, this.PopDown);
};

/*
FlexJS.GMaps.Clusterer.prototype.SetIcon = function(icon) {

	this.icon = icon;
};
*/

FlexJS.GMaps.Clusterer.prototype.getIcon = function(n) {

	var
		icon = new GIcon()
	;

	icon.image = FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/m/m' + n + '.png';

	icon.iconSize = new GSize(53, 52);
	icon.iconAnchor = new GPoint(26, 26);

	icon.infoWindowAnchor = new GPoint(26, 0);

/*
	icon.iconSize = new GSize(26, 28);
	icon.iconAnchor = new GPoint(13, 28);

	icon.infoWindowAnchor = new GPoint(13, 0);
*/
	return icon;
};

FlexJS.GMaps.Clusterer.prototype.AddMarker = function(marker, title, link) {

	if (marker.setMap !== null)
		marker.setMap(this.map);

	marker.title = title;
	marker.link = link;

	marker.onMap = false;
	marker.inCluster = false;
	marker.clusterId = null;

		// aggiunge il marker alla lista ma ritarda il ricalcolo in modo
		// da non appesantire il caricamento nel caso di impostazione
		// sequenziale di più punti

	this.markers.push(marker);
	this.DisplayLater();
};

FlexJS.GMaps.Clusterer.prototype.DisplayLater = function() {

	if (this.timeout !== null)
		clearTimeout(this.timeout);

	this.timeout = setTimeout(this.Display, 50);
};

FlexJS.GMaps.Clusterer.prototype.Display = function() {

	clearTimeout(this.timeout);

		// ottiene i confini dell'attuale area

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

		bounds = new GLatLngBounds(
			new GLatLng( sw.lat() - dLat, sw.lng() - dLng ),
			new GLatLng( ne.lat() + dLat, ne.lng() + dLng )
		);
	}

		// nel caso di un nuovo livello di zoom deve ricalcolare tutti i cluster
		// poiché dipendono dalla distanza in pixel che è una funzione dello zoom

	var newZoomLevel = this.map.getZoom(), i, j, k, cluster;
//	if (newZoomLevel != this.currentZoomLevel) {
	if (true) {

		this.map.clearOverlays();

			// ricalcola tutti gli id dei cluster

		for (i in this.markers) {

			this.markers[i].clusterId = null;

			this.markers[i].onMap = false;
			this.markers[i].inCluster = false;
		}

			// elimina tutti i cluster

		for (i in this.clusters) {

			cluster = this.clusters[i];

			// remove the overlay
			//clusterer.map.removeOverlay( cluster.marker );

			if (cluster == this.poppedUpCluster)
				this.map.closeInfoWindow();

			for (j in cluster.markers)
				cluster.markers[j].inCluster = false;

			delete this.clusters[i];
		}

		this.clusters = {};

		if (this.boundsDisplay !== null) {

			//clusterer.map.removeOverlay(clusterer.boundsDisplay);

			this.boundsDisplay = null;
			this.boundsDisplayOwner = null;
		}

		this.map.closeInfoWindow();

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

		if (bounds.contains(marker.getPoint()))
			visibleMarkers.push(marker);
		else
			nonvisibleMarkers.push(marker);
	}

		// elimina i marker non visibili

	for (i in nonvisibleMarkers) {

		marker = nonvisibleMarkers[i];
		if (marker.onMap) {

			this.map.removeOverlay(marker);

			marker.onMap = false;

			if (marker.inCluster && marker.clusterId)
				this.clusters[marker.clusterId].recalculateCenter = true;
		}
	}

		// elimina i cluster che non sono visibili

	for (i in this.clusters) {

		cluster = this.clusters[i];

		if (! bounds.contains(cluster.marker.getPoint())) {

				// cancella il marker

			this.map.removeOverlay( cluster.marker );

				// se il cluster ha la info wiindow aperta, la chiude

			if (cluster == this.poppedUpCluster)
				this.map.closeInfoWindow();

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

		var clusterId = 0;
		for (i in visibleMarkers) {

			var mm = visibleMarkers[i];

			if (! mm.inCluster) {

				cluster = {}; //new Object();
				cluster.clusterer = this;
				cluster.markers = [mm];
				cluster.marker = null;
				cluster.markerCount = 1;
				cluster.recalculateCenter = true;

				clusterId++;
				this.clusters[clusterId] = cluster;

				mm.inCluster = true;
				mm.clusterId = clusterId;

				for (j in visibleMarkers) {

					marker = visibleMarkers[j];
					if (! marker.inCluster) {

/*
						var d = pixelDistance(
							mm.getLatLng().lat(), mm.getLatLng().lng(),
							marker.getLatLng().lat(), marker.getLatLng().lng(),
							newZoomLevel
						);
*/
						var mmpoint = this.map.fromLatLngToDivPixel(mm.getLatLng());
						var markerpoint = this.map.fromLatLngToDivPixel(marker.getLatLng());

						var d =
							Math.sqrt(
								Math.pow(mmpoint.x - markerpoint.x, 2) +
								Math.pow(mmpoint.y - markerpoint.y, 2)
							)
						;

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

			if (cluster == this.poppedUpCluster)
				this.map.closeInfoWindow();

				// marca i punti all'interno del cluster eliminato in modo
				// che vengano disegnati come punti singoli

			for (j in cluster.markers)
				cluster.markers[j].inCluster = false;

			delete this.clusters[i];
		}
	}

/*
	console.log('----');
	for (var i in this.clusters) {

		console.log('Cluster n. ' + i + ': ' + this.clusters[i].markers.length);
	}
*/
		// crea i marker per i cluster che non ne hanno

	for (i in this.clusters) {

		cluster = this.clusters[i];

		var b;
		if (cluster.marker === null) {

			b = new GLatLngBounds();
			for (k in cluster.markers)
				b.extend(cluster.markers[k].getPoint());

/*
			cluster.marker = new GMarker(bounds.getCenter(), {
				icon: this.getIcon(cluster.markers.length)
			});

			GEvent.bind(cluster.marker, 'click', cluster, FlexJS.GMaps.Clusterer.PopUp);
*/

			cluster.marker = new FlexJS.GMaps.Clusterer.marker(b.getCenter(), cluster.markers.length, {

				image: FlexJS.AppConfigure.Get('kDataURL') + 'TemplatesUSR/assets/gLoci/cluster/c01.png',

				width: 43,
				height: 43,

				onclick: FlexJS.proxy(FlexJS.GMaps.Clusterer.PopUp, cluster)
			});

			this.map.addOverlay(cluster.marker);

			cluster.recalculateCenter = false;

		} else if (cluster.recalculateCenter) {

			b = new GLatLngBounds();
			for (k in cluster.markers)
				b.extend(cluster.markers[k].getPoint());

			cluster.marker.setPoint(b.getCenter());

			cluster.recalculateCenter = false;
		}
	}

		// elimina eventuali marker che erano stati messi sulla mappa
		// ma che adesso appartengono ad un cluster

	for (i in this.clusters) {

		var cl = this.clusters[i];
		for (j in cl.markers) {

			if (cl.markers[j].inCluster && cl.markers[j].onMap) {

				this.map.removeOverlay(cl.markers[j]);

				cl.markers[j].onMap = false;
			}
		}
	}

		// visualizza tutti i marker che non appartengono ad alcun cluster

	for (i = 0; i < visibleMarkers.length; i++) {

		marker = visibleMarkers[i];
		if (! marker.onMap && ! marker.inCluster) {

			this.map.addOverlay(marker);

			if (marker.addedToMap !== null)
				marker.addedToMap();

			marker.onMap = true;
		}
	}

//	this.RePop();
};

// FlexJS.GMaps.Clusterer.proxy = function(fn, proxy) { return function() {fn.apply(proxy, arguments); }; };

FlexJS.GMaps.Clusterer /*.prototype */.PopUp = function() {

	var
		cluster = this,
		clusterer = cluster.clusterer
	;

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

	var maxZoom = clusterer.opt.maxZoom;
	if (maxZoom == -1) {

		var mt = clusterer.map.getCurrentMapType();
		if (mt == G_NORMAL_MAP) {
			maxZoom = clusterer.opt.maxZoomMap.Map;
		} else if (mt == G_SATELLITE_MAP) {
			maxZoom = clusterer.opt.maxZoomMap.Sat;
		} else if (mt == G_HYBRID_MAP) {
			maxZoom = clusterer.opt.maxZoomMap.Hyb;
		} else if (mt == G_PHYSICAL_MAP) {
			maxZoom = clusterer.opt.maxZoomMap.Ter;
		}
	}

// console.log('Map type: ' + clusterer.map.getCurrentMapType().getName(true) + ', ' + clusterer.currentZoomLevel);
// console.log(clusterer.currentZoomLevel, maxZoom);

	var i, marker;
	if (clusterer.currentZoomLevel < maxZoom) {

		var bounds = new GLatLngBounds();

		for (i = 0; i < cluster.markers.length; i++) {

			marker = cluster.markers[i];
			if (marker !== null)
				bounds.extend(marker.getLatLng());
		}

		clusterer.map.setCenter(bounds.getCenter());
		clusterer.map.setZoom(
			Math.min(
				clusterer.map.getBoundsZoomLevel(bounds),
				maxZoom
			)
		);

	} else {

		var
			html = '<div class="gLociInfoWindow gLociMarkerList"><ul>',
			n = 0
		;

		for (i = 0; i < cluster.markers.length; i++) {

			marker = cluster.markers[i];
			if (marker !== null) {

				n++;

				html += '<li>';
				if (marker.getIcon().smallImage)
					html += '<img src="' + marker.getIcon().smallImage + '">';
				else
					html += '<img src="' + marker.getIcon().image + '" width="' + ( marker.getIcon().iconSize.width / 2 ) + '" height="' + ( marker.getIcon().iconSize.height / 2 ) + '">';

				html += '<a href="' + marker.link + '">' + marker.title + '</a>';
				html += '</li>';
/*
				if (n == clusterer.opt.maxLinesPerInfoBox - 1 && cluster.markerCount > clusterer.opt.maxLinesPerInfoBox) {

					html += '<tr><td colspan="2">...and ' + ( cluster.markerCount - n ) + ' more</td></tr>';
					break;
				}
*/
			}
		}

		html += '</ul></div>';

		clusterer.map.closeInfoWindow();
//		cluster.marker.openInfoWindowHtml(html);
		clusterer.map.openInfoWindowHtml(cluster.marker.getPoint(), html);

		clusterer.poppedUpCluster = cluster;
	}
};

FlexJS.GMaps.Clusterer.prototype.RePop = function() {

	if (this.poppedUpCluster !== null)
		FlexJS.GMaps.Clusterer.PopUp.apply(this.poppedUpCluster);
};

FlexJS.GMaps.Clusterer.prototype.PopDown = function() {

		// siccome questa funzione pu essere chiamata subito dopo il popup
		// verifica chi gestisce il boundsDisplay prima di chiuderlo

	if (this.boundsDisplay && this.boundsDisplayOwner == this.poppedUpCluster) {

		this.map.removeOverlay(this.boundsDisplay);

		this.boundsDisplay = null;
		this.boundsDisplayOwner = null;
	}

	this.poppedUpCluster = null;
};


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

	// marker usato al posto di quello di default delle gmaps

FlexJS.GMaps.Clusterer.marker = function(latlng, count, opt) {

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

FlexJS.GMaps.Clusterer.marker.prototype = new GOverlay();

FlexJS.GMaps.Clusterer.marker.prototype.initialize = function(map) {

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

//	map.getPane(G_MAP_MAP_PANE).appendChild(div);
	map.getPane(G_MAP_MARKER_PANE).appendChild(div);

	var me = this;
	GEvent.addDomListener(div, 'click', function() { if (me.opt.onclick) me.opt.onclick(); });

	this.div = div;
};

FlexJS.GMaps.Clusterer.marker.prototype.getPoint = function() { return this.latlng; };

FlexJS.GMaps.Clusterer.marker.prototype.remove = function() { this.div.parentNode.removeChild(this.div); };

FlexJS.GMaps.Clusterer.marker.prototype.redraw = function(force) {

	if (! force)
		return;

	var pos = this.map.fromLatLngToDivPixel(this.latlng);

	pos.x -= parseInt(this.opt.width / 2, 10);
	pos.y -= parseInt(this.opt.height / 2, 10);

	this.div.style.top =  pos.y + 'px';
	this.div.style.left = pos.x + 'px';
};

FlexJS.GMaps.Clusterer.marker.prototype.hide = function() { this.div.style.display = 'none'; };
FlexJS.GMaps.Clusterer.marker.prototype.show = function() { this.div.style.display = ''; };
FlexJS.GMaps.Clusterer.marker.prototype.isHidden = function() { return this.div.style.display === 'none'; };