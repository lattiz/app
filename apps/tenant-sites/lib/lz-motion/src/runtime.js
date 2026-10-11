/* Lattiz Motion v1 — declarative data-lz-* behaviors for published Pro sites.
 * Contract: docs/lattiz-motion.md. Inert without this script (editor, Básico).
 * Rules: transform/opacity only; never hide above-the-fold content; respect
 * prefers-reduced-motion; every module is isolated in its own try/catch. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  if (root.getAttribute('data-lz-motion')) return;
  root.setAttribute('data-lz-motion', '1');
  root.classList.add('lz-js');

  var reduced =
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var FAILSAFE_MS = 2500;

  function all(selector, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(selector));
  }
  function num(value, fallback) {
    var n = parseFloat(value);
    return isFinite(n) ? n : fallback;
  }
  function aboveFold(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || root.clientHeight) && rect.bottom > 0;
  }
  function safe(name, fn) {
    try {
      fn();
    } catch (error) {
      if (window.console) console.warn('[lz-motion] ' + name, error);
    }
  }
  /** Calls fn once when el first enters the viewport (immediately without IntersectionObserver). */
  function onEnter(el, fn, margin) {
    if (!hasIO) return fn();
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            io.disconnect();
            fn();
            return;
          }
        }
      },
      { rootMargin: margin || '0px 0px -10% 0px' }
    );
    io.observe(el);
  }

  // ── Reveal + stagger + words: hidden states exist only after JS adds .lz-hide ──
  var pending = [];
  function hide(el, kind, delay, duration) {
    el.style.setProperty('--lz-delay', delay + 'ms');
    el.style.setProperty('--lz-dur', duration + 'ms');
    el.setAttribute('data-lz-kind', kind);
    el.classList.add('lz-hide');
    pending.push(el);
  }
  function show(el) {
    el.classList.add('lz-in');
    el.classList.remove('lz-hide');
  }
  function revealAll() {
    for (var i = 0; i < pending.length; i++) show(pending[i]);
    pending = [];
  }

  safe('reveal', function () {
    if (reduced || !hasIO) return;
    all('[data-lz-reveal]').forEach(function (el) {
      // A stagger parent's data-lz-reveal only names its children's effect.
      if (el.hasAttribute('data-lz-stagger')) return;
      if (el.parentElement && el.parentElement.closest('[data-lz-stagger]')) return;
      if (aboveFold(el)) return;
      hide(
        el,
        el.getAttribute('data-lz-reveal') || 'fade-up',
        num(el.getAttribute('data-lz-delay'), 0),
        num(el.getAttribute('data-lz-duration'), 700)
      );
      onEnter(el, function () {
        show(el);
      });
    });
  });

  safe('stagger', function () {
    if (reduced || !hasIO) return;
    all('[data-lz-stagger]').forEach(function (parent) {
      if (aboveFold(parent)) return;
      var step = num(parent.getAttribute('data-lz-stagger'), 90);
      var kind = parent.getAttribute('data-lz-reveal') || 'fade-up';
      var duration = num(parent.getAttribute('data-lz-duration'), 600);
      var children = Array.prototype.slice.call(parent.children);
      children.forEach(function (child, i) {
        hide(child, child.getAttribute('data-lz-reveal') || kind, i * step, duration);
      });
      onEnter(parent, function () {
        children.forEach(show);
      });
    });
  });

  safe('words', function () {
    if (reduced || !hasIO) return;
    all('[data-lz-words]').forEach(function (el) {
      if (aboveFold(el)) return;
      var step = num(el.getAttribute('data-lz-words'), 45) || 45;
      var words = [];
      // Only direct text nodes are split, so inline markup (links, <strong>) survives.
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType !== 3 || !node.textContent.trim()) return;
        var frag = doc.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(doc.createTextNode(part));
          var span = doc.createElement('span');
          span.className = 'lz-word';
          span.textContent = part;
          frag.appendChild(span);
          words.push(span);
        });
        node.parentNode.replaceChild(frag, node);
      });
      words.forEach(function (span, i) {
        hide(span, 'fade-up', i * step, 500);
      });
      onEnter(el, function () {
        words.forEach(show);
      });
    });
  });

  // Failsafe: nothing stays hidden if observers never report (broken IO, odd layouts).
  safe('failsafe', function () {
    if (!pending.length) return;
    var seen = false;
    if (hasIO) {
      var probe = new IntersectionObserver(function () {
        seen = true;
        probe.disconnect();
      });
      probe.observe(pending[0]);
    }
    setTimeout(function () {
      if (!seen) revealAll();
    }, FAILSAFE_MS);
  });

  // ── Counters ──
  safe('counter', function () {
    all('[data-lz-counter]').forEach(function (el) {
      var raw = el.getAttribute('data-lz-counter') || '0';
      var target = num(raw, 0);
      var decimals = (raw.split('.')[1] || '').length;
      var prefix = el.getAttribute('data-lz-prefix') || '';
      var suffix = el.getAttribute('data-lz-suffix') || '';
      var format = function (value) {
        return (
          prefix +
          value.toLocaleString('es-MX', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) +
          suffix
        );
      };
      if (reduced) {
        el.textContent = format(target);
        return;
      }
      var run = function () {
        var start = null;
        var duration = num(el.getAttribute('data-lz-duration'), 1600);
        var tick = function (now) {
          if (start === null) start = now;
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(target * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if (aboveFold(el)) run();
      else {
        el.textContent = format(0);
        onEnter(el, run);
      }
    });
  });

  // ── Parallax (transform only, rAF-throttled, passive scroll) ──
  safe('parallax', function () {
    if (reduced) return;
    var items = all('[data-lz-parallax]').map(function (el) {
      return { el: el, factor: Math.max(-1, Math.min(1, num(el.getAttribute('data-lz-parallax'), 0.2))) };
    });
    if (!items.length) return;
    var queued = false;
    var update = function () {
      queued = false;
      var vh = window.innerHeight || root.clientHeight;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var rect = item.el.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > 2 * vh) continue;
        var offset = rect.top + rect.height / 2 - vh / 2;
        item.el.style.transform = 'translate3d(0,' + (-offset * item.factor).toFixed(1) + 'px,0)';
      }
    };
    var queue = function () {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
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
