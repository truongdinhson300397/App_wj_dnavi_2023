var rootVariables = {
  apiUrl: 'https://dev.admin.dia-navi.cloud3rs.io/api/v1'
  // apiUrl: 'https://stg.admin.dia-navi.cloud3rs.io/api/v1'
  // apiUrl: 'https://admin.shukatsu.jp/api/v1'
};
var apiUrlAsura = 'https://develop.e2rpro.jp/api';
// var apiUrlAsura = 'https://stgdia.e2rpro.jp/api';
// var apiUrlAsura = 'https://april.e2rpro.jp/api';

var term = [
  {
    term: '2021',
    id: 1
  },
  {
    term: '2022',
    id: 2
  },
  {
    term: '2023',
    id: 3
  },
  {
    term: '2024',
    id: 4
  }
];

// set version
var version = {
  "android":"1.1.6",
  "ios":"1.1.6",
  "version_contract_term": 2
};

function checkVersion () {
  document.addEventListener('deviceready', function () {
    $.ajax({
      url: rootVariables.apiUrl  + '/check_version',
      dataType: 'json',
      type: 'POST',
      headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: JSON.stringify(version),
      success: function (res) {
        var $versionBlock = $('.app-left-nav-ul-1-li-version');
        if(res.status === 200) {
          var data = res.data;
          if(window.applican.device.platform === 'iOS') {
            //app store
            $versionBlock.html('<span>バージョン　' + version.ios + '</span>');
            if(data.ios_update === true) {
              $("body").append('<div id="update-warning"> ' +
                  ' <div class="update-error">'+
                  '   <p class="error-mes">新しいバージョンがあります。新しいバージョンを更新するには、「はい」を押してください。!</p>'+
                  '   <a href="itms-apps://itunes.apple.com/app/id1340007962" class="btn btn-update-version">はい</a>' +
                  ' </div>' +
                  '</div>');
            }
          } else {
            //ch play
            $versionBlock.html('<span>バージョン　' + version.android + '</span>');
            if(data.android_update === true) {
              $("body").append('<div id="update-warning"> ' +
                  ' <div class="update-error">'+
                  '   <p class="error-mes">新しいバージョンがあります。新しいバージョンを更新するには、「はい」を押してください。!</p>'+
                  '   <a href="https://play.google.com/store/apps/details?id=jp.co.diamondhr.shukatsu.navi2022.stg&hl=ja" class="btn btn-update-version">はい</a>' +
                  ' </div>' +
                  '</div>');
            }
          }
        }
      },
      error: function (error, jqXhr, textStatus, errorThrown) {
        //maintenance
        // window.location.href = 'https://dev.admin.dia-navi.cloud3rs.io/';
        // window.location.href = 'https://stg.admin.dia-navi.cloud3rs.io/';
        // window.location.href = 'https://admin.shukatsu.jp/';
      }
    });
  });
}
function _checkNetWork() {
  var isOnline = navigator.onLine;
  if(!isOnline) {
    $("body").append('<div id="update-warning"> ' +
        ' <div class="update-error">'+
        '   <p class="error-mes-version">インターネット接続がありません。ダイヤモンド就活ナビにアクセスするにはWi-Fiネットワークかモバイルデータ通信を利用する必要があります。</p>'+
        '   <button id="retry-connect" class="btn btn-update-version">リトライ</button>' +
        ' </div>' +
        '</div>');
  }
}

function _retryConnect () {
  $('#retry-connect').on('click', function () {
    var checkOnline = navigator.onLine;
    if(checkOnline) {
      $('#update-warning').hide();
    }
  });
}

var requestName = window.location.href.replace(window.location.protocol + '//' + window.location.host, '');
var currentContractTerm = requestName.split(/\/([0-9]{4})/g)[1];

