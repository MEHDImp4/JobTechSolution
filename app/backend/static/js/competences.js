/**
 * competences.js — Phase 2 Plan 1
 * Initialise Select2 sur #id_competences_input avec autocomplete AJAX.
 * Met à jour un input caché #id_competences avec la valeur JSON pour le backend.
 */

(function ($) {
  'use strict';

  $(document).ready(function () {
    var $input = $('#id_competences_input');
    var $hidden = $('#id_competences');

    if (!$input.length) return;

    // -----------------------------------------------------------------------
    // Pré-remplissage depuis la valeur existante (mode édition)
    // -----------------------------------------------------------------------
    var existingValue = $input.val();
    var preselected = [];

    if (existingValue) {
      try {
        var parsed = JSON.parse(existingValue);
        if (Array.isArray(parsed)) {
          preselected = parsed.map(function (item) {
            var text = typeof item === 'object' ? (item.text || item.id || item) : item;
            return { id: text, text: text };
          });
        }
      } catch (e) {
        // Comma-separated fallback
        preselected = existingValue.split(',').map(function (s) {
          var t = s.trim();
          return { id: t, text: t };
        }).filter(function (o) { return o.id; });
      }
    }

    // -----------------------------------------------------------------------
    // Initialisation Select2
    // -----------------------------------------------------------------------
    $input.select2({
      theme: 'bootstrap-5',
      placeholder: 'Rechercher ou créer une compétence...',
      allowClear: true,
      tags: true,
      tokenSeparators: [',', ' '],
      ajax: {
        url: '/offres/competences/autocomplete/',
        dataType: 'json',
        delay: 250,
        data: function (params) {
          return { q: params.term };
        },
        processResults: function (data) {
          return {
            results: data.results.map(function (item) {
              return { id: item.id, text: item.text, categorie: item.categorie };
            })
          };
        },
        cache: true,
      },
      templateResult: function (item) {
        if (!item.id) return item.text;
        var $el = $('<span>');
        $el.text(item.text);
        if (item.categorie) {
          $el.append(' <small class="text-muted">(' + item.categorie + ')</small>');
        }
        return $el;
      },
    });

    // Pré-sélectionner les valeurs existantes
    if (preselected.length) {
      preselected.forEach(function (opt) {
        var option = new Option(opt.text, opt.id, true, true);
        $input.append(option);
      });
      $input.trigger('change');
    }

    // -----------------------------------------------------------------------
    // Synchroniser l'input caché à chaque changement
    // -----------------------------------------------------------------------
    function syncHidden() {
      var selected = $input.select2('data').map(function (item) {
        return item.text || item.id;
      });
      $hidden.val(JSON.stringify(selected));
    }

    $input.on('change', syncHidden);

    // Initialisation initiale
    syncHidden();
  });

})(jQuery);
