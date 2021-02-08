//ブラウザ判定用
var ua = window.navigator.userAgent.toLowerCase();
var isMobile = false;
var isIE = false;
if(ua.indexOf('iphone') > -1 || ua.indexOf('ipod') > -1 || ua.indexOf('ipad') > -1 || ua.indexOf('android') > -1 || ua.indexOf('phone') > -1){
  isMobile = true;
}
if(ua.indexOf('msie') > -1 || ua.indexOf('trident') > -1){
  isIE = true;
}

//グローバル変数
var windowHeight = $(window).height();
var headerHeight = $('#header').outerHeight();
var pcHeaderHeight = 200;
var spHeaderHeight = 75;
var headerLogoBoxHeight = $('.header-logo-box').outerHeight();
var headerBoxInnerHeight = $('.header-box-inner').outerHeight();
var navHeight = $('#nav').outerHeight();
var ul1MaxHeight = windowHeight-headerLogoBoxHeight;

var $main = $('#main');
var mainPaddingTopEnd = 0;
if ($main.length > 0) {
  mainPaddingTopEnd = $('#main').css('padding-top').replace('px','');
}
var mainPaddingTop = Number(mainPaddingTopEnd);


var link = {};
if (typeof isApplican !== "undefined" && isApplican) {
  link = {
    "top": "CL0020.html",
    "regist": "CL1010.html",
    "loginUser": "index.html",
    "loginTemporary": "CL1210.html",
    "reminder": "CL1310.html",
    "reminderComplete": "CL1320.html",
    "passwordReset": "CL1410.html",
    "passwordResetComplete": "CL1420.html",
    "forgetId": "CL1510.html",
    "forgetIdComplete": "CL1520.html",
    "eventList": "CL2100.html",
    "eventDetail": "CL2200.html",
    "eventApply": "CL2210.html",
    "eventProfilecard": "CL2300.html",
    "companyList": "CL3100.html",
    "companySearch": "CL3110.html",
    "companyDetail": "CL3200.html",
    "companyDisclosure": "CL3300.html",
    "companyRecruitmentinfo": "CL3400.html",
    "companyInternship": "CL3500.html",
    "entryRecruitguide": "CL3410.html",
    "entryInternship": "CL3510.html",
    "internshipList": "CL4100.html",
    "internshipSearch": "CL4110.html",
    "disclosure": "CL5100.html",
    "companyImage": "CL5200.html",
    "contact": "CL5310.html",
    "contactConfirm": "CL5320.html",
    "contactComplete": "CL5330.html",
    "contents": "CL6100.html",
    "contentsSpi": "spi.html",
    "contentsSpi_3": "spi_3.html",
    "contentsSpi_4": "spi_4.html",
    "contentsSpi_5": "spi_5.html",
    "contentsTamatebako_drill": "tamatebakodrill.html",
    "contentsTamatebako_drill_3": "tamatebakodrill_3.html",
    "contentsTamatebako_drill_4": "tamatebakodrill_4.html",
    "contentsTamatebako_drill_5": "tamatebakodrill_5.html",
    "contentsTamatebako_test": "tamatebakomini.html",
    "contentsTamatebako_test_3": "tamatebakomini_3.html",
    "contentsTamatebako_test_4": "tamatebakomini_4.html",
    "contentsTamatebako_test_5": "tamatebakomini_5.html",
    "myPageAppliedEvent": "CL2900.html",
    "myPageEnteredInternship": "CL4900.html",
    "myPageMycode": "CL7100.html",
    "myPageTop": "CL7200.html",
    "myPageMemberinfoEdit": "CL7300.html",
    "myPageResetMail": "CL7400.html",
    "myPageResetMailComplete": "CL7410.html",
    "myPageResetPassword": "CL7500.html",
    "myPageResetPasswordComplete": "CL7510.html",
    "myPageResetQuitdnaviUserConfirm": "CL7600.html",
    "myPageResetQuitdnaviUserComplete": "CL7610.html",
    "quitdnaviTemporaryUserEdit": "CL5410.html",
    "quitdnaviTemporaryUserConfirm": "CL5420.html",
    "quitdnaviTemporaryUserComplete": "CL5430.html",
    "kiyaku": "CL9600.html",
    "kiyaku2022": "CL9600_2022.html",
    "privacy": "CL9700.html",
    "logout": "CL9000.html",
    "faqList": "CL9200.html",
    "faqDetail": "CL9210.html",
    "faqDetail_2": "CL9220.html",
    "faqDetail_3": "CL9230.html",
    "faqDetail_4": "CL9240.html",
    "faqDetail_5": "CL9250.html",
    "faqDetail_6": "CL9260.html",
    "faqDetail_7": "CL9270.html",
    "faqDetail_8": "CL9280.html",
    "sitemap": "CL9300.html",
    "beacon": "smartCheckin.html",
    "myPageEnteredCompany": "CL3900.html"
  }
} else {
  link = {
    "top": "/top",
    "regist": "/regist",
    "loginUser": "/login/user",
    "loginTemporary": "/login/temporary_user",
    "reminder": "/reminder",
    "reminderComplete": "/reminder/complete",
    "passwordReset": "/passwordreset",
    "passwordResetComplete": "/passwordreset/complete",
    "forgetId": "/forgetid",
    "forgetIdComplete": "/forgetid/complete",
    "eventList": "/event/eventlist",
    "eventDetail": "/event/detail",
    "eventApply": "/event/apply",
    "eventProfilecard": "/event/profilecard",
    "companyList": "/company/list",
    "companySearch": "/company/search",
    "companyDetail": "/company/detail",
    "companyDisclosure": "/company/disclosure",
    "companyRecruitmentinfo": "/company/recruitmentinfo",
    "companyInternship": "/company/internship",
    "entryRecruitguide": "/entry/recruitguide",
    "entryInternship": "/entry/internship",
    "internshipList": "/internship/list",
    "internshipSearch": "/internship/search",
    "disclosure": "/disclosure",
    "companyImage": "/company_image",
    "contact": "/contact",
    "contactConfirm": "/contact/confirm",
    "contactComplete": "/contact/complete",
    "contents": "/contents",
    "contentsSpi": "/contents/spi",
    "contentsSpi_3": "/contents/spi_3",
    "contentsSpi_4": "/contents/spi_4",
    "contentsSpi_5": "/contents/spi_5",
    "contentsTamatebako_drill": "/contents/tamatebako_drill",
    "contentsTamatebako_drill_3": "/contents/tamatebako_drill_3",
    "contentsTamatebako_drill_4": "/contents/tamatebako_drill_4",
    "contentsTamatebako_drill_5": "/contents/tamatebako_drill_5",
    "contentsTamatebako_test": "/contents/tamatebako_test",
    "contentsTamatebako_test_3": "/contents/tamatebako_test_3",
    "contentsTamatebako_test_4": "/contents/tamatebako_test_4",
    "contentsTamatebako_test_5": "/contents/tamatebako_test_5",
    "myPageAppliedEvent": "/mypage/applied_event",
    "myPageEnteredInternship": "/mypage/entered_internship",
    "myPageMycode": "/mypage/mycode",
    "myPageTop": "/mypage/top",
    "myPageMemberinfoEdit": "/mypage/memberinfo/edit",
    "myPageResetMail": "/mypage/reset_mail",
    "myPageResetMailComplete": "/mypage/reset_mail/complete",
    "myPageResetPassword": "/mypage/reset_password",
    "myPageResetPasswordComplete": "/mypage/reset_password/complete",
    "myPageResetQuitdnaviUserConfirm": "/mypage/quitdnavi/user/confirm",
    "myPageResetQuitdnaviUserComplete": "/mypage/quitdnavi/user/complete",
    "quitdnaviTemporaryUserEdit": "/quitdnavi/temporary_user/edit",
    "quitdnaviTemporaryUserConfirm": "/quitdnavi/temporary_user/confirm",
    "quitdnaviTemporaryUserComplete": "/quitdnavi/temporary_user/complete",
    "kiyaku": "/kiyaku",
    "kiyaku2022": "/kiyaku",
    "privacy": "/privacy",
    "logout": "/logout",
    "faqList": "/faq/list",
    "faqDetail": "/faq/detail",
    "faqDetail_2": "/faq/detail_2",
    "faqDetail_3": "/faq/detail_3",
    "faqDetail_4": "/faq/detail_4",
    "faqDetail_5": "/faq/detail_5",
    "faqDetail_6": "/faq/detail_6",
    "faqDetail_7": "/faq/detail_7",
    "faqDetail_8": "/faq/detail_8",
    "sitemap": "/sitemap"
  }
}

