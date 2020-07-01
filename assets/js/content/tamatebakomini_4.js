(function () {
    'use strict';

    // Declare variables
    var state = null;
    var data = null;

    var $userTimeSpent = $('.user-time-spent');
    var $userTotalTime = $('.user-total-time');
    var $userTimePercent = $('.user-time-spent-percent');

    var $userCorrectAnswers = $('.user-number-of-correct-answers');
    var $userTotalQuestions = $('.user-total-number-of-questions');

    var $userResultList = $('.user-result-list');

  // Get current state
  state = util.getStorage('state');
  util.setStorage('isSubmit', true);

  // Get total time spent by user
  function totalTimeCounter() {
    util.timeCounter($userTimeSpent, $userTotalTime, $userTimePercent, 1800);
    $userTimeSpent.html(state.userTimeSpent);
  }

    // Get total number of correct answers of user
    function totalAnswerCounter() {
        var totalQuestions = state.totalQuestions;
        var correctAnswers = state.correctAnswersNum;

        $userCorrectAnswers.html(correctAnswers);
        $userTotalQuestions.html(totalQuestions);
    }

    // Render result-list
    function renderResultList(_callback) {
        var quizId = state.quizId;
        var userAnswerList = state.userAnswers;
        var correctAnswerList = [];
        var numberOfCorrectAnswers = 0;
        data = state.questionList;

        data.forEach(function (ele) {
            correctAnswerList.push(ele.correct);
        });
        state.correctAnswers = correctAnswerList;

    userAnswerList.forEach(function (ele, index) {
      if (ele.answers_id === correctAnswerList[index]) {
        $userResultList.append(
            '<li class="contents-result-ul-li">' +
            '<div class="contents-result-num">' + (index + 1) + '</div>' +
            '<div class="contents-result-mark">' +
            '<a href="' + link.contentsTamatebako_test_5 + '?quizId=' + quizId + '#q' + (index + 1) + '"' +
            ' class="contents-result-a contents-result-a-correct">' +
            '</a>' +
            '</div>' +
            '</li>'
        );
        ++numberOfCorrectAnswers;
        state.correctAnswersNum = numberOfCorrectAnswers;
      } else {
        $userResultList.append(
            '<li class="contents-result-ul-li">' +
            '<div class="contents-result-num">' + (index + 1) + '</div>' +
            '<div class="contents-result-mark">' +
            '<a href="' + link.contentsTamatebako_test_5 + '?quizId=' + quizId + '#q' + (index + 1) + '"' +
            ' class="contents-result-a contents-result-a-incorrect">' +
            '</a>' +
            '</div>' +
            '</li>'
        );
      }
    });

        if (!_callback) {
            return false
        }
        _callback();

        // Update state
        util.setStorage('state', state);
    }

    /*---------------------FUNCTION CALL----------------------------*/
    if (!state || parseInt(util.getQueryParam('quizId')) !== state.quizId) {
        toLocationHref(link.contentsTamatebako_test);
    } else {
        totalTimeCounter();
        renderResultList(totalAnswerCounter);
    }
})();
