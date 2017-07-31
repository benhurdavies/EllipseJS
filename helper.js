
function Helper() {

}

Helper.transformCoordinates = function (lat, lon) {
    return ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
}

Helper.getMapPoint=function(latLng,_map){
    return new OpenLayers.LonLat( latLng[1] ,latLng[0] )
          .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            _map.getProjectionObject() // to Spherical Mercator Projection
          );
}