function removeAllParams(sourceURL) {
  var index = 0;
  var newURL = sourceURL;
  index = sourceURL.indexOf('?');
  if(index === -1) {
    index = sourceURL.indexOf('#');
  }
  if(index !== -1) {
    newURL = sourceURL.substring(0, index);
  }
  return newURL;
}

function getGlobalVariable(){
  windowHeight = $(window).height();
  if($(window).scroll().top==0){
    if($('html').css('font-size')=='12px'){
      headerHeight = spHeaderHeight;
    }
    if($('html').css('font-size')=='15px'){
      headerHeight = pcHeaderHeight;
    }
  }
  headerLogoBoxHeight = $('.header-logo-box').outerHeight();
  headerBoxInnerHeight = $('.header-box-inner').outerHeight();
  navHeight = $('#nav').outerHeight();
  ul1MaxHeight = windowHeight-headerLogoBoxHeight;
  $main = $('#main');
  mainPaddingTopEnd = 0;
  if ($main.length > 0) {
    mainPaddingTopEnd = $('#main').css('padding-top').replace('px','');
  }
  mainPaddingTop = Number(mainPaddingTopEnd);
}

//画面ロード時
$(window).on('load',function(){
  getGlobalVariable();

  setRadioBtn();
  setCheckbox();
  setbtnBackToTop();
  slideMenu();
  slideSubmenu();
  floatMenu();
  smoothScroll();
});

