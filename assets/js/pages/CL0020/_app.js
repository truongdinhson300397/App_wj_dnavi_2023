$(function () {
  let partner = string2literal(decodeURIComponent(globalInfo('partner_name')))
  $('.app-contents').addClass(partner ? 'reduce-space-with-partner' : 'reduce-space')

  if(isUserLoggedIn()) {
    $('.login-content').remove()
  } else {
    $('.smart-checkin').remove()
  }
})

function dumpReservedEvents(events) {
  var $eventUl = $('#reserved-events .event-ul');
  $eventUl.empty();
  if (_.isEmpty(events)) {
    return $eventUl.append('<p>表示するイベント予約はありません。</p>');
  }
  var _formatedEvents = _formatEvents(_.cloneDeep(events));

  var eventLimit = 4;
  var counter = 1;

  _formatedEvents.forEach(function (event) {
    event.event_dates.forEach(function (eventDate) {
      if (counter > eventLimit) return;
      counter++;
      var _eventDate = moment(eventDate.event_date, 'YYYY-MM-DD');
      var _eventTimeFrom = moment(eventDate.event_time_from, 'HH:mm:ss');
      var _eventTimeTo = moment(eventDate.event_time_to, 'HH:mm:ss');
      var $eventLi = $('<a href="' + link.eventDetail + '?event_id=' + event.event_id + '">' +
        '             <li class="event-ul-li">' +
        '              <div class="event-info-box">' +
        '                <div class="locAndDate">' +
        '                  <div class="event-loc">' + event.prefecture + '</div>' +
        '                  <div class="event-dateday"><span class="event-date">' + _eventDate.format('MM/DD') + '</span><span class="event-day">' + _eventDate.format('ddd').toUpperCase() + '</span></div>' +
        '                </div>' +
        '                <div class="event-time">' + _eventTimeFrom.format('HH:mm') + ' 〜 ' + _eventTimeTo.format('HH:mm') + '</div>' +
        '                <div class="event-ttl">' + event.title + '</div>' +
        '              </div>' +
        '              <div class="event-btn-box">' +
        '                <p>></p>' +
        '              </div>' +
        '            </li>' +
      '             </a>');
      $eventUl.append($eventLi);
    });
  });
  $eventUl.find('.event-ul-li').each(function (index, li) {
    var $eventLi = $(li);
    if (index === 0) {
      $eventLi.addClass('upper-row');
    } else if (index === 1) {
      $eventLi.addClass('upper-row-pc');
    } else {/*do not thing*/
    }
  });
}

function dumpSpareBox(spareBoxes) {
  if (_.isEmpty(spareBoxes)) {
    return $('#spare-boxes').remove();
  }
  var $spareBoxDiv = $('#spare-boxes');
  spareBoxes.forEach(function (box) {
    var _contents = box.contents || '';
    if (typeof isApplican !== "undefined" && isApplican) {
      _contents = convertLinkToWebviewLink(_contents);
    }
    var _imageName = box.image_name || '';
    var _image = box.image_url ? '<img src="' + box.image_url + '" class="dummy-img" alt="' + _imageName + '"> ' : '';
    var _boxDiv = '<div class="contents-box">' +
      '        <article class="article-box">' +
      '            <header class="article-box-header">' +
      '              <h2 class="article-box-header-h2">' +
      '                <span class="article-box-header-h2-jp">' + box.title + '</span>' +
      '              </h2>' +
      '            </header>' +
      '            <div class="article-box-body spare-box spare-box-horizontal">' +
      _image +
      '             <p class="line-break"> ' + _contents + '</p>' +
      '            </div>' +
      '        </article>' +
      '      </div>';
    $spareBoxDiv.append(_boxDiv);
  });
}
