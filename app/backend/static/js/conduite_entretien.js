/**
 * conduite_entretien.js — Phase 5 Plan 1
 *
 * Quill.js rich-text editor for interview note-taking with:
 *  - AJAX auto-save every 30 seconds
 *  - Debounced save on text change (3 s delay)
 *  - localStorage fallback when offline
 *  - Restore from localStorage on page load
 *  - Live timer counting up from ENTRETIEN_START
 *
 * Requires: ENTRETIEN_ID and ENTRETIEN_START defined in the page before this script.
 */

'use strict';

// ---------------------------------------------------------------------------
// Quill editor initialisation
// ---------------------------------------------------------------------------
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'bullet' }, { list: 'ordered' }],
      ['clean'],
    ],
  },
});

// ---------------------------------------------------------------------------
// CSRF helper
// ---------------------------------------------------------------------------
function getCookie(name) {
  const val = `; ${document.cookie}`;
  const parts = val.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

// ---------------------------------------------------------------------------
// Auto-save logic
// ---------------------------------------------------------------------------
const SAVE_INTERVAL_MS = 30000;
let saveTimeout = null;
let lastSavedContent = '';

function saveNotes() {
  const content = quill.root.innerHTML;

  // Skip if nothing changed
  if (content === lastSavedContent) return;

  const statusEl = document.getElementById('save-status');

  fetch(`/entretiens/${ENTRETIEN_ID}/notes/save/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ notes: content }),
  })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (data.success) {
        lastSavedContent = content;
        if (statusEl) statusEl.textContent = `Sauvegardé à ${data.saved_at}`;
        // Clear any stale local backup
        localStorage.removeItem(`notes_${ENTRETIEN_ID}`);
      }
    })
    .catch(function () {
      // Network error — persist locally
      localStorage.setItem(`notes_${ENTRETIEN_ID}`, content);
      if (statusEl) statusEl.textContent = 'Hors ligne — sauvegardé localement';
    });
}

// Periodic save every 30 s
setInterval(saveNotes, SAVE_INTERVAL_MS);

// Debounced save on editor change
quill.on('text-change', function () {
  clearTimeout(saveTimeout);
  const statusEl = document.getElementById('save-status');
  if (statusEl) statusEl.textContent = 'Modifications non sauvegardées...';
  saveTimeout = setTimeout(saveNotes, 3000);
});

// ---------------------------------------------------------------------------
// Restore from localStorage on page load
// ---------------------------------------------------------------------------
(function restoreOfflineNotes() {
  const localNotes = localStorage.getItem(`notes_${ENTRETIEN_ID}`);
  if (localNotes) {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'block';
    // Only restore if the server-side content is empty (avoid overwriting)
    if (!quill.root.innerHTML || quill.root.innerHTML === '<p><br></p>') {
      quill.root.innerHTML = localNotes;
    }
  }
})();

// ---------------------------------------------------------------------------
// Live timer — counts up from ENTRETIEN_START
// ---------------------------------------------------------------------------
(function startTimer() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;

  // ENTRETIEN_START is injected by the template as an ISO 8601 string
  const startTime = new Date(ENTRETIEN_START);

  setInterval(function () {
    const elapsed = Math.max(0, Math.floor((new Date() - startTime) / 1000));
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }, 1000);
})();