//画面サイズ変更時
$(window).on('resize orientationchange',function(){
  getGlobalVariable();

  if($('html').css('font-size')=='12px'){
    if($('#header').hasClass('header-box-open')){
      $('#header').removeClass('header-box-open');
    }
    if($('#navIcon').hasClass('nav-icon-menu-close')){
      $('#navIcon').removeClass('nav-icon-menu-close').addClass('nav-icon-menu-open');
    }
    if($('#nav').hasClass('nav-1-open')){
      $('#nav').removeClass('nav-1-open');
    }
    $('#nav').attr('style','');
    if($('.nav-ul-1-li-a').hasClass('nav-1-submenu-open')){
      $('.nav-ul-1-li-a').removeClass('nav-1-submenu-open');
    }

    if($('.nav-ul-2-outer').hasClass('nav-2-open')){
      $('.nav-ul-2-outer').removeClass('nav-2-open').attr('style','');
    }
  } else {
    $('#nav').removeClass('nav-open');
    $('.nav-ul-2-outer').removeClass('nav-2-open').attr('style','');
    if($('#nav').hasClass('nav-1-open')){
      $('#nav').removeClass('nav-1-open');
    }
    if($('#header').hasClass('header-box-open')){
      $('#header').removeClass('header-box-open');
    }
    if($('.nav-ul-1-li-a').hasClass('nav-1-submenu-open')){
      $('.nav-ul-1-li-a').removeClass('nav-1-submenu-open');
    }
  }

});

//画面トップへのボタンの位置設定
function setbtnBackToTop(){
  $('#btnBackToTop').click(function(){scrollToTop()});
  $(window).scroll(function(){
    if($(this).scrollTop() >= headerHeight){
      $('#btnBackToTop').addClass('btn-back-to-top-visible');
    } else {
      $('#btnBackToTop').removeClass('btn-back-to-top-visible');
    }
  });
}

//画面トップへ戻るボタンの動作設定
function scrollToTop(){
  var scrDistance = $('#btnBackToTop').offset().top ? $('#btnBackToTop').offset().top : $('#btnBackToTop').getBoundingClientRect().top;
  var scrDuration = Math.abs(0 - scrDistance) * 100 / 500;
  $('html, body').animate({scrollTop: 0},{duration: scrDuration, easing:'linear'});
}

