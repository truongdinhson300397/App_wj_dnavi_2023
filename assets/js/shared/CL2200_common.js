var GoogleMapForEvent = function (target) {
  var gghelper = new GoogleMapHelper('#googlemap');
  this.googleKey = gghelper.googleKey;
  this.moveGoogleMapEvent = function (prefecture, city, address1) {
    prefecture = prefecture || "";
    city = city || "";
    address1 = address1 || "";
    var address = prefecture + city + address1;
    gghelper.moveGoogleMap(address);
  };
};
