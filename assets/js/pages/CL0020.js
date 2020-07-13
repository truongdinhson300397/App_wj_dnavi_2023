var partner = null;
var requestName = window.location.href.replace(window.location.protocol + '//' + window.location.host, '');
var currentPartner = requestName.split(/([0-9]{4})/g).slice(-1)[0].split('/')[1];

if(!_.isUndefined(currentPartner) && !_.isNaN(+currentPartner)) {
  partner = currentPartner;
  globalInfo('partner_id', parseInt(partner) || '', {path: "/"});
} else {
  partner = globalInfo('partner_id');
}

var currentTerm = _.find(term, function (_term) {
  return _term.term === currentContractTerm;
});
var __contractTerm = 1;
if (!_.isUndefined(currentTerm)) {
  __contractTerm = currentTerm.id;
}
// Finish custom contract term

var global = {
  jwt: null,
  userId: null,
  isLogin: false,
  baseApiUrl: rootVariables.apiUrl,
  partner_id: _.isEmpty(globalInfo('partner_id')) ? (_.isEmpty(currentPartner) ? 0 : currentPartner) : parseInt(globalInfo('partner_id')),
  contract_term_id: _.isEmpty(globalInfo('contract_term_id')) ? __contractTerm : parseInt(globalInfo('contract_term_id'))
};
var urlHelper = new UrlHelper();
var http = new Http(global.baseApiUrl);
var partnerId = partner;
var contractTermId = _.isEmpty(globalInfo('contract_term_id')) ? __contractTerm : parseInt(globalInfo('contract_term_id'));
var webDomain = rootVariables.apiUrl;
var arrE2rProId = [];
var prefectureIds = globalInfo('prefecture_ids') ? JSON.parse(globalInfo('prefecture_ids')) : [];

$(function () {
  initPage();

  //ASURA
  if (parseInt(global.partner_id) !== 0 && !_.isUndefined(global.partner_id) && global.partner_id !== '') {
    _getPrefecture();
  } else {
    $('#corporateSeminar-wrapper').hide();
  }

  // dump header layout
  _headerUIHandler(logined, guest);

});

function initPage() {
  // hide default block
  $('#reserved-events').hide();

  // check to hide
  const partnerId = _.isEmpty(globalInfo('partner_id')) ? currentPartner : parseInt(globalInfo('partner_id'));
  if (partnerId && partnerId != null && partnerId != 0) {
    $('#ninkitop-image').hide();
    $('#enquete-image').hide();
    $('.banner-image, .banner-image-2022').hide();
  } else {
    if (contractTermId == 1) {
      $('#ouen-image').show();
      $('.banner-image').show();
    } else if (contractTermId == 2) {
      $('.banner-image-2022').show();
    }
  }


  // Hide current event
  if(global.partner_id === 0) {
    var upperEvent = $(".current-events")["0"];
    $(upperEvent).hide();
  } else {
    var bottomEvent = $(".current-events")["1"];
    $(bottomEvent).hide();
  }
}

function logined() {
  var contractTermId = globalInfo("contract_term_id");
  global.userId = globalInfo('id_' + contractTermId);
  global.jwt = globalInfo('jwt_' + contractTermId);
  $('#reserved-events').show();
  global.isLogin = true;
  fetchData();
}

function guest() {
  global.isLogin = false;
  fetchData();
}

function fetchData() {

  onSearchCompanyImage();
  // fetch data and dump
  fetchContentInformation();
  fetchMainVisual();
  fetchBanner();
  fetchContent();
  fetchSpareBox();
  fetchCurrentEvents();
  fetchNotice();

  fetchCompanyImage();
  fetchCompanyImageTag();
  fetchLiveSeminar();
  fetchPickUp();
  findCompanyLogic();

  //
  if (global.partner_id) {
    // hide disclosure
    $('#disclosure').remove();
  } else {
    fetchAllDisclosure();
  }
  // fetch when logined
  if (global.isLogin) {
    fetchReservedEvents();
  }
}

// information
function dumpContentInformation(infos) {
  // there is always one info in each contract term
  var info = infos[0];
  if (info && !(_.isEmpty(info.contents))) {
    $('[data-api="content_information"]').text(info.contents);
  } else {
    $('#information').remove();
  }

}

