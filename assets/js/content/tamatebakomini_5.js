(function () {
  'use strict';

  // Declare variables
  var state = null;
  var questions = [];

  var $userQuestionResultList = $('.user-question-result-list');

  var classIncorrect = 'answer-list contents-answer-ul-li incorrect';
  var classCorrect = 'answer-list contents-answer-ul-li correct';

  // Get current state
  state = util.getStorage('state');

  $("#btnToResult").on("click", function (e) {
    e.preventDefault();
    var quizId = util.getQueryParam("quizId");
    // Update root link
    toLocationHref('/contents/tamatebako_test_4?quizId=' + quizId);

  });

  function renderExplainList(_callback) {
    var $containerBox = null;
    var problemText = '';
    var questionNumber = 1;
    var questionText = '';

    // Render each question and its answer
    questions.forEach(function (ele, i) {
      // Handle null questions
      if (!ele.detail) {
        ele.detail = '';
      } else {
        ele.detail = util.htmlAnswerImagesHandler(ele.detail);
      }

      var problemTextNumber = Math.floor((i + 4) / 4);

      if (i === 0) {
        // HTML string transform
        ele.content = util.htmlImageHandler(ele.content);
        // Render questions title
        problemText = '<h4 class="problem-number contents-question-h4">' + '問題' + 1 + '</h4>\n';
        questionText = '<h4 class="question-number contents-answer-h4">' + '問' + 1 + '</h4>\n';
        $userQuestionResultList.append(
            '<div id="container' + (i + 1) + '" class="drop-shadow-box">\n' +
            '<span id="q' + (i + 1) + '" class="anchor"></span>\n' +
            '<div class="contents-question-outer">\n' +
            problemText +
            '<div class="problem-title contents-question-txt">\n' + ele.title +
            '</div>\n' +
            '<div class="problem-content contents-question-box">\n' + ele.content +
            '</div>\n' +
            '</div>\n'
        );

        // Render questions detail
        $containerBox = $('#container' + (i + 1));
        $containerBox.append(
            '<div id="answer-container-' + (i + 1) + '" class="contents-answer-outer">\n' +
            questionText +
            '<div class="question-intro contents-question-txt txt-blue mgnb15-20">' + ele.detail +
            '</div>\n' +
            '<ul class="question-answer-list contents-answer-ul">\n'
        );

        // Get question's answers
        var answers = ele.answers[0];

        // Render answers for each question
        _.times(10, function (_index) {
          if (answers['answer_' + (_index + 1)]) {
            answers['answer_' + (_index + 1)] = util.htmlAnswerImagesHandler('', answers['answer_' + (_index + 1)]);
            $containerBox.append(
                '<li class="contents-answer-ul-li">\n' +
                '<label class="label-default label-tamatebako-answer" style="cursor: default">\n' +
                '<input type="radio" name="q' + (i + 1) + 'a" class="input-radio" disabled="disabled"/>\n' +
                '<span id=radio-' + (_index + 1) + '-' + (i + 1) + ' class="radio-span"></span>' +
                '<span class="contents-answer-bx">\n' +
                '<span class="contents-answer-bx-th">' + (util.indexToChar.apply()[_index]) + '</span>\n' +
                '<span class="contents-answer-bx-td">' + answers['answer_' + (_index + 1)] + '</span>\n' +
                '</span>\n' +
                '</label>\n' +
                '</li>\n'
            );
          }
        });

        // HTML string transform
        ele.description = util.htmlStringHandler(ele.description);

        // // Render question explanation
        $containerBox.append(
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div class="user-not-answer contents-answer-mi"></div>' +
            '<div class="contents-explanation-outer">\n' + ele.description +
            '</div>'
        );
      } else {
        // HTML string transform
        if (ele.content.length > 320) {
          problemText = '<h4 class="problem-number contents-question-h4">' + '問題' + (i + 1) + '</h4>\n';
          questionText = '<h4 class="question-number contents-answer-h4">' + '問' + questionNumber + '</h4>\n';
        } else {
          problemText = '<h4 class="problem-number contents-question-h4">' + '問題' + (i + 1) + '</h4>\n';
          questionText = '<h4 class="question-number contents-answer-h4">' + '問' + 1 + '</h4>\n'
        }
        ele.content = util.htmlImageHandler(ele.content);
        // Render question title
        $userQuestionResultList.append(
            '<div id="container' + (i + 1) + '" class="drop-shadow-box mgnt30-50">\n' +
            '<span id="q' + (i + 1) + '" class="anchor"></span>\n' +
            '<div class="contents-question-outer">\n' +
            problemText +
            '<div class="problem-title contents-question-txt">\n' + ele.title +
            '</div>\n' +
            '<div class="problem-content contents-question-box">\n' + ele.content +
            '</div>\n' +
            '</div>\n'
        );

        // Render questions detail
        $containerBox = $('#container' + (i + 1));
        $containerBox.append(
            '<div id="answer-container-' + (i + 1) + '" class="contents-answer-outer">\n' +
            questionText +
            '<div class="question-intro contents-question-txt txt-blue mgnb15-20">' + ele.detail +
            '</div>\n' +
            '<ul class="question-answer-list contents-answer-ul">\n'
        );

        answers = ele.answers[0];

        // Render answers for each question
        _.times(10, function (_index) {
          if (answers['answer_' + (_index + 1)]) {
            answers['answer_' + (_index + 1)] = util.htmlAnswerImagesHandler('', answers['answer_' + (_index + 1)]);
            $containerBox.append(
                '<li class="contents-answer-ul-li">\n' +
                '<label class="label-default label-tamatebako-answer" style="cursor: default">\n' +
                '<input type="radio" name="q' + (i + 1) + 'a" class="input-radio" disabled="disabled"/>\n' +
                '<span id=radio-' + (_index + 1) + '-' + (i + 1) + ' class="radio-span"></span>' +
                '<span class="contents-answer-bx">\n' +
                '<span class="contents-answer-bx-th">' + (util.indexToChar.apply()[_index]) + '</span>\n' +
                '<span class="contents-answer-bx-td">' + answers['answer_' + (_index + 1)] + '</span>\n' +
                '</span>\n' +
                '</label>\n' +
                '</li>\n'
            );
          }
        });

        // HTML string transform
        ele.description = util.htmlStringHandler(ele.description);

        // Render question explanation
        $containerBox.append(
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div class="user-not-answer contents-answer-mi"></div>' +
            '<div class="contents-explanation-outer">\n' + ele.description +
            '</div>'
        );
      }
      ++questionNumber;
      switch (true) {
        case (questionNumber > 4):
          questionNumber = 1;
          break;
        case  (questionNumber < 1):
          questionNumber = 4;
          break;
        default:
          break;
      }
    });

    if (_callback) {
      _callback();
    } else {
      return false;
    }
  }

  function checkAnswer() {
    var correctAnswerList = state.correctAnswers;
    var userAnswerList = state.userAnswers;

    userAnswerList.forEach(function (ele, index) {
      var element = $('input[type=radio][name=q' + (index + 1) + 'a]');
      var notice = $('.user-not-answer');
      var radio = null;

      if (element) {
        // Show correct answer for each question
        util.getParentElement(element[correctAnswerList[index] - 1], 'class', classCorrect);

        // Check correct answer and render CSS to HTML
        if (ele.answers_id !== -1 && ele.answers_id === correctAnswerList[index]) {
          element[(ele.answers_id - 1)].setAttribute('checked', 'checked');
          util.getParentElement(element[(ele.answers_id - 1)], 'class', classIncorrect);
        } else if (ele.answers_id !== -1) {
          radio = element[correctAnswerList[index] - 1].nextElementSibling;
          radio.setAttribute('class', 'radio-span bg-image-red');
          element[(ele.answers_id - 1)].setAttribute('checked', 'checked');
          util.getParentElement(element[(ele.answers_id - 1)], 'class', classCorrect);
          util.getParentElement(element[correctAnswerList[index] - 1], 'class', classIncorrect);
        } else {
          notice[index].innerHTML = '未回答';
        }
      }
    });
  }

  /*---------------------FUNCTION CALL----------------------------*/
  if (!state || !(util.getStorage('isSubmit')) || parseInt(util.getQueryParam('quizId')) !== state.quizId) {
    // Update root link
    toLocationHref('/contents/tamatebako_test');
  } else {
    questions = state.questionList;
    renderExplainList(checkAnswer);
  }
})();
