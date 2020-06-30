var userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
// var questions = JSON.parse(localStorage.getItem('questions'));
var totalTimeSpend = JSON.parse(localStorage.getItem('time'));
var numberCorrect = 0;
var questions = [];
// const getQuizId = (new URLSearchParams(window.location.search)).get('quizId');
$.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null){
    return null;
  }
  else {
    return decodeURI(results[1]) || 0;
  }
};
var getQuizId = $.urlParam('quizId');


/*Axios*/
function fetchApi () {
  // Get question from query params quizId
  axios.get(rootVariables.apiUrl + '/correct_answers/' + getQuizId).then(function (response) {
    // handle success
    getQuizs = [response.data.data];
    questions = getQuizs[0].questions;
    initAnswers();
  }).catch(function (error) {
    // handle error
    console.log('khong lay dc data', error);
  });
}

/*Content Answers*/
function initAnswers () {
  pregressBarOfTimeEnd();
  calculatorOfTimeEnd();
  resultAnswers();
  conrectResult();
}

/*Progress bar answers*/
function pregressBarOfTimeEnd () {
  var $progressBarNumber = $('#progress-bar-number');
  if (totalTimeSpend >= 1800) {
    return $progressBarNumber.text('30');
  }
  $progressBarNumber.text(Math.floor(totalTimeSpend / 60 <= 1 ? 1 : (totalTimeSpend / 60)));

}

function calculatorOfTimeEnd () {
  var percent = (totalTimeSpend / 1800) * 100;
  var $percentQuizTime = $('#progress-bar-percent-quiz-time');
  $percentQuizTime[0].style.width = percent + '%';
}

function resultAnswers () {
  var $answerResult = $('#answer-result');

  _.forEach(questions, function (_question, _idx) {
    $answerResult.append(
      '<li class="contents-result-ul-li">'
      + '<div class="contents-result-num">' + (_idx + 1) + '</div>'
      + '<div class="contents-result-mark">'
      + '<a href="/contents/spi_5?quizId=' + getQuizId + '#q' + (_idx + 1) + '" class="contents-result-a" id="styleCorrect' + (_idx + 1) + '"></a>'
      + '</div>'
      + '</li>'
    );
  });
}

function conrectResult () {
  var numberCorrect = 0;

  for (var i = 0; i < questions.length; i++) {
    var styleCorrect = document.getElementById('styleCorrect' + (i + 1));
    if (userAnswers) {
      if (userAnswers[i] === undefined) {
        styleCorrect.classList.add('contents-result-a-incorrect');
      } else if (parseInt(userAnswers[i].answers_id) === questions[i].correct_answer_id) {
        styleCorrect.classList.add('contents-result-a-correct');
        numberCorrect++;
      } else {
        styleCorrect.classList.add('contents-result-a-incorrect');
      }
    } else {
      styleCorrect.classList.add('contents-result-a-incorrect');
    }
    correctAnswer(numberCorrect);
    calculatorPercentCorrect(numberCorrect);

  }

}

function correctAnswer (_numberCorrect) {
  var $correctTotalNumber = $('#result-correct-total-number');
  var $correctNumber = $('#result-correct-number');
  $correctTotalNumber.text(questions.length);
  if (!userAnswers) {
    $correctNumber.text('0');
  } else {
    $correctNumber.text(_numberCorrect);
  }
}

function calculatorPercentCorrect (_numberCorrect) {
  var $resultCorrectPercen = $('#result-correct-percent');
  var percent = (Math.round(_numberCorrect / questions.length * 100));
  $resultCorrectPercen.text(parseInt(percent));
}

$(document).ready(function () {
  fetchApi();
});