function fetchContentInformation(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 4, page: 1};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/contents/informations';

  function fetchSuccess(res) {
    dumpContentInformation(res.data);
  }

  function clearBlock() {
    $('#information').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

// reserved events
function _formatEvents(events) {
  // remove outdate event-date
  if (!events) return;

  var _events = events.filter(function (event) {
    var _event_dates = event.event_dates.filter(function (eventDate) {
      if (_.isEmpty(eventDate) || _.isEmpty(eventDate.event_date)) {
        return false;
      }
      var _eventDate = moment(eventDate.event_date + ' ' + eventDate.event_time_to, 'YYYY-MM-DD HH:mm:ss');
      var _now = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
      if (moment(_now).isAfter(_eventDate)) {
        // event is out of date
        return false;
      } else
        return true;
    });

    if (_.isEmpty(_event_dates)) {
      // if event does not have any fulfill eventdates then remove that event.
      return false;
    }
    event.event_dates = _event_dates;
    return event;
  });
  return _events;

}

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
      var $eventLi = $('<li class="event-ul-li">' +
        '              <div class="event-info-box">' +
        '                <div class="event-loc">' + event.prefecture + '</div>' +
        '                <div class="event-dateday"><span class="event-date">' + _eventDate.format('MM/DD') + '</span><span class="event-day">' + _eventDate.format('ddd').toUpperCase() + '</span></div>' +
        '                <div class="event-time">' + _eventTimeFrom.format('HH:mm') + ' 〜 ' + _eventTimeTo.format('HH:mm') + '</div>' +
        '                <div class="event-ttl">' + event.title + '</div>' +
        '              </div>' +
        '              <div class="event-btn-box">' +
        '                <a href="' + link.eventDetail + '?event_id=' + event.event_id + '" class="btn-small btn-blue">詳細</a>' +
        '              </div>' +
        '            </li>');
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

function fetchReservedEvents(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, status: 1};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/students/' + global.userId + '/booked_events';

  function fetchSuccess(res) {
    dumpReservedEvents(res.data);
  }

  function clearBlock() {
    $('#information').remove();
  }

  http.fetchAll(url, query, global.jwt, fetchSuccess, clearBlock);
}

