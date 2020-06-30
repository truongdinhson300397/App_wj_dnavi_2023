// * Get quiz tamatebakodrill detail with id from server * //

// State
var state = {
  contentId: null,
  contentTitle: '',
  questions: [],
  userAnswers: [],
  userStartTime: null,
  userEndTime: 0,
  totalTimeSpend: 0,
  totalTimeContent: 60,
  isSubmit: null,
};

// Query param get content_id and with_timer
$.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null){
    return null;
  }
  else {
    return decodeURI(results[1]) || 0;
  }
};

var contentId = $.urlParam('content_id');
var withTimer = $.urlParam('with_timer');

// Set contentId and withTimer on localStorage
localStorage.setItem('contentId', contentId);
localStorage.setItem('withTimer', withTimer);

function getQuiz() {
  // fetch data from a url endpoint
  axios.get(rootVariables.apiUrl + '/questions/'+ contentId)
  .then(function (response) {
    // Save to state
    state.contentId = response.data.data.content_id;
    state.contentTitle = response.data.data.description;
    state.questions = response.data.data.questions;

    // Set total time -> contentTitle
    switch(state.contentTitle) {
      case '四則逆算型':
        state.totalTimeContent = 60;
        break;
      case '空欄補充型':
        state.totalTimeContent = 330;
        break;
      case '図表のよみとり型':
        state.totalTimeContent = 200;
        break;
      case 'GAB型':
        state.totalTimeContent = 120;
        break;
      case 'IMAGES型':
        state.totalTimeContent = 80;
        break;
      case '言語趣旨把握型':
        state.totalTimeContent = 70;
        break;
      default:
        state.totalTimeContent = 0;
    }

    // Get userAnswers on localStorage
    var userAnswersLocal = JSON.parse(localStorage.getItem('userAnswers'));
    // Check userAnswersLocal
    if (userAnswersLocal) {
      state.userAnswers = userAnswersLocal;
    }
    else {
      // Set userAnswers default answers_id = -1 (NoAnswer)
      for (var keyAnswer = 0; keyAnswer < state.questions.length; keyAnswer++){
        state.userAnswers.push(
          {
            question_id: state.questions[keyAnswer].question_id,
            answers_id: -1
          }
        )
      }
    }

    // Get isSubmit on localStorage
    var isSubmit = JSON.parse(localStorage.getItem('isSubmit'));
    // Check isSubmit
    if (isSubmit) {
      state.isSubmit = isSubmit;
      // If isSubmit === true then push to href page tamatebakodrill_4.html?content_id=
      if (isSubmit === true) {
        // Get contentId from localStorage
        var contentId = localStorage.getItem('contentId');
        toLocationHref('/contents/tamatebako_drill_4?content_id=' + contentId);
      }
    }
    else {
      state.isSubmit = false;
    }

    $(document).ready(function () {
      // Render content title
      $('#title_content').text(state.contentTitle);

      // Init question
      initQuestion();

      // Get answer when input change
      $('input[name=answer_id]').change(function () {
        getAnswer();
        checkedButtonBackground();
      });
    });
  })
  .then(function () {
    // Render time spend (Note: withTimer to urlParam is typeof string)
    if (withTimer === 'true') {
      timeSpend(state.totalTimeContent);
    }
  })
}

// Get currentQuestion on localStorage
var currentQuestionLocal = JSON.parse(localStorage.getItem('currentQuestion'));

// Content start from question 1
var currentQuestion = 0;
if (currentQuestionLocal) {
  currentQuestion = currentQuestionLocal;
}

/*Content Questions*/
function initQuestion() {
  // SetItems contentTitle and questions to localStorage
  localStorage.setItem('contentTitle', state.contentTitle);
  localStorage.setItem('questions', JSON.stringify(state.questions));

  // Init firsts question
  renderQuestion(state.questions[currentQuestion]);
}

