// * Return result quiz tamatebakor * //

// Query param get content_id and with_timer
// var contentId = new URLSearchParams(window.location.search).get('content_id');
// var withTimer = new URLSearchParams(window.location.search).get('with_timer');
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

var resultQuestions = [];
var quizId = [];
function getResultQuestions() {
  // fetch data from a url endpoint
  axios.get(rootVariables.apiUrl + '/correct_answers/'+ contentId)
  .then(function (response) {
    resultQuestions = response.data.data.questions;
    quizId = response.data.data.quizId;

    // Get userAnswers from localStorage
    var userAnswers = JSON.parse(localStorage.getItem('userAnswers'));

    // Get withTimer from localStorage
    var withTimer = localStorage.getItem('withTimer');

    // Get contentTitle from localStorage
    var contentTitle = localStorage.getItem('contentTitle');
    // Render title content
    $('#title_content').text(contentTitle);

    // Save resultQuestions to localStorage
    localStorage.setItem('resultQuestions', JSON.stringify(resultQuestions));

    // Save quizId to localStorage
    localStorage.setItem('quizId', JSON.stringify(quizId));

    // Render result questions
    renderResultQuestions(resultQuestions, userAnswers);

    $('#re-quiz').click(function () {
      toLocationHref(link.contentsTamatebako_drill_3 + '?content_id=' + contentId + '&with_timer='+ withTimer);
      removeItemLocalStorage();
    });
  })
}

function removeItemLocalStorage () {
  localStorage.removeItem("resultQuestions");
  localStorage.removeItem("time");
  localStorage.removeItem("questions");
  localStorage.removeItem("isSubmit");
  localStorage.removeItem("quizId");
  localStorage.removeItem("userAnswers");
  localStorage.removeItem("contentId");
  localStorage.removeItem("withTimer");
  localStorage.removeItem("currentQuestion");
  localStorage.removeItem("contentTitle");
}

// Render result questions
function renderResultQuestions (_resultQuestions, _userAnswers) {
  var $numberCorrectAnswer = $('#number-correct-answer');
  var $totalQuestion = $('#total-question');
  var $resultUl = $('#result-ul');

  var coutCorrectAnswers = 0;

  _userAnswers.forEach(function(element, index) {
    if (element.answers_id === _resultQuestions[index].correct_answer_id) {
      coutCorrectAnswers++;
      $resultUl.append(
        '                <li class="contents-result-ul-li">' +
        '                  <div class="contents-result-num">' +
        (index+1) +
        '                   </div>' +
        '                  <div class="contents-result-mark">' +
        // Edit link here
        '                    <a href="' + link.contentsTamatebako_drill_5 + '?content_id=' + contentId + '&with_timer=' + withTimer +
        '#q' + (index + 1) + '" class="contents-result-a contents-result-a-correct"></a>' +
        '                  </div>' +
        '                </li>'
      );
    }
    else {
      $resultUl.append(
        '                <li class="contents-result-ul-li">' +
        '                  <div class="contents-result-num">' +
        (index+1) +
        '                   </div>' +
        '                  <div class="contents-result-mark">' +
        // Edit link here
        '                   <a href="' + link.contentsTamatebako_drill_5 + '?content_id=' + contentId + '&with_timer=' + withTimer +
        '#q' + (index + 1) + '" class="contents-result-a contents-result-a-incorrect"></a>' +
        '                  </div>' +
        '                </li>'
      );
    }
  });

  $numberCorrectAnswer.text(coutCorrectAnswers);
  $totalQuestion.text(_userAnswers.length);
}
