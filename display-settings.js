(function () {
  'use strict';

  var KEYS = {
    text: 'displayTextColor',
    bg: 'displayBgColor',
    font: 'displayFont',
    size: 'displayFontSize'
  };

  var FONT_OPTIONS = [
    { label: 'default', value: '' },
    { label: 'serif', value: "Georgia, 'Times New Roman', Times, serif" },
    { label: 'system sans', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    { label: 'monospace', value: "'IBM Plex Mono', 'SF Mono', monospace" },
    { label: 'easy-read', value: "'Comic Sans MS', 'Comic Sans', cursive, sans-serif" }
  ];

  function readSaved() {
    return {
      text: localStorage.getItem(KEYS.text) || '',
      bg: localStorage.getItem(KEYS.bg) || '',
      font: localStorage.getItem(KEYS.font) || '',
      size: localStorage.getItem(KEYS.size) || ''
    };
  }

  function apply(settings) {
    var root = document.documentElement;
    if (settings.text) root.style.setProperty('--text', settings.text); else root.style.removeProperty('--text');
    if (settings.bg) root.style.setProperty('--bg', settings.bg); else root.style.removeProperty('--bg');
    if (settings.font) root.style.setProperty('--font-body', settings.font); else root.style.removeProperty('--font-body');
    root.style.fontSize = settings.size ? settings.size + '%' : '';
  }

  function save(settings) {
    Object.keys(KEYS).forEach(function (k) {
      var v = settings[k];
      if (v) localStorage.setItem(KEYS[k], v); else localStorage.removeItem(KEYS[k]);
    });
  }

  function getComputedColor(varName) {
    var val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val) ? val : '#000000';
  }

  // Apply immediately in case this script loads after first paint (the pre-paint <head>
  // snippet on each page handles the common case; this is a fallback / handles late loads).
  apply(readSaved());

  function field(labelText, controlEl) {
    var wrap = document.createElement('label');
    wrap.className = 'display-field';
    var span = document.createElement('span');
    span.textContent = labelText;
    wrap.appendChild(span);
    wrap.appendChild(controlEl);
    return wrap;
  }

  function buildUI() {
    var topbar = document.querySelector('.topbar');
    var themeToggle = topbar && topbar.querySelector('.theme-toggle');
    if (!topbar || !themeToggle) return;

    var current = readSaved();

    var rightGroup = document.createElement('div');
    rightGroup.className = 'topbar-right';
    themeToggle.parentNode.insertBefore(rightGroup, themeToggle);

    var wrap = document.createElement('div');
    wrap.className = 'display-settings';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'display-btn';
    btn.setAttribute('aria-label', 'Display settings');
    btn.title = 'Display settings — text color, background, font, size';
    var label = document.createElement('span');
    label.className = 'display-btn-label';
    label.textContent = 'Aa';
    btn.appendChild(label);

    var panel = document.createElement('div');
    panel.className = 'display-panel';
    panel.hidden = true;

    var textColorInput = document.createElement('input');
    textColorInput.type = 'color';
    textColorInput.value = current.text || getComputedColor('--text');

    var bgColorInput = document.createElement('input');
    bgColorInput.type = 'color';
    bgColorInput.value = current.bg || getComputedColor('--bg');

    var fontSelect = document.createElement('select');
    FONT_OPTIONS.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === current.font) o.selected = true;
      fontSelect.appendChild(o);
    });

    var sizeRow = document.createElement('div');
    sizeRow.className = 'display-field-row';
    var sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.min = '80';
    sizeInput.max = '160';
    sizeInput.step = '5';
    sizeInput.value = current.size || '100';
    var sizeReadout = document.createElement('span');
    sizeReadout.className = 'display-size-readout';
    sizeReadout.textContent = (current.size || '100') + '%';
    sizeRow.appendChild(sizeInput);
    sizeRow.appendChild(sizeReadout);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'display-reset-btn';
    resetBtn.textContent = 'reset to default';

    panel.appendChild(field('text color', textColorInput));
    panel.appendChild(field('background color', bgColorInput));
    panel.appendChild(field('font', fontSelect));
    panel.appendChild(field('text size', sizeRow));
    panel.appendChild(resetBtn);

    function currentFromInputs() {
      return { text: textColorInput.value, bg: bgColorInput.value, font: fontSelect.value, size: sizeInput.value };
    }

    function update() {
      var settings = currentFromInputs();
      apply(settings);
      save(settings);
      sizeReadout.textContent = settings.size + '%';
    }

    textColorInput.addEventListener('input', update);
    bgColorInput.addEventListener('input', update);
    fontSelect.addEventListener('change', update);
    sizeInput.addEventListener('input', update);

    resetBtn.addEventListener('click', function () {
      Object.keys(KEYS).forEach(function (k) { localStorage.removeItem(KEYS[k]); });
      apply({});
      textColorInput.value = getComputedColor('--text');
      bgColorInput.value = getComputedColor('--bg');
      fontSelect.value = '';
      sizeInput.value = '100';
      sizeReadout.textContent = '100%';
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      btn.classList.toggle('active', !panel.hidden);
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target) && !panel.hidden) {
        panel.hidden = true;
        btn.classList.remove('active');
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    rightGroup.appendChild(wrap);
    rightGroup.appendChild(themeToggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();
