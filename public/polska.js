$(document).ready(function() {
	function makeMarker(curLayer, lat, lon, content){
		var marker = L.marker([lon, lat]);
		marker.bindPopup(content, {
			showOnMouseOver: true
		});
		marker.on('mouseover', function (e) {
			this.openPopup();
		});
		marker.on('mouseout', function (e) {
			this.closePopup();
		});
		curLayer.addLayer(marker);
	}
	function proc(){
		var query = $('#inpname').val().replace(/'/g, '’').trim();
		if (query === ''){
			return;
		} 
		$.post("data.json", {q:query}, function(data, textStatus) { makeRequest(data)}, "json");
	}
	function makeRequest(data) {
		markersLayer.clearLayers();
		var isMapped = false;
		if (typeof data !== 'undefined' && data.length > 0) {
			$.each(data, function(index,i) {
				alldata = data;
				if (String(i.lat).length > 1 && String(i.lon).length > 1) {
					isMapped  = true;
					makeMarker(markersLayer, i.lon, i.lat, i.name + ', ' + i.sub_type);
				}
			});
			if (isMapped){mymap.fitBounds(markersLayer.getBounds(), {padding: [10, 10]}); }
		}
	}

	var ht = $(window).height()-$('#overview').height()-$('footer').height()-50;
	// console.log(ht);
	$("#mapid").height(ht);
	$("#mapid").width($('#copyright').width());
	var mymap = L.map('mapid').setView([52.92, 21], 6);
	
	mymap.scrollWheelZoom.disable();

	L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 14, minZoom: 6, attribution: "© <a href='//openstreetmap.org/'>OpenStreetMap</a>" }).addTo(mymap);

	var markersLayer = new L.FeatureGroup();
    mymap.addLayer(markersLayer);

	$("#inpname").on('keyup', function (e) {
		if (e.keyCode == 13) {
			proc();
		}
	});
	$('.proc').click(function(){
		proc();
	});
	 $("#inpname").focus();
});
