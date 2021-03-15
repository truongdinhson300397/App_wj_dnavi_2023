var partnerId = globalInfo('partner_id');
var offlineData;
_headerUIHandler(logined, guest, null);
var contractTermId = globalInfo("contract_term_id");
var studentId = globalInfo('id_' + contractTermId);
var token = globalInfo('jwt_' + contractTermId);
var registrantId = globalInfo('registrant_id');
var recruitGuideId = null;
var isLogin = false;
var prefectureIds = globalInfo('prefecture_ids') ? JSON.parse(globalInfo('prefecture_ids')) : [];

function onChangeInternshipTab(interns) {
  $(document).on('click', '.intership-tab-a', function () {
    var iternId = $(this).data('internship-id');
    var internOutput = interns.filter(function (item) {
      return item.internship_id == iternId;
    })[0];
    dumpIntershipInfo(internOutput);
  });

}

function dumpIntershipInfo(internOutput) {
  for (key in internOutput) {
    // データ挿入
    if (key == 'recruiters') {
      if (internOutput[key] != null) {
        // json変換
        var recruitersInfo = JSON.parse(internOutput[key]);
        var $contacts = $('.tab-contents-internships .recruitment_wrap');
        _dumpRecruiterContactForIntership(recruitersInfo, $contacts);
      } else {
        // エリア削除
        $('.tab-contents-internships .recruitment_wrap').remove();
      }
    } else if (key == 'free_contents') {
      //	フリーコンテンツ処理
      if (internOutput[key] != null) {
        var freeContents = JSON.parse(internOutput[key]);
        var freeContElm = '';
        for (var i = 1; i <= 2; i++) {
          var contIsVisible = 'free_content' + i + '_content_is_visible';
          var outPutCheck = freeContents[contIsVisible];
          // 出力チェック＆挿入エレメント生成
          var content = '';
          var freeContTitle = '';
          var imgElm = '';
          if (outPutCheck == 1 || outPutCheck == true) {
            var imgElm = '';
            var freeContCont = freeContents['free_content' + i + '_content'] !== null ? freeContents['free_content' +
            i + '_content'] : '';
            freeContTitle = freeContents['free_content' + i + '_title'] !== null ? freeContents['free_content' + i +
            '_title'] : '';
            content = '<p class="companies-data-body"><span class="free_contents' + i +
                '_content">' + freeContCont + '</span></p>';
          }
          var freeContImgName = freeContents['free_content' + i + '_image_name'] !== null
              ? freeContents['free_content' + i + '_image_name']
              : '';
          var freeContImgUrl = freeContents['free_content' + i + '_image_url'] !== null
              ? freeContents['free_content' + i + '_image_url']
              : '';
          if (freeContents['free_content' + i + '_image_is_visible'] == 1 &&
              freeContents['free_content' + i + '_image_url'] != null) {
            imgElm = '<figure class="companies-data-fig"><img src="' + freeContImgUrl + '" alt="' +
                freeContImgName + '" class="companies-data-img free_contents' + i + '_image_url" /></figure>';
          }
          if ((outPutCheck == 1 && freeContents['free_content' + i + '_content'] != null)
              || (freeContents['free_content' + i + '_image_is_visible'] == 1
                  && freeContents['free_content' + i + '_image_url'] != null)) {
            freeContElm = freeContElm + '<div class="mgnt20-30 clearfix free_contents' + i +
                '_wrap"><div class="companies-catch"><span class="free_contents' + i + '_title">' + freeContTitle +
                '</span></div>' + imgElm + content + '</div>';
          }
        }
        // エレメント挿入
        $('.tab-contents-internships .free_contents_wrap').html(freeContElm);
      } else {
        // エリア削除
        $('.tab-contents-internships .free_contents_wrap').remove();
      }
    } else if (key == 'free_fields') {
      //	自由項目処理
      if (internOutput[key] != null) {
        var freeFields = JSON.parse(internOutput[key]);

        // check if any of key's value is null, then decide to hide or show
        var freeFieldsValue = Object.values(freeFields);
        var isNull = freeFieldsValue.some(function(v){
          return v === null;
        });
        if(isNull) {
          $('.tab-contents-internships .free_fields_wrap').hide();
        } else {
          var freeFieldsElm = '';
          for (var i = 1; i <= 4; i++) {
            var contIsVisible = 'free_field' + i + '_is_visible';
            var outPutCheck = freeFields[contIsVisible];
            // 出力チェック＆挿入エレメント生成
            if (outPutCheck == 1 || outPutCheck == true) {
              var freeFieldCont = freeFields['free_field' + i + '_content'] !== null ? freeFields['free_field' + i +
              '_content'] : '';
              var freeFieldTitle = freeFields['free_field' + i + '_title'] !== null ? freeFields['free_field' + i +
              '_title'] : '';
              if (freeFields['free_field' + i + '_is_visible'] == 1) {
                freeFieldsElm = freeFieldsElm + '<tr class="free_field' + i + '_title_wrap"><th><span class="free_field' +
                  i + '_title">' + freeFieldTitle + '</span></th><td><span class="free_field' + i + '_content">' +
                  freeFieldCont + '</span></td></tr>';
              }
            }
          }
          $('.tab-contents-internships .free_fields_wrap').html(freeFieldsElm).show();
        }
      } else {
        $('.tab-contents-internships .free_fields_wrap').hide();
      }
    } else if (key == 'recruitment_settings') {
      //	採用窓口処理
      if (internOutput[key] != null) {
        var recSet = JSON.parse(internOutput[key]);
        var recSetElm = '';
        for (var i = 1; i <= 4; i++) {
          var outPutCheck = recSet['recruitment_setting' + i + '_content_is_visible'];
          var recSetOfficeName = recSet['recruitment_setting' + i + '_office_name'];
          var recSetRecruiterName = recSet['recruitment_setting' + i + '_recruiter_name'];
          var recSetAddress1 = recSet['recruitment_setting' + i + '_address_1'];
          var recSetAddress2 = recSet['recruitment_setting' + i + '_address_2'];
          var recSetCity = recSet['recruitment_setting' + i + '_city'];
          var recSetPostalCode1 = recSet['recruitment_setting' + i + '_postal_code1'];
          var recSetPostalCode2 = recSet['recruitment_setting' + i + '_postal_code2'];
          var recSetPrefectureDispValue = recSet['recruitment_setting' + i + '_prefecture_disp_value'];
          var recSetReceptionPhoneNo1 = recSet['recruitment_setting' + i + '_reception_phone_no1'];
          var recSetReceptionPhoneNo2 = recSet['recruitment_setting' + i + '_reception_phone_no2'];
          var recSetReceptionPhoneNo3 = recSet['recruitment_setting' + i + '_reception_phone_no3'];
          var recSetEmail = recSet['recruitment_setting' + i + '_email'];

          var recOutputPostalCode = '';
          var recOutputAddress = '';
          var recOutputPhone = '';
          var recOutputEmail = '';
          var recOutputContactPoint = '';
          var recOutputContactAddress = '';
          // 出力チェック＆挿入エレメント生成
          if (outPutCheck == 1 || outPutCheck == true) {
            // 採用窓口名
            if (recSetRecruiterName && recSetRecruiterName != null) {
              recSetRecruiterName = '<br>' + recSetRecruiterName;
            }
            var recOutputContactPoint = '<div class="companies-contact-point">' + recSetOfficeName +
              recSetRecruiterName + '</div>';
            // 郵便番号
            if (recSetPostalCode1 && recSetPostalCode2 && recSetPostalCode1 != null && recSetPostalCode2 != null) {
              var recOutputPostalCode = '〒' + recSetPostalCode1 + recSetPostalCode2;
            }
            // 住所
            if (recSetPrefectureDispValue && recSetPrefectureDispValue != null) {
              var recOutputAddress = '<br>' + recSetPrefectureDispValue;
            }
            if (recSetAddress1 && recSetAddress1 != null) {
              var recOutputAddress = recOutputAddress + recSetAddress1;
            }
            if (recSetAddress2 && recSetAddress2 != null) {
              var recOutputAddress = recOutputAddress + recSetAddress2;
            }
            // 電話番号
            if (recSetReceptionPhoneNo1 && recSetReceptionPhoneNo2 && recSetReceptionPhoneNo3 &&
              recSetReceptionPhoneNo1 != null && recSetReceptionPhoneNo2 != null && recSetReceptionPhoneNo3 != null) {
              var recOutputPhone = '<br>電話番号：' + recSetReceptionPhoneNo1 + '-' + recSetReceptionPhoneNo2 + '-' +
                recSetReceptionPhoneNo3;
            }
            // メールアドレス
            if (recSetEmail && recSetEmail != null) {
              recOutputEmail = '<br>メールアドレス：<a href="mailto:' + recSetEmail + '">' + recSetEmail + '</a>';
            }
            var recOutputContactAddress = '<div class="companies-contact-address">' + recOutputPostalCode +
              recOutputAddress + recOutputPhone + recOutputEmail + '</div>';

            recSetElm = recSetElm + '<div class="recruitmentSet' + i + '_wrap">' + recOutputContactPoint +
              recOutputContactAddress + '</div>';
          }
        }
        // エレメント挿入
        $('.tab-contents-internships .recruitment_wrap').append(recSetElm);
      } else {
        // エリア削除
        $('.tab-contents-internships .recruitment_wrap').remove();
      }
    } else if (key == 'target_select') {
      // 募集対象処理
      if (internOutput[key] != null) {
        var targetSelectArray = internOutput[key];
        $.ajax({
          url: rootVariables.apiUrl + '/master_data/target?per_page=999999',
          type: 'get',
          headers: {
            'Content-Type': 'application/json'
          },
          success: function (result) {
            targetSelectInput(result['data'], targetSelectArray);
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
          }
        });

        function targetSelectInput(data, targetSelectArray) {
          // target_select配列から選択項目valueを出力
          var targetSelectOutput = '';
          for (i in data) {
            var itemKey = String(data[i]['item_key']);
            if (targetSelectArray.indexOf(itemKey) >= 0) {
              if (targetSelectOutput) {
                targetSelectOutput = targetSelectOutput + ' / ' + data[i]['item_value'];
              } else {
                targetSelectOutput = data[i]['item_value'];
              }
            }
          }
          // エレメント挿入
          $('.tab-contents-internships .target_select').html(targetSelectOutput);
        }
      } else {
        // エリア削除
        $('.tab-contents-internships .target_select_wrap').remove();
      }
    } else if (key == 'entry_term_date') {
      // 応募締切日本語処理
      if (internOutput[key] != null) {
        var date = new Date(internOutput[key]);
        var dateYear = date.getFullYear();
        var dateMonth = date.getMonth() + 1;
        var dateDay = date.getDate();
        var jpDate = dateYear + '年' + dateMonth + '月' + dateDay + '日まで';
        // エレメント挿入
        $('.tab-contents-internships .entry_term_date').html(jpDate);
      } else {
        // エリア削除
        $('.tab-contents-internships .entry_term_date_wrap').remove();
      }
    } else if (key == 'link_urls') {
      // リンク処理
      if (internOutput[key] != null) {
        var liknUrls = JSON.parse(internOutput[key]);
        var linkUrsCount = 0;
        // データの有無カウント
        for (i in liknUrls) {
          if (liknUrls[i] != '' && liknUrls[i] != null) {
            linkUrsCount++;
          }
        }
        // データの有無判別、データ挿入orエリア除去
        if (linkUrsCount != 0) {
          $('.internship-link-ul').show();
          // リンク、文言挿入
          for (i in liknUrls) {
            if (i == 'link_url1_title' || i == 'link_url2_title') {
              var url = i.replace('title', 'url');
              if (typeof isApplican !== "undefined" && isApplican) {
                liknUrls[url] = linkOrWebview(liknUrls[url]);
              }
              $('.tab-contents-internships .' + i).parent('a').attr('href', liknUrls[url]);
              $('.tab-contents-internships .' + i).html(liknUrls[i]);
            }
            if (liknUrls['link_url1_title'] == '' || liknUrls['link_url1_title'] == null || liknUrls['link_url1_url'] ==
              '' || liknUrls['link_url1_url'] == null) {
              $('.tab-contents-internships .link_url1_title_wrap').remove();
            }
            if (liknUrls['link_url2_title'] == '' || liknUrls['link_url2_title'] == null || liknUrls['link_url2_url'] ==
              '' || liknUrls['link_url2_url'] == null) {
              $('.tab-contents-internships .link_url2_title_wrap').remove();
            }
          }
        } else {
          $('.internship-link-ul').hide();
        }
      } else {
        // エリア削除
        // $('.internship-link-ul').remove();
        $('.internship-link-ul').hide();
      }
    } else if (key == 'term_select') {
      // 実施期間選択
      if (internOutput[key] != null) {
        var termSelect = internOutput[key];
        $.ajax({
          url: rootVariables.apiUrl + '/master_data/perform_term?per_page=999999',
          type: 'get',
          headers: {
            'Content-Type': 'application/json'
          },
          success: function (result) {
            termSelectInput(result['data'], termSelect);
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
          }
        });

        function termSelectInput(data, termSelect) {
          // term_selectからvalueを出力
          var termSelectOutput = '';
          for (i in data) {
            if (data[i]['item_key'] == termSelect) {
              termSelectOutput = data[i]['item_value'];
            } else {
            }
          }
          $('.tab-contents-internships .term_select').html(termSelectOutput);
        }
      } else {
        // エリア削除
        $('.tab-contents-internships .term_select_wrap').remove();
      }
    } else if (key == 'internship_id') {
      if (internOutput[key] != null) {
        // エントリーボタンリンク挿入
        $('#internships-entry-btn').attr('href', internshipsEntryUrl + '?internship_id=' + internOutput[key]);

      } else {
        // ボタン非表示
        $('#internships-entry-btn').attr('href', '#').hide();
      }
    } else if (typeof (internOutput[key]) == 'string' || typeof (internOutput[key]) == 'number' || typeof (internOutput[key]) == 'object') {
      if (internOutput[key] != '' && internOutput[key] != null && internOutput[key] != undefined) {
        var selector;
        if(key === "latest_message") {
          var realKey = key + "_2";
          $('.tab-contents-internships .' + realKey + '_wrap').show();
          selector = '.tab-contents-internships .' + realKey;
        } else {
          $('.tab-contents-internships .' + key + '_wrap').show();
          selector = '.tab-contents-internships .' + key;
        }
        $(selector).html(internOutput[key]);
      } else {
        if(key === "latest_message") key += "_2";
        $('.tab-contents-internships .' + key + '_wrap').hide();
      }
    }
  }
// check status book internship
  var $internshipEntryBtn = $('#internships-entry-btn');
  $internshipEntryBtn.addClass('btn-disabled');
  $internshipEntryBtn.addClass('text-black');
  $internshipEntryBtn.fadeIn();
  if (!internOutput['entry_button_is_visible'] || !internOutput['show_apply_button']) {
    $('#internships-entry-btn').hide();
  } else if (internOutput['is_applied_internship'] === true) {
    // disable
    $internshipEntryBtn.text('すでにエントリーしています');
  } else if (internOutput['out_of_date'] === true) {
    // out of date
    $internshipEntryBtn.text('エントリーを締め切りました');
  } else if (internOutput['is_coming_soon'] === true) {
    // coming soon
    $internshipEntryBtn.text('エントリーを受け付けておりません');
  } else if (internOutput['is_full'] === true) {
    // full
    $internshipEntryBtn.text('満席');
  } else {
    // can book
    $internshipEntryBtn.removeClass('btn-disabled');
    $internshipEntryBtn.removeClass('text-black');
    $internshipEntryBtn.text('エントリー');
  }

  // add line break style
  var freeTextList = ['accept_numbers', 'after_entry', 'application_method', 'contents', 'entry_term', 'memo', 'pay', 'place', 'target', 'term', 'companies-data-body', 'latest_message'];
  freeTextList.forEach(function (item) {
    $('.tab-contents-internships .' + item).addClass('line-break');
  });
}

