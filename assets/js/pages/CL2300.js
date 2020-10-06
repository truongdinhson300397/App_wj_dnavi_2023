_headerUIHandler(null, null, true);
var urlHelpers = new UrlHelper();
var event_id = urlHelpers.getParamByName('event_id');

// For ASURA
var forAsura = urlHelpers.getParamByName('eventOf') === 'ASURA';
var stepId = urlHelpers.getParamByName('step_id');
var asuraCompanyId = urlHelpers.getParamByName('asura_company_id');
var registrantId = urlHelpers.getParamByName('asura_student_id');
var eventHeldDateId = parseInt(urlHelpers.getParamByName('event_held_date_id'));
var contractTermId = globalInfo("contract_term_id");
var global = {
  jwt: globalInfo('jwt_' + contractTermId),
  userId: globalInfo('id_' + contractTermId),

  baseApiUrl: rootVariables.apiUrl
};

var http = new Http(global.baseApiUrl);

$(function () {
  fetchBookedEvent();
  fetchCurrentUser();
});

function printCard() {
  window.print();
}

function _emptyEvent() {
  var $epmty = $('<p>There is no event matched</p>');
  $('.article-box-body').html('');
  $('.article-box-body').append($epmty);
}

function _getEventsDetailFromAsura() {
  return $.ajax({
    url: apiUrlAsura + '/outside_events/get_event_detail',
    dataType: 'json',
    type: 'POST',
    contentType: 'application/json',
    accept: 'application/json',
    data: JSON.stringify({
      asura_company_id: asuraCompanyId,
      asura_student_id: registrantId,
      step_id: stepId,
      event_held_date_id: eventHeldDateId
    }),
    processData: false
  });
}

function fetchBookedEvent(query) {
  query = query || null;
  if (forAsura) {
    _getEventsDetailFromAsura().done(function (_res) {
      if (!stepId || !registrantId) {
        _emptyEvent();
        return null;
      }
      dumpEventData(_refactorEventForAsura(_res.response));
    });
  } else {
    if (!event_id || !global.userId) {
      _emptyEvent();
      return null;
    }
    var url = '/events/' + event_id;

    function fetchSuccess(res) {
      dumpEventData(filterBookedEvent(res.data));
    }

    http.fetchOne(url, query, global.jwt, fetchSuccess, null, false);
  }
}

function _refactorEventForAsura(_events) {
  var eventDates = [];
  _.forEach(_events.eventHeldVenues[0].eventHeldDates, function (__eventDate) {
    _.forEach(__eventDate.eventHeldTimezones, function (__eventTime) {
      if (__eventTime.studentStatus.value === 1) {
        eventDates.push({
          event_date: __eventDate.heldDate,
          event_time_from: __eventTime.eventTimezone.fromTime,
          event_time_to: __eventTime.eventTimezone.toTime,
          target: '',
          studentStatus: __eventTime.studentStatus
        });
      }
    });
  });

  var addr = _events.eventHeldVenues[0].address;
  return {
    title: _events.event_name,
    event_dates: eventDates,
    place_name: _events.eventHeldVenues[0].placeName,
    address: addr.pref + addr.city + addr.town + addr.banchi + addr.building + addr.zip
  };
}

function fetchCurrentUser(query) {
  query = query || null;
  var url = '/students/' + global.userId + '/me';

  function fetchSuccess(res) {
    var user = res.data;
    dumpUserData(user);
    generateQRCode(user);
  }

  http.fetchOne(url, query, global.jwt, fetchSuccess, null, false);

}

function generateQRCode(user) {
  var qrElem = $('#qrScreen');

  var rawName = user.family_name + user.given_name;
  var userInfo = '{"id":' + parseInt(user.id) + ',"email":"' + user.login_id + '","code":"QRCodeDiamond","name":"' + rawName + '"}';
  var typeNumber = 0;
  var errorCorrectionLevel = 'L';
  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(userInfo);
  qr.make();
  qrElem.append(qr.createImgTag(7));
  qrElem.find('img').addClass('intro-qr-img').removeAttr('height');
}

function filterBookedEvent(event) {
  var eventDates = event.event_dates;
  if (eventDates && Array.isArray(eventDates)) {
    var result = eventDates.filter(function (eventDate) {
      return !(_.isEmpty(eventDate.event_user));
    });

    if (_.isEmpty(result)) {
      _emptyEvent();
      return null;
    }
    // overwrite the event_dates with related to logined-user.
    event.event_dates = result;
    return event;
  }
}

