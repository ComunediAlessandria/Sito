
window.FlexJS = window.FlexJS || {};

FlexJS.gLoci = window.FlexJS.gLoci || {};

	// gestione dell'editing: viene usato un campo hidden che contiene le definizioni
	// dei luoghi in formato JSON

FlexJS.gLoci.Viewer = function(datael, opt) {

	this.del = $(datael);

	this.opt = jQuery.extend({}, {

		cluster: false,
		clusteropt: {}

	}, opt);

	this.lang = opt.lang;
	this.index = opt.index;

	this.map = FlexJS.GMaps.GetMap(this.opt.map);

		// dall'array di descrizione ottiene gli oggetti per
		// la gestione

	var data = FlexJS.Utils.fromJSON( this.del.val() );

	this.loci = [];
	for (var i = 0; i < data.loci.length; i++)
		this.loci[i] = FlexJS.gLoci.glObject.getInstance(data.loci[i], this.opt);

	if (this.opt.cluster)
		this.clusterer = new FlexJS.GMaps.Clusterer(this.map, this.opt.clusteropt);

	this.attach();
};

FlexJS.gLoci.Viewer.prototype.attach = function() {
/*
	var bounds = new GLatLngBounds();

	var m = [];
	for (var i = 0; i < this.loci.length; i++) {

		var
			el = this.loci[i],
			marker = el.view()
		;

		m.push(marker);

		bounds.extend(el.getGLatLng());
	}

	this.map.setCenter(bounds.getCenter());

	var zl = this.map.getBoundsZoomLevel(bounds);
	this.map.setZoom(Math.min(zl, this.opt.mapzoom));


	this.clusterer.addMarkers(m);
	this.clusterer.fitMapToMarkers();
	return;
*/

	var bounds = new GLatLngBounds();

	for (var i = 0; i < this.loci.length; i++) {

		var
			el = this.loci[i],
			marker = el.view(/*this.map*/)
		;

		if (this.opt.cluster) {

			this.clusterer.AddMarker(marker, el.getTitle(), el.getLink());

		} else
			this.map.addOverlay(marker);

		bounds.extend(el.getGLatLng());
	}

	this.map.setCenter(bounds.getCenter());

	var zl = this.map.getBoundsZoomLevel(bounds);
	this.map.setZoom(Math.min(zl, this.opt.mapzoom));
};