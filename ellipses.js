'use strict';

var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

var Coord = function (lon, lat) {
    this.lon = lon;
    this.lat = lat;
    this.x = D2R * lon;
    this.y = D2R * lat;
};

Coord.toDegrees = function (angle) {
    return angle * R2D;
}

Coord.toRadians = function (angle) {
    return angle * D2R;
}

Coord.midPoint = function (point1, point2) {
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

var Arc = function (properties) {
    this.properties = properties || {};
    this.geometries = [];
};

Arc.prototype.json = function () {
    if (this.geometries.length <= 0) {
        return {
            'geometry': { 'type': 'LineString', 'coordinates': null },
            'type': 'Feature', 'properties': this.properties
        };
    } else if (this.geometries.length == 1) {
        return {
            'geometry': { 'type': 'LineString', 'coordinates': this.geometries[0].coords },
            'type': 'Feature', 'properties': this.properties
        };
    } else {
        var multiline = [];
        for (var i = 0; i < this.geometries.length; i++) {
            multiline.push(this.geometries[i].coords);
        }
        return {
            'geometry': { 'type': 'MultiLineString', 'coordinates': multiline },
            'type': 'Feature', 'properties': this.properties
        };
    }
};

// TODO - output proper multilinestring
Arc.prototype.wkt = function () {
    var wkt_string = '';
    var wkt = 'LINESTRING(';
    var collect = function (c) { wkt += c[0] + ' ' + c[1] + ','; };
    for (var i = 0; i < this.geometries.length; i++) {
        if (this.geometries[i].coords.length === 0) {
            return 'LINESTRING(empty)';
        } else {
            var coords = this.geometries[i].coords;
            coords.forEach(collect);
            wkt_string += wkt.substring(0, wkt.length - 1) + ')';
        }
    }
    return wkt_string;
};

//https://www.uwgb.edu/dutchs/Geometry/HTMLCanvas/ObliqueEllipses5.HTM
function Ellipse(_start, _end, adjust) {
    var start = new Coord(_start[0], _start[1]);
    var end = new Coord(_end[0], _end[1]);
    var mid = Coord.midPoint(start, end);

    var radiusX = Coord.distanceRadian(start, end) / 2;// Semi-major axis length - km
    var radiusY = .1  // Semi-minor axis length -km 
    var rot = 125 //Rotation


    var xCent = mid.x;
    var yCent = mid.y;
    var rotation = 45;
    var list = [];

    for (var i = 0; i < 2 * Math.PI; i += .1) {
        var xPos = xCent + ((radiusX * Math.cos(i) * Math.cos(rotation))
            - (radiusY * Math.sin(i) * Math.sin(rotation)));
        var yPos = yCent + (radiusY * Math.sin(i));
        list.push([Coord.toDegrees(xPos), Coord.toDegrees(yPos)])
    };

    //list.push([end.lon,end.lat]);

    return list;
}