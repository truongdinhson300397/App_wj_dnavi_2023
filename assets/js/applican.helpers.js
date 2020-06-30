globalInfo = function (key, value, options) {
    if (typeof value === "undefined") {
        return localStorage.getItem(key);
    }
    return localStorage.setItem(key, value);
};
removeGlobalInfo = function (key) {
    return localStorage.removeItem(key);
}
