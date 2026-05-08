/**
 * upload.js — CV upload with progress + IA polling
 * Phase 3 Plan 1
 */

(function () {
  'use strict';

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_EXT = ['pdf', 'docx'];

  const fileInput  = document.getElementById('cvFileInput');
  const uploadZone = document.getElementById('uploadZone');
  const submitBtn  = document.getElementById('submitBtn');
  const clientErr  = document.getElementById('clientError');
  const progressArea = document.getElementById('progressArea');
  const progressBar  = document.getElementById('uploadProgressBar');
  const iaStatusArea = document.getElementById('iaStatusArea');
  const iaSpinner    = document.getElementById('iaSpinner');
  const iaResult     = document.getElementById('iaResult');
  const iaGaugeFill  = document.getElementById('iaGaugeFill');
  const iaScoreLabel = document.getElementById('iaScoreLabel');
  const iaError      = document.getElementById('iaError');
  const selectedFileName = document.getElementById('selectedFileName');

  let selectedFile = null;
  let pollTimer = null;

  // ── Drag & drop ──────────────────────────────────────────────────────────
  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', function () {
    uploadZone.classList.remove('dragover');
  });
  uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  // ── File validation (client-side) ────────────────────────────────────────
  function handleFile(file) {
    clientErr.classList.add('d-none');
    clientErr.textContent = '';

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      showError('Format invalide. Seuls PDF et DOCX acceptés.');
      return;
    }
    if (file.size > MAX_SIZE) {
      showError('Fichier trop grand. Maximum 5 Mo.');
      return;
    }

    selectedFile = file;
    selectedFileName.textContent = file.name;
    selectedFileName.classList.remove('d-none');
    submitBtn.removeAttribute('disabled');
  }

  function showError(msg) {
    clientErr.textContent = msg;
    clientErr.classList.remove('d-none');
    selectedFile = null;
    submitBtn.setAttribute('disabled', true);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submitBtn.addEventListener('click', function () {
    const offreId = document.getElementById('offreSelect').value;
    if (!offreId) {
      showError("Veuillez sélectionner une offre d'emploi.");
      return;
    }
    if (!selectedFile) {
      showError('Veuillez sélectionner un fichier CV.');
      return;
    }

    const csrfToken = getCsrfToken();
    const formData = new FormData();
    formData.append('offre_id', offreId);
    formData.append('cv_file', selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/candidatures/upload/');
    xhr.setRequestHeader('X-CSRFToken', csrfToken);

    // Progress tracking
    progressArea.classList.remove('d-none');
    submitBtn.setAttribute('disabled', true);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = pct + '%';
        progressBar.textContent = pct + '%';
      }
    };

    xhr.onload = function () {
      progressArea.classList.add('d-none');
      let data;
      try { data = JSON.parse(xhr.responseText); } catch (_) { data = {}; }

      if (xhr.status === 200 && data.success) {
        iaStatusArea.classList.remove('d-none');
        startPolling(data.candidature_id);
      } else {
        showError(data.error || 'Une erreur est survenue lors de l\'envoi.');
        submitBtn.removeAttribute('disabled');
      }
    };

    xhr.onerror = function () {
      progressArea.classList.add('d-none');
      showError('Erreur réseau. Veuillez réessayer.');
      submitBtn.removeAttribute('disabled');
    };

    xhr.send(formData);
  });

  // ── IA Polling ────────────────────────────────────────────────────────────
  function startPolling(candidatureId) {
    pollTimer = setInterval(function () {
      pollStatus(candidatureId);
    }, 3000);
  }

  function pollStatus(candidatureId) {
    fetch('/candidatures/' + candidatureId + '/ia-status/', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ia_status === 'done') {
          clearInterval(pollTimer);
          showIaResult(data.score_ia || 0);
        } else if (data.ia_status === 'error') {
          clearInterval(pollTimer);
          showIaError();
        }
        // 'pending' or 'processing' → keep polling
      })
      .catch(function () {
        // Network hiccup — keep polling silently
      });
  }

  function showIaResult(score) {
    iaSpinner.classList.add('d-none');
    const pct = Math.round(score * 100);
    iaGaugeFill.style.width = pct + '%';
    iaScoreLabel.textContent = pct + '%';
    iaResult.classList.remove('d-none');
  }

  function showIaError() {
    iaSpinner.classList.add('d-none');
    iaError.classList.remove('d-none');
  }

  document.getElementById('retryBtn') && document.getElementById('retryBtn').addEventListener('click', function () {
    iaError.classList.add('d-none');
    iaSpinner.classList.remove('d-none');
    // Re-poll after manual retry click (candidature_id stored in a data attr would be needed;
    // for now this button just re-shows the spinner to indicate retry intent)
  });

  // ── CSRF helper ──────────────────────────────────────────────────────────
  function getCsrfToken() {
    const cookie = document.cookie.split(';').find(function (c) {
      return c.trim().startsWith('csrftoken=');
    });
    return cookie ? cookie.trim().split('=')[1] : '';
  }
})();
