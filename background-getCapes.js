String.prototype.domain = function() {
    var domain;
    var a = document.createElement('a');
    a.href = this.valueOf();
    var itens = a.hostname.split('.');
    var nItens=itens.length;
    var protocol=a.href.split('://')[0];
    var domain = protocol+'://'+a.hostname+'/*';
    var domainSub = false;
    valid =true;
    if (itens.length<2){
        valid=false;
    }else if(itens.length==2){
        var domainSub = protocol+'://www.'+a.hostname+'/*';
    }
    //capes is suck's some subdomanis is so ugly
    //valid=/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(a.hostname);
    return {
        result:domain,
        domain:domain,
        valid:valid,
        hostname:a.hostname,
        domainSub:domainSub
    };
};
String.prototype.getCapes = function() {
    var url=this;
    var ezNumber;
    var hostname=url.domain().hostname;
    var isNewWay =url.indexOf('://www.periodicos.capes.gov.br/')!=-1;
    var isRedirected=regexIsRedirected.test(hostname);
    var isBlocked=regexIsBlocked.test(url);
    var allow=false;
    var inHome=false;
    var urlFull;
    var elementsUrl;
    if(isRedirected){
        ezNumber=String(hostname.split(regexIsRedirected)[2]);
        urlFull=url.split('.ez'+ezNumber+'.periodicos.capes.gov.br').reduce(function(a,b){return a+b});
        url=url.split('.ez'+ezNumber+'.periodicos.capes.gov.br')[0];
        allow=true;
    }else if (isBlocked){
        url = url.split('&url=')[1];
        urlFull=url;
    }else if(isNewWay){
        inHome=true;
        allow=true;
    }else{
        url=url.valueOf();
        urlFull=url;
        allow=true;
    }
    elementsUrl=url.domain();
    return {
        domain:elementsUrl.domain,
        valid:elementsUrl.valid,
        hostname:elementsUrl.hostname,
        domainSub:elementsUrl.domainSub,
        urlClear:url,
        urlFull:urlFull,
        isBlocked:isBlocked,
        isRedirected:isRedirected,
        allow:allow,
        inHome:inHome
    }
};
