/**
 * gauge.js — Phase 4 Plan 1
 * Animate Bootstrap progress bars that carry a data-target attribute
 * (used by templates/partials/score_gauge.html).
 *
 * Usage: include this script after the DOM is ready or at end of <body>.
 */
document.querySelectorAll('.progress-bar[data-target]').forEach(function (bar) {
  var target = parseFloat(bar.dataset.target);
  if (isNaN(target)) { return; }
  bar.style.transition = 'width 1.2s ease-in-out';
  setTimeout(function () {
    bar.style.width = target + '%';
  }, 100);
});
