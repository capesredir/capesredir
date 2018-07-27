var automaticUrlOld;
/**
 * Essa função é utilizada para desativar/ativar o modo automático, a mesma
 * alem de ativar/desativar o listener de requisições chama a função
 * _contextAutoUpdate para atualizar os menus
 * @method _automaticToogle
 * @param  {[Boolean]}         state se true o modo automático deve ser ativado
 * @param  {[String]}         save  Se a string não for passada, não salva no
 * storage se o modo automático é para ficar ligado ou não. Isso é muito util
 * para o usuário que leva o notebook de casa para a universidade
 */
function _automaticToogle(state, save) {
    var text = state ? 'Ativado' : 'Desativado';
    modoauto = state;
    _automaticSetListenerRedirect();
    _contextAutoUpdate();
    _msg('Redirecionamento automático ' + text);
    if (typeof save != 'undefined')
        chrome.storage.local.set({
            'CAPESmodoauto': state
        });
}
/**
 * Responsável por iniciar a váriavel contendo a lista de domínios
 * que o modo automático redirecionará, também inicia lista de rejeitados
 * @method _automaticInitDomains
 */
function _automaticInitDomains() {
    chrome.storage.sync.get('domainsLocal', _optionsGetLocalDomains);
    chrome.storage.sync.get('domainsRejected', _optionsGetRejectedDomains);
}
/**
 * Cria(caso modoauto seja true) os listener's para
 * as requisições
 * @method _automaticSetListenerRedirect
 */
function _automaticSetListenerRedirect() {
    chrome.webRequest.onBeforeRequest.removeListener(_automaticRedirectTo);
    chrome.webRequest.onCompleted.removeListener(_automaticCompleted);
    chrome.webRequest.onCompleted.addListener(_automaticCompleted, {
        urls: domains,
        types: ["main_frame"],
    }, ["responseHeaders"]);
    if (modoauto) {
        chrome.webRequest.onBeforeRequest.addListener(_automaticRedirectTo, {
            urls: domains,
            types: ["main_frame"],
        }, ["blocking"]);
    }
}
/**
 * Esse é o CallBack do listener onComplete. Este callback é chamado quando as
 requisições terminam. De acordo com o status da conexão _automaticCompleted
 criará um novo item na lista negra(perguntando ao usuário) ou desativará o modo
 automático
 * @method _automaticCompleted
 * @param  {object}            details contêm informações sobre a requisição
 * ip, statusCode, url etc
 */
