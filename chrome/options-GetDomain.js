String.prototype.domain = function() {
  var domain;
  var valid;
  var isCapes;
  var inputText = this.valueOf();
  var a = document.createElement('a');

  a.href = /^(http|https)\:\/\//.test(inputText) ? inputText : 'http://' + inputText;
  var protocol=a.href.split('://')[0];
  var itens = a.hostname.split('.');
  var nItens = itens.length;
  domain = protocol+'://' + a.hostname + '/*';
  //if (valid){
  //for (i=1;i< nItens-1;i++){domain=domain+itens[i]+'.';}
  //domain=domain+itens[nItens-1]+'/*';
  //}
  var subDomain = false;
  if (nItens == 2) subDomain =protocol +'://www.' + a.hostname + '/*';
  valid = a.hostname.indexOf('.') != -1;
  isCapes = a.hostname.indexOf('.periodicos.capes.gov.br') != -1;
  return {
    domain: domain,
    subDomain: subDomain,
    valid: valid
  };
};
