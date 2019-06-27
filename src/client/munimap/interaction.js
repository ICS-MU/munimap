goog.provide('munimap.interaction');

goog.require('munimap.lang');

/**
 * @param {Element|null} canvas
 * @param {string} message
 */
munimap.interaction.createCanvas = function(canvas, message) {

  var dpr = window.devicePixelRatio || 1;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  var lineHeight;
  var size;
  if (canvas.offsetWidth < 500) {
    size = 22 * dpr;
    ctx.font = size + 'px Arial';
    lineHeight = 26 * dpr;
  } else {
    size = 30 * dpr;
    ctx.font = size + 'px Arial';
    lineHeight = 35 * dpr;
  }

  var text =
            munimap.lang.getMsg(message);
  var lines = text.split('\n');
  lines.forEach(function(el, i) {

    ctx.fillText(
      el,
      canvas.width / 2,
      (canvas.height / 2) + i * lineHeight
    );
  });
};

/**
 * @param {ol.Map} map
 * @param {Element} target
 */
munimap.interaction.limitScroll = function(map, target) {
  goog.dom.setFocusableTabIndex(target, true);
  target.setAttribute('tabindex', 0);

  window.document.addEventListener('blur', activeChange, true);
  window.document.addEventListener('focus', activeChange, true);

  target.addEventListener('wheel', onInteraction, true);
  target.addEventListener('touchmove', onInteraction, true);

  var dragEl = goog.dom.createDom('div', 'munimap-drag');
  goog.dom.appendChild(target, dragEl);
  function activeChange(e) {
    if (target.contains(window.document.activeElement)) {
      goog.dom.removeNode(dragEl);
      dragEl = null;
      error = false;
      map.render();
    } else if (!target.contains(window.document.activeElement) &&
      dragEl === null) {
      dragEl = goog.dom.createDom('div', 'munimap-drag');
      goog.dom.appendChild(target, dragEl);
    }
  }

  var canvas = target.getElementsByTagName('CANVAS')[0];
  var hideError;
  var error = false;
  function createError() {
    if (dragEl === null) {
      return;
    }
    munimap.interaction.createCanvas(canvas,
      munimap.lang.getMsg(munimap.lang.Translations.ACTIVATE_MAP));
  }

  function hide() {
    return setTimeout(function() {
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

  map.on('postcompose', function(evt) {
    clearTimeout(hideError);
    error = false;
  });
};

/**
 * @param {ol.Map} map
 * @param {Element} target
 * @param {Array.<ol.Feature>} codes
 */
munimap.interaction.invalidCode = function(map, target, codes) {
  var invalidCodes = codes;
  goog.dom.setFocusableTabIndex(target, true);
  target.setAttribute('tabindex', 0);

  window.document.addEventListener('blur', activeChange, true);
  window.document.addEventListener('focus', activeChange, true);

  var dragEl = goog.dom.createDom('div', 'munimap-error');
  var acCount = 0;
  goog.dom.appendChild(target, dragEl);
  function activeChange(e) {

    if (target.contains(window.document.activeElement)) {
      goog.dom.removeNode(dragEl);
      var infoEl = munimap.getProps(map).info;
      goog.dom.classlist.remove(infoEl, 'munimap-info-hide');
      //dragEl = null;
      map.render();
      acCount++;
    } else if (!target.contains(window.document.activeElement) &&
      dragEl === null) {
      dragEl = goog.dom.createDom('div', 'munimap-error');
      goog.dom.appendChild(target, dragEl);
      acCount++;
    }
  }

  var canvas = target.getElementsByTagName('CANVAS')[0];
  function createError() {
    if (dragEl === null) {
      return;
    }
    munimap.interaction.createCanvas(canvas,
      (munimap.lang.getMsg(munimap.lang.Translations.ACTIVATE_MAP) + '\n' +
     munimap.lang.getMsg(munimap.lang.Translations.NOT_FOUND) + ':\n' +
     invalidCodes.join(', ')));
  }

  map.on('postcompose', function(evt) {
    if (acCount === 0) {
      createError();
    }

  });
};