function _dumpRecruiterContactForRecruit(recruitersInfo, $contactWrap) {
  $contactWrap.find('.recruiter-info').html('');
  for (var i = 1; i <= 10; i++) {
    var outPutCheck = parseInt(recruitersInfo['recruiter' + i + '_is_visible']);
    if (outPutCheck == 1 || outPutCheck == true) {
      var recAddress1 = recruitersInfo['recruiter' + i + '_address1'];
      var recAddress2 = recruitersInfo['recruiter' + i + '_address2'];
      var recAddress3 = recruitersInfo['recruiter' + i + '_address3'];
      var recEmail = recruitersInfo['recruiter' + i + '_email'];
      var recName = recruitersInfo['recruiter' + i + '_name'];
      var recPersonalName = recruitersInfo['recruiter' + i + '_personal_name'];
      var recPostcode1 = recruitersInfo['recruiter' + i + '_postcode1'];
      var recPostcode2 = recruitersInfo['recruiter' + i + '_postcode2'];
      var recTel1 = recruitersInfo['recruiter' + i + '_tel1'];
      var recTel2 = recruitersInfo['recruiter' + i + '_tel2'];
      var recTel3 = recruitersInfo['recruiter' + i + '_tel3'];
      var prefectureName = recruitersInfo['recruiter' + i + '_prefecture_id_disp_value'];
      var $contact = $('<div></div>').css('border-bottom', '1px solid #ccc').css('margin-top', '10px');
      var $contactPoint = $('<div class="companies-contact-point"></div>');
      var $contactAddress = $('<div class="companies-contact-address"></div>');

      var postCodeText = [recPostcode1, recPostcode2].filter(function (item) {
        return item != '' && item != null && item != undefined;
      }).join('-');

      var addText = [prefectureName, recAddress1, recAddress2, recAddress3].filter(function (item) {
        return item != '' && item != null && item != undefined;
      }).join('');

      var telText = [recTel1, recTel2, recTel3].filter(function (item) {
        return item != '' && item != null && item != undefined;
      }).join('-');

      var recruiterName = recName ? '<p>' + recName + '</p>' : '';
      var recruiterPersonalName = recPersonalName ? '<p>' + recPersonalName + '</p>' : '';
      var postCode = postCodeText ? '<p> 〒 ' + postCodeText + '</p>' : '';
      var address = addText ? '<p>' + addText + '</p>' : '';
      var tels = telText ? '<p>電話番号: ' + telText + '</p>' : '';
      var email = recEmail ? '<p>メールアドレス: ' + recEmail + '</p>' : '';
      if (recruiterName || recruiterPersonalName || postCode || address || tels || email) {
        $contactPoint.append(recruiterName + recruiterPersonalName);

        $contactAddress.html(postCode + address + tels + email);

        $contact.append($contactPoint);
        $contact.append($contactAddress);
        $contactWrap.find('.recruiter-info').append($contact);
        $contactWrap.find('.companies-contact-ttl.hidden').removeClass('hidden');
      }
    }
  }
}