//ページ内リンクのスムーズなスクロール
function smoothScroll(){
  var currentUrlArr = window.location.href.split('/', -1);
  var currentUrl = currentUrlArr[currentUrlArr.length-1].split('#')[0];
  // aタグのクリック
  $('a[href*="#"]').click(function(){
    var nextUrl = $(this).attr('href');
    nextUrl = nextUrl.split('#')[0];
    if(nextUrl==currentUrl){
      if($('body').css('font-size')=='12px'){
        if($('#nav:not(:animated)')){
          $('#navIcon').removeClass('nav-icon-menu-close').addClass('nav-icon-menu-open');
          $('#header').removeClass('header-open');
        }
      } else {
        if($('#nav:not(:animated)')){
          $('#navIcon').removeClass('nav-icon-menu-close').addClass('nav-icon-menu-open');
          $('#header').removeClass('header-open');
        }
      }

      var target = $(this.hash);
      if (target) {
        var targetOffset = target.offset().top ? target.offset().top : target.getBoundingClientRect().top;
        $('html,body').animate({scrollTop: targetOffset},500,"swing");
        if($('body').css('font-size')=='14px'){//min-width: 769px

        } else {//max-width: 768px
          if(!$('#nav ul.nav-ul-1').is(':animated')){
            $('#navIcon').removeClass('nav-icon-menu-close').addClass('nav-icon-menu-open');
          }
          $('#nav').css('max-height', '100%').removeClass('open');
        }
        return false;
      }
    }
  });
}

//メニューの開閉用設定
function slideMenu(){
  $('#navIcon').on('click', function(e){
    if($('html').css('font-size')=='12px'){
      if($('#nav').hasClass('nav-1-open')){
        if($('#nav:not(:animated)')){
          $('#nav').animate(
            {marginTop:'-'+ul1MaxHeight+'px'},
            {duration: '1000',
             easing: 'swing',
             complete: function(){$(this).removeClass('nav-1-open')}
             }
          );
          $('#navIcon').removeClass('nav-icon-menu-close').addClass('nav-icon-menu-open');
          $('#header').removeClass('header-box-open');
        }
      } else {
        if($('#nav:not(:animated)')){
          $('#nav').css('max-height', ul1MaxHeight+'px');
          $('#nav').css('margin-top', '-'+ul1MaxHeight+'px');
          $('#nav').addClass('nav-1-open').animate(
            {marginTop:'-2px'},
            {duration: '1000', easing: 'swing'}
          );
          $('#navIcon').removeClass('nav-icon-menu-open').addClass('nav-icon-menu-close');
          $('#header').addClass('header-box-open');
        }
      }
    } else {
      if($('#header').hasClass('header-box-float')){
        if($('#nav').hasClass('nav-1-open')){
          if($('#nav:not(:animated)')){
            $('#nav').animate(
              {marginTop:'-'+navHeight+'px'},
              {duration: '100',
               easing: 'swing',
               complete: function(){$(this).removeClass('nav-1-open')}
               }
            );
            $('#navIcon').removeClass('nav-icon-menu-close').addClass('nav-icon-menu-open');
            $('#header').removeClass('header-box-open');
          }
        } else {
          if($('#nav:not(:animated)')){
            $('#nav').css('margin-top', '-'+navHeight+'px');
            $('#nav').addClass('nav-1-open').animate(
              {marginTop:'0'},
              {duration: '100', easing: 'swing'}
            );
            $('#navIcon').removeClass('nav-icon-menu-open').addClass('nav-icon-menu-close');
            $('#header').addClass('header-box-open');
          }
        }
      }
    }
  });
}