var contractTerm = globalInfo('contract_term');
var contractTermId = globalInfo('contract_term_id');
if(!_.isUndefined(currentContractTerm) && !_.isNaN(+currentContractTerm)) {
  var termIndex = _.findIndex(term, function (o) {
    return o.term == currentContractTerm;
  });
  if (termIndex > -1) {
    contractTermId = term[termIndex].id;
    contractTerm = currentContractTerm;
    globalInfo('contract_term', contractTerm, {path: "/"});
    globalInfo('contract_term_id', parseInt(contractTermId) || '', {path: "/"});
  }
}

function checkAttachedPath() {
  // Check whether the href is one of those path which is no need of attached contract term year
  var noAttachedPathList = ["tamatebako_drill_3", "tamatebako_test_3", "spi_3"];
  return noAttachedPathList.filter(function(path) {
    return location.href.includes(path);
  })[0];
}

function string2literal(value) {
  var maps = {
    'NaN': NaN,
    'null': null,
    'undefined': undefined,
    'Infinity': Infinity,
    '-Infinity': -Infinity
  };
  return ((value in maps) ? maps[value] : value);
};

function trimStr(value) {
  value = String(value);
  value = string2literal(value);
  if (value === null || value === undefined || value === NaN) {
    value = '';
  }
  return value.trim();
};

function _checkIsToken(sucFn, errorFn) {
  var contractTermId = globalInfo("contract_term_id");
  var token = globalInfo('jwt_' + contractTermId);

  $.ajax({
    url: rootVariables.apiUrl + '/students/check_token',
    dataType: 'json',
    type: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    success: function (_res) {
      if (typeof (sucFn) === 'function') {
        sucFn();
      }
    },
    error: function (jqXhr, textStatus, errorThrown) {
      var contractTermId = globalInfo("contract_term_id");
      globalInfo('jwt_' + contractTermId, null, {path: "/"});
      globalInfo('id_' + contractTermId, null, {path: "/"});

      if (typeof (errorFn) === 'function') {
        errorFn();
      }
    }
  });
}

function _redirectToLogin() {
  toLocationHref(link.loginUser);
}

function _checkContractTermAndPartner() {
  var __chooseContractTermScreen = '/';
  var contractTermId = string2literal(globalInfo('contract_term_id')) || null;
  var partnerId = globalInfo('partner_id');
  if (partnerId === undefined || partnerId === null) {
    globalInfo('partner_id', 0,{path: "/"});
  }
  var _screenParse = window.location.pathname.split('/');
  var _screen = _screenParse[_screenParse.length - 1];

  var currentPartner = window.location.href.split(/([0-9]{4})/g).slice(-2)[0];
  if (currentPartner) {
    if (parseInt(currentPartner) === 2021) {
      globalInfo('contract_term_id', 1, {path: "/"});
    }
  } else {
    if (_screen !== __chooseContractTermScreen && (contractTermId === undefined || contractTermId === null)) {
      window.location.href = __chooseContractTermScreen;
    }
  }
}

function dumpUserHeader() {
  var contractTermId = globalInfo("contract_term_id");
  // check invalid id
  var userId = string2literal(parseInt(globalInfo('id_' + contractTermId)));
  // get path and query string
  var _screenParse = $(location).attr('pathname');
  if (isNaN(userId) && _screenParse !== link.loginUser) {
    globalInfo('returnUrl', _screenParse, {path: "/"});
    // _redirectToLogin();
  }

  var $headerNav = $('[data-global="header_check_login_user"]');
  var _temp = '<a href="' + link.myPageMycode + '" class="header-nav-icon nav-icon-qr"><span class="header-nav-text">マイコード</span></a>' +
    '          <a href="' + link.myPageTop + '" class="header-nav-icon nav-icon-key"><span class="header-nav-text">マイページ</span></a>' +
    '          <a href="' + link.logout + '" class="header-nav-icon nav-icon-logout"><span class="header-nav-text">ログアウト</span></a>';

  $headerNav.empty();
  $headerNav.append(_temp);
}

