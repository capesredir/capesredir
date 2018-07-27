function _getQuery(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return (false);
}
$(document).ready(function() {
  url = _getQuery('url');
  if (url) {
    $('#domainInput').val(url);
    $('#carousel').carousel({
      interval: 3000
    });
    $('#modal').modal('show');
  }
});
