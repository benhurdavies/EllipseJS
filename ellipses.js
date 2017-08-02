'use strict';

var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

var Coord = function (lon, lat) {
    this.lon = lon;
    this.lat = lat;
    this.x = D2R * lon;
    this.y = D2R * lat;
};

Coord.toDegrees = function (Rad) {
    return Rad * R2D;
}

Coord.toRadians = function (Deg) {
    return Deg * D2R;
}

Coord.prototype.getAngle = function(nextCoord){
  var angleRad = Math.atan((nextCoord.y-this.y)/(nextCoord.x-this.x));
  var angleDeg =Coord.toDegrees(angleRad);
  return(angleDeg);
}

Coord.geoMidPoint = function (point1, point2) {
    var lat1 = point1.lat, lon1 = point1.lon, lat2 = point2.lat, lon2 = point2.lon;

    var dLon = Coord.toRadians(lon2 - lon1);

    //convert to radians
    lat1 = Coord.toRadians(lat1);
    lat2 = Coord.toRadians(lat2);
    lon1 = Coord.toRadians(lon1);

    var Bx = Math.cos(lat2) * Math.cos(dLon);
    var By = Math.cos(lat2) * Math.sin(dLon);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
    var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return new Coord(Coord.toDegrees(lon3), Coord.toDegrees(lat3))
}

Coord.midPoint=function(point1, point2){
    var radPoint=[(point1.x+point2.x)/2,(point1.y+point2.y)/2]
    return new Coord(Coord.toDegrees(radPoint[0]),Coord.toDegrees(radPoint[1]));
}

Coord.distanceRadian = function (point1, point2) {
    var a = point1.x - point2.x;
    var b = point1.y - point2.y;

    var c = Math.sqrt(a * a + b * b);
    return c;
}

Coord.prototype.view = function () {
    return String(this.lon).slice(0, 4) + ',' + String(this.lat).slice(0, 4);
};

Coord.prototype.antipode = function () {
    var anti_lat = -1 * this.lat;
    var anti_lon = (this.lon < 0) ? 180 + this.lon : (180 - this.lon) * -1;
    return new Coord(anti_lon, anti_lat);
};

var LineString = function () {
    this.coords = [];
    this.length = 0;
};

LineString.prototype.move_to = function (coord) {
    this.length++;
    this.coords.push(coord);
};

//https://www.uwgb.edu/dutchs/Geometry/HTMLCanvas/ObliqueEllipses5.HTM
function Ellipse(_start, _end, adjust) {
    debugger;
    var start = new Coord(_start[0], _start[1]);
    var end = new Coord(_end[0], _end[1]);
    var mid = Coord.midPoint(start, end);

    var dx = end.lon - start.lon;
    var dy = end.lat - start.lat;
    var _rotation = Math.atan2(dy, dx);

    var radiusX =Coord.distanceRadian(start, end) / 2;// Semi-major axis length - km
    var radiusY = .3;   // Semi-minor axis length -km 
    var xCent = mid.x;
    var yCent = mid.y;
    var rotation =_rotation;// start.getAngle(end)+180;
    var list = [];

    for (var i = 0; i < Math.PI; i += .01) {
        var xPos = xCent + ((radiusX * Math.cos(i) * Math.cos(rotation))
            - (radiusY * Math.sin(i) * Math.sin(rotation)));
        var yPos = yCent + ((radiusX * Math.cos(i) * Math.sin(rotation))
            + (radiusY * Math.sin(i) * Math.cos(rotation)));
        list.push([Coord.toDegrees(xPos), Coord.toDegrees(yPos)])
    };

    //list.push([end.lon,end.lat]);

    return list;
}