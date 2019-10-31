
	//
	// Interfaccia verso le GMaps
	//

window.FlexJS = window.FlexJS || {};

FlexJS.GMaps = window.FlexJS.GMaps || {};

FlexJS.GMaps.sDelays = FlexJS.GMaps.sDelays || 0;
FlexJS.GMaps.sMaps = FlexJS.GMaps.sMaps || {};

FlexJS.GMaps.AddMap = function(id, w, h, lat, lng, pars) {

	setTimeout(function() {

		FlexJS.GMaps._addMap(id, w, h, lat, lng, pars);

	}, 1500 * FlexJS.GMaps.sDelays++);
};

FlexJS.GMaps._addMap = function(id, w, h, lat, lng, pars) {

	if (GBrowserIsCompatible()) {

		$('#' + id)
			.width(w)
			.height(h)
		;

		var map = new GMap2(document.getElementById(id));

			// aggiunge la mappa all'inventory

		FlexJS.GMaps.sMaps[ id ] = map;

			// guarda se deve inserire un gestore per l'onload

		if (pars.onload)
			GEvent.addListener(map, 'load', pars.onload);

		var c = new GLatLng(lat, lng);

		map.setCenter(
			c,
			pars.zoom || 17,
			pars.maptype || G_NORMAL_MAP
		);

		map.enableScrollWheelZoom();

		if (pars.zoomcontrol)
			map.addControl(new GSmallZoomControl());

			// prima di aggiungere il controllo per la selezione delle
			// mappe da aggiungere la mappa 'terrain' alle tipologie
			// di mappe supportate dalla mappa stessa

		if (pars.maptypecontrol) {

			map.addMapType(G_PHYSICAL_MAP);
			map.addControl(new GMapTypeControl());
		}

		if (pars.scalecontrol) {

				// inserisce i metri sopra le unità imperiali

			// _mPreferMetric = true;

			var s = new GScaleControl();

			map.addControl(s);
		}

		switch (pars.navicontrol) {

			case 1: map.addControl(new GSmallMapControl()); break;
			case 2: map.addControl(new GLargeMapControl()); break;
		}

		if (pars.marker) {

			var mopt = {

				bouncy: true
			};

			if (pars.markerico) {

				var icon = new GIcon();

				icon.image = pars.markerico[0];
				icon.iconSize = new GSize(pars.markerico[1], pars.markerico[2]);
				icon.iconAnchor = new GPoint(pars.markerico[1] / 2, pars.markerico[2]);

				icon.shadow = pars.markericos[0];
				icon.shadowSize = new GSize(pars.markericos[1], pars.markericos[2]);

				icon.infoWindowAnchor = new GPoint(pars.markerico[1] / 2, 0);
//			icon.infoShadowAnchor = new GPoint(18, 25);

				mopt.icon = icon;
			}

			var marker = new GMarker(c, mopt);

			map.addOverlay(marker);

			if (pars.html)
				marker.openInfoWindowHtml(pars.html);
		}
	}
};

	// accesso all'inventory delle mappe

FlexJS.GMaps.GetMap = function(id) { return FlexJS.GMaps.sMaps[ id ]; };

	// accesso al geocoding

FlexJS.GMaps.sGeocoder = FlexJS.GMaps.sGeocoder || null;

FlexJS.GMaps.GetGeocoder = function() {

	if (! FlexJS.GMaps.sGeocoder)
		FlexJS.GMaps.sGeocoder = new GClientGeocoder();

	return FlexJS.GMaps.sGeocoder;
};

FlexJS.GMaps.GetAddressPoint = function(a, cb) {

	FlexJS.GMaps.GetGeocoder().getLatLng(a, cb);
};

	//
	// funzioni per la gestione dei marker
	//

FlexJS.GMaps.sMarkers = FlexJS.GMaps.sMarkers || {};

	// inventory dei marker

FlexJS.GMaps.AddMapMarker = function(map, marker, m) { if (! FlexJS.GMaps.sMarkers[ map ]) FlexJS.GMaps.sMarkers[ map ] = {}; FlexJS.GMaps.sMarkers[ map ][ marker ] = m; };
FlexJS.GMaps.GetMapMarker = function(map, marker) { if (FlexJS.GMaps.sMarkers[ map ]) return FlexJS.GMaps.sMarkers[ map ][ marker ]; };