function slideSubmenu(){
  $(document).on('click', '.nav-1-has-submenu .nav-ul-1-li-a',function(e){
    e.preventDefault();
    e.stopPropagation();

    var submenu = $(this).closest('.nav-ul-1-li').find('.nav-ul-2-outer');
    var submenuNotAnimated = $(this).closest('.nav-ul-1-li').find('.nav-ul-2-outer:not(:animated)');
    if(submenu.hasClass('nav-2-open')){
      $(this).removeClass('nav-1-submenu-open');
      submenuNotAnimated.slideUp('300').removeClass('nav-2-open');
    } else {
      $(this).addClass('nav-1-submenu-open');
      submenuNotAnimated.slideDown('300').addClass('nav-2-open');
    }
  });


  //第3階層のメニューの開閉
  $(document).on('click', '.nav-2-has-submenu .nav-ul-2-li-a',function(e){
    e.preventDefault();
    e.stopPropagation();
    var submenu = $(this).next('.nav-ul-3-outer');
    var submenuNotAnimated = $(this).next('.nav-ul-3-outer:not(:animated)');
    if(submenu.hasClass('nav-3-open')){
      $(this).removeClass('nav-2-submenu-open');
      submenuNotAnimated.slideUp('300').removeClass('nav-3-open');
    } else {
      $(this).addClass('nav-2-submenu-open');
      submenuNotAnimated.slideDown('300').addClass('nav-3-open');
    }
    //$('> .navi-ul-3:not(:animated)',this).slideDown('100').addClass('navi-3-open');
  });
}

//modal
function showModal(divId){
  $('#'+divId).fadeIn();
}

function hideModal(divId){
  $('#'+divId).fadeOut();
}


//ラジオボタンデザイン
function setRadioBtn(){
//  if($('input[type="radio"]')){
    $('input[type="radio"]').each(function(){
      if(!$(this).next().hasClass('radio-span')) {
        $(this).after('<span class="radio-span"></span>');
      }

//      if($(this).prop('checked')){
//        $(this).closest('.radio-span').addClass('radio-span-checked')
//      }
    });

 //   $('input[type="radio"]').click(function(){
 //     var nm = $(this).attr('name');
 //     if($('[name='+nm+']').closest('.radio-span').hasClass('radio-span-checked')){
 //       $('[name='+nm+']').closest('.radio-span').removeClass('radio-span-checked');
 //     }
 //     if($(this).prop('checked')){
 //       $(this).closest('.radio-span').addClass('radio-span-checked');
 //     }
 //   });
 // }
}

//チェックボックスデザイン
function setCheckbox(){
//  if($('input[type="checkbox"]')){
    $('input[type="checkbox"]:not(.no-style)').each(function(){
      $(this).after('<span class="checkbox-span"></span>');
//      if($(this).prop('checked')){
//        $(this).closest('.checkbox-span').addClass('checkbox-span-checked');
//      }
    });
 //   $('input[type="checkbox"]').click(function(){
 //     if($(this).prop('checked')){
 //       $(this).closest('.checkbox-span').addClass('checkbox-span-checked');
 //     }else {
 //       $(this).closest('.checkbox-span').removeClass('checkbox-span-checked');
 //     }
 //   });
//  }
}

//全選択
function checkAll(checkboxName,kore) {
  $('[name='+checkboxName+']').each(function(){
    if($(kore).prop('checked')){
      $(this).prop('checked',true);
//      $(this).closest('.checkbox-span').addClass('checkbox-span-checked');
    } else {
      $(this).prop('checked',false);
//      $(this).closest('.checkbox-span').removeClass('checkbox-span-checked');
    }
  });
}

//div開閉
function toggleBody(divId,kore){
  if($('#'+divId).is(':visible')){
    $('#'+divId).slideUp();
    $(kore).removeClass('active');
  } else {
    $('#'+divId).slideDown();
    $(kore).addClass('active');
  }
}

//タブ
function showSection(divId,tabClass,contentsClass,kore){
  $('.'+contentsClass).hide();
  $('.'+tabClass+'.'+tabClass+'-active').removeClass(tabClass+'-active');
  $('#'+divId).show();
  $(kore).addClass(tabClass+'-active');
}

function floatMenu(){
  $(window).on('scroll', function(){
    if($('html').css('font-size')=='12px'){
      headerHeight=spHeaderHeight;
    } else {
      headerHeight=pcHeaderHeight;
    }
    if($(this).scrollTop() > headerHeight){
      $('#header').addClass('header-box-float');
      $('#main').css('margin-top', headerHeight);
    } else {
      $('#header').removeClass('header-box-float');
      $('#nav').css('margin-top', 0).removeClass('nav-1-open');
      $('#main').css('margin-top', 0);
      if($('#navIcon').hasClass('nav-icon-menu-close')){
        $('#navIcon').removeClass('nav-icon-menu-close').addClass('nav-icon-menu-open');
      }
    }
  });
}

