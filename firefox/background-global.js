/**
 * checa se um dado objeto fora definido
 * @method isDefined
 * @param  {object}  test é por exemplo o objeto retornado pela leitura do storage
 * @return {Boolean}      true se é definido falso caso contrário
 */
function isDefined(test) {
  return JSON.stringify(test) != "{}";
}
/**
 * Esse If serve para garantir compatibilidade com o firefox, pois o mesmo não
 * possui o método chrome.storage.sync
 * @method if
 * @param  {[type]} typeof chrome.storage.sync == 'undefined' [description]
 * @return {[type]}        se o método sync não existe cria um o definindo como sendo
 * chrome.storage.local
 */
if (typeof chrome.storage.sync == 'undefined')
  chrome.storage.sync = chrome.storage.local;


var lastRequestId;
var domains = [];
var domainsLocal = [];
var domainsRejected = ['http://login.webofknowledge.com/*','https://login.webofknowledge.com/*'];
var modoauto = true; // global, modo automatico ou manual
var showmsg = true; // global, exibe ou nao notificacao
var pre = 'http://novo.periodicos.capes.gov.br/?option=com_pezproxy&controller=auth&view=pezproxyauth&url=';
// first is http or https
// second ez proxy number
// third cleated url
var regexIsRedirected = /^(.*?)\.ez+([0-9]{1,5})+.periodicos.capes.gov.br+(.*)/;
//first clear hostname
//second ezProxy number
var regexIsBlocked = /^(http|https)+\:+\/+\/+ez+([0-9]{1,5})+\.periodicos\.capes\.gov\.br\/+(login|connect)+\?+(.*)/;
var exceptions = [{
  from: 'http://login.webofknowledge.com',
  to: pre+'http://www.webofknowledge.com/',
},
{
  from: 'https://login.webofknowledge.com',
  to: pre+'https://www.webofknowledge.com/',
}

]
