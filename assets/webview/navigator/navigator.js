document.addEventListener('deviceready', function () {
    function createElementFromHTML(htmlString) {
      var div = document.createElement('div');
      div.innerHTML = htmlString.trim();

      // Change this to div.childNodes to support multiple top-level nodes
      return div.firstChild;
    }

    var htmlString = '<div style="' +
                               'position: fixed;' +
                               'left: 10px;' +
                               'bottom: 10px;' +
                               'width: 32px;' +
                               'cursor: pointer;' +
                               'z-index: 999999;' +
                           '">' +
    '<img id="applicanGoBack" src="./webview/navigator/images/back-button.svg" />' +
    '</div>';

    var actionDiv = createElementFromHTML(htmlString);
    document.body.append(actionDiv);

    var forwardBtn = '<div style="' +
      'position: fixed;' +
      'right: 10px;' +
      'bottom: 10px;' +
      'width: 32px;' +
      'cursor: pointer;' +
      'z-index: 999999;' +
      'transform: rotate(180deg);' +
      '">' +
      '<img id="applicanGoForward" src="./webview/navigator/images/back-button.svg" />' +
      '</div>';

    var actionDivFw = createElementFromHTML(forwardBtn);
    document.body.append(actionDivFw);

    var closeBtn = '<div style="' +
      'position: fixed;' +
      'left: 50%;' +
      'bottom: 10px;' +
      'width: 32px;' +
      'cursor: pointer;' +
      'z-index: 999999;' +
      'transform: translateX(-50%);' +
      '">' +
      '<img id="applicanClose" src="./webview/navigator/images/back-close.svg" />' +
      '</div>';

    var actionDivClose = createElementFromHTML(closeBtn);
    document.body.append(actionDivClose);

   var backButton = document.getElementById('applicanGoBack');
   if (typeof applican !== 'undefined' && backButton) {
       backButton.addEventListener('click', function () {
           applican.webView.goBack();
       });
   }

  var forwardButton = document.getElementById('applicanGoForward');
  if (typeof applican !== 'undefined' && forwardButton) {
    forwardButton.addEventListener('click', function () {
      applican.webView.goForward();
    });
  }

  var closeButton = document.getElementById('applicanClose');
  if (typeof applican !== 'undefined' && closeButton) {
    closeButton.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
});
