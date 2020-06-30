var globalInfo, removeGlobalInfo;
if (typeof $ === "function" && typeof $.cookie === "function") {
    globalInfo = $.cookie;
}
if (typeof $ === "function" && typeof $.cookie === "function") {
    removeGlobalInfo = $.removeCookie;
}
