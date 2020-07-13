/*Axios*/
var getQuizs = [];
var questions = [];
var currentQuizLocal = JSON.parse(localStorage.getItem('current_quiz'));

// count user check answer
var countCheckAnswers = [];
var countCheckAnswersLocal = JSON.parse(localStorage.getItem('count-answers'));
if (countCheckAnswersLocal) {
  countCheckAnswers = countCheckAnswersLocal;
}
var isSubmitLocal = localStorage.getItem('is_submit');
if (isSubmitLocal) {
  toLocationHref(link.contentsSpi);
}
// Quiz start from question 1
// var urlParams = new URLSearchParams(window.location.search);
//
// const queryQuizId = parseInt(urlParams.get('quizId'));

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null) {
    return null;
  } else {
    return decodeURI(results[1]) || 0;
  }
};
var queryQuizId = parseInt($.urlParam('quizId'));

var currentQuiz = 0;
if (currentQuizLocal) {
  currentQuiz = currentQuizLocal - 1;
}
var userAnswers = JSON.parse(localStorage.getItem('userAnswers'));

//Time spend
var timeOut = '';
var $timeStart = $('#time-start');
var $percentTime = $('#percent-time');
var percentTime = '';
var percentAnswers = '';
var state = {
  quiz_id: null,
  answers: [],
  userStartTime: null,
  userEndTime: 0,
  totalTimeSpend: 0
};

function fetchApi () {
  // Get question from query params quizId
  axios.get(rootVariables.apiUrl + '/questions/' + queryQuizId).then(function (response) {
    // handle success
    getQuizs = [response.data.data];
    isCheckQueryParams();
    localStorage.setItem('number_questions', questions.length);
    renderQuestion(questions[currentQuiz], onChange);
  }).then(function () {
    state.userStartTime = moment(new Date());
    timeSpend();
  }).catch(function (error) {
    // handle error
    throw error;
  });
}

function isCheckQueryParams () {
  var queryParams = window.location.search;
  if (queryParams) {
    var isQuestions = _.find(getQuizs, function (_quiz) {
      return _quiz.content_id === queryQuizId;
    });
    if (isQuestions) {
      questions = isQuestions.questions;
    } else {
      toLocationHref(link.contents);
    }
  } else {
    toLocationHref(link.contents);
  }
}

//Init firsts question
function renderQuestion (_question, _callback) {
  progressNumberOfQuiz();
  var dQuizNumber = currentQuiz + 1;

// Question DOM element
  var $questionHeader = $('#question-header');
  var $questionTitle = $('<h4 class="contents-question-h4">');
  var $questionContent = $('<div class="contents-question-txt">');

  $questionTitle.text('問題' + dQuizNumber);
  if (typeof isApplican !== "undefined" && isApplican) {
    _question.content = fixPathForContentPage(_question.content);
  }
  $questionContent.append(_question.content);
  if (_question.detail) {
    $questionContent.append(
      '<div class="contents-question-box">' + _question.detail + '</div>'
    );
  }
  $questionContent.append('<input type="hidden" name="question_id" value="' + _question.question_id + '"/>');
  $questionHeader.append($questionTitle);
  $questionHeader.append($questionContent);

  var $answersUi = $('#answersUl');
  var answers = _question.answers[0];
  _.times(8, function (_idx) {
    if (answers['answer_' + (_idx + 1)] != null && answers['answer_' + (_idx + 1)] !== '') {
      var _answer = answers['answer_' + (_idx + 1)];
      if (typeof isApplican !== "undefined" && isApplican) {
        _answer = fixPathForContentPage(_answer);
      }
      $answersUi.append(
        '<li class="contents-answer-ul-li" >' +
        '  <label class="label-default">' +
        '  <input type="radio" name="answer_id" class="input-radio" value="' + (_idx + 1) + '"/> ' +
        '<span class="radio-span"></span>' +
        _answer +
        '  </label>' +
        '</li>'
      );
    }
  });
  var $currentQuestion = $(('input[name ="question_id"]'));
  if (userAnswers) {
    if (userAnswers.length > 0) {
      var existAnswers = _.find(userAnswers, function (i) {
        return i.question_id === $currentQuestion.val();
      });
      if (existAnswers) {
        $(('input[value ="' + parseInt(existAnswers.answers_id) + '"]')).attr('checked', 'checked');
      }
    }
  }

  unCheckButton(currentQuiz);
  getAnswer();

  if (!_callback) {
    return false;
  } else {
    _callback();
  }

}

