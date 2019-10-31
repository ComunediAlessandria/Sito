window.FlexJS = window.FlexJS || {};

FlexJS.gLoci = window.FlexJS.gLoci || {};

FlexJS.gLoci.glObject = Class.extend({

	init: function(p, opt) {

		this.pars = p;
		this.opt = opt;
	},

	getData: function() {

		return this.pars;
	},

	getGLatLng: function() {

		return new GLatLng(this.pars.lat, this.pars.lng);
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

		// visualizzazione dell'elemento sulla mappa

	view: function(/* map */) {}
});

FlexJS.gLoci.glObject.getInstance = function(data, opt) {

	switch (data.kind) {

		case 1: return new FlexJS.gLoci.glObjectPoint(data, opt);
	}
};

FlexJS.gLoci.glObject.getDataArray = function(a) {

	var data = [];
	for (var i = 0; i < a.length; i++)
		data.push(a[i].getData());

	return data;
};

FlexJS.gLoci.glObjectPoint = FlexJS.gLoci.glObject.extend({

	getDescription: function() {

		var t = this.pars.title[ this.opt.lang ] ? this.pars.title[ this.opt.lang ] : 'Punto di coordinate: [' + this.pars.lat + ', ' + this.pars.lng + ']';

		return t;
	},

	getTitle: function() { return this.pars.title[ this.opt.lang ]; },
	getLink: function() { return this.pars._page; },

	onLoad: function() {

		this.pars = jQuery.extend({}, {
			marker: 's:default.png:20:34',
			markerh: 's:default.png:20:34',
			markerc: 's:default.png:20:34',
			title: {},
			text: {}
		}, this.pars);
/*
console.log(this.pars);
this.pars['title']['it'] = 'test';
this.pars.text.it = 'test';
console.log(this.pars);

			// default per il marker

		if (! this.pars['marker'])
			this.pars['marker'] = 's:default.png:20:34';
*/

		var me = this;
		FlexJS.Loader.LoadJS(
			'js/jq/FlexJS.ui.ImageDropdown.js',
			function() {

				FlexJS.Ajax.get('gloci/markers/', function(data) {

					var w = new FlexJS.ui.ImageDropdown('#mk', {
						elements: data.html,
						onSelect: function() { me.onRefresh('mk', w); }
					});

					w.setValue(me.pars.marker);

					var wh = new FlexJS.ui.ImageDropdown('#mkh', {
						elements: data.html
//						onSelect: function() { me.onRefresh('mk', w); }
					});

					wh.setValue(me.pars.markerh);

					var wc = new FlexJS.ui.ImageDropdown('#mkc', {
						elements: data.html
//						onSelect: function() { me.onRefresh('mk', w); }
					});

					wc.setValue(me.pars.markerc);
				});
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

		$('#as').click(function() {

			var a = $('#addr').val();

			FlexJS.GMaps.GetAddressPoint(a, function(point) {

				if (point) {

					$('#lat').val(point.y);
					$('#lng').val(point.x);

					me.setMarker();
				}
			});

			return false;
		});
	},

//	onWidgetLoad: function(n, w) {
//
//		w.setValue(this.pars['marker']);
//	},

	onMapLoad: function(map) {

		map.addControl(new GSmallZoomControl());
		map.addControl(new GMapTypeControl());
//		map.addControl(new GSmallMapControl());

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
				p = new GLatLng(sp[0], sp[1])
			;

			map.panTo(p);
		}

		var me = this;
		GEvent.addListener(map, 'click', function(overlay, point) {

			if (overlay) {

				// map.removeOverlay(overlay);

			} else if (point) {

				$('#lat').val(point.y);
				$('#lng').val(point.x);

				me.setMarker(true);
			}
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

		var w = FlexJS.ui.getWidget('mk');
		this.pars.marker = w.getValue();

		var wc = FlexJS.ui.getWidget('mkc');
		this.pars.markerc = wc.getValue();

		var wh = FlexJS.ui.getWidget('mkh');
		this.pars.markerh = wh.getValue();
	},

	onRefresh: function(name, w) {

		this.pars.marker = w.getValue();
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
				map = FlexJS.GMaps.GetMap('gmap'),
				point = new GLatLng(lat, lng)
			;

			var marker = FlexJS.GMaps.GetMapMarker('gmap', 'M');
			if (marker)
				map.removeOverlay(marker);

			var mopt = {

				bouncy: true
			};
/*
//			var w = FlexJS.ui.getWidget('mk');
//			if (w && w.getValue() != null) {

					// s:<filename>:<width>:<height>

				var parts = this.pars.marker.split(':');

				var icon = new GIcon();

				icon.image = FlexJS.AppConfigure.Get(parts[0] == 's' ? 'kBaseURL' : 'kDataURL') + 'TemplatesUSR/assets/gLoci/markers/' + parts[1];

				icon.iconSize = new GSize(parts[2], parts[3]);
				icon.iconAnchor = new GPoint(parts[2] / 2, parts[3]);

				icon.infoWindowAnchor = new GPoint(parts[2] / 2, 0);

				mopt.icon = icon;
//			}
*/
			mopt.icon = /*icon*/ this.fnToMarker(this.pars.marker);

			marker = new GMarker(point, mopt);
			map.addOverlay(marker);

			FlexJS.GMaps.AddMapMarker('gmap', 'M', marker);

				// sposta il centro della mappa

			map.panTo(point);

			if (geolocate) {

				FlexJS.GMaps.GetGeocoder().getLocations(point, function(addresses) {

					if (addresses.Status.code != 200) {

//						var msg = 'Errore nel caricamento dei dati. Prego, riprovare.<br /><br />'
//							+ 'LAT: ' + point.y + '  LONG: ' + point.x;

					} else {

							// considera il primo indirizzo

						var address = addresses.Placemark[0];

						$('#addr').val(address.address);
					}
				});
			}
		}
	},

	view: function(/* map */) {

		var mopt = {

			bouncy: true,
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

		var marker = new GMarker(new GLatLng(this.pars.lat, this.pars.lng), mopt);

		var me = this;
		if (this.pars.ck !== 'none') {

			GEvent.addListener(marker, 'click', function(pt) {

				if (me.pars.ck === 'open') {

						// determina la prima lingua in modo che se non ho definizione
						// per la lingua corrente usi quella

					for (var l in me.pars.title)
						break;

					l = me.pars.title[ me.opt.lang ] ? me.opt.lang : l;

					marker.openInfoWindowHtml(
						me.pars.title[ l ] + '<br />' + me.pars.text[ l ].replace(/\n/g, '<br />')
					);

				} else if (me.pars.ck === 'jump') {

					location.replace(me.pars._page);
				}
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

			GEvent.addListener(marker, 'mouseover', function() {

				marker.setImage(me._mh);
			});

			GEvent.addListener(marker, 'mouseout', function() {

				marker.setImage(me._m);
			});
		}

		// map.addOverlay(marker);

		return marker;
	},

		// dato un marker codificato crea il marker stesso
		//
		// <kind>:<filename>:<width>:<height>
		//
		// TBD (in realtà restituisce un'incona)

	fnToMarker: function(m) {

		var
			icon = new GIcon(),
			parts = m.split(':')
		;

		icon.image = FlexJS.AppConfigure.Get(parts[0] == 's' ? 'kBaseURL' : 'kDataURL') + 'TemplatesUSR/assets/gLoci/markers/' + parts[1];

		icon.iconSize = new GSize(parts[2], parts[3]);
		icon.iconAnchor = new GPoint(parts[2] / 2, parts[3]);

		icon.infoWindowAnchor = new GPoint(parts[2] / 2, 0);

		return icon;
	},

	fnToSrc: function(m) {

		var parts = m.split(':');

		return FlexJS.AppConfigure.Get(parts[0] == 's' ? 'kBaseURL' : 'kDataURL') + 'TemplatesUSR/assets/gLoci/markers/' + parts[1];
	},

	isMarkerSet: function(m) { return m.substr(2, 11) != 'default.png'; }
});
