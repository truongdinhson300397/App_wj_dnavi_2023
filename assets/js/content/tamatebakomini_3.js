(function () {
  'use strict';

  // Declare variables
  var URL = rootVariables.apiUrl + '/questions/';
  var quizId = util.getQueryParam('quizId');

  var classUnChecked = 'answer-list contents-answer-ul-li';
  var classChecked = 'answer-list contents-answer-ul-li checked';

  var $problemNumber = $('.problem-number');
  var $problemTitle = $('.problem-title');
  var $problemContent = $('.problem-content');

  var $questionNum = $('.question-number');
  var $questionIntro = $('.question-intro');
  var $questionAnswer = $('.question-answer-list');

  var $totalUserTime = $('.total-user-time');
  var $currentUserTime = $('.current-user-time');
  var $currentTimePercent = $('.current-time-counter');

  var $totalNumberQuestions = $('.total-number-question');
  var $currentNumberAnswer = $('.current-number-answer');
  var $currentAnswerPercent = $('.current-answer-counter');

  var data = [];
  var totalQuestions = 0;
  var currentQuestion = 0;
  var currentSmallQuestion = 1;
  var numberOfAnsweredQuestion = 0;
  var selectedAnswers = [];
  var userAnswers = [];
  var isSubmit = false;

  var userCurrentTime = null;
  var userEndTime = null;
  var totalTime = 1800;
  var interval = null;

  var state = {
    quizId: null,
    questionList: [],
    selectedAnswers: selectedAnswers,
    userTimeSpent: null,
    userStoppedTime: 0,
    userCurrentTime: userCurrentTime,
    currentQuestion: currentQuestion,
    currentSmallQuestion: currentSmallQuestion,
    currentTextQuestion: 0,
    currentMathQuestion: 0,
    totalQuestions: totalQuestions,
    userAnswers: userAnswers,
    correctAnswers: [],
    correctAnswersNum: 0
  };

  /*---------------------COUNTER----------------------------*/

  // Calculate current answered questions
  function answerCount() {
    var count = 0;
    var answerPercent = 0;

    selectedAnswers.forEach(function (ele) {
      Object.values(ele).forEach(function (val) {
        if (val !== 'false') {
          ++count;
        }
      });
    });

    answerPercent = (count / totalQuestions) * 100;
    numberOfAnsweredQuestion = count;

    $currentNumberAnswer.html(numberOfAnsweredQuestion);
    $totalNumberQuestions.html(totalQuestions);
    $currentAnswerPercent[0].style.width = answerPercent + '%';
  }

  // Calculate user's time
  function timeCount() {
    util.timeCounter($currentUserTime, $totalUserTime, $currentTimePercent, totalTime, startTimeCounter);
  }

  // Sync the user's current time
  function startTimeCounter(_currentTime, _totalTime, _percentTime) {
    util.setStorage('userTime', _currentTime);
    interval = setInterval(function () {
      // Check if user stop time counter using alert
      var stoppedTime = util.getStorage('state').userStoppedTime;
      userEndTime = moment();
      _currentTime += stoppedTime;

      // Check current time from local storage
      if (!_currentTime) {
        _currentTime = moment(userEndTime).diff(userCurrentTime, 'seconds');
      } else if (_currentTime > _totalTime) {
        _currentTime = _totalTime;
      } else {
        _currentTime++;
      }

      state.userStoppedTime = 0;
      state.userTimeSpent = Math.floor((_currentTime / 60) <= 1 ? 1 : (_currentTime / 60));
      state.userCurrentTime = userCurrentTime;
      util.setStorage('state', state);
      util.setStorage('userTime', _currentTime);
      util.timeCounter($currentUserTime, $totalUserTime, $currentTimePercent, totalTime);

      if (_currentTime >= _totalTime) {
        var body = {
          quizId: parseInt(quizId),
          total_time_spend: util.getStorage('userTime'),
          questions: userAnswers
        };

        util.setStorage("isSubmit", true);
        uploadUserData(body);
        clearInterval(interval);
      }
    }, 1000);
  }

  /*---------------------PROBLEM HANDLE----------------------------*/

  // Load questions list from server
  function fetchApi() {
    var contractTermId = globalInfo("contract_term_id");
    var can_do_quiz = null;
    var jwt = globalInfo('jwt_' + contractTermId);
    const options = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + jwt,
        contentType: 'application/json',
        accept: 'application/json'
      },
      url: URL + quizId,
    };

    axios(options).then(function (resp) {
      can_do_quiz = resp.data.data.can_do;
      if (!can_do_quiz || can_do_quiz === 0) {
        toLocationHref(link.contentsTamatebako_test);
      } else {
        userCurrentTime = moment();
        data = resp.data.data.questions;
        state.questionList = data;
        totalQuestions = data.length;
        renderQuestion();
        timeCount();
      }
    });
  }

  // Render answers list
  function renderQuestion() {
    /* Initialize default answers for all questions
     *  Or load current answers from local storage
     */
    if (!util.getStorage('state')) {
      data.forEach(function (ele, i) {
        var key = 'q' + (i + 1) + 'a';
        var rec = {};
        rec[key] = 'false';
        selectedAnswers.push(rec);
        userAnswers.push(
          {
            question_id: data[i].question_id,
            answers_id: -1
          }
        );
      });
    } else {
      state = util.getStorage('state');
      selectedAnswers = state.selectedAnswers;
      userAnswers = state.userAnswers;
      currentQuestion = state.currentQuestion;
      currentSmallQuestion = state.currentSmallQuestion;
    }

    // Clear all click listener before re-render
    var $nextBtn = $('.next-button'), nextQues = 1;
    var $prevBtn = $('.back-button'), prevQues = -1;
    $nextBtn.off('click');
    $prevBtn.off('click');

    // Check can navigate back or next
    if (currentQuestion === 0) {
      state.currentQuestion = currentQuestion;
      util.setStorage('state', state);

      $nextBtn.on('click', (goQuestion()).bind(this, nextQues)).removeClass('btn-inactive');

      $prevBtn.addClass('btn-inactive');

    } else if (currentQuestion === data.length - 1) {
      $nextBtn.addClass('btn-inactive');

      $prevBtn.on('click', (goQuestion()).bind(this, prevQues)).removeClass('btn-inactive');

    } else {
      state.currentQuestion = currentQuestion;
      util.setStorage('state', state);

      $nextBtn.on('click', (goQuestion()).bind(this, nextQues)).removeClass('btn-inactive');

      $prevBtn.on('click', (goQuestion()).bind(this, prevQues)).removeClass('btn-inactive');
    }

    // Update state
    state.quizId = parseInt(quizId);
    state.currentQuestion = currentQuestion;
    state.totalQuestions = totalQuestions;

    /* Render Problem
     * Problem title
     * Problem content
     */
    var currentTextQuestion = (currentQuestion + 4) / 4;    // 1 problem contain 4 questions
    // Check if question is a paragraph question
    if (data[currentQuestion].content.length > 320) {
      currentTextQuestion = Math.floor(currentTextQuestion);
      $problemNumber.html('問題 ' + (currentQuestion + 1));
      $questionNum.html('問 ' + currentSmallQuestion);
      state.currentMathQuestion = 0;
    } else {  // Check if question is a math question
      var toCompare = currentTextQuestion;
      var currentMathQuestion = currentTextQuestion;

      if (util.getStorage('state').currentTextQuestion) {
        toCompare = state.currentTextQuestion;
      }
      if (util.getStorage('state').currentMathQuestion) {
        currentMathQuestion = state.currentMathQuestion;
      }
      // Increase/Decrease the number of math question
      if (currentTextQuestion > toCompare) {
        ++currentMathQuestion;
      } else if (currentTextQuestion < toCompare) {
        --currentMathQuestion;
      }

      $problemNumber.html('問題 ' + (currentQuestion + 1));
      $questionNum.html('問 ' + 1);
      state.currentTextQuestion = currentTextQuestion;
      state.currentMathQuestion = Math.floor(currentMathQuestion);
    }
    $problemTitle.html(data[currentQuestion].title);
    data[currentQuestion].content = util.htmlImageHandler(data[currentQuestion].content);   // Separate image and question content
    $problemContent.html(data[currentQuestion].content);

    /* Render Question
     * Question detail
     */
    data[currentQuestion].detail = util.htmlAnswerImagesHandler(data[currentQuestion].detail); // Remove image in question detail
    $questionIntro.html(data[currentQuestion].detail);

    /* Render answer */
    _.times(10, function (_index) {
      var answers = data[currentQuestion].answers[0];
      var currentAnswered = Object.values(selectedAnswers[currentQuestion])[0];

      if (answers['answer_' + (_index + 1)]) {
        if (answers['answer_' + (_index + 1)] === currentAnswered) {
          answers['answer_' + (_index + 1)] = util.htmlAnswerImagesHandler('', answers['answer_' + (_index + 1)]);
          $questionAnswer.append(
              '<li class="answer-list contents-answer-ul-li checked">' +
              '<label class="label-default label-tamatebako-answer">' +
              '<input value="' + answers['answer_' + (_index + 1)] + '" type="radio"  checked="checked"' +
              ' name="q' + (currentQuestion + 1) + 'a" class="input-radio"/>' +
              '<span class="radio-span"></span>' +
              '<span class="contents-answer-bx">' +
              '<span class="contents-answer-bx-th">' + util.indexToChar.apply()[_index] + '</span>' +
              '<span class="contents-answer-bx-td">' + answers['answer_' + (_index + 1)] + '</span>' +
              '</span>' +
              '</label>' +
              '</li>'
          );
        } else {
          answers['answer_' + (_index + 1)] = util.htmlAnswerImagesHandler('', answers['answer_' + (_index + 1)]);
          $questionAnswer.append(
              '<li class="answer-list contents-answer-ul-li">' +
              '<label class="label-default label-tamatebako-answer">' +
              '<input value="' + answers['answer_' + (_index + 1)] + '" type="radio" name="q' + (currentQuestion + 1) + 'a" class="input-radio"/>' +
              '<span class="radio-span"></span>' +
              '<span class="contents-answer-bx">' +
              '<span class="contents-answer-bx-th">' + util.indexToChar.apply()[_index] + '</span>' +
              '<span class="contents-answer-bx-td">' + answers['answer_' + (_index + 1)] + '</span>' +
              '</span>' +
              '</label>' +
              '</li>'
          );
        }
      }
    });

    recordAnswer(answerCount);
    checkAnswer(answerCount);
    answerCount();

    util.setStorage('state', state);
  }

  // To question
  function goQuestion() {
    return function (to) {
      $('.answer-list').remove();
      currentSmallQuestion += to;
      switch (true) {
        case (currentSmallQuestion > 4):
          currentSmallQuestion = 1;
          break;
        case (currentSmallQuestion < 1):
          currentSmallQuestion = 4;
          break;
        default:
          break;
      }
      currentQuestion = currentQuestion + to;
      state.currentQuestion = currentQuestion;
      state.currentSmallQuestion = currentSmallQuestion;
      util.setStorage('state', state);
      renderQuestion();
      scrollByHash();
    };
  }

  // Get answer from each question
  function recordAnswer(_callback) {
    var $input = $('input[type=radio]');

    // Get answer value
    $input.change(function () {
      _callback();

      var radios = document.getElementsByTagName('input');

      for (var i = 0; i < radios.length; ++i) {
        util.getParentElement(radios[i], 'class', classUnChecked);
        if (radios[i].checked) {
          util.getParentElement(radios[i], 'class', classChecked);
          selectedAnswers.forEach(function (ele, index) {
            Object.keys(ele).forEach(function (key) {
              if (radios[i].name === key) {
                selectedAnswers[index] = {};
                selectedAnswers[index][key] = radios[i].value
              }
            });
          });
        }
      }
      util.setStorage('state', state);
    });
    util.setStorage('state', state);
  }

  // Check correct answer
  function checkAnswer(_callback) {
    var answerList = [];

    if (!_callback) {
      return false;
    }
    _callback();

    // Convert answers object to array
    data.forEach(function (item) {
      var answers = item.answers[0];
      answerList.push(answers);
    });

    // Find index of user's answer in the answer list
    answerList.forEach(function (value, index) {
      var pos = Object.values(value).findIndex(function (item) {
        return item === Object.values(selectedAnswers[index])[0];
      });

      if (pos > -1) {
        userAnswers[index].answers_id = pos;
      }
    });

    state.userAnswers = userAnswers;
    util.setStorage('state', state);
  }

  /*---------------------FUNCTION CALL----------------------------*/
  // Check if quiz is submitted
  isSubmit = util.getStorage('isSubmit');
  scrollByHash();

  if (!util.getQueryParam('quizId') || isSubmit) {
    toLocationHref(link.contentsTamatebako_test);
  } else {
    fetchApi();
  }

  // Scroll top for each question
  function scrollByHash() {
    $('html, body').animate({
      scrollTop: (($('.drop-shadow-box').offset().top) - 80)
    }, 0);
  }

  // Post user's answer to server
  function uploadUserData(body) {
    var contractTermId = globalInfo("contract_term_id");
    var jwt = globalInfo('jwt_' + contractTermId);
    var url = rootVariables.apiUrl + '/students/user_contents';
    const options = {
      headers: {
        'Authorization': 'Bearer ' + jwt,
        'Content-Type': 'application/json'
      },
    };

    axios.post(url, body, options).then(function () {
      // Update link root here PLEASEEEEEEEEEEEEEEEEEEEEE
      toLocationHref(link.contentsTamatebako_test_4 + '?quizId=' + quizId);
    }).catch(function (error) {
      throw error;
    })
  }

  // Finish question
  $('.finishQuiz').click(function () {
    var userAnswers = util.getStorage('state').userAnswers;
    var body = {
      quizId: parseInt(quizId),
      total_time_spend: util.getStorage('state').userTimeSpent,
      questions: userAnswers
    };
    var isConfirm = confirm('終了してもよろしいですか？');

    if (isConfirm === true) {
      clearInterval(interval);
      util.setStorage("isSubmit", true);
      checkAnswer(answerCount);
      uploadUserData(body);
    } else {
      userCurrentTime = moment();
      state.userStoppedTime = moment(userCurrentTime).diff(userEndTime, 'seconds');
      util.setStorage('state', state);
    }
  })
})();