function onChange () {
  // Get answer
  $('input[name=answer_id]').change(function () {
    getAnswer();
  });

}

function goQuestion () {
  return function (to) {
    emptyQuestionDOM();
    $('#progress-number-quiz').empty();
    currentQuiz = parseInt(currentQuiz) + to;
    renderQuestion(questions[currentQuiz]);
    // Get answer
    $('input[name=answer_id]').change(function () {
      getAnswer();
    });
    scrollByHash();
    localStorage.setItem('current_quiz', currentQuiz);
  };
}

//Empty
function emptyQuestionDOM () {
  $('#answersUl').empty();
  $('#question-header').empty();
}

//Uncheck button next, prev
function unCheckButton (_currentQuiz) {
  // Clear all click listeners
  var $btnNext = $('#next'), goNext = 1;
  var $btnBack = $('#prev'), goPrev = -1;
  $btnNext.off('click');
  $btnBack.off('click');
  // Check whether needed activating button
  if (_currentQuiz === 0) {
    $btnNext.on('click', (goQuestion()).bind(this, goNext)).removeClass('btn-inactive');
    $btnBack.addClass('btn-inactive');
  } else if (_currentQuiz === (questions.length - 1)) {
    $btnNext.addClass('btn-inactive');
    $btnBack.on('click', (goQuestion()).bind(this, goPrev)).removeClass('btn-inactive');
  } else {
    $btnNext.on('click', (goQuestion()).bind(this, goNext)).removeClass('btn-inactive');

    $btnBack.on('click', (goQuestion()).bind(this, goPrev)).removeClass('btn-inactive');
  }
  responsiveImage();
}

//Number of quiz
function progressNumberOfQuiz () {
  //Init progress number answers
  var $progressNumberOfQuiz = $('#progress-number-quiz');
  var $numberQuiz = $('<span class="progress-ul-li-num-cnt">');
  var $totalQuiz = $('<span class="progress-ul-li-num-total">');

  $progressNumberOfQuiz.append($numberQuiz);
  $progressNumberOfQuiz.append($totalQuiz);
  $numberQuiz.text(countCheckAnswers.length);
  $totalQuiz.text(' / ' + questions.length + ' 問');

//  percent number answers
  var $percentNumberAnswers = $('#percent-number-answers');
  percentAnswers = (countCheckAnswers.length / questions.length) * 100;
  $percentNumberAnswers[0].style.width = percentAnswers + '%';

}

//Time spend
function timeSpend () {
  //get time start
  $timeStart.text(state.totalTimeSpend);

  //percent progress timestart / totaltime
  state.totalTimeSpend = JSON.parse(localStorage.getItem('time'));

  //Có thời gian bắt đầu
  if (state.totalTimeSpend) {
    $timeStart.text(Math.floor(state.totalTimeSpend / 60 ));
    calculatorOfTime(state.totalTimeSpend);
    $percentTime[0].style.width = percentTime + '%';
    timeOut = setInterval(function () {
      if (state.totalTimeSpend < 1800) {
        state.totalTimeSpend++;
        $timeStart.text(Math.floor(state.totalTimeSpend / 60 ));
        calculatorOfTime(state.totalTimeSpend);
        $percentTime[0].style.width = percentTime + '%';
      }
      if (state.totalTimeSpend >= 1800) {
        $timeStart.text('30');
        var body = {
          quizId: queryQuizId,
          total_time_spend: JSON.parse(localStorage.getItem('time')),
          questions: userAnswers
        };
        var isSubmit = true;
        localStorage.setItem('is_submit', isSubmit);
        uploadUserData(body);
        clearInterval(timeOut);
      }
      localStorage.setItem('time', state.totalTimeSpend);
    }, 1000);
  } else {
    //Run time begin
    timeOut = setInterval(function () {
      state.userEndTime = moment(new Date());
      state.totalTimeSpend = state.userEndTime.diff(state.userStartTime, 'seconds');
      localStorage.setItem('time', state.totalTimeSpend);
      $timeStart.text(Math.floor(state.totalTimeSpend / 60 ));
      calculatorOfTime(state.totalTimeSpend);
      $percentTime[0].style.width = percentTime + '%';
      if (state.totalTimeSpend >= 1800) {
        var body = {
          quizId: queryQuizId,
          total_time_spend: JSON.parse(localStorage.getItem('time')),
          questions: userAnswers
        };
        var isSubmit = true;
        localStorage.setItem('is_submit', isSubmit);
        uploadUserData(body);
        clearInterval(timeOut);
      }
    }, 1000);
  }
}

