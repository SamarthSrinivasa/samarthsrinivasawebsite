(function () {
  'use strict';

  var STORAGE_KEY = 'displayPalette';

  // Each palette carries its own light and dark pair so switching day/night mode
  // still lands on a coherent, readable combination instead of a flat fixed color.
  var PALETTES = [
    { id: 'sage', label: 'default', light: { bg: '#F1F3EE', text: '#16211B' }, dark: { bg: '#10150F', text: '#ECEFE8' } },
    { id: 'ocean', label: 'ocean', light: { bg: '#EAF2F5', text: '#0F2733' }, dark: { bg: '#0B161C', text: '#DCEBF0' } },
    { id: 'sand', label: 'sand', light: { bg: '#F6F1E7', text: '#2B2117' }, dark: { bg: '#17130D', text: '#F0E6D2' } },
    { id: 'rose', label: 'rose', light: { bg: '#F7EEF0', text: '#2E1620' }, dark: { bg: '#180D11', text: '#F2E1E6' } },
    { id: 'violet', label: 'violet', light: { bg: '#F1EEF6', text: '#201A2B' }, dark: { bg: '#120E18', text: '#E7E1F0' } },
    { id: 'slate', label: 'slate', light: { bg: '#EEF0F2', text: '#1B1F24' }, dark: { bg: '#0E1013', text: '#E7E9EC' } }
  ];

  function resolvedTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function getSelected() {
    return localStorage.getItem(STORAGE_KEY) || 'sage';
  }

  function findPalette(id) {
    for (var i = 0; i < PALETTES.length; i++) {
      if (PALETTES[i].id === id) return PALETTES[i];
    }
    return PALETTES[0];
  }

  function apply(paletteId) {
    var root = document.documentElement;
    if (paletteId === 'sage') {
      root.style.removeProperty('--text');
      root.style.removeProperty('--bg');
      return;
    }
    var pair = findPalette(paletteId)[resolvedTheme()];
    root.style.setProperty('--text', pair.text);
    root.style.setProperty('--bg', pair.bg);
  }

  // This file is loaded synchronously in <head>, before first paint, so applying
  // here immediately (rather than waiting for DOMContentLoaded) avoids any flash.
  apply(getSelected());

  // Re-apply whenever light/dark mode changes (theme toggle click, or the OS
  // flipping prefers-color-scheme while on "system"), so the palette's dark pair
  // takes over instead of the light pair looking wrong against a dark page.
  new MutationObserver(function () { apply(getSelected()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function buildUI() {
    var topbar = document.querySelector('.topbar');
    var themeToggle = topbar && topbar.querySelector('.theme-toggle');
    if (!topbar || !themeToggle) return;

    var rightGroup = document.createElement('div');
    rightGroup.className = 'topbar-right';
    themeToggle.parentNode.insertBefore(rightGroup, themeToggle);

    var wrap = document.createElement('div');
    wrap.className = 'display-settings';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'display-btn';
    btn.setAttribute('aria-label', 'Color theme');
    btn.title = 'Color theme';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="9" cy="9.3" r="1.5" fill="currentColor"/>' +
      '<circle cx="15.2" cy="9" r="1.5" fill="currentColor"/>' +
      '<circle cx="16.2" cy="14.6" r="1.5" fill="currentColor"/>' +
      '<circle cx="10.2" cy="15.4" r="1.5" fill="currentColor"/>' +
      '</svg>';

    var panel = document.createElement('div');
    panel.className = 'display-panel';
    panel.hidden = true;

    var swatchRow = document.createElement('div');
    swatchRow.className = 'swatch-row';
    panel.appendChild(swatchRow);

    var selected = getSelected();
    var swatches = [];

    PALETTES.forEach(function (palette) {
      var sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'palette-swatch' + (palette.id === selected ? ' active' : '');
      sw.title = palette.label;
      sw.setAttribute('aria-label', palette.label);

      var dot = document.createElement('span');
      dot.className = 'palette-swatch-dot';
      sw.appendChild(dot);

      sw.addEventListener('click', function () {
        localStorage.setItem(STORAGE_KEY, palette.id);
        apply(palette.id);
        swatches.forEach(function (s) { s.el.classList.toggle('active', s.palette.id === palette.id); });
      });

      swatches.push({ el: sw, dot: dot, palette: palette });
      swatchRow.appendChild(sw);
    });

    function repaintSwatches() {
      swatches.forEach(function (s) {
        var pair = s.palette[resolvedTheme()];
        s.el.style.background = pair.bg;
        s.dot.style.background = pair.text;
      });
    }
    repaintSwatches();
    new MutationObserver(repaintSwatches)
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

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
