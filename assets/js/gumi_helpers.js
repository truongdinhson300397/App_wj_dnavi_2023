function UrlHelper(url) {
  url = url || window.location.href;
  this.url = url;
  this.getParamByName = function (name, url) {
    if (!url) url = this.url;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  this.objectToQueryString = function (o) {
    if (typeof (o) === 'object' && o != null) {
      var arrs = Object.keys(o).map(function (key) {
        if (key && o[key] != null) {
          return key.toString().trim() + '=' + o[key].toString().trim();
        }
        return key.toString().trim() + '=';
      });
      return arrs.join('&');
    }
    return null;
  };
}

function Http(baseUrl) {
  this.baseUrl = baseUrl;
  this.fetchAll = function (url, query, jwt, sucFn, errFn, isFullUrl) {
    url = _.isEmpty(query) ? url : url + '?' + query;
    $.ajax({
      url: isFullUrl ? url : this.baseUrl + url,
      dataType: 'json',
      type: 'GET',
      headers: {
        Authorization: 'Bearer ' + jwt,
        contentType: 'application/json',
        accept: 'application/json'
      },
      success: function (_res) {
        if (typeof (sucFn) === 'function') {
          sucFn(_res);
        }
      },
      error: function (jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
        $('.alert-box').show();

        if (typeof (errFn) === 'function') {
          errFn();
        }
      }
    });
  };
  this.fetchOne = function (url, query, jwt, sucFn, errFn, isFullUrl) {
    url = _.isEmpty(query) ? url : url + '?' + query;
    $.ajax({
      url: isFullUrl ? url : this.baseUrl + url,
      dataType: 'json',
      type: 'GET',
      headers: {
        Authorization: 'Bearer ' + jwt,
        contentType: 'application/json',
        accept: 'application/json'
      },
      success: function (_res) {
        if (typeof (sucFn) === 'function') {
          sucFn(_res);
        }
      },
      error: function (jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
        $('.alert-box').show();

        if (typeof (errFn) === 'function') {
          errFn();
        }
      }
    });
  };
  this.updateOne = function (url, data, query, jwt, sucFn, errFn, isFullUrl) {
    url = _.isEmpty(query) ? url : url + '?' + query;
    $.ajax({
      url: isFullUrl ? url : this.baseUrl + url,
      dataType: 'json',
      type: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      data: JSON.stringify(data),
      success: function (_res) {
        if (typeof (sucFn) === 'function') {
          sucFn(_res);
        }
      },
      error: function (jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
        $('.alert-box').show();

        if (typeof (errFn) === 'function') {
          errFn();
        }
      }
    });
  };
}

function clearZipCode(prefix) {
  prefix = prefix === undefined ? "" : prefix;
  // Clear prefecture
  $('#' + prefix + 'prefecture_name').val("").removeClass('error');
  $('#' + prefix + 'prefecture_id').val("").removeClass('error');

  // Clear city
  $('#' + prefix + 'city_name').val("").removeClass('error');
  $('#' + prefix + 'city_id').val("").removeClass('error');
}

function InputHelper() {
  this.preventNonNumericalInput = function (e, input, length) {
    // Check to clear prefecture and city
    var inputId = e.target.id;
    if(inputId.includes("zip")) {
      var prefix = inputId.includes("home_") ? "home_" : "";
      clearZipCode(prefix);
    }

    e = e || window.event;
    var value = input.value;
    // keycode = 48 is button 0
    // keycode = 57 is button 9
    // keycode = 187 is button +
    // keycode = 189 is button -
    // keycdoe = 101 is button e -> math symbol
    // keycdoe = 69 is button e -> char
    if (value.length >= length && e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode === 187 || e.keyCode === 189 || e.keyCode === 101 || e.keyCode === 69) {
      e.preventDefault();
    }

    // remove non-numerical input
    var charCode = (e.which) ? e.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return e.preventDefault();
  };

  this.validateKana = function ($input) {
    var re = /^[ァ-ンｧ-ﾝﾞﾟ0-9０-９ー\-\\s・、。]+$/;
    return re.test($input.val());
  };

  this.validateKanji = function ($input) {
    var re = /^[ぁ-んァ-ン！：／一-龠。・、￥\\s]+$/;
    return re.test($input.val());
  };
}


function GoogleMapHelper(target) {
  // target is string for example : #id or .class
  this.googleKey = 'AIzaSyBfM9pDjqNI4vYarFRvyeeXGmJ-O59FHgc';
  this.gmap = new GMaps({
    div: target,
    lat: 0,
    lng: 0
  });
  this.moveGoogleMap = function (address) {
    var _self = this;
    GMaps.geocode({
      address: address,
      callback: (function (results, status) {
        if (status === 'OK') {
          var latlng = results[0].geometry.location;
          var latitude = latlng.lat();
          var longitude = latlng.lng();
          this.gmap.refresh(true);
          this.gmap.removeMarkers();
          this.gmap.addMarker({
            lat: latitude,
            lng: longitude
          });
          this.gmap.setCenter(latitude, longitude);
        }
      }).bind(_self)
    });
  };
  this.refresh =  function (reload) {
    return this.gmap.refresh(reload);
  };
  this.removeMarkers = function () {
    return this.gmap.removeMarkers();
  };
  this.addMarker = function (options) {
    return this.gmap.addMarker(options);
  };
  this.setCenter = function (latitude, longitude) {
    return this.gmap.setCenter(latitude, longitude);
  };
};