// header, footer app
var leftNavWidth = $('#leftNav').width();
$(window).on('resize orientationchange',function(){
  leftNavWidth = $('#leftNav').width();
});

//メニューの開閉用設定
function slideAppMenu(){
  $('#navIconOpen').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    if($('#leftNav:not(:animated)')){
      $('#leftNavOuter').addClass('app-left-nav-1-open');
      setTimeout(function(){
        $('#leftNav').animate(
            {marginLeft: '0px'},
            {duration: '1000', easing: 'swing'}
        );
      }, 200);
    }
  });

  $('#navIconClose').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    if($('#leftNav:not(:animated)')){
      $('#leftNav').animate(
          {marginLeft:'-'+leftNavWidth+'px'},
          {duration: '1000',
            easing: 'swing',
            complete: function(){$('#leftNavOuter').removeClass('app-left-nav-1-open')}
          }
      );
    }
  });
}

function slideAppSubmenu(){
  $('.app-left-nav-1-has-submenu .app-left-nav-ul-1-li-a').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var submenu = $(this).closest('.app-left-nav-ul-1-li').find('.app-left-nav-ul-2-outer');
    var submenuNotAnimated = $(this).closest('.app-left-nav-ul-1-li').find('.app-left-nav-ul-2-outer:not(:animated)');
    if(submenu.hasClass('app-left-nav-2-open')){
      $(this).removeClass('app-left-nav-1-submenu-open');
      submenuNotAnimated.slideUp('300').removeClass('app-left-nav-2-open');
    } else {
      $(this).addClass('app-left-nav-1-submenu-open');
      submenuNotAnimated.slideDown('300').addClass('app-left-nav-2-open');
    }
  });


  //第3階層のメニューの開閉
  $('.app-left-nav-2-has-submenu .app-left-nav-ul-2-li-a').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var submenu = $(this).closest('.app-left-nav-ul-2-li').find('.app-left-nav-ul-3-outer');
    var submenuNotAnimated = $(this).closest('.app-left-nav-ul-2-li').find('.app-left-nav-ul-3-outer:not(:animated)');
    if(submenu.hasClass('app-left-nav-3-open')){
      $(this).removeClass('app-left-nav-2-submenu-open');
      submenuNotAnimated.slideUp('300').removeClass('app-left-nav-3-open');
    } else {
      $(this).addClass('app-left-nav-2-submenu-open');
      submenuNotAnimated.slideDown('300').addClass('app-left-nav-3-open');
    }
    //$('> .navi-ul-3:not(:animated)',this).slideDown('100').addClass('navi-3-open');
  });
}

