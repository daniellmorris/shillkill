var hide = {
  cash: false,
  cashNum: 3,
  telegram: false,
  debug: false,
  count: 0,
  allTimeCount: 0
}

function action(jq, unhide) {
  var newCount = jq.length;
  if (jq.length) {
    //console.log(jq, hide)
    if (hide.debug) {
      //console.log("Debugging");
      jq.css('background-color', 'aqua')
    } else {
      //console.log('hide')
      //if(unhide) {
      //  //hide.allTimeCount = hide.allTimeCount-hide.count+newCount;
      //  //hide.count = 0;
      //  jq.show()
      //} else {
        //jq.remove()
      //jq.find('.content').hide();
      jq.hide();
      jq.addClass('hide-elements-now');
      //}
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

function filterEls(dolReg) {
  return function () {
      var ret = false;
      var text = $(this).find('.js-tweet-text').text();
      if (hide.cash && dolReg.test(text))
        ret = true ; 

      if (hide.telegram && /t\.me/gi.test(text))
        ret = true

      return ret;
    }
}
function doHidesRaw() {
  if (hide.init) {
    //console.log("doHidesRaw");
    var dolReg = genDolRegex();
    //console.log(dolReg);
      //action($('.js-stream-item:contains(t.me)'))
    action($(".js-stream-item:not(.hide-elements-now)").filter(filterEls(dolReg)), false)
  }
}
function doShows() {
  if (hide.init) {
    var dolReg = genDolRegex();
    //console.log(dolReg);
      //action($('.js-stream-item:contains(t.me)'))
    action($(".js-stream-item").filter(function () {
      var ret = false;
      var text = $(this).find('.js-tweet-text').text();
      if (!hide.cash && dolReg.test(text))
        ret = true ; 

      if (!hide.telegram && /t\.me/gi.test(text))
        ret = true

      return ret;
    }), true)
  }
}

var doHides = doHidesRaw//_.throttle(doHidesRaw, 100, {leading: false});

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
    doHides();
  });

  observer.observe(document, {attributes: true, childList: true, characterData: false, subtree:true});
  
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
