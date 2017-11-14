chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (typeof changes.count!=='undefined') {
    console.log(changes.count.newValue);
    if (changes.count.newValue >= 999)
      chrome.browserAction.setBadgeText({"text":'+999'});
    else 
      chrome.browserAction.setBadgeText({"text":'' + (changes.count.newValue||'')});
  }
});
