var util = (function () {
  function indexToChar() {
    return {
      "0": "A",
      "1": "B",
      "2": "C",
      "3": "D",
      "4": "E"
    };
  }

  function setStorage(_key, _value) {
    _value = JSON.stringify(_value);
    localStorage.setItem(_key, _value);
  }

  function getStorage(_key) {
    return JSON.parse(localStorage.getItem(_key));
  }

  function getParentElement(_element, _attribute, _value) {
    return _element.parentElement.parentElement.setAttribute(_attribute.toString(), _value.toString());
  }

  function timeCounter(_eleSpentTime, _eleTotalTime, _elePercentTime, _totalTime, _callback) {
    var totalTimeSpent = util.getStorage('userTime');
    var percentTime = ((totalTimeSpent) / _totalTime) * 100;

    // Render data to HTML
    var minutesTotal = Math.floor(_totalTime / 60);
    var minutesTotalSpentTime = Math.floor(totalTimeSpent / 60 < 1 ? 0 : totalTimeSpent / 60);
    _eleTotalTime.html(minutesTotal);
    _eleSpentTime.html(minutesTotalSpentTime);
    _elePercentTime[0].style.width = percentTime + '%';

    if (_callback) {
      if (!totalTimeSpent) {
        totalTimeSpent = 0;
        _eleSpentTime.html(totalTimeSpent);
        _callback(totalTimeSpent, _totalTime, percentTime);
      } else if (totalTimeSpent < _totalTime) {
        _eleSpentTime.html(minutesTotalSpentTime);
        _callback(totalTimeSpent, _totalTime, percentTime);
      }
    }
  }

  function getQueryParam(_id) {
    _id = _id.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + _id + '=([^&#]*)');
    var results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // Handle image in content section
  function htmlImageHandler(_htmlString) {
    var result = '';
    var content = _htmlString.replace(/^\s+|\s+$/g, '');    // Remove space before and after HTML text string
    var selector_1 = content.search("<span id='pict'>");

    // Check if HTML string contain image
    if (selector_1 !== -1) {
      var head = content.slice(0, selector_1);
      var body = content.slice(selector_1, content.length);
      var selector_2 = body.search("<span class='fs24'>");
      var img = body.slice(0, selector_2);
      var foot = body.slice(selector_2, body.length);
      var selector_3 = img.search('<br>');

      img = img.replace('<img', '<img style="width: 100%"');

      if (selector_3 === -1) {
        result = head + img + '<br>' + foot;
      } else {
        result = head + img + foot;
      }

      return result;
    } else {
      return content;
    }
  }

  // Handle image in detail and answer section
  function htmlAnswerImagesHandler(_htmlDetailString, _htmlAnswerString) {
    var result = '';
    var selector = '';
    var selector_2 = '';

    // Remove icon image in each question's answer
    if (_htmlAnswerString) {
      result = _htmlAnswerString;
      selector = result.search('>');
      if (selector) {
        result = result.slice((selector + 1), _htmlAnswerString.length);
      }

      return result;
    }

    // Remove icon image in each question's detail
    if (_htmlDetailString) {
      result = _htmlDetailString;
      selector = result.search('<img');
      selector_2 = result.search('\'fl\'>');
      if (selector > -1) {
        result = result.slice(0, selector) + result.slice((selector_2 + 5), _htmlDetailString.length);
      }

      return result;
    }
  }

  // Handle HTML string in description section
  function htmlStringHandler(_htmlString) {
    var questionDescription = _htmlString;
    var element = document.createElement('div');
    var selector = questionDescription.search('\n');
    var answerKey = questionDescription.slice(0, selector); // Get description's answer key
    var explain = questionDescription.slice(selector, questionDescription.length);  // Get description
    // Remove line break before text
    explain = explain.replace(/^\s+|\s+$/g, '');  // Remove line break before text

    element.innerHTML = answerKey;

    // Switch inner text of child and grandchild element
    var childElement = element.firstChild;
    var grandChildElement = childElement.firstChild;
    var childText = childElement.innerText;
    var grandChildText = childText.slice(2, childText.length);

    childElement.innerText = childElement.innerText.slice(0, 2);
    childElement.appendChild(grandChildElement);
    grandChildElement.innerText = grandChildText;

    // Styling element
    childElement.setAttribute('class', 'contents-explanation-h4');
    grandChildElement.setAttribute('class', 'contents-explanation-h4-answer');

    // Convert HTML element back to string
    childElement = childElement.outerHTML;
    childElement = childElement.replace('<div', '<h4');
    childElement = childElement.replace('</div>', '</h4>');

    childElement += '\n' + explain;

    return childElement;
  }

  function clearStorage() {
    localStorage.removeItem('state');
    localStorage.removeItem('userTime');
    localStorage.removeItem('isSubmit');
  }

  return {
    "indexToChar": indexToChar,
    "setStorage": setStorage,
    "getStorage": getStorage,
    "getParentElement": getParentElement,
    "timeCounter": timeCounter,
    "getQueryParam": getQueryParam,
    "htmlImageHandler": htmlImageHandler,
    "htmlAnswerImagesHandler": htmlAnswerImagesHandler,
    "htmlStringHandler": htmlStringHandler,
    "clearStorage": clearStorage
  };
})();
