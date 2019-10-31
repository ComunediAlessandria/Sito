window.fjs = window.FlexJS || {};

fjs.gLoci = window.fjs.gLoci || {};

fjs.gLoci.glObject = Class.extend({

	init: function(p, opt) {

		this.pars = p;
		this.opt = opt;
	},

	getData: function() {

		return this.pars;
	},

	getGLatLng: function() {

		return new google.maps.LatLng(this.pars.lat, this.pars.lng);
//		return new GLatLng(this.pars.lat, this.pars.lng);
	},

		// funzione che restituisce la descrizione di un elemento
		// e che viene inserita all'interno dell'elenco

	getDescription: function() {},

		// funzione chiamata dopo il caricamento del
		// pannello per l'editing in modo che l'oggetto
		// possa popolare i campi

	onLoad: function() {},

//		// funzione che viene chiamata al caricamento di ogni widget
//		// (le widget possono essere caricate in modo asincrono)
//
//	onWidgetLoad: function(n, w) {},

		// funzione chiamata al termine del caricamento della mappa

	onMapLoad: function(map) {},

		// funzione chiamata all'atto del salvataggio
		// degli elementi

	onUnload: function() {},

		// ottiene il marker per la visualizzazione dell'elemento sulla mappa

	marker: function(opt) {}
});

fjs.gLoci.glObject.getInstance = function(data, opt) {

	switch (data.kind) {

		case 1: return new fjs.gLoci.glObjectPoint(data, opt);
	}
};

fjs.gLoci.glObject.getDataArray = function(a) {

	var data = [];
	for (var i = 0; i < a.length; i++)
		data.push(a[i].getData());

	return data;
};

