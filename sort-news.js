document.addEventListener('DOMContentLoaded', function () {
  function parseDateFromText(text) {
    if (!text) return null;
    // ISO-like YYYY-MM-DD
    var m = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) return new Date(m[1]);
    // DD/MM/YYYY or MM/DD/YYYY (try both common patterns)
    m = text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (m) {
      var parts = m[1].split('/');
      // prefer YYYY-MM-DD style if impossible, fall back to Date parsing
      return new Date(parts[2] + '-' + parts[1] + '-' + parts[0]);
    }
    // fallback: try Date parsing on the whole text
    var d = new Date(text);
    return isNaN(d) ? null : d;
  }

  function findDateInItem(item) {
    // check data-date attribute
    var attr = item.getAttribute && (item.getAttribute('data-date') || item.getAttribute('datetime'));
    if (attr) {
      var d = parseDateFromText(attr);
      if (d) return d;
    }
    // look for child elements with date-like class or time elements
    var selectors = ['.date', '.posted', '.time', 'time', '[data-date]'];
    for (var i = 0; i < selectors.length; i++) {
      var el = item.querySelector && item.querySelector(selectors[i]);
      if (el) {
        var d = parseDateFromText(el.textContent || el.getAttribute('datetime') || '');
        if (d) return d;
      }
    }
    // last resort: search the text content for an ISO date
    return parseDateFromText(item.textContent || '');
  }

  var containerSelectors = ['#news', '.news-list', '.news', '#updates', '.updates', '.news-items', '.news-container', 'section[aria-labelledby]'];
  for (var cs = 0; cs < containerSelectors.length; cs++) {
    var containers = document.querySelectorAll(containerSelectors[cs]);
    if (!containers || containers.length === 0) continue;
    containers.forEach(function (container) {
      var items = Array.prototype.slice.call(container.children);
      if (!items || items.length <= 1) return;
      var parsed = items.map(function (it, idx) {
        return {node: it, date: findDateInItem(it), index: idx};
      });
      // If no items have dates, skip
      var anyDate = parsed.some(function (p) { return p.date instanceof Date && !isNaN(p.date); });
      if (!anyDate) return;
      parsed.sort(function (a, b) {
        if (a.date && b.date) return b.date - a.date;
        if (a.date) return -1;
        if (b.date) return 1;
        return a.index - b.index;
      });
      // append in sorted order
      parsed.forEach(function (p) { container.appendChild(p.node); });
    });
  }
});