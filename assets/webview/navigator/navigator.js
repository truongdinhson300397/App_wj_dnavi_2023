'use strict';
function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

var htmlString = '<div style="' +
                           'position: fixed;' +
                           'right: 10px;' +
                           'bottom: 10px;' +
                           'width: 32px;' +
                           'cursor: pointer;' +
                           'z-index: 999;' +
                       '">' +
'<img id="applicanGoBack" src="./webview/navigator/images/back-button.svg" />' +
'</div>';

var actionDiv = createElementFromHTML(htmlString);
document.body.append(actionDiv);

document.addEventListener('deviceready', function () {
   var backButton = document.getElementById('applicanGoBack');
   if (typeof applican !== 'undefined' && backButton) {
       backButton.addEventListener('click', function () {
           applican.webView.goBack();
       });
   }
});
