var domainsLocal, newdomainDiv, domainsRejected;
var ulDomainsCapes;
function refreshdomains() {
    domainsUl.empty();
    if (domainsRejected.length) {
        domainsUl.append('<h4 class="text-center">Endereços que não são redirecionados em hipótese alguma</h4>');
        for (var i = 0; i < domainsRejected.length; i++) {
            var domainRejected = domainsRejected[i];
            var li = $('<li class="row" data-domain-type="reject" data-domain-index="' + i + '"/>');
            var domainRejectedSpan = '<span class="domainRejectedItem" title="' + domainRejected + '">' + domainRejected + '</span>';
            var removeDomainRejected = '<button class="btn btn-flat text-danger removedomainRejectedButton">Deletar</button>';
            li.append(removeDomainRejected + domainRejectedSpan + '<hr/>');
            domainsUl.append(li);
        }
    }
    if (domains.length) {
        domainsUl.append('<h4 class="text-center">Endereços para redirecionamento automático</h4>');
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            var li = $('<li class="row" data-domain-type="add" data-domain-index="' + i + '"/>');
            var domainSpan = '<span class="domainItem" title="' + domain + '">' + domain + '</span>';
            var removeDomain = '<button class="btn btn-flat text-danger removedomainButton">Deletar</button>';
            li.append(removeDomain + domainSpan + '<hr/>');
            domainsUl.append(li);
        }
    }
}
function _domainsCapes() {
    ulDomainsCapes.empty();
    for (var i = 0; i < domainsCapes.length; i++) {
        var li = $('<li class="row" />');
        var link = domainsCapes[i].replace('*://*.', 'http://').replace('*', '');
        var domain = '<a href="' + link + '" class="" >' + domainsCapes[i] + '</a>';
        li.append(domain);
        ulDomainsCapes.append(li);
    }
}
function _addDomain(type) {
    var domainInput, toInput, typeDropDown;
    domainInput = $('#domainInput');
    var domainResult = domainInput.val().domain();
    if (!domainResult.valid) return alert('Endereço de url não é válido');
    //chrome.runtime.sendMessage({
    //domain: newdomain,
    //type:'newdomain',
    //valid:true,
    //domainType:type
    //}, function(response) {
    //domains = response.domainsLocal;
    //domainsRejected = response.domainsRejected;
    //refreshdomains();
    //});
    chrome.runtime.sendMessage({
        domain: domainResult.domain,
        type: 'newdomain',
        valid: true,
        domainType: type
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
    if (domainResult.subDomain) {
        chrome.runtime.sendMessage({
            domain: domainResult.subDomain,
            type: 'newdomain',
            valid: true,
            domainType: type
        }, function(response) {
            domains = response.domainsLocal;
            domainsRejected = response.domainsRejected;
            refreshdomains();
        });
    }
    domainInput.val('');
}
function _addDomainWebOfScience() {
    var webOfScience=['*://*.webofknowledge.com/*','*://webofknowledge.com/*'];
    webOfScience.map(function(item){
        chrome.runtime.sendMessage({
            domain: item,
            type: 'newdomain',
            valid: true,
            domainType: 'add'
        }, function(response) {
            domains = response.domainsLocal;
            domainsRejected = response.domainsRejected;
            refreshdomains();
        });
    })
}
function _removeDomainWebOfScience() {
    var webOfScience=['*://*.webofknowledge.com/*','*://webofknowledge.com/*'];
    webOfScience.map(function(item){
        var index=domains.indexOf(item);
        if(index==-1) return true;
        domains.splice(index, 1);
        chrome.runtime.sendMessage({
            type: 'removeIndex',
            domainType: 'add',
            removeIndex: index
        }, function(response) {
            domains = response.domainsLocal;
            domainsRejected = response.domainsRejected;
            refreshdomains();
        });
    })
}
function removeAlldomains() {
    chrome.runtime.sendMessage({
        type: 'removeAlldomainsLocal',
        removeAlldomainsLocal: true
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
}
function _removeDomain() {
    var index = parseInt($(this).parent().attr('data-domain-index'));
    var type = $(this).parent().attr('data-domain-type');
    chrome.runtime.sendMessage({
        type: 'removeIndex',
        domainType: type,
        removeIndex: index
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
}
$(document).ready(function() {
    domainsUl = $('#domains');
    newdomainDiv = $('#new-domain');
    ulDomainsCapes = $('#ulDomainsCapes');
    chrome.runtime.sendMessage({
        type: 'getdomainsLocal',
        getdomainsLocal: true
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
    $('#adddomainButton').click(function() {
        _addDomain('add');
    });
    $('#rejectDomainButton').click(function() {
        _addDomain('reject');
    });
    $('#addWebOfScience').click(function() {
        _addDomainWebOfScience();
    });
    $('#removeWebOfScience').click(function() {
        _removeDomainWebOfScience();
    });
    $('#removeAlldomainsButton').click(removeAlldomains);
    $('#domains').delegate('.removedomainButton', 'click', _removeDomain);
    $('#domains').delegate('.removedomainRejectedButton', 'click', _removeDomain);
    $('#domainInput').focus();
    _domainsCapes();
});
