
	//
	// Interfaccia verso le GMaps v3
	//

window.fjs = window.FlexJS || {};

fjs.gMaps = window.fjs.gMaps || {};
fjs.GMaps = fjs.gMaps; // alias

fjs.gMaps.sDelays = fjs.gMaps.sDelays || 0;
//fjs.gMaps.sMaps = fjs.gMaps.sMaps || {};

fjs.gMaps.map = function(id, w, h, lat, lng, opt) {

	this.id = id;

	this.w = w;
	this.h = h;

	this.lat = lat;
	this.lng = lng;

	this.opt = opt;

	this.infoWindow = null;

	var me = this;
	setTimeout(function() {

			// intanto dimensiona l'elemento per il layout

		$('#' + me.id)
			.width(me.w)
			.height(me.h)
//			.css('border', '1px solid red')
		;

		me.attach();

	}, 1000 * fjs.gMaps.sDelays++);
};

fjs.gMaps.map.prototype.attach = function() {

	var el = document.getElementById(this.id);

	var c = new google.maps.LatLng(this.lat, this.lng);
	if (this.opt.center && $.isFunction(this.opt.center))
		c = this.opt.center(this);

	var opts = {
		center: c,
		zoom: this.opt.zoom || 17,
//		minZoom: 2,

		mapTypeId: this.opt.maptype || google.maps.MapTypeId.ROADMAP,

		streetViewControl: false,

		styles: this.opt.styles || null
	};

/*
if (false) {


		// https://developers.google.com/maps/documentation/javascript/styling#styling_the_default_map

  opts.styles = [
    {
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -20 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];
}
console.log(opts.styles);

[
	{
		stylers: [
			{ hue: '#00ffe6'  },
			{ saturation: -20  }
		 ]
 	}, {
		featureType: 'road',
		elementType: 'geometry',
		stylers: [
			{ lightness: 100  },
			{ visibility: 'simplified'  }
		]
 	}, {
		featureType: 'road',
		elementType: 'labels',
		stylers: [
			{ visibility: 'off'  }
		]
*/

	opts.mapTypeControl = this.opt.maptypecontrol;
	opts.mapTypeControlOptions = {
//		style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
		mapTypeIds: [
			google.maps.MapTypeId.HYBRID,
			google.maps.MapTypeId.ROADMAP,
			google.maps.MapTypeId.SATELLITE,
			google.maps.MapTypeId.TERRAIN
		]
	};

	if (this.opt.zoomcontrol) {

		opts.zoomControl = true;
		opts.zoomControlOptions = { style: google.maps.ZoomControlStyle.SMALL };
	}

	opts.scrollwheel = this.opt.zoomwheel;

	if (this.opt.scalecontrol) {

		opts.scaleControl = true;
		opts.scaleControlOptions = { style: google.maps.ScaleControlStyle.DEFAULT };
	}

	google.maps.visualRefresh = true;

	this.map = new google.maps.Map(el, opts);

	//	// aggiunge la mappa all'inventory

	// fjs.gMaps.sMaps[ id ] = map;

		// guarda se deve inserire un gestore per l'onload

	//	if (pars.onload)
	//		GEvent.addListener(map, 'load', pars.onload);

	var me = this;
	if (this.opt.onload)
		google.maps.event.addListener(this.map, 'idle', (function() {

			var e = true;
			return function() {

				if (e) { e = false; me.opt.onload(me); }
			};

		})());

	if (this.opt.marker) {

		var mopt = {
			position: c,
			map: this.map,

			animation: google.maps.Animation.DROP
		};

		if (this.opt.markerico) {

//				var icon = new GIcon();

//				icon.image = pars.markerico[0];
//				icon.iconSize = new GSize(pars.markerico[1], pars.markerico[2]);
//				icon.iconAnchor = new GPoint(pars.markerico[1] / 2, pars.markerico[2]);

//				icon.shadow = pars.markericos[0];
//				icon.shadowSize = new GSize(pars.markericos[1], pars.markericos[2]);

//				icon.infoWindowAnchor = new GPoint(pars.markerico[1] / 2, 0);
// //			icon.infoShadowAnchor = new GPoint(18, 25);

//			mopt.icon = icon;

			mopt.icon = {

				url: this.opt.markerico[0],

				size: new google.maps.Size(this.opt.markerico[1], this.opt.markerico[2]),

				origin: new google.maps.Point(0,0),

				anchor: new google.maps.Point(this.opt.markerico[1] / 2, this.opt.markerico[2])
			};
		}

//		var marker = new GMarker(c, mopt);

		// map.addOverlay(marker);

		// if (pars.html)
		//	marker.openInfoWindowHtml(pars.html);

		var marker = new google.maps.Marker(mopt);

		if (this.opt.html) {

			var cnt = $("<div>" + this.opt.html + "</div>").css('max-width', '350px');

			//	var infowindow = new google.maps.InfoWindow({
			//		content: cnt.get(0),
			//		maxWidth: 350
			//	});

			setTimeout(function() {

				me.openInfoWindow(cnt.get(0), marker);

			}, 1000);

			google.maps.event.addListener(marker, 'click', function() {
				me.openInfoWindow(cnt.get(0), marker);
			});
		}
	}
};