function dumpUserData(user) {
  // user name
  var kanjiName = user.family_name + ' ' + user.given_name;
  var kanaName = user.family_name_kana + ' ' + user.given_name_kana;
  $('[data-api="user_name"]').text(kanjiName + ' / ' + kanaName);

  // university dept type
  $('[data-api="user_university_dept_type"]').text(user.university_type + ' / ' + user.department_type);

  // university dept
  $('[data-api="user_university_dept"]').text(user.university + ' / ' + user.department + ' / ' + user.section);

  // graduation date
  moment.locale('ja');
  var graduationDate = moment(user.graduation_year + '-' + user.graduation_month, 'YYYY-M');
  $('[data-api="user_graduation_date"]').text(graduationDate.format('YYYY年MM月'));

  // user location
  var userLocation = '';
  var postCode = user.postcode.substring(0, 3) + "-" + user.postcode.substring(3, 7);
  var homePostCode = user.home_postcode.substring(0, 3) + "-" + user.home_postcode.substring(3, 7);

  if(_.isNull(user.address_line2)) {
    userLocation = '<span> 〒' + postCode + '</span>' +
      '<br/>' +
      '<span>' + user.prefecture + ' ' + user.city + ' ' + user.address_line1 + '</span>';
  } else {
    userLocation = '<span> 〒' + postCode + '</span>' +
      '<br/>' +
      '<span>' + user.prefecture + ' ' + user.city + ' ' + user.address_line1 + '</span>' +
      '<br/>' +
      '<span>' + user.address_line2 + '</span>';
  }

  $('[data-api="user_location"]').html(userLocation);

  // phone 1
  $('[data-api="user_phone_1"]').text(user.mobile);

  // phone 2
  $('[data-api="user_phone_2"]').text(user.tel);

  // email 1
  $('[data-api="user_email_1"]').text(user.email1);

  // email 2
  $('[data-api="user_email_2"]').text(user.email2);

  // hometown contact
  var homeContact = '';
  if(user.is_same_address) {
    userLocation = userLocation + '<br/>' + (user.home_tel ? user.home_tel : '');
    homeContact = userLocation;
  } else {
    homeContact = '<td> 〒' + homePostCode +
      '<br/>' + user.home_prefecture + ' ' + (user.city_name_home ? user.city_name_home : '')  + ' ' + (user.home_address_line1 ? user.home_address_line1 : '') +
      '<br/>' + (user.home_address_line2 ? user.home_address_line2 : '') +
      '<br/>' + (user.home_tel ? user.home_tel : '') +
      '</td>';
  }

  $('[data-api="user_hometown_contact"]').html(homeContact);

}

function dumpEventData(event) {
  if (_.isEmpty(event)) {
    return;
  }
  // title
  $('[data-api="event_title"]').text(event.title);

  // time
  event.event_dates.forEach(function (eventDate, index) {
    var eventYYMM = moment(eventDate.event_date, 'YYYY-MM-DD');
    var timeFrom = moment(eventDate.event_time_from, 'HH:mm:ss');
    var timeTo = moment(eventDate.event_time_to, 'HH:mm:ss');
    var eventDateTimeBlock = '<div class="intro-event-detail-dateday"> ' + eventYYMM.format('YYYY') +
      ' <span class="event-detail-info-date">' + eventYYMM.format('MM/DD') + '</span>' +
      '<span class="event-detail-info-day">' + eventYYMM.format('ddd').toUpperCase() + '</span>' +
      '</div> <div class="intro-event-detail-time">' + timeFrom.format('HH:mm') + '〜 ' + timeTo.format('HH:mm') +
      '</div>';
    if (index === 0) {
      $('[data-api="event_datetime"]').html(eventDateTimeBlock);
    } else {
      var $el = $('<dd data-api="event_datetime">' + eventDateTimeBlock + '</dd>');
      $('[data-api="event_datetime"]').last().after($el);
    }
  });

  // placename
  $('[data-api="event_place"]').text(event.place_name);

  // address
  var address = event.address ? event.address : event.prefecture + event.place_city + event.place_address1 +
    (event.place_address2 ? event.place_address2 : '');
  $('[data-api="event_address"]').text(address);

  // target
  if (forAsura) {
    $('#event_date_target_wrapper').hide();
    $('[data-api="event_date_target"]').hide();
  } else {
    event.event_dates.forEach(function (eventDate) {
      $('[data-api="event_date_target"]').text(eventDate.target);
    });
  }
}
