/* Lattiz Motion v2 — section choreography plus the v1 data-lz-* behaviors, published Pro sites only.
 * Contract: docs/lattiz-motion.md. Inert without this script (editor, Básico).
 * Rules: one IntersectionObserver per page, sections are the triggers; transform/opacity only
 * (clip-path for media masks); never hide above-the-fold content; respect prefers-reduced-motion;
 * every module is isolated in its own try/catch. */
(function () {
  'use strict';
  if (window.__lzMotion) return;
  window.__lzMotion = 2;
  var doc = document;
  var root = doc.documentElement;
  root.classList.add('lz-js');

  var reduced =
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var config = doc.querySelector('[data-lz-motion]');
  var preset = (config && config.getAttribute('data-lz-motion')) || 'calm';
  // `none` and reduced motion keep everything static; functional widgets still run.
  var still = reduced || preset === 'none';
  var hasIO = 'IntersectionObserver' in window;
  var FAILSAFE_MS = 2500;
  var MAX_STEP = 8;
  var MAX_WORDS = 16;
  var vh = window.innerHeight || root.clientHeight;

  function all(selector, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(selector));
  }
  function num(value, fallback) {
    var n = parseFloat(value);
    return isFinite(n) ? n : fallback;
  }
  function safe(name, fn) {
    try {
      fn();
    } catch (error) {
      if (window.console) console.warn('[lz-motion] ' + name, error);
    }
  }
  function inFirstViewport(rect) {
    return rect.top < vh && rect.bottom > 0;
  }
  function clips(el) {
    return !!el && getComputedStyle(el).overflow !== 'visible';
  }
  /** True when scaling the image can't spill over its neighbours. */
  function framed(img) {
    if (clips(img.parentElement)) return true;
    return getComputedStyle(img).position === 'absolute' && clips(img.offsetParent);
  }

  // ── One IntersectionObserver for the whole page ──
  var watchers = new Map();
  var reported = false;
  var io = hasIO
    ? new IntersectionObserver(
        function (entries) {
          reported = true;
          for (var i = 0; i < entries.length; i++) {
            var target = entries[i].target;
            var fn = watchers.get(target);
            if (fn && fn(entries[i].isIntersecting)) {
              watchers.delete(target);
              io.unobserve(target);
            }
          }
        },
        { rootMargin: '0px 0px -12% 0px' }
      )
    : null;
  /** fn(inView) runs on every change; returning true stops watching. */
  function watch(el, fn) {
    if (!io) return fn(true);
    watchers.set(el, fn);
    io.observe(el);
  }
  function once(el, fn) {
    watch(el, function (inView) {
      if (inView) fn();
      return inView;
    });
  }

  // ── Counters (v1 module; also derived from numeric text in stats sections) ──
  var NUMERIC = /^([^\d\s]{0,3})\s?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(\s?[^\d]{0,12})$/;
  function counterFrom(el) {
    if (el.hasAttribute('data-lz-counter')) {
      var raw = el.getAttribute('data-lz-counter') || '0';
      return {
        target: num(raw, 0),
        decimals: (raw.split('.')[1] || '').length,
        prefix: el.getAttribute('data-lz-prefix') || '',
        suffix: el.getAttribute('data-lz-suffix') || '',
      };
    }
    if (el.children.length) return null;
    var m = NUMERIC.exec(el.textContent.trim());
    if (!m) return null;
    var target = parseFloat(m[2].replace(/,/g, '') + (m[3] || ''));
    // A bare year ("2015") is a date, not a quantity.
    if (/^(19|20)\d\d$/.test(m[2]) && !m[3]) return null;
    return target > 0
      ? { target: target, decimals: m[3] ? m[3].length - 1 : 0, prefix: m[1], suffix: m[4] }
      : null;
  }
  function formatCounter(c, value) {
    return (
      c.prefix +
      value.toLocaleString('es-MX', {
        minimumFractionDigits: c.decimals,
        maximumFractionDigits: c.decimals,
      }) +
      c.suffix
    );
  }
  function runCounter(el, c) {
    if (el.__lzCounted) return;
    el.__lzCounted = true;
    var start = null;
    var duration = num(el.getAttribute('data-lz-duration'), 1600);
    var tick = function (now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      el.textContent = formatCounter(c, c.target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Choreography: read everything first, then write once ──
  var KINDS = { 'fade-up': 'rise', fade: 'fade', zoom: 'zoom', 'slide-left': 'left', 'slide-right': 'right' };
  var TYPES = { hero: 1, text: 1, cards: 1, gallery: 1, stats: 1, cta: 1, footer: 1 };
  var BLOCK = /^(H[1-6]|P|BLOCKQUOTE|DL|DT|DD|FIGCAPTION|SUMMARY|LI|TABLE|ADDRESS)$/;
  var MEDIA = /^(IMG|PICTURE|VIDEO|IFRAME)$/;
  var SKIP = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|BR)$/;

  function kindOf(el, fallback) {
    return KINDS[el.getAttribute('data-lz-reveal')] || fallback;
  }
  function isButton(el) {
    return (
      el.tagName === 'BUTTON' ||
      el.getAttribute('role') === 'button' ||
      (el.tagName === 'A' && /button|btn/.test(el.className))
    );
  }
  function signature(el) {
    return el.tagName + '.' + (el.classList[0] || '');
  }
  /** ≥ 3 children that look alike (one odd sibling allowed): cards, rows, list items. */
  function isGroup(el) {
    var kids = el.children;
    if (kids.length < 3) return false;
    var sig = signature(kids[1]);
    var same = 0;
    for (var i = 0; i < kids.length; i++) if (signature(kids[i]) === sig) same++;
    return same >= 3 && same >= kids.length - 1;
  }
  /** Row index per item (same top = same row), so grids cascade by row and lists by item. */
  function rows(items) {
    var out = [];
    var row = -1;
    var lastTop = null;
    for (var i = 0; i < items.length; i++) {
      var top = Math.round(items[i].getBoundingClientRect().top);
      if (lastTop === null || Math.abs(top - lastTop) > 4) row++;
      lastTop = top;
      out.push(row);
    }
    return out;
  }

  /**
   * Walks one section in document order. `i` is the cascade slot (stagger token apart),
   * `j` a position inside a slot (word or v1 stagger child, `step` apart).
   */
  function collectSection(sec, type) {
    var targets = [];
    var at = 0;
    var heroArea = 0;
    var heroTitle = null;

    function add(el, fx, i, extra) {
      var t = { el: el, fx: fx, i: i, j: 0 };
      for (var k in extra) t[k] = extra[k];
      targets.push(t);
      return t;
    }
    function group(items, fx) {
      var r = rows(items);
      for (var i = 0; i < items.length; i++) {
        if (items[i].getAttribute('data-lz-reveal') !== 'none') add(items[i], kindOf(items[i], fx), at + r[i]);
      }
      at += r.length ? r[r.length - 1] + 1 : 0;
    }

    (function walk(node) {
      for (var c = node.firstElementChild; c; c = c.nextElementSibling) {
        if (SKIP.test(c.tagName) || c.getAttribute('data-lz-reveal') === 'none') continue;
        // v1 attributes inside a v2 section are overrides played by the section's trigger.
        if (c.hasAttribute('data-lz-stagger')) {
          var step = num(c.getAttribute('data-lz-stagger'), 90);
          var kind = kindOf(c, 'rise');
          Array.prototype.slice.call(c.children).forEach(function (child, k) {
            add(child, kindOf(child, kind), at, { j: k, step: step });
          });
          at++;
        } else if (c.hasAttribute('data-lz-words')) {
          add(c, 'words', at++, { step: num(c.getAttribute('data-lz-words'), 0) || null });
        } else if (c.hasAttribute('data-lz-reveal')) {
          add(c, kindOf(c, 'rise'), at++, {
            delay: c.getAttribute('data-lz-delay'),
            dur: c.getAttribute('data-lz-duration'),
          });
        } else if (MEDIA.test(c.tagName)) {
          if (type === 'hero') {
            var rect = c.getBoundingClientRect();
            heroArea = Math.max(heroArea, rect.width * rect.height);
            var frame = framed(c);
            add(c, frame ? 'settle-lg' : 'settle', 0, { px: frame });
          } else {
            add(c, 'mask', at++, { zoom: type === 'gallery' && framed(c) });
          }
        } else if (isButton(c)) {
          add(c, 'rise', at++);
        } else if (type !== 'footer' && isGroup(c)) {
          group(Array.prototype.slice.call(c.children), type === 'gallery' ? 'mask' : 'rise');
        } else if (BLOCK.test(c.tagName) || (!c.children.length && c.textContent.trim())) {
          if (type === 'hero' && c.tagName === 'H1') {
            heroTitle = add(c, 'words', at++);
          } else {
            var counter = (type === 'stats' || c.hasAttribute('data-lz-counter')) && counterFrom(c);
            add(c, 'rise', at++, counter ? { counter: counter } : null);
          }
        } else {
          walk(c);
        }
      }
    })(sec);

    // LCP guard: a headline bigger than the hero image moves but never starts transparent.
    if (heroTitle) {
      var box = heroTitle.el.getBoundingClientRect();
      if (box.width * box.height >= heroArea) heroTitle.shift = true;
    }
    if (type === 'footer') {
      for (var i = 0; i < targets.length; i++) {
        targets[i].fx = 'fade';
        targets[i].i = 0;
      }
    }
    return targets;
  }

  /** Splits text into word spans (inline markup survives) and returns one target per word. */
  function splitWords(t) {
    var words = [];
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) return split(child);
        if (child.nodeType !== 3 || !child.textContent.trim()) return;
        var frag = doc.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(doc.createTextNode(part));
          var span = doc.createElement('span');
          span.className = 'lz-word';
          span.textContent = part;
          frag.appendChild(span);
          words.push(span);
        });
        child.parentNode.replaceChild(frag, child);
      });
    })(t.el);
    return words.map(function (span, k) {
      return { el: span, fx: t.shift ? 'word-shift' : 'word', i: t.i, j: k, step: t.step };
    });
  }

  /** Write pass for one target; returns the targets that end up in the DOM. */
  function apply(t) {
    if (t.fx === 'words') return splitWords(t).map(apply).map(function (list) { return list[0]; });
    var el = t.el;
    var s = el.style;
    el.classList.add('lz-t');
    el.setAttribute('data-lz-fx', t.fx);
    if (t.step) s.setProperty('--lz-step', t.step + 'ms');
    if (t.delay) s.setProperty('--lz-delay', num(t.delay, 0) + 'ms');
    if (t.dur) s.setProperty('--lz-d', num(t.dur, 700) + 'ms');
    if (t.px) el.classList.add('lz-px');
    if (t.zoom) el.classList.add('lz-zoom');
    if (t.counter) {
      el.__lzOwned = true;
      if (!t.now) el.textContent = formatCounter(t.counter, 0);
    }
    return [t];
  }

  function go(t, i, j) {
    t.gone = true;
    t.el.style.setProperty('--lz-i', String(Math.min(i, MAX_STEP)));
    t.el.style.setProperty('--lz-j', String(Math.min(j, MAX_WORDS)));
    t.el.classList.add('lz-go');
    if (t.counter) runCounter(t.el, t.counter);
  }

  /**
   * Plays what is in view now, cascading from index 0, and leaves the rest for when it
   * scrolls in: one deferred anchor per trigger, watched by the same observer.
   */
  function play(list) {
    var now = [];
    var later = [];
    var minI = Infinity;
    var minJ = {};
    for (var k = 0; k < list.length; k++) {
      var r = list[k].el.getBoundingClientRect();
      var entry = { t: list[k], top: r.top, past: r.bottom <= 0 };
      if (r.top >= vh * 0.88) later.push(entry);
      else {
        now.push(entry);
        if (!entry.past) {
          minI = Math.min(minI, list[k].i);
          minJ[list[k].i] = Math.min(minJ[list[k].i] === undefined ? Infinity : minJ[list[k].i], list[k].j);
        }
      }
    }
    now.forEach(function (e) {
      go(e.t, e.past ? 0 : e.t.i - minI, e.past ? 0 : e.t.j - minJ[e.t.i]);
    });
    if (!later.length) return;
    var anchor = later[0];
    later.forEach(function (e) {
      if (e.top < anchor.top) anchor = e;
    });
    once(anchor.t.el, function () {
      play(later.map(function (e) { return e.t; }));
    });
  }

  var armed = [];
  function trigger(el, targets, now) {
    if (now) {
      el.classList.add('lz-in');
      return targets.forEach(function (t) { go(t, t.i, t.j); });
    }
    el.classList.add('lz-armed');
    armed.push(targets);
    once(el, function () {
      el.classList.add('lz-in');
      play(targets);
    });
  }
  function flatten(lists) {
    return [].concat.apply([], lists);
  }

  safe('sections', function () {
    if (still) return;
    var plans = [];
    all('[data-lz-section]').forEach(function (sec) {
      var type = sec.getAttribute('data-lz-section');
      if (type === 'none' || sec.getAttribute('data-lz-reveal') === 'none') return;
      if (!TYPES[type]) type = 'text';
      var visible = inFirstViewport(sec.getBoundingClientRect());
      // Above the fold only the hero plays (from first paint); anything else there stays static.
      if (visible && type !== 'hero') return;
      plans.push({
        el: sec,
        now: visible,
        drift: type === 'cta' && getComputedStyle(sec).position !== 'static',
        targets: collectSection(sec, type),
      });
    });
    plans.forEach(function (plan) {
      plan.targets.forEach(function (t) { t.now = plan.now; });
      var live = flatten(plan.targets.map(apply));
      if (plan.drift) plan.el.classList.add('lz-drift');
      trigger(plan.el, live, plan.now);
    });
  });

  // ── v1 attributes outside v2 sections: the outermost reveal is the trigger ──
  safe('legacy', function () {
    if (still) return;
    var groups = new Map();
    all('[data-lz-reveal],[data-lz-stagger],[data-lz-words],[data-lz-counter]').forEach(function (el) {
      if (el.closest('[data-lz-section]:not([data-lz-section="none"])')) return;
      if (el.getAttribute('data-lz-reveal') === 'none') return;
      var host = el;
      for (var p = el.parentElement; p; p = p.parentElement) {
        if (p.hasAttribute('data-lz-reveal') && p.getAttribute('data-lz-reveal') !== 'none') host = p;
      }
      if (!groups.has(host)) {
        groups.set(host, { visible: inFirstViewport(host.getBoundingClientRect()), targets: [] });
      }
      var g = groups.get(host);
      var slot = host === el ? 0 : 1;
      if (el.hasAttribute('data-lz-stagger')) {
        var step = num(el.getAttribute('data-lz-stagger'), 90);
        var kind = kindOf(el, 'rise');
        Array.prototype.slice.call(el.children).forEach(function (child, k) {
          g.targets.push({ el: child, fx: kindOf(child, kind), i: slot, j: k, step: step, dur: el.getAttribute('data-lz-duration') });
        });
      } else if (el.hasAttribute('data-lz-words')) {
        g.targets.push({ el: el, fx: 'words', i: slot, step: num(el.getAttribute('data-lz-words'), 45) || 45 });
      } else if (el.hasAttribute('data-lz-reveal')) {
        g.targets.push({ el: el, fx: kindOf(el, 'rise'), i: slot, j: 0, delay: el.getAttribute('data-lz-delay'), dur: el.getAttribute('data-lz-duration') });
      }
    });
    groups.forEach(function (g, host) {
      // v1 rule: elements in the first viewport are never hidden.
      if (g.visible || !g.targets.length) return;
      trigger(host, flatten(g.targets.map(apply)), false);
    });
  });

  // Counters no trigger above owns (e.g. inside a card) count when they themselves scroll in.
  safe('counter', function () {
    if (still) return;
    all('[data-lz-counter]').forEach(function (el) {
      if (el.__lzCounted || el.__lzOwned) return;
      var c = counterFrom(el);
      if (!c) return;
      if (inFirstViewport(el.getBoundingClientRect())) return runCounter(el, c);
      el.textContent = formatCounter(c, 0);
      once(el, function () {
        runCounter(el, c);
      });
    });
  });

  // Failsafe: nothing stays hidden if the observer never reports (broken IO, odd layouts).
  safe('failsafe', function () {
    if (!armed.length) return;
    setTimeout(function () {
      if (reported) return;
      flatten(armed).forEach(function (t) {
        if (!t.gone) go(t, 0, 0);
      });
    }, FAILSAFE_MS);
  });

  // will-change only while a target animates.
  safe('settle', function () {
    doc.addEventListener('animationend', function (e) {
      var el = e.target;
      if (el.classList && el.classList.contains('lz-t')) el.classList.add('lz-done');
    });
  });

  // ── Scroll-linked: CSS scroll timelines first; JS fallback gated by the observer ──
  var timelines = !!window.CSS && CSS.supports('animation-timeline: view()');
  safe('parallax', function () {
    if (still) return;
    var legacy = all('[data-lz-parallax]').map(function (el) {
      var factor = Math.max(-1, Math.min(1, num(el.getAttribute('data-lz-parallax'), 0.2)));
      el.style.setProperty('--lz-pf', String(factor));
      el.classList.add('lz-pv');
      return { el: el, factor: factor };
    });
    if (timelines || !io) return;
    var hero = all('.lz-px');
    if (!legacy.length && !hero.length) return;
    var live = 0;
    var listening = false;
    var queued = false;
    var update = function () {
      queued = false;
      for (var i = 0; i < legacy.length; i++) {
        var rect = legacy[i].el.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > 2 * vh) continue;
        var offset = rect.top + rect.height / 2 - vh / 2;
        legacy[i].el.style.transform = 'translate3d(0,' + (-offset * legacy[i].factor).toFixed(1) + 'px,0)';
      }
      for (var j = 0; j < hero.length; j++) {
        var box = hero[j].getBoundingClientRect();
        var progress = Math.max(0, Math.min(1, (vh - box.top) / (vh + box.height)));
        hero[j].style.translate = '0 ' + ((progress - 0.5) * 0.08 * box.height).toFixed(1) + 'px';
      }
    };
    var queue = function () {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    var listen = function (on) {
      if (on === listening) return;
      listening = on;
      window[on ? 'addEventListener' : 'removeEventListener']('scroll', queue, { passive: true });
    };
    hero.forEach(function (el) {
      el.style.scale = '1.1';
      var inView = false;
      watch(el, function (now) {
        if (now !== inView) live += now ? 1 : -1;
        inView = now;
        listen(live > 0 || legacy.length > 0);
        if (now) queue();
      });
    });
    // v1 parallax kept its always-on passive listener; only the v2 hero is observer-gated.
    if (legacy.length) listen(true);
    window.addEventListener('resize', queue);
    update();
  });

  safe('progress', function () {
    if (still || !config || !config.hasAttribute('data-lz-progress')) return;
    if (!window.CSS || !CSS.supports('animation-timeline: scroll()')) return;
    var bar = doc.createElement('div');
    bar.className = 'lz-progress';
    bar.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(bar);
  });

  // Header state from a sentinel, never from a scroll listener.
  safe('header', function () {
    var header = doc.querySelector('header, [data-lz-slot="navbar"]');
    if (!header || !io || !/sticky|fixed/.test(getComputedStyle(header).position)) return;
    header.classList.add('lz-header');
    var sentinel = doc.createElement('div');
    sentinel.className = 'lz-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(sentinel);
    watch(sentinel, function (inView) {
      root.classList.toggle('lz-scrolled', !inView);
    });
  });

  // ── Lightbox: keyboard accessible, ESC closes, focus trapped, focus restored ──
  safe('lightbox', function () {
    var groups = all('[data-lz-lightbox]').map(function (el) {
      return el.tagName === 'IMG' ? [el] : all('img', el);
    });
    if (!groups.length) return;
    var overlay, img, caption, closeBtn, prevBtn, nextBtn, current, index, opener;

    function build() {
      overlay = doc.createElement('div');
      overlay.className = 'lz-lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Imagen ampliada');
      overlay.innerHTML =
        '<button type="button" class="lz-lb-close" aria-label="Cerrar">&times;</button>' +
        '<button type="button" class="lz-lb-prev" aria-label="Anterior">&#8249;</button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button type="button" class="lz-lb-next" aria-label="Siguiente">&#8250;</button>';
      img = overlay.querySelector('img');
      caption = overlay.querySelector('figcaption');
      closeBtn = overlay.querySelector('.lz-lb-close');
      prevBtn = overlay.querySelector('.lz-lb-prev');
      nextBtn = overlay.querySelector('.lz-lb-next');
      closeBtn.addEventListener('click', close);
      prevBtn.addEventListener('click', function () { go(-1); });
      nextBtn.addEventListener('click', function () { go(1); });
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
      overlay.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') return close();
        if (e.key === 'ArrowLeft') return go(-1);
        if (e.key === 'ArrowRight') return go(1);
        if (e.key !== 'Tab') return;
        var focusables = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
        var at = focusables.indexOf(doc.activeElement);
        var next = (at + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
        e.preventDefault();
        focusables[next].focus();
      });
      doc.body.appendChild(overlay);
    }
    function render() {
      var source = current[index];
      img.src = source.getAttribute('data-lz-full') || source.currentSrc || source.src;
      img.alt = source.alt || '';
      caption.textContent = source.alt || '';
      var many = current.length > 1;
      prevBtn.hidden = !many;
      nextBtn.hidden = !many;
    }
    function go(delta) {
      if (current.length < 2) return;
      index = (index + delta + current.length) % current.length;
      render();
    }
    function open(group, i) {
      if (!overlay) build();
      opener = doc.activeElement;
      current = group;
      index = i;
      render();
      overlay.classList.add('lz-open');
      doc.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      overlay.classList.remove('lz-open');
      doc.body.style.overflow = '';
      if (opener && opener.focus) opener.focus();
    }
    groups.forEach(function (group) {
      group.forEach(function (el, i) {
        el.classList.add('lz-zoomable');
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        if (!el.hasAttribute('aria-label')) {
          el.setAttribute('aria-label', 'Ampliar imagen' + (el.alt ? ': ' + el.alt : ''));
        }
        el.addEventListener('click', function (e) {
          e.preventDefault();
          open(group, i);
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(group, i);
          }
        });
      });
    });
  });

  // ── Before/after: second image clipped over the first, driven by a range input ──
  safe('compare', function () {
    all('[data-lz-compare]').forEach(function (el) {
      var imgs = all('img', el);
      if (imgs.length < 2) return;
      el.classList.add('lz-compare');
      imgs[1].classList.add('lz-compare-after');
      var range = doc.createElement('input');
      range.type = 'range';
      range.min = '0';
      range.max = '100';
      range.value = el.getAttribute('data-lz-compare') || '50';
      range.className = 'lz-compare-range';
      range.setAttribute('aria-label', 'Comparar antes y después');
      var set = function () {
        el.style.setProperty('--lz-pos', range.value + '%');
      };
      range.addEventListener('input', set);
      el.appendChild(range);
      set();
    });
  });

  // ── Countdown ──
  safe('countdown', function () {
    all('[data-lz-countdown]').forEach(function (el) {
      var end = Date.parse(el.getAttribute('data-lz-countdown') || '');
      if (!isFinite(end)) return;
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var units = {};
      all('[data-lz-unit]', el).forEach(function (u) {
        units[u.getAttribute('data-lz-unit')] = u;
      });
      var timer;
      var tick = function () {
        var left = Math.max(0, Math.floor((end - Date.now()) / 1000));
        var d = Math.floor(left / 86400);
        var h = Math.floor((left % 86400) / 3600);
        var m = Math.floor((left % 3600) / 60);
        var s = left % 60;
        if (units.days || units.hours || units.minutes || units.seconds) {
          if (units.days) units.days.textContent = String(d);
          if (units.hours) units.hours.textContent = pad(h);
          if (units.minutes) units.minutes.textContent = pad(m);
          if (units.seconds) units.seconds.textContent = pad(s);
        } else {
          el.textContent = (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(s);
        }
        if (left === 0) {
          clearInterval(timer);
          el.classList.add('lz-expired');
          var text = el.getAttribute('data-lz-expired-text');
          if (text) el.textContent = text;
        }
      };
      tick();
      timer = setInterval(tick, 1000);
    });
  });

  // ── Open now: hours from #lz-ld (JSON-LD) or data-lz-open-hours, in the business timezone ──
  safe('open-now', function () {
    var badges = all('[data-lz-open-now]');
    if (!badges.length) return;
    var DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var LD_DAYS = { Sunday: 'sun', Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed', Thursday: 'thu', Friday: 'fri', Saturday: 'sat' };
    var ld = doc.getElementById('lz-ld');
    var tz = (ld && ld.getAttribute('data-lz-tz')) || 'America/Mexico_City';

    function hoursFromLd() {
      if (!ld) return null;
      var data = JSON.parse(ld.textContent || '{}');
      var specs = data.openingHoursSpecification;
      if (!specs) return null;
      var hours = {};
      (Array.isArray(specs) ? specs : [specs]).forEach(function (spec) {
        var days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
        days.forEach(function (day) {
          var key = LD_DAYS[String(day).split('/').pop()];
          if (!key) return;
          (hours[key] = hours[key] || []).push({ open: spec.opens, close: spec.closes });
        });
      });
      return hours;
    }
    function minutes(hhmm) {
      var parts = String(hhmm).split(':');
      var m = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      return m >= 1439 ? 1440 : m;
    }
    function nowInZone(zone) {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: zone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(new Date());
      var get = function (type) {
        for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value;
        return '';
      };
      var day = DAYS.indexOf(get('weekday').slice(0, 3).toLowerCase());
      return { day: day, minute: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    }
    function isOpen(hours, zone) {
      var now = nowInZone(zone);
      var today = hours[DAYS[now.day]] || [];
      var yesterday = hours[DAYS[(now.day + 6) % 7]] || [];
      for (var i = 0; i < today.length; i++) {
        var o = minutes(today[i].open), c = minutes(today[i].close);
        if (c > o ? now.minute >= o && now.minute < c : now.minute >= o) return true;
      }
      // A range that closes "earlier" than it opens spills into the next day.
      for (var j = 0; j < yesterday.length; j++) {
        var yo = minutes(yesterday[j].open), yc = minutes(yesterday[j].close);
        if (yc <= yo && now.minute < yc) return true;
      }
      return false;
    }
    var shared = hoursFromLd();
    var update = function () {
      badges.forEach(function (el) {
        safe('open-now:badge', function () {
          var own = el.getAttribute('data-lz-open-hours');
          var hours = own ? JSON.parse(own) : shared;
          if (!hours) return;
          var open = isOpen(hours, el.getAttribute('data-lz-tz') || tz);
          el.textContent = open
            ? el.getAttribute('data-lz-open-text') || 'Abierto ahora'
            : el.getAttribute('data-lz-closed-text') || 'Cerrado';
          el.setAttribute('data-lz-state', open ? 'open' : 'closed');
          el.classList.toggle('lz-open-now', open);
          el.classList.toggle('lz-closed-now', !open);
        });
      });
    };
    update();
    setInterval(update, 60000);
  });
})();
