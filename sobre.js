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
var  status = _getQuery('status');
  if (status) {
    $('#carousel').carousel({
      interval: 15000
    });
    $('#modal').modal('show');
  }
  $('#slideBtn').click(function(e){
    $('#modal').modal('show');
  })
});
