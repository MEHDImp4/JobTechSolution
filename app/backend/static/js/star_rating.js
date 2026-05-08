/**
 * Star rating widget — Phase 6 Plan 1.
 * Drives hidden number inputs from clickable star spans.
 *
 * Usage: place a .star-rating container with data-input="<hidden_input_id>",
 * 5 child .star spans, and a .star-value span.
 */

document.querySelectorAll('.star-rating').forEach(container => {
  const inputId = container.dataset.input;
  const stars = container.querySelectorAll('.star');

  stars.forEach((star, i) => {
    star.addEventListener('mouseover', () => highlightStars(stars, i));

    star.addEventListener('mouseout', () => {
      const currentVal = parseInt(document.getElementById(inputId).value) || 0;
      highlightStars(stars, currentVal - 1);
    });

    star.addEventListener('click', () => {
      const val = i + 1;
      document.getElementById(inputId).value = val;
      highlightStars(stars, i);
      container.querySelector('.star-value').textContent = val + '/5';
    });
  });

  // Restore existing value (e.g. after form validation error)
  const existingVal = parseInt(document.getElementById(inputId).value) || 0;
  if (existingVal > 0) {
    highlightStars(stars, existingVal - 1);
    container.querySelector('.star-value').textContent = existingVal + '/5';
  }
});

function highlightStars(stars, upToIndex) {
  stars.forEach((s, i) => {
    s.textContent = i <= upToIndex ? '\u2605' : '\u2606';
    s.style.color = i <= upToIndex ? '#F59E0B' : '#CBD5E1';
  });
}
