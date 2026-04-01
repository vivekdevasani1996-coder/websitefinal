/* ─────────────────────────────────────────────────────────────
   count.js  —  Avi & Co Global Visitor Counter
   Fallback Chain:
     1. api.counterapi.dev  (free, CORS-enabled, global)
     2. hits.sh             (free, CORS-enabled, global)
     3. localStorage        (per-device, always works — guaranteed fallback)
   Every page load increments the count by +1.
───────────────────────────────────────────────────────────── */
(function () {
  var el = document.getElementById('visitor-count');
  if (!el) return;

  el.textContent = '…'; // instant placeholder — zero perceived delay

  /* ── Smooth ease-out count-up animation ── */
  function animateCount(target) {
    var duration = 900;
    var startTime = performance.now();
    function step(now) {
      var p = Math.min((now - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function show(n) {
    var num = parseInt(n, 10);
    if (!num || isNaN(num) || num < 1) { el.textContent = '—'; return; }
    animateCount(num);
  }

  /* ── localStorage fallback: increment + return local count ── */
  function localCount() {
    try {
      var key = 'aviandco_visits_v2';
      var n = parseInt(localStorage.getItem(key) || '0', 10);
      n = isNaN(n) ? 1 : n + 1;
      localStorage.setItem(key, String(n));
      return n;
    } catch (e) { return 0; }
  }

  /* ── API 1: api.counterapi.dev — verified free CORS-enabled counter ── */
  /* Increments on every GET, returns { count: N } */
  fetch('https://api.counterapi.dev/v1/aviandco/pageviews/up')
    .then(function (r) {
      if (!r.ok) throw new Error('counterapi ' + r.status);
      return r.json();
    })
    .then(function (j) {
      var n = parseInt(j.count || 0, 10);
      if (n > 0) { show(n); return; }
      throw new Error('counterapi zero');
    })
    .catch(function () {

      /* ── API 2: hits.sh — free badge + JSON counter ── */
      fetch('https://hits.sh/aviandco-website.json')
        .then(function (r) {
          if (!r.ok) throw new Error('hits.sh ' + r.status);
          return r.json();
        })
        .then(function (j) {
          var n = parseInt(j.count || j.total || j.value || 0, 10);
          if (n > 0) { show(n); return; }
          throw new Error('hits.sh zero');
        })
        .catch(function () {

          /* ── Fallback: localStorage (always works, per-device) ── */
          var n = localCount();
          show(n > 0 ? n : 1);
        });
    });
})();