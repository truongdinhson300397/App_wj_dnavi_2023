function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[#&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function renderHeader(forInterview) {
  forInterview = forInterview || false;
  var additionPath = forInterview ? "../" : "";
  var header;
  if (typeof isApplican !== "undefined" && isApplican) {
    var tempLink = getParameterByName('url');
    if (tempLink[tempLink.length - 1] !== '/') {
      tempLink += '/';
    }
    header = $(
        '<div class="content_inner">' +
        ' <p class="ranking_logo">' +
        '   <a href="index.html"><img src="' + tempLink + additionPath + 'shared/images/navititle2021.png" alt="ダイヤモンド就活ナビ2021"></a>' +
        ' </p>' +
        '</div>'
    );
  } else {
    header = $(
        '<div class="content_inner">' +
        ' <p class="ranking_logo">' +
        '   <a href="/2021"><img src="' + additionPath + 'shared/images/navititle2021.png" alt="ダイヤモンド就活ナビ2021"></a>' +
        ' </p>' +
        '</div>'
    );
  }
  $("#ranking_header").prepend(header);
}

function renderButton() {
  var button = $("<a href='javascript:void(0);' class='send_api_button'>（後期）ランキング調査に投票する</a>");
  $(".btn_vote").append(button);
}

function renderButtonVote() {
  var buttonVote = $(
    '<p class="send_api_button"> ' +
    ' <a href="javascript:void(0);"> ' +
    '   <img src="../common/images/btn_1.png" alt="人気企業ランキングに投票する" class="btn"/> ' +
    ' </a> ' +
    '</p>'
  );
  $("#vote").append(buttonVote);
}

$(function() {
  renderButton();
  renderButtonVote();
});
