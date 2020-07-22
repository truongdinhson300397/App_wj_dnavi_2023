// 各ページURL
var apiUrl = 'https://admin.shukatsu.jp/api/v1',
  registUrl = link.regist,
  mypageUrl = link.myPageTop, // '/mypage/top',
  loginUrl = link.loginUser, // '/login/user',
  resetRequestUrl = link.reminder, // '/reminder',
  companySearchUrl = link.companyList, // '/company/list',
  companyDetailUrl = link.companyDetail, // '/company/detail',
  recruitEntryUrl = link.entryRecruitguide, // '/entry/recruitguide',
  internshipsEntryUrl = link.entryInternship, // '/entry/internship',
  imageSearchUrl = link.companyImage, // '/company_image',
  noimageUrl = assetsPath + 'img/noimg320.png',
  parame = new Object;


// ログイン状態確認
function loginStatus() {
  var contractTermId = globalInfo("contract_term_id");
  var jwt = globalInfo('jwt_' + contractTermId);
  if (jwt == '' || jwt == 'null' || jwt == undefined) {
    noLoginRedirect();
  } else {
    $.ajax({
      url: apiUrl + '/students/check_token',
      type: 'get',
      headers: {
        'Authorization': 'Bearer ' + jwt,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      success: function (data) {
//					console.log(data);
        logined();
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
//					console.log(errorThrown);
//					console.log(textStatus);
//					console.log(XMLHttpRequest);
      }
    });
  }
}

// ログイン時メニュー切り替え、クッキー削除等
function logined() {
  $('.nav-nologin').remove();
  removeGlobalInfo('returnUrl', {path: '/'});
  $('.article-box h1').html('ログイン中です');
  $('body').fadeIn();
}

// 非ログイン時、現ページ記録＆ログインページへリダイレクト
function noLoginRedirect() {
  $('.nav-logined').remove();
  var returnUrl = $(location).attr('pathname');
  globalInfo('returnUrl', returnUrl, {expires: 1, path: "/"});
  toLocationHref(loginUrl);
}



function formAdjust(a) {

  // 配列チェックしてbooleanのものを文字列に
  for (i = a.length - 1; i > -1; i--) {

//			console.log('');
//			console.log(a[i]);
//			console.log(typeof( a[i]["value"]) );
//			console.log(a[i]["value"]);

    // true / falseを1/0変換
    if (a[i]['value'] == 'true') {
      a[i]['value'] = Boolean('true');
    } else if (a[i]['value'] == 'false') {
      a[i]['value'] = Boolean('');
    } else if (a[i]['value'] == '') {
      a[i]['value'] = null;
    }
  }

  // nameに[]が含まれるものをカンマを付けてまとめる
  var p = [];

  for (i = a.length - 1; i > -1; i--) {
    var n = a[i]['name'];
    if (n.match(/\[\]/)) {
      n = n.replace(/\[\]/g, '');
      if (!p[n]) {
        p[n] = [];
      }
      p[n] = a[i]['value'] + ',' + p[n];
      a.splice(i, 1);
    }
  }

  // カンマを付けてまとめたものを配列に戻す
  for (key in p) {
    p[key] = p[key].replace(/\,$/g, '');
    a.push({name: key, value: p[key]});
  }
//		console.log(p);

  // 整理できた配列を検索APIに投げやすいようにオブジェクト形式に変更
  var obj = {};
  for (i in a) {
    obj[a[i]['name']] = a[i]['value'];
  }
  return obj;
}

// URLパラメーター変数化;

function parameCheck() {
  url = location.search.substring(1).split('&');
  for (i = 0; url[i]; i++) {
    var k = url[i].split('=');
    parame[k[0]] = k[1];
  }
}

smoothScroll();

function smoothScroll() {
  $(document).on('click', 'a[href^="#"]', function () {
    var scrollOffset = 100;
    var speed = 400; // ミリ秒
    var href = $(this).attr('href');
    var target = $(href == '#' || href == '' ? 'html' : href);
    var position = target.offset().top - scrollOffset;
    $('body,html').animate({scrollTop: position}, speed, 'swing');
    return false;
  });
}