// Render question[currentQuestion]
function renderQuestion(_questionInfo) {
  // Render progress number of content the user choose
  progressNumberOfQuiz();

  var dQuestionNumber = currentQuestion + 1;

  // Question DOM element
  var $questionHeader = $('#question-header');
  var $checkTypeQuestion = $('#check-type-question');
  var $questionTitle = $('<h4 id="aaa' + _questionInfo.question_id + '" class="contents-question-h4">');
  var $questionContent = $('<div class="contents-question-txt">');

  $('#question-detail-pr').append(_questionInfo.detail);

  if (_questionInfo.detail) {
    $questionTitle.text('問題1');
    $checkTypeQuestion.text('問' + dQuestionNumber);
  } else {
    $questionTitle.text('問題' + dQuestionNumber);
    $checkTypeQuestion.text('選択肢');
  }

  $questionContent.append(
    _questionInfo.title
    + '  <div class="contents-question-box">' + _questionInfo.content + '</div>'
  );
  $questionContent.append('<input type="hidden" name="question_id" value="' + _questionInfo.question_id + '"/>');
  $questionHeader.append($questionTitle);
  $questionHeader.append($questionContent);

  var $answersUi = $('#answersUl');
  var answers = _questionInfo.answers[0];

  var keyAnswer = '';
  _.times(10, function (idx) {
    if (answers['answer_' + (idx + 1)] != null && answers['answer_' + (idx + 1)] !== '') {
      if (_questionInfo.detail) {
        switch(idx + 1) {
          case 1:
            keyAnswer = '<span class="contents-answer-bx-th">A</span>';
            break;
          case 2:
            keyAnswer = '<span class="contents-answer-bx-th">B</span>';
            break;
          case 3:
            keyAnswer = '<span class="contents-answer-bx-th">C</span>';
            break;
          case 4:
            keyAnswer = '<span class="contents-answer-bx-th">D</span>';
            break;
          case 5:
            keyAnswer = '<span class="contents-answer-bx-th">E</span>';
            break;
          case 6:
            keyAnswer = '<span class="contents-answer-bx-th">F</span>';
            break;
          case 7:
            keyAnswer = '<span class="contents-answer-bx-th">G</span>';
            break;
          case 8:
            keyAnswer = '<span class="contents-answer-bx-th">H</span>';
            break;
          case 9:
            keyAnswer = '<span class="contents-answer-bx-th">I</span>';
            break;
          default:
            keyAnswer = '';
        }
      }
      var answer = answers['answer_' + (idx + 1)];
      $answersUi.append(
        '<li class="contents-answer-ul-li" id="checked-' + (idx + 1) + '">' +
        '  <label class="label-default label-tamatebako-answer">' +
        '   <input type="radio" name="answer_id" class="input-radio" value="' + (idx + 1) + '"/> ' +
        '   <span class="radio-span"></span>' +
        '   <span class="contents-answer-bx">' +
        keyAnswer +
        '     <span class="contents-answer-bx-td">' +
        answer +
        '     </span>' +
        '   </span>' +
        '  </label>' +
        '</li>'
      );
    }
  });

  // Remove image '問1 2 3' and image 'A B C'
  $('.contents-answer-outer .remove__image img').remove();
  $('#answersUl span img').remove();

  checkedButtonBackground();

  unCheckButton(currentQuestion);
  getAnswer();
}

function checkedButtonBackground() {
  $("li").removeClass("checked");
  var $currentQuestion = $(('input[name ="question_id"]'));
  var userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
  if (userAnswers) {
    if (userAnswers.length > 0) {
      var existAnswers = _.find(userAnswers, function(i) {
        return i.question_id === parseInt($currentQuestion.val());
      });
      if (existAnswers) {
        $(('input[value ="' + existAnswers.answers_id + '"]')).attr('checked', 'checked');
        $('input[value ="' + existAnswers.answers_id + '"]').parent().parent().addClass('checked');
      }
    }
  }
}

// Number of content
var percentAnswers = 0;
function progressNumberOfQuiz() {
  // Init progress number answers
  var $progressNumberOfQuiz = $('#progress-number-quiz');
  var $numberQuiz = $('<span class="progress-ul-li-num-cnt">');
  var $totalQuiz = $('<span class="progress-ul-li-num-total">');

  if (state.userAnswers.length === 0) {
    $numberQuiz.text("0");
  }
  var answersTemp = state.userAnswers;
  var currentNumberQuiz = 0;

  _.forEach(answersTemp, function (_answerTemp) {
    if (_answerTemp.answers_id !== -1) {
      currentNumberQuiz++;
    }
  });

  $numberQuiz.text(currentNumberQuiz);
  $totalQuiz.text(' / ' + state.questions.length + ' 問');

  $progressNumberOfQuiz.append($numberQuiz);
  $progressNumberOfQuiz.append($totalQuiz);

  //  Percent number answers
  var $percentNumberAnswers = $('#percent-number-answers');
  percentAnswers = (currentNumberQuiz / state.questions.length) * 100;
  $percentNumberAnswers[0].style.width = percentAnswers + '%';
}

