goog.provide('munimap.interaction');

goog.require('munimap.lang');

/**
 * @param {ol.Map} map
 * @param {Element} target
 */
munimap.interaction.limitScroll = function (map, target) {
  goog.dom.setFocusableTabIndex(target, true);
  target.setAttribute("tabindex", 0);

  window.document.addEventListener('blur', activeChange, true);
  window.document.addEventListener('focus', activeChange, true);

  target.addEventListener('wheel', onInteraction, true);
  target.addEventListener('touchmove', onInteraction, true);

  var dragEl = goog.dom.createDom("div", "munimap-drag");
  goog.dom.appendChild(target, dragEl);
  function activeChange(e) {
    if (target.contains(window.document.activeElement)) {
      goog.dom.removeNode(dragEl);
      dragEl = null;
      error = false;
      map.render();
    }
    else if (!target.contains(window.document.activeElement) && dragEl === null) {
      dragEl = goog.dom.createDom("div", "munimap-drag");
      goog.dom.appendChild(target, dragEl);
    }
  }

  var canvas = target.getElementsByTagName('CANVAS')[0];
  var hideError;
  var error = false;
  function createError() {
    if(dragEl === null) {
      return;
    }
    var dpr = window.devicePixelRatio || 1;
    var ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    var lineHeight;
    if (canvas.offsetWidth < 500) {
      var size = 22 * dpr;
      ctx.font = size + 'px Arial';
      lineHeight = 26 * dpr;
    } else {
      var size = 30 * dpr;
      ctx.font = size + 'px Arial';
      lineHeight = 35 * dpr;
    }
    
    var text =
      munimap.lang.getMsg(munimap.lang.Translations.SCROLL_HINT);
    var lines = text.split('\n');
    lines.forEach(function (el, i) {
      
      ctx.fillText(
        el,
        canvas.width / 2,
        (canvas.height / 2) + i * lineHeight
      )
    });
  }

  function hide() {
    return setTimeout(function () {
      error = false;
      map.render();
    }, 2000);
  }

  function onInteraction(e) {
    if (!error) {
      createError();
      hideError = hide();
    } else {
      clearTimeout(hideError);
      hideError = hide();
    }
    error = true;
  }

  map.on('postcompose', function (evt) {
    clearTimeout(hideError);
    error = false;
  });
};