function _automaticCompleted(details) {
    var statusCode = details.statusCode;
    var url = details.url.getCapes();
    var urlFromRequest = details.url;
    var tabId = details.tabId;
    var urlClear = details.url;
    var urlIsHttps = details.url.split('://')[0] == 'https';
    var noConection = statusCode == 404;
    var okStatus = statusCode == 200;
    console.log(statusCode);
    function _goesToHttp() {
        chrome.tabs.update(tabId, {
            url: urlFromRequest.replace('https', 'http')
        });
    }
    function _addBlackList(url) {
        _optionsResponse({
            domain: url.domain().result,
            valid: true,
            domainType: 'reject',
            type: 'newdomain',
        });
        chrome.tabs.update(tabId, {
            url: automaticUrlOld
        });
    }
    // se não há conexão não há necessidade de fazer nada
    if (noConection) return;
    if (modoauto) {
        // se a url implica que está em casa(sem estar logado no sistema) desativar
        // o modo automatico, sem salvar a preferência e atualiza a tab para a url original
        if (url.inHome) {
            _msg('Você está em casa', 4);
            _automaticToogle(false);
            urlClear = automaticUrlOld;
            chrome.tabs.update(tabId, {
                url: urlClear
            });
            // se a url está bloquead e o status da requisição é bom(não houve falha)
            // significa que esse domínio não está aceito pelo sistema da capes então adicionar
            // o domínio na lista de rejeitados e atualiza tab com a url limpa
        } else if (url.isBlocked && okStatus) {
            console.info('bloqueada');
            function _changeTab() {
                if (url.urlClear.indexOf('https://') == 0) {
                    console.log('update tab');
                    console.log(details.url);
                    chrome.tabs.update(tabId, {
                        url: details.url.replace('https://', 'http://')
                    });
                } else {
                    _optionsResponse({
                        domain: url.domain,
                        valid: url.valid,
                        domainType: 'reject',
                        type: 'newdomain'
                    });
                    _optionsResponse({
                        domain: url.domain.replace('http://','https://'),
                        valid: url.valid,
                        domainType: 'reject',
                        type: 'newdomain'
                    });
                    chrome.tabs.update(tabId, {
                        url: url.urlClear
                    });
                }
                //		chrome.tabs.onUpdated.removeListener(_wait);
            }
            //	function _checkExist() {
            //	if (chrome.runtime.lastError) {
            console.log('tab ainda não registrada, aguardando');
            var	interval = setInterval(function() {
                console.log('chamado interval');
                chrome.tabs.get(tabId, function() {
                    if (!chrome.runtime.lastError) {
                        console.log('limpado Interval');
                        _changeTab();
                        clearInterval(interval);
                    }
                })
            }, 500);
            //		} else {
            //			_changeTab()
            //		}
            //	}
            //	chrome.tabs.get(tabId, _checkExist);
            //	chrome.tabs.onUpdated.addListener(_wait);
            // se a url foi redirecionada e mesmo assim algum recurso da página não está
            // disponívle torna-se necessário perguntar para o usuário quer adicionar o
            // domínio na lista de rejeitados, caso ele queira atualiza a url da tab
        } else if (url.isRedirected && !okStatus) {
            function _askForReject(id, changeInfo, tab) {
                if (changeInfo.status == 'complete' && id == tabId) {
                    chrome.tabs.sendMessage(tabId, {
                        type: 'openConfirm',
                        text: 'Aperte Ok para adicionar o domínio na lista de rejeitados',
                        url: url.urlClear,
                        askToGoHttp: urlIsHttps
                    }, function(response) {
                        if (typeof response == 'undefined') return;
                        if (response.goesToHttp) {
                            _goesToHttp()
                        } else if (response.url) {
                            _addBlackList(response.url);
                        }
                        chrome.tabs.onUpdated.removeListener(_askForReject);
                    });
                }
            }
            chrome.tabs.onUpdated.addListener(_askForReject);
        }
    } else if (!url.allow) {
        urlClear = url.urlClear;
        chrome.tabs.update(tabId, {
            url: urlClear
        });
    }
}
/**
 * CallBack do listener onBeforeRequest
 * @method _automaticRedirectTo
 * @param  {object}             details contêm os detalhes das requisições
 * oriundas dos domínios presentes que pertencem ao conjunto domains
 * @return {object}                     retorna a Nova Url ou cancela o bloqueio
 * de requisição
 */
function _automaticRedirectTo(details) {
    var isRedirect = regexIsRedirected.test(details.url);
    var isRequestMain = details.requestId != lastRequestId;
    var isExcluded = domainsRejected.indexOf(details.url.domain().result) != -1;
        /**
    * Se a requisição é a requisição principal, se a requisição já não é uma requisição
    * redirecionada e se ela não está na lista de excluídos retorna a Nova Url
    * @method if
    * @param  {Boolean} isRequestMain &&            !isRedirect && !isExcluded [description]
    * @return {[type]}                [description]
    */
    if (isExcluded)
        return {
            cancel: false
        }
        if (isRequestMain && !isRedirect) {
            lastRequestId = details.requestId;
            _msg("Redirecionamento para o Portal de Periódicos CAPES ativo");
            automaticUrlOld = details.url;
            return {
                redirectUrl: "" + pre + details.url + "",
            };
        }
        return {
            cancel: false
        }
}
/**
 * Esta função é chamada pela main() que se encontra dentro de background.js.
 * Tal função lê o storage para saber se o método automático está ligado, cria
 * os context menus, e inicia o modo automático
 * @method _automaticInit
 */
function _automaticInit() {
    function _automaticAfterGet(result) {
        modoauto = isDefined(result) ? result.CAPESmodoauto : true;
        _automaticInitDomains();
        _contextCreate();
    }
    chrome.storage.local.get('CAPESmodoauto', _automaticAfterGet);
}
