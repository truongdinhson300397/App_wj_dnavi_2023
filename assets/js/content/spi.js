/*Axios*/
//get
moment.tz.setDefault('Japan');
var quizs = [];
var now = moment().format('YYYY-MM-DD HH:mm:ss');
var contractTermId = globalInfo('contract_term_id');
var isShowButton = true;
axios.get(rootVariables.apiUrl + '/quiz/1?contract_term_id='+ contractTermId).then(function (response) {
  // handle success
  quizs = response.data.data;
  generateQuizs(quizs);
  generateQuizSchedule(quizs);
}).catch(function (error) {
  // handle error
  console.log('khong lay dc data', error);
});

// Get notice from server, generate inside .quiz-notice
function generateQuizs (_quizs) {
  var $quizNumber = $('.quiz-number');
  var $quizTime = $('.quiz-time');
  //get quiz today

  var todayQuizNum = _.findIndex(quizs, function (_quiz) {
    return isDateBetween(now, _quiz.start_date, _quiz.end_date);
  });

  /*Không có bài thi, hiện bài trong tương lai gần nhất */
  /*There are no exams, time display in the nearest future*/
  if (todayQuizNum === -1) {
    var arrayDay = [];
    _.forEach(_quizs, function (_time) {
      var new_day = moment(_time.start_date).format('YYYY-MM-DD');
      var compare = moment(moment(new_day)).diff(now, 'days');
      if (compare > 0) {
        arrayDay.push(compare);
      }
    });
    // arrayDay.shift();
    // var maxDay = Math.max.apply(Math, arrayDay);
    var closestDay = Math.min.apply(Math, arrayDay);
    // var date = moment(now).add(maxDay, 'days').toDate();
    var date = moment(now).add((closestDay + 1), 'days').toDate();
    var dateFuture = convertTime(date);
    $quizNumber.append(
      '現在、開催中の試験はありません。'
    );
    if(arrayDay > 0) {
      $quizTime.append(
        '次回の開催予定：' + dateFuture + ' 10：00〜' +
        '開催日までしばらくお待ち下さい。'
      );
    }
    return;
  }

  /*Bài thi diễn ra vào bài thi thử */
  /*The test takes place into the practice test*/
  if(contractTermId === '1') {
    if (todayQuizNum === 0) {
      $quizNumber.append(
        'おためし チャレンジ　模擬試験 <span class="ilb">開催中</span>'
      );
    } else {
      /*Có bài thi đang diễn */
      /*There are ongoing exams*/
      $quizNumber.append(
        '第' + todayQuizNum + '回　模擬試験 <span class="ilb">開催中</span>'
      );
    }
  }

  // For contract term id is 2
  if(contractTermId === '2'){
    if (todayQuizNum < 2) {
      todayQuizNum = todayQuizNum + 1;
      $quizNumber.append(
        'おためし チャレンジ ' + todayQuizNum + ' 模擬試験 <span class="ilb">開催中</span>'
      );
    } else {
      /*Có bài thi đang diễn */
      /*There are ongoing exams*/
      todayQuizNum = todayQuizNum - 2;
      $quizNumber.append(
        '第' + todayQuizNum + '回　模擬試験 <span class="ilb">開催中</span>'
      );
    }
  }

  var todayQuiz = _.find(quizs, function (_quiz) {
    return isDateBetween(now, _quiz.start_date, _quiz.end_date);
  });

  var startTime = convertTime(todayQuiz.start_date);
  var endTime = convertTime(todayQuiz.end_date);
  $quizTime.append(
    ' <div class="fsz-m">試験期間：' + startTime + '～' + endTime + '</div>\n' +
    ' <span class="note-kome ilb tall">開始、終了は全て10:00時になります。</span>'
  );
}

function generateQuizSchedule (_quizs) {
  var quizSchedule = _quizs;
  var $quizList = $('.quiz-list');

  quizSchedule.forEach(function (_quiz, _idx) {
    var startTime = convertTime(_quiz.start_date);
    var endTime = convertTime(_quiz.end_date);

    // Custom button status based on quiz time
    var button = '';
    var dateBetween = isDateBetween(now, _quiz.start_date, _quiz.end_date);
    if (dateBetween) {
      button = '<a href="/contents/spi_3?quizId=' + _quiz.content_id + '" class="btn-xsmall btn-green">受験する</a>';
    } else {
      // Quiz is in future
      if (isShowButton) {
        if (moment(now).isBefore(_quiz.start_date)) {
          button = '<a href="/contents/spi_3?quizId=' + _quiz.content_id + '" class="btn-xsmall btn-disabled">次回</a>';
          isShowButton = false;
        } else if (_quiz.is_active) {
          // Quiz was in the past
          button = '<a href="/contents/spi_3?quizId=' + _quiz.content_id + '" class="btn-xsmall btn-blue">過去問にチャレンジ</a>';
        }
      }
    }
    if (_idx === 0) {
      var qNumber = contractTermId === '2' ? _idx + 1 : '';

      $quizList.append(
        '<li class="contents-ul-li">'
        + '<div class="contents-ul-li-ttl">おためし</br>チャレンジ' + qNumber + '</div>'
        + '<div class="contents-ul-li-prd">' + startTime + ' ～ ' + endTime + '</div>'
        + '<div class="contents-ul-li-btn">'
        + button
        + '</div>'
        + '</li>'
      );
    } else {
      var qTitle = '第' + _idx + '回';
      if (contractTermId === '2') {
        if (_idx === 1) {
          qTitle ='おためし<br>チャレンジ' + (_idx + 1);
        } else {
          qTitle = '第' + (_idx - 1) + '回';
        }
      }
      $quizList.append(
        '<li class="contents-ul-li">'
        + '<div class="contents-ul-li-ttl">' + qTitle + '</div>'
        + '<div class="contents-ul-li-prd">' + startTime + ' ～ ' + endTime + '</div>'
        + '<div class="contents-ul-li-btn">'
        + button
        + '</div>'
        + '</li>'
      );
    }
  });
  $('.btn-clear-local').on('click', function () {
    localStorage.removeItem('time');
    localStorage.removeItem('current_quiz');
    localStorage.removeItem('number_questions');
    localStorage.removeItem('userAnswers');
    localStorage.removeItem('count-answers');
    localStorage.removeItem('is_submit');
  });
}
