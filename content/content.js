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
      //console.log(jq, hide)
      if (hide.debug) {
        //console.log("Debugging");
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

//function action(jq, unhide) {
//  var newCount = jq.length;
//  if (jq.length) {
//    //console.log(jq, hide)
//    if (hide.debug) {
//      //console.log("Debugging");
//      jq.css('background-color', 'aqua')
//    } else {
//      //console.log('hide')
//      //if(unhide) {
//      //  //hide.allTimeCount = hide.allTimeCount-hide.count+newCount;
//      //  //hide.count = 0;
//      //  jq.show()
//      //} else {
//        //jq.remove()
//      //jq.find('.content').hide();
//      jq.hide();
//      jq.addClass('hide-elements-now');
//      //}
//    }
//  } 
//  if (!unhide) {
//    hide.allTimeCount += newCount;
//    hide.count += newCount;
//    chrome.storage.local.set({allTimeCount: hide.allTimeCount, count: hide.count});
//  }
//}
function genDolRegex() {
  var reg = '\\$'
  var i;
  for (i=0;i<hide.cashNum;i++) {
    reg += '(.|[\\r\\n])*\\$';
  }
  return new RegExp(reg, 'gm');
}

//function filterElsJquery(dolReg, limitTextSearch) {
//  return function () {
//      var ret = false;
//      var text = null;
//      if (limitTextSearch) {
//        text = $(this).find(limitTextSearch).text();
//      } else {
//        text = $(this).text();
//      }
//      if (hide.cash && dolReg.test(text))
//        ret = true ; 
//
//      if (hide.telegram && /t\.me/gi.test(text))
//        ret = true
//
//      //if (ret) console.log("Not Filtered", ret, text.substring(0, 250))
//      return ret;
//    }
//}

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

      //console.log(ret, /t\.me/gi.test(text), dolReg.test(text), text);
      //if (ret) {
      //  el.style.display = 'none';
      //  el.classList.add('hide-elements-now');
      //}
      //console.log("Not Filtered", ret, text, el)
      return ret;
    }
}
function doHidesRaw() {
  if (hide.init) {
    //console.log("DoHidesRaw-Start");
    //var s = new Date()
    //console.log("doHidesRaw");
    var dolReg = genDolRegex();
    //console.log(dolReg);
    //action($('.js-stream-item:contains(t.me)'))
    
    let els = document.querySelectorAll(".js-stream-item:not(.hide-elements-now)");
    els = _.filter(els, filterEls(dolReg, '.js-tweet-text'));
    actionEls(els);   
    //action($(".js-stream-item:not(.hide-elements-now)").filter(filterElsJquery(dolReg, '.js-tweet-text')), false)
    //console.log("DoHidesRaw-End", (new Date()).getTime() - s.getTime());
  }
}

//function doShows() {
//  if (hide.init) {
//    var dolReg = genDolRegex();
//    //console.log(dolReg);
//      //action($('.js-stream-item:contains(t.me)'))
//    action($(".js-stream-item").filter(function () {
//      var ret = false;
//      var text = $(this).find('.js-tweet-text').text();
//      if (!hide.cash && dolReg.test(text))
//        ret = true ; 
//
//      if (!hide.telegram && /t\.me/gi.test(text))
//        ret = true
//
//      return ret;
//    }), true)
//  }
//}

//var doHides = doHidesRaw;//_.throttle(doHidesRaw, 100);
var doHides = _.throttle(doHidesRaw, 100);

var forceReload = _.throttle(function() {
  $('.try-again-after-whale')[0].click()
}, 100);


var doHideInit = _.throttle(function() {
  if (!hide.init) {
    $(window).scroll(function() {
      if (hide.cash || hide.telegram) {
        if((Math.ceil($(window).scrollTop()) + $(window).height()) >= ($(document).height())) {
          //console.log("Scrolled to bottom");
          forceReload();
        }
      }
    });
  }
  hide.init = true;
  doHides();
}, 100, {leading: false});

$(document).ready(function() {
  chrome.storage.local.set({count: 0});
  setTimeout(doHideInit(), 0);

  var observer = new MutationObserver(function(mutations) {
    //mutations.forEach(function(m) {
    //  if (m.addedNodes && m.addedNodes.length>0) {
    //    var dolReg = genDolRegex();
    //    console.log('observe2', m.addedNodes[0], $(m.addedNodes).find('.js-stream-item').length, m.type, $(m.addedNodes).filter(filterEls(dolReg)));
    //    //action($(".js-stream-item:not(.hide-elements-now)").filter(filterEls(dolReg)), false)
    //    //m.addedNodes.forEach(function() {

    //    //})
    //  }
    //});
    //let shouldDoHides = false;
    //mutations.forEach(function(mutation) {
    //    //console.log(mutation)
    //    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
    //        // element added to DOM
    //        var hasClass = [].some.call(mutation.addedNodes, function(el) {
    //            return el.classList?el.classList.contains('js-stream-item'):false
    //        });
    //        if (hasClass) {
    //          shouldDoHides = true;
    //            // element has class `MyClass`
    //            console.log('element ".js-stream-item" added');
    //        }
    //    }
    //});
    
    //var dolReg = genDolRegex();
    //console.log("Test", $(_.pluck(mutations, 'target')), $(_.pluck(mutations, 'target')).filter(filterEls(dolReg)));
    //if (shouldDoHides) {
      doHides();
      //doHides();
    //} else {
    //  console.log(mutations);
    //}
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
      //doShows();
      location.reload();
      doHides();
    }
  });

});
