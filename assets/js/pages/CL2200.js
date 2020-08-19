var urlHelper = new UrlHelper();
var ggmapEvent;
if (isOnline()) {
  ggmapEvent = new GoogleMapForEvent();
} else {
  $('#googlemap').hide();
}
var event_id = urlHelper.getParamByName('event_id');
var eventFrom = urlHelper.getParamByName('event_from');

var trimStr = trimStr; //trimStr function from general.js

// For ASURA
var forAsura = urlHelper.getParamByName('eventOf') === 'ASURA';
var stepId = parseInt(urlHelper.getParamByName('step_id'));
var asuraCompanyId = parseInt(urlHelper.getParamByName('asura_company_id'));
var eventDateId = parseInt(urlHelper.getParamByName('event_held_date_id'));
var contractTermId = globalInfo('contract_term_id');
// var isShowBtnAsura = '';
// var dayNow = moment(new Date(), 'YYYY/MM/DD').tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');

var contractTermId = globalInfo("contract_term_id");
var global = {
  jwt: globalInfo('jwt_' + contractTermId),
  userId: globalInfo('id_' + contractTermId),
  registrantId: null,
  baseApiUrl: rootVariables.apiUrl,
  choosenEventDateId: null,
  choosenEventId: null,
  eventTimes: {
    total: [],
    canBook: [],
    booked: [],
    full: [],
    outOfDate: [],
    comingSoon: []
  }
};
var http = new Http(global.baseApiUrl);
var offlineData;
var partnerId = globalInfo('partner_id');
function _emptyEvent() {
  var $empty = $('<p>There is no event matched</p>');
  $('.article-box').html('');
  $('.article-box').append($empty);
}
if (typeof isApplican !== "undefined" && isApplican) {
  document.addEventListener('deviceready', function () {
    offlineData = new OfflineData(id, jwt, partnerId);
    _headerUIHandler(logined, guest, false);
  });
} else {
  $(function () {
    _headerUIHandler(logined, guest, false);

    // listen
  });
}

function logined() {
  // check if asura event then check
  // if this user had registrant_id yet and update to global.registrantId
  if (forAsura) {
    isLoginedAsura().done(function (asuraUserData) {
      var asuraUser = asuraUserData.data;
      if (asuraUser) {
        var registrant_id = string2literal(asuraUser.registrant_id);
        if (registrant_id) {
          global.registrantId = registrant_id;
        }
      }
      commonAction();
    });
  } else {
    commonAction();
  }
}

function guest() {
  commonAction();
}

function commonAction() {
  fetchEvent();
  goToBookDetail();
}

function isLoginedAsura() {
  return $.ajax({
    url: global.baseApiUrl + '/students/' + global.userId + '/is_asura_student_new',
    dataType: 'json',
    type: 'GET',
    headers: {
      Authorization: 'Bearer ' + global.jwt,
      ContentType: 'application/json',
      Accept: 'application/json'
    },
    data: {
      e2r_pro_id: asuraCompanyId
    }
  });
}


function _refactorEventDateTime(event) {
  var _eventDates = null;
  if (event && !_.isEmpty(event.event_dates)) {
    _eventDates = _.groupBy(event.event_dates, function (date) {
      return date.event_date;
    });
    return event.event_dates = _eventDates;
  }
  return null;
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
      asura_student_id: global.registrantId,
      step_id: stepId,
      event_held_date_id: eventDateId
    }),
    processData: false
  });
}