(function($j){
    $j.ex = $j.ex || {};
    $j.ex.scrollEvent = function( target , config ){
        var o = this;
        if( typeof config == 'function') config = {
            callback : config
        }
        var c = o.config = $j.extend({},$j.ex.scrollEvent.defaults,config,{
            target : target
        });
        c.status = 0;
        c.scroll = o.getPos();
        c.target.scroll(function( evt ){
            if (o.isMove()) {
                c.status = (c.status == 0 ? 1 : (c.status == 1 ? 2 : c.status) );
                c.callback( evt , c );
            }
            if(c.tm) clearTimeout(c.tm);
            c.tm = setTimeout(function(){
                o.isMove();
                c.status = 0;
                c.callback( evt , c );
            },c.delay);
        });
    }
    $j.extend($j.ex.scrollEvent.prototype,{
        isMove : function(){
            var o = this, c = o.config;
            var pos = o.getPos();
            var scrollY = (pos.top != c.scroll.top);
            var scrollX = (pos.left != c.scroll.left);
            if(scrollY || scrollX){
                c.scrollY = scrollY;
                c.scrollX = scrollX;
                c.prevScroll = c.scroll;
                c.scroll = pos;
                return true;
            }
            return false;

        },
        getPos : function(){
            var o = this, c = o.config;
            return {
                top : c.target.scrollTop(),
                left : c.target.scrollLeft()
            }
        }
    });
    $j.ex.scrollEvent.defaults = {
        delay : 100
    }
    $j.fn.exScrollEvent = function( config ){
        new $j.ex.scrollEvent(this , config);
        return this;
    };
})(jQuery);

//
function setFloatBtn(btnBoxId,btnOuterBoxId,targetId){
  var windowHeight = 0;
  var btnBoxHeight = 0;
  var btnBoxOffsetBottom = 0;
  var btnBoxBottom = 0;
  var targetOffsetTop = 0;
  var targetHeight = 0;
  var timingAppear = 0;
  var timingStop = 0;
  $(window).on('load resize orientationchange ajaxStop',function(){
    windowHeight = $(window).innerHeight();
    btnBoxHeight = $('#'+btnBoxId).outerHeight();
    btnBoxOffsetBottom = $('#'+btnBoxId).offset().top+btnBoxHeight;
    btnBoxBottom = Number($('#'+btnBoxId).css('bottom').replace('px',''));
    targetOffsetTop = $('#'+targetId).offset().top;
    targetHeight = $('#'+targetId).innerHeight();
    timingAppear = targetOffsetTop-windowHeight+btnBoxHeight+targetHeight+btnBoxBottom;
    timingStop = btnBoxOffsetBottom-windowHeight+btnBoxBottom;

    //var btnBoxOuterHeight = $('#'+btnBoxId).outerHeight(true);
    $('#'+btnOuterBoxId).height(btnBoxHeight);
  });
  $(window).on('scroll load resize orientationchange ajaxStop',function(){
    var updateSwiperCase2 = function () {
      if (typeof window.floatBtnCase2Swiper !== 'undefined') {
        floatBtnCase2Swiper.slideReset();
        floatBtnCase2Swiper.update();
      }
      setTimeout(function() {
        updateSwiperCase2();
      }, 1500);
    };
    $(window).exScrollEvent(function(evt, prm){
      if(prm.status == 1){
        timingAppear = targetOffsetTop-windowHeight+btnBoxHeight+targetHeight+btnBoxBottom;
        timingStop = btnBoxOffsetBottom-windowHeight+btnBoxBottom;
      }
    });
    if($('#'+btnBoxId)){
      if($(this).scrollTop() >= timingAppear){
        if(!$('#'+btnBoxId).hasClass('visible')){
          $('#'+btnBoxId).addClass('visible');
        }
        if($(this).scrollTop() >= timingStop){
          if($('#'+btnBoxId).hasClass('fixed')){
            $('#'+btnBoxId).removeClass('fixed');
          }
        } else {
          if(!$('#'+btnBoxId).hasClass('fixed')){
            $('#'+btnBoxId).addClass('fixed');
          }
        }
        updateSwiperCase2();
      } else {
        if($('#'+btnBoxId).hasClass('visible')){
          $('#'+btnBoxId).removeClass('visible');
          updateSwiperCase2();
        }
      }
    }
  });
}

