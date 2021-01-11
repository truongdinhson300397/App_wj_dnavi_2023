var global = {
  apiUrl: rootVariables.apiUrl
};
var inputHelper = new InputHelper();
var preventNonNumericalInput = inputHelper.preventNonNumericalInput;
// var validateKana = inputHelper.validateKana;
// var validateKanji = inputHelper.validateKanji;

_headerUIHandler(null, null, null);

var contractTermId = globalInfo('contract_term_id');
var contractTerm = globalInfo('contract_term');

function _fetchPrefectureByGroup() {
  $.ajax({
    url: rootVariables.apiUrl + '/prefecture_by_group',
    dataType: 'json',
    type: 'GET',
    headers: {
      contentType: 'application/json',
      accept: 'application/json'
    },
    success: function (res) {
      var prefectureGrs = res.data;
      if (prefectureGrs.length > 0) {
        _dumpPrefecture(prefectureGrs);
      }
    },
    error: function (jqXhr, textStatus, errorThrown) {
      console.log(errorThrown);
    }
  });
}

function _dumpPrefecture(prefectureGrs) {
  var $workingPlaceWrap = $('#working_place_wrap');
  $workingPlaceWrap.html('');
  prefectureGrs.forEach(function (prefectureGr) {
    var $catettl = $('<div class="category-ttl">' + prefectureGr.group_name + '</div>');
    $workingPlaceWrap.append($catettl);
    var $checkBoxBody = $('<div class="search-checkbox-body"></div>');
    var attrs = prefectureGr.attributes;
    if (attrs && Array.isArray(attrs)) {
      attrs.forEach(function (prefec) {
        var _item = '<label class="label-default w8em">' +
          '<input type="checkbox" class="input-check postdata" name="working_place[]" value="' + prefec.prefecture_id + '">' +
          '<span class="checkbox-span"></span> <span class="text">' + prefec.prefecture + '</span>' +
          '</label>';
        $checkBoxBody.append(_item);
      });
    }
    $workingPlaceWrap.append($checkBoxBody);
  });
}

function formTel(parts) {
  return parts.reduce(function(a, n) {
    a += $('#' + n).val();
    return a;
  }, '');
}

function disableFlagIfEmpty(parts, checkBoxName) {
  var phone = formTel(parts);
  var $selectCheckbox = $("[name='" + checkBoxName + "']");
  if (phone.length === 0) {
    $selectCheckbox.prop('checked', false).prop('disabled', true);
  } else {
    $selectCheckbox.prop('disabled', false);
  }
}

function checkFlagAndOnChange() {
  disableFlagIfEmpty(['mobile1', 'mobile2', 'mobile3'], 'mobile_flg1');
  disableFlagIfEmpty(['tel1', 'tel2', 'tel3'], 'mobile_flg2');
  disableFlagIfEmpty(['home_tel1', 'home_tel2', 'home_tel3'], 'mobile_flg3');
  onChangePhone(['mobile1', 'mobile2', 'mobile3'], 'mobile_flg1');
  onChangePhone(['tel1', 'tel2', 'tel3'], 'mobile_flg2');
  onChangePhone(['home_tel1', 'home_tel2', 'home_tel3'], 'mobile_flg3');
}

function checkForSelectMobileType () {
  return function(parts, checkBoxName) {
    var tel = formTel(parts);
    var $selectCheckbox = $("[name='" + checkBoxName + "']");

    if (tel.length === 0) {
      $selectCheckbox.prop('checked', false).prop('disabled', true);
    }

    if (tel.length !== 0 && $selectCheckbox.prop('disabled')) {
      $selectCheckbox.prop('disabled', false);
    }
  }
}

function isValidNumber(parts) {
  var numString = formTel(parts);
  var numberRegex = /[^0-9]/g;
  var isValid = numString.match(numberRegex) === null;
  if (!isValid) {
    parts.forEach(function(t) {
      $('#' + t).addClass('error');
    });
  }
  return isValid;
}

function isMobileFormat (parts) {
  var mobileNum = formTel(parts);
  // ([0-9]){2,5}-([0-9]){1,4}-([0-9]){4}
  var isCorrect = mobileNum.length >= 7 && mobileNum.length <= 13;
  if (!isCorrect) {
    parts.forEach(function(t) {
      $('#' + t).addClass('error');
    });
  }
  return isCorrect;
}

function isEmptyMobile (parts, highlightPlace) {
  highlightPlace = highlightPlace || false;
  var mobileNum = formTel(parts);
  if (mobileNum.length === 0 && highlightPlace) {
    parts.forEach(function(t) {
      $('#' + t).addClass('error');
    });
  }
  return mobileNum.length === 0;
}

function onChangePhone(parts, flag) {
  // Add # to turn each of them to id for selecting
  var selectors = parts.map(function(p) {
    return "#" + p;
  }).join(", ");
  $(selectors).on('keydown keyup keypress change', (checkForSelectMobileType()).bind(this, parts, flag));
}

$(document).ready(function () {
    // Hide back step in first access
    $("#back-step-1").hide();
    $("#back-step-2").hide();

    // Hide temporary section whether in temporary mode
    var isTemporaryMode = location.href.includes('?mode=temporary');
    if(isTemporaryMode){
      $(".temporary_notice").hide();
    } else {
      checkFlagAndOnChange();
    }

    // 変数設定
    var renderCallCount = 0;
    var renderedCount = 0;

    var temporaryUserInfo = '';
    var temporaryUserInfoArry = '';

    var modeApi = '/students/signup';
    var modeMethod = 'post';

    // URLパラメーター確認
    parameCheck();
    var mode = parame.mode;

    var alertBox = $('#regist-header .alert-box');

// 次へボタン（会員登録確認1）
    $('#regist1-btn').on('click', function () {
      regist1Check();
    });
// 確認ボタン（会員登録確認2）
    $('#regist2-btn').on('click', function () {
      regist2Check();
    });
// キャンセルボタン（同意しない）
    $('#regist-cancel-btn').on('click', function (e) {
      var isSure = confirm("登録せずにトップページに戻ります。よろしいでしょうか。");
      if(isSure) {
        window.location.href = `/${contractTerm}`;
      }
    });
// 登録確認ボタン（同意）
    $('#regist-confirm-btn').on('click', function () {
      $(this).off('click');
      memberRegist();
    });

    // back step click
    $("#back-step-1").on("click", returnToStep.bind(this, 1));
    $("#back-step-2").on("click", returnToStep.bind(this, 2));


// 住所検索入力
    $('.addres-search').on('click', function () {
      var prefix = '';
      if ($(this).hasClass('home')) {
        // home対応
        prefix = 'home_';
      }
//		console.log(prefix);
      addressInput(prefix, displaySelectPostCode);
    });

// 休暇中の連絡先チェック処理
    $('#is_same_address').on('click', function () {
      isSameAddressCheck();
    });

    function isSameAddressCheck() {
      $('#home_address').slideToggle();
      $('#home_zip1,#home_zip2,#home_prefecture_name,#home_city_name,#home_address_line1').removeClass('error');
      $("[name='mobile_flg3']").prop('checked', false);
      if ($('#is_same_address').prop('checked') == true) {
          $('#is_same_address').val('true');
          $('#is_same_address').attr('checked', 'checked');
        $('#home_address input').val('');

        // Reassign value of mobile_flg3
        var mobileFlg3 = $("input[name='mobile_flg3']");
        $(mobileFlg3[0]).val("false");
        $(mobileFlg3[1]).val("true");

        $('#home_zip1,#home_zip2,#home_prefecture_name,#home_city_name,#home_address_line1').removeClass('require');
      } else {
          $('#is_same_address').val('false');
          $('#is_same_address').removeAttr('checked');
          $('#home_prefecture_name').val('');
          $('#home_city_name').val('');
        $('#home_zip1,#home_zip2,#home_prefecture_name,#home_city_name,#home_address_line1').addClass('require');
      }
    }

// 半角英数に変換
    $('.input_alphanumeric').on('blur', function () {
      var str = $(this).val();
      $(this).val(convertAlpha(str));
    });

    function convertAlpha(str) {
      return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
    }

// ひらがなをカタカナに変換
    $('.input_2byte_kana').on('blur', function () {
      var str = $(this).val();
      $(this).val(convertKanakana(str));
    });

    function convertKanakana(str) {
      return str.replace(/[ぁ-ん]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) + 0x60);
      });
    }