function _dumpRecruiterContactForIntership(recruitersInfo, $contactWrap) {
  $contactWrap.find('.recruiter-info').html('');
  for (var i = 1; i <= 10; i++) {
    var outPutCheck = parseInt(recruitersInfo['recruiter' + i + '_content_is_visible']);
    if (outPutCheck == 1 || outPutCheck == true) {
      var recAddress1 = recruitersInfo['recruiter' + i + '_address_1'];
      var recAddress2 = recruitersInfo['recruiter' + i + '_address_2'];
      var recEmail = recruitersInfo['recruiter' + i + '_email'];
      var recName = recruitersInfo['recruiter' + i + '_recruiter_name'];
      var city = recruitersInfo['recruiter' + i + '_city'];
      var recOfficeName = recruitersInfo['recruiter' + i + '_office_name'];
      var recPostcode1 = recruitersInfo['recruiter' + i + '_postal_code1'];
      var recPostcode2 = recruitersInfo['recruiter' + i + '_postal_code2'];
      var prefecture = recruitersInfo['recruiter' + i + '_prefecture_disp_value'];
      var recTel1 = recruitersInfo['recruiter' + i + '_reception_phone_no1'];
      var recTel2 = recruitersInfo['recruiter' + i + '_reception_phone_no2'];
      var recTel3 = recruitersInfo['recruiter' + i + '_reception_phone_no3'];
      var $contact = $('<div class="recruiter_info"></div>').css('border-bottom', '1px solid #ccc').css('margin-top', '10px');
      var $contactPoint = $('<div class="companies-contact-point"></div>');
      var $contactAddress = $('<div class="companies-contact-address"></div>');

      var postCodeText = [recPostcode1, recPostcode2].filter(function (item) {
        return item != '' && item != null && item != undefined;
      }).join('-');

      var addText = [prefecture, city, recAddress1, recAddress2].filter(function (item) {
        return item != '' && item != null && item != undefined;
      }).join('');

      var telText = [recTel1, recTel2, recTel3].filter(function (item) {
        return item != '' && item != null && item != undefined;
      }).join('-');

      var recruiterName = recName ? '<p>' + recName + '</p>' : '';
      var recruiterOfficeName = recOfficeName ? '<p>' + recOfficeName + '</p>' : '';
      var postCode = postCodeText ? '<p> 〒 ' + postCodeText + '</p>' : '';
      var address = addText ? '<p>' + addText + '</p>' : '';
      var tels = telText ? '<p>電話番号: ' + telText + '</p>' : '';
      var email = recEmail ? '<p>メールアドレス: ' + recEmail + '</p>' : '';
      if (recruiterName || recruiterOfficeName || postCode || address || tels || email) {
        $contactPoint.append(recruiterOfficeName + recruiterName);
        $contactAddress.html(postCode + address + tels + email);

        $contact.append($contactPoint);
        $contact.append($contactAddress);

        $contactWrap.find('.recruiter-info').append($contact);
        $contactWrap.find('.companies-contact-ttl.hidden').removeClass('hidden');
      }
    }
  }
}


function logined() {
  isLogin = true;
}

