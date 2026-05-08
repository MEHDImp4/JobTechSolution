/**
 * calendrier.js — Phase 5 Plan 1
 * FullCalendar v6 integration for interview scheduling.
 * Handles event display, creation modal, and drag-to-reschedule.
 */

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'fr',
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: API_URL,
    selectable: true,
    editable: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '19:00:00',
    height: 680,

    select: function (info) {
      openCreateModal(info.startStr);
    },

    eventClick: function (info) {
      if (info.event.url) {
        info.jsEvent.preventDefault();
        window.location.href = info.event.url;
      }
    },

    eventDrop: function (info) {
      updateEntretienDate(info.event.id, info.event.startStr, info);
    },
  });

  calendar.render();

  // -----------------------------------------------------------------------
  // Create modal helpers
  // -----------------------------------------------------------------------
  function openCreateModal(dateStr) {
    const input = document.getElementById('entretien-date');
    if (input && dateStr) {
      // FullCalendar returns ISO 8601 — datetime-local expects "YYYY-MM-DDTHH:MM"
      input.value = dateStr.slice(0, 16);
    }
    const modal = new bootstrap.Modal(document.getElementById('createModal'));
    modal.show();
  }

  document.getElementById('btn-create-entretien').addEventListener('click', function () {
    const dateVal = document.getElementById('entretien-date').value;
    const candidatId = document.getElementById('entretien-candidat').value;
    const duree = document.getElementById('entretien-duree').value;
    const type = document.getElementById('entretien-type').value;
    const lieu = document.getElementById('entretien-lieu').value;
    const visio = document.getElementById('entretien-visio').value;
    const alertEl = document.getElementById('conflict-alert');

    if (!dateVal || !candidatId) {
      alertEl.textContent = 'Veuillez renseigner la date et le candidat.';
      alertEl.classList.remove('d-none');
      return;
    }

    alertEl.classList.add('d-none');

    fetch(CREATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN,
      },
      body: JSON.stringify({
        date_heure: dateVal,
        candidat_id: candidatId,
        duree: parseInt(duree, 10),
        type: type,
        lieu: lieu,
        lien_visio: visio,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          bootstrap.Modal.getInstance(document.getElementById('createModal')).hide();
          calendar.refetchEvents();
        } else {
          alertEl.textContent = data.error || 'Erreur lors de la création.';
          alertEl.classList.remove('d-none');
        }
      })
      .catch(function () {
        alertEl.textContent = 'Erreur réseau — veuillez réessayer.';
        alertEl.classList.remove('d-none');
      });
  });

  // -----------------------------------------------------------------------
  // Drag-to-reschedule
  // -----------------------------------------------------------------------
  function updateEntretienDate(eventId, newStartStr, info) {
    fetch(CREATE_URL.replace('create/', eventId + '/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN,
      },
      body: JSON.stringify({ date_heure: newStartStr }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.success) {
          info.revert();
          alert(data.error || 'Impossible de déplacer cet entretien.');
        }
      })
      .catch(function () {
        info.revert();
      });
  }
});
