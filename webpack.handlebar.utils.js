'use strict';
const webData = require('./env/web.json');
const applicanData = require('./env/applican.json');
const handlebarsLayouts = require('handlebars-layouts');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function checkInApp(link) {
  if (link.indexOf(applicanData.inAppDomain) === -1) return false;
  // check contract term
  const searchRegex = new RegExp('^' + escapeRegExp(applicanData.inAppDomain) + '\/([0-9]{4})');
  const matches = link.match(searchRegex);
  return !(link.search(searchRegex) !== 0 || matches.length < 2 || +matches[1] !== +applicanData.contractTerm);
}

function searchApplicanLink(link) {
  if (checkInApp(link) === false) return link;
  // remove contract term
  link = applicanData.inAppDomain + link.substring(applicanData.inAppDomain.length + 5, link.length);
  // remove query parameter ? #
  const originUrl = new URL(link);
  const pathName = originUrl.pathname;
  for (const property in webData.link) {
    if (webData.link[property].indexOf(pathName) !== -1) {
      return property;
    }
  }
  return false;
}

function convertLinkToApplicanLink(link) {
  if (checkInApp(link) === false) return link;
  const result = searchApplicanLink(link);
  if (result) {
    const originUrl = new URL(link);
    // Restore query parameters and hash parameters
    // https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL
    // Example: console.log(new URL('http://www.example.com:80/path/to/myfile.html?key1=value1&key2=value2#SomewhereInTheDocument'));
    return applicanData.link[result] + originUrl.search + originUrl.hash;
  }
  return result;
}

const commonAppOptions = {
  data: require("./env/applican.json"),
  onBeforeSetup: function (Handlebars) {
    handlebarsLayouts.register(Handlebars);
    Handlebars.registerHelper('concat', function(a, b, c) {
      function stringOrEmpty(str) {
        return typeof str === 'string' ? str : '';
      }
      return stringOrEmpty(a) + stringOrEmpty(b) + stringOrEmpty(c);
    });
    Handlebars.registerHelper("linkOrBrowser", function(link) {
      const data = require("./env/applican.json");
      if (data.isApplican) {
        if (checkInApp(link)) {
          return new Handlebars.SafeString(convertLinkToApplicanLink(link));
        }
        return new Handlebars.SafeString('javascript:applican.launcher.urlScheme(\'' + link +'\');');
      }
      return new Handlebars.SafeString(link);
    });
    Handlebars.registerHelper("linkOrWebview", function(link) {
      const data = require("./env/applican.json");
      if (data.isApplican) {
        return new Handlebars.SafeString('javascript:applican.launcher.webview(\'' + link + '\');');
      }
      return new Handlebars.SafeString(link);
    });
    Handlebars.registerHelper("displayWebOnly", function(content) {
      const data = require("./env/applican.json");
      if (!data.isApplican) {
        return new Handlebars.SafeString(content);
      }
      return '';
    });
  }
}

const commonWebOptions = {
  data: require("./env/web.json"),
  onBeforeSetup: function (Handlebars) {
    handlebarsLayouts.register(Handlebars);
    Handlebars.registerHelper('concat', function(a, b, c) {
      return a + b + c;
    });
    Handlebars.registerHelper("linkOrBrowser", function(link) {
      return new Handlebars.SafeString(link);
    });
    Handlebars.registerHelper("linkOrWebview", function(link) {
      return new Handlebars.SafeString(link);
    });
    Handlebars.registerHelper("displayWebOnly", function(content) {
      const data = require("./env/web.json");
      if (!data.isApplican) {
        return new Handlebars.SafeString(content);
      }
      return '';
    });
  }
}

module.exports = {
  checkInApp,
  searchApplicanLink,
  convertLinkToApplicanLink,
  commonAppOptions,
  commonWebOptions
}
