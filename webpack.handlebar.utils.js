'use strict';
const webData = require('./env/web.json');
const applicanData = require('./env/applican.json');

const utils = {};

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
utils.checkInApp = function(link) {
    if (link.indexOf(applicanData.inAppDomain) === -1) return false;
    // check contract term
    const searchRegex = new RegExp('^' + escapeRegExp(applicanData.inAppDomain) + '\/([0-9]{4})');
    const matches = link.match(searchRegex);
    if (link.search(searchRegex) !== 0 || matches.length < 2 || +matches[1] !== +applicanData.contractTerm) return false;
    return true;
}
utils.searchApplicanLink = function (link) {
    if (utils.checkInApp(link) === false) return link;
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
utils.convertLinkToApplicanLink = function (link) {
    if (utils.checkInApp(link) === false) return link;
    var result = utils.searchApplicanLink(link);
    if (result) {
        const originUrl = new URL(link);
        // Restore query parameters and hash parameters
        // https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL
        // Example: console.log(new URL('http://www.example.com:80/path/to/myfile.html?key1=value1&key2=value2#SomewhereInTheDocument'));
        return applicanData.link[result] + originUrl.search + originUrl.hash;
    }
    return result;
};
module.exports = utils;