// masterRadioCheckRender(input-type, insert-id, item-require or nomal/enquret, api-chara);
// 学校種別レンダリング university_type
    masterRadioCheckRender('radio', 'university_type', 'require', 'university_type');

// 文系・理系区分レンダリング department_type
    masterRadioCheckRender('radio', 'department_type', 'require', 'department_type');

// 学部学科系統レンダリング
    masterSelectRender('department_category', 'department_categories');

// きっかけをレンダリング
    masterRadioCheckRender('checkbox', 'entry_reason', 'nomal', 'entry_reason');

// 志望職種をレンダリング
    masterRadioCheckRender('checkbox', 'job_category', 'enquate', 'categories');

// 志望業種をレンダリング
    masterRadioCheckRender('checkbox', 'industry_type', 'enquate', 'industry_types');

// 保有資格をレンダリング
    masterRadioCheckRender('checkbox', 'qualification', 'enquate', 'qualifications');

    _fetchPrefectureByGroup();


//// 学校選択モーダルレンダリング
    //タブレンダリング
    universityTypeTabRender();

    // タブ用大学種別取得
    function universityTypeTabRender() {
      $.ajax({
        url: global.apiUrl + '/master_data/university_type',
        type: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {
          tabRender(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
//				console.log(errorThrown);
//				console.log(textStatus);
//				console.log(XMLHttpRequest);
        }
      });
    }

    function showStep1() {
      $('#regist2').hide();
      $('#regist2-next').hide();
      $('#regist').toggleClass('confirm-mode').toggleClass('input-mode');
      flowChange('会員登録 1', 'flow1');
      $('#regist1').fadeIn();
      $('#regist1-next').fadeIn();
    }

    function showStep2() {
      $('#regist1').hide();
      $('#regist1-next').hide();
      $('#regist').toggleClass('confirm-mode').toggleClass('input-mode');
      flowChange('会員登録 2', 'flow2');
      $('#regist2').fadeIn();
      $('#regist2-next').fadeIn();
    }

    function returnToStep(step) {
      if(step === 1) showStep1();
      if(step === 2) showStep2();
      scrollTop();
      $('#kiyaku').hide();
      $('#complete-cancel').hide();
    }

    // タブレンダリング
    function tabRender(data) {
      var tabs = '';
      for (var num in data['data']) {
        var dataNum = data['data'][num]['item_key'];
        var dataName = data['data'][num]['item_value'];
        var tab = '<li class="school-tabs-ul-li" data-universityType="' + dataNum + '">' + dataName + '</li>';
        tabs = tabs + tab;
      }
      $('#modalScool .school-tabs-ul').html(tabs);
      tabFunc();
    }

    // タブ挙動
    function tabFunc() {
      $('.school-tabs-ul-li').on('click', function () {
        $('.school-tabs-ul-li').removeClass('active');
        $(this).addClass('active');
      });
    }


// 学校名検索
    schoolSearchBtn();
    schoolFirstLetter();

    // 学校名検索ボタン挙動
    function schoolSearchBtn() {
      $('#school-search-btn').on('click', function () {
        $('.tbl-school-first-letter a').removeClass('btn-green');
        $('.school-list').html('<li><p>学校名の頭文字をクリックしてください。</p></li>');
        $('.school-tabs-ul-li').removeClass('active');
        var selectUnivType = $('input[name="university_type"]:checked').val();
        $('.school-tabs-ul-li').each(function () {
          if ($(this).data('universitytype') == selectUnivType) {
            $(this).addClass('active');
          }
        });
      });
    }

    // 大学名頭文字選択時
    function schoolFirstLetter() {
      $('.tbl-school-first-letter a').on('click', function () {
        $('.tbl-school-first-letter a').removeClass('btn-green');
        $(this).addClass('btn-green');
        var schoolType = $('.school-tabs-ul-li.active').data('universitytype');
        var schoolKana = $(this).data('kana');
        shoolRender(schoolType, schoolKana);
      });
    }

    // 学校情報取得
    function shoolRender(schoolType, schoolKana) {
      $.ajax({
        url: global.apiUrl + '/master_data/universities?university_type=' + schoolType + '&university_kana=' + encodeURI(schoolKana),
        type: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {
          schoolListRender(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          schoolListRender('error');
				  // console.log(errorThrown);
				  // console.log(textStatus);
				  // console.log(XMLHttpRequest);
        }
      });
    }

    // 学校リスト レンダリング
    function schoolListRender(data) {
      var schoolList = '';
      if (data == 'error') {
          $('.school-list').html('<li>学校情報がありません</li>');
      } else {
        for (var num in data['data']) {
          var universityName = data['data'][num]['university'];
          var universityCode = data['data'][num]['university_code'];
          schoolList = schoolList + '<li><span data-univcode="' + universityCode + '">' + universityName + '</span></li>';
        }
        $('.school-list').html(schoolList);
        schoolSelect();
      }
      $('#modalScool .modal-body').animate({
        scrollTop: $(".school-list").offset().top - 800
      }, 1500);
    }

    // 学校 選択時挙動
    function schoolSelect() {
      $('.school-list li span').on('click', function () {
        // 学部・研究科等、学科・専攻等を一旦リセット
        $('#department,#department_code,#section,#section_code').val('');
        // 学校名・学校コード挿入
        $('#university').val($(this).html());
        var univCode = $(this).data('univcode');
        $('#university_code').val(univCode);
        // 学校種別を強制切り替え
        var univTypeTabNum = $('.school-tabs-ul-li.active').data('universitytype');
        $('input[name="university_type"]').val([univTypeTabNum]);
        // 学部・研究科等のボタンをアクティブに
        $('#department-search-btn').addClass('btn-blue').removeClass('btn-disabled');
        // モーダル非表示
        $('#modalScool').fadeOut();
        $('#university').removeClass('error');
        $('#department_type').removeClass('error');
        departmentSearch();
      });
    }


// 学部・研究科等 選択
    function departmentSearch() {
      var univCode = $('#university_code').val();
      $.ajax({
        url: global.apiUrl + '/master_data/universities?university_code=' + univCode,
        type: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {
          departmentListRender(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          departmentListRender('error');
//				console.log(errorThrown);
//				console.log(textStatus);
//				console.log(XMLHttpRequest);
        }
      });
    }

    // 学部・研究科等 レンダリング
    function departmentListRender(data) {
      // 学校名挿入
      $('#modalDept .department-school-name').html($('#university').val());
      var departmentlList = '';
      if (data == 'error') {
        $('#modalDept .department-list-ul').html('<li>学部・研究科情報がありません</li>');
      } else {
        for (var num in data['data']) {
          var departmentName = data['data'][num]['department'];
          var departmentCode = data['data'][num]['department_code'];
          departmentlList = departmentlList + '<li><span data-depcode="' + departmentCode + '">' + departmentName + '</span></li>';
        }
        $('#modalDept .department-list-ul').html(departmentlList);
        departmentSelect();
      }
    }

    // 学部・研究科等 選択時挙動
    function departmentSelect() {
      $('#modalDept .department-list-ul li span').on('click', function () {
        // 学科・専攻等を一旦リセット
        $('#section,#section_code').val('');
        // 学部・研究科名・コード挿入
        $('#department').val($(this).html());
        var depCode = $(this).data('depcode');
        $('#department_code').val(depCode);
        // 学科・専攻等のボタンをアクティブに
        $('#section-search-btn').addClass('btn-blue').removeClass('btn-disabled');
        // モーダル非表示
        $('#modalDept').fadeOut();
        $('#department').removeClass('error');
        sectionSearch();
      });
    }


// 学科・専攻等選択
    function sectionSearch() {
      var univCode = $('#university_code').val();
      var depCode = $('#department_code').val();
      $.ajax({
        url: global.apiUrl + '/master_data/universities?university_code=' + univCode + '&department_code=' + depCode,
        type: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {
          sectionListRender(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          sectionListRender('error');
//				console.log(errorThrown);
//				console.log(textStatus);
//				console.log(XMLHttpRequest);
        }
      });
    }

    // 学科・専攻等 レンダリング
    function sectionListRender(data) {
      // 学校名・学部名挿入
      $('#modalCourse .department-school-name').html($('#university').val() + ' ' + $('#department').val());
      var sectioinList = '';
//		console.log(data);
      if (data == 'error') {
        $('#modalCourse .department-list-ul').html('<li>学科・専攻情報がありません</li>');
      } else {
        for (var num in data['data']) {
          var sectionName = data['data'][num]['section'];
          var sectionCode = data['data'][num]['section_code'];
          var depType = data['data'][num]['department_type'];
          sectioinList = sectioinList + '<li><span data-seccode="' + sectionCode + '" data-deptype="' + depType + '">' + sectionName + '</span></li>';
        }
        $('#modalCourse .department-list-ul').html(sectioinList);
        sectionSelect();
      }
    }

    // 学科・専攻等 選択時挙動
    function sectionSelect() {
      $('#modalCourse .department-list-ul li span').on('click', function () {
        // 学科・専攻等名・コード挿入
        $('#section').val($(this).html());
        var secCode = $(this).data('seccode');
        $('#section_code').val(secCode);
        // 文系・理系区分を強制切り替え
        var depType = $(this).data('deptype');
        $('input[name="department_type"]').val([depType]).removeClass('error');
        // モーダル非表示
        $('#modalCourse').fadeOut();
        $('#section').removeClass('error');
      });
    }

// 文系・理系区分リセット
    function departmentTypeReset() {
      $('input[name="department_type"]').prop('checked', false);
    }

// 手入力系
    // 学校名
    schoolManualInput();

    function schoolManualInput() {
      $('#school-name-manual').on('click', function () {
        var schoolName = $('#school-name-manual-input').val();
        if (schoolName != '') {
          $('#university').val(schoolName);
          $('#university_code').val('');
          $('#department').val('');
          $('#department_code').val('');
          $('#section').val('');
          $('#section_code').val('');
          // 学部・研究科等のボタンをアクティブに
          $('#department-search-btn').addClass('btn-blue').removeClass('btn-disabled');
          $('#modalScool').fadeOut();

          // handing show modalDept and modalCourse
          $('#modalDept .department-school-name').html(schoolName);
          $('#modalDept .department-list-ul').html('<li>学部・研究科情報がありません</li>');
          $('#modalCourse .department-school-name').html(schoolName);
          $('#modalCourse .department-list-ul').html('<li>学科・専攻情報がありません</li>');
        }
      });
    }

    // 学部・研究科等
    departmentManualInput();

    function departmentManualInput() {
      $('#department-name-manual').on('click', function () {
        var depName = $('#department-name-manual-input').val();
        if (depName != '') {
          $('#department').val(depName);
          $('#department_code').val('');
          $('#section').val('');
          $('#section_code').val('');
          // 学科・専攻等のボタンをアクティブに
          $('#section-search-btn').addClass('btn-blue').removeClass('btn-disabled');
          $('#modalDept').fadeOut();

          // handing show modalCourse
          $('#modalCourse .department-school-name').html($('#university').val() + ' ' + depName);
          $('#modalCourse .department-list-ul').html('<li>学科・専攻情報がありません</li>');
        }
      });
    }

    // 学科・専攻等
    sectionManualInput();

    function sectionManualInput() {
      $('#section-name-manual').on('click', function () {
        var secName = $('#section-name-manual-input').val();
        if (secName != '') {
          $('#section').val(secName);
          $('#section_code').val('');
          $('#modalCourse').fadeOut();
        }
      });
    }

// 上部に戻る
    function scrollTop() {
      $('body, html').animate({scrollTop: 0}, 500);
    }

// masterデータからinput radioレンダリング
    function masterRadioCheckRender(type, renderId, require, api) {
      renderCallCount++;
      $.ajax({
        url: global.apiUrl + '/master_data/' + api + '?per_page=999',
        type: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {
          // アンケート系の時は処理分け
          if (require == 'enquate') {
            enquateRender(type, renderId, require, data);
          } else {
            inputRender(type, renderId, require, data);
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
//				console.log(errorThrown);
//				console.log(textStatus);
//				console.log(XMLHttpRequest);
        }
      });
    }

    // ラジオボタンレンダリング
    function inputRender(_type, _renderId, _require, _data) {
      // 挿入データ変数
      var labels = '';
      // タイプ判別
      if (_type == 'radio') {
        var typeClass = 'radio';
        var array = '';
      } else if (_type == 'checkbox') {
        var typeClass = 'check';
        var array = '[]';
      }

      for (var num in _data['data']) {
        var dataNum = _data['data'][num]['item_key'];
        var dataName = _data['data'][num]['item_value'];
        labels = labels + '<label class="label-default"><input type="' + _type + '" class="input-' + typeClass + ' ' + _require + ' postdata" name="' + _renderId + array + '" value="' + dataNum + '" /><span class="' + _type + '-span"></span> <span class="text">' + dataName + '</span></label>';
      }
      $('#' + _renderId + '_wrap').html(labels);
      univTypeCheck();
      inputErrorRemove();
      renderedCount++;
    }

    // アンケート系レンダリング
    function enquateRender(type, renderId, require, data) {
      // 挿入データ変数
      var labels = '';
      // 比較用初期値
      var dispClassCodeComp = '';
      for (var num in data['data']) {
        var dispClass = data['data'][num]['disp_class'];
        var dispClassCode = data['data'][num]['disp_class_code'];
        var category = data['data'][num][renderId];
        var categoryId = data['data'][num][renderId + '_id'];

        if (dispClassCodeComp != dispClassCode) {
          // dispClassCode(種別)が変わったら処理
          dispClassCodeComp = dispClassCode;
          // 1行目だけ処理しない
          if (dispClassCode != 1) {
            labels = labels + '</td></tr>';
          }
          // 種別が変わった時に行始まり＆見出し（th）追加
          labels = labels + '<tr><th>' + dispClass + '<div class="mgnt10-15 input-item"><label class="label-default check-all"><input type="checkbox" name="" class="input-check checkall" data-checkall="' + renderId + dispClassCode + '"><span class="checkbox-span"></span> 全て選択する</label></div></th><td class="label-columns">';
        }
        // 項目レンダリング
        labels = labels + '<label class="label-default"><input type="checkbox" class="input-check ' + renderId + dispClassCode + ' postdata" name="' + renderId + '[]" value="' + categoryId + '"><span class="checkbox-span"></span> <span class="text">' + category + '</span></label>';
      }
      // 最後にテーブル行閉じる
      labels = labels + '</td></tr>';
      $('#' + renderId + '_wrap').append(labels);
      // レンダリング後に関数呼び出し
      inputErrorRemove();
      checkAllCategory();
      checkAllremover();
      renderedCount++;
//		console.log('レンダリング終了カウント'+renderedCount);
    }

    // 入力時エラー解除
    function inputErrorRemove() {
      $('input').blur(function () {
        if ($(this).val() != '') {
          $(this).removeClass('error');
        }
      });
      $('input[type="radio"],input[type="checkbox"]').on('click', function () {
        var name = $(this).attr('name');
        $('input[name="' + name + '"]').removeClass('error');
      });
    }


// 学校種別選択
    function univTypeCheck() {
      $('input[name="university_type"]').change(function () {
        // 学校名、学部・研究科等、学科・専攻等、コードを一旦リセット
        $('#university,#university_code,#department,#department_code,#section,#section_code').val('');
        // 学部・研究科等、学科・専攻等の検索ボタンを非アクティブに
        $('#department-search-btn,#section-search-btn').addClass('btn-disabled').removeClass('btn-blue');
        // 学校名検索ボタンをアクティブに
        $('#school-search-btn').addClass('btn-blue').removeClass('btn-disabled');
      });
    }


// masterデータからselectレンダリング
    function masterSelectRender(renderId, api) {
      renderCallCount++;
      $.ajax({
        url: global.apiUrl + '/master_data/' + api + '?per_page=999',
        type: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {
          selectRender(renderId, data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
//				console.log(errorThrown);
//				console.log(textStatus);
//				console.log(XMLHttpRequest);
        }
      });
    }

    function selectRender(renderId, data) {
      var dataSelect = '<option value="">選択してください</option>';
      for (var num in data['data']) {
        var selectNum = data['data'][num][renderId + '_id'];
        var selectName = data['data'][num][renderId];
        dataSelect = dataSelect + '<option value="' + selectNum + '">' + selectName + '</option>';
      }
      $('#' + renderId).html(dataSelect);
      selectErrorRemove();
      renderedCount++;
//		console.log('レンダリング終了カウント'+renderedCount);
    }

    function selectErrorRemove() {
      $('select').change(function () {
        if ($(this).val() != '') {
          $(this).removeClass('error');
        }
      });
    }

    function _addressInputError($input, prefix) {
      $input.addClass('error');
      // append error text below zip fields
      $input.parents('.input-item').append('<p class="error-text">該当する郵便番号が見つかりませんでした。正しい郵便番号を入力してください。<br>新しい郵便番号の場合は反映までに時間がかかりますので、旧住所でご登録ください。</p>');

      //remove the val in home and city of previous search
      var _emptyTxt = null;
      $('[name=' + prefix + 'prefecture_name]').val(_emptyTxt);
      $('[name=' + prefix + 'prefecture_id]').val(_emptyTxt);

      $('[name=' + prefix + 'city_name]').val(_emptyTxt);
      $('[name=' + prefix + 'city_id]').val(_emptyTxt);
    }

// 郵便番号結合・住所・コード挿入
    function addressInput(prefix, fn, isBindingData) {
      isBindingData = isBindingData || false;
      var postCode = $('#' + prefix + 'zip1').val() + $('#' + prefix + 'zip2').val();
      $('#' + prefix + 'postcode').val(postCode);

      var $inputs = $('#' + prefix + 'zip1,#' + prefix + 'zip2');
      $inputs.removeClass('error');
      // remove error text
      $inputs.parents('.input-item').find('.error-text').remove();

      // this function is used to call error when ajax canot find given postcode
      // binding the $input for using in fail function
      var _callWhenError = _addressInputError.bind(null, $inputs, prefix);

      if (!postCode) {
        _callWhenError();
      } else {
        addressDataGet(postCode).done(function (result) {
          var arr = [];
          arr.push.apply(arr, result.data);
          fn(arr, prefix, isBindingData);
        }).fail(function (result) {
          // 失敗
          _callWhenError();
        });
      }
    }

    function displaySelectPostCode(result, prefix, isBindingData) {
      // Show the selection postcode box
      displayPostCodeBox(result, prefix);

      $('#modalPostCode .postcode-list-ul li span').on('click', function (e) {
        hideModal("modalPostCode");
        var data = $(e.target).parent("li").data("data");

        $('#' + prefix + 'prefecture_name').val(trimStr(data['todoken_kanji'])).removeClass('error');
        $('#' + prefix + 'prefecture_id').val(data['prefecture_id']).removeClass('error');

        if(data['matimei_kanji'] !== null) $('#' + prefix + 'address_line1').val(trimStr(data['matimei_kanji'])).removeClass("error");

        $('#' + prefix + 'city_name').val(trimStr(data['shikumatimura_kanji'])).removeClass('error');
        $('#' + prefix + 'city_id').val(data['public_code']).removeClass('error');
      });
    }

    function inputPostCode(result, prefix, isBindingData) {
      var cityId = temporaryUserInfoArry[prefix + 'city_id'];
      var prefectureId = temporaryUserInfoArry[prefix + 'prefecture_id'];
      if(cityId !== null) {

        var data = result.filter(function(r) {
          return r.public_code === cityId.toString();
        }).filter(function(r) {
          return r.prefecture_id === prefectureId;
        })[0];

        $('#' + prefix + 'prefecture_name').val(trimStr(data['todoken_kanji'])).removeClass('error');
        $('#' + prefix + 'prefecture_id').val(data['prefecture_id']).removeClass('error');

        if (!isBindingData && data['matimei_kanji'] !== null) {
          $('#' + prefix + 'address_line1').val(trimStr(data['matimei_kanji'])).removeClass("error");
        }

        $('#' + prefix + 'city_name').val(trimStr(data['shikumatimura_kanji'])).removeClass('error');
        $('#' + prefix + 'city_id').val(data['public_code']).removeClass('error');
      }
    }

    function concatKanji(kj) {
      var rs = "";
      if(kj.todoken_kanji !== null) rs += kj.todoken_kanji;
      if(kj.shikumatimura_kanji !== null) rs += kj.shikumatimura_kanji;
      if(kj.matimei_kanji !== null) rs += kj.matimei_kanji;
      return rs;
    }

    function displayPostCodeBox(postcodes, prefix) {
      $(".postcode-list-ul").empty();

      postcodes.forEach(function(v) {
        var code = $('#' + prefix + 'zip1').val() + "-" + $('#' + prefix + 'zip2').val();
        var postCodeHtml = $('<li><span>' + code + '</span> <span>' + concatKanji(v) + '</span></li>');

        // attach the data
        postCodeHtml.data("data", v);

        $(".postcode-list-ul").append(postCodeHtml);
      });

      showModal("modalPostCode");
    }

    // 住所情報取得
    function addressDataGet(postCode) {
      return $.ajax({
        url: global.apiUrl + '/master_data/posts?post_code=' + postCode,
        type: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
//				console.log(errorThrown);
        }
      });
    }


// 会員登録1入力チェック
    function regist1Check() {

      alertBox.hide().html('');
      var regist1checker = '';
      var loginId = $('#login_id').val();
      var password = $('#password').val();
      var passwordConf = $('#password_conf').val();
      var familyName = $('#family_name').val();
      var givenName = $('#given_name').val();
      var familyNameKana = $('#family_name_kana').val();
      var givenNameKana = $('#given_name_kana').val();
      var email1 = $('#email1').val();
      var email2 = $('#email2').val();
      var temporaryId = $('#temporary_id').val();

      $('[name="contract_term_id[]"]').prop('checked', false);
      $('[name="contract_term_id[]"][value="' + contractTermId + '"]').prop('checked', true);

      // register temporary member to member
      // and contracterm 2021 then check all
      if(isTemporaryMode) {
        for (key in temporaryUserInfoArry.user_contract_term) {
          if (temporaryUserInfoArry.user_contract_term[key].contract_term_id == 1) {
            $('[name="contract_term_id[]"][value="1"]').prop('checked', true);
          } else if (temporaryUserInfoArry.user_contract_term[key].contract_term_id == 2) {
            $('[name="contract_term_id[]"][value="2"]').prop('checked', true);
          }
        }
        if(contractTermId === '1') {
          $('[name="contract_term_id[]"][value="1"]').prop('checked', true);
        }
        if(contractTermId === '2') {
          $('[name="contract_term_id[]"][value="2"]').prop('checked', true);
        }
      }

      // Validate if not empty
      var isError = 0;
      $('#regist1 .require').each(function (index, element) {
        if ($(this).val() == '') {
          $(this).addClass('error');
          isError += 1;
        }
      });

      if(isError > 0) {
        regist1checker = regist1checker + 'error';
        alertBox.append('<p>入力必須項目を確認してください</p>');
      }

      if(isError === 0) {
        // ユーザーID 桁数チェック
        if (loginId.length < 6 || loginId.length > 20 || !/(^[a-zA-Z0-9])+([a-zA-Z0-9.\-\_@]*)$/.test(loginId)) {
          $('#login_id').addClass('error');
          regist1checker = regist1checker + 'error';
          alertBox.append('<p>ユーザーIDは以下の条件で入力してください。' +
            '<br>・6文字以上20文字以内' +
            '<br>・頭文字半角英字' +
            '<br>・許可記号(「_」(アンダーバー)、「@」(アットマーク)、「.」(ピリオド)、「-」(ハイフン))</p>');
        } else {
          $('#login_id').removeClass('error');
        }

        // パスワード 桁数・同一チェック
        if (password.length < 6 || password.length > 20) {
          $('#password,#password_conf').addClass('error');
          regist1checker = regist1checker + 'error';
          alertBox.append('<p>パスワードは6〜20文字で入力してください。</p>');
        } else if (!/^[0-9a-zA-Z]+$/.test(password)) {
          $('#password,#password_conf').addClass('error');
          regist1checker = regist1checker + 'error';
          alertBox.append('<p>パスワードは半角英数字で入力してください 。</p>');
        } else {
          $('#password,#password_conf').removeClass('error');
          // パスワード同一チェック
          if (password != passwordConf) {
            $('#password,#password_conf').addClass('error');
            regist1checker = regist1checker + 'error';
            alertBox.append('<p>パスワードとパスワード確認が一致しません。</p>');
          } else {
            $('#password,#password_conf').removeClass('error');
          }
        }

        // メールアドレスに@が含まれているかどうか
        // if ($('#email1').val().indexOf('@') === -1) {
        //   $("#email1").addClass("error");
        //   regist1checker = regist1checker + 'error';
        //   alertBox.append('<p>mising @</p>');
        // }

        // if(!/^[ァ-・ヽヾ゛゜ー]$/.test(familyNameKana)) {
        //   regist1checker = regist1checker + 'error';
        // }
        //
        // if(!/^[ァ-・ヽヾ゛゜ー]$/.test(givenNameKana)) {
        //   regist1checker = regist1checker + 'error';
        // }

        // validate kana name
        var kanaRegex = /^[ァ-ン]*$/;
        var familyKanaName = $("#family_name_kana").val();
        var givenKanaName = $("#given_name_kana").val();
        if(familyKanaName.length > 0 && !familyKanaName.match(kanaRegex)) {
          $("#family_name_kana").addClass("error");
          regist1checker = regist1checker + 'error';
          alertBox.append('<p>姓名（フリガナ）は全角カナで入力してください。</p>');
        }
        if(givenKanaName.length > 0 && !givenKanaName.match(kanaRegex)) {
          $("#given_name_kana").addClass("error");
          regist1checker = regist1checker + 'error';
          alertBox.append('<p>姓名（フリガナ）は全角カナで入力してください。</p>');
        }

        // check correct email
        var _email1 = $('#email1').val();
        var _email2 = $('#email2').val();
        if (_email1.length > 0 && !isEmailCorrect(_email1)) {
          $('#email1').addClass('error');
          regist1checker = regist1checker + 'error';
          alertBox.append('<p>メール1は正しく入力してください。</p>');
        }

        if (_email2.length > 0 && !isEmailCorrect(_email2)) {
          $('#email2').addClass('error');
          regist1checker = regist1checker + 'error';
          alertBox.append('<p>メール２は正しく入力してください。</p>');
        }
      }

      //メールアドレス同一チェック
      // if ($('#email1').val() == $('#email2').val()) {
      //   $('#email1,#email2').addClass('error');
      //   regist1checker = regist1checker + 'error';
      //   alertBox.append('<p>メールアドレス 1とメールアドレス 2に同じアドレスを登録できません。</p>');
      // }

      // // check valudate japanese lang required
      // var _isErrorKanji = false;
      // $('#regist1 [data-validate="kanji"]').each(function (index, input) {
      //   var $input = $(input);
      //   if ($input.val() !== '' && $input.val() !== undefined && $input.val() !== null) {
      //     if (validateKanji($input) === false) {
      //       $input.addClass('error');
      //       regist1checker = regist1checker + 'error';
      //       _isErrorKanji = true;
      //     }
      //   }
      // });
      // if (_isErrorKanji) {
      //   alertBox.append('<p>姓名（漢字）は正しく入力してください。</p>');
      // }
      //
      // var _isErrorKana = false;
      //
      // $('#regist1 [data-validate="kana"]').each(function (index, input) {
      //   var $input = $(input);
      //   if ($input.val() !== '' && $input.val() !== undefined && $input.val() !== null) {
      //     if (validateKana($input) === false) {
      //       $input.addClass('error');
      //       regist1checker = regist1checker + 'error';
      //       _isErrorKana = true;
      //     }
      //   }
      // });
      //
      // if (_isErrorKana) {
      //   alertBox.append('<p>姓名（フリガナ）は正しく入力してください。</p>');
      // }

      if (regist1checker != '') {
        alertBox.fadeIn();
        scrollTop();
      } else {

        // フロントで判定後にAPIでチェック
        var dataToServer = {
          login_id: loginId,
          password: password,
          email1: email1,
          isTemporaryMode: isTemporaryMode
        };

        if (email2) {
          dataToServer.email2 = email2;
        }

        if (temporaryId) {
          dataToServer.temporary_id = temporaryId;
        }
        if (typeof isApplican !== "undefined" && isApplican) {
          dataToServer.is_applican = true;
        }

        $.ajax({
          url: global.apiUrl + '/students/search',
          dataType: 'json',
          type: 'GET',
          contentType: 'application/json',
          accept: 'application/json',
          data: dataToServer,
          processData: true,
          success: function (data) {
            regist1CheckSuccess();
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            regist1CheckError(XMLHttpRequest);
          }
        });
      }

    }

    function regist1CheckSuccess() {
      // 見出し・画面切り替え
      flowChange('会員登録 2', 'flow2');
      $('.temporary_notice').hide();
      $('#regist1').hide();
      $('#regist1-next').hide();
      $('#regist2').fadeIn();
      $('#regist2-next').fadeIn();
      scrollTop();
    }

    function regist1CheckError(responsData) {
      var regist1checker = '';
      // ログインID重複
      var errors = responsData.responseJSON.errors;
      var errorLoginId = responsData.responseJSON.error;

      if (!_.isUndefined(errorLoginId) && errorLoginId.login_id_is_dupplication) {
        regist1checker = regist1checker + 'error';
        $('#login_id').addClass('error');
        alertBox.append('<p>入力したユーザーIDは使用できません。変更してください。</p>');
      }
      if(!_.isUndefined(errors)) {
        // メールアドレス1重複
        if (errors.email1 && !_.isUndefined(errors.email1[0])) {
          regist1checker = regist1checker + 'error';
          $('#email1').addClass('error');
          alertBox.append('<p>' + errors.email1[0] + '</p>');
        }
        // メールアドレス2重複
        if (errors.email2 && !_.isUndefined(errors.email2[0])) {
          regist1checker = regist1checker + 'error';
          $('#email2').addClass('error');
          alertBox.append('<p>' + errors.email2[0] + '</p>');
        }
      }
      // エラーメッセージ表示
      if (regist1checker != '') {
        alertBox.fadeIn();
      }
      scrollTop();
    }

    if(contractTerm === '2021') {
      $('#graduation_year').append(
        '<option value="2017">2017</option>' +
        '<option value="2018">2018</option>' +
        '<option value="2019">2019</option>' +
        '<option value="2020">2020</option>' +
        '<option value="2021">2021</option>' +
        '<option value="2022">2022</option>' +
        '<option value="2023">2023</option>' +
        '<option value="2024">2024</option>');
    }
    if(contractTerm === '2022') {
      $('#graduation_year').append(
        '<option value="2018">2018</option>' +
        '<option value="2019">2019</option>' +
        '<option value="2020">2020</option>' +
        '<option value="2021">2021</option>' +
        '<option value="2022">2022</option>' +
        '<option value="2023">2023</option>' +
        '<option value="2024">2024</option>' +
        '<option value="2025">2025</option>');
    }

    if(contractTerm === '2021') {
      $('#join_year').append(
        '<option value="2020">2020</option>' +
        '<option value="2021">2021</option>' +
        '<option value="2022">2022</option>' +
        '<option value="2023">2023</option>' +
        '<option value="2024">2024</option>' +
        '<option value="2025">2025</option>' +
        '<option value="2026">2026</option>');
    }
    if(contractTerm === '2022') {
      $('#join_year').append(
        '<option value="2021">2021</option>' +
        '<option value="2022">2022</option>' +
        '<option value="2023">2023</option>' +
        '<option value="2024">2024</option>' +
        '<option value="2025">2025</option>' +
        '<option value="2026">2026</option>' +
        '<option value="2027">2027</option>');
    }

    // check graduation_year
    $('#graduation_year option').each( function(idx, item) {
      if(contractTerm === item.text) {
        $("#graduation_year").val(item.text);
      }
    });

    // check join_month
    $('#join_year option').each( function(idx, item) {
      if(contractTerm === item.text) {
        $("#join_year").val(item.text);
      }
    });

// 会員登録2入力チェック
    function regist2Check() {
      // アラートを一旦非表示
      alertBox.hide();
      // チェック用変数宣言
      var requireCheck = '';
      var asyncChecked = ['zip1', 'zip2', 'home_zip1', 'home_zip2'];
      var _notFound = -1;

      // 必須項目の入力・選択状況確認
      $('#regist2 .require').each(function () {
        var nameValue = $(this).attr('name');
        var inputValue = string2literal($(this).val());
        if ($(this).attr('type') == 'radio' || $(this).attr('type') == 'checkbox') {
          // ラジオ、チェックボックスの判定
          if (!$('input[name="' + nameValue + '"]:checked').val()) {
            requireCheck = requireCheck + 'error';
            $(this).addClass('error');
          }
        } else if (inputValue === '' || inputValue === null || inputValue === undefined) {
          // その他の判定
          requireCheck = requireCheck + 'error';
          $(this).addClass('error');
        } else if (asyncChecked.indexOf(nameValue) !== _notFound) {
          if ($('input[name="' + nameValue + '"]').hasClass('error')) {
            // if field in the asyncChecked list still have error then
            requireCheck = requireCheck + 'error';
          }
        } else {
          // 入力OK時error解除
          $(this).removeClass('error');
        }
      });
      asyncChecked.forEach(function (key) {

      });

      // check tel group
      // rule: if any of three fields of number is filled then all three field is required. else ignore
      var telGroupChecked = {
        'tel1': 0,
        'tel2': 0,
        'tel3': 0
      };
      var isThereAnyTelError = false;
      $('input[data-telgroup^="tel"]').each(function (index, telInput) {
        var $telInput = $(telInput);
        var telGroupName = $telInput.data('telgroup');
        if ($telInput.val() !== '' && $telInput.val() !== undefined && $telInput.val() !== null && telGroupChecked[telGroupName] === 0) {
          // in case there is value of this tel
          telGroupChecked[telGroupName] = 1; // set checked so that do not need to check later
          // then check the 2 tel others
          $('[data-telgroup=' + telGroupName + ']').each(function (index, sameGroupTelInput) {
            var $sameGroupTelInput = $(sameGroupTelInput);
            if ($sameGroupTelInput.val() === '' || $sameGroupTelInput.val() === undefined || $sameGroupTelInput.val() === null) {
              // any of 2-rest tel is empty then error
              $sameGroupTelInput.addClass('error');
              isThereAnyTelError = true;
            }
          });
        }

      });

      // validate mobile & tel
      var tel1 = ['mobile1', 'mobile2', 'mobile3'];
      var tel2 = ['tel1', 'tel2', 'tel3'];
      var tel3 = ['home_tel1', 'home_tel2', 'home_tel3'];

      if (isEmptyMobile(tel1, true)) return registCheckError('入力必須項目を確認してください');
      // Validate whether the mobile1, mobile2, mobile3 is in 10 or 11 digit
      var validForatMob1 = isMobileFormat(tel1);
      var validFormatMob2 = isEmptyMobile(tel2) || (!isEmptyMobile(tel2) && isMobileFormat(tel2));
      var validFormatMob3 = isEmptyMobile(tel3) || (!isEmptyMobile(tel3) && isMobileFormat(tel3));
      if (!validForatMob1 || !validFormatMob2 || !validFormatMob3) return registCheckError('電話番号は半角数字10桁か11桁で入力してください');

      // Validate the languague type (only latin number allow)
      var validTel1 = isValidNumber(tel1);
      var validTel2 = isEmptyMobile(tel2) || (!isEmptyMobile(tel2) && isValidNumber(tel2));
      var validTel3 = isEmptyMobile(tel3) || (!isEmptyMobile(tel3) && isValidNumber(tel3));
      if(!validTel1 || !validTel2 || !validTel3) return registCheckError('電話番号は半角数字10桁か11桁で入力してください');

      // Validate mobile flag
      if(!isEmptyMobile(tel1) && !$('input[name="mobile_flg1"]:checked').val()) {
        requireCheck = requireCheck + 'error';
        $('input[name="mobile_flg1"]').addClass('error');
        return registCheckError('電話番号を入力した場合、種類（固定電話 / 携帯電話）を選択してください');
      }
      if(!isEmptyMobile(tel2) && !$('input[name="mobile_flg2"]:checked').val()) {
        requireCheck = requireCheck + 'error';
        $('input[name="mobile_flg2"]').addClass('error');
        return registCheckError('電話番号を入力した場合、種類（固定電話 / 携帯電話）を選択してください');
      }
      if(!isEmptyMobile(tel3) && !$('input[name="mobile_flg3"]:checked').val()) {
        requireCheck = requireCheck + 'error';
        $('input[name="mobile_flg3"]').addClass('error');
        return registCheckError('電話番号を入力した場合、種類（固定電話 / 携帯電話）を選択してください');
      }

      // 必須状況確認
      if (requireCheck == '' && isThereAnyTelError === false) {
        // 必須入力済み
        regist2CheckSuccess();
      } else {
        alertBox.html('');
        // 必須入力不足
        if (requireCheck != '') {
          alertBox.html('<p>入力必須項目を確認してください。</p>');
        }
        if (isThereAnyTelError !== false) {
          // show error in case tel fail
          alertBox.append('<p>電話番号を正しく入力してください。</p>');
        }

        alertBox.fadeIn();
        scrollTop();
      }
    }

    // 必須入力済み、確認画面を生成
    function regist2CheckSuccess() {
      // モードclass切り替え
      $('#regist').toggleClass('confirm-mode').toggleClass('input-mode');

      // チェックされてる項目にclass付与（親要素のlabel-default）
      $('#regist input[type=radio],#regist input[type=checkbox]').each(function () {
        // チェックされている項目にclass付与
        if ($(this).prop('checked')) {
          $(this).parent('.label-default').addClass('selected');
        }
      });
      // チェック項目の最後にclass付与
      $('.label-rows,.label-columns,#working_place_wrap').each(function () {
        $(this).find('.selected').last().addClass('last');
      });

      // 休暇中の連絡先チェック確認
      if ($('#is_same_address').prop('checked') != true) {
        $('.emphasis-box').hide();
      }

      // レイアウト崩れ対応の項目処理
      var replaceItems = [
        'family_name',
        'given_name',
        'family_name_kana',
        'given_name_kana',
        'email1',
        'email2',
        'address_line1',
        'address_line2',
        'zip1',
        'zip2',
        'mobile1',
        'mobile2',
        'mobile3',
        'tel1',
        'tel2',
        'tel3',
        'home_zip1',
        'home_zip2',
        'home_address_line1',
        'home_address_line2',
        'home_tel1',
        'home_tel2',
        'home_tel3',
        'graduation_year',
        'graduation_month',
        'join_year',
        'join_month',
        'section',
        'university',
        'department',
      ];
      for (i in replaceItems) {
        $('#confirm-' + replaceItems[i]).html($('#' + replaceItems[i]).val());
      }
      // メールアドレス2、電話番号2、休憩中電話番号 空欄時処理
      if ($('#tel1').val() == '' && $('#tel2').val() == '' && $('#tel3').val() == '') {
        $('#confirm-tel').html('');
      }
      if ($('#home_tel1').val() == '' && $('#home_tel2').val() == '' && $('#home_tel3').val() == '') {
        $('#confirm-home_tel').html('');
      }

      // 見出し・画面切り替え
      flowChange('会員登録 内容確認', 'flow3');
      $('#regist2-next').hide();

      $('#regist1').fadeIn();
      $('#regist2').fadeIn();
      $('#kiyaku').fadeIn();

      // show policy by contracterm_id
      if (contractTermId === '1') {
        $('#policy-2022').hide();
      }
      if (contractTermId === '2') {
        $('#policy-2021').hide();
      }

      $('#complete-cancel').fadeIn();
      scrollTop();
    }

    function registCheckError (err) {
      err = err || '入力必須項目を確認してください。';
      alertBox.empty();
      alertBox.append('<p>' + err + '</p>');
      alertBox.fadeIn();
      scrollTop();
    }

    function regist2CheckError() {
      alertBox.html('<p>入力必須項目を確認してください。</p>');
      alertBox.fadeIn();
      scrollTop();
    }

    function trimPostData(postdata) {
      return postdata.filter(function (data) {
        return data.value !== null && data.value !== undefined && data.value !== '';
      });
    }

// 会員登録
    function memberRegist() {

      // 日本の大学に留学している
      if ($('#is_japan_study').prop('checked') == true) {
        $('#is_japan_study').val('1');
      }

      // 郵便番号・電話番号の結合、挿入
      $('#postcode').val($('#zip1').val() + $('#zip2').val());

      if ($('#mobile1').val() && $('#mobile2').val() && $('#mobile3').val()) {
        $('#mobile').val($('#mobile1').val() + '-' + $('#mobile2').val() + '-' + $('#mobile3').val());
      }
      if ($('#tel1').val() && $('#tel2').val() && $('#tel3').val()) {
        $('#tel').val($('#tel1').val() + '-' + $('#tel2').val() + '-' + $('#tel3').val());
      }

      $('#home_postcode').val($('#home_zip1').val() + $('#home_zip2').val());

      if ($('#home_tel1').val() && $('#home_tel2').val() && $('#home_tel3').val()) {
        $('#home_tel').val($('#home_tel1').val() + '-' + $('#home_tel2').val() + '-' + $('#home_tel3').val());
      }

      // 休暇中の連絡先チェック確認、コード挿入
      if ($('#is_same_address').prop('checked') == true) {
        $('#home_postcode').val($('#postcode').val());
        $('#home_prefecture_id').val($('#prefecture_id').val());
        $('#home_address_line1').val($('#address_line1').val());
        $('#home_address_line2').val($('#address_line2').val());
      }

      $('#home_postcode').val() == $('#postcode').val() && $('#home_prefecture_id').val() == $('#prefecture_id').val() ? $('#is_same_address').val('true') : $('#is_same_address').val('false');

      // 卒業年月、入社希望年月挿入
      var graduationMonth = '0' + $('#graduation_month').val();
      $('#graduation_year_month').val($('#graduation_year').val() + graduationMonth.slice(-2));
      var joinMonth = '0' + $('#join_month').val();
      $('#join_year_month').val($('#join_year').val() + joinMonth.slice(-2));

      // postdataをシリアライズ
      var memberRegistInfoSerial = trimPostData($('.postdata').serializeArray());
      // postdataを変換処理
      var postData = formAdjust(memberRegistInfoSerial);
      // 配列変換対象名を配列指定＆配列変換
      var arrayNames = ['contract_term_id', 'entry_reason', 'job_category', 'industry_type', 'qualification', 'working_place'];
      for (i in arrayNames) {
        if (postData[arrayNames[i]]) {
          postData[arrayNames[i]] = postData[arrayNames[i]].split(',');
        }
      }

      // In temporary mode, user can modify email2 to "empty" (email2 is already stored in db)
      if(isTemporaryMode && $("#email2").val().length === 0) {
        postData.email2 = "";
      }

      // set null home_address_line1 & home_address_line2 & home_tel & tel
      var homeAddressLine1 =  $('#home_address_line1').val();
      var homeAddressLine2 =  $('#home_address_line2').val();
      if(homeAddressLine1.length === 0) {
        postData['home_address_line1'] = null;
      }
      if(homeAddressLine2.length === 0) {
        postData['home_address_line2'] = null;
      }
      if($('#home_tel1').val() == '' && $('#home_tel2').val() == '' && $('#home_tel3').val() == '') {
        postData['home_tel'] = null;
      }
      if($('#tel1').val() == '' && $('#tel2').val() == '' && $('#tel3').val() == '') {
        postData['tel'] = null;
      }

      var addressLine2 =  $('#address_line2').val();
      if(addressLine2.length === 0) {
        postData['address_line2'] = null;
      }

      postData = JSON.stringify(postData);

      $.ajax({
        url: global.apiUrl + modeApi,
        type: modeMethod,
        dataType: 'json',
        data: postData,
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (data) {
          memberRegistSuccess(data, postData);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(errorThrown);
          console.log(textStatus);
          console.log(XMLHttpRequest);
          memberRegistError(XMLHttpRequest);
        }
      });
    }
    function _redirectToPage() {
      var returnUrl = globalInfo('returnUrl');
      if (returnUrl) {
        removeGlobalInfo('returnUrl', {path: '/'});
        location.href = returnUrl;
      }
    }

    function memberRegistSuccess(data, postData) {
      //
      postData = JSON.parse(postData);
      var loginData = {login_id: postData.login_id, password: postData.password, save_login: false};
      if (typeof isApplican !== "undefined" && isApplican) {
          Object.assign(loginData, {'is_applican': true});
      }

      // 登録時トークン取得1日設定でcookie保存
      $.ajax({
        url: rootVariables.apiUrl + '/students/login',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        accept: 'application/json',
        data: JSON.stringify(loginData),
        processData: false,
        success: function (data) {
          var contractTermId = globalInfo("contract_term_id");
          globalInfo('id_' + contractTermId, data.data.id, {expires: 1, path: "/"});
          globalInfo('jwt_' + contractTermId, data.data.jwt, {expires: 1, path: "/"});
          saveUserDataForQR(data.data);
          // 見出し画面切り替え
          flowChange('会員登録 完了', 'flow4');
          $('#regist1').hide();
          $('#regist2').hide();
          $('#kiyaku').hide();
          $('#complete-cancel').hide();

          $('#complete').fadeIn();
          $('#to-mypage').fadeIn();
          _redirectToPage();
          scrollTop();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          memberRegistError(XMLHttpRequest);
        }
      });

    }

    function memberRegistError(data) {
      var step1 = ['email1', 'email2'];
      var mobileErrorKey = 'mobile';
      if (data && data.responseJSON && data.responseJSON.errors) {
        $('#regist').toggleClass('confirm-mode').toggleClass('input-mode');

        var errors = data.responseJSON.errors;
        var errorFields = Object.keys(errors);
        for (var i = 0, len = errorFields.length; i < len; i++) {
          var errorField = errorFields[i];
          if (step1.indexOf(errorField) != -1) {
            $('[name="' + errorField + '"]').addClass('error');
            alertBox.html('');
            var errorTemp = errors[errorField].map(function (error) {
              return '<p>' + error + '</p>';
            });
            alertBox.append(errorTemp);
            alertBox.fadeIn();
            // $('#regist1').
            $('#regist1').fadeIn();
            $('#regist1-next').fadeIn();
            $('#regist2').hide();
            $('#regist2-next').hide();
            $('#kiyaku').hide();
            $('#complete-cancel').hide();
            flowChange('会員登録 1', 'flow1');
            scrollTop();
            return;
          }

          if (mobileErrorKey === errorFields[i]) {
            $('[name="' + mobileErrorKey + '1"]').addClass('error');
            $('[name="' + mobileErrorKey + '2"]').addClass('error');
            $('[name="' + mobileErrorKey + '3"]').addClass('error');
            alertBox.html('');
            var errorTemp = errors[errorField].map(function (error) {
              return '<p>' + error + '</p>';
            });
            alertBox.append(errorTemp);
            alertBox.fadeIn();
            $('#regist1').hide();
            $('#regist1-next').hide();
            $('#regist2').fadeIn();
            $('#regist2-next').fadeIn();
            $('#kiyaku').hide();
            $('#complete-cancel').hide();
            flowChange('会員登録 2', 'flow2');
            scrollTop();
            return;
          }
        }
      }
    }

// 画面切り替え
    function flowChange(text, flowStep) {
      // Check step to show back link
      if(flowStep === "flow3") {
        $("#back-step-1").fadeIn();
        $("#back-step-2").fadeIn();
      } else {
        $("#back-step-1").fadeOut();
        $("#back-step-2").fadeOut();
      }

      $('#regist-header .article-box-header-h2-jp').html(text);
      $('.registration-flow').removeClass('registration-flow-current');
      $('.registration-flow.' + flowStep).addClass('registration-flow-current');
    }

//全選択
    function checkAll(checkboxName, kore) {
      $('.' + checkboxName).each(function () {
        if ($(kore).prop('checked')) {
          $(this).prop('checked', true);
        } else {
          $(this).prop('checked', false);
        }
      });
    }

//カテゴリ全選択
    function checkAllCategory() {
      $('.checkall').on('click', function () {
        var target = $(this).data('checkall');
        if ($(this).prop('checked') == true) {
          $('input.' + target).prop('checked', true);
        } else {
          $('input.' + target).prop('checked', false);
        }
      });
    }

// 選択肢が1つの時、全て選択を消す
    function checkAllremover() {
      $('.label-columns').each(function () {
        var labelnum = $(this).children('.label-default').length;
        if (labelnum == 1) {
          $(this).prev('th').children('div').remove();
        }
      });
    }

// レンダリング監視＆仮会員情報挿入処理
    var renderTimer, timeoutTimer;
    startTimer();
    timeoutAlert();

    function startTimer() {
      renderTimer = setInterval(function () {
        // レンダリングが終了したら
        if (renderedCount == renderCallCount) {
          temporaryUserDataInput();
          clearInterval(renderTimer);
          clearTimeout(timeoutTimer);
        }
      }, 500);
    }

    function timeoutAlert() {
      // 60秒経過でレンダリング未完了時アラート＆レンダリング監視停止
      timeoutTimer = setTimeout(function () {
        if (renderedCount != renderCallCount) {
          alert('ページの読み込みが正常に完了しませんでした。リロードしてください。');
        }
        clearInterval(renderTimer);
      }, 60000);
    }

// モード確認、仮会員情報挿入、レンダリング監視停止
    function temporaryUserDataInput() {
      // モード確認 仮会員時実行
      if (mode === 'temporary') {
        modeMethod = 'put';

        // Get tempUserData and set mode for api
        temporaryUserInfo = localStorage.getItem('temporaryUserInfo');
        localStorage.removeItem("temporaryUserInfo");
        temporaryUserInfoArry = JSON.parse(temporaryUserInfo)[0];
        modeApi = '/students/' + temporaryUserInfoArry.id + '/temp_to_normal_user';

        var num = null;
        var normalradioKeys = ['is_company_receive', 'is_diamond_human', 'is_valuable_info', 'is_diamond_online','is_woman_receive',  'is_same_address', 'mobile_flg1','mobile_flg2', 'mobile_flg3' ];
        // データを挿入
        for (key in temporaryUserInfoArry) {
          if (_.includes(normalradioKeys, key)) {
            // Check data especially are mobile_flg2 and _flg3
            num = temporaryUserInfoArry[key];
            var isMobileFlg1AndNull = key === "mobile_flg1" && num === null;
            var isMobileFlg2AndNull = key === "mobile_flg2" && num === null;
            var isMobileFlg3AndNull = key === "mobile_flg3" && num === null;

            // Fill base on check result
            if(!isMobileFlg2AndNull && !isMobileFlg3AndNull && !isMobileFlg1AndNull) {
              $(document).find('[name="' + key + '"][value="' + (num == 1) + '"]').attr('checked', 'checked');
            }
          } else if (key == 'university_type' || key == 'department_type') {
            // the value of these fields is in university_type_id and department_type_id from api's data
            var _key = key + '_id';
            num = temporaryUserInfoArry[_key];
            // radio button
            $(document).find('[name="' + key + '"]').val([num]);
          } else {
            $(document).find('[name="' + key + '"]').val(temporaryUserInfoArry[key]);
          }
        }

        departmentSearch();
        sectionSearch();

        // 郵便番号を2分割して挿入
        if (temporaryUserInfoArry['postcode']) {
          $('#zip1').val(temporaryUserInfoArry['postcode'].substr(0, 3));
          $('#zip2').val(temporaryUserInfoArry['postcode'].substr(-4));
        }

        // 電話番号を分割して挿入
        if (temporaryUserInfoArry['mobile']) {
          var mobiles =temporaryUserInfoArry['mobile'].split('-');
          $('#mobile1').val(mobiles[0]);
          $('#mobile2').val(mobiles[1]);
          $('#mobile3').val(mobiles[2]);
        }
        if (temporaryUserInfoArry['tel']) {
          var tels = temporaryUserInfoArry['tel'].split('-');
          $('#tel1').val(tels[0]);
          $('#tel2').val(tels[1]);
          $('#tel3').val(tels[2]);
        }

        // 休暇中郵便番号を2分割して挿入
        if (temporaryUserInfoArry['home_postcode']) {
          $('#home_zip1').val(temporaryUserInfoArry['home_postcode'].substr(0, 3));
          $('#home_zip2').val(temporaryUserInfoArry['home_postcode'].substr(-4));
        }
        // 休暇中電話番号を分割して挿入
        if (temporaryUserInfoArry['home_tel']) {
          var homeTels =temporaryUserInfoArry['home_tel'].split('-');
          $('#home_tel1').val(homeTels[0]);
          $('#home_tel2').val(homeTels[1]);
          $('#home_tel3').val(homeTels[2]);
        }
        // 大学種別が選択されている場合、ボタンをアクティブ
        if (temporaryUserInfoArry['university_type']) {
          $('#school-search-btn').addClass('btn-blue').removeClass('btn-disabled');
        }
        // 学部・研究科等が選択されいる場合、ボタンをアクティブ
        if (temporaryUserInfoArry['university']) {
          $('#department-search-btn').addClass('btn-blue').removeClass('btn-disabled');
        }
        // 学科・専攻等等が選択されいる場合、ボタンをアクティブ
        if (temporaryUserInfoArry['department']) {
          $('#section-search-btn').addClass('btn-blue').removeClass('btn-disabled');
        }
        // 住所を郵便番号から挿入
        // $('.addres-search').click();
        addressInput("", inputPostCode, true);
        if (temporaryUserInfoArry['home_postcode']) {
          addressInput("home_", inputPostCode, true);
        }
        // 現住所と同じときスライド＆入力クリア
        if (temporaryUserInfoArry['is_same_address'] == true) {
          isSameAddressCheck();
        }

        checkFlagAndOnChange();

        departmentSearch();
        sectionSearch();
      }
    }
  }
);
