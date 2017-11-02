
function setupChck(id) {
  chrome.storage.local.get(id, function(ret) {
    if (typeof ret[id]==='undefined') 
      $("#"+id).prop('checked', true);
    else 
      $("#"+id).prop('checked', !!ret[id]);
  })
  $("#"+id).change(function() {
    var obj = {};
    obj[id] = $(this).is(':checked');
    chrome.storage.local.set(obj);
  });
}

function setupSlct(id) {
  chrome.storage.local.get(id, function(ret) {
    $("#"+id).val(ret[id] || '3');
  })
  $("#"+id).change(function() {
    var obj = {};
    obj[id] = parseInt($(this).val())
    chrome.storage.local.set(obj);
  });
}

$(document).ready(function() {
  setupChck('cash')
  setupChck('telegram')
  setupSlct('cashNum')
  chrome.storage.local.get("count", function(ret) {
    $('#killCount').html((ret.count||'0'));
  })

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (typeof changes.count!=='undefined')
      $('#killCount').html((changes.count.newValue||'0'));
  });

  $('body').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});

     return false;
   });
});
