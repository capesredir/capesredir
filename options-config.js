var modoauto, showmsg;

function refreshConfig() {
  var elemRadio = 'input[type=radio][name=radioModo][value=' + String(modoauto) + ']';
  $(elemRadio).prop('checked', true);
  $('#checkShowMsg').prop('checked', showmsg);
}
$(document).ready(function() {
  chrome.runtime.sendMessage({
    type: 'getConfig',
  }, function(response) {
    modoauto = response.modoauto;
    showmsg = response.showmsg;
    refreshConfig();
  });
  $('input[type=radio][name=radioModo]').change(function() {
    modoauto = this.value == 'true';
    chrome.runtime.sendMessage({
      type: 'saveConfigModo',
      modoauto: modoauto
    }, function(response) {});
  });
  $('#checkShowMsg').change(function() {
    showmsg = this.checked;
    chrome.runtime.sendMessage({
      type: 'saveConfigMsg',
      showmsg: showmsg
    }, function(response) {});
  });
});
