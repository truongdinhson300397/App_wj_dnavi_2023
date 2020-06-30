// * Get quiz tamatebakodrill from server  * //
var contractTermId = globalInfo('contract_term_id');
var quiz_language_category = [];
function getListQuiz() {
  // fetch data from a url endpoint
  axios.get(rootVariables.apiUrl + '/quiz/3?contract_term_id='+ contractTermId)
  .then(function(response) {
    quiz_language_category = response.data.data;
    generateQuizLanguageCategory(quiz_language_category);
    generateQuizNonLanguageCategory(quiz_language_category);
  })
}

// Generate insquiz_ide #list-quiz-language-category
function generateQuizLanguageCategory (_quiz_language_category) {
  var listQuizLanguageCategory = _quiz_language_category;
  var $listQuizLanguageCategory = $('#list-quiz-language-category');

  for (var i = 0; i < 3; i++) {
    $listQuizLanguageCategory.append(
      '<li class="contents-drill-ul-li">' +
      '<div class="contents-drill-ul-li-ttl">' +
      listQuizLanguageCategory[i].description +
      '（全' + listQuizLanguageCategory[i].questions.length + '問）' +
      '</div>' +
      '<div class="contents-drill-ul-li-btn">' +
      '<a href="/contents/tamatebako_drill_3?content_id='+ listQuizLanguageCategory[i].content_id +
      '&with_timer=true' +
      '" class="btn-small btn-blue btn-flex btn-first clear-local-storage">タイマーつき</a>' +
      '<a href="/contents/tamatebako_drill_3?content_id=' + listQuizLanguageCategory[i].content_id +
      '&with_timer=false" class="btn-small btn-green btn-flex clear-local-storage">タイマーなし</a>' +
      '</div>' +
      '</li>'
    );
  }
}

// Generate insquiz_ide #list-quiz-non-language-category
function generateQuizNonLanguageCategory (_quiz_non_language_category) {
  var listQuizNonLanguageCategory = _quiz_non_language_category;
  var $listQuizNonLanguageCategory = $('#list-quiz-non-language-category');

  for (var i = 3; i < 6; i++) {
    $listQuizNonLanguageCategory.append(
      '<li class="contents-drill-ul-li">' +
      '<div class="contents-drill-ul-li-ttl">' +
      listQuizNonLanguageCategory[i].description +
      '（大' + 1 + '問、小' +
      listQuizNonLanguageCategory[i].questions.length + '問）' +
      '</div>' +
      '<div class="contents-drill-ul-li-btn">' +
      '<a href="/contents/tamatebako_drill_3?content_id='+ listQuizNonLanguageCategory[i].content_id +
      '&with_timer=true' +
      '" class="btn-small btn-blue btn-flex btn-first clear-local-storage">タイマーつき</a>' +
      '<a href="/contents/tamatebako_drill_3?content_id=' + listQuizNonLanguageCategory[i].content_id +
      '&with_timer=false" class="btn-small btn-green btn-flex clear-local-storage">タイマーなし</a>' +
      '</div>' +
      '</li>'
    );
  }
}