// main visual
function dumpMainVisual(mainVisuals) {
  if (_.isEmpty(mainVisuals)) {
    return $('#mainVis').remove();
  }
  var $mainVisUl = $('#mainVis .js-main-visual-ul');
  $mainVisUl.empty();
  var formatedMainVisuals = mainVisuals.filter(function (mainVis) {
    return !_.isEmpty(mainVis.image_url);
  });
  formatedMainVisuals.forEach(function (mainVis) {
    var _mainVisLi = '<li class="swiper-slide"><a target="_blank" href="' + mainVis.link_url + '"><img src="' + mainVis.image_url + '" class="img-mainvis" alt=""/></a></li>';
    $mainVisUl.append(_mainVisLi);
  });
  var mainVisSwiper = new Swiper('#mainVis', {
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

function fetchMainVisual(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 4, page: 1};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/contents/main_visual';

  function fetchSuccess(res) {
    dumpMainVisual(res.data);
  }

  function clearBlock() {
    $('#mainVis').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

// LIVE seminar information

function dumpLiveSeminar(events) {
  if (_.isEmpty(events)) {
    return $('#live-seminar').remove();
  }
  var $liveSeminarUl = $('#live-seminar .js-live-seminar-ul');
  $liveSeminarUl.empty();

  var _formatedLiveSeminars = _formatEvents(_.cloneDeep(events));
  var eventLimit = 4;
  var counter = 1;

  _formatedLiveSeminars.forEach(function (event) {
    event.event_dates.forEach(function (eventDate) {
      if (counter > eventLimit) return;
      counter++;
      var _eventDate = moment(eventDate.event_date, 'YYYY-MM-DD');
      var _eventTimeFrom = moment(eventDate.event_time_from, 'HH:mm:ss');
      var _eventTimeTo = moment(eventDate.event_time_to, 'HH:mm:ss');
      var $seminarLi = $('<li class="live-seminar-ul-li upper-row">' +
        '                 <div class="live-seminar-loc">' + event.prefecture + '</div>' +
        '                 <div class="live-seminar-dateday"><span class="live-seminar-date">' + _eventDate.format('MM/DD') + '</span><span' +
        '                    class="live-seminar-day">' + _eventDate.format('ddd').toUpperCase() + '</span>' +
        '                 </div>' +
        '                 <div class="live-seminar-time">' + _eventTimeFrom.format('HH:mm') + '〜' + _eventTimeTo.format('HH:mm') + '</div>' +
        '                 <div class="live-seminar-cmp">' + event.title + '</div>' +
        '                 <a href="' + link.eventDetail + '?event_id=' + event.event_id + '" class="btn-xsmall live-seminar-btn btn-blue">詳細・予約</a>' +
        '               </li>');
      $liveSeminarUl.append($seminarLi);
    });
  });

  $liveSeminarUl.find('.live-seminar-ul-li').each(function (index, li) {
    var $eventLi = $(li);
    if (index === 0) {
      $eventLi.addClass('upper-row');
    } else if (index === 1) {
      $eventLi.addClass('upper-row-pc');
    } else {/*do not thing*/
    }
  });
}

function fetchLiveSeminar(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {
      contract_term_id: global.contract_term_id,
      partner_id: global.partner_id,
      category: 10,
      per_page: 4
    };
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/events';

  function fetchSuccess(res) {
    dumpLiveSeminar(res.data);
  }

  function clearBlock() {
    $('#live-seminar').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

// pickup company

function dumpPickUp(pickups) {
  var $pickupUl = $('#pick-up .js-pickup-ul');
  $pickupUl.empty();
  if (_.isEmpty(pickups)) {
    return $('#pick-up .js-pickup-ul').append('<p>表示する企業はありません。</p>');
  }
  var formatedPickups = pickups.filter(function (pickup) {
    if (_.isEmpty(pickup.company)) {
      return false;
    }
    pickup.company.company_main_visual_image_url = _.isEmpty(pickup.company.company_main_visual_image_url) ? 'img/noimg320.png' : pickup.company.company_main_visual_image_url;
    return pickup;
  });

  if (_.isEmpty(formatedPickups)) {
    return $('#pick-up .js-pickup-ul').append('<p>表示する企業はありません。</p>');
  }

  formatedPickups.forEach(function (pickup, index) {
    var _$li = $('<li class="pickup-ul-li">' +
      '            <a href="/company/detail?company_id=' + pickup.company.company_id + '" class="pickup-ul-li-a"><img src="' + pickup.company.company_main_visual_image_url + '" alt=""/><br/>' + pickup.company.company_name + '</a>' +
      '          </li>');
    if (index + 1 <= 2) {
      _$li.addClass('first-row');
    } else if (index + 1 <= 4) {
      _$li.addClass('second-row');
    }
    $pickupUl.append(_$li);
  });
}

function fetchPickUp(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {
      contract_term_id: global.contract_term_id,
      partner_id: global.partner_id,
      per_page: 12
    };
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/contents/pick_up';

  function fetchSuccess(res) {
    dumpPickUp(_.cloneDeep(res.data));
  }

  function clearBlock() {
    $('#pick-up').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

// find company
function displaySearchCompanyButtons() {
  if (global.partner_id) {
    //show find company btns
    $('#find-company .js-btn-search-prefectures.hidden').removeClass('hidden');
    var jsBtnSearchDetail2 = $('#find-company .js-btn-search-detail-2.hidden');
    var prefectures = globalInfo('prefecture_ids');
    if (_.isString(prefectures)) {
      // example: [1,1]
      // below line means remove [ and ] charater, split it into array and unique filter, after that join it with ','
      prefectures = prefectures.replace(/\[|\]/g, '').split(',').filter(function (value, index, self) {
        return self.indexOf(value) === index;
      }).join(',');
    }
    jsBtnSearchDetail2.attr('href', link.companyList + '?working_place=' + prefectures);
    if (contractTermId != 2) {
      $('#find-company .js-btn-search-detail-2.hidden').removeClass('hidden');
    }
    fetchCompanyEmployeeSize();
  } else {
    fetchAllPrefecture();
    // hide
    $('#find-company .js-btn-search-prefectures:not\(.hidden\)').addClass('hidden');
    $('#find-company .js-btn-search-detail-2:not(.hidden)').addClass('hidden');
  }
}
function findCompanyLogic() {
  // start listen events
  onSearchCompanyKeyword();
  onSearchCompanyFull();
  // fetch
  fetchAllIndustry();
  if (contractTermId != 2) {
    fetchAllJobCategory();
  } else {
    $('.js-job-category-div').remove();
  }
}

function dumpEmployeeSizeSelection(employeeSizes) {
  var $selection = $('[data-api="employee-size"]');
  $selection.empty();
  $selection.append('<option value="">従業員数／職員数</option>');
  employeeSizes.forEach(function (employeeSize) {
    var _$opt = '<option value="' + employeeSize.item_key + '">' + employeeSize.item_value + '</option>';
    $selection.append(_$opt);
  });

  $('.js-employee-size-div.hidden').removeClass('hidden');
}

function fetchCompanyEmployeeSize(query) {
  query = query || null;
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 999999};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/master_data/employees_num_select';

  function fetchSuccess(res) {
    dumpEmployeeSizeSelection(res.data);
  }

  function clearBlock() {
    $('#find-company .js-employee-size-div').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

function onSearchCompanyKeyword() {
  $('#find-company .js-btn-search-keyword').on('click', function (e) {
    e.preventDefault();
    var _url = link.companyList;
    var _kw = $('#find-company .js-keyword-input').val() || null;
    var _paramStr = urlHelper.objectToQueryString({keyword: _kw});
    toLocationHref(_url + '?' + _paramStr);
  });
}

function onSearchCompanyFull() {
  $('#find-company .js-btn-search-full').on('click', function (e) {
    e.preventDefault();
    var _url = link.companyList;
    var _kw = $('#find-company .js-keyword-input').val() || null;
    var _indus = $('#find-company .js-industry-select').val() || null;
    var _categ = $('#find-company .js-category-select').val() || null;
    var _prefe = $('#find-company .js-prefecture-select').val() || null;
    var _emploSz = $('#find-company .js-employee-size-select').val() || null;
    var _fromtop = $('#find-company .js-from-top').val() || 1;

    var _paramObj = {
      keyword: _kw,
      industry_id: _indus,
      job_category: _categ,
      address_prefecture_id: _prefe,
      employee_size: _emploSz,
      from_top: _fromtop
    };
    var _paramStr = urlHelper.objectToQueryString(_paramObj);
    toLocationHref(_url + '?' + _paramStr);
  });
}

// industry
function dumpIndustrySelection(industries) {
  var $selection = $('[data-api="industries"]');
  $selection.empty();
  $selection.append('<option value="">業種</option>');
  industries.forEach(function (industry) {
    var _$opt = '<option value="' + industry.industry_type_for_company_id + '">' + industry.industry_type + '</option>';
    $selection.append(_$opt);
  });
}

function fetchAllIndustry(query) {
  query = query || null;
  if (_.isEmpty(query)) {
    query = {per_page: 999999};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/master_data/industry_types_for_company';

  function fetchSuccess(res) {
    dumpIndustrySelection(res.data);
  }

  function clearBlock() {
    $('#find-company .js-industry-div').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);

}

// prefecture
function dumpPrefectureSelection(prefectures) {
  var $selection = $('[data-api="prefectures"]');
  $selection.empty();
  $selection.append('<option value="">エリア</option>');
  prefectures.forEach(function (prefecture) {
    var _$opt = '<option value="' + prefecture.prefecture_id + '">' + prefecture.prefecture + '</option>';
    $selection.append(_$opt);
  });
  $('.js-prefecture-div.hidden').removeClass('hidden');
}

function fetchAllPrefecture(query) {
  query = query || null;
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 999999};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/master_data/prefectures';

  function fetchSuccess(res) {
    dumpPrefectureSelection(res.data);
  }

  function clearBlock() {
    $('#find-company .js-prefecture-div').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);

}

// job category
function dumpJobCategorySelection(categories) {
  var $selection = $('[data-api="job-categories"]');
  $selection.empty();
  $selection.append('<option value="">職種</option>');
  categories.forEach(function (category) {
    var _$opt = '<option value="' + category.job_category_id + '">' + category.job_category + '</option>';
    $selection.append(_$opt);
  });
}

function fetchAllJobCategory(query) {
  query = query || null;
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 999999};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/master_data/categories';

  function fetchSuccess(res) {
    dumpJobCategorySelection(res.data);
  }

  function clearBlock() {
    $('#find-company .js-job-category-div').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);

}


//current events
function dumpCurrentEvents(events) {
  if (_.isEmpty(events)) {
    return $('.current-events').remove();
  }
  var $eventUl = $('.current-events .js-event-ul');
  $eventUl.empty();

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
      var $eventLi = $('<li class="event-ul-li">' +
        '              <div class="event-info-box">' +
        '                <div class="event-loc">' + event.prefecture + '</div>' +
        '                <div class="event-dateday"><span class="event-date">' + _eventDate.format('MM/DD') + '</span><span class="event-day">' + _eventDate.format('ddd').toUpperCase() + '</span></div>' +
        '                <div class="event-time">' + _eventTimeFrom.format('HH:mm') + ' 〜 ' + _eventTimeTo.format('HH:mm') + '</div>' +
        '                <div class="event-ttl">' + event.title + '</div>' +
        '              </div>' +
        '              <div class="event-btn-box">' +
        '                <a href="' + link.eventDetail + '?event_id=' + event.event_id + '" class="btn-small btn-blue">詳細・予約</a>' +
        '              </div>' +
        '            </li>');
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

function fetchCurrentEvents(query) {
  query = query || null;
  // NOTE: just get event category 20 and 30
  // get default query
  if (_.isEmpty(query)) {
    query = {
      contract_term_id: global.contract_term_id,
      partner_id: global.partner_id,
      per_page: 4,
      category: '20,30'
    };
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/events';

  function fetchSuccess(res) {
    dumpCurrentEvents(res.data);
  }

  function clearBlock() {
    $('.current-events').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

//banner
function dumpBanner(banners) {
  if (_.isEmpty(banners)) {
    return $('#banner').remove();
  }
  var $bannerUl = $('#banner .js-banner-area-ul');
  $bannerUl.empty();

  var formatedbanners = banners.filter(function (banner) {
    return !_.isEmpty(banner.image_url);
  });
  formatedbanners.forEach(function (banner) {
    var _bannerLi = ' <li class="banner-area-ul-li first">' +
      '            <a href="' + banner.link_url + '" class="banner-area-ul-li-a"><img src="' + banner.image_url + '" alt="' + banner.image_name + '"/></a>' +
      '          </li>';
    $bannerUl.append(_bannerLi);
  });
}

function fetchBanner(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 10};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/contents/banner';

  function fetchSuccess(res) {
    dumpBanner(res.data);
  }

  function clearBlock() {
    $('#banner').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

// contents
function _contentUrl(content) {
  content = content || {};
  // if the content requried login and user does not login
  if (parseInt(content.is_login) === 1 && !global.isLogin) {
    globalInfo('returnUrl', content.link_url, {path: "/"});
    return toLocationHref(link.loginUser);
  }

  return window.location = content.link_url;
}

function onContentClick($content, content, _idx) {
  $(document).on('click', '.swiper-slide-' + _idx, function (e) {
    e.stopPropagation();
    _contentUrl(content);
  });
}

function dumpContent(contents) {
  if (_.isEmpty(contents)) {
    return $('#cntBnr').remove();
  }
  var $contentUl = $('#cntBnr .js-content-ul');
  var formatedContents = contents.filter(function (content) {
    return !_.isEmpty(content.image_url);
  });
  formatedContents.forEach(function (content, _idx) {
    var _image = content.image_url ? '<img class="img-contents" src="' + content.image_url + '" />' : '';
    var $_contentLi = $('<li class="swiper-slide swiper-slide-' + _idx + '">');
    $_contentLi.css('cursor', 'pointer');
    var $_contentWithImg = $_contentLi.append(_image);
    $contentUl.append($_contentWithImg);
    onContentClick($_contentLi, content, _idx);
  });
}

function fetchContent(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 4, page: 1};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/contents/contents';

  function fetchSuccess(res) {
    dumpContent(res.data);

    var cntBnrSwiper = new Swiper('#cntBnr', {
      slidesPerView: 'auto',
      loop: false,
      centeredSlides: false,
      spaceBetween: 0,
      speed: 400,
      preventClicks: false,
      preventClicksPropagation: false,
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

  function clearBlock() {
    $('#cncntBnrtBnr').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

//sparebox
function dumpSpareBox(spareBoxes) {
  if (_.isEmpty(spareBoxes)) {
    return $('#spare-boxes').remove();
  }
  var $spareBoxDiv = $('#spare-boxes');
  spareBoxes.forEach(function (box) {
    var _contents = box.contents || '';
    var _imageName = box.image_name || '';
    var _image = box.image_url ? '<img src="' + box.image_url + '" class="dummy-img" alt="' + _imageName + '"> ' : '';
    var _boxDiv = '<div class="contents-box">' +
      '        <article class="article-box">' +
      '          <div class="drop-shadow-box">' +
      '            <header class="article-box-header">' +
      '              <h2 class="article-box-header-h2">' +
      '                <span class="article-box-header-h2-jp">' + box.title + '</span>' +
      '              </h2>' +
      '            </header>' +
      '            <div class="article-box-body spare-box spare-box-horizontal">' +
      _image +
      '             <p class="line-break"> ' + _contents + '</p>' +
      '            </div>' +
      '          </div>' +
      '        </article>' +
      '      </div>';
    $spareBoxDiv.append(_boxDiv);
  });
}

function fetchSpareBox(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 15};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/contents/spare_box';

  function fetchSuccess(res) {
    dumpSpareBox(res.data);
  }

  function clearBlock() {
    $('#spare-boxes').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

// company images

function dumpCompanyImage(images) {
  if (_.isEmpty(images)) {
    return $('#company-images').remove();
  }

  var $imageUl = $('#company-images .js-image-ul');
  $imageUl.empty();
  var _formatImages = images.filter(function (image) {
    return !_.isEmpty(image.image_url);
  });
  _formatImages.forEach(function (image, index) {
    var _$imageLi = $(' <li class="image-search-ul-li">' +
      '                   <a href="' + link.companyDetail + '?company_id=' + image.company_id + '" class="image-search-ul-li-a">' +
      '                     <img src="' + image.image_url + '" alt="' + image.image_name + '"/>' +
      '                   </a></li>');
    if (index + 1 > 8) {
      // second row in UI
      _$imageLi.addClass('for-pc');
    }
    $imageUl.append(_$imageLi);
  });

  // draw photo to UI
  setTimeout(function () {
    squarePhoto('image-search-ul-li-a');
  });
}

function fetchCompanyImage(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {is_top_page: true, contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 16};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/company_images';

  function fetchSuccess(res) {
    dumpCompanyImage(res.data);
  }

  function clearBlock() {
    $('#company-images').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

function dumpCompanyImageTag(tags) {
  var $selection = $('[data-api="company-image-tag"]');
  $selection.empty();
  $selection.append('<option value="">すべて</option>');
  tags.forEach(function (tag) {
    var _$opt = '<option value="' + tag.item_key + '">' + tag.item_value + '</option>';
    $selection.append(_$opt);
  });
}

function fetchCompanyImageTag(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 99999};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/master_data/company_image';

  function fetchSuccess(res) {
    dumpCompanyImageTag(res.data);
  }

  function clearBlock() {
    // do nothing
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

function onSearchCompanyImage() {
  $('#company-images .js-btn-search').on('click', function (e) {
    e.preventDefault();
    var _url = link.companyImage;
    var _tagId = $('#company-images .js-company-image-tag-select').val() || null;
    var _paramStr = urlHelper.objectToQueryString({company_image_tag_id: _tagId});
    toLocationHref(_url + '?' + _paramStr);
  });
}

// disclosure
function dumpDisclosure(disclosures, $disclosureUl) {
  var _maxItem = 5;
  $disclosureUl.empty();
  if (_.isEmpty(disclosures)) {
    return $disclosureUl.append('<p>表示する企業はありません。</p>');
  }

  var _formatedDisclosures = disclosures.filter(function (disclose) {
    if (_.isEmpty(disclose.company) || _.isEmpty(disclose.disclosure)) {
      return false;
    }
    disclose.company.company_main_visual_image_url = _.isEmpty(disclose.company.company_main_visual_image_url) ? 'img/noimg320.png' : disclose.company.company_main_visual_image_url;
    return disclose;
  });
  if (_.isEmpty(_formatedDisclosures)) {
    return $disclosureUl.append('<p>表示する企業はありません。</p>');
  }

  _formatedDisclosures.forEach(function (disclose, index) {
    var urlParam = 'company_id=' + disclose.company.company_id + '&go_tab=disclosure&disclosure_id=' + disclose.disclosure.disclosure_id;
    var _discloseLi = '<li class="ranking-ul-li">' +
      '                  <a href="' + link.companyDetail + '?' + urlParam + '" class="ranking-ul-li-a">' +
      '                   <img src="' + disclose.company.company_main_visual_image_url + '" alt="' + disclose.company.company_main_visual_image_url + '"/>' +
      '                     <br/>' + (disclose.company.company_name || '') + '</a>' +
      '                </li>';

    $disclosureUl.append(_discloseLi);
    if (index + 1 === _maxItem) {
      var _tab = parseInt($disclosureUl.data('tab'));
      // if there is 5 item then add MORE button
      $disclosureUl.append(' <li class="ranking-ul-li ranking-ul-li-more">' +
        '                  <a href="' + link.disclosure + '?active_tab=' + _tab + '" class="ranking-ul-li-a ranking-ul-li-a-more"><img' +
        '                          src="' + assetsPath + 'img/img-company-more.png"' +
        '                          alt=""/><br/>more</a>' +
        '                </li>');
    }
  });
}

function fetchDisclosure(query, sucFn, errFn) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {
      contract_term_id: global.contract_term_id,
      partner_id: global.partner_id,
      per_page: 5
    };
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/disclosures';


  http.fetchAll(url, query, null, sucFn, errFn);
}

function fetchAllDisclosure() {
  $('#disclosure [class*=js-disclosure-ul-]').each(function (index, disclosureUl) {
    function fetchSuccess(res) {
      dumpDisclosure(res.data, $(disclosureUl));
    }

    function clearBlock() {
      $(disclosureUl).empty();
      $(disclosureUl).append('<p>表示する企業はありません。</p>');
    }

    var _query = {
      contract_term_id: global.contract_term_id,
      partner_id: global.partner_id,
      per_page: 5
    };
    if ($(disclosureUl).hasClass('js-disclosure-ul-1')) {
      _query.ranking_percent_from = 91;
      _query.ranking_percent_to = 100;
    } else if ($(disclosureUl).hasClass('js-disclosure-ul-2')) {
      _query.ranking_percent_from = 81;
      _query.ranking_percent_to = 90;
    } else {
      _query.ranking_percent_from = 71;
      _query.ranking_percent_to = 80;
    }
    fetchDisclosure(_query, fetchSuccess, clearBlock);
  });
}

// notice
function dumpNotice(notices) {
  if (_.isEmpty(notices)) {
    return $('#notice').remove();
  }
  var $noticeUl = $('#notice .js-notice-ul');
  $noticeUl.empty();

  var formatedNotices = notices.filter(function (notice) {
    return !_.isEmpty(notice.contents);
  });
  formatedNotices.forEach(function (notice) {
    var _noticeLi = null;
    if (_.isNull(notice.link_url)) {
      _noticeLi = '<li class="drop-shadow-box mgnt30-50 info-2-box-body line-break">' + notice.contents + '</li>';
    } else {
      _noticeLi = '<li class="drop-shadow-box mgnt30-50 info-2-box-body line-break">' +
        '<a href="' + notice.link_url + '">' + notice.title + '</a>' +
        '</li>';
    }
    $noticeUl.append(_noticeLi);
  });
}

function fetchNotice(query) {
  query = query || null;
  // get default query
  if (_.isEmpty(query)) {
    query = {contract_term_id: global.contract_term_id, partner_id: global.partner_id, per_page: 1};
  }
  // format query to string
  query = urlHelper.objectToQueryString(query);
  var url = '/contents/info_for_user';

  function fetchSuccess(res) {
    dumpNotice(res.data);
  }

  function clearBlock() {
    $('#notice').remove();
  }

  http.fetchAll(url, query, null, fetchSuccess, clearBlock);
}

////////////////
//  FOR ASURA //
////////////////

// Get prefecture by company e2r_pro_id of Asura
function _getPrefecture() {
  var formDataOfCompany = {
    contract_term_id: contractTermId,
    partner_id: !(_.isEmpty(partnerId)) ? partnerId : 0,
    per_page: 9999,
    is_asura: true,
  };

  $.ajax({
    url: webDomain + '/companies',
    dataType: 'json',
    type: 'GET',
    contentType: 'application/json',
    accept: 'application/json',
    data: formDataOfCompany,
    success: function (_res) {
      var companies = _res.data;
      if (companies.length > 0) {
        filterE2rCompany(companies);
      } else {
        $('#corporateSeminar-wrapper').hide();
      }
    },
    error: function (jqXhr, textStatus, errorThrown) {
      $('#corporateSeminar-wrapper').hide();
      console.log(errorThrown);
    }
  });
}

// Compare the company's prefecture with the e2_pro_id with the partner's prefrecture
function filterE2rCompany(_companies) {
  var companiesBelongToAsura = _.filter(_companies, function (__company) {
    if(__company.contract) {
      if(__company.contract.e2r_pro === true) {
        if(__company.contract.e2r_pro_id !== null) {
          arrE2rProId.push(parseInt(__company.contract.e2r_pro_id));
          return __company.contract.e2r_pro_id;
        }
      }
    }
  });

  if(arrE2rProId.length > 0) {
    arrE2rProId =  _.uniq(arrE2rProId);
    _getEventsFromAsura();
  } else {
    $('#corporateSeminar-wrapper').hide();
  }
}

function _getEventsFromAsura() {
  return $.ajax({
    url: apiUrlAsura + '/outside_events/get_event_index',
    dataType: 'json',
    type: 'POST',
    contentType: 'application/json',
    accept: 'application/json',
    processData: false,
    success: function (_res) {
      var _events = _res.response;
      if (_events.length > 0) {
        var arrEventOfCompanyHaveE2p = [];
        _.forEach(_events, function (company) {
          _.forEach(arrE2rProId, function (e2rProId) {
            if(e2rProId === company.companyId) {
              arrEventOfCompanyHaveE2p.push(company);
            }
          });
        });
        if(arrEventOfCompanyHaveE2p.length > 0) {
          // order asc event
          arrEventOfCompanyHaveE2p = _.orderBy(arrEventOfCompanyHaveE2p, ['heldDate', function( _event) {
            return _event.timezones[0].fromTime;
          }], ['asc', 'asc']);
          __generateEventListForAsura(arrEventOfCompanyHaveE2p);
          $('#corporateSeminar-wrapper').show();
        } else {
          $('#corporateSeminar-wrapper').hide();
        }
      } else {
        // Hide event list block when don't have any event
        $('#corporateSeminar-wrapper').hide();
      }
    },
    error: function (jqXhr, textStatus, errorThrown) {
      console.log(errorThrown);
    }
  });
}

function __generateEventListForAsura(_eventData, _idx) {
  var _eventGroupvar = 'corporateSeminar';
  if (_eventData.length > 0) {
    // Loop through all on event category
    _.forEach(_eventData, function (_eventItem_, _idx_) {
      if (_idx_ < 4) {
        // Generate event item base on category limit 4
        $('#' + _eventGroupvar).append(__generateEventItemForAsura(_eventItem_, _idx_));
      } else {
        // Add the rest of event item into hidden path, will show when [show more] has been clicked
        $('#' + _eventGroupvar + '-hidden').append(__generateEventItemForAsura(_eventItem_, _idx_));
      }
    });

    // Hide [show more] when events <= 4
    if (_eventData.length < 4) {
      $('#' + _eventGroupvar + '-show-more').hide();
    }
  } else {
    // Hide event based on category block when don't any event
    $('#' + _eventGroupvar + '-wrapper').hide();
  }
}

function __generateEventItemForAsura(_eventData, _idx) {
  // Add special class for event item
  var itemClass = '';
  if (_idx === 0) {
    itemClass = 'upper-row';
  } else if (_idx === 1) {
    itemClass = 'upper-row-pc';
  }

  var eventDates = _eventData.heldDate;
  var eventDateHtml = '';
  var eventTimeHtml = '';
  // Generate event date
  var eventDate = moment(eventDates).format('MM/DD');
  var eventDay = moment(eventDates).format('ddd').toUpperCase();
  eventDateHtml = eventDateHtml + '<span class="event-date">' + eventDate +
    '</span>' +
    '<span class="event-day">' + eventDay + '</span>';

  // Generate event time by date
  _.forEach(_eventData.timezones, function (__date) {
    var eventTimeFrom = moment(__date['fromTime'], 'HH:mm:ss').format('HH:mm');
    var eventTimeTo = moment(__date['toTime'], 'HH:mm:ss').format('HH:mm');
    eventTimeHtml = eventTimeHtml + '<div class="event-time">' + eventTimeFrom + '〜' + eventTimeTo + '</div>';
  });
  var filterField = ['prefName', 'publicName', 'companyName'];
  // filter key
  filterField.map(function(key) {
    _eventData[key] =  _eventData[key] || '';
  });
  return (
    '<li class="event-ul-li ' + itemClass + '">' +
    '  <div class="event-info-box">' +
    '    <div class="event-loc">' + _eventData.prefName + '</div>' +
    '    <div class="event-dateday">' + eventDateHtml + '</div>' +
    '<div>' + eventTimeHtml + '</div>' +
    '    <div class="event-com">' + _eventData.companyName + '</div>' +
    '  </div>' +
    '  <div class="event-btn-box">' +
    '    <a href="' + link.eventDetail + '?eventOf=ASURA&step_id=' + _eventData.stepId + '&asura_company_id=' +
    _eventData.companyId + '&event_held_date_id=' + _eventData.eventHeldDateId + '" class="btn-small btn-blue">詳細・予約</a>' +
    '  </div>' +
    '</li>'
  );
}