// display contract term year in header logo
function displayContractTerm() {
  var logoId = localStorage.getItem('logo_id');
  var headerLogo = $('.header-logo-a');

  // find filename
  var fileName = window.location.href.replace(/^.*[\\\/]/, '');

  // remove query params
  fileName = fileName.replace(/[?].*$/, '');

  if (logoId != null && logoId.length > 0 && headerLogo.length > 0 && fileName !== 'CL0010.html') {
    if (parseInt(logoId) === 2) {
      headerLogo.addClass('header-logo-next-term');
    }
  }
}
function changeAppHeaderNav(isUserLoggedIn) {
  var liList = $('.app-left-nav-btn-ul li');
  if (liList.length < 2) return;
  if (isUserLoggedIn) {
    var btnLogin = '<a href="' + link.logout + '" class="app-left-nav-btn-login-a">ログアウト</a>';
    var btnJoin = '<a href="' + link.myPageTop + '" class="app-left-nav-btn-join-a">マイページ</a>';
    $(liList[0]).html(btnLogin);
    $(liList[1]).html(btnJoin);
  } else {
    var btnLogin = '<a href="' + link.loginUser + '" class="app-left-nav-btn-login-a">ログイン</a>';
    var btnJoin = '<a href="' + link.regist + '" class="app-left-nav-btn-join-a">会員登録</a>';
    $(liList[0]).html(btnLogin);
    $(liList[1]).html(btnJoin);
  }
}
function headeFooterApp (isLogin) {
  var _partnerName = string2literal(decodeURIComponent(globalInfo('partner_name')));
  var _partnerNameString = '';
  // Temporary commented for changing style
  if (!_.isEmpty(_partnerName)) {
    _partnerNameString = '<span class="header-label-box" style="display: inline-block;text-align: center;width: 200px;"><span data-global="header_prefecture_name" class="label-prefecture" style="font-size: 7px;">' +
        _partnerName + '</span></span>';
  }
  var hearder = '<div class="app-header-box-inner">' +
      ' <span class="app-header-nav">' +
      '  <a href="javascript:void(0);" id="navIconOpen" class="app-header-nav-icon app-nav-icon-menu nav-icon-menu-open"></a>' +
      ' </span>' +
      ' <span class="app-header-logo' + (!_.isEmpty(_partnerName) ? ' app-partner' : '') + '">' +
      ' <a href="' + link.top + '" class="app-header-logo-a app-header-logo-img header-logo-a">' +
      ' </a>' +
      _partnerNameString +
      ' </span>' +
      ' <span class="app-header-nav">' +
      '   <a href="' + link.myPageMycode + '" class="app-header-nav-icon app-nav-icon-qr"></a>マイコード' +
      '  </span>' +
      '</div>';

  var menuLogin = '';
  if (isLogin) {
    var btnLogin = '<a href="' + link.logout + '" class="app-left-nav-btn-login-a">ログアウト</a>';
    var btnJoin = '<a href="' + link.myPageTop + '" class="app-left-nav-btn-join-a">マイページ</a>';
  } else {
    var btnLogin = '<a href="' + link.loginUser + '" class="app-left-nav-btn-login-a">ログイン</a>';
    var btnJoin = '<a href="' + link.regist + '" class="app-left-nav-btn-join-a">会員登録</a>';
  }
  var leftNavOuter= '<nav id="leftNav" class="app-left-nav">' +
      ' <div class="app-left-nav-logo-box">' +
      '   <div class="app-left-nav-logo">' +
      '     <a href="' + link.top + '" class="app-left-nav-logo-a app-header-logo-img header-logo-a">' +
      '     </a>' +
      '    </div>' +
      '    <div class="app-left-nav-icon">' +
      '     <a href="javascript:void(0);" id="navIconClose" class="app-left-nav-icon-a app-nav-icon-menu nav-icon-menu-close"></a>' +
      '    </div>' +
      '   </div>' +
      '   <ul class="app-left-nav-btn-ul">' +
      '    <li class="app-left-nav-btn-ul-li">' +
      btnLogin +
      '    </li>' +
      '    <li class="app-left-nav-btn-ul-li">' +
      btnJoin +
      '    </li>' +
      '   </ul>' +
      '   <ul class="app-left-nav-ul-1">' +
      '    <li class="app-av-ul-1-li">' +
      '     <a href="#" class="app-left-nav-ul-1-li-a-main-menu">MENU</a>' +
      '    </li>' +
      menuLogin +
      '    <li class="app-left-nav-ul-1-li">' +
      '     <a href="' + link.eventList + '" class="app-left-nav-ul-1-li-a">イベント</a>' +
      '    </li>' +
      '    <li class="app-left-nav-ul-1-li">' +
      '     <a href="' + link.disclosure + '" class="app-left-nav-ul-1-li-a">情報公開度でさがす</a>' +
      '    </li>' +
      '     <li class="app-left-nav-ul-1-li">' +
      '      <a href="' + link.companyList + '" class="app-left-nav-ul-1-li-a">企業をさがす</a>' +
      '     </li>' +
      '     <li class="app-left-nav-ul-1-li">' +
      '      <a href="' + link.internshipList + '" class="app-left-nav-ul-1-li-a">インターンシップ＆キャリア支援プログラム</a>' +
      '     </li>' +
      '     <li class="app-left-nav-ul-1-li app-left-nav-1-has-submenu">' +
      '      <a href="#" class="app-left-nav-ul-1-li-a">UIターン・地元就活 <span class="app-left-nav-1-has-submenu-arrow"></span></a>' +
      '    <div class="app-left-nav-ul-2-outer">' +
      '     <ul class="app-left-nav-ul-2" id="ui-job-hunting">' +
      '     </ul>' +
      '    </div>' +
      '   </li>' +
      '  <li class="app-left-nav-ul-1-li">' +
      '   <a href="' + link.contents + '" class="app-left-nav-ul-1-li-a">選考対策</a>' +
      '  </li>' +
      '   </ul>' +
      '  </div>' +
      '  </li>' +
      '   <ul class="app-left-nav-ul-1">' +
      '    <li class="app-av-ul-1-li">' +
      '     <a href="#" class="app-left-nav-ul-1-li-a-main-menu">その他</a>' +
      '    </li>' +
      '    <li class="app-left-nav-ul-1-li">' +
      '     <a href="javascript:removeFirstOpen()" class="app-left-nav-ul-1-li-a">チュートリアル</a>' +
      '    </li>' +
      '    <li class="app-left-nav-ul-1-li">' +
      '     <a href="' + link.faqList + '" class="app-left-nav-ul-1-li-a">FAQ</a>' +
      '    </li>' +
      '    <li class="app-left-nav-ul-1-li">' +
      '     <a href="' + (globalInfo('contract_term_id') == 1 ? link.kiyaku : link.kiyaku2022) + '" class="app-left-nav-ul-1-li-a">利用規約</a>' +
      '    </li>' +
      '    <li class="app-left-nav-ul-1-li">' +
      '     <a href="' + link.privacy + '" class="app-left-nav-ul-1-li-a">プライバシーポリシー</a>' +
      '    </li>' +
      '    </ul>' +
      '    <div class="app-left-nav-ul-1-li-version">' +
      '    </div>' +
      ' </ul>' +
      '</nav>';

  var footer= '<ul class="app-footer-nav-ul">' +
      ' <li class="app-footer-nav-ul-li"><a href="' + link.top + '" class="app-footer-nav-a"><img src="' + assetsPath + 'img/icon-home.png" class="app-footer-nav-img" alt="top" />TOP</a></li>' +
      ' <li class="app-footer-nav-ul-li"><a href="' + link.eventList + '" class="app-footer-nav-a"><img src="' + assetsPath + 'img/icon-event.png" class="app-footer-nav-img" alt="イベント" />イベント</a></li>' +
      ' <li class="app-footer-nav-ul-li"><a href="' + link.internshipList + '" class="app-footer-nav-a"><img src="' + assetsPath + 'img/icon-company.png" class="app-footer-nav-img" alt="インターン" />インターン</a></li>' +
      ' <li class="app-footer-nav-ul-li"><a href="' + link.contents + '" class="app-footer-nav-a"><img src="' + assetsPath + 'img/icon-contents.png" class="app-footer-nav-img" alt="選考対策" />選考対策</a></li>' +
      ' <li class="app-footer-nav-ul-li"><a href="' + link.myPageTop + '" class="app-footer-nav-a"><img src="' + assetsPath + 'img/icon-mypage.png" class="app-footer-nav-img" alt="マイページ" />マイページ</a></li>' +
      '</ul>';

  $('#header').append(hearder);
  $('#leftNavOuter').append(leftNavOuter);
  $('#footer').append(footer);
  displayContractTerm();
}
// end header, footer app

