var hide = {
  cash: false,
  cashNum: 3,
  telegram: false,
  debug: false,
  count: 0,
  allTimeCount: 0
}


function actionEls(els, unhide) {
  var newCount = els.length;
  if (els.length) {
    for (el of els) {
      if (hide.debug) {
        el.style['background-color'] = 'aqua'
        el.classList.add('hide-elements-now');
      } else {
        
        el.style.display = 'none';
        el.classList.add('hide-elements-now');
      }
    }
  } 
  if (!unhide) {
    hide.allTimeCount += newCount;
    hide.count += newCount;
    chrome.storage.local.set({allTimeCount: hide.allTimeCount, count: hide.count});
  }
}

function genDolRegex() {
  var reg = '\\$'
  var i;
  for (i=0;i<hide.cashNum;i++) {
    reg += '(.|[\\r\\n])*\\$';
  }
  return new RegExp(reg, 'gm');
}

function filterEls(dolReg, limitTextSearch) {
  return function (el) {
      var ret = false;
      var text = null;
      var textEl = el;
      if (limitTextSearch) {
        textEl = el.querySelector(limitTextSearch);
      }
      text = (textEl||{innerHTML: ''}).innerHTML;

      if (hide.cash && dolReg.test(text))
        ret = true ; 

      if (hide.telegram && /t\.me/gi.test(text))
        ret = true
      return ret;
    }
}
function doHidesRaw() {
  if (hide.init) {
    var dolReg = genDolRegex();
    
    let els = document.querySelectorAll(".js-stream-item:not(.hide-elements-now)");
    els = _.filter(els, filterEls(dolReg, '.js-tweet-text'));
    actionEls(els);   
  }
}
var doHides = doHidesRaw;//_.throttle(doHidesRaw, 100);
//var doHides = _.throttle(doHidesRaw, 20);

var forceReload = _.throttle(function() {
  $('.try-again-after-whale')[0].click()
}, 100);


var doHideInit = _.throttle(function() {
  if (!hide.init && (hide.cash || hide.telegram)) {
    $(window).scroll(function() {
      if (hide.cash || hide.telegram) {
        if((Math.ceil($(window).scrollTop()) + $(window).height()) >= ($(document).height())) {
          forceReload();
        }
      }
    });
    // Guarentee that we have at least 10 visible tweets
    function reloadIfNeeded() {
      let els = document.querySelectorAll(".js-stream-item:not(.hide-elements-now)")
      
      if (els && els.length>=20) {
        forceReload();
        window.setTimeout(reloadIfNeeded, 300);
      } else {
        window.setTimeout(reloadIfNeeded, 1000);
      }
    }
    window.setTimeout(reloadIfNeeded, 300);
  }
  hide.init = true;
  doHides();
}, 100, {leading: false});

$(document).ready(function() {
  chrome.storage.local.set({count: 0});
  setTimeout(doHideInit(), 0);

  var observer = new MutationObserver(function(mutations) {
    doHides();
  });

  observer.observe(document, {
    attributes: true,
    childList: true, 
    characterData: true, 
    subtree:true
     //,attributeOldValue: true,
    //characterDataOldValue: true 
  });
  
  chrome.storage.local.get("cash", function(ret) {
    if (typeof ret.cash==='undefined') 
      hide.cash = true;
    else 
      hide.cash = !!ret.cash;
    doHideInit();
  })
  chrome.storage.local.get("telegram", function(ret) {
    if (typeof ret.telegram==='undefined') 
      hide.telegram = true;
    else 
      hide.telegram = !!ret.telegram;
    doHideInit();
  })
  chrome.storage.local.get("debug", function(ret) {
    hide.debug = !!ret.debug;
    doHideInit();
  });
  chrome.storage.local.get("cashNum", function(ret) {
    hide.cashNum = parseInt(ret.cashNum) || 3; 
    doHideInit();
  })


  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (typeof changes.cash!=='undefined')
      hide.cash = changes.cash.newValue; 
    if (typeof changes.telegram!=='undefined')
      hide.telegram = changes.telegram.newValue; 
    if (typeof changes.debug!=='undefined')
      hide.debug = changes.debug.newValue; 
    if (typeof changes.cashNum!=='undefined')
      hide.cashNum = parseInt(changes.cashNum.newValue) || 3; 

    if (changes.cash && changes.cash.newValue!=changes.cash.oldValue
        || changes.cashNum && changes.cashNum.newValue!=changes.cashNum.oldValue
        || changes.telegram && changes.telegram.newValue!=changes.telegram.oldValue
        ) {
      location.reload();
      doHides();
    }
  });

});