//写真を正方形にする
function squarePhoto(className){
  $(window).on('load resize orientationchange',function(){
    _makeItSquare(className);
  });

  $('.' + className).each(function(){
    var imgw = $(this).find('img').width();
    var imgh = $(this).find('img').height();

    if(imgh < 125) {
      $(this).find('img').css('height', '125px');
    }
    $(this).find('img').css('width', 'auto');

    if (imgh === 0) {
      _makeItSquare(className);
    }
  });
}

function _makeItSquare (_className) {
  var imageTarget = $('.' + _className);
  imageTarget.height(imageTarget.width());
}
function setContractTerm(term, logoId) {
  localStorage.setItem('contract_term', term);
  // only input 1 or 2
  if (logoId !== 1) {
    logoId = 2;
  } else {
    logoId = 1;
  }
  localStorage.setItem('logo_id', logoId);
}

// display contract term year in header logo
(function displayContractTerm() {
  var logoId = localStorage.getItem('logo_id');
  var headerLogo = $('.header-logo-a');

  // find filename
  var fileName = window.location.href.replace(/^.*[\\\/]/, '');

  // remove query params
  fileName = fileName.replace(/[?].*$/, '');

  if (logoId != null && logoId.length > 0 && headerLogo.length > 0 && fileName !== '/') {
    if (parseInt(logoId) === 2) {
      headerLogo.addClass('header-logo-next-term');
    }
  }

  // Change the document title of page top after selecting term
  if(fileName === "/2021") {
    document.title = (parseInt(logoId) === 2 ? "2022" : "2021") + document.title;
  }
})();

<!-- Global site tag (gtag.js) - Google Analytics -->
window.dataLayer = window.dataLayer || [];

function gtag(){
  dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', 'UA-65746218-1');

// Google Tag Manager
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });
  var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-TR6KZD');

//=============================== POLYFILL FOR IE ================================================
// Object.assign()
if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

// String.prototype.includes()
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';

    if (search instanceof RegExp) {
      throw TypeError('first argument must not be a RegExp');
    }
    if (start === undefined) { start = 0; }
    return this.indexOf(search, start) !== -1;
  };
}

// new URL() & url.searchParams.get()
if (typeof URL !== "function") {
  function URL(_url) {
    this.url = _url;
    this.searchParams = {
      get: function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(_url);
        if (results == null) {
          return null;
        } else {
          return decodeURI(results[1]) || 0;
        }
      }
    }
  }
}

// Array.prototype.find()
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}

// Object.values()
if(!Object.values) {
  Object.values = function(obj) {
    return Object.keys(obj).map(function(e) {
      return obj[e]
    });
  }
}

// Number.parseInt()
if (!Number.parseInt) {
  Number.parseInt = window.parseInt
}

// Array.prototype.findIndex()
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    },
    configurable: true,
    writable: true
  });
}

//=============================== ADD CONTRACT TERM ================================================
// Add contract year to href
function toLocationHref(path) {
  if (typeof isApplican !== "undefined" && isApplican) {
    location.href = 'local://' + path;
  } else {
    var contractTerm = globalInfo("contract_term");
    location.href = "/" + contractTerm + path;
  }
}

