var id = globalInfo('id_' + contractTermId);
var jwt = globalInfo('jwt_' + contractTermId);

$(function() {
  _headerUIHandler(null, null, true);

  if (typeof isApplican !== "undefined" && isApplican && !isOnline()) {
    __getCurentUserOffline();
  } else {
    __getCurentUser();
  }
})

function __getCurentUser() {
  $.ajax({
    url: apiUrl + '/students/' + id + '/me',
    type: 'get',
    headers: {
      'Authorization': 'Bearer ' + jwt,
      'Content-Type': 'application/json'
    },
    success: function (data) {
      __generateUserQRCode(data);
      $('.step1').append(__generateUserInfo(data));
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log(errorThrown);
      console.log(textStatus);
      console.log(XMLHttpRequest);
    }
  });
}

function __getCurentUserOffline() {
  var userData = getUserDataForQR();
  var logo = $('<span class="offline__' + contractTerm + '_logo"></span>')
    .css('margin-bottom', '10px')
  $('#header').append(logo);
  if (userData !== false) {
    var data = {};
    data.data = userData;
    __generateUserQRCode(data);
    $('.drop-shadow-box').append(__generateUserInfo(data));
  } else {
    console.log(errorThrown);
    console.log(textStatus);
    console.log(XMLHttpRequest);
  }
}

function __generateUserInfo(data) {
  var userName = data['data']['family_name'] + ' ' + data['data']['given_name'];
  var loginID = data['data']['login_id'];

  return (
    '<div class="mgnt30-50 talc">' + userName + '<br />' + loginID + '</div>'
  );
}

function __generateUserQRCode(data) {
  var rawName = data['data']['family_name'] + data['data']['given_name'];
  var userInfo = '{"id":' + parseInt(id) + ',"email":"' + data['data']['login_id'] + '","code":"QRCodeDiamond","name":"' + rawName + '"}';
  var typeNumber = 0;
  var errorCorrectionLevel = 'L';
  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(userInfo);
  qr.make();
  $('#qr-code').append(qr.createImgTag(7));
}
