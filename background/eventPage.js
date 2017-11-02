chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (typeof changes.count!=='undefined') {
    if (changes.count.newValue >= 999)
      chrome.browserAction.setBadgeText({"text":'+990'});
    else 
      chrome.browserAction.setBadgeText({"text":'' + (changes.count.newValue||'')});
  }
});
