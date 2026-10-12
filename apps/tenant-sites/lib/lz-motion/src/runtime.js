/* Lattiz Motion v3 — reveal groups with smart variants plus the v1 data-lz-* behaviors, Pro sites only.
 * Contract: docs/lattiz-motion.md. Inert without this script (editor, Básico).
 * Rules: one IntersectionObserver per page observing reveal groups; transform/opacity only (clip-path
 * for masks); never hide above-the-fold content; respect prefers-reduced-motion; every module is
 * isolated in its own try/catch. */
(function () {
  'use strict';
  if (window.__lzMotion) return;
  window.__lzMotion = 3;
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
  var MAX_STEP = 6;
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
  function clips(el) {
    return !!el && getComputedStyle(el).overflow !== 'visible';
  }
  /** True when scaling the image can't spill over its neighbours. */
  function framed(img) {
    if (clips(img.parentElement)) return true;
    return getComputedStyle(img).position === 'absolute' && clips(img.offsetParent);
  }

  // ── One IntersectionObserver for the whole page ──
  var TRIGGER = 0.15;
  var watchers = new Map();
  var reported = false;
  var afterBatch = [];
  var io = hasIO
    ? new IntersectionObserver(
        function (entries) {
          reported = true;
          for (var i = 0; i < entries.length; i++) {
            var target = entries[i].target;
            var fn = watchers.get(target);
            // A callback may re-watch its own target; only drop the watcher that just ran.
            if (fn && fn(entries[i]) && watchers.get(target) === fn) {
              watchers.delete(target);
              io.unobserve(target);
            }
          }
          for (var k = 0; k < afterBatch.length; k++) afterBatch[k]();
        },
        { rootMargin: '0px 0px -8% 0px', threshold: [0, TRIGGER] }
      )
    : null;
  /** fn(entry) runs on every change (entry is null without IntersectionObserver); true stops watching. */
  function watch(el, fn) {
    if (!io) return fn(null);
    watchers.set(el, fn);
    io.observe(el);
  }
  /** Visible enough: 15 % of the element, or a quarter of the screen for very tall ones. */
  function seen(e) {
    if (!e) return true;
    var h = e.rootBounds ? e.rootBounds.height : vh;
    return e.isIntersecting && (e.intersectionRatio >= TRIGGER || e.intersectionRect.height >= h * 0.25);
  }
  function once(el, fn) {
    watch(el, function (e) {
      var ok = seen(e);
      if (ok) fn();
      return ok;
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

  // ── Choreography: groups are read in one pass, written in one pass, observed one by one ──
  var VARIANTS = { fade: 1, 'fade-up': 1, 'fade-down': 1, 'fade-left': 1, 'fade-right': 1, 'zoom-in': 1, 'mask-up': 1, 'mask-wipe': 1, 'rise-scale': 1 };
  // Names say where the element travels (fade-right starts on the left); from-* say where it starts.
  var ALIASES = { '': 'fade-up', 'from-left': 'fade-right', 'from-right': 'fade-left', 'from-top': 'fade-down', 'from-bottom': 'fade-up', zoom: 'zoom-in', 'slide-left': 'fade-left', 'slide-right': 'fade-right' };
  var TYPES = { hero: 1, about: 1, text: 1, cards: 1, steps: 1, timeline: 1, gallery: 1, stats: 1, testimonials: 1, pricing: 1, team: 1, faq: 1, contact: 1, cta: 1, footer: 1 };
  var PATTERNS = { cascade: 1, alternate: 1, converge: 1, 'center-out': 1, wave: 1, none: 1 };
  var DEFAULT_PATTERN = { faq: 'alternate', steps: 'alternate', timeline: 'alternate', testimonials: 'alternate', cards: 'converge', pricing: 'converge', gallery: 'wave', stats: 'center-out' };
  var BLOCK = /^(H[1-6]|P|BLOCKQUOTE|DL|DT|DD|FIGCAPTION|SUMMARY|LI|TABLE|ADDRESS)$/;
  var MEDIA = /^(IMG|PICTURE|VIDEO|IFRAME)$/;
  var SKIP = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|BR)$/;
  var FEATURED = /featured|popular|destacad|recomendad/i;

  function variant(name, fallback) {
    if (name === null || name === undefined) return fallback;
    if (ALIASES[name] !== undefined) name = ALIASES[name];
    return VARIANTS[name] ? name : fallback;
  }
  function kindOf(el, fallback) {
    return variant(el.getAttribute('data-lz-reveal'), fallback);
  }
  function optedOut(el) {
    return el.getAttribute('data-lz-reveal') === 'none';
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
  function kids(el) {
    return Array.prototype.slice.call(el.children).filter(function (k) {
      return !SKIP.test(k.tagName) && k.getBoundingClientRect().height > 0;
    });
  }
  /** ≥ 3 children that look alike (one odd sibling allowed): cards, rows, list items. Runs of <p> are prose. */
  function isGroup(el) {
    var list = el.children;
    if (list.length < 3) return false;
    var sig = signature(list[1]);
    if (sig.indexOf('P.') === 0) return false;
    var same = 0;
    for (var i = 0; i < list.length; i++) if (signature(list[i]) === sig) same++;
    return same >= 3 && same >= list.length - 1;
  }
  /** Two blocks side by side (text + media, form + info): each column enters from its side. */
  function isSplit(el) {
    var list = kids(el);
    if (list.length !== 2) return false;
    var a = list[0].getBoundingClientRect();
    var b = list[1].getBoundingClientRect();
    return Math.abs(a.top - b.top) < a.height / 2 && b.left >= a.right - 4;
  }
  /** Rows and columns from the boxes: same top = same row, ordered by left. */
  function layout(items) {
    var boxes = items.map(function (el) { return el.getBoundingClientRect(); });
    var rowsOut = [];
    boxes.forEach(function (box, i) {
      var row = null;
      for (var r = 0; r < rowsOut.length; r++) if (Math.abs(rowsOut[r].top - box.top) < 4) row = rowsOut[r];
      if (!row) rowsOut.push((row = { top: box.top, items: [] }));
      row.items.push({ el: items[i], left: box.left });
    });
    rowsOut.forEach(function (row) {
      row.items.sort(function (a, b) { return a.left - b.left; });
    });
    return rowsOut;
  }

  /**
   * Walks one section in document order into reveal groups. Inside a group `i` is the cascade
   * slot (stagger token apart) and `j` a word or v1 stagger child (`step` apart).
   */
  function collectSection(sec, type, pattern) {
    var groups = [];
    var current = null;
    var heroArea = 0;
    var heroTitle = null;
    var headed = false;

    function group() {
      var g = { targets: [], at: 0, section: sec };
      groups.push(g);
      return g;
    }
    function add(g, el, fx, extra) {
      var t = { el: el, fx: fx, i: g.at++, j: 0 };
      for (var k in extra) t[k] = extra[k];
      // Counters inside a target (a stat card, a list item) play with it.
      var nested = all(type === 'stats' ? '[data-lz-counter], *' : '[data-lz-counter]', el);
      t.counters = [];
      for (var n = 0; n < nested.length; n++) {
        var c = counterFrom(nested[n]);
        if (c) t.counters.push({ el: nested[n], c: c });
      }
      g.targets.push(t);
      return t;
    }
    function items(list, chosen, base) {
      current = null;
      var shown = list.filter(function (el) { return !optedOut(el); });
      var rows = layout(shown);
      var single = rows.every(function (row) { return row.items.length === 1; });
      // Stacked (mobile) lists only keep sideways travel for alternate.
      var p = single && chosen !== 'alternate' && chosen !== 'none' ? 'cascade' : chosen;
      if (p === 'none') return;
      var index = 0;
      rows.forEach(function (row) {
        var g = group();
        var n = row.items.length;
        var center = (n - 1) / 2;
        row.items.forEach(function (it, c) {
          var fx = base;
          var i = c;
          if (p === 'alternate') fx = index % 2 ? 'fade-left' : 'fade-right';
          else if (p === 'converge') {
            fx = c < center - 0.01 ? 'fade-right' : c > center + 0.01 ? 'fade-left' : base;
            i = 0;
          } else if (p === 'center-out') i = Math.round(Math.abs(c - center));
          if (FEATURED.test(it.el.className) || it.el.hasAttribute('data-lz-featured')) fx = 'rise-scale';
          var t = add(g, it.el, kindOf(it.el, fx));
          t.i = i;
          if (t.fx === 'mask-wipe') t.dir = 'right';
          index++;
        });
      });
    }

    function walk(node, into, sideFx) {
      for (var c = node.firstElementChild; c; c = c.nextElementSibling) visit(c, into, sideFx);
    }
    function visit(c, into, sideFx) {
      if (SKIP.test(c.tagName) || optedOut(c)) return;
      var flow = function () {
        if (into) return into;
        if (!current) current = group();
        return current;
      };
      var text = sideFx || 'fade-up';
      if (c.hasAttribute('data-lz-stagger')) {
        // v1 override: its own group, children `step` apart.
        var step = num(c.getAttribute('data-lz-stagger'), 90);
        var kind = kindOf(c, 'fade-up');
        var g = into || group();
        var slot = g.at++;
        Array.prototype.slice.call(c.children).forEach(function (child, k) {
          add(g, child, kindOf(child, kind), { j: k, step: step }).i = slot;
        });
        if (!into) current = null;
      } else if (c.hasAttribute('data-lz-words')) {
        add(flow(), c, 'words', { step: num(c.getAttribute('data-lz-words'), 0) || null });
      } else if (c.hasAttribute('data-lz-compare') || c.hasAttribute('data-lz-countdown')) {
        // Widgets move as one piece; their own clip-path and text stay theirs.
        add(flow(), c, kindOf(c, text));
      } else if (c.hasAttribute('data-lz-reveal')) {
        add(flow(), c, kindOf(c, text), { delay: c.getAttribute('data-lz-delay'), dur: c.getAttribute('data-lz-duration') });
      } else if (MEDIA.test(c.tagName)) {
        var box = c.getBoundingClientRect();
        if (type === 'hero') {
          heroArea = Math.max(heroArea, box.width * box.height);
          var frame = framed(c);
          // The LCP image never fades or clips: it settles, or slides in from the right.
          var fx = frame ? 'settle-lg' : box.left + box.width / 2 > innerWidth * 0.55 ? 'shift-left' : 'settle';
          add(flow(), c, fx, { px: frame }).i = 0;
        } else {
          var mg = into || group();
          var dir = sideFx === 'fade-left' ? 'left' : sideFx === 'fade-right' ? 'right' : box.width > innerWidth * 0.7 ? 'up' : 'right';
          add(mg, c, kindOf(c, 'mask-wipe'), { dir: dir, zoom: type === 'gallery' && framed(c) });
          if (!into) current = null;
        }
      } else if (isButton(c)) {
        add(flow(), c, kindOf(c, text));
      } else if (type !== 'footer' && isGroup(c)) {
        var chosen = PATTERNS[c.getAttribute('data-lz-pattern')] ? c.getAttribute('data-lz-pattern') : pattern;
        // A sideways carousel of quotes just fades: items off to the side never cross the line together.
        var carousel = type === 'testimonials' && /auto|scroll/.test(getComputedStyle(c).overflowX);
        items(Array.prototype.slice.call(c.children), carousel ? 'cascade' : chosen, type === 'gallery' ? 'mask-wipe' : carousel ? 'fade' : 'fade-up');
      } else if (type !== 'footer' && type !== 'hero' && isSplit(c)) {
        // Columns converge: the left one travels right, the right one travels left.
        current = null;
        var cols = kids(c);
        visit(cols[0], into || group(), 'fade-right');
        current = null;
        visit(cols[1], into || group(), 'fade-left');
        current = null;
      } else if (BLOCK.test(c.tagName) || (!c.children.length && c.textContent.trim())) {
        var counter = (type === 'stats' || c.hasAttribute('data-lz-counter')) && counterFrom(c);
        var g2 = flow();
        if (type === 'hero' && c.tagName === 'H1') heroTitle = add(g2, c, 'words');
        else if (type === 'hero' && !heroTitle) add(g2, c, 'fade-down');
        else if (/^H[1-3]$/.test(c.tagName) && !headed) {
          headed = true;
          add(g2, c, type === 'cta' ? 'zoom-in' : 'mask-up');
        } else add(g2, c, text, counter ? { counter: counter } : null);
      } else {
        walk(c, into, sideFx);
      }
    }
    walk(sec, null, null);

    // LCP guard: a headline bigger than the hero image moves but never starts hidden.
    if (heroTitle) {
      var rect = heroTitle.el.getBoundingClientRect();
      if (rect.width * rect.height >= heroArea) heroTitle.shift = true;
    }
    groups = groups.filter(function (g) { return g.targets.length; });
    if (type === 'footer' && groups.length) {
      var one = groups[0];
      groups.slice(1).forEach(function (g) { one.targets = one.targets.concat(g.targets); });
      one.targets.forEach(function (t) {
        t.fx = 'fade';
        t.i = 0;
      });
      groups = [one];
    }
    groups.forEach(function (g) {
      g.anchor = g.targets[0].el;
      var r = g.anchor.getBoundingClientRect();
      g.visible = r.top < vh && r.bottom > 0;
    });
    return groups;
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
    if (t.fx === 'words') return [].concat.apply([], splitWords(t).map(apply));
    var el = t.el;
    var s = el.style;
    el.classList.add('lz-t');
    el.setAttribute('data-lz-fx', t.fx);
    if (t.dir) el.setAttribute('data-lz-dir', t.dir);
    s.setProperty('--lz-i', String(Math.min(t.i, MAX_STEP)));
    if (t.j) s.setProperty('--lz-j', String(Math.min(t.j, MAX_WORDS)));
    if (t.step) s.setProperty('--lz-step', t.step + 'ms');
    if (t.delay) s.setProperty('--lz-delay', num(t.delay, 0) + 'ms');
    if (t.dur) s.setProperty('--lz-d', num(t.dur, 700) + 'ms');
    if (t.px) el.classList.add('lz-px');
    if (t.zoom) el.classList.add('lz-zoom');
    var counters = (t.counters || []).concat(t.counter ? [{ el: el, c: t.counter }] : []);
    counters.forEach(function (n) {
      n.el.__lzOwned = true;
      if (!t.now) n.el.textContent = formatCounter(n.c, 0);
    });
    t.counters = counters;
    return [t];
  }

  // ── Playback: groups that become visible in the same observer callback cascade in page order ──
  var pending = [];
  var due = [];
  function play(g, offset) {
    if (g.done) return;
    g.done = true;
    if (g.section) g.section.classList.add('lz-in');
    g.targets.forEach(function (t) {
      if (offset) t.el.style.setProperty('--lz-b', String(offset));
      t.el.classList.add('lz-go');
      t.counters.forEach(function (n) { runCounter(n.el, n.c); });
    });
  }
  function arm(g) {
    pending.push(g);
    watch(g.anchor, function (e) {
      if (!g.done && seen(e)) due.push(g);
      return g.done || seen(e);
    });
  }
  // Groups jumped over (anchor links, fast flicks) play with the next callback: read first, then write.
  afterBatch.push(function () {
    pending.forEach(function (g) {
      if (!g.done && due.indexOf(g) < 0 && g.anchor.getBoundingClientRect().top < vh * 0.92) due.push(g);
    });
    due.sort(function (a, b) { return a.order - b.order; });
    due.forEach(function (g, k) { play(g, Math.min(k, 4)); });
    due = [];
    pending = pending.filter(function (g) { return !g.done; });
  });
  function flatten(lists) {
    return [].concat.apply([], lists);
  }
  var order = 0;
  function schedule(g, now) {
    g.order = order++;
    g.targets = flatten(g.targets.map(apply));
    if (now) play(g, 0);
    else arm(g);
  }

  safe('sections', function () {
    if (still) return;
    var plans = [];
    all('[data-lz-section]').forEach(function (sec) {
      var type = sec.getAttribute('data-lz-section');
      if (type === 'none' || optedOut(sec)) return;
      if (!TYPES[type]) type = 'about';
      if (type === 'text') type = 'about';
      var p = sec.getAttribute('data-lz-pattern');
      plans.push({
        el: sec,
        type: type,
        drift: type === 'cta' && getComputedStyle(sec).position !== 'static',
        groups: collectSection(sec, type, PATTERNS[p] ? p : DEFAULT_PATTERN[type] || 'cascade'),
      });
    });
    plans.forEach(function (plan) {
      if (plan.drift) plan.el.classList.add('lz-drift');
      plan.groups.forEach(function (g) {
        // In the first viewport only the hero plays (from first paint); anything else stays static.
        if (g.visible && plan.type !== 'hero') return;
        g.targets.forEach(function (t) { t.now = g.visible; });
        schedule(g, g.visible);
      });
    });
  });

  // ── v1 attributes outside v2/v3 sections: the outermost reveal is the trigger ──
  safe('legacy', function () {
    if (still) return;
    var hosts = new Map();
    all('[data-lz-reveal],[data-lz-stagger],[data-lz-words]').forEach(function (el) {
      if (el.closest('[data-lz-section]:not([data-lz-section="none"])') || optedOut(el)) return;
      var host = el;
      for (var p = el.parentElement; p; p = p.parentElement) {
        if (p.hasAttribute('data-lz-reveal') && !optedOut(p)) host = p;
      }
      if (!hosts.has(host)) {
        var r = host.getBoundingClientRect();
        hosts.set(host, { anchor: host, visible: r.top < vh && r.bottom > 0, targets: [] });
      }
      var g = hosts.get(host);
      var slot = host === el ? 0 : 1;
      if (el.hasAttribute('data-lz-stagger')) {
        var step = num(el.getAttribute('data-lz-stagger'), 90);
        var kind = kindOf(el, 'fade-up');
        Array.prototype.slice.call(el.children).forEach(function (child, k) {
          g.targets.push({ el: child, fx: kindOf(child, kind), i: slot, j: k, step: step, dur: el.getAttribute('data-lz-duration'), counters: [] });
        });
      } else if (el.hasAttribute('data-lz-words')) {
        g.targets.push({ el: el, fx: 'words', i: slot, j: 0, step: num(el.getAttribute('data-lz-words'), 45) || 45, counters: [] });
      } else {
        g.targets.push({ el: el, fx: kindOf(el, 'fade-up'), i: slot, j: 0, delay: el.getAttribute('data-lz-delay'), dur: el.getAttribute('data-lz-duration'), counters: [] });
      }
    });
    hosts.forEach(function (g) {
      // v1 rule: elements in the first viewport are never hidden.
      if (!g.visible && g.targets.length) schedule(g, false);
    });
  });

  // Counters no group owns (e.g. outside any section) count when they themselves scroll in.
  safe('counter', function () {
    if (still) return;
    all('[data-lz-counter]').forEach(function (el) {
      if (el.__lzCounted || el.__lzOwned) return;
      var c = counterFrom(el);
      if (!c) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) return runCounter(el, c);
      el.textContent = formatCounter(c, 0);
      once(el, function () {
        runCounter(el, c);
      });
    });
  });

  // The last strip of the page can't cross the trigger line: reaching the end plays everything left.
  safe('end', function () {
    if (!pending.length || !io) return;
    var end = doc.createElement('div');
    end.className = 'lz-end';
    end.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(end);
    watch(end, function (e) {
      if (!e.isIntersecting) return false;
      pending.forEach(function (g) { if (due.indexOf(g) < 0) due.push(g); });
      return true;
    });
  });

  // Active nav link: re-evaluated on every observer callback (sections are watched too), no scroll listener.
  safe('nav', function () {
    if (!io) return;
    var links = [];
    all('header a[href^="#"], nav a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var target = id && doc.getElementById(decodeURIComponent(id));
      if (target && !target.contains(a)) links.push({ a: a, t: target });
    });
    if (!links.length) return;
    var update = function () {
      var line = vh * 0.35;
      var current = null;
      links.forEach(function (l) {
        var r = l.t.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) current = l.t;
      });
      links.forEach(function (l) {
        var on = l.t === current;
        l.a.classList.toggle('lz-active', on);
        if (on) l.a.setAttribute('aria-current', 'true');
        else l.a.removeAttribute('aria-current');
      });
    };
    links.forEach(function (l) {
      // Never take over an element a reveal group already watches.
      if (!watchers.has(l.t)) watch(l.t, function () { return false; });
    });
    afterBatch.push(update);
  });

  // Failsafe: nothing stays hidden if the observer never reports (broken IO, odd layouts).
  safe('failsafe', function () {
    if (!pending.length) return;
    setTimeout(function () {
      if (!reported) pending.forEach(function (g) { play(g, 0); });
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
      watch(el, function (e) {
        var now = !!(e && e.isIntersecting);
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
    watch(sentinel, function (e) {
      root.classList.toggle('lz-scrolled', !(e && e.isIntersecting));
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
