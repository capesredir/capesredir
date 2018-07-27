var regexTestHttp = /^(http|https)\:\/\/+(.*)/;

function _askForGoesToHttp(sendResponse, textMessage, oldUrl) {
	var goesToHttp = confirm('A CAPES pode não ter configurado o https para \
	 este endereço. Selecione Ok para tentar o http ou Cancelar para colocar o \
	 endereço na Lista de Rejeitados');
	if (goesToHttp) {
		sendResponse({
			goesToHttp: true,
			url: '',
		});
	} else {
		_askToAddBlackList(sendResponse, textMessage, oldUrl);
	}
}

function _askToAddBlackList(sendResponse, textMessage, oldUrl) {
	var url = prompt(textMessage, oldUrl);
	url = regexTestHttp.test(url) ? url : 'http://' + url;
	sendResponse({
		goesToHttp: false,
		url: url,
	});
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.type) {
		case "openConfirm":
			var itens = request.url.split(regexTestHttp);
			var oldUrl = itens[1] + '://' + itens[2].split('/')[0];
			/**
			 * textMessage é passado pelos arquivos background, o mótivo para isso é porque permite
			 * reduzir a quandtidade de código escrito, pois caso contrário seria necessário
			 * criar varios case's para um comportamento muito similar que só mudaria pelo
			 * texto que o usuário vizualizaria
			 * @type {[type]}
			 */
			var textMessage = request.text;
			if (request.askToGoHttp) {
				_askForGoesToHttp(sendResponse, textMessage, oldUrl);
			} else {
				_askToAddBlackList(sendResponse, textMessage, oldUrl);
			}
			break;
	}
});
