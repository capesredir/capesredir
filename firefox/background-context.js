function _contextShowSobre(){
    chrome.tabs.create({
        "url": chrome.extension.getURL("sobre.html")
    });
}
/**
 * Essa função é a responsável por gerar o texto do menu do modo automático
 * @method _contextAutoText
 * @return {String}         retorna um texto humanizado para o usuário
 */
function _contextAutoText() {
  var text = modoauto ? 'Desativar' : 'Ativar';
  return text + ' redirecionamento automático'
}

function _contextAutoMode() {
  _automaticToogle(!modoauto, 'save');
}
/**
 * Responsável por atualizar o texto do context menu
 * @method _contextAutoUpdate
 * @return {[type]}           [description]
 */
function _contextAutoUpdate() {
  var texto = _contextAutoText();
  chrome.contextMenus.update('Auto', {
    title: texto
  });
}

function _updateTab(url) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    if (tabs.length == 0) return true;
    chrome.tabs.update(tabs[0].id, {
      url: url
    });
  });
};

function _contextShowOptions(url) {
  chrome.tabs.create({
    "url": chrome.extension.getURL('options.html')
  });
}

function _contextAskForAddHostName(url, type) {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, _sendMessage);

  function _sendMessage(tabs) {
    if (tabs.length == 0) return;
    var tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, {
      type: 'openConfirm',
      text: 'Esse é o enderço correto? Verifique se é o endereço original do site.',
      url: url.urlClear
    }, function(response) {
      var urlUser = response.url;
      if (!urlUser) return;
      var newUrl = urlUser.getCapes();
      if (!newUrl.valid) return;
      var newUrlHostname = newUrl.hostname;
      _optionsResponse({
        domain: newUrl.domain,
        valid: true,
        domainType: type,
        type: 'newdomain'
      });
      if (newUrl.domainSub) {
        _optionsResponse({
          domain: newUrl.domainSub,
          valid: true,
          domainType: type,
          type: 'newdomain'
        });
        newUrlHostname = 'www.' + newUrlHostname;
      }
      var urlClear = url.urlFull.replace(url.hostname, newUrlHostname);
      chrome.tabs.update(tabId, {
        url: urlClear
      });
    });

  }
}

function _contextAddHostNameClick(info) {
  var url = info.pageUrl.getCapes();
  var isSlack = url.hostname.indexOf('-') != -1;
  var isSizeOk = url.hostname.split('.').length > 1;
  var isCapes = !url.hostname.indexOf('.periodicos.capes.gov.br') != -1;
  var isBadUrl = (isCapes && isSlack) || !isSizeOk;
  if (info.menuItemId == 'add' || !isBadUrl) {
    _contextAskForAddHostName(url, info.menuItemId);
  } else {
    chrome.tabs.create({
      "url": chrome.extension.getURL('options.html?url=') + url.urlClear
    });
  }
}
/**
 * Responsável por criar todos os context's menus, é chamada após bacground-automatic
 * ler o storage para saber se o modo automático deve ou não ser ativado
 * @method _contextCreate
 * @return {[type]}       [description]
 */
function _contextCreate() {
  chrome.contextMenus.create({
    "title": "Redirecionar este domínio automaticamente",
    'id': 'add',
    "contexts": ["all"],
    "onclick": _contextAddHostNameClick
  });
  chrome.contextMenus.create({
    "title": "Nunca redirecionar este domínio automaticamente",
    "id": 'reject',
    "contexts": ["all"],
    "onclick": _contextAddHostNameClick
  });
  chrome.contextMenus.create({
    "id": 'separator1',
    "type": "separator",
    "contexts": ["all"],
    "onclick": _contextShowOptions
  });
  chrome.contextMenus.create({
    "id": 'Auto',
    "title": _contextAutoText(),
    "contexts": ["all"],
    "onclick": _contextAutoMode
  });
  chrome.contextMenus.create({
    "title": "+Opções",
    "contexts": ["all"],
    "onclick": _contextShowOptions
  });
  chrome.contextMenus.create({
    "title": "Sobre",
    "contexts": ["all"],
    "onclick": _contextShowSobre
  });
}
