var userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
const numberQuestions = localStorage.getItem('number_questions');
// const getQuizId = (new URLSearchParams(window.location.search)).get('quizId');
$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null) {
    return null;
  } else {
    return decodeURI(results[1]) || 0;
  }
};
var getQuizId = $.urlParam('quizId');

var nameHash = location.hash;
//Your new hash name without "#"
var newHashName = nameHash.replace('#', '');
$(document).ready(function () {
  fetchSpanById();

  $('#__btn-back').append(
    '<a href="' + link.contentsSpi_4 + '?quizId=' + getQuizId + '" class="btn-default btn-blue w100-50prc"><span class="spn-arr-l"></span>回答結果に戻る</a>'
  );
});

function fetchSpanById() {
  fetchApi();
}

//Get all quizs
function getQuestions () {
  return axios.get(rootVariables.apiUrl + '/questions/' + getQuizId);
}

function getCorrectAnswers () {
  return axios.get(rootVariables.apiUrl + '/correct_answers/' + getQuizId);
}

function fetchApi() {
  axios.all([getQuestions(), getCorrectAnswers()]).then(axios.spread(function (_quizs, _correct) {
    const questions = _quizs.data.data.questions;
    const _correctAns = _correct.data.data.questions;
    initContent(questions, _correctAns);
  })).then(function () {
    responsiveImage();
  }).catch(function (error) {
    console.log(error);
  });
}

function scrollByHash() {
  $('html, body').animate({
    scrollTop: (($('#' + newHashName).offset().top) - 100)
  }, 0);
}

function initContent(_questions, _correct) {
  renderQuestion(_questions, _correct);
  scrollByHash();
}

function renderQuestion(_questions, _corrects) {
  var $quizExplaination = $('#quiz-explaination');

  _.forEach(_questions, function (_question, _idx) {
    var margin = '';
    if (_idx > 0) {
      margin = 'mgnt30-50';
    }
    var $contentWrapper = $('<div class="drop-shadow-box ' + margin + '">');
    $contentWrapper.append('<span id="q' + (_idx + 1) + '" class="anchor"></span>');

    var $qDetail = '';
    if (_question.detail !== null && _question.detail !== '') {
      $qDetail = '<div class="contents-question-box">' + _question.detail + '</div>';
    }
    // Render question
    $contentWrapper.append(
        '<div class="contents-question-outer">' +
        '  <h4 class="contents-question-h4">問題' + (_idx + 1) + '</h4>' +
        '  <div class="contents-question-txt">' +
        _question.content +
        $qDetail +
        '  </div>' +
        '</div>'
    );

    // Render answer
    var $answerWrapper = $('<div class="contents-answer-outer">');
    $answerWrapper.append('<h4 class="contents-answer-h4">選択肢</h4>');

    var $aDetailWrapper = $('<ul class="contents-answer-ul">');
    var __answers = _question.answers[0];

    var $notAnswer = '';
    _.times(8, function (_aIdx) {
      var currentAnswer = __answers['answer_' + (_aIdx + 1)];
      if (currentAnswer !== null && currentAnswer !== '') {
        var userSelection = _.find(userAnswers, function (_uAns) {
          return parseInt(_uAns.question_id) === parseInt(_question.question_id);
        });
        var $input = '<input type="radio" class="input-radio" disabled="disabled">';

        var corectClass = '';
        var isCorrect = _.find(_corrects, function (_aC) {
          return parseInt(_question.question_id) === parseInt(_aC.question_id);
        });

        if (userSelection !== undefined && userSelection.answers_id !== '-1' && userSelection.answers_id !== undefined) {
          if (isCorrect !== undefined && parseInt(isCorrect.correct_answer_id) === (_aIdx + 1)) {
            corectClass = 'incorrect';
          }
          // User co tra loi
          if (userSelection.answers_id && parseInt(userSelection.answers_id) > 0 && parseInt(userSelection.answers_id) === (_aIdx + 1)) {
            $input = '<input type="radio" class="input-radio" disabled="disabled" checked="checked">';

            if (!(parseInt(userSelection.answers_id) === isCorrect.correct_answer_id)) {
              corectClass = 'correct';
            }
          }

          if (userSelection.answers_id === undefined || parseInt(userSelection.answers_id) < 0) {
            $notAnswer = $('<div class="contents-answer-mi">未回答</div>');
          }
        } else {
          if (isCorrect !== undefined && parseInt(isCorrect.correct_answer_id) === (_aIdx + 1)) {
            corectClass = 'correct';
          }

          $notAnswer = $('<div class="contents-answer-mi">未回答</div>');
        }
        $aDetailWrapper.append(
            '<li class="contents-answer-ul-li ' + corectClass + '"><label class="label-default">' +
            $input +
            '  <span class="radio-span"></span>' + currentAnswer +
            '  </label>' +
            '</li>'
        );
      }
    });

    var isCorrect = _.find(_corrects, function (_aC) {
      return parseInt(_question.question_id) === parseInt(_aC.question_id);
    });
    var textAnswerCorrect = __answers['answer_' + (isCorrect.correct_answer_id)];
    var $questionExplain = $(
        '<div class="contents-explanation-outer"><h4 class="contents-explanation-h4">答え<span class="contents-explanation-h4-answer">' + textAnswerCorrect + '</span></h4>');
    $questionExplain.append(_question.description);

    $quizExplaination.append($contentWrapper);
    $answerWrapper.append($aDetailWrapper);
    $contentWrapper.append($answerWrapper);
    $contentWrapper.append($notAnswer);
    $contentWrapper.append($questionExplain);
    $quizExplaination.append($contentWrapper);
  });
}
function responsiveImage (_media) {
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