// Time spend
var timeOut = null;
var percentTime = '';
function timeSpend(_totalTimeQuiz) {
  state.userStartTime = moment(new Date());
  if (withTimer === 'true') {
    $('#render-progress-timer').append(
      '<li class="progress-ul-li" id="check-with-timer">\n' +
      '                <div class="progress-ul-li-hd">時間</div>\n' +
      '                <div class="progress-ul-li-num">\n' +
      '                  <span id="time-start" class="progress-ul-li-num-cnt"></span> /\n' +
      '                  <span id="num-total-time" class="progress-ul-li-num-total"></span> 秒\n' +
      '                </div>\n' +
      '                <div class="progress-ul-li-bar">\n' +
      '                  <div class="progressbar-outer">\n' +
      '                    <div id="percent-time" class="progressbar-inner" style="width: 0"></div>\n' +
      '                  </div>\n' +
      '                </div>\n' +
      '              </li>'
    );
  }
  var $timeStart = $('#time-start');
  var $timeTotalTime = $('#num-total-time');
  var $percentTime = $('#percent-time');

  var minutesTotal = Math.floor(_totalTimeQuiz);

  // Render totalTimeQuiz
  $timeTotalTime.text(minutesTotal);
  $timeStart.text(0);
  // Percent progress timestart / totaltime
  state.totalTimeSpend = localStorage.getItem('time');

  // Have time start
  if (state.totalTimeSpend) {
    var minutesTotalSpentTime = Math.floor((state.totalTimeSpend) <= 1 ? 1 : state.totalTimeSpend );
    if (minutesTotalSpentTime > minutesTotal) {
      $timeStart.text(state.totalTimeContent);
    }
    else {
      $timeStart.text(minutesTotalSpentTime);
    }
    calculatorOfTime(state.totalTimeSpend, _totalTimeQuiz);
    $percentTime[0].style.width = percentTime + '%';

    timeOut = setInterval(function () {
      if (state.totalTimeSpend < _totalTimeQuiz) {
        state.totalTimeSpend++;
        var minutesTotalSpentTime = Math.floor((state.totalTimeSpend) <= 1 ? 1 : state.totalTimeSpend );
        if (minutesTotalSpentTime > minutesTotal) {
          $timeStart.text(state.totalTimeContent);
        }
        else {
          $timeStart.text(minutesTotalSpentTime);
        }
        calculatorOfTime(state.totalTimeSpend, _totalTimeQuiz);
        $percentTime[0].style.width = percentTime + '%';
      }
      if (state.totalTimeSpend >= _totalTimeQuiz) {
        state.submit = true;
        localStorage.setItem('isSubmit', state.submit);
        var body = {
          quizId: parseInt(contentId),
          total_time_spend: _totalTimeQuiz,
          questions: state.userAnswers
        };
        uploadUserData(body);

        clearInterval(timeOut);
      }

      localStorage.setItem('time', state.totalTimeSpend);
    }, 1000);
  }
  else {
    // Run time begin
    timeOut = setInterval(function () {
      state.userEndTime = moment(new Date());
      state.totalTimeSpend = state.userEndTime.diff(state.userStartTime, 'seconds');
      localStorage.setItem('time', state.totalTimeSpend);
      var minutesTotalSpentTime = Math.floor((state.totalTimeSpend) <= 1 ? 1 : state.totalTimeSpend );
      if (minutesTotalSpentTime > minutesTotal) {
        $timeStart.text(state.totalTimeContent);
      }
      else {
        $timeStart.text(minutesTotalSpentTime);
      }
      calculatorOfTime(state.totalTimeSpend, _totalTimeQuiz);
      $percentTime[0].style.width = percentTime + '%';
      if (state.totalTimeSpend >= _totalTimeQuiz) {
        state.submit = true;
        localStorage.setItem('isSubmit', state.submit);
        var body = {
          quizId: parseInt(contentId),
          total_time_spend: _totalTimeQuiz,
          questions: state.userAnswers
        };
        uploadUserData(body);
        clearInterval(timeOut);
      }
    }, 1000);
  }
}

// Calculator precent time
function calculatorOfTime(_totalTime, __totalTimeQuiz) {
  percentTime = (_totalTime / __totalTimeQuiz) * 100;
  return percentTime;
}

// Get answer when change check input of question_id
function getAnswer() {
  var $currentQuestion = $(('input[name ="question_id"]'));
  var $currentAnswer = $(('input[name ="answer_id"]:checked'));
  var userAnswers = state.userAnswers;

  if ($currentAnswer.length > 0) {
    if (userAnswers.length === 0) {
      userAnswers.push(
        {
          question_id: parseInt($currentQuestion.val()),
          answers_id: parseInt($currentAnswer.val())
        }
      );
    }
    else {
      //Test answer exist
      var existAnswer = _.find(userAnswers, function(_ans) {
        return _ans.question_id === parseInt($currentQuestion.val());
      });
      if (!existAnswer) {
        userAnswers.push(
          {
            question_id: parseInt($currentQuestion.val()),
            answers_id:  parseInt($currentAnswer.val())
          }
        );
      } else {
        existAnswer.answers_id =  parseInt($currentAnswer.val())
      }
    }
  }

  //Set answer on localStorage
  localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
}

