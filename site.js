/* La Maison du Pêcheur — galerie photo et calendrier */
(function () {
  var lang = document.documentElement.lang || 'fr';
  var L = {
    fr: ['Fermer', 'Précédente', 'Suivante'], en: ['Close', 'Previous', 'Next'],
    de: ['Schließen', 'Zurück', 'Weiter'], nl: ['Sluiten', 'Vorige', 'Volgende']
  }[lang] || ['×', '‹', '›'];

  // ---- Galerie (lightbox) ----
  var dlg = null, img = null, list = [], idx = 0;
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = '<img alt=""><div class="lb-bar"><button data-a="p">‹ ' + L[1] + '</button><button data-a="c">' + L[0] + '</button><button data-a="n">' + L[2] + ' ›</button></div>';
    document.body.appendChild(dlg);
    img = dlg.querySelector('img');
    dlg.addEventListener('click', function (ev) {
      var a = ev.target.getAttribute('data-a');
      if (a === 'p') show(idx - 1); else if (a === 'n') show(idx + 1);
      else if (a === 'c' || ev.target === dlg) dlg.close();
    });
    dlg.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') show(idx - 1);
      if (ev.key === 'ArrowRight') show(idx + 1);
    });
  }
  function show(i) {
    idx = (i + list.length) % list.length;
    img.src = list[idx].href;
    var t = list[idx].querySelector('img');
    img.alt = t ? t.alt : '';
  }
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var links = Array.prototype.slice.call(g.querySelectorAll('a.g-item'));
    links.forEach(function (a, i) {
      a.addEventListener('click', function (ev) {
        if (!window.HTMLDialogElement) return; // vieux navigateur : ouvre l'image
        ev.preventDefault();
        if (!dlg) build();
        list = links; show(i); dlg.showModal();
      });
    });
  });

  // ---- Calendrier (chargé seulement quand il devient visible) ----
  var cal = document.querySelector('[data-calendar]');
  if (!cal) return;
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function fail() { cal.innerHTML = '<p class="cal-error">' + cal.getAttribute('data-error') + '</p>'; cal.style.minHeight = '0'; }
  function init() {
    var base = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/';
    loadScript(base + 'index.global.min.js')
      .then(function () { return loadScript('https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.15/locales-all.global.min.js'); })
      .then(function () { return fetch(cal.getAttribute('data-calendar'), { cache: 'no-store' }); })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var c = new FullCalendar.Calendar(cal, {
          initialView: 'dayGridMonth',
          locale: cal.getAttribute('data-locale') === 'en' ? 'en-gb' : cal.getAttribute('data-locale'),
          height: 'auto',
          events: data.events || [],
          eventColor: '#9aa39e'
        });
        c.render();
        var lg = { fr: ['Réservé Airbnb', 'Réservé Booking', 'Fermé'], en: ['Booked (Airbnb)', 'Booked (Booking)', 'Closed'],
          de: ['Belegt (Airbnb)', 'Belegt (Booking)', 'Geschlossen'], nl: ['Bezet (Airbnb)', 'Bezet (Booking)', 'Gesloten'] }[lang] || ['Airbnb', 'Booking', '—'];
        var sw = function (c) { return '<span style="display:inline-block;width:12px;height:12px;border-radius:3px;margin:0 6px 0 14px;vertical-align:middle;background:' + c + '"></span>'; };
        cal.insertAdjacentHTML('beforebegin', '<p class="small">' + sw('#ff5a5f') + lg[0] + sw('#0071c2') + lg[1] + sw('#888') + lg[2] + '</p>');
      })
      .catch(fail);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); init(); }
    }, { rootMargin: '300px' });
    io.observe(cal);
  } else { init(); }
})();
