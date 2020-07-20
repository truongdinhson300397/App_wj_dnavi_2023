globalInfo = function (key, value, options) {
    if (typeof value === "undefined") {
        return localStorage.getItem(key);
    }
    return localStorage.setItem(key, value);
};
removeGlobalInfo = function (key) {
    return localStorage.removeItem(key);
}
// we will have some functions like handlebar helper function
if (typeof linkOrWebview === "undefined") {
    function linkOrWebview(link, appendRootDomain) {
        if (typeof isApplican !== "undefined" && isApplican) {
            var url = link;
            if (typeof appendRootDomain === "undefined" || appendRootDomain) {
                url = concatAndResolveUrl(domain, link);
            }
            return domain + 'webview/webview.html?link_url' + '=' + url;
        }
        return link;
    }
}

if (typeof linkOrBrowser === "undefined") {
    function linkOrBrowser(link) {
        if (typeof isApplican !== "undefined" && isApplican) {
            return 'javascript:applican.launcher.urlScheme(\'' + link +'\')';
        }
        return link;
    }
}
