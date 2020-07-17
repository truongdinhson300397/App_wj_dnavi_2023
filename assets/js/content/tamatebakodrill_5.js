// * Render questions and explain answers * //

// Get questions from localStorage
var questions = JSON.parse(localStorage.getItem('questions'));

// Get resultQuestions from localStorage
var resultQuestions = JSON.parse(localStorage.getItem('resultQuestions'));

// Get userAnswers from localStorage
var userAnswers = JSON.parse(localStorage.getItem('userAnswers'));

// Get userAnswers from localStorage
var quizId = JSON.parse(localStorage.getItem('quizId'));

// Get contentTitle from localStorage
var contentTitle = localStorage.getItem('contentTitle');

// Render title content
$('#title_content').text(contentTitle);

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

// Question DOM element
var $quiz = $('#quiz');

renderQuestionsAndAnswers(questions, resultQuestions, userAnswers, $quiz);

// Render questions, answers and answers correct
function renderQuestionsAndAnswers (_questions, _resultQuestions, _userAnswers, _$quiz) {
  var output = [];
  var answers;

  // For each question...
  _questions.forEach(function(question, indexQuestion) {
    answers = [];
    var itemAnswers = question.answers[0];

    var keyAnswer = '';
    _.times(10, function (idx) {
      // Check correct answer from resultQuestions server
      if (itemAnswers['answer_' + (idx + 1)] != null && itemAnswers['answer_' + (idx + 1)] !== '') {
        // Check question large
        if (question.detail) {
          // return A B C
          switch((idx + 1)) {
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
        var answer = itemAnswers['answer_' + (idx + 1)];
        if (typeof isApplican !== "undefined" && isApplican) {
          answer = fixPathForContentPage(answer);
        }

        if ((idx + 1) === _resultQuestions[indexQuestion].correct_answer_id) {
          if (_userAnswers[indexQuestion].answers_id === -1) {
            answers.push(
              '<li class="contents-answer-ul-li correct" id="check'+ (indexQuestion+1) + '-' + (idx + 1) + '">' +
              '  <label class="label-default label-tamatebako-answer" style="cursor: default;">' +
              '  <input type="radio" name="question-id-' + (indexQuestion+1) + '" class="input-radio" value="' + (idx + 1) + '" disabled="disabled"/> ' +
              '   <span class="radio-span"></span>' +
              '   <span class="contents-answer-bx">' +
              keyAnswer +
              '    <span class="contents-answer-bx-td">' +
              answer +
              '    </span>' +
              '   </span>' +
              '  </label>' +
              '</li>'
            );
          }
          else {
            answers.push(
              '<li class="contents-answer-ul-li incorrect" id="check'+ (indexQuestion+1) + '-' + (idx + 1) + '">' +
              '  <label class="label-default label-tamatebako-answer" style="cursor: default;">' +
              '  <input type="radio" name="question-id-' + (indexQuestion+1) + '" class="input-radio" value="' + (idx + 1) + '" disabled="disabled"/> ' +
              '   <span class="radio-span bg-image-red"></span>' +
              '   <span class="contents-answer-bx">' +
              keyAnswer +
              '    <span class="contents-answer-bx-td">' +
              answer +
              '    </span>' +
              '   </span>' +
              '  </label>' +
              '</li>'
            );
          }
        }
        else {
          answers.push(
            '<li class="contents-answer-ul-li" id="check'+ (indexQuestion+1) + '-' + (idx + 1) + '">' +
            '  <label class="label-default label-tamatebako-answer" style="cursor: default;">' +
            '  <input type="radio" name="question-id-' + (indexQuestion+1) + '" class="input-radio" value="' + (idx + 1) + '" disabled="disabled"/> ' +
            '   <span class="radio-span"></span>' +
            '   <span class="contents-answer-bx">' +
            keyAnswer +
            '    <span class="contents-answer-bx-td">' +
            answer +
            '    </span>' +
            '   </span>' +
            '  </label>' +
            '</li>'
          );
        }
      }
    });

    // Add this question and its answers to the output
    var noAnswer  = '<div class="contents-answer-mi">未回答</div>';
    var detailQuestion = '';
    if (question.detail) {
      if (typeof isApplican !== "undefined" && isApplican) {
        question.detail = fixPathForContentPage(question.detail);
      }
      detailQuestion = '<div class="question-intro contents-question-txt txt-blue mgnb15-20" id="question-detail-pr">' + question.detail + '</div>';
    }

    // Render title and type question
    var checkTitleQuestion = '';
    var checkTypeQuestion = '';
    if (question.detail) {
      checkTitleQuestion = '問題1';
      checkTypeQuestion = '問' + (indexQuestion + 1);
    } else {
      checkTitleQuestion = '問題' + (indexQuestion + 1);
      checkTypeQuestion = '選択肢';
    }

    // Check question first remove mgnt30-50
    var checkQuestionFirst = '<div class="drop-shadow-box mgnt30-50" id="question-id">';
    if (indexQuestion === 0) {
      checkQuestionFirst = '<div class="drop-shadow-box" id="question-id">';
    }

    // Check question user noAnswer
    if (typeof isApplican !== "undefined" && isApplican) {
      question.content = fixPathForContentPage(question.content);
    }
    if (_userAnswers[indexQuestion].answers_id !== -1) {
      output.push(
        checkQuestionFirst +
        '   <span id="q' + (indexQuestion+1) + '" class="anchor"></span>\n' +
        '   <div class="contents-question-outer" id="question-header">\n' +
        '     <h4 class="contents-question-h4">'+ checkTitleQuestion +'</h4>\n' +
        '     <div class="contents-question-txt">\n' +
        question.title +
        '        <div class="contents-question-box">' +
        '           <div class="contents-question-box-spi" style="font-size: 14px; text-align: inherit;">' +
        question.content +
        '           </div>' +
        '         </div>\n' +
        '      </div>' +
        '   </div>\n' +
        '   <div class="contents-answer-outer">\n' +
        '     <h4 class="contents-answer-h4">' + checkTypeQuestion + '</h4>\n' +
        '     <div class="remove__image">' +
        detailQuestion +
        '     </div>' +
        '     <ul class="contents-answer-ul" id="answersUl">\n' +
        answers.join('') +
        '     </ul>\n' +
        '   </div>\n' +
        '   <div class="contents-explanation-outer" id="explain-question-' +
        question.question_id +
        '">' +
        question.description +
        '   </div>\n' +
        '</div>'
      );
    }
    else {
      output.push(
        checkQuestionFirst +
        '   <span id="q' + (indexQuestion+1) + '" class="anchor"></span>\n' +
        '   <div class="contents-question-outer" id="question-header">\n' +
        '     <h4 class="contents-question-h4">'+ checkTitleQuestion +'</h4>\n' +
        '     <div class="contents-question-txt">\n' +
        question.title +
        '        <div class="contents-question-box">' +
        '           <div class="contents-question-box-spi" style="font-size: 14px; text-align: inherit;">' +
        question.content +
        '           </div>' +
        '         </div>\n' +
        '      </div>' +
        '   </div>\n' +
        '   <div class="contents-answer-outer">\n' +
        '     <h4 class="contents-answer-h4"> ' + checkTypeQuestion + '</h4>\n' +
        '     <div class="remove__image">' +
        detailQuestion +
        '     </div>' +
        '     <ul class="contents-answer-ul" id="answersUl">\n' +
        answers.join('') +
        '     </ul>\n' +
        noAnswer +
        '   </div>\n' +
        '   <div class="contents-explanation-outer" id="explain-question-' +
        question.question_id +
        '">' +
        question.description +
        '   </div>\n' +
        '</div>'
      );
    }
  });

  // Render quiz
  _$quiz.append(output.join(''));
  renderCheckedAndIncorrect();
  $('.contents-answer-outer .remove__image img').remove();
  $('#answersUl span img').remove();
  customCSSForExplain();
  // responsiveImage();
  // Finish question
  $('#btn-back-drill_4').click(function () {
    toLocationHref(link.contentsTamatebako_drill_4 + '?content_id=' + quizId + '&with_timer='+ withTimer);
  });
}

// Render user answers checked and answers incorecct
function renderCheckedAndIncorrect() {
  userAnswers.forEach(function(userAnswer, indexQuestion) {
    // Render user answers checked
    $(('input[name ="question-id-' + (indexQuestion + 1) + '"][ value ="' + userAnswer.answers_id + '"]')).attr('checked', 'checked');

    // Render user answers incorrect
    if (userAnswer.answers_id !== resultQuestions[indexQuestion].correct_answer_id) {
      $('#check' + (indexQuestion + 1) + '-' + userAnswer.answers_id).addClass('correct');
    }
  });
}

// Custom CSS for explain
function customCSSForExplain () {
  questions.forEach(function(question) {
    $('#explain-question-' + question.question_id +' .q_box_answer').addClass('contents-explanation-h4');

    $('#explain-question-' + question.question_id +' .q_box_answer span').remove();
    var resultQuestionCSS = $('#explain-question-' + question.question_id +' .q_box_answer').text();

    var resultQuestionDOM = '<span class="contents-explanation-h4-answer">' + resultQuestionCSS + '</span>';
    $('#explain-question-' + question.question_id +' .q_box_answer').text('');

    var resultTitle = '答え';
    $('#explain-question-' + question.question_id +' .q_box_answer').append(resultTitle);
    $('#explain-question-' + question.question_id +' .q_box_answer').append(resultQuestionDOM);
  });
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
