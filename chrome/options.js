var domainsLocal, newdomainDiv, domainsRejected,modoauto,showmsg;
var ulDomainsCapes = $('#ulDomainsCapes');
//var chrome ={ extension:null };
//chrome.runtime=chrome.runtime;
function refreshConfig(){
    var elemRadio='input[type=radio][name=radioModo][value='+String(modoauto)+']';
    $(elemRadio).prop('checked',true);
    $('#checkShowMsg').prop('checked',showmsg);
}
function refreshdomains() {
    domainsUl.empty();
    if (domainsRejected.length) {
        domainsUl.append('<h4 class="text-center">Endereços que não são redirecionados em hipótese alguma</h4>');
        for (var i = 0; i < domainsRejected.length; i++) {
            var domainRejected = domainsRejected[i];
            var li = $('<li class="row" data-domain-type="reject" data-domain-index="' + i + '"/>');
            var domainRejectedSpan = '<span class="domainRejectedItem" title="' + domainRejected + '">' + domainRejected+ '</span>';
            var removeDomainRejected = '<button class="btn btn-flat text-danger removedomainRejectedButton">Deletar</button>';
            li.append(  removeDomainRejected+domainRejectedSpan+'<hr/>');
            domainsUl.append(li);
        }
    }
    if (domains.length) {
        domainsUl.append('<h4 class="text-center">Endereços para redirecionamento automático</h4>');
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            var li = $('<li class="row" data-domain-type="add" data-domain-index="' + i + '"/>');
            var domainSpan = '<span class="domainItem" title="' + domain + '">' + domain+ '</span>';
            var removeDomain = '<button class="btn btn-flat text-danger removedomainButton">Deletar</button>';
            li.append(  removeDomain+domainSpan+'<hr/>');
            domainsUl.append(li);
        }
    }
}
function _domainsCapes() {
    ulDomainsCapes.empty();
    for (var i = 0; i < domainsCapes.length; i++) {
        var li = $('<li class="row" />');
        var link=domainsCapes[i].replace('*://*.','http://').replace('*','');
        var domain = '<a href="'+link+'" class="" >' + domainsCapes[i]+ '</a>';
        li.append(  domain);
        ulDomainsCapes.append(li);
    }
}
function addDomain() {
    var domainInput, toInput, typeDropDown;
    domainInput = $('#domainInput');
    if (!domainInput.val().domain().valid) return;
    var newdomain = domainInput.val().domain().result;
    var newdomainSub = domainInput.val().domain().sub;
    chrome.runtime.sendMessage({
        domain: newdomain,
        type:'newdomain',
        domainType:'add'
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
    chrome.runtime.sendMessage({
        domain: newdomainSub,
        type:'newdomain',
        domainType:'add'
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
    domainInput.val('');
}
function removeAlldomains() {
    chrome.runtime.sendMessage({
        type:'removeAlldomainsLocal',
        removeAlldomainsLocal: true
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
}
function _removeDomain() {
    var index=parseInt($(this).parent().attr('data-domain-index'));
    var type=$(this).parent().attr('data-domain-type');
    chrome.runtime.sendMessage({
        type:'removeIndex',
        domainType:type,
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
    _domainsCapes();
    chrome.runtime.sendMessage({
        type:'getdomainsLocal',
        getdomainsLocal: true
    }, function(response) {
        domains = response.domainsLocal;
        domainsRejected = response.domainsRejected;
        refreshdomains();
    });
    chrome.runtime.sendMessage({
        type:'getConfig',
    }, function(response) {
        modoauto = response.modoauto;
        showmsg = response.showmsg;
        refreshConfig();
    });
    $('input[type=radio][name=radioModo]').change(function() {
        modoauto=this.value=='true';
        chrome.runtime.sendMessage({
            type:'saveConfigModo',
            modoauto:modoauto
        }, function(response) {
        });
    });
    $('#checkShowMsg').change(function() {
        showmsg=this.checked;
        chrome.runtime.sendMessage({
            type:'saveConfigMsg',
            showmsg:showmsg
        }, function(response) {
        });
    });
    $('#adddomainButton').click(addDomain);
    $('#removeAlldomainsButton').click(removeAlldomains);
    $('#domains').delegate('.removedomainButton', 'click', _removeDomain);
    $('#domains').delegate('.removedomainRejectedButton','click', _removeDomain);
    $('#domainInput').focus();
});
