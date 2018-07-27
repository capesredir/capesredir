function _msgToogle(state) {
  showmsg = state;
  chrome.storage.local.set({
    'CAPESshowmsg': showmsg
  });
}

function _msgOnOff(info, tab) {
  showmsg = info.checked ? true : false;
  _msgToogle(showmsg);
}

function _msg(msg, seconds) {
  //uniqueId é necessário para limpar a notificao, impedindo o conflito
  if (!showmsg) return;
  var uniqueId = String(Math.random());
  seconds = typeof seconds != 'undefined' ? seconds * 1000 : 2000;
  chrome.notifications.create(uniqueId, {
    "title": "Redirecionamento CAPES",
    "iconUrl": "iconP128.png",
    "type": "basic",
    "message": msg
  }, function(id) {
    var timer = setTimeout(function() {
      chrome.notifications.clear(id);
    }, seconds);
  });
}

function _msgInit() {
  function _msgAfterGet(result) {
    showmsg = isDefined(result) ? result.CAPESshowmsg : true;
  }
  chrome.storage.local.get('CAPESshowmsg', _msgAfterGet);
}