fjs.gMaps.map.prototype.openInfoWindow = function(content, where) {

	this.closeInfoWindow();

	this.infoWindow = new google.maps.InfoWindow({

		content: content,
		maxWidth: 350
	});

	var me = this;
	google.maps.event.addListener(this.infoWindow, 'closeclick', function() {
		this.infoWindow = null;
	});

	this.infoWindow.open(this.map, where);
};

fjs.gMaps.map.prototype.closeInfoWindow = function() {

	if (this.infoWindow !== null) {

		this.infoWindow.close();

		this.infoWindow = null;
	}
};
	// accesso all'inventory delle mappe

//fjs.gMaps.getMap = function(id) { return fjs.gMaps.sMaps[ id ]; };

	// accesso al geocoding

fjs.gMaps.sGeocoder = fjs.gMaps.sGeocoder || null;

fjs.gMaps.getGeocoder = function() {

	if (! fjs.gMaps.sGeocoder)
		fjs.gMaps.sGeocoder = new google.maps.Geocoder();

	return fjs.gMaps.sGeocoder;
};

// fjs.gMaps.GetAddressPoint = function(a, cb) {

//	fjs.gMaps.GetGeocoder().getLatLng(a, cb);
// };

fjs.gMaps.getFormattedAddressByLatLng = function(lat, lng, cb) {

	return fjs.gMaps.getAddressByPoint(new google.maps.LatLng(lat, lng), cb);
};

fjs.gMaps.getFormattedAddressByPoint = function(point, cb) {

	fjs.gMaps.getGeocoder().geocode({ latLng: point }, function(results, status) {

//$.each(results, function() { console.log(this.formatted_address); });

		if (status == google.maps.GeocoderStatus.OK)
			if (results[0])
				cb(results[0].formatted_address);

		cb(null); // error / not found
	});
};

fjs.gMaps.getPointByAddress = function(a, cb) {

    fjs.gMaps.getGeocoder().geocode( { 'address': a }, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK)
			cb(results[0].geometry.location);

		cb(null); // error / not found
	});
};

	//
	// funzioni per la gestione dei marker
	//

fjs.gMaps.sMarkers = fjs.gMaps.sMarkers || {};

	// inventory dei marker

// fjs.gMaps.addMapMarker = function(map, marker, m) { if (! fjs.gMaps.sMarkers[ map ]) fjs.gMaps.sMarkers[ map ] = {}; fjs.gMaps.sMarkers[ map ][ marker ] = m; };
// fjs.gMaps.getMapMarker = function(map, marker) { if (fjs.gMaps.sMarkers[ map ]) return fjs.gMaps.sMarkers[ map ][ marker ]; };