/* -------- START CLICK BUTTON --------*/
// Next question
$('#button-next-question').click(function () {
  if (currentQuestion < state.questions.length - 1) {
    emptyQuestionDOM();
    $('#question-detail-pr').empty();
    $('#progress-number-quiz').empty();
    currentQuestion = parseInt(currentQuestion) + 1;
    renderQuestion(state.questions[currentQuestion]);
    // responsiveImage();
    scrollByHash();
  }

  localStorage.setItem('currentQuestion', JSON.stringify(currentQuestion));

  // Get answer
  $('input[name=answer_id]').change(function () {
    getAnswer();
    checkedButtonBackground();
  })
});

// Prev question
$('#button-prev-question').click(function () {
  if (currentQuestion > 0) {
    emptyQuestionDOM();
    $('#question-detail-pr').empty();
    $('#progress-number-quiz').empty();
    currentQuestion = parseInt(currentQuestion) - 1;
    renderQuestion(state.questions[currentQuestion]);
    // responsiveImage();
    scrollByHash();
  }

  localStorage.setItem('currentQuestion', JSON.stringify(currentQuestion));

  // Get answer
  $('input[name=answer_id]').change(function () {
    getAnswer();
    checkedButtonBackground();
  })
});

// Finish question
$('#finish-quiz').click(function () {
  var body = {
    quizId: parseInt(contentId),
    total_time_spend: JSON.parse(localStorage.getItem('time')),
    questions: state.userAnswers
  };
  if (state.totalTimeSpend >= JSON.parse(localStorage.getItem('time'))) {
    body.total_time_spend = state.totalTimeContent;
  }

  var textConfirm = confirm('終了してもよろしいですか？');
  if (textConfirm === true) {
    getAnswer();
    state.submit = true;
    localStorage.setItem('isSubmit', state.submit);
    localStorage.setItem('withTimer', new URL(location.href).searchParams.get('with_timer'));

    uploadUserData(body);
  }
});

function uploadUserData(body) {
  var contractTermId = globalInfo("contract_term_id");
  var jwt = globalInfo('jwt_' + contractTermId);
  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + jwt,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(body),
    url: rootVariables.apiUrl + '/students/user_contents'
  };
  axios(options).then(function () {
    // Update link root here
    toLocationHref('/contents/tamatebako_drill_4?content_id=' + contentId + '&with_timer='+ withTimer);
  }).catch(function (error) {
    // handle error
    console.log('Error:', error);
  });
}
/* -------- END CLICK BUTTON --------*/

// Empty question DOM
function emptyQuestionDOM() {
  $('#question-detail-pr').empty();
  $('#answersUl').empty();
  $('#question-header').empty();
}

// Uncheck, disable button next, prev
function unCheckButton(_currentQuiz) {
  $('#btn-finish').css({"display": "flex", "justify-content": "flex-end"});
  $('#finish-quiz').css({"display": "block"});

  // Button DOM element
  var $buttonPrevQuestion = $('#button-prev-question');
  var $buttonNextQuestion = $('#button-next-question');
  if (_currentQuiz === 0) {
    $buttonPrevQuestion.addClass('btn-inactive');
    $buttonPrevQuestion.css({"cursor": "not-allowed"});
  } else {
    $buttonPrevQuestion.removeClass('btn-inactive');
    $buttonPrevQuestion.css({"display": "block", "pointer-events": "", "cursor": "pointer"});
  }
  if (_currentQuiz === state.questions.length - 1) {
    $buttonNextQuestion.addClass('btn-inactive');
    $buttonNextQuestion.css({"cursor": "not-allowed"});
  } else {
    $buttonNextQuestion.removeClass('btn-inactive');
    $buttonNextQuestion.css({"display": "block", "cursor": "pointer"});
  }
}

// Scroll to top question
function scrollByHash() {
  $('html, body').animate({
    scrollTop: (($('.drop-shadow-box').offset().top) - 80)
  }, 0);
}

// Fix responsive Image (Note: Function has commented but you can use when you need)
function responsiveImage(_media) {
  var divImg = $('.drop-shadow-box img');
  // If media query matches
  _.forEach(divImg, function (_img) {
    var __img = $(_img);
    _img.onload = function () {
      if (__img.width() <= 100) {
        __img.css('width', __img.width() / 1.5);
      } else if (100 < __img.width()) {
        __img.css('width', __img.width() / 1.5);
      }
    };
  });
}