function dumpGuestHeader() {
  var $headerNav = $('[data-global="header_check_login_user"]');
  var _temp = '<a href="' + link.regist + '" class="header-nav-icon nav-icon-user"><span class="header-nav-text">会員登録</span></a>' +
    '          <a href="' + link.loginUser + '" class="header-nav-icon nav-icon-login"><span class="header-nav-text">ログイン</span></a>';

  $headerNav.empty();
  $headerNav.append(_temp);
}

function isUserLoggedIn() {
  var contractTermId = globalInfo("contract_term_id");
  var id = globalInfo("id_" + contractTermId);
  var jwt = globalInfo("jwt_" + contractTermId);
  var hasJWT = jwt !== "null" && jwt !== undefined;
  var hasID = id !== "null" && id !== undefined;
  return hasJWT && hasID;
}

function _headerUIHandler(nextFn, errorNextFn, isRequireLogin, onlyForGuest) {
  isRequireLogin = isRequireLogin || false;
  onlyForGuest = onlyForGuest || false;
  checkVersion();
  _checkNetWork();
  _retryConnect();
  // Check and overwrite the contract year following the entered url contract_term
  var contractYear = globalInfo("contract_term");
  var urlContractYear = window.location.href.split(/\/([0-9]{4})/g).slice(-2)[0];
  if (urlContractYear.match(/^[0-9]/g) !== null && contractYear !== urlContractYear) {
    globalInfo("contract_term", urlContractYear, {path: "/"});
  } else {
    globalInfo("contract_term", 2022, {path: "/"});
  }

  // If user is logged in, redirect back to TOP page
  if(onlyForGuest && isUserLoggedIn()) {
    return toLocationHref(link.top);
  }
  _checkContractTermAndPartner();
  _checkIsToken(function () {
    dumpUserHeader();
    if (typeof isApplican !== "undefined" && isApplican) {
      headeFooterApp(isLogin = true);
      slideAppMenu();
      slideAppSubmenu();
    }
    typeof (nextFn) === 'function' ? nextFn() : null;
  }, function () {
    if (isRequireLogin) {
      // get path name and query string
      var _screenParse = $(location).attr('pathname') + $(location).attr('search');
      globalInfo('returnUrl', _screenParse, {path: "/"});
      return _redirectToLogin();
    }
    if (typeof isApplican !== "undefined" && isApplican) {
      headeFooterApp(isLogin = false);
      slideAppMenu();
      slideAppSubmenu();
    }
    dumpGuestHeader();
    typeof (errorNextFn) === 'function' ? errorNextFn() : null;
  });
  // Draw UI hunting job local on menu
  _getPrefectureByPartner().done(function (_res) {
    _generateUIJobHuntingLocal(_res.data);

    getPartnerFromUrl(_res.data);

    if (typeof displaySearchCompanyButtons === 'function') {
      displaySearchCompanyButtons();
    }
  });
}