function fetchEvent(query) {
  query = query || null;
  if (forAsura) {
    if (_.isNull(stepId) && _.isNull(asuraCompanyId)) {
      _emptyEvent();
      return null;
    }

    _getEventsDetailFromAsura().done(function (_res) {
      if (typeof isApplican !== "undefined" && isApplican) {
        offlineData.saveReserves(_res);
      }
      if (Object.keys(_res.response).length === 0 && _res.response.constructor === Object) {
        _emptyEvent();
      } else {
        fetchSuccess(_res);
      }
    });
  } else {
    if (!event_id) {
      _emptyEvent();
      return null;
    }
    // format query to string
    query = urlHelper.objectToQueryString(query);
    if (query == null || query == '') {
      query = 'contract_term_id=' + contractTermId;
    } else {
      query += '&contract_term_id=' + contractTermId;
    }
    var url = '/events/' + event_id;

    function fetchErr() {
      _emptyEvent();
    }
    if (!isOnline()
        && typeof isApplican !== "undefined"
        && isApplican) {
      var eventIdDecoded = +event_id;
      if (!_.isNumber(eventIdDecoded) || _.isNaN(eventIdDecoded)) {
        eventIdDecoded = atob(event_id);
      }
      offlineData.getEvent(eventIdDecoded, function (data) {
        var res = {data: data};
        fetchSuccess(res);
      });
    } else {
      http.fetchOne(url, query, global.jwt, fetchSuccess, fetchErr, false);
    }
  }

  function fetchSuccess(res) {
    // transfer data structure of asura to dnavi
    var event = forAsura ? _refactorEventForAsura(res.response) : res.data;
    if (_.isEmpty(event) || _.isEmpty(event.event_dates)) {
      _emptyEvent();
      return;
    }

    // common for asura and dnavi
    dumpEventData(_.cloneDeep(event));
    filterCase(_.cloneDeep(event));
    dumpReservationDate(_.cloneDeep(event));
    setFloatBtn('reserveBtnBox', 'reserveBtnOuterBox', 'eventDetailBox');
  }
}

// FOR ASURA
function _refactorEventForAsura(_eventAsura) {
  if (_.isEmpty(_eventAsura)) {
    return {};
  }
  var eventRefactored = {};
  var eventDates = [];
  _.forEach(_eventAsura.eventHeldVenues, function (eventHeldVenues) {
  var addresses = eventHeldVenues.address;

  eventRefactored.prefecture = eventHeldVenues.address.pref;
  eventRefactored.addressFromAsura = (_.isNull(addresses.pref) ? '' : addresses.pref) +
  (_.isNull(addresses.city) ? '' : addresses.city) + (_.isNull(addresses.town) ? '' : addresses.town) +
  (_.isNull(addresses.banchi) ? '' : addresses.banchi) + (_.isNull(addresses.building) ? '' :  addresses.building);
  eventRefactored.title = _eventAsura.eventName;
  eventRefactored.place_name = eventHeldVenues.placeName;
  eventRefactored.googlemap = eventHeldVenues.googlemap;
  eventRefactored.summary = _eventAsura.eventDescription;
  eventRefactored.host_name = _eventAsura.companyName;
  eventRefactored.related_events = [];

  _.forEach(eventHeldVenues.eventHeldDates, function (_dates) {
    _.forEach(_dates.eventHeldTimezones, function (_times) {
      var event_user = null;
      // event booked
      if (!_.isUndefined(_times.studentStatus)) {
        event_user = {
          event_date_id: _times.eventTimezone.stepTimezoneId,
          event_id: stepId,
          user_id: global.registrantId,
          entry_status: 1
        };
        if (_times.studentStatus.value === 1) {
          // event is booked
          event_user.participate_status = 1;
        } else if (_times.studentStatus.value === 2) {
          // student is participated in this event
          event_user.participate_status = 2;
        } else {
          event_user = null;
        }
      }

      var _now = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
      var _reserveClose = moment(_dates.reserveClose, 'YYYY/MM/DD HH:mm');
      var _reserveOpen = moment(_dates.reserveOpen, 'YYYY/MM/DD HH:mm');
      var isOutOfDate = false;
      var isComingSoon = false;

      if (moment(_now).isAfter(_reserveClose)) {
        isOutOfDate = true;
      }

      if (moment(_now).isBefore(_reserveOpen)) {
        isComingSoon = true;
      }

      eventDates.push({
        event_date_id: _times.eventTimezone.stepTimezoneId,
        event_time_from: _times.eventTimezone.fromTime,
        event_time_to: _times.eventTimezone.toTime,
        entry_deadline_datetime_from: _dates.reserveOpen, // ok
        entry_deadline_datetime_to: _dates.reserveClose, // ok
        event_date: _dates.heldDate,
        event_user: event_user,
        event_date_available: _times.vacancyFlag.flagNo !== 0, // final
        event_date_full_capacity: _times.vacancyFlag.flagNo === 0, // ok
        out_of_date: isOutOfDate, // > reserveClose
        coming_soon: isComingSoon, //  < reserveOpen
        cancel_deadline_date: _dates.cancelClose
      });
    });
  });
  });
  eventRefactored.event_dates = eventDates;

  // asura event can just book one event date each time, aka dnavi event as entry_restrict = 1
  eventRefactored.entry_restrict = 1;
  return eventRefactored;
}