fjs.gLoci.glObjectPoint = fjs.gLoci.glObject.extend({

	getDescription: function() {

		return this.pars.title[ this.opt.lang ] ? this.pars.title[ this.opt.lang ] : __('jgle.pco', this.pars.lat, this.pars.lng);
	},

	getTitle: function() { return this.pars.title[ this.opt.lang ]; },
	getLink: function() { return this.pars._page; },

	onLoad: function() {

		this.map = null;
		this.marker = null;

		this.pars = $.extend({}, {
			marker: 's:default.png:20:34',
			markerh: 's:default.png:20:34',
			markerc: 's:default.png:20:34',
			title: {},
			text: {}
		}, this.pars);

		var me = this;
		fjs.Loader.LoadJS([
				'js/jq/FlexJS.ui.ImageDropdown.js',
				'modules/lib/select2-3.4.4/select2.min.js'
			],
			function() {

//				fjs.Ajax.get('gloci/markers/', function(data) {

					function format(state) {

						if (! state.id)
							return '<div style=\'padding: 5px; margin: 0 -27px 0 -11px; color: white; background-color: #7272E4; \'>' + state.text + '</div>'; // optgroup

							// $k . ':' . $fn . ':' . $s[0] . ':' . $s[1]

						return "<div style='padding: 4px;'><img class='gLociDropdownIcon' src='" + state.text + "'/>" + state.id.split(':')[1] + "</div>";
					}

					$('#mk, #mkh, #mkc').select2({
						containerCssClass: 'zzz',
						minimumResultsForSearch: -1,
						formatResult: format,
						formatSelection: format,
						escapeMarkup: function(m) { return m; }
					});

					$('#mk')
						.select2('val', me.pars.marker)
						.on('change', function(e) {

							me.onRefresh('mk', e.val);
						})
                    ;
					$('#mkh').select2('val', me.pars.markerh);
					$('#mkc').select2('val', me.pars.markerc);

					$('.zzz a').css('height', $('#mk').data('height'));

//						var w = new fjs.ui.ImageDropdown('#mk', {
//							elements: data.html,
//							onSelect: function() { me.onRefresh('mk', w); }
//						});

//						w.setValue(me.pars.marker);

//						var wh = new fjs.ui.ImageDropdown('#mkh', {
//							elements: data.html
//	//						onSelect: function() { me.onRefresh('mk', w); }
//						});

//						wh.setValue(me.pars.markerh);

//						var wc = new fjs.ui.ImageDropdown('#mkc', {
//							elements: data.html
//	//						onSelect: function() { me.onRefresh('mk', w); }
//						});

//						wc.setValue(me.pars.markerc);
//				});
			}
		);

		$('#tt').val(this.pars.title[ this.opt.lang ]);
		$('#gLociDesc').val(this.pars.text[ this.opt.lang ]);

		$('#lat').val(this.pars.lat);
		$('#lng').val(this.pars.lng);

//		$('input[id=dj]').attr('checked', this.pars['dj']);
//		$('#lk').attr('checked', this.pars.lk);
		$('#lk').prop('checked', this.pars.lk);

		if (this.pars.ck)
			$('#ck').val(this.pars.ck);

			// aggiunge il gestore per la ricerca
			// per indirizzo

		var doLookup = function() {

			var a = $('#addr').val();

			fjs.gMaps.getPointByAddress(a, function(point) {

				if (point) {

					$('#lat').val(point.lat());
					$('#lng').val(point.lng());

					me.setMarker();
				}
			});

			return false;
		};

		$('#as').click(doLookup);

		$('#addr').on('keyup', function(e) { if (e.keyCode === 13) return doLookup(); });
	},

//	onWidgetLoad: function(n, w) {
//
//		w.setValue(this.pars['marker']);
//	},

	onMapLoad: function(map) {

		this.map = map;

//			map.addControl(new GSmallZoomControl());
//			map.addControl(new GMapTypeControl());
//	//		map.addControl(new GSmallMapControl());

		map.setOptions({

			mapTypeId: google.maps.MapTypeId.ROADMAP,

			mapTypeControl: true,

			zoomControl: true,
			zoomControlOptions: { style: google.maps.ZoomControlStyle.DEFAULT, position: google.maps.ControlPosition.RIGHT_BOTTOM },

			scaleControl: true,
			scaleControlOptions: { style: google.maps.ScaleControlStyle.DEFAULT },
		});

			// se ho un punto valorizzato lo posiziona sulla mappa

		var
			lat = this.pars.lat,
			lng = this.pars.lng
		;

		if (typeof(lat) != 'undefined' && typeof(lng) != 'undefined') {

			this.setMarker(true);

		} else {

				// centro la mappa sul punto di partenza

			var
				sp = this.opt.mapcenter,
//				p = new GLatLng(sp[0], sp[1])
				p = new google.maps.LatLng(sp[0], sp[1])
			;

			map.panTo(p);
		}

		var me = this;
		// GEvent.addListener(map, 'click', function(overlay, point) {

		//		if (overlay) {

		//			// map.removeOverlay(overlay);

		//		} else if (point) {

		//			$('#lat').val(point.y);
		//			$('#lng').val(point.x);

		//			me.setMarker(true);
		//		}
		//	});

		google.maps.event.addListener(map, 'click', function(e) {

			$('#lat').val(e.latLng.lat());
			$('#lng').val(e.latLng.lng());

			me.setMarker(true);
		});

	},

	onUnload: function() {

		var l = this.opt.lang;

		this.pars.title[ l ] = $('#tt').val();
		this.pars.text[ l ] = $('#gLociDesc').val();

		this.pars.lat = $('#lat').val();
		this.pars.lng = $('#lng').val();

		this.pars.addr = $('#addr').val();

//		this.pars['dj'] = $('#dj').val() == 'on';
		this.pars.lk = $('#lk').prop('checked'); //.val() == 'on';
		this.pars.ck = $('#ck').val();

		// var w = fjs.ui.getWidget('mk');
		// this.pars.marker = w.getValue();

		this.pars.marker = $('#mk').select2('val');

		// var wc = fjs.ui.getWidget('mkc');
		// this.pars.markerc = wc.getValue();

		this.pars.markerc = $('#mkc').select2('val');

		// var wh = fjs.ui.getWidget('mkh');
		// this.pars.markerh = wh.getValue();

		this.pars.markerh = $('#mkh').select2('val');
	},

	onRefresh: function(name, v) {

		this.pars.marker = v;
		this.setMarker();
	},

		// inserisce nella mappa un marker nella posizione
		// indicata e con l'icona eventualmente selezionata

	setMarker: function(geolocate) {

		var
			lat = $('#lat').val(),
			lng = $('#lng').val()
		;

		if (lat !== '' && lng !== '') {

			var
				//map = fjs.gMaps.getMap('gmap'),
				point = new google.maps.LatLng(lat, lng)
			;

			//var marker = fjs.gMaps.getMapMarker('gmap', 'M');
			if (this.marker !== null)
				this.marker.setMap(null);

//				map.removeOverlay(marker);

			//	var mopt = {

			//		bouncy: true
			// };

		var mopt = {
			position: point,
			map: this.map,

			animation: google.maps.Animation.DROP,
			optimized: false,

			icon: this.fnToMarker(this.pars.marker),

			//		// - rect: coords is [x1,y1,x2,y2] where x1,y1 are the coordinates of
			//		// the upper-left corner of the rectangle and x2,y2 are the coordinates
			//		// of the lower-right coordinates of the rectangle.

			//	shape: {
			//		coord: [0, 0, 20, 20],
			//		type: 'rect'
			//	}
		};

//			mopt.icon = /*icon*/ this.fnToMarker(this.pars.marker);

			//	marker = new GMarker(point, mopt);
			//	map.addOverlay(marker);

		this.marker = new google.maps.Marker(mopt);

		//	fjs.gMaps.addMapMarker('gmap', 'M', marker);

				// sposta il centro della mappa

		this.map.panTo(point);

			if (geolocate) {

				fjs.gMaps.getFormattedAddressByPoint(point, function(address) {

					if (address !== null)
						$('#addr').val(address);
				});

//					fjs.gMaps.GetGeocoder().getLocations(point, function(addresses) {

//						if (addresses.Status.code != 200) {

//	//						var msg = 'Errore nel caricamento dei dati. Prego, riprovare.<br /><br />'
//	//							+ 'LAT: ' + point.y + '  LONG: ' + point.x;

//						} else {

//								// considera il primo indirizzo

//							var address = addresses.Placemark[0];

//							$('#addr').val(address.address);
//						}
//					});
			}
		}
	},

	marker: function(opt) {

		// var mopt = {

		//	bouncy: true,
		// };

		var mopt = {

			position: new google.maps.LatLng(this.pars.lat, this.pars.lng),

			animation: google.maps.Animation.DROP,
			optimized: false, // altrimenti click non funziona

			title: this.pars.title[ this.opt.lang ]
		};

			// gestione della visualizzazione del punto in una pagina
			//
			// perché venga evidenziato è necessario che:
			//
			// (1) la pagina di elencazione sia la stessa visualizzata
			// (2) siamo in un elemento di elencazione (esiste _inpage)
			// (3) sia definita un icona
			// (4) sia diversa da quella del punto

		/*jslint laxbreak: true */
		var mname;
		if (
			this.pars.markerc
			&& this.pars._inpage
			&& this.pars._inpage == this.pars.page
			&& this.isMarkerSet(this.pars.markerc)
			&& this.pars.marker != this.pars.markerc
		)
			mname = this.pars.markerc;
		else
			mname = this.pars.marker;

		mopt.icon = this.fnToMarker(mname);
		// mopt.shape = {
		//			coord: [0, 0, 27, 27],
		//			type: 'rect'
		//		};

		var marker = new google.maps.Marker(mopt);

		var me = this;
		if (this.pars.ck !== 'none') {

			google.maps.event.addListener(marker, 'click', function() {

				if (me.pars.ck === 'open') {

						// determina la prima lingua in modo che se non ho definizione
						// per la lingua corrente usi quella

					for (var l in me.pars.title)
						break;

					l = me.pars.title[ me.opt.lang ] ? me.opt.lang : l;

					var tplpars = {
						title: me.pars.title[ l ],
						text: me.pars.text[ l ].replace(/\n/g, '<br />'),
						pageurl: me.pars._page
					};

					// var cnt = $("<div><h3>" + me.pars.title[ l ] + '</h3><div>' + me.pars.text[ l ].replace(/\n/g, '<br />') + "</div></div>")
					// 	.css('max-width', '350px')
					// ;

					var cnt = me.uTemplate(opt.tpl || '<div><h3>{[title]}</h3><div>{[text]}</div></div>', tplpars);
					// 	.css('max-width', '350px')
					// ;

						// class='if-show-link'
						// class='if-hide-link'

					cnt.find(me.pars.lk ? '.if-hide-link' : '.if-show-link').remove();

					marker.mapHandler.openInfoWindow(cnt.get(0), marker);

				} else if (me.pars.ck === 'jump' && me.pars._page)
					window.location = me.pars._page;
			});
		}

			// gestione dell'hover

		if (
			this.pars.markerh
			&& this.isMarkerSet(this.pars.markerh)
			&& this.pars.marker !== this.pars.markerh
		) {

				// se ho specificato un'immagine per l'hovering devo cambiare al
				// volo l'immagine associata all'icona (e non l'icona stessa)

			this._m = this.fnToSrc(mname);
			this._mh = this.fnToSrc(this.pars.markerh);

			google.maps.event.addListener(marker, 'mouseover', function () {

				marker.setIcon(me._mh);
			});

			google.maps.event.addListener(marker, 'mouseout', function () {

				marker.setIcon(me._m);
			});
		}

		return marker;
	},

		// microtemplating

	uTemplate: function(cnt, data) {

		return $(cnt.replace(/{\[(\w+)]}/g, function(m, p) {

			return data[p];
		}));
	},

		// dato un marker codificato crea il marker stesso
		//
		// <kind>:<filename>:<width>:<height>

	fnToMarker: function(m) {

		var
//			icon = new GIcon(),
			parts = m.split(':'),
			w = parseInt(parts[2], 10),
			h = parseInt(parts[3], 10)
		;

		// icon.image = fjs.AppConfigure.Get(parts[0] == 's' ? 'kBaseURL' : 'kDataURL') + 'TemplatesUSR/assets/gLoci/markers/' + parts[1];

		// icon.iconSize = new GSize(parts[2], parts[3]);
		// icon.iconAnchor = new GPoint(parts[2] / 2, parts[3]);

		// icon.infoWindowAnchor = new GPoint(parts[2] / 2, 0);

		// return icon;

		return {

			url: fjs.AppConfigure.Get(parts[0] === 's' ? 'kBaseURL' : 'kDataURL') + 'TemplatesUSR/assets/gLoci/markers/' + parts[1],

			size: new google.maps.Size(w, h),

			//origin: new google.maps.Point(0, 0),

			anchor: new google.maps.Point(w / 2, h)
		};
	},

	fnToSrc: function(m) {

		var parts = m.split(':');

		return fjs.AppConfigure.Get(parts[0] === 's' ? 'kBaseURL' : 'kDataURL') + 'TemplatesUSR/assets/gLoci/markers/' + parts[1];
	},

	isMarkerSet: function(m) { return m.substr(2, 11) !== 'default.png'; }
});