// List allow (class and id) access for content page
var contentAllowButtons = {
  spi_3: {
    id: ['prev', 'next', 'btnBackToTop', 'finishQuiz', 'navIcon', 'nav1LiIcon', 'nav1ArrowIcon','nav-2-submenu', 'resetPartner'],
    class: ['submenu-nav-li nav-ul-2-li-a','submenu-nav-li nav-ul-2-li-a nav-2-submenu-open', 'nav-2-has-submenu-arrow', "nav-ul-3-li-a js-choose-partner"]
  },
  tamatebako_test_3: {
    id: ['prev', 'next', 'finishBelow', 'finishOn', 'btnBackToTop', 'next-button', 'back-button', 'finishBelow', 'nav1LiIcon', 'navIcon', 'resetPartner'],
    class: ['next-button', 'back-button', 'submenu-nav-li nav-ul-2-li-a','submenu-nav-li nav-ul-2-li-a nav-2-submenu-open', 'nav-2-has-submenu-arrow', "nav-ul-3-li-a js-choose-partner"]
  },
  tamatebako_drill_3: {
    id: ['button-prev-question', 'button-next-question', 'btn-finish', 'finish-quiz', 'nav1LiIcon', 'navIcon', 'resetPartner', 'btnBackToTop'],
    class: ['submenu-nav-li nav-ul-2-li-a','submenu-nav-li nav-ul-2-li-a nav-2-submenu-open', 'nav-2-has-submenu-arrow', "nav-ul-3-li-a js-choose-partner"]
  }
};

$(document).on('click', 'a', function (e) {
  var href = $(this).attr("href") || "";

  // Check whether the href is one of those path which is no need of attached contract term year
  var noAttachedPathList = ["tamatebako_drill_3", "tamatebako_test_3", "spi_3"];
  var currentPath = noAttachedPathList.filter(function(path) {
    return location.href.includes(path);
  })[0];

  if(currentPath) {
    return hdContentHref(e, href, currentPath);
  }
  return hdSystemHref(e, href);
});

function hdSystemHref(e, href) {
  // Check is absolute path
  var isAbsolutePath = href[0] === "/";

  if(isAbsolutePath) {
    e.preventDefault();
    e.stopImmediatePropagation();
    toLocationHref(href);
  }
}

function hdContentHref(e, href, allowContentSet) {
  var list = contentAllowButtons[allowContentSet];
  var allowId = _.includes(list.id, e.target.id);
  var allowClass = _.includes(list.class, e.target.className);
  if (!allowId && !allowClass) {
    e.stopImmediatePropagation();
    e.preventDefault();

    var isAbsolutePath = (href[0] === "/");
    if (isAbsolutePath) {
      var r = confirm("このまま移動した場合、未回答の問題は間違いとして処理されます。\n" + "移動してよろしいですか？");
      r && toLocationHref(href)
    } else if (href[0] === "h") {
      var r = confirm("このまま移動した場合、未回答の問題は間違いとして処理されます。\n" + "移動してよろしいですか？");
      if (r) {
        window.location.href = href
      }
    }
  }
}

function replaceContractTerm2022 () {
  var contractTerm = globalInfo("contract_term");
  document.body.innerHTML = document.body.innerHTML.replace(/2021/g, contractTerm);
  document.title = document.title.replace(/2021/g, contractTerm);
}
// This function be used for join url
function concatAndResolveUrl(url, concat) {
  var url1 = url.split('/');
  var url2 = concat.split('/');
  var url3 = [ ];
  for (var i = 0, l = url1.length; i < l; i ++) {
    if (url1[i] == '..') {
      url3.pop();
    } else if (url1[i] == '.') {
      continue;
    } else {
      url3.push(url1[i]);
    }
  }
  for (var i = 0, l = url2.length; i < l; i ++) {
    if (url2[i] == '..') {
      url3.pop();
    } else if (url2[i] == '.') {
      continue;
    } else {
      url3.push(url2[i]);
    }
  }
  return url3.join('/');
}
function fixPathForContentPage(path) {
  if (typeof path !== 'string') return path;
  // TODO: fix relative and absolute path
  // Except: http/https/data/base64 source
  var result = path.replace(/src=(['"])(?!http|https|\/\/|data:)([^\s]{2,})(['"])/gm, function (match, p1, p2, p3) {
    if (p2[0] === '/') {
      return 'src=' + p1 + domain + p2 + p3;
    }
    // don't input '/' character in the last of dummy URL
    return 'src=' + p1 + concatAndResolveUrl(domain + '2022/contents/dummy_page', p2) + p3;
  });
  return result;
}