function dumpEventData(event) {
  // prefecture
  $('[data-api="event_prefecture"]').text(trimStr(event.prefecture));
  // title
  $('[data-api="event_title"]').text(trimStr(event.title));

  // Google map
  $('[data-api="event_place_google_api"]').attr('src', event.googlemap);

  // date-time
  $('[data-api="event_datetime"]').empty();
  var dates = _refactorEventDateTime(_.cloneDeep(event));
  if (dates) {
    _.forEach(dates, function (dateObjs, date) {
      var _eventYYMM = moment(date, 'YYYY-MM-DD');
      var _eventDateTimeBlock = '<div class="event-detail-datetime">' +
        '<span class="event-detail-info-date">' + _eventYYMM.format('MM/DD') + '</span>' +
        '<span class="event-detail-info-day">' + _eventYYMM.format('ddd').toUpperCase() + '</span> <div class="event-detail-info-time">';
      _.forIn(dateObjs, function (dateObj) {
        var _timeFrom = moment(dateObj.event_time_from, 'HH:mm:ss');
        var _timeTo = moment(dateObj.event_time_to, 'HH:mm:ss');
        _eventDateTimeBlock += '<span class="ilb">' + _timeFrom.format('HH:mm') + ' 〜 ' + _timeTo.format('HH:mm') +
          '</span> ';
      });
      // close block
      _eventDateTimeBlock += '</div> </div>';
      $('[data-api="event_datetime"]').append(_eventDateTimeBlock);
    });
  }

  // image
  if (event.image_url) {
    $('[data-api="event_image"]').attr('src', event.image_url);
  } else {
    $('[data-api="event_image"]').hide();
  }

  // summary
  var eventSummary = trimStr(event.summary);
  if (eventSummary) {
    var reLink = new RegExp(/href=(['"])(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})(['"])/gm);
    if (isOnline()) {
      eventSummary = eventSummary.replace(reLink, function (match, g1, g2, g3) {
        return 'href=' + g1 + linkOrWebview(g2) + g3;
      });
    } else {
      eventSummary = eventSummary.replace(reLink, function (match, g1, g2, g3) {
        return 'href=' + g1 + 'javascript:_checkNetWork(true);' + g3;
      });
    }

    $('[data-api="event_summary"]').html(eventSummary);
  }else {
    $('[data-api="event_summary"]').parents('dl').hide();
  }

  if (_.isArray(event.companies) && !_.isEmpty(event.companies)) {
    $("#asura-join-company").show();
    var limit = 5;
    var isReachLimit = false;
    var companyContent = '';
    event.companies.forEach(function (company, index) {
      var _companyDetail = company.company;
      companyContent += '<a href="' + link.companyDetail + '?company_id=' + _companyDetail.company_id + '">' +
        _companyDetail.company_name + '</a><span class="cmp-type-label">' + _companyDetail.industry_type_main +
        '</span><br/>';
      if (index === limit) {
        // every company reach limit then add to hidden block for showing later
        companyContent += '<div id="companiesDivHidden" class="event-div-hidden">';
      }
      if (index > limit) {
        isReachLimit = true;
      }
    });
    // close block
    companyContent += '</div>';
    if (isReachLimit) {
      companyContent += '<a href="javascript:void(0);" class="more" onclick="$(\'#companiesDivHidden\').slideDown();$(this).css(\'display\',\'none\');">more</a>';
    }
    $('[data-api="event_company_list"]').html(companyContent);
  } else {
    $("#asura-join-company").hide();
  }
  // hostname
  $('[data-api="event_hostname"]').text(trimStr(event.host_name));
  // placename
  $('[data-api="event_place"]').text(trimStr(event.place_name));
  // address
  var address = address = _.isUndefined(event.addressFromAsura) ? trimStr(event.prefecture) + trimStr(event.place_city) +
    trimStr(event.place_address1) + trimStr(event.place_address2) : trimStr(event.addressFromAsura);

  $('[data-api="event_address"]').text(address);
  if (isOnline()) {
    // dump google map
    if (forAsura) {
      ggmapEvent.moveGoogleMapEvent(event.addressFromAsura);
    } else if (!_.isEmpty(event.latitude) && !_.isEmpty(event.longitude)) {
      var gghelper = new GoogleMapHelper('#googlemap');
      gghelper.refresh(true);
      gghelper.removeMarkers();
      gghelper.addMarker({
        lat: event.latitude,
        lng: event.longitude,
      });
      // we need make setCenter call after google map init
      setTimeout(function () {
        gghelper.setCenter(event.latitude, event.longitude);
      });
    }
  }
  if (typeof isApplican !== "undefined" && isApplican) {
    $('.btn-open-map').on('click', function () {
      if (applican.device.platform === 'Android') {
        applican.launcher.urlScheme('https://www.google.com/maps/search/?api=1&query=' + event.latitude + ',' + event.longitude + '', function (err) {
          console.log('schema for map error: ', err);
        });
      } else {
        applican.launcher.urlScheme('http://maps.apple.com/?q=' + event.latitude + ',' + event.longitude + '&z=21&t=s', function (err) {
          console.log('schema for map error: ', err);
        });
      }
    });
  }
  // dump children events
  if (!_.isEmpty(event.related_events) || (event.related_events && event.related_events.length > 0)) {
    dumpChildEventData(event.related_events.childrens);
  } else {
    $('.js-children-event-title').css('display', 'none');
    $('.event-ul').css('display', 'none');
  }

  if (forAsura) {
    $('#asura-join-company').hide();
  }
}

function dumpChildEventData(childrenEvents) {
  if (_.isEmpty(childrenEvents)) {
    $('.js-children-event-title').hide();
    $('.event-ul').hide();
  } else {
    $('.js-children-event-title').fadeIn();
    $('.event-ul').fadeIn();
  }


  var $eventUl = $('.js-event-ul');
  $eventUl.html('');
  childrenEvents.forEach(function (event, index) {
    var $eventLi = $('<li class="event-ul-li upper-row">' +
      '              <div class="event-info-box">' +
      '                <div data-api="eventchild_prefecture" class="event-loc">東京</div>' +
      '                <div data-api="eventchild_datetime" class="event-dateday"></div>' +
      '                <div data-api="eventchild_title" class="event-ttl">講演タイトル１</div>' +
      '              </div>' +
      '              <div class="event-btn-box">' +
      '                <a href="' + link.eventDetail + '?event_id=' + event.event_id + '" class="btn-small btn-blue">詳細・予約</a>' +
      '              </div>' +
      '            </li>');
    // prefecture
    $eventLi.find('[data-api="eventchild_prefecture"]').text(trimStr(event.prefecture));
    // title
    $eventLi.find('[data-api="eventchild_title"]').text(trimStr(event.title));

    // datetime
    $eventLi.find('[data-api="eventchild_datetime"]').empty();
    var dates = _refactorEventDateTime(_.cloneDeep(event));
    if (dates) {
      _.forEach(dates, function (dateObjs, date) {
        var _eventYYMM = moment(date, 'YYYY-MM-DD');
        var _eventDateTimeBlock = '<div>' +
          '<span class="event-date">' + _eventYYMM.format('MM/DD') + '</span>' +
          '<span class="event-day">' + _eventYYMM.format('ddd').toUpperCase() + '</span>';
        _.forEach(dateObjs, function (dateObj) {
          var _timeFrom = moment(dateObj.event_time_from, 'HH:mm:ss');
          var _timeTo = moment(dateObj.event_time_to, 'HH:mm:ss');
          _eventDateTimeBlock += '<span class="event-time">' + _timeFrom.format('HH:mm') + ' 〜 ' +
            _timeTo.format('HH:mm') + '</span>';
        });
        // close block
        _eventDateTimeBlock += '</div>';

        $eventLi.find('[data-api="eventchild_datetime"]').append(_eventDateTimeBlock);

      });
    }

    $eventUl.append($eventLi[0]);
  });

}

$(document).on('click', '#js-reserve-ul [data-api="reservation_datetime"]', function (e) {
  var eventSelectButton = $('#modalReservation #js-book-event');
  eventSelectButton.removeClass('btn-white');
  eventSelectButton.removeClass('btn-disabled');
  eventSelectButton.addClass('btn-blue');
});

// book popup
function dumpReservationDate(event) {
  if (_.isEmpty(event) || _.isEmpty(event.event_dates)) return;

  var $reserUl = $('#js-reserve-ul');
  $reserUl.empty();
  event.event_dates.forEach(function (eventDate, index) {
    if (_.includes(global.eventTimes.booked, eventDate.event_date_id)) {
      // if this event time is booked then do not list in pop up
      return;
    }
    var _eventDate = moment(eventDate.event_date, 'YYYY-MM-DD').lang('ja');
    var _timeFrom = moment(eventDate.event_time_from, 'HH:mm:ss');
    var _timeTo = moment(eventDate.event_time_to, 'HH:mm:ss');

    // var _deadlineDateTimeFrom = moment(eventDate.entry_deadline_datetime_from, 'YYYY-MM-DD HH:mm:ss').lang('ja');
    // var _deadlineDateTimeTo = moment(eventDate.entry_deadline_datetime_to, 'YYYY-MM-DD HH:mm:ss').lang('ja');
    var target = eventDate.target;
    var showCapacity = eventDate.show_capacity;

    var _status = '';
    if (_.includes(global.eventTimes.full, eventDate.event_date_id)) {
      _status = '(満席)';
    } else if (_.includes(global.eventTimes.outOfDate, eventDate.event_date_id)) {
      _status = '(締め切り)';
    } else if (_.includes(global.eventTimes.comingSoon, eventDate.event_date_id)) {
      _status = '(受付開始前)';
    } else {
      // //for Asura expired
      // if(forAsura) {
      //   var eventDateAsura = _eventDate.format('YYYY/MM/DD').toUpperCase()+' '+_timeTo.format('HH:mm');
      //   if(dayNow >= eventDateAsura) {
      //     _status = '(締め切り)';
      //   }
      // }
    }
    var dumpTarget = '';
    if (target !== null && !forAsura) {
      dumpTarget = '<div class="reserve-deadline"> 対象：'+ target + '</div>';
    }

    if(!_.isNull(showCapacity) && !forAsura) {
      dumpTarget = dumpTarget + '<div class="reserve-deadline"> 定員：'+ showCapacity +'名</div>';
    }

    var $reserLi = $('<li class="reserve-ul-li">' +
      '              <div class="reserve-datetime">' +
      '               <label class="radio-label">' +
      '                <input data-api="reservation_datetime" type="radio" name="reserve-datetime-radio"/>' +
      _eventDate.format('YYYY年MM月DD日 (ddd)').toUpperCase() + ' ' + _timeFrom.format('HH:mm') + '〜' + _timeTo.format('HH:mm') + ' ' +
      _status +
      '                </label>' +
      '               </div>' + dumpTarget +
      // '              <div class="reserve-deadline"> ' +
      // '                 対象：' + _deadlineDateTimeFrom.format('YYYY年MM月DD日 HH:mm') + ' 〜 ' +
      // _deadlineDateTimeTo.format('YYYY年MM月DD日 HH:mm') + '入社<br/> ' +
      // '               </div>' +
      '            </li>');

    var _$input = $reserLi.find('[data-api="reservation_datetime"]');
    _$input.val(eventDate.event_date_id);
    _$input.after('<span class="radio-span"></span>');
    if (!_.isEmpty(_status)) {
      _$input.attr('disabled', true);
    }
    $reserUl.append($reserLi);
    onBookHandler(_$input, eventDate);
  });
}

function goToBookDetail() {

  $('#js-book-event').on('click', function (e) {
    e.preventDefault();
    var _url = link.eventApply;

    if (forAsura) {
      _url += '?eventOf=ASURA&asura_company_id=' + asuraCompanyId + '&step_id=' + stepId + '&event_date_id=' +
        global.choosenEventDateId + '&event_held_date_id=' + eventDateId + '&asura_student_id=' + global.registrantId;
    } else if (eventFrom === 'admin') {
      _url += '?event_from=admin&event_id=' + global.choosenEventId + '&event_date_id=' + global.choosenEventDateId;
    } else {
      _url += '?event_id=' + global.choosenEventId + '&event_date_id=' + global.choosenEventDateId;
    }

    toLocationHref(_url);
  });
}

function onBookHandler($target, eventDate) {
  $target.on('click', function (e) {
    // e.preventDefault()
    global.choosenEventDateId = eventDate.event_date_id;
    global.choosenEventId = eventDate.event_id;
  });
}

/* show float buttons group
[loginned]
-case:1 none of event time is booked
  + show 1 blue button
-case:2 there is any of event time is booked (ignore unvailable events time or full-book event time)
  + show slider of booked button and 1 blue button for booking others
-case:3 all of event time are full slot
  + show 1 button full
-case:4 all of event time are out of date
  + show 1 button out of date
-case:5 just contain out of date and out of date
  + show nothing
-case:6 all of event time are comming soon
  + show 1 button comingsoon
*/

function _dumpBookedEventButton(event, eventDate) {
  var currentDate = moment(new Date(), 'YYYY-MM-DD').tz('Asia/Tokyo').format('YYYY-MM-DD H:mm');
  var _eventDate = moment(eventDate.event_date, 'YYYY-MM-DD');
  var _timeFrom = moment(eventDate.event_time_from, 'HH:mm:ss');
  var _timeTo = moment(eventDate.event_time_to, 'HH:mm:ss');
  var _target = eventDate.target || '';
  var canCancel = false;
  var isSelfcard = false;
  var isJoined = false;

  // if cancel date is null then always allow cancel
  if (!string2literal(eventDate.cancel_deadline_date)) {
    canCancel = true;
  } else {
    canCancel = moment(eventDate.cancel_deadline_date, 'YYYY-MM-DD H:mm').tz('Asia/Tokyo').isAfter(currentDate);
  }
  // check is selfcard
  if (event.is_selfcard) {
    isSelfcard = true;
  } else if (forAsura) {
    isSelfcard = true;
  }

  if (eventDate && eventDate.event_user && eventDate.event_user.participate_status == 2) {
    isJoined = true;
  }

  var disabledCancel = canCancel ? '' : 'btn-disabled';

  var btnDetail = isSelfcard ? '<a href="' + link.eventProfilecard + '?event_id=' + event.event_id +
    '" class="btn-default singon-btn-flex btn-green btn-first">自己紹介カードを表示</a>' : '';

  // if user is joined this event then hide cancel button
  var btnCancel = !isJoined ? '<a href="javascript:void(0);" class="btn-default singon-btn-flex btn-white js-cancel-booking ' +
    disabledCancel + '" ' +
    'onClick="cancelBooking(' + event.event_id + ',' + eventDate.event_date_id + ', ' + canCancel + ')">' +
    '予約をキャンセル' +
    '</a>' : '';

  if (forAsura) {
    btnDetail = isSelfcard ? '<a href="' + link.eventProfilecard + '?eventOf=ASURA&step_id=' + stepId + '&asura_company_id=' + asuraCompanyId +
      '&event_held_date_id=' + eventDateId + '&asura_student_id=' + global.registrantId +
      '" class="btn-default singon-btn-flex btn-green btn-first">自己紹介カードを表示</a>' : '';

    btnCancel = '<a href="javascript:void(0);" class="btn-default singon-btn-flex btn-white js-cancel-booking ' +
      disabledCancel + '" ' +
      'onClick="cancelBookingAsura(' + eventDate.event_date_id + ', ' + canCancel + ')">' +
      '予約をキャンセル' +
      '</a>';
  }
  var _template = '<li class="swiper-slide">' +
    '              <div class="reserve-btn-box-white">' +
    '              <div class="talc">' + _target + '</div>' +
    '              <div class="talc"><strong>' + _eventDate.format('YYYY年MM月DD日 (ddd)').toUpperCase() + ' ' +
    _timeFrom.format('HH:mm') + '〜' + _timeTo.format('HH:mm') + '</strong></div>' +
    '              <div class="singon-btn-box">' +
      (isOnline() ? (btnDetail +
    btnCancel) : ( isJoined ? '<a href="javascript:void(0);" style="color: white;border: #ccc;" class="btn-default singon-btn-flex btn-white js-cancel-booking btn-disabled">参加済み</a>' : '' )) +
    '              </div>' +
    '            </div>' +
    '           </li>';

  return _template;
}

function dumpFloatButton(logicCase, event) {
  var $reserveBtnBox = $('#reserveBtnBox');
  var _templateBookBtnTemplate = '<li class="book-li"><a href="javascript:void(0);" class="btn-default btn-blue btn-reserve "' +
    '               onclick="showModal(\'modalReservation\')">予約</a></li>';
  var _outOfDateTemplate = '<a href="javascript:void(0);" class="btn-default btn-disabled btn-reserve">受付を締め切りました</a>';
  var _fullTemplate = '<a href="javascript:void(0);" class="btn-default btn-disabled btn-reserve">満席</a>';
  var _comingSoonTemplate = '<a href="javascript:void(0);" class="btn-default btn-disabled btn-reserve">受付開始前</a>';

  switch (logicCase) {
    case 1: {
      $reserveBtnBox.append(_templateBookBtnTemplate);
      break;
    }
    case 2: {
      // when the this event allow 1 user can regist 1 event time each time (event.entry_restrict === 1)
      // or  when there is 1 event_dates
      // then just show booked button instead of slides
      if (event.entry_restrict === 1 || event.event_dates.length === 1) {
        event.event_dates.forEach(function (eventDate, index) {
          if (_.includes(global.eventTimes.booked, eventDate.event_date_id)) {
            var _bookedEventButton = _dumpBookedEventButton(event, eventDate);
            $reserveBtnBox.append(_bookedEventButton);
          }
        });
      } else {
        event.event_dates.forEach(function (eventDate, index) {
          if (_.includes(global.eventTimes.booked, eventDate.event_date_id)) {
            var _bookedEventButton = _dumpBookedEventButton(event, eventDate);
            $reserveBtnBox.append(_bookedEventButton);
          }
        });
        $reserveBtnBox.append(_templateBookBtnTemplate);
      }
      break;
    }
    case 3: {
      $reserveBtnBox.append(_outOfDateTemplate);
      break;
    }
    case 4: {
      $reserveBtnBox.append(_fullTemplate);
      break;
    }
    case 5: {
      $reserveBtnBox.append(_comingSoonTemplate);
      break;
    }
    case 6: {
      // show slide
      $('#float-btn-case-2').removeClass('hidden');
      event.event_dates.forEach(function (eventDate, index) {
        if (_.includes(global.eventTimes.booked, eventDate.event_date_id)) {
          var _bookedEventButton = _dumpBookedEventButton(event, eventDate);
          $('#float-btn-case-2 .js-card-ul').append(_bookedEventButton);
        }
      });
      if (global.eventTimes.booked.length < global.eventTimes.total.length) {
        // there is some event time not book yet
        $reserveBtnBox.append(_templateBookBtnTemplate);
      }

      window.floatBtnCase2Swiper = new Swiper('#float-btn-case-2', {
        observer: true,
        observeParents: true,
        slidesPerView: 'auto',
        loop: true,
        centeredSlides: true,
        spaceBetween: 0,
        speed: 1000,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        breakpoints: {
          1000: {
            slidesPerView: 1
          }
        }
      });
    }

  }
}

function filterCase(event) {
  filterEventTime(event);
  var eventTimes = global.eventTimes;

  // priority comingSoon > full > outOfDate
  if (eventTimes.booked.length == 1) {
    // case 2
    dumpFloatButton(2, event);
  } else if (eventTimes.booked.length > 1) {
    // case 6
    dumpFloatButton(6, event);
  } else if (eventTimes.canBook.length > 0 &&
    eventTimes.outOfDate.length !== eventTimes.total.length &&
    eventTimes.full.length !== eventTimes.total.length &&
    eventTimes.comingSoon.length !== eventTimes.total.length) {
    // case 1
    dumpFloatButton(1);
  } else if (eventTimes.comingSoon.length > 0) {
    // case 5
    dumpFloatButton(5);
  } else if (eventTimes.full.length > 0) {
    // case 4
    dumpFloatButton(4);
  } else if (eventTimes.outOfDate.length > 0) {
    // case 3
    dumpFloatButton(3);
  } else {
    // nothing
  }
}

function filterEventTime(event) {
  event.event_dates.forEach(function (eventDate, index) {
    global.eventTimes.total.push(eventDate.event_date_id);
    if (_.isEmpty(eventDate.event_user) && eventDate.event_date_available === true) {
      global.eventTimes.canBook.push(eventDate.event_date_id);
    } else if (!_.isEmpty(eventDate.event_user)) {
      global.eventTimes.booked.push(eventDate.event_date_id);
    }

    if (eventDate.out_of_date === true) {
      global.eventTimes.outOfDate.push(eventDate.event_date_id);
    } else if (eventDate.event_date_full_capacity === true) {
      global.eventTimes.full.push(eventDate.event_date_id);
    }

    if (eventDate.coming_soon === true) {
      global.eventTimes.comingSoon.push(eventDate.event_date_id);
    }
  });
}

function cancelBooking(event_id, event_date_id, canCancel) {
  canCancel = canCancel || false;
  if (canCancel) {
    var _query = urlHelper.objectToQueryString({
      event_id: event_id,
      event_date_id: event_date_id
    });
    var _url = '/students/' + global.userId + '/cancel_event?' + _query;

    function successFn(res) {
      toLocationHref(link.myPageAppliedEvent);
    }

    http.updateOne(_url, null, _query, global.jwt, successFn, null, false);
  }
}

function cancelBookingAsura(_eventDateId, canCancel) {
  canCancel = canCancel || false;
  if (canCancel) {
    var postDataToAsura = {
      'execInfo': {
        'asura_company_code': asuraCompanyId,
        'asura_student_id': global.registrantId,
        'requestType': 'cancel',
        'reservationInfo': {
          'step_id': parseInt(stepId),
          'step_timezone_id': parseInt(_eventDateId)
        }
      }
    };

    $.ajax({
      url: apiUrlAsura + '/outside/dnavi_entries/entry_procedure',
      dataType: 'json',
      type: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(postDataToAsura),
      success: function (res) {
        toLocationHref(link.myPageAppliedEvent);
      },
      error: function (error, jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  }
}
