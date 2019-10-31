
window.fjs = window.FlexJS || {};

fjs.gLoci = window.fjs.gLoci || {};

	// gestione dell'editing: viene usato un campo hidden che contiene le definizioni
	// dei luoghi in formato JSON

fjs.gLoci.viewer = function(datael, opt) {

	this.key = datael;

	this.del = $(datael);

	this.opt = $.extend({}, {

		cluster: false,
		clusteropt: {},

		forcecenter: false

	}, opt);

	this.lang = opt.lang;
	this.index = opt.index;

	this.mapHdl = this.opt.mapHandler; //fjs.gMaps.getMap(this.opt.map);

		// dall'array di descrizione ottiene gli oggetti per
		// la gestione

	var data = fjs.Utils.fromJSON( this.del.val() );

	this.loci = [];
	for (var i = 0; i < data.loci.length; i++)
		this.loci[i] = fjs.gLoci.glObject.getInstance(data.loci[i], this.opt);

	this.mtpl = data.mtpl;

	if (this.opt.cluster)
		this.clusterer = new fjs.gMaps.Clusterer(this.mapHdl, this.opt.clusteropt);

	this.attach();
};

fjs.gLoci.viewer.prototype.attach = function() {

	fjs.gLoci.register(this);

	var bounds = new google.maps.LatLngBounds();

	for (var i = 0; i < this.loci.length; i++) {

		var
			el = this.loci[i],
			marker = el.marker({
				tpl: this.mtpl
			})
		;

		marker.mapHandler = this.mapHdl;
		if (this.opt.cluster) {

			this.clusterer.addMarker(marker, el.getTitle(), el.getLink());

		} else
			marker.setMap(this.mapHdl.map);

		bounds.extend(el.getGLatLng());
	}

	if (! this.opt.forcecenter) {

		this.mapHdl.map.fitBounds(bounds);

		this.mapHdl.map.setZoom(Math.min(this.mapHdl.map.getZoom(), this.opt.mapzoom));

	} else {

		this.mapHdl.map.setCenter({ lat: this.opt.mapcenter[0], lng: this.opt.mapcenter[1] });

		this.mapHdl.map.setZoom(this.opt.mapzoom);
	}
};

fjs.gLoci.viewer.prototype.setCenter = function() {

	if (! this.opt.forcecenter) {

		var bounds = new google.maps.LatLngBounds();

		for (var i = 0; i < this.loci.length; i++)
			bounds.extend(this.loci[i].getGLatLng());

		this.mapHdl.map.fitBounds(bounds);

		this.mapHdl.map.setZoom(Math.min(this.mapHdl.map.getZoom(), this.opt.mapzoom));

	} else {

		this.mapHdl.map.setCenter({ lat: this.opt.mapcenter[0], lng: this.opt.mapcenter[1] });

		// this.mapHdl.map.setZoom(this.opt.mapzoom);
	}
};

	// registry

fjs.gLoci.i = {};
fjs.gLoci.register = function(i) { fjs.gLoci.i[ i.key ] = i; };
fjs.gLoci.getInstance = function(k) { return fjs.gLoci.i[ k ] ? fjs.gLoci.i[ k ] : null; };
fjs.gLoci.getInstanceAtPosition = function(i) {

	var ka = $.map(fjs.gLoci.i, function(v, k) { return k; });

	return ka[i] ? fjs.gLoci.getInstance(ka[i]) : null;
};
