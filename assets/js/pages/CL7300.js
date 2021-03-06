_headerUIHandler(null, null, true);
var inputHelper = new InputHelper();
var preventNonNumericalInput = inputHelper.preventNonNumericalInput;
// var validateKana = inputHelper.validateKana;
// var validateKanji = inputHelper.validateKanji;

var contractTerm = globalInfo('contract_term_id');
console.log(contractTerm);
if(contractTerm === '1') {
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
if(contractTerm === '2') {
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

if(contractTerm === '1') {
  $('#join_year').append(
    '<option value="2020">2020</option>' +
    '<option value="2021">2021</option>' +
    '<option value="2022">2022</option>' +
    '<option value="2023">2023</option>' +
    '<option value="2024">2024</option>' +
    '<option value="2025">2025</option>' +
    '<option value="2026">2026</option>');
}
if(contractTerm === '2') {
  $('#join_year').append(
    '<option value="2021">2021</option>' +
    '<option value="2022">2022</option>' +
    '<option value="2023">2023</option>' +
    '<option value="2024">2024</option>' +
    '<option value="2025">2025</option>' +
    '<option value="2026">2026</option>' +
    '<option value="2027">2027</option>');
}

function _fetchPrefectureByGroup () {
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

function scrollToTab() {
  var url = new URL(window.location.href);
  var goTo = url.searchParams.get('go_tab');
  if (!_.isEmpty(goTo) && goTo === 'question') {
    setTimeout(function () {
      $('html, body').animate({
        scrollTop: $("#question_tab").offset().top - 700
      }, 1500);
    }, 2000);
  }
}
function scrollToContractTerm() {
  var warn = globalInfo('warn_contract_term');
  if (!_.isEmpty(warn)) {
    removeGlobalInfo('warn_contract_term', { path: '/' });
    $('html, body').animate({
      scrollTop: $("#warnContractTerm").offset().top - 800
    }, 1500);
  }
}

function linkTo(href) {
  event.preventDefault();
  event.stopPropagation();
  window.open(href, '_blank');
  return true;
}

function _dumpPrefecture (prefectureGrs) {
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
  var contractTermId = globalInfo("contract_term_id");
  // ????????????
  var userDataArr = '';
  var renderCallCount = 0;
  var renderedCount = 0;
  var alertBox = $('#regist-header .alert-box');
  var jwt = globalInfo('jwt_' + contractTermId);
  var id = globalInfo('id_' + contractTermId);

  // Check if this is scroll to the question_tab
  var needScroll = location.href.includes("#question_tab");
  if(needScroll) {
    $('html, body').animate({
      scrollTop: $("#question_tab").offset().top - 100
    });
  }

  $('#token').val(jwt);

  //
  scrollToTab();

  // ????????????????????????
  userDataGet();

  // ???????????????
  $('#comfirm_btn').on('click', function () {
    registCheck();
  });
  // ???????????????
  $('#regist_btn').on('click', function () {
    memberRegist();
  });

  // ??????????????????
  $('.addres-search').on('click', function () {
    var prefix = '';
    if ($(this).hasClass('home')) {
      // home??????
      prefix = 'home_';
    }
    addressInput(prefix, displaySelectPostCode);
  });

  // ???????????????????????????????????????
  $('#is_same_address').on('click', function () {
    isSameAddressCheck();
  });

  function isSameAddressCheck () {
    $('#home_address').slideToggle();
    $('#home_zip1,#home_zip2,#home_prefecture_name,#home_city_name,#home_address_line1').removeClass('error');
    $("[name='mobile_flg3']").prop('checked', false);
    if ($('#is_same_address').prop('checked') == true) {
      $('#home_address input').val('');

      // Reassign value of mobile_flg3
      var mobileFlg3 = $("input[name='mobile_flg3']");
      $(mobileFlg3[0]).val("false");
      $(mobileFlg3[1]).val("true");

      $('#home_zip1,#home_zip2,#home_prefecture_name,#home_city_name,#home_address_line1').removeClass('require');
    } else {
      $('#home_zip1,#home_zip2,#home_prefecture_name,#home_city_name,#home_address_line1').addClass('require');
    }
  }

  // ?????????????????????
  $('.input_alphanumeric').on('blur', function () {
    var str = $(this).val();
    $(this).val(convertAlpha(str));
  });

  function convertAlpha (str) {
    return str.replace(/[???-??????-??????-???]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  }

  // ????????????????????????????????????
  $('.input_2byte_kana').on('blur', function () {
    var str = $(this).val();
    $(this).val(convertKanakana(str));
  });

  function convertKanakana (str) {
    return str.replace(/[???-???]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) + 0x60);
    });
  }

  // masterRadioCheckRender(input-type, insert-id, item-require or nomal/enquret, api-chara);
  // ?????????????????????????????? university_type

  _fetchPrefectureByGroup();

  masterRadioCheckRender('radio', 'university_type', 'require', 'university_type');

  // ??????????????????????????????????????? department_type
  masterRadioCheckRender('radio', 'department_type', 'require', 'department_type');

  // ????????????????????????????????????
  masterSelectRender('department_category', 'department_categories');

  // ?????????????????????????????????
  //   not use in update
  //   masterRadioCheckRender('checkbox', 'entry_reason', 'nomal', 'entry_reason');

  // ?????????????????????????????????
  masterRadioCheckRender('checkbox', 'job_category', 'enquate', 'categories');

  // ?????????????????????????????????
  masterRadioCheckRender('checkbox', 'industry_type', 'enquate', 'industry_types');

  // ?????????????????????????????????
  masterRadioCheckRender('checkbox', 'qualification', 'enquate', 'qualifications');

  //// ??????????????????????????????????????????
  //????????????????????????
  universityTypeTabRender();

  // ???????????????????????????
  function universityTypeTabRender () {
    $.ajax({
      url: rootVariables.apiUrl + '/master_data/university_type',
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

  // ????????????????????????
  function tabRender (data) {
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

  // ????????????
  function tabFunc () {
    $('.school-tabs-ul-li').on('click', function () {
      $('.school-tabs-ul-li').removeClass('active');
      $(this).addClass('active');
    });
  }

  // ???????????????
  schoolSearchBtn();
  schoolFirstLetter();

  // ??????????????????????????????
  function schoolSearchBtn () {
    $('#school-search-btn').on('click', function () {
      $('.tbl-school-first-letter a').removeClass('btn-green');
      $('.school-list').html('<li><p>?????????????????????????????????????????????????????????</p></li>');
      $('.school-tabs-ul-li').removeClass('active');
      var selectUnivType = $('input[name="university_type[]"]:checked').val();
      $('.school-tabs-ul-li').each(function () {
        if ($(this).data('universitytype') == selectUnivType) {
          $(this).addClass('active');
        }
      });
    });
  }

  // ???????????????????????????
  function schoolFirstLetter () {
    $('.tbl-school-first-letter a').on('click', function () {
      $('.tbl-school-first-letter a').removeClass('btn-green');
      $(this).addClass('btn-green');
      var schoolType = $('.school-tabs-ul-li.active').data('universitytype');
      var schoolKana = $(this).data('kana');
      shoolRender(schoolType, schoolKana);
    });
  }

  // ??????????????????
  function shoolRender (schoolType, schoolKana) {
    $.ajax({
      url: rootVariables.apiUrl + '/master_data/universities?university_type=' + schoolType + '&university_kana=' + schoolKana,
      type: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (data) {
        schoolListRender(data);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        schoolListRender('error');
        //				console.log(errorThrown);
        //				console.log(textStatus);
        //				console.log(XMLHttpRequest);
      }
    });
  }

  // ??????????????? ??????????????????
  function schoolListRender (data) {
    var schoolList = '';
    if (data == 'error') {
      $('.school-list').html('<li>??????????????????????????????</li>');
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

  // ?????? ???????????????
  function schoolSelect () {
    $('.school-list li span').on('click', function () {
      // ???????????????????????????????????????????????????????????????
      $('#department,#department_code,#section,#section_code').val('');
      // ?????????????????????????????????
      $('#university').val($(this).html());
      var univCode = $(this).data('univcode');
      $('#university_code').val(univCode);
      // ?????????????????????????????????
      var univTypeTabNum = $('.school-tabs-ul-li.active').data('universitytype');
      $('input[name="university_type"]').val([univTypeTabNum]);
      // ??????????????????????????????????????????????????????
      $('#department-search-btn').addClass('btn-blue').removeClass('btn-disabled');
      // ?????????????????????
      $('#modalScool').fadeOut();
      $('#university').removeClass('error');
      $('#department_type').removeClass('error');
      departmentSearch();
    });
  }

  // ????????????????????? ??????
  function departmentSearch () {
    var univCode = $('#university_code').val();
    $.ajax({
      url: rootVariables.apiUrl + '/master_data/universities?university_code=' + univCode,
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

  // ????????????????????? ??????????????????
  function departmentListRender (data) {
    // ???????????????
    $('#modalDept .department-school-name').html($('#university').val());
    var departmentlList = '';
    if (data == 'error') {
      $('#modalDept .department-list-ul').html('<li>??????????????????????????????????????????</li>');
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

  // ????????????????????? ???????????????
  function departmentSelect () {
    $('#modalDept .department-list-ul li span').on('click', function () {
      // ???????????????????????????????????????
      $('#section,#section_code').val('');
      // ???????????????????????????????????????
      $('#department').val($(this).html());
      var depCode = $(this).data('depcode');
      $('#department_code').val(depCode);
      // ???????????????????????????????????????????????????
      $('#section-search-btn').addClass('btn-blue').removeClass('btn-disabled');
      // ?????????????????????
      $('#modalDept').fadeOut();
      $('#department').removeClass('error');
      sectionSearch();
    });
  }

  // ????????????????????????
  function sectionSearch () {
    var univCode = $('#university_code').val();
    var depCode = $('#department_code').val();
    $.ajax({
      url: rootVariables.apiUrl + '/master_data/universities?university_code=' + univCode + '&department_code=' + depCode,
      type: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (data) {
        sectionListRender(data);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        sectionListRender('error');
      }
    });
  }

  // ?????????????????? ??????????????????
  function sectionListRender (data) {
    // ???????????????????????????
    $('#modalCourse .department-school-name').html($('#university').val() + ' ' + $('#department').val());
    var sectioinList = '';
    if (data == 'error') {
      $('#modalCourse .department-list-ul').html('<li>???????????????????????????????????????</li>');
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

  // ?????????????????? ???????????????
  function sectionSelect () {
    $('#modalCourse .department-list-ul li span').on('click', function () {
      // ???????????????????????????????????????
      $('#section').val($(this).html());
      var secCode = $(this).data('seccode');
      $('#section_code').val(secCode);
      // ??????????????????????????????????????????
      var depType = $(this).data('deptype');
      $('input[name="department_type"]').val([depType]).removeClass('error');
      // ?????????????????????
      $('#modalCourse').fadeOut();
      $('#section').removeClass('error');
    });
  }

  // ?????????????????????????????????
  function departmentTypeReset () {
    $('input[name="department_type"]').prop('checked', false);
  }

  // ????????????
  // ?????????
  schoolManualInput();

  function schoolManualInput () {
    $('#school-name-manual').on('click', function () {
      var schoolName = $('#school-name-manual-input').val();
      if (schoolName != '') {
        $('#university').val(schoolName);
        $('#university_code').val('');
        $('#department').val('');
        $('#department_code').val('');
        $('#section').val('');
        $('#section_code').val('');
        // ??????????????????????????????????????????????????????
        $('#department-search-btn').addClass('btn-blue').removeClass('btn-disabled');
        $('#modalScool').fadeOut();
      }
    });
  }

  // ?????????????????????
  departmentManualInput();

  function departmentManualInput () {
    $('#department-name-manual').on('click', function () {
      var depName = $('#department-name-manual-input').val();
      if (depName != '') {
        $('#department').val(depName);
        $('#department_code').val('');
        $('#section').val('');
        $('#section_code').val('');
        // ???????????????????????????????????????????????????
        $('#section-search-btn').addClass('btn-blue').removeClass('btn-disabled');
        $('#modalDept').fadeOut();
      }
    });
  }

  // ??????????????????
  sectionManualInput();

  function sectionManualInput () {
    $('#section-name-manual').on('click', function () {
      var secName = $('#section-name-manual-input').val();
      if (secName != '') {
        $('#section').val(secName);
        $('#section_code').val('');
        $('#modalCourse').fadeOut();
      }
    });
  }

  // ???????????????
  function scrollTop () {
    $('body, html').animate({scrollTop: 0}, 500);
  }

  // master???????????????input radio??????????????????
  function masterRadioCheckRender (type, renderId, require, api) {
    renderCallCount++;
    $.ajax({
      url: rootVariables.apiUrl + '/master_data/' + api + '?per_page=999',
      type: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (data) {
        // ???????????????????????????????????????
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

  // ????????????????????????????????????
  function inputRender (type, renderId, require, data) {
    // ?????????????????????
    var labels = '';
    // ???????????????
    if (type == 'radio') {
      var typeClass = 'radio';
    } else if (type == 'checkbox') {
      var typeClass = 'check';
    }

    for (var num in data['data']) {
      var dataNum = data['data'][num]['item_key'];
      var dataName = data['data'][num]['item_value'];
      labels = labels + '<label class="label-default"><input type="' + type + '" class="input-' + typeClass + ' ' + require + ' postdata" name="' + renderId + '[]" value="' +
        dataNum + '" /><span class="' + type + '-span"></span> <span class="text">' + dataName + '</span></label>';
    }
    $('#' + renderId + '_wrap').html(labels);

    // ??????????????????????????????????????????
    univTypeCheck();
    inputErrorRemove();
    renderedCount++;
  }

  // ????????????????????????????????????
  function enquateRender (type, renderId, require, data) {
    // ?????????????????????
    var labels = '';
    // ??????????????????
    var dispClassCodeComp = '';

    for (var num in data['data']) {
      var dispClass = data['data'][num]['disp_class'];
      var dispClassCode = data['data'][num]['disp_class_code'];
      var jobCategory = data['data'][num][renderId];
      var jobCategoryId = data['data'][num][renderId + '_id'];

      if (dispClassCodeComp != dispClassCode) {
        // dispClassCode(??????)????????????????????????
        dispClassCodeComp = dispClassCode;
        // 1???????????????????????????
        if (dispClassCode != 1) {
          labels = labels + '</td></tr>';
        }
        // ??????????????????????????????????????????????????????th?????????
        labels = labels + '<tr><th>' + dispClass +
          '<div class="mgnt10-15 input-item"><label class="label-default check-all"><input type="checkbox" name="" class="input-check checkall" data-checkall="' + renderId +
          dispClassCode + '"><span class="checkbox-span"></span> ??????????????????</label></div></th><td class="label-columns">';
      }
      // ????????????????????????
      labels = labels + '<label class="label-default"><input type="checkbox" class="input-check ' + renderId + dispClassCode + ' postdata" name="' + renderId + '[]" value="' +
        jobCategoryId + '"><span class="checkbox-span"></span> <span class="text">' + jobCategory + '</span></label>';
    }
    // ?????????????????????????????????
    labels = labels + '</td></tr>';
    $('#' + renderId + '_wrap').append(labels);

    // ??????????????????????????????????????????
    inputErrorRemove();
    checkAllCategory();
    checkAllremover();
    renderedCount++;
  }

  // ????????????????????????
  function inputErrorRemove () {
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

  // ??????????????????
  function univTypeCheck () {
    $('input[name="university_type"]').change(function () {
      // ???????????????????????????????????????????????????????????????????????????????????????
      $('#university,#university_code,#department,#department_code,#section,#section_code').val('');
      // ????????????????????????????????????????????????????????????????????????????????????
      $('#department-search-btn,#section-search-btn').addClass('btn-disabled').removeClass('btn-blue');
      // ?????????????????????????????????????????????
      $('#school-search-btn').addClass('btn-blue').removeClass('btn-disabled');
    });
  }

  // master???????????????select??????????????????
  function masterSelectRender (renderId, api) {
    renderCallCount++;
    $.ajax({
      url: rootVariables.apiUrl + '/master_data/' + api + '?per_page=999',
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

  function selectRender (renderId, data) {
    var dataSelect = '<option value="">????????????????????????</option>';
    for (var num in data['data']) {
      var selectNum = data['data'][num][renderId + '_id'];
      var selectName = data['data'][num][renderId];
      dataSelect = dataSelect + '<option value="' + selectNum + '">' + selectName + '</option>';
    }
    $('#' + renderId).html(dataSelect);

    // ??????????????????????????????????????????
    selectErrorRemove();
    renderedCount++;
  }

  function selectErrorRemove () {
    $('select').change(function () {
      if ($(this).val() != '') {
        $(this).removeClass('error');
      }
    });
  }

  function _addressInputError ($input, prefix) {
    $input.addClass('error');
    // append error text below zip fields
    $input.parents('.input-item').append('<p class="error-text">???????????????????????????????????????????????????????????????????????????????????????????????????????????????<br>?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????</p>');

    //remove the val in home and city of previous search
    var _emptyTxt = null;
    $('[name=' + prefix + 'prefecture_name]').val(_emptyTxt);
    $('[name=' + prefix + 'prefecture_id]').val(_emptyTxt);

    $('[name=' + prefix + 'city_name]').val(_emptyTxt);
    $('[name=' + prefix + 'city_id]').val(_emptyTxt);
  }

  // ?????????????????????????????????????????????
  function addressInput (prefix, fn, isBindingData) {
    isBindingData = isBindingData || false;
    var postCoda = $('#' + prefix + 'zip1').val() + $('#' + prefix + 'zip2').val();
    $('#' + prefix + 'postcode').val(postCoda);

    var $inputs = $('#' + prefix + 'zip1,#' + prefix + 'zip2');
    $inputs.removeClass('error');
    // remove error text
    $inputs.parents('.input-item').find('.error-text').remove();

    // this function is used to call error when ajax canot find given postcode
    // binding the $input for using in fail function
    var _callWhenError = _addressInputError.bind(null, $inputs, prefix);

    if (!postCoda) {
      _callWhenError();
    } else {
      addressDataGet(postCoda).done(function (result) {
        var arr = [];
        arr.push.apply(arr, result.data);
        fn(arr, prefix, isBindingData);
      }).fail(function (result) {
        // ??????
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
    var cityId = userDataArr[prefix + 'city_id'];
    var prefectureId = userDataArr[prefix + 'prefecture_id'];
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


  // ??????????????????
  function addressDataGet (postCoda) {
    return $.ajax({
      url: rootVariables.apiUrl + '/master_data/posts?post_code=' + postCoda,
      type: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (data) {
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        //				console.log(errorThrown);
        //				console.log(textStatus);
        //				console.log(XMLHttpRequest);
      }
    });
  }

  // ??????????????????
  function registCheck () {
    // ??????????????????????????????
    alertBox.hide();
    alertBox.html('');
    // ???????????????????????????
    var registchecker = '';
    var asyncChecked = ['zip1', 'zip2', 'home_zip1', 'home_zip2'];
    var tel1 = ['mobile1', 'mobile2', 'mobile3'];
    var tel2 = ['tel1', 'tel2', 'tel3'];
    var tel3 = ['home_tel1', 'home_tel2', 'home_tel3'];
    var _notFound = -1;

    $('#regist .require').each(function () {
      var nameValue = $(this).attr('name');
      if ($(this).attr('type') == 'radio' || $(this).attr('type') == 'checkbox') {
        // ?????????????????????????????????????????????
        if (!$('input[name="' + nameValue + '"]:checked').val()) {
          registchecker = registchecker + 'error';
          $(this).addClass('error');
        }

      } else if ($(this).val() == '') {
        // ??????????????????
        registchecker = registchecker + 'error';
        $(this).addClass('error');

      } else if (asyncChecked.indexOf(nameValue) !== _notFound) {
        if ($('input[name="' + nameValue + '"]').hasClass('error')) {
          // if field in the asyncChecked list still have error then
          registchecker = registchecker + 'error';
        }

      } else {
        $(this).removeClass('error');
      }
    });

    if (isEmptyMobile(tel1, true)) return registCheckError('?????????????????????????????????????????????');
    // Validate whether the mobile1, mobile2, mobile3 is in 10 or 11 digit
    var validForatMob1 = isMobileFormat(tel1);
    var validFormatMob2 = isEmptyMobile(tel2) || (!isEmptyMobile(tel2) && isMobileFormat(tel2));
    var validFormatMob3 = isEmptyMobile(tel3) || (!isEmptyMobile(tel3) && isMobileFormat(tel3));
    if (!validForatMob1 || !validFormatMob2 || !validFormatMob3) return registCheckError('???????????????????????????10??????11??????????????????????????????');

    // Validate the languague type (only latin number allow)
    var validTel1 = isValidNumber(tel1);
    var validTel2 = isEmptyMobile(tel2) || (!isEmptyMobile(tel2) && isValidNumber(tel2));
    var validTel3 = isEmptyMobile(tel3) || (!isEmptyMobile(tel3) && isValidNumber(tel3));
    if(!validTel1 || !validTel2 || !validTel3) return registCheckError('???????????????????????????10??????11??????????????????????????????');

    // Validate optional mobile flag
    if(!isEmptyMobile(tel2) && !$('input[name="mobile_flg2"]:checked').val()) {
      registchecker = registchecker + 'error';
      $('input[name="mobile_flg2"]').addClass('error');
      return registCheckError('????????????????????????????????????????????????????????? / ??????????????????????????????????????????');
    }
    if(!isEmptyMobile(tel3) && !$('input[name="mobile_flg3"]:checked').val()) {
      registchecker = registchecker + 'error';
      $('input[name="mobile_flg3"]').addClass('error');
      return registCheckError('????????????????????????????????????????????????????????? / ??????????????????????????????????????????');
    }

    // ??????????????????
    if (registchecker == '') {
      // ??????????????????
      registCheckSuccess();
    } else {
      // ??????????????????
      registCheckError();
    }
  }

  // ??????????????????????????????????????????
  function registCheckSuccess () {
    // ?????????class????????????
    $('#regist').toggleClass('confirm-mode').toggleClass('input-mode');

    // ?????????????????????????????????class?????????????????????label-default???
    $('#regist input[type=radio],#regist input[type=checkbox]').each(function () {
      // ????????????????????????????????????class??????
      if ($(this).prop('checked')) {
        $(this).parent('.label-default').addClass('selected');
      }
    });
    // ??????????????????????????????class??????
    $('.label-rows,.label-columns,#working_place_wrap').each(function () {
      $(this).find('.selected').last().addClass('last');
    });

    // ???????????????????????????????????????
    if ($('#is_same_address').prop('checked') != true) {
      $('.emphasis-box').hide();
    }

    // ??????????????????????????????????????????
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
    // ?????????????????????2???????????????2???????????????????????? ???????????????
    if ($('#tel1').val() == '' && $('#tel2').val() == '' && $('#tel3').val() == '') {
      $('#confirm-tel').html('');
    }
    if ($('#home_tel1').val() == '' && $('#home_tel2').val() == '' && $('#home_tel3').val() == '') {
      $('#confirm-home_tel').html('');
    }

    // ??????????????????????????????
    flowChange('?????????????????? ????????????');
    // ???????????????????????????
    $('#comfirm_btn').hide();
    $(".link-text").hide();
    $('#regist_btn').show();
    scrollTop();
    // TODO: this is temporary fix current contract term missing
    checkCurrentContractTerm(currentContractTerm, term);
  }

  function registCheckError (err) {
    err = err || '????????????????????????????????????????????????';
    alertBox.empty();
    alertBox.append('<p>' + err + '</p>');
    alertBox.fadeIn();
    scrollTop();
  }

  function trimPostData (postdata) {

    return postdata.filter(function (data) {
      return data.value !== null && data.value !== undefined && data.value !== '';
    });
  }

  // ????????????
  function memberRegist () {
    alertBox.hide();

    // ????????????????????????????????????
    if ($('#is_japan_study').prop('checked') == true) {
      $('#is_japan_study').val('1');
    }

    // ?????????????????????????????????????????????
    $('#postcode').val($('#zip1').val() + $('#zip2').val());

    if ($('#mobile1').val() && $('#mobile2').val() && $('#mobile3').val()) {
      $('#mobile').val($('#mobile1').val() + '-' + $('#mobile2').val() + '-' + $('#mobile3').val());
    }

    var tel2Id = ['tel1', 'tel2', 'tel3'];
    var tel2 = tel2Id.reduce(function(a, n) {
      a += $('#' + n).val();
      return a;
    }, '');
    if (tel2.length > 0) {
      $('#tel').val($('#tel1').val() + '-' + $('#tel2').val() + '-' + $('#tel3').val());
    } else {
      $('#tel').val('');
    }

    $('#home_postcode').val($('#home_zip1').val() + $('#home_zip2').val());

    if ($('#home_tel1').val() && $('#home_tel2').val() && $('#home_tel3').val()) {
      $('#home_tel').val($('#home_tel1').val() + '-' + $('#home_tel2').val() + '-' + $('#home_tel3').val());
    }

    // ?????????????????????????????????????????????????????????
    if ($('#is_same_address').prop('checked') == true) {
      $('#home_postcode').val($('#postcode').val());
      $('#home_prefecture_id').val($('#prefecture_id').val());
      $('#home_address_line1').val($('#city_name').val());
      $('#home_address_line2').val($('#address_line2').val());
    }

    // ???????????????????????????????????????
    var graduationMonth = '0' + $('#graduation_month').val();
    $('#graduation_year_month').val($('#graduation_year').val() + graduationMonth.slice(-2));
    var joinMonth = '0' + $('#join_month').val();
    $('#join_year_month').val($('#join_year').val() + joinMonth.slice(-2));

    // postdata?????????????????????
    var memberRegistInfoSerial = trimPostData($('.postdata').serializeArray());

    // postdata???????????????
    var postData = formAdjust(memberRegistInfoSerial);

    if (typeof postData['is_japan_study'] === 'undefined') {
      postData['is_japan_study'] = 0;
    }

    if (!postData['tel']) postData['tel'] = null;

    if (postData['tel'] == null) {
      postData['mobile_flg2'] = null;
    }
    if (postData['home_tel'] == null) {
      postData['mobile_flg3'] = null;
    }

    // set null home_address_line1 & home_address_line2
    var homeAddressLine1 =  $('#home_address_line1').val();
    var homeAddressLine2 =  $('#home_address_line2').val();
    if(homeAddressLine1.length === 0) {
      postData['home_address_line1'] = null;
    }
    if(homeAddressLine2.length === 0) {
      postData['home_address_line2'] = null;
    }

    var addressLine2 =  $('#address_line2').val();
    if(addressLine2.length === 0) {
      postData['address_line2'] = null;
    }

    // ???????????????????????????????????????????????????
    // var arrayNames = ['contract_term_id', 'entry_reason', 'job_category', 'industry_type', 'qualification', 'working_place'];
    var arrayNames = ['contract_term_id', 'job_category', 'industry_type', 'qualification', 'working_place'];
    for (i in arrayNames) {
      // ????????????????????????
      if (postData[arrayNames[i]]) {
        postData[arrayNames[i]] = postData[arrayNames[i]].split(',');
      }
    }

    // json?????????
    postData = JSON.stringify(postData);

    $.ajax({
      url: rootVariables.apiUrl + '/students/' + id + '/update',
      type: 'patch',
      dataType: 'json',
      data: postData,
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (data) {
        memberRegistSuccess(data);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(errorThrown);
        console.log(textStatus);
        console.log(XMLHttpRequest);
        memberRegistError(XMLHttpRequest);
      }
    });

  }

  function memberRegistSuccess (data) {
    flowChange('?????????????????? ??????');
    // ???????????????????????????
    $('#regist-header section').hide();
    $('#regist_btn').hide();
    $('#mypage_btn').show();
    scrollTop();
    // TODO: this is temporary fix current contract term missing
    checkCurrentContractTerm(currentContractTerm, term);
  }

  function memberRegistError (data) {
    var responseText = JSON.parse(data['responseText']);
    var mobileErrorKey = 'mobile';
    if (data && data.responseJSON && data.responseJSON.errors) {
      $('#regist').toggleClass('confirm-mode').toggleClass('input-mode');
      var errors = data.responseJSON.errors;
      var errorFields = Object.keys(errors);
      for (var i = 0, len = errorFields.length; i < len; i++) {
        var errorField = errorFields[i];
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
        }
      }
    }
    scrollTop();
  }

  // ??????????????????
  function flowChange (text) {
    $('#regist-header .article-box-header-h2-jp').html(text);
  }

  //?????????
  function checkAll (checkboxName, kore) {
    $('.' + checkboxName).each(function () {
      if ($(kore).prop('checked')) {
        $(this).prop('checked', true);
      } else {
        $(this).prop('checked', false);
      }
    });
  }

  //?????????????????????
  function checkAllCategory () {
    $('.checkall').on('click', function () {
      var target = $(this).data('checkall');
      if ($(this).prop('checked') == true) {
        $('input.' + target).prop('checked', true);
      } else {
        $('input.' + target).prop('checked', false);
      }
    });
  }

  // ????????????1?????????????????????????????????
  function checkAllremover () {
    $('.label-columns').each(function () {
      var labelnum = $(this).children('.label-default').length;
      if (labelnum == 1) {
        $(this).prev('th').children('div').remove();
      }
    });
  }

  // ???????????????????????????????????????????????????
  var renderTimer, timeoutTimer;
  startTimer();
  timeoutAlert();

  function startTimer () {
    renderTimer = setInterval(function () {
      // ????????????????????????????????????
      if (renderedCount == renderCallCount) {
        userDataInsert();
        clearInterval(renderTimer);
        clearTimeout(timeoutTimer);
      }
    }, 500);
  }

  function timeoutAlert () {
    // 60???????????????????????????????????????????????????????????????????????????????????????
    timeoutTimer = setTimeout(function () {
      if (renderedCount != renderCallCount) {
        alert('???????????????????????????????????????????????????????????????????????????????????????????????????');
      }
      clearInterval(renderTimer);
    }, 60000);
  }

  // ???????????????????????????
  function userDataInsert () {
    // ?????????????????????????????????
    var arryStoreItems = ['university_type', 'department_type'];
    var objItems = ['working_place', 'job_category', 'industry_type', 'qualification'];
    // those key are not allow to render in update
    var notRenderItems = ['entry_reason'];

    // radio input list
    var NOT_FOUND = -1;
    var radioInput = ['mobile_flg1', 'mobile_flg2', 'mobile_flg3'];

    for (keyword in userDataArr) {
      var valueType = typeof (userDataArr[keyword]);
      var isMobileFlgAndNotNull = radioInput.indexOf(keyword) !== NOT_FOUND && userDataArr[keyword] !== null;
      var value = isMobileFlgAndNotNull ? !!userDataArr[keyword] : userDataArr[keyword];

      // ???????????????
      if (value == null) {
        // null????????????????????????

      } else if (notRenderItems.indexOf(keyword) >= 0) {
        // do not thing

      } else if (keyword === 'user_contract_term') {
        var values = userDataArr[keyword].map(function (contractTerm) {
          return contractTerm['contract_term_id'];
        });
        $(document).find('[name="contract_term_id[]"]').val(values);

      } else if (arryStoreItems.indexOf(keyword) >= 0) {
        var _itemValue = userDataArr[keyword + '_id'];
        $(document).find('[name="' + keyword + '[]"]').val([_itemValue]);

      } else if (objItems.indexOf(keyword) >= 0) {
        $(document).find('[name="' + keyword + '[]"]').val(value);

      } else if (valueType == 'boolean') {
        var storeVal = String(value);
        $(document).find('[name="' + keyword + '"]').val([storeVal]);

      } else if (isMobileFlgAndNotNull) {
        $('[name="' + keyword + '"][value=' + value + ']').prop('checked', true);

      } else if (valueType == 'number' || valueType == 'string') {
        var storeVal = value;
        if (keyword != 'is_company_receive' && keyword != 'is_diamond_human' && keyword != 'is_valuable_info'
          && keyword != 'is_diamond_online' && keyword != 'is_woman_receive' && keyword != 'is_japan_study') {
          $(document).find('[name="' + keyword + '"]').val(storeVal);
        }
      }
    }

    // ???????????????2??????????????????
    $('#zip1').val(userDataArr['postcode'].substr(0, 3));
    $('#zip2').val(userDataArr['postcode'].substr(-4));
    if (userDataArr['home_postcode'] && userDataArr['home_postcode'].length > 0) {
      $('#home_zip1').val(userDataArr['home_postcode'].substr(0, 3));
      $('#home_zip2').val(userDataArr['home_postcode'].substr(-4));
    }
    // ?????????????????????????????????
    var mobiles1 = userDataArr['mobile'].split('-');
    $('#mobile1').val(mobiles1[0]);
    $('#mobile2').val(mobiles1[1]);
    $('#mobile3').val(mobiles1[2]);
    // ????????????2?????????????????????
    if (userDataArr['tel']) {
      var tels = userDataArr['tel'].split('-');
      $('#tel1').val(tels[0]);
      $('#tel2').val(tels[1]);
      $('#tel3').val(tels[2]);
    }
    // ????????????????????????2??????????????????
    if (userDataArr['home_postcode']) {
      $('#home_zip1').val(userDataArr['home_postcode'].substr(0, 3));
      $('#home_zip2').val(userDataArr['home_postcode'].substr(-4));
    }
    // ??????????????????????????????????????????
    if (userDataArr['home_tel']) {
      var homeTels = userDataArr['home_tel'].split('-');
      $('#home_tel1').val(homeTels[0]);
      $('#home_tel2').val(homeTels[1]);
      $('#home_tel3').val(homeTels[2]);
    }
    // ????????????????????????????????????????????????????????????????????????
    if (userDataArr['university_type']) {
      $('#school-search-btn').addClass('btn-blue').removeClass('btn-disabled');
    }
    // ??????????????????????????????????????????????????????????????????????????????
    if (userDataArr['university']) {
      $('#department-search-btn').addClass('btn-blue').removeClass('btn-disabled');
    }
    // ??????????????????????????????????????????????????????????????????????????????
    if (userDataArr['department']) {
      $('#section-search-btn').addClass('btn-blue').removeClass('btn-disabled');
    }
    // ?????????????????????????????????
    // $('.addres-search.nowplace').click();

    // Load post code
    addressInput("", inputPostCode, true);
    if (userDataArr['is_same_address'] == true) {
      isSameAddressCheck();
    } else {
      // check if is_same_address is false and home_postcode is null, it will do nothing
      var homeZip = $('#home_zip1').val() + $('#home_zip2').val();
      if (homeZip.length > 0) {
        addressInput("home_", inputPostCode, true);
      }
    }

    checkFlagAndOnChange();

  }

  // ?????????????????????
  function userDataGet () {
    $.ajax({
      url: rootVariables.apiUrl + '/students/' + id + '/me',
      type: 'get',
      headers: {
        'Authorization': 'Bearer ' + jwt,
        'Content-Type': 'application/json'
      },
      success: function (data) {
        userDataArr = data.data;

        if (!_.isNull(userDataArr)) {
          var isCompanyReceive = '';
          var isDiamondHuman = '';
          var isValuableInfo = '';
          var isDiamondOnline = '';
          var isWomanReceive = '';

          if (userDataArr.is_company_receive === 1) {
            isCompanyReceive = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_company_receive" value="1" checked="checked"/>' +
              ' <span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_company_receive" value="0"/>' +
              ' <span class="radio-span"></span> ??????????????????' +
              '</label>';
          } else {
            isCompanyReceive = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_company_receive" value="1"/>' +
              ' <span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_company_receive" value="0" checked="checked"/>' +
              ' <span class="radio-span"></span> ??????????????????' +
              '</label>';
          }

          if (userDataArr.is_diamond_human === 1) {
            isDiamondHuman = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_human" value="1" checked="checked"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_human" value="0"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          } else {
            isDiamondHuman = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_human" value="1"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_human" value="0" checked="checked"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          }

          if (userDataArr.is_valuable_info === 1) {
            isValuableInfo = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_valuable_info" value="1" checked="checked"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_valuable_info" value="0"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          } else {
            isValuableInfo = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_valuable_info" value="1"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_valuable_info" value="0" checked="checked"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          }

          if (userDataArr.is_diamond_online === 1) {
            isDiamondOnline = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_online" value="1" checked="checked"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_online" value="0"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          } else {
            isDiamondOnline = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_online" value="1"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_diamond_online" value="0" checked="checked"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          }

          if (userDataArr.is_woman_receive === 1) {
            isWomanReceive = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_woman_receive" value="1" checked="checked"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_woman_receive" value="0"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          } else {
            isWomanReceive = '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_woman_receive" value="1"/>' +
              '<span class="radio-span"></span> ????????????' +
              '</label>' +
              '<label class="label-default">' +
              ' <input type="radio" class="input-radio postdata" name="is_woman_receive" value="0" checked="checked"/>' +
              '<span class="radio-span"></span> ??????????????????' +
              '</label>';
          }

          if (userDataArr.is_japan_study === 1) {
            $('#is_japan_study').prop('checked', true);
          }

          $('#js-is-company-receive').append(isCompanyReceive);
          $('#js-is-diamond-human').append(isDiamondHuman);
          $('#js-is-valuable-info').append(isValuableInfo);
          $('#js-is-diamond-online').append(isDiamondOnline);
          $('#js-is-woman-receive').append(isWomanReceive);
          scrollToContractTerm();
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log('???????????????????????????');
        console.log(errorThrown);
        console.log(textStatus);
        console.log(XMLHttpRequest);
      }
    });
  }
  function checkCurrentContractTerm(currentContractTerm, term) {
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
  }
});
