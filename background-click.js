function _clickCheckInException(url) {
    var exception = exceptions.filter(function(item) {
        return url.indexOf(item.from) != -1;
    })
    return exception.length > 0 ? exception[0] : false;
}
function _clickRedirectCAPES(tab) {
    var url = tab.url;
    var tabId = tab.id;
    var exception;
    var isInCapes = regexIsRedirected.test(url);
    exception = _clickCheckInException(url);
    url = exception ? exception.to : "" + pre + url + "";
    if (isInCapes) {
        _msg("Você já está no sistema Portal de Periódicos CAPES");
        return;
    } else {
        _msg("Redirecionando para o Portal de Periódicos CAPES");
        chrome.tabs.update(tabId, {
            url: url
        });
        return;
    }
}
function _clickInit() {
    chrome.browserAction.onClicked.addListener(_clickRedirectCAPES);
}