// // Quiz start from question 1
if (currentQuizLocal) {
  currentQuiz = currentQuizLocal;
}

//Calculator precent time
function calculatorOfTime (_totalTime) {
  percentTime = (_totalTime / 1800) * 100;
  return percentTime;
}

//
// Get answer when change check input of question_id
function getAnswer () {

  _.forEach(($(('input[name ="answer_id"]'))), function (item) {
    item.parentElement.parentElement.setAttribute('class', 'contents-answer-ul-li unchecked');
    if (item.checked) {
      item.parentElement.parentElement.setAttribute('class', 'contents-answer-ul-li checked');
    }
  });
  var $currentQuestion = $(('input[name ="question_id"]'));
  userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
  if (!userAnswers) {
    userAnswers = [];
    userAnswers.push(
      {
        question_id: $currentQuestion.val(),
        answers_id: '-1'
      }
    );
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
  } else {
    var $currentAnswer = $(('input[name ="answer_id"]:checked'));
    var existAnswer = _.find(userAnswers, function (_ans) {
      return _ans.question_id === $currentQuestion[0].value;
    });
    if (existAnswer) {
      for (var i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i].question_id === existAnswer.question_id) {
          if ($currentAnswer.val()) {
            userAnswers[i].answers_id = $currentAnswer.val();
          } else {
            userAnswers[i].answers_id = "-1";
          }
        }
      }
      countCheckAnswers = _.filter(userAnswers, function (x) {
        return x.answers_id !== undefined && x.answers_id !== '-1';
      });
      localStorage.setItem('count-answers', JSON.stringify(countCheckAnswers));
    } else {
      userAnswers.push(
        {
          question_id: $currentQuestion.val(),
          answers_id: '-1'
        }
      );
    }
  }
  localStorage.setItem('userAnswers', JSON.stringify(userAnswers));

}

// Finish question
$('#finishQuiz').on('click', function (e) {
  var body = {
    quizId: queryQuizId,
    total_time_spend: JSON.parse(localStorage.getItem('time')),
    questions: userAnswers
  };
  var r = confirm('終了してもよろしいですか？');
  if (r === true) {
    var isSubmit = true;
    localStorage.setItem('is_submit', isSubmit);
    uploadUserData(body);
    clearInterval(timeOut);
  }
});

function uploadUserData (body) {
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
    toLocationHref(link.contentsSpi_4 + '?quizId=' + queryQuizId);
  }).catch(function (error) {
    // handle error
    throw error;
  });
}

$(document).ready(function () {
  fetchApi();
  $('#time-total').text(30);
  scrollByHash();
});

function scrollByHash () {
  $('html, body').animate({
    scrollTop: (($('.drop-shadow-box').offset().top) - 80)
  }, 0);
}


function responsiveImage (_media) {
  var divImg = $('.drop-shadow-box img');
  // If media query matches
  _.forEach(divImg, function (_img) {
    var __img = $(_img);
    _img.onload = function () {
      setTimeout(function () {
        if (__img.width() <= 100) {
          __img.css('width', __img.width() / 1.5);
        } else if (100 < __img.width()) {
          __img.css('width', __img.width() / 1.5);
        }
      });
    };
  });
}
