function _showInstallFirefox(result) {
	var currentVer = isDefined(result) ? result['currentVer'] : '0';
	if (currentVer != '3.1') {
		chrome.tabs.create({
			url: "http://www.infis.ufu.br/capes-periodicos"
		});
		chrome.storage.local.set({
			'currentVer': '3.1'
		});
	}
}

function _showInstallChrome(details) {
	if (details.reason == 'update') {
		_optionsResponse({
			type: 'removeAlldomainsLocal'
		});
		_automaticToogle(true,'save');
		chrome.tabs.create({
				"url": chrome.extension.getURL("sobre.html?status=update")
		});
	}
	if (details.reason == "install" ) {
		chrome.tabs.create({
			url: "http://www.infis.ufu.br/capes-periodicos"
		});
	}
	chrome.runtime.onInstalled.removeListener(_showInstallChrome);
}

function _installInit() {
	if (typeof chrome.runtime.onInstalled == 'undefined') {
		chrome.storage.local.get('currentVer', _showInstallFirefox);
	} else {
		chrome.runtime.onInstalled.addListener(_showInstallChrome);
	}
}
