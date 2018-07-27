//A página options nao consegue se comunicar diretamente com o background, por isso é necessário a comunicao
//pro meio de mensagens
//
//domainsLocal representa todos os domínios cadastrados pelo usuário
function _optionsGetLocalDomains(result) {
	domainsLocal = isDefined(result) ? result['domainsLocal'] : domainsLocal;
	_optionsInit();
	_automaticSetListenerRedirect();
}

function _optionsGetRejectedDomains(result) {
	domainsRejected = isDefined(result) ? result['domainsRejected'] : domainsRejected;
}

function _optionsResponse(request, sender, sendResponse) {
	if (request.type == 'newdomain') {
		if (request.domainType == 'add' && request.valid) {
			_optionAddLocalDomain(request.domain);
		} else if (request.valid) {
			_optionAddRejectedDomain(request.domain);
		}
		if (typeof sendResponse != 'undefined')
			sendResponse({
				domainsRejected: this.domainsRejected,
				domainsLocal: this.domainsLocal
			});
	} else if (request.type == 'removeAlldomainsLocal') {
		domainsLocal = [];
		domainsRejected = [];
		_optionsUpdateStorage(domainsLocal);
		_optionsUpdateStorage(domainsRejected);
		if (typeof sendResponse != 'undefined') {
			sendResponse({
				domainsRejected: this.domainsRejected,
				domainsLocal: this.domainsLocal
			});
		}
	} else if (request.type == 'getdomainsLocal') {
		sendResponse({
			domainsRejected: this.domainsRejected,
			domainsLocal: this.domainsLocal
		});
	} else if (request.type == 'getConfig') {
		sendResponse({
			modoauto: this.modoauto,
			showmsg: this.showmsg
		});
	} else if (request.type == 'saveConfigModo') {
		this._automaticToogle(request.modoauto, 'save');
		sendResponse({});
	} else if (request.type == 'saveConfigMsg') {
		this._msgToogle(request.showmsg);
		sendResponse({});
	} else if (request.type == 'removeIndex') {
		if (request.domainType == 'add') {
			domainsLocal.splice(request.removeIndex, 1);
			_optionsUpdateStorage(domainsLocal);
		} else {
			domainsRejected.splice(request.removeIndex, 1);
			_optionsUpdateStorageRejected(domainsRejected);
		}
		sendResponse({
			domainsRejected: this.domainsRejected,
			domainsLocal: this.domainsLocal
		});
	}
}

function _optionAddRejectedDomain(domainReject) {
	//checka se está na whitelist, se sim rermove da whitelist se nao adiciona na blacklist
	var indexWhiteList = domainsLocal.indexOf(domainReject);
	var isInWhiteList = indexWhiteList != -1;
	var indexBlackList = domainsRejected.indexOf(domainReject);
	var isInBlackList = indexBlackList != -1;
	if (isInWhiteList) {
		_msg('Domínio removido da whitelist', 3);
		domainsLocal.splice(indexWhiteList, 1);
		_optionsUpdateStorage(domainsLocal);
	}
	if (!isInBlackList) {
		_msg('Domínio adicionado à blacklist', 3);
		domainsRejected.push(domainReject);
		_optionsUpdateStorageRejected(domainsRejected);
	}
}

function _optionAddLocalDomain(domainLocal) {
	//checka se está na whitelist, se sim não adiciona
	//checka se está na blacklist, se sim remove
	var indexWhiteList = domainsLocal.indexOf(domainLocal);
	var isInWhiteList = indexWhiteList != -1;
	var indexBlackList = domainsRejected.indexOf(domainLocal);
	var isInBlackList = indexBlackList != -1;
	if (!isInWhiteList) {
		_msg('Domínio adicionado à whitelist', 3);
		domainsLocal.push(domainLocal);
		_optionsUpdateStorage(domainsLocal);
	}
	if (isInBlackList) {
		_msg('Domínio removido da blacklist', 3);
		domainsRejected.splice(indexBlackList, 1);
		_optionsUpdateStorageRejected(domainsRejected);
	}
}

function _optionsInit() {
	domains = domainsCapes.concat(domainsLocal);
	chrome.runtime.onMessage.addListener(_optionsResponse);
}
//função responsável por atualizar o dominios da aplicação
function _optionsUpdateStorage(domainsLocal) {
	domains = domainsCapes.concat(domainsLocal);
	_automaticSetListenerRedirect(modoauto);
	chrome.storage.sync.set({
		'domainsLocal': domainsLocal
	});
	//é uma boa alternativa o sync salvar sempre no local também
	chrome.storage.local.set({
		'domainsLocal': domainsLocal
	});
}

function _optionsUpdateStorageRejected(domainsRejected) {
	chrome.storage.sync.set({
		'domainsRejected': domainsRejected
	});
	chrome.storage.local.set({
		'domainsRejected': domainsRejected
	});
}
