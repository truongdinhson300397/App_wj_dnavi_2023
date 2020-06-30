(function () {
  'use strict';

  // Customize date time format using moment
  moment.updateLocale('ja', {
    weekdays: [
      '日', '月', '火', '水', '木', '金', '土'
    ],
    weekdaysShort: [
      '日', '月', '火', '水', '木', '金', '土'
    ],
    months: [
      '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
    ],
    monthsShort: [
      '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
    ]
  });
  moment.tz.setDefault('Japan');

  var data = {};
  var isGeneratedNotice = false;  // Check if notice is generated
  var isGeneratedButton = false;
  var contractTermId = globalInfo('contract_term_id');
  var URL = rootVariables.apiUrl + '/quiz/2?contract_term_id='+ contractTermId;

  function fetchApi() {
    var contractTermId = globalInfo("contract_term_id");
    var jwt = globalInfo('jwt_' + contractTermId);
    const options = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + jwt,
        contentType: 'application/json',
        accept: 'application/json'
      },
      url: URL,
    };
    axios(options).then(function (resp) {
      data = resp.data.data;
      generateNotice();
      generateSchedules();
    });
  }

  // Get notice from server for quiz-notice class
  function generateNotice(_quizId, _nextQuizId) {
    var $quizTitle = $('.quiz-title');
    var $quizTime = $('.quiz-time');
    var $quizDescription = $('.quiz-description');
    var quizInfo = null;

    $quizTitle.html('現在、開催中の試験はありません。');
    // Render notice info for current quiz
    if (!_.isUndefined(_quizId) && !_.isNull(_quizId)) {
      quizInfo = data[_quizId];

      if (_quizId === 0) {
        $quizTitle.html('おためし チャレンジ' + (_quizId + 1) + '　模擬試験 <span class="ilb">開催中</span>');
      } else {
        if (contractTermId === '2' && _quizId === 1) {
          $quizTitle.html('おためし チャレンジ' + _quizId + '　模擬試験 <span class="ilb">開催中</span>');
        } else {
          $quizTitle.html('第' + (_quizId - 1) + '回　模擬試験 <span class="ilb">開催中</span>');
        }
      }
      $quizTime.html(
          '試験期間：'
          + moment(quizInfo.start_date).format('M月D日(ddd)')
          + '～'
          + moment(quizInfo.end_date).format('M月D日(ddd)'));
      $quizDescription.addClass('note-kome ilb tall');
      $quizDescription.html('開始、終了は全て午前10時になります。');
      isGeneratedNotice = true;
    } else if (!_.isUndefined(_nextQuizId) && !_.isNull(_nextQuizId)) {   // Render notice info for next quiz
      quizInfo = data[_nextQuizId];
      $quizTime.html(
          '次回の開催予定：'
          + moment(quizInfo.start_date).format('M月D日(ddd)') + ' 10：00 ～');
      $quizDescription.html(' 開催日までしばらくお待ち下さい。');
      isGeneratedNotice = true;
    } else {
      isGeneratedNotice = false;
    }
  }

  // Used for sorting
  function compare(a, b) {
    if (a.start_date < b.start_date) {
      return -1;
    }
    if (a.start_date > b.start_date) {
      return 1;
    }
    return 0;
  }

  // Get list of quizs fromserver and render to HTML
  function generateSchedules () {
    var now = moment();
    var quizs = data;
    var $quizSchedule = $('.quiz-schedule');

    quizs.sort(compare);    // Sort quizzes by closest start_date first

    for (var i = 0; i < quizs.length; ++i) {
      var start = moment(quizs[i].start_date).format('M月D日(ddd)');
      var end = moment(quizs[i].end_date).format('M月D日(ddd)');
      var checkStart = now.isSameOrAfter(quizs[i].start_date);
      var checkEnd = now.isSameOrBefore(quizs[i].end_date);
      var btn = '<a href="' + link.contentsTamatebako_test_3 + '?quizId=' + quizs[i].content_id + '" class="btn-xsmall btn-green">受験する</a>';

      if (i === 0) {
        var qNumber = contractTermId === '2' ? i + 1 : '';
        if ((checkStart && checkEnd)) {
          if (quizs[i].can_do === 0) {
            btn = '<a class="btn-xsmall btn-disabled">受験完了</a>';
          }
          $quizSchedule.append(
            '<li class="contents-ul-li">' +
            '<div class="contents-ul-li-ttl">' + 'おためし<br>チャレンジ' + qNumber + '</div>' +
            '<div class="contents-ul-li-prd">' + start + '～' + end + '</div>' +
            '<div class="contents-ul-li-btn">' +
            // '<a href="tamatebakomini_3.html?quizId=' + quizs[i].content_id + '" class="btn-xsmall btn-green">受験する</a>' +
            btn +
            '</div>' +
            '</li>'
          );
          generateNotice(i);
        } else if (!checkStart && checkEnd) {
          if (!isGeneratedButton) {
            btn = '<a class="btn-xsmall btn-disabled">次回</a>';
          } else {
            btn = '';
          }
          $quizSchedule.append(
              '<li class="contents-ul-li">' +
              '<div class="contents-ul-li-ttl">' + 'おためし<br>チャレンジ' + qNumber + '</div>' +
              '<div class="contents-ul-li-prd">' + start + '～' + end + '</div>' +
              '<div class="contents-ul-li-btn">' +
              btn +
              '</div>' +
              '</li>'
          );
          isGeneratedButton = true;
          if (!isGeneratedNotice) {
            generateNotice(null, i);
          }
        } else {
          $quizSchedule.append(
            '<li class="contents-ul-li">' +
            '<div class="contents-ul-li-ttl">' + 'おためし<br>チャレンジ' + qNumber + '</div>' +
            '<div class="contents-ul-li-prd">' + start + '～' + end + '</div>' +
            '<div class="contents-ul-li-btn"></div>' +
            '</li>'
          );
        }
      } else {
        var qTitle = '第' + i + '回';
        if (contractTermId === '2') {
          if (i === 1) {
            qTitle ='おためし<br>チャレンジ' + (i + 1);
          } else {
            qTitle = '第' + (i - 1) + '回';
          }
        }

        if ((checkStart && checkEnd)) {
          btn = '<a href="' + link.contentsTamatebako_test_3 + '?quizId=' + quizs[i].content_id + '" class="btn-xsmall btn-green">受験する</a>';
          if (quizs[i].can_do === 0) {
            btn = '<a class="btn-xsmall btn-disabled">受験完了</a>';
          }
          $quizSchedule.append(
              '<li class="contents-ul-li">' +
              '<div class="contents-ul-li-ttl">' + qTitle + '</div>' +
              '<div class="contents-ul-li-prd">' + start + '～' + end + '</div>' +
              '<div class="contents-ul-li-btn">' +
              btn +
              '</div>' +
              '</li>'
          );
          generateNotice(i);
        } else if (!checkStart && checkEnd) {
          if (!isGeneratedButton) {
            btn = '<a class="btn-xsmall btn-disabled">次回</a>';
          } else {
            btn = '';
          }
          $quizSchedule.append(
              '<li class="contents-ul-li">' +
              '<div class="contents-ul-li-ttl">' + qTitle + '</div>' +
              '<div class="contents-ul-li-prd">' + start + '～' + end + '</div>' +
              '<div class="contents-ul-li-btn">' +
              btn +
              '</div>' +
              '</li>'
          );
          isGeneratedButton = true;
          if (!isGeneratedNotice) {
            generateNotice(null, i);
          }
        } else {
          $quizSchedule.append(
              '<li class="contents-ul-li">' +
              '<div class="contents-ul-li-ttl">' + qTitle + '</div>' +
              '<div class="contents-ul-li-prd">' + start + '～' + end + '</div>' +
              '<div class="contents-ul-li-btn"></div>' +
              '</li>'
          );
        }
      }
    }
  }

  /*---------------------FUNCTION CALL----------------------------*/
  util.clearStorage();
  fetchApi();
})();