function _getPrefectureByPartner() {
  return $.ajax({
    url: rootVariables.apiUrl + '/common/find_partner_prefecture',
    dataType: 'json',
    type: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

function _generateUIJobHuntingLocal(_partnerGroups) {
  var dUl = $('ul#ui-job-hunting');
  dUl.empty();
  var dLiLvl1 = $('<li class="nav-ul-2-li">');
  var dLiLvl1WithSubMenu = $('<li class="nav-ul-2-li nav-2-has-submenu"><a class="nav-ul-2-li-a" id="resetPartner" href="#">全国トップ</a>');

  _.forEach(_partnerGroups, function (__partnerGroup) {
    var __partners = __partnerGroup.partner;
    var __groupName = __partnerGroup.group;
    if (__partnerGroup.partner.length <= 0) {
      dLiLvl1.append(
        '<a href="#" class="nav-ul-2-li-a">' + __groupName + '</a>');
      dUl.append(dLiLvl1);
    } else {
      dLiLvl1WithSubMenu.append(
        '<a href="#" class="submenu-nav-li nav-ul-2-li-a">' + __groupName +
        '<span id="nav-2-submenu" class="nav-2-has-submenu-arrow"></span></a>');

      var dDivLvl2 = $('<div class="nav-ul-3-outer">');
      var dUlLvl2 = $('<ul class="nav-ul-3">');

      _.forEach(__partners, function (_partner_) {
        var dLiLvl2 = $('<li class="nav-ul-3-li">');

        dLiLvl2.append(
          ' <a href="javascript:void(0);" class="nav-ul-3-li-a js-choose-partner">' + _partner_.partner_name + '</a>');

        dUlLvl2.append(dLiLvl2);
        dDivLvl2.append(dUlLvl2);
        // listen to update partner Infomation in cookie
        dLiLvl2.find('.js-choose-partner').on('click', function(e) {
          e.stopPropagation();
          writePartnerInfoIntoCookie(_partner_);
        });
      });

      dLiLvl1WithSubMenu.append(dDivLvl2);
      dUl.append(dLiLvl1WithSubMenu);
    }
  });

  // listen to reset partner
  $(document).on('click', '#resetPartner', function (e) {
    var shouldAlertLeaveForContent = checkAttachedPath() !== undefined;
    if(!shouldAlertLeaveForContent || (shouldAlertLeaveForContent && confirmAfterAlertLeaveForContent())) {
      globalInfo('partner_name', '', {path: "/"});
      globalInfo('partner_id', 0,{path: "/"});
      globalInfo('prefecture_ids', '', {path: "/"});
      if (typeof isApplican !== "undefined" && isApplican) {
        toLocationHref(link.top);
      } else {
        toLocationHref(link.top);
      }
    }
  });
}

function confirmAfterAlertLeaveForContent() {
    return confirm("このまま移動した場合、未回答の問題は間違いとして処理されます。\n" + "移動してよろしいですか？");
}

function writePartnerInfoIntoCookie(partner) {
  var shouldAlertLeaveForContent = checkAttachedPath() !== undefined;
  if(!shouldAlertLeaveForContent || (shouldAlertLeaveForContent && confirmAfterAlertLeaveForContent())) {
    if (partner) {
      globalInfo('partner_name', partner.partner_name ? encodeURIComponent(partner.partner_name) : '', {path: "/"});
      globalInfo('partner_id', parseInt(partner.partner_id) || '', {path: "/"});
      globalInfo('prefecture_ids', JSON.stringify(partner.prefecture_ids) || '', {path: "/"});
      toLocationHref(link.top);
    }
  }
}

// Get queryparams
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
};

function checkAllByClass(checkboxClass, kore) {
  $('input.' + checkboxClass).each(function () {
    if ($(kore).prop('checked')) {
      $(this).prop('checked', true);
    } else {
      $(this).prop('checked', false);
    }
  });
}

function isEmailCorrect(_email) {
  var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return _email.match(pattern);
}

function getPartnerFromUrl (_partners) {
  if (typeof isApplican !== "undefined" && isApplican) return;
  // need to remove query parameters before check
  var newHref = window.location.href.split("?")[0].split("#")[0];
  var currentPartner = newHref.split(/([0-9]{4})/g).slice(-1)[0].split('/')[1];
  var currentPartnerId = parseInt(currentPartner);

  if (_.isEmpty(currentPartner)) {
    globalInfo('partner_name', '', {path: "/"});
    globalInfo('partner_id', 0,{path: "/"});
    globalInfo('prefecture_ids', '', {path: "/"});
  }

  if (!isNaN(currentPartnerId)) {
    _.forEach(_partners, function (_partner) {
      var selectedPartner = _.find(_partner.partner, function(_partner) {
        return _partner.partner_id === currentPartnerId;
      });

      if (selectedPartner !== undefined) {
        globalInfo('partner_name', selectedPartner.partner_name ? encodeURIComponent(selectedPartner.partner_name) : '', {path: "/"});
        globalInfo('partner_id', parseInt(selectedPartner.partner_id) || '', {path: "/"});
        globalInfo('prefecture_ids', JSON.stringify(selectedPartner.prefecture_ids) || '', {path: "/"});

        return false;
      }
    });
  }

  // add prefecture name in header
  var _partnerName = string2literal(decodeURIComponent(globalInfo('partner_name')));
  if (!_.isEmpty(_partnerName)) {
    var _temp = '<span class="header-label-box"><span data-global="header_prefecture_name" class="label-prefecture">' +
      _partnerName + '</span></span>';
    $('#js-header-logo').after('');
    $('#js-header-logo').after(_temp);
  }
}

//Display dates and times Japan
function convertTime (time) {
  moment.updateLocale('ja', {
    weekdaysShort: [
      '日', '月', '火', '水', '木', '金', '土'
    ],
  });
  return moment(time).format('M月D日 (ddd)');
}

// function isDateBetween (_now, _from, _to) {
//   var compareDate = moment(_now, 'YYYY-MM-DD');
//   var startDate = moment(_from, 'YYYY-MM-DD');
//   var endDate = moment(_to, 'YYYY-MM-DD');
//   return compareDate.isBetween(startDate, endDate, null, '[]');
// }

function isDateBetween (_now, _from, _to) {
  var compareDate = moment(_now, 'YYYY-MM-DD HH:mm:ss');
  var startDate = moment(_from, 'YYYY-MM-DD HH:mm:ss');
  var endDate = moment(_to, 'YYYY-MM-DD HH:mm:ss');
  var checkStartDate = compareDate.isSameOrAfter(startDate);
  var checkEndDate = compareDate.isSameOrBefore(endDate);

  return checkStartDate && checkEndDate;
}

function changeContractTerm(content, oldContractTerm, newContractTerm) {
  var re = new RegExp(oldContractTerm,'gm');
  return content.replace(re, newContractTerm);
}

function fixMetaTag() {
  var currentContractTerm = globalInfo('contract_term');
  // Fix title too
  var $title = $('title');
  var newContent = changeContractTerm($title.text(), 2021, currentContractTerm);
  $title.text(newContent);

  _.forEach($('meta[name="keywords"], meta[name="description"]'), function (ele) {
    var newContent = changeContractTerm($(ele).attr('content'), 2021, currentContractTerm);
    $(ele).attr('content', newContent);
  });
}
fixMetaTag();

function removeFirstOpen() {
  localStorage.removeItem('isFirstOpen');
  window.location.href = link.top;
}
function getPushToken() {
  function getPushTokenSuccess(res){
    registerDevice(res.pushToken)
  }
  function getPushTokenError(res) {

  }
  applican.device.getPushToken(getPushTokenSuccess, getPushTokenError);
}

function registerDevice(token) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  var authToken = globalInfo('jwt_' + contractTermId);
  if (authToken !== null && authToken !== 'null') {
    headers['Authorization'] = 'Bearer ' + authToken;
  }
  const postData = {
    name: applican.device.name,
    platform: applican.device.platform,
    token,
    uuid: applican.device.uuid_rfc4122,
    version: applican.device.version,
    applican_version: applican.device.applican,
    applican_type: applican.device.applican_type,
    package_name: applican.device.package_name,
    contract_term_id: contractTermId,
  };
  return $.ajax({
    url: rootVariables.apiUrl + '/device/register',
    dataType: 'json',
    type: 'POST',
    headers,
    data: JSON.stringify(postData),
    success: function (res) {
      if (authToken !== null && authToken !== 'null') {
        localStorage.setItem('is_registered', 'true');
      }
      localStorage.setItem('push_token', token);
    },
    error: function (jqXhr, textStatus, errorThrown) {
      // What's next?
    }
  });
}
if (typeof isApplican !== "undefined" && isApplican) {
  document.addEventListener('deviceready', function () {
    if (typeof applican === 'undefined') return;
    if (localStorage.getItem('is_registered') === 'true') return;
    getPushToken();
  });
}
