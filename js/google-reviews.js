// Live Google rating and reviews, served by netlify/functions/google-reviews.mjs.
// Exposes window.arataGoogleReviews — a promise resolving to the review data,
// or null if it can't be loaded (local preview, Google down, slow network) —
// and fills any [data-g="rating"] / [data-g="count"] / [data-g="link"]
// elements. When it resolves to null the page keeps its built-in content.
window.arataGoogleReviews = (function () {
  if (!window.fetch || !window.Promise) return Promise.resolve(null);
  var controller = 'AbortController' in window ? new AbortController() : null;
  var timer = setTimeout(function () { if (controller) controller.abort(); }, 5000);

  return fetch('/api/google-reviews', controller ? { signal: controller.signal } : {})
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      clearTimeout(timer);
      return data && typeof data.rating === 'number' ? data : null;
    })
    .catch(function () { clearTimeout(timer); return null; });
})();

document.addEventListener('DOMContentLoaded', function () {
  window.arataGoogleReviews.then(function (data) {
    if (!data) return;
    document.querySelectorAll('[data-g="rating"]').forEach(function (el) {
      el.textContent = data.rating.toFixed(1);
    });
    document.querySelectorAll('[data-g="count"]').forEach(function (el) {
      el.textContent = data.count;
    });
    document.querySelectorAll('[data-g="stars"]').forEach(function (el) {
      var full = Math.round(data.rating);
      el.textContent = '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
    });
    if (data.url) {
      document.querySelectorAll('[data-g="link"]').forEach(function (el) { el.href = data.url; });
    }
  });
});