function guest() {
  isLogin = false;
  $('#js-request-login-message').fadeIn();
}
function onLoad() {
  // // if contract term id is 2 add text
  // if(contractTermId === 2 || contractTermId === '2') {
  //   $('.text-top-tabs').append('2020年3月現在の企業情報です。ダイヤモンド就活ナビ2022でのインターンシップ情報掲載や募集要項の掲載をお約束するものではありません。');
  // }

  // Add return url after success login
  $("#login-btn").on("click", function(e) {
    if(!location.href.includes("go_tab=disclosure")) {
      globalInfo("returnUrl", window.location.href + '&go_tab=disclosure', {path: "/"});
    } else {
      globalInfo("returnUrl", window.location.href, {path: "/"});
    }
  });

  //// 初期化
  var images = '';
  // レンダリング確認用変数
  var renderCallCount = 0;
  var renderedCount = 0;

  var cPartnerId = globalInfo('partner_id');
  var partnerId = _.isUndefined(cPartnerId) || _.isEmpty(cPartnerId) ? 0 : cPartnerId;

  //// パラメーターから企業ID取得
  parameCheck();
  var companyId = parame.company_id;

  // company_idがない場合、アラート＆リダイレクト
  if (companyId == '' || companyId == null || companyId == undefined) {

    redirectToCompanySearch();

  } else {

    companyDataGet();
    disclosureDataGet();
    recruitDataGet();
    internshipsDataGet();
    fetchEventOfCompanies();

    $('#recruit-entry-btn').on('click', function () {
      toLocationHref(recruitEntryUrl + '?recruit_guide_id=' + recruitGuideId + '&company_id=' + companyId);//+recruitEntryId;
    });
    $('#internships-entry-btn').on('click', function () {
      toLocationHref(internshipsEntryUrl + '?internship_id=' + internOutput[key]);//+internshipsEntryId;
    });

  }

  //Gumi
  function fetchEventOfCompanies() {
    // console.log("before companies event", $('.tab-contents-internships .latest_message').html());
    $.ajax({
      url: rootVariables.apiUrl + '/events',
      dataType: 'json',
      type: 'GET',
      headers: {
        contentType: 'application/json',
        accept: 'application/json'
      },
      data: {
        contract_term_id: contractTermId,
        partner_id: partnerId,
        company_id: companyId
      },
      success: function (res) {
        // console.log("after companies event", $('.tab-contents-internships .latest_message').html());
        var datas = res.data;
        if (datas.length > 0) {
          $('#data-dnavi').show();
          _generateEventOfCompany(datas);
        }
      },
      error: function (jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  }

  function _generateEventOfCompany(_datas) {
    $('#data-dnavi-title').show();

    var tagUl = '<ul id="list-company" class="event-ul"></ul>';
    $('#data-dnavi').append(tagUl);
    var i = 0;
    _.forEach(_datas, function (item, idx) {
      var classLi = null;
      if (idx === 0) {
        classLi = 'upper-row';
      } else if (idx == 1) {
        classLi = 'upper-row';
      }

      _.forEach(item.event_dates, function (item_date, idx_date) {
        i++;
        if (i <= 10) {
          var getHourMinuteForm = moment(item_date.event_time_from, 'HHmmss').format('HH:mm');
          var getHourMinuteTo = moment(item_date.event_time_to, 'HHmmss').format('HH:mm');
          var getDay = moment(item_date.event_date).format('ddd').toUpperCase();
          var getDate = moment(item_date.event_date).format('MM/DD');
          var tagsLi = ' <li class="event-ul-li "' + classLi + '"">' +
              '   <div class="event-info-box">' +
              '     <div class="event-loc">' + item.prefecture + '</div>' +
              '     <div class="event-dateday"><span class="event-date">' + getDate + '</span><span class="event-day">' +
              getDay + '</span></div>' +
              '     <div class="event-time">' + getHourMinuteForm + '〜' + getHourMinuteTo + '</div>' +
              '     <div class="event-ttl">' + item.title + '</div>' +
              '    </div>' +
              '   <div class="event-btn-box">' +
              '     <a href="' + link.eventDetail + '?event_id=' + item.event_id + '" class="btn-small btn-blue">詳細・予約</a>' +
              '   </div>' +
              ' </li>';

          $('#list-company').append(tagsLi);
        }
      });
    });

    if (i > 10) {
      var btnShowMore = '<div id="corporateSeminar-show-more" class="event-more-box">' +
          '  <a href="' + link.eventList + '" class="event-more">more</a>' +
          '</div>';
      $('#data-dnavi').append(btnShowMore);
    }
  }

  //End Gumi

  // 企業情報取得
  function companyDataGet() {
    renderCallCount++;
    if (!isOnline()
        && typeof isApplican !== "undefined"
        && isApplican) {
      offlineData.getCompanyFromOfflineData(companyId, function (data) {
        var result = {data: [data]};
        if (data && result && result.data && Array.isArray(result.data) && result.data.length > 0) {
          $('#tabs').remove();
          $('.companies-disclosure').remove();
          companyDataGetSuccess(result);
          // Get event asura by pre code
          eventAsuraByPrefCode(result.data[0].contract);
        } else {
          companyDataGetError();
        }
      });
    } else {
      $.ajax({
        url: rootVariables.apiUrl + '/companies/' + companyId,
        type: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          contract_term_id: contractTermId,
          partner_id: partnerId
        },
        success: function (result) {
          if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
            companyDataGetSuccess(result);
            // Get event asura by pre code
            eventAsuraByPrefCode(result.data[0].contract);
          } else {
            companyDataGetError();
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          companyDataGetError();
        }
      });
    }
  }

  // 企業情報処理
  function companyDataGetSuccess(data) {

    c = data['data'][0];
    if (c) {
      // Add company name to page title
      document.title = c.company_name + document.title;

      // ロゴ挿入
      var logo = (c.company_logo_url !== null && c.company_logo_url.length > 0) ? c.company_logo_url : noimageUrl;
      var mainVisual = (c.company_main_visual_image_url !== null && c.company_main_visual_image_url.length > 0) ? c.company_main_visual_image_url : noimageUrl;
      if (!isOnline()) {
        $('.companies-logo-fig .companies-logo-wrapper').remove();
        $('.companies-detail-main-fig').remove();
      }
      if (c.is_visible == 1) {
        $('.companies-logo-fig .companies-logo-wrapper').html('<img src="' + logo + '" class="companies-logo-img" onerror="$(this).parents(\'.companies-logo-wrapper\').remove()" alt="' + c.company_logo_name + '">');
      } else {
        $('.companies-logo-fig .companies-logo-wrapper').hide();
        $('.companies-logo-fig .companies-description').css('position', 'initial').css('margin-left', '0');
      }
      $('.companies-detail-main-fig').html('<img src="' + mainVisual + '" class="companies-detail-main-img" onerror="this.remove()" alt="' + c.company_main_visual_image_name + '">');

      // 企業名挿入
      $('.companies-nm').html(c.company_name);

      // 業種挿入
      $('.companies-type').html(c.industry_type_main);

      // 情報公開度挿入
      if (c.ranking_percent == '' || c.ranking_percent == null) {
        $('.companies-disclosure-num .num').html('0');
      } else {
        $('.companies-disclosure-num .num').html(c.ranking_percent);
      }

      // ライブセミナー
      if (c.have_live_event == 1) {
        $('.companies-event-label-box').append('<span class="companies-event-label companies-event-category">LIVEセミナー出展企業</span>');
      }

      var companyContract = c.contract;
    }

    var tags = [];

    function addTag(tagObj) {
      var findTag = tags.find(function (e) {
        return e.value === tagObj.value;
      });
      if (typeof findTag === 'undefined') {
        tags.push(tagObj);
      }
    }

    function addTags(tagsObj) {
      var ids = [];
      Object.keys(tagsObj).forEach(function(key){
        ids.push(tagsObj[key].value);
        addTag(tagsObj[key]);
      });
      return ids;
    }

    // メイン画像
    if (c.company_images && c.company_images.length > 0) {
      // $('.companies-detail-main-fig').html('<img src="' + c.company_images[0]['image_url'] + '"
      // class="companies-detail-main-img" alt="' + c.company_images[0]['comment'] + '" />');
      for (i in c.company_images) {
        var companyImageTags = c.company_images[+i].tags;
        var ids = [];
        var classes = '';
        if (typeof companyImageTags !== 'undefined' && _.keys(companyImageTags).length > 0) {
          ids = addTags(companyImageTags);
        }
        ids.forEach(function(id){
          classes += ' tag-id-' + id;
        });
        images = images + '<li class="companies-detail-images-ul-li"><a href="' + imageSearchUrl + '?company_id='+ companyId +
            '" class="companies-detail-images-ul-li-a"><img src="' + c.company_images[i]['image_url'] +
            '" class="companies-detail-images-img ' + classes + '" alt="' + c.company_images[i]['comment'] +
            '" /></a></li>';
      }
      tags.forEach(function(tag){
        var aElement = $('<a href="#" class="tags tag-clickable"></a>');
        aElement.text('# ' + tag.disp_value);
        aElement.attr('data-tag-id', tag.value);
        $('.tags-box').append(aElement);
      });
      $('.tag-clickable').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this);
        if ($this.hasClass('active')) {
          $this.removeClass('active');
          $('li img:not(.tag-id-' + $this.attr('data-tag-id') + ')').parents('li').appendTo('.companies-detail-images-ul');
          return;
        }
        $this.parent().find('a').removeClass('active');
        $this.addClass('active');
        $('li img:not(.tag-id-' + $this.attr('data-tag-id') + ')').parents('li').appendTo('#hiddenUl');
        $('li img.tag-id-' + $this.attr('data-tag-id')).parents('li').appendTo('.companies-detail-images-ul');
      });
      // if (tags.length > 0) {
      //   $('.tags-box .tags').first().addClass('active');
      // }
      $('.companies-detail-images-ul').append(images);
    } else {
      $('.companies-detail-images-ul').remove();
    }

    //// 企業情報挿入

    // 事業内容
    if (c.business_description) {
      $('.business_description p.line-break').html(c.business_description);
    } else {
      $('.business_description_wrap').remove();
    }

    // 事業内容
    if (c.establishment_year) {
      $('.establishment_year').html(c.establishment_year);
      $('.establishment_year_title').html(c.establishment_title);
    } else {
      $('.establishment_year_wrap').remove();
    }

    // 代表者挿入
    if (c.representative_executive) {
      $('.representative_executive').html(c.representative_executive);
    } else {
      $('.representative_wrap').remove();
    }
    if (c.representative_name) {
      $('.representative_name').html(c.representative_name);
    } else {
      $('.representative_name_wrap').remove();
    }

    //// 住所系処理
    var addressArr = ['address1', 'address2', 'address3'];
    for (i in addressArr) {
      if (c[addressArr[i] + '_postcode'] !== null) {
        addressInsert(addressArr[i], c[addressArr[i] + '_postcode'], {data: [c]});
      } else {
        $('.' + addressArr[i] + '_wrap').remove();
      }
    }

    // 資本金
    if (c.capital_stock) {
      $('.capital_stock').html(c.capital_stock.toLocaleString());
      $('.capital_stock_title').html(c.capital_stock_title.toLocaleString());
    } else {
      $('.capital_stock_wrap').remove();
    }

    // 売上高
    if (c.sales_year) {
      $('.sales_year .num').html(c.sales_year);
    } else {
      $('.sales_year').remove();
    }
    if (c.sales) {
      $('.sales').html(c.sales.toLocaleString());
      $('.sales_title').html(c.sales_title.toLocaleString());
    } else {
      $('.sales_wrap').remove();
    }

    // 株式公開区分
    $(".is_public_offering_wrap").show();
    if (c.is_public_offering === 1) {
      $('.is_public_offering').html('公開');
    } else if (c.is_public_offering === 0) {
      $('.is_public_offering').html('未公開');
    } else {
      $(".is_public_offering_wrap").hide();
    }

    // 社員数
    if (c.employees_num_year) {
      $('.employees_num_year .num').html(c.employees_num_year);
    } else {
      $('.employees_num_year').remove();
    }
    if (c.employees_num) {
      $('.employees_num').html(c.employees_num.toLocaleString());
    } else {
      $('.employees_num_wrap').remove();
    }

    // 業種
    if (c.industry_type_main) {
      var industry_type = c.industry_type_main;

      if (c.industry_type_sub) {
        industry_type += '<br /> ' + c.industry_type_sub;
      }

      $('.industry_type_main').html(industry_type);
    } else {
      $('.industry_type_main_wrap').remove();
    }

    //// 関連リンク処理
    if (c.company_links) {
      var linkDatas = c.company_links.filter(function (item) {
        return item['contract_term_id'] == contractTermId;
      });

      if (linkDatas && Array.isArray(linkDatas) && linkDatas.length > 0) {
        linkDatas.forEach(function (linkData) {
          if (linkData) {
            var linkElm = '';
            for (var i = 1; i <= 6; i++) {
              if (linkData['link' + i + '_title']) {
                var linkUrl = linkData['link' + i + '_url'];
                if (typeof isApplican !== "undefined" && isApplican) {
                  linkUrl = linkOrWebview(linkUrl);
                }
                linkElm = linkElm + '<li class="links-ul-li"><a href="' + linkUrl +
                    '" class="links-ul-li-a">' + linkData['link' + i + '_title'] + '</a></li>';
              }
            }
            $('.links-ul').append(linkElm);
          }
        });
      } else {
        $('#links').remove();
      }
    } else {
      $('#links').remove();
    }

    // 表示
    $('.article-box.success').fadeIn();

    renderedCount++;
  }

  function companyDataGetError() {
    renderedCount++;
  }

  // 企業イベント情報処理
  function companyEventDataGetSuccess(data) {
    renderedCount++;
  }

  function companyEventDataGetError() {
    renderedCount++;
  }

  // ディスクロージャー情報取得
  function disclosureDataGet() {
    renderCallCount++;
    $.ajax({
      url: rootVariables.apiUrl + '/disclosures/find_one?contract_term_id=' + contractTermId + '&company_id=' +
          companyId,
      type: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (result) {
        if (result['data']) {
          if (result['data']['disclosure']['is_public'] == true) {
            disclosureDataGetSuccess(result);
          } else {
            disclosureDataGetError();
          }
        } else {
          disclosureDataGetError();
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        disclosureDataGetError();
      }
    });
  }

  function disclosureDataGetSuccess(data) {
    var percentField = [
      'the_percentage_of_female_officers',
      'the_percentage_of_female_managers'
    ];
    var notRequiredLoginList = ['select_step',
      'written_examination_description',
      'entry_sheet_es_questions_description'
    ];
    var disc = data['data']['disclosure'];
    // hidden all wrap
    $('.tab-contents-disclosure .js-disclosure-section');
    $('.tab-contents-disclosure [class$=_wrap]').hide();
    $('.tab-contents-disclosure .wrap1').hide();
    $('.tab-contents-disclosure .wrap2').hide();
    $('.tab-contents-disclosure .wrap3').hide();
    for (key in disc) {
      if (isLogin === true || _.includes(notRequiredLoginList, key)) {
        var $info = $('.tab-contents-disclosure .' + key);
        if (typeof (disc[key]) == 'boolean') {
          if (disc[key] == true) {
            $info.html('あり<br>');
          } else if (disc[key] == false) {
            $info.html('なし<br>');
          }

          // all parent including wrap class that show
          $info.parents('[class*=wrap]').fadeIn();
          $info.parents('.js-disclosure-section').removeClass('hidden');

        } else if (typeof (disc[key]) == 'string' || typeof (disc[key]) == 'number' || typeof (disc[key]) == 'object') {
          if (_.includes(percentField, key) && !_.isNull(disc[key])) {
            $info.html(parseFloat(disc[key]).toFixed(1));
            $info.parents('[class*=wrap]').fadeIn();
            $info.parents('.js-disclosure-section').removeClass('hidden');
          } else if (disc[key] !== '' && disc[key] != null && disc[key] != undefined) {
            $info.html(disc[key]);
            $info.addClass('line-break');
            $info.parents('[class*=wrap]').fadeIn();
            $info.parents('.js-disclosure-section').removeClass('hidden');
          } else {
            $tableParent = $info.parent('td,th');
            if ($tableParent.length > 0) {
              // in case info in table then still show that cell in table but remove all content.
              // this code use to keep to position of cell in table in case empty info
              $tableParent.html('');
              $tableParent.fadeIn();
            }
          }
        }
      }
    }
    renderedCount++;
  }

  function disclosureDataGetError() {
    $('.companies-disclosure-box').hide();
    $('.tab-contents-disclosure').html('<div class="alert-box">現在、公開された情報はありません</div>');
    renderedCount++;
  }

  // 採用データ取得
  function recruitDataGet() {
    renderCallCount++;

    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (studentId && token) {
      _.assign(headers, {'Authorization': 'Bearer ' + token});
    }

    $.ajax({
      url: rootVariables.apiUrl + '/companies/' + companyId + '/recruit_guides?contract_term_id=' + contractTermId + '',
      type: 'GET',
      headers: headers,
      success: function (result) {
        if (result['data'].length > 0) {
          recruitGuideId = result.data[0].recruit_guide_id;
          recruitDataGetSuccess(result['data']);
        } else {
          recruitDataGetError();
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        recruitDataGetError();
      }
    });
  }

  function recruitDataGetSuccess(data) {
    var count = 0;
    var recruitOutputData = {};
    for (i in data) {
      // 採用情報の1つ目をデータ取得
      if (count == 0) {
        if (data[i]['contract_term_id'] == contractTermId && data[i]['is_visible'] == true) {
          recruitOutputData = data[i];
          count++;
        }
      }
    }

    var SELECT_FIELDS = [
      'recruit_job_category_select',
      'working_place_select',
      'plan_department_select'
    ];

    var HORIZONTAL_SELECTED_FIELDS = [
      'recruit_target_select',
      'application_form_select'
    ];

    var DECIMAL_FIELDS = [
      'the_percentage_of_female_officers',
      'the_percentage_of_female_managers'
    ];

    // 採用データ出力判定
    if (recruitOutputData['is_visible'] == true) {
      var tableYearsGender = 0;
      var yearsRecruitYear = 0;
      for (key in recruitOutputData) {
        if (key == 'recruiters') {
          if (recruitOutputData[key] != null) {
            // json変換
            var recruitersInfo = JSON.parse(recruitOutputData[key]);
            var $contacts = $('.tab-contents-recruit .recruitment_wrap');
            _dumpRecruiterContactForRecruit(recruitersInfo, $contacts);
          } else {
            // エリア削除
            $('.tab-contents-recruit .recruitment_wrap').remove();
          }
        } else if (_.includes(DECIMAL_FIELDS, key)) {
          if (!_.isNull(recruitOutputData[key])) {
            var _value = parseFloat(recruitOutputData[key]).toFixed(1);
            $('.tab-contents-recruit .' + key).html(_value);
          } else {
            $('.tab-contents-recruit .' + key + '_wrap').remove();
          }
        } else if (_.includes(SELECT_FIELDS, key)) {
          var _apiKey = key + '_text';
          if (Array.isArray(recruitOutputData[_apiKey]) && recruitOutputData[_apiKey].length > 0) {
            var _dispValue = recruitOutputData[_apiKey].join('、');
            $('.tab-contents-recruit .' + key).html(_dispValue);
          } else {
            $('.tab-contents-recruit .' + key).remove();
          }
        } else if (_.includes(HORIZONTAL_SELECTED_FIELDS, key)) {
          var _apiKey = key + '_text';
          if (Array.isArray(recruitOutputData[_apiKey]) && recruitOutputData[_apiKey].length > 0) {
            var _dispValue = recruitOutputData[_apiKey].join('<br>');
            $('.tab-contents-recruit .' + key).html(_dispValue);
          } else {
            $('.tab-contents-recruit .' + key).remove();
          }
        } else if (typeof (recruitOutputData[key]) == 'string' || typeof (recruitOutputData[key]) == 'number' ||
            typeof (recruitOutputData[key]) == 'object') {
          if (recruitOutputData[key] != null) {
            if (key === 'link_url1_title') {
              if (typeof isApplican !== "undefined" && isApplican) {
                recruitOutputData['link_url1_url'] = linkOrWebview(recruitOutputData['link_url1_url']);
              }
              $('.tab-contents-recruit .' + key).attr('href', recruitOutputData['link_url1_url']);
            }
            if (key === 'link_url2_title') {
              if (typeof isApplican !== "undefined" && isApplican) {
                recruitOutputData['link_url2_url'] = linkOrWebview(recruitOutputData['link_url2_url']);
              }
              $('.tab-contents-recruit .' + key).attr('href', recruitOutputData['link_url2_url']);
            }
            if (key === 'link_url3_title') {
              if (typeof isApplican !== "undefined" && isApplican) {
                recruitOutputData['link_url3_url'] = linkOrWebview(recruitOutputData['link_url3_url']);
              }
              $('.tab-contents-recruit .' + key).attr('href', recruitOutputData['link_url3_url']);
            }
            if (key === 'link_url4_title') {
              if (typeof isApplican !== "undefined" && isApplican) {
                recruitOutputData['link_url4_url'] = linkOrWebview(recruitOutputData['link_url4_url']);
              }
              $('.tab-contents-recruit .' + key).attr('href', recruitOutputData['link_url4_url']);
            }
            if (key === 'link_url5_title') {
              if (typeof isApplican !== "undefined" && isApplican) {
                recruitOutputData['link_url5_url'] = linkOrWebview(recruitOutputData['link_url5_url']);
              }
              $('.tab-contents-recruit .' + key).attr('href', recruitOutputData['link_url5_url']);
            }

            if (key === 'free_fields') {
              if (recruitOutputData[key]) {
                var freeFields = JSON.parse(recruitOutputData[key]);
                if (typeof (freeFields) == 'object') {
                  var _template = '';
                  var _prefix = 'free_field';
                  var formatedFreeField = {};
                  for (var i = 1; i <= 30; i++) {
                    var _content = freeFields[_prefix + i + '_content'];
                    var _isVisible = freeFields[_prefix + i + '_is_visible'];
                    var _title = freeFields[_prefix + i + '_title'];
                    if ((_content || _title) && Number.parseInt(_isVisible) === 1) {
                      formatedFreeField[_prefix + i] = {
                        'content': _content || '',
                        'title': _title || ''
                      };
                    }
                  }
                  _.forIn(formatedFreeField, function (value, key) {
                    _template += '<tr id="link_url1_url_wrap">' +
                        '                <th class="w15em line-break">' + value['title'] + '</th>' +
                        '                <td class="line-break">' + value['content'] + '</td>' +
                        '           </tr>';
                  });
                  $('#free-fields').append(_template);
                }
              }
            }
            $('.tab-contents-recruit .' + key).html(recruitOutputData[key]);
          } else {
            // if (key === 'link_url1_title' || key === 'link_url1_url') {
            //   $('#link_url1_url_wrap').remove();
            // }
            // if (key === 'link_url2_title' || key === 'link_url2_url') {
            //   $('#link_url2_url_wrap').remove();
            // }
            // if (key === 'link_url3_title' || key === 'link_url3_url') {
            //   $('#link_url3_url_wrap').remove();
            // }
            // if (key === 'link_url4_title' || key === 'link_url4_url') {
            //   $('#link_url4_url_wrap').remove();
            // }
            // if (key === 'link_url5_title' || key === 'link_url5_url') {
            //   $('#link_url5_url_wrap').remove();
            // }
            if (key === 'monthly_overtime_average_year') {
              $('#monthly_overtime_average_year').remove();
            }
            if (key === 'paid_day_off_average_year') {
              $('#paid_day_off_average_year').remove();
            }
            if (key === 'childcare_leave_men_average_year') {
              $('#childcare_leave_men_average_year').remove();
            }
            if (key === 'the_percentage_of_female_officers_and_female_managers') {
              $('#the_percentage_of_female_officers_and_female_managers').remove();
            }

            //hide table 直近３事業年度の新卒者等の採用者数（男性／女性）
            if (key === 'years_gender_recruit_year_1') {
              tableYearsGender += 1;
            }
            if (key === 'years_gender_recruit_description') {
              tableYearsGender += 1;
            }
            if (tableYearsGender === 2) {
              $('#years_gender_recruit_year_1_male_number').remove();
            }

            //hide table 直近３事業年度の新卒者等の採用者数／離職者数
            if (key === 'years_recruit_year_1') {
              yearsRecruitYear += 1;
            }
            if (key === 'years_recruit_description') {
              yearsRecruitYear += 1;
            }
            if (yearsRecruitYear === 2) {
              $('#years_recruit_year').remove();
            }

            $('.' + key + '_wrap').remove();

            $('.tab-contents-recruit .' + key).remove();
          }
        } else if (typeof (recruitOutputData[key]) == 'boolean') {
          if (recruitOutputData[key] === true) {
            $('.tab-contents-recruit .' + key).html('あり');
          } else {
            $('.tab-contents-recruit .' + key).html('なし');
          }
        }
      }

      // check status book recruit guide
      var $recruitEntryBtn = $('#recruit-entry-btn');
      $recruitEntryBtn.addClass('btn-disabled');
      $recruitEntryBtn.addClass('text-black');

      if (!recruitOutputData['entry_button_is_visible']) {
        $recruitEntryBtn.fadeOut();
      } else if (recruitOutputData['is_applied'] === true) {
        // disable
        $recruitEntryBtn.text('すでにエントリーしています');
      } else if (recruitOutputData['out_of_date'] === true) {
        // out of date
        $recruitEntryBtn.text('エントリーを締め切りました');
      } else if (recruitOutputData['is_coming_soon'] === true) {
        // coming soon
        $recruitEntryBtn.text('エントリーを受け付けておりません');
      } else {
        // can book
        $recruitEntryBtn.removeClass('btn-disabled');
        $recruitEntryBtn.removeClass('text-black');
        $recruitEntryBtn.text('エントリー');
      }

    } else {
      $('.tab-contents-recruit').html('<div class="alert-box">現在、公開された採用データはありません</div>');
    }
    // フリーコンテンツ表示判定
    if (recruitOutputData['free_contents1_image_is_visible'] == 1) {
      $('.tab-contents-recruit .free_contents1_image_url').attr('src', recruitOutputData['free_contents1_image_url']);
    } else {
      $('.free_contents1e_wrap').remove();
    }
    if (recruitOutputData['free_contents2_image_is_visible'] == 1) {
      $('.tab-contents-recruit .free_contents2_image_url').attr('src', recruitOutputData['free_contents2_image_url']);
    } else {
      $('.free_contents2_wrap').remove();
    }
    if (recruitOutputData['free_contents1_content_is_visible'] != 1) {
      $('.tab-contents-recruit .free_contents1_content').remove();
    }
    if (recruitOutputData['free_contents2_content_is_visible'] != 1) {
      $('.tab-contents-recruit .free_contents2_content').remove();
    }

    renderedCount++;

    if (recruitOutputData.average_age_of_employees_age == null) {
      $('#employees_year').hide();
    }
    if (recruitOutputData.average_age_of_employees_year == null) {
      $('#average_age').hide();
    }
    if (recruitOutputData.average_age_of_employees_age == null && recruitOutputData.average_age_of_employees_year == null) {
      $('.average_age_of_employees_year_wrap').hide();
    }

  }

  function recruitDataGetError() {
    $('.tab-contents-recruit').html('<div class="alert-box">現在、募集中の採用データがありません</div>');
    renderedCount++;
  }

  // インターンシップ情報取得
  function internshipsDataGet() {
    renderCallCount++;
    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (studentId && token) {
      _.assign(headers, {'Authorization': 'Bearer ' + token});
    }

    // NOTE : approve_status='1,2' mean get all internships including waiting for approval.
    $.ajax({
      url: rootVariables.apiUrl + '/internships?partner_id=' + partnerId + '&contract_term_id=' + contractTermId +
          '&company_id=' + companyId + '&approve_status=1,2',
      type: 'GET',
      headers: headers,
      success: function (result) {
        if (result['data'].length > 0) {
          internshipsDataGetSuccess(result);
        } else {
          internshipsDataGetError();
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        internshipsDataGetError();
      }
    });
  }

  function internshipsDataGetSuccess(data) {
    // インターンシップ一覧出力
    var internshipTitles = '';
    var interns = data['data'];
    if (interns.length > 1) {
      for (i in interns) {
        // internshipTitles = internshipTitles + '<li class="category-list-ul-li"><a href="' + companyDetailUrl +
        // '?company_id=' + companyId + '&internship_id=' + intern[i]['internship_id'] + '#tabArea">' +
        // intern[i]['title'] + '</a></li>';
        internshipTitles = internshipTitles +
            '<li class="category-list-ul-li"><a href="javascript:void(0)" data-internship-id="' +
            interns[i]['internship_id'] + '" class="intership-tab-a">' + interns[i]['title'] + '</a></li>';
      }
      $('#internship-titles').html(internshipTitles);
    } else {
      $('#internship-titles').remove();
    }
    onChangeInternshipTab(interns);

    var url = new URL(window.location.href);
    var internshipId = url.searchParams.get('internship_id');
    var matchedInternship = _.find(interns, function (intern) {
      return intern['internship_id'] == internshipId;
    });

    // if there is matched intership in query param then dump it
    // else dump first intership as default
    if (internshipId && matchedInternship) {
      dumpIntershipInfo(matchedInternship);
    } else {
      dumpIntershipInfo(interns[0]);
    }
    renderedCount++;
  }

  function internshipsDataGetError() {
    $('.tab-contents-internships').html('<div class="alert-box">現在、募集中のインターンシップはありません</div>');
    renderedCount++;
  }

  function addressInsert(parentClass, postCode, result) {
    var addressData = result['data'][0];
    // 見出し挿入
    $('.' + parentClass + '_wrap th').append(c[parentClass + '_title']);
    // 郵便番号挿入
    if (postCode !== null) {
      $('.' + parentClass + '_wrap .postcode').html(postCode.slice(0, 3) + '-' + postCode.slice(-4));
    }
    if (!_.isUndefined(addressData[parentClass + '_prefecture_name'])) {
      $('.' + parentClass + '_wrap .address_line1').append(c[parentClass + '_prefecture_name']);
    }
    // 県名挿入
    // $('.' + parentClass + '_wrap .address_line1').append(addressData['todoken_kanji'] || '');
    $('.' + parentClass + '_wrap .address_line1').append(addressData[parentClass + '_city_id'] || '');
    // city
    // $('.' + parentClass + '_wrap td').append('<span class="address_city">' + + '</span>');
    // 住所1、住所2挿入
    $('.' + parentClass + '_wrap .address_line1').append(addressData[parentClass + '_line1']);
    $('.' + parentClass + '_wrap .address_line2').append(addressData[parentClass + '_line2']);
  }

  // タブ処理
  function tabChange() {
    $('.tabs-ul-li a').on('click', function () {
      $('.tabs-ul-li a').removeClass('tab-a-active');
      $(this).addClass('tab-a-active');
      // クリックしたタブからインデックス番号を取得
      var index = $(this).parent('li').index();
      // クリックしたタブと同じインデックス番号をもつコンテンツを表示
      $('.tab-contents > section').hide();
      $('.tab-contents > section').eq(index).show();
      // コンテンツ出力あり、タブ切り替え時にコールバック
      if ($('#entryBtnBoxRecruit').length) {
        floatBtn('entryBtnBoxRecruit', 'entryBtnOuterBoxRecruit', 'tabs');
      }
      if ($('#entryBtnBoxInternships').length) {
        floatBtn('entryBtnBoxInternships', 'entryBtnOuterBoxInternships', 'tabs');
      }

    });
  }

  // ボタン処理
  function floatBtn(btnBoxId, btnOuterBoxId, targetId) {

    var windowHeight = 0;
    var btnBoxHeight = 0;
    var btnBoxOffsetBottom = 0;
    var btnBoxBottom = 0;
    var targetOffsetTop = 0;
    var targetHeight = 0;
    var timingAppear = 0;
    var timingStop = 0;

    windowHeight = $(window).innerHeight();
    btnBoxHeight = $('#' + btnBoxId).outerHeight();
    btnBoxOffsetBottom = $('#' + btnBoxId).offset().top + btnBoxHeight;
    btnBoxBottom = Number($('#' + btnBoxId).css('bottom').replace('px', ''));
    targetOffsetTop = $('#' + targetId).offset().top;
    targetHeight = $('#' + targetId).innerHeight();
    timingAppear = targetOffsetTop - windowHeight + btnBoxHeight + targetHeight + btnBoxBottom;
    timingStop = btnBoxOffsetBottom - windowHeight + btnBoxBottom;

    //var btnBoxOuterHeight = $('#'+btnBoxId).outerHeight(true);
    $('#' + btnOuterBoxId).height(btnBoxHeight);

    $(window).on('scroll load resize orientationchange', function () {
      $(window).exScrollEvent(function (evt, prm) {
        if (prm.status == 1) {
          timingAppear = targetOffsetTop - windowHeight + btnBoxHeight + targetHeight + btnBoxBottom;
          timingStop = btnBoxOffsetBottom - windowHeight + btnBoxBottom;
        }
      });
      if ($('#' + btnBoxId)) {
        if ($(this).scrollTop() >= timingAppear) {
          if (!$('#' + btnBoxId).hasClass('visible')) {
            $('#' + btnBoxId).addClass('visible');
          }
          if ($(this).scrollTop() >= timingStop) {
            if ($('#' + btnBoxId).hasClass('fixed')) {
              $('#' + btnBoxId).removeClass('fixed');
            }
          } else {
            if (!$('#' + btnBoxId).hasClass('fixed')) {
              $('#' + btnBoxId).addClass('fixed');
            }
          }
        } else {
          if ($('#' + btnBoxId).hasClass('visible')) {
            $('#' + btnBoxId).removeClass('visible');
          }
        }
      }
    });

  }

  // リダイレクト処理
  function redirectToCompanySearch() {
    $('.article-box.error').fadeIn();
    setTimeout(function () {
      toLocationHref(companySearchUrl);
    }, 5000);
  }

  // データ取得確認・タイマー
  var renderTimer, timeoutTimer;
  startTimer();
  timeoutAlert();

  function startTimer() {
    renderTimer = setInterval(function () {

      // レンダリングが終了したら
      if (renderedCount == renderCallCount) {
        // タブ切り替え、エントリーボタン挙動コールバック
        tabChange();
        // インターバル＆タイムアウト停止
        clearInterval(renderTimer);
        clearTimeout(timeoutTimer);
        $('body').fadeIn();
        // Check goto internship tab if it have go-internship-tab parameters
        var url = new URL(window.location.href);
        var whichTab = url.searchParams.get('go_tab');
        var classTab = '';
        switch (whichTab) {
          case 'companyinfo' : {
            classTab = 'companyinfo';
            break;
          }
          case 'internship': {
            classTab = 'internships';
            break;
          }
          case 'recruit_guide': {
            classTab = 'recruit';
            break;
          }
          case 'disclosure': {
            classTab = 'disclosure';
            break;
          }
          default : {
            classTab = '';
            break;
          }
        }

        var $tab = $('.tab-a' + (!_.isEmpty(classTab) ? '.' + classTab : '.companyinfo'));
        $tab.click();
        // company detail tab won't scroll down
        if (!_.isEmpty(classTab)) {
          setTimeout(function () {
            $('html, body').animate({
              scrollTop: $tab.offset().top - 90
            }, 1500);
          }, 2000);
        }
      }
    }, 500);

    // remove returnUrl
    removeGlobalInfo("returnUrl", {path: "/"})
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

  $('.toggleOverflow').on('click', function () {
    if ($(this).hasClass('companies-ellipsis-visible')) {
      $(this).removeClass('companies-ellipsis-visible');
    } else {
      $(this).addClass('companies-ellipsis-visible');
    }
  });

  /////////////////////
  ///// FOR ASURA /////
  ////////////////////
  function eventAsuraByPrefCode(_companyContract) {
    $.ajax({
      url: apiUrlAsura + '/outside_events/get_event_index',
      type: 'POST',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        var datas = res.response;
        if (res.response.length > 0) {
          var asuraEvent = _.filter(datas, function (_company) {
            return _company.companyId === parseInt(_companyContract.e2r_pro_id);
          });
          // order asc event
          asuraEvent = _.orderBy(asuraEvent, ['heldDate', function( _event) {
            return _event.timezones[0].fromTime;
          }], ['asc', 'asc']);
          if (asuraEvent.length > 0) {
            dumpListCompanyAsura(asuraEvent);
          }
        } else {
          $('#data-asura').hide();
        }
      },
      error: function (XMLHttpRequest) {
        console.log(XMLHttpRequest);
      }
    });
  }
}
if (typeof isApplican !== "undefined" && isApplican) {
  document.addEventListener('deviceready', function () {
    offlineData = new OfflineData(id, jwt, partnerId);
    onLoad();
  });
} else {
  $(document).ready(onLoad);
}

function dumpListCompanyAsura(_datas) {
  $('.companies-event-label-box').append('<span class="companies-event-label companies-event-reservation">企業セミナー予約受付中</span>');
  $('#data-asura-title').show();
  
  var tagUl = '<ul id="list-company-asura" class="event-ul showForEvent"></ul>';
  $('#data-asura').append(tagUl);
  var numItems = 2;
  
  _.forEach(_datas, function (item, idx) {
    var classLi = null;
    if (idx === 0) {
      classLi = 'upper-row';
    } else if (idx == 1) {
      classLi = 'upper-row';
    } else {
      classLi = '';
    }
    var getTimeForm = '';
    
    _.forEach(item.timezones, function (item_date) {
      var getHourMinuteForm = moment(item_date.fromTime, 'HHmm').format('HH:mm');
      var getHourMinuteTo = moment(item_date.toTime, 'HHmm').format('HH:mm');
      getTimeForm += getHourMinuteForm + '〜' + getHourMinuteTo + ' ';
    });
    
    // only show 4 item
    if (idx >= numItems) {
      classLi += ' hidden';
    }
    var getDay = moment(item.heldDate, 'YYYY/MM/DD').format('ddd').toUpperCase();
    var getDate = moment(item.heldDate, 'YYYY/MM/DD').format('MM/DD');
    var tagsLi = ' <li class="event-ul-li ' + classLi + '">' +
        '   <div class="event-info-box">' +
        '     <div class="event-loc">' + item.prefName + '</div>' +
        '     <div class="event-dateday"><span class="event-date">' + getDate + '</span><span class="event-day">' +
        getDay + '</span></div>' +
        '     <div class="event-time">' + getTimeForm + '</div>' +
        '     <div class="event-ttl">' + item.publicName + '</div>' +
        '    </div>' +
        '   <div class="event-btn-box">' +
        '     <a href="/event/detail?eventOf=ASURA&step_id=' + item.stepId + '&asura_company_id=' + item.companyId +
        '&event_held_date_id=' + item.eventHeldDateId + '&asura_student_id=' + (registrantId ? registrantId : null) +
        '" class="btn-small btn-blue">詳細・予約</a>' +
        '   </div>' +
        ' </li>';
    
    $('#list-company-asura').append(tagsLi);
  });
  
  // Show more if items > 4
  if (_datas.length > 2) {
    var btnShowMore = '<div id="corporateSeminar-show-more" class="event-more-box">' +
        '  <a href="javascript:void(0);" class="event-more">more</a>'  +
        '</div>';
    $('#data-asura').append(btnShowMore);
  }
  
  // Handing click more
  $('#data-asura .event-more').on('click', function () {
    var li = $('#list-company-asura > .event-ul-li.hidden');
    if (li.length > 0) {
      var items = $(li).slice(0, numItems);
      items.each(function (index, item) {
        $(item).removeClass('hidden');
      });
      if (li.length - items.length === 0) {
        $(this).hide();
      }
    }
  });
}
