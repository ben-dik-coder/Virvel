(function () {
  "use strict";

  var YEAR_EL = document.getElementById("year");
  if (YEAR_EL) YEAR_EL.textContent = String(new Date().getFullYear());

  /* -------- Smooth scroll -------- */
  document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sel = btn.getAttribute("data-scroll-to");
      var el = sel ? document.querySelector(sel) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* -------- Mobile nav -------- */
  var nav = document.querySelector(".nav");
  var navToggle = document.getElementById("nav-toggle");
  var navPanel = document.getElementById("nav-panel");
  var navOverlay = document.getElementById("nav-overlay");

  function setNavOpen(open) {
    if (!nav || !navToggle || !navPanel) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Lukk meny" : "Åpne meny");
    document.body.style.overflow = open ? "hidden" : "";
    if (navOverlay) {
      navOverlay.hidden = !open;
      navOverlay.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setNavOpen(!nav.classList.contains("is-open"));
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", function () {
      setNavOpen(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav && nav.classList.contains("is-open")) {
      setNavOpen(false);
    }
  });

  window.addEventListener(
    "resize",
    function () {
      if (window.matchMedia("(min-width: 901px)").matches) setNavOpen(false);
    },
    { passive: true }
  );

  document.querySelectorAll('.nav__link[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 900px)").matches) setNavOpen(false);
    });
  });

  document.querySelectorAll(".nav [data-open-booking]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 900px)").matches) setNavOpen(false);
    });
  });

  var subParent = document.querySelector(".nav__item--has-sub");
  var subToggle = document.querySelector(".nav__sub-toggle");
  if (subParent && subToggle) {
    subToggle.addEventListener("click", function () {
      var open = subParent.classList.toggle("is-open");
      subToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* -------- Booking modal (iframe bestille.no) -------- */
  var BASE_BOOKING = "https://frisorvirvel.bestille.no/OnCust2/#!/booking";

  /** Synket med /OnCust2/api/Service — nøkkel må matche data-book-service eksakt */
  var SERVICE_MAP = {
    "Klipp/føn": { serviceId: 38, isCombined: false },
    "Herreklipp Linda": { serviceId: 60, isCombined: false },
    "Herreklipp og skjegg": { serviceId: 66, isCombined: false },
    "Skin fade": { serviceId: 58, isCombined: false },
    Skjegg: { serviceId: 59, isCombined: false },
    Herreklipp: { serviceId: 39, isCombined: false },
    "Barneklipp t.o.m 10år": { serviceId: 40, isCombined: false },
    "Farge kort hår fra": { serviceId: 41, isCombined: false },
    "Farge halvlangt hår fra": { serviceId: 42, isCombined: false },
    "Farge langt hår fra": { serviceId: 43, isCombined: false },
    "Folie kort hår fra": { serviceId: 44, isCombined: false },
    "Folie halvlangt hår fra": { serviceId: 45, isCombined: false },
    "Folie langt hår fra": { serviceId: 46, isCombined: false },
    "Leni's signatur behandling fra": { serviceId: 57, isCombined: false },
    "striper kort hår fra": { serviceId: 47, isCombined: false },
    "striper halvlangt hår fra": { serviceId: 48, isCombined: false },
    "striper langt hår fra": { serviceId: 49, isCombined: false },
    "Farge bryn": { serviceId: 51, isCombined: false },
    "Farge vipper": { serviceId: 52, isCombined: false },
    "Nappe bryn": { serviceId: 53, isCombined: false },
    "Hull i ørene": { serviceId: 61, isCombined: false },
    "Hull i ett øre": { serviceId: 62, isCombined: false },
    "Hull i nesen": { serviceId: 63, isCombined: false },
    "Klipp/føn og farge kort hår fra": { serviceId: 11, isCombined: true },
    "Klipp/føn og farge halvlangt hår fra": { serviceId: 13, isCombined: true },
    "Klipp/føn og farge langt hår fra": { serviceId: 14, isCombined: true },
    "Klipp/føn og folie kort hår fra": { serviceId: 12, isCombined: true },
    "Klipp/føn og folie halvlangt hår fra": { serviceId: 15, isCombined: true },
    "Klipp/føn og folie langt hår fra": { serviceId: 16, isCombined: true },
    "Klipp/føn og hettestriper kort hår fra": { serviceId: 10, isCombined: true },
    "Klipp/føn og hettestriper halvlangt hår fra": { serviceId: 17, isCombined: true },
    "Klipp/føn og hettestriper langt hår fra": { serviceId: 18, isCombined: true },
  };

  var BOOKING_SERVICE_API = "https://frisorvirvel.bestille.no/OnCust2/api/Service";
  /** Synket mot Service API — brukes hvis nettleseren ikke får hentet API (CORS / offline) */
  var BOOKING_HUB_ROWS = [
    { name: "Klipp/føn", price: 950, duration: 60, isCombined: false, sort: 34 },
    { name: "Herreklipp Linda", price: 650, duration: 60, isCombined: false, sort: 35 },
    { name: "Herreklipp og skjegg", price: 950, duration: 90, isCombined: false, sort: 35 },
    { name: "Skin fade", price: 680, duration: 60, isCombined: false, sort: 36 },
    { name: "Skjegg", price: 300, duration: 45, isCombined: false, sort: 36 },
    { name: "Herreklipp", price: 620, duration: 30, isCombined: false, sort: 36 },
    { name: "Barneklipp t.o.m 10år", price: 500, duration: 45, isCombined: false, sort: 37 },
    { name: "Farge kort hår fra", price: 990, duration: 90, isCombined: false, sort: 38 },
    { name: "Farge halvlangt hår fra", price: 1500, duration: 90, isCombined: false, sort: 39 },
    { name: "Farge langt hår fra", price: 1890, duration: 120, isCombined: false, sort: 40 },
    { name: "Folie kort hår fra", price: 1400, duration: 120, isCombined: false, sort: 41 },
    { name: "Folie halvlangt hår fra", price: 1700, duration: 150, isCombined: false, sort: 42 },
    { name: "Folie langt hår fra", price: 2100, duration: 150, isCombined: false, sort: 43 },
    { name: "Leni's signatur behandling fra", price: 2000, duration: 180, isCombined: false, sort: 43 },
    { name: "striper kort hår fra", price: 1090, duration: 90, isCombined: false, sort: 44 },
    { name: "striper halvlangt hår fra", price: 1700, duration: 120, isCombined: false, sort: 45 },
    { name: "striper langt hår fra", price: 2090, duration: 150, isCombined: false, sort: 46 },
    { name: "Farge bryn", price: 230, duration: 15, isCombined: false, sort: 48 },
    { name: "Farge vipper", price: 275, duration: 15, isCombined: false, sort: 49 },
    { name: "Nappe bryn", price: 200, duration: 15, isCombined: false, sort: 50 },
    { name: "Hull i ørene", price: 600, duration: 15, isCombined: false, sort: 50 },
    { name: "Hull i ett øre", price: 300, duration: 15, isCombined: false, sort: 50 },
    { name: "Hull i nesen", price: 400, duration: 15, isCombined: false, sort: 50 },
    { name: "Klipp/føn og farge kort hår fra", price: 1940, duration: 150, isCombined: true, sort: 51 },
    { name: "Klipp/føn og farge halvlangt hår fra", price: 2450, duration: 150, isCombined: true, sort: 52 },
    { name: "Klipp/føn og farge langt hår fra", price: 2840, duration: 180, isCombined: true, sort: 53 },
    { name: "Klipp/føn og folie kort hår fra", price: 2350, duration: 180, isCombined: true, sort: 54 },
    { name: "Klipp/føn og folie halvlangt hår fra", price: 2650, duration: 210, isCombined: true, sort: 55 },
    { name: "Klipp/føn og folie langt hår fra", price: 3050, duration: 210, isCombined: true, sort: 56 },
    { name: "Klipp/føn og hettestriper kort hår fra", price: 2040, duration: 150, isCombined: true, sort: 57 },
    { name: "Klipp/føn og hettestriper halvlangt hår fra", price: 2650, duration: 180, isCombined: true, sort: 58 },
    { name: "Klipp/føn og hettestriper langt hår fra", price: 3040, duration: 210, isCombined: true, sort: 59 },
  ];

  var modalBooking = document.getElementById("modal-booking");
  var bookingIframe = document.getElementById("booking-iframe");
  var bookingOpenTab = document.getElementById("booking-open-tab");
  var modalBookingTitle = document.getElementById("modal-booking-title");
  var modalBookingEyebrow = document.getElementById("modal-booking-eyebrow");
  var bookingLoader = document.getElementById("booking-embed-loading");
  var bookingFrameWrap = document.getElementById("booking-frame-wrap");
  var bookingHub = document.getElementById("booking-hub");
  var bookingEmbedPanel = document.getElementById("booking-embed-panel");
  var bookingHubFilter = document.getElementById("booking-hub-filter");
  var bookingHubSections = document.getElementById("booking-hub-sections");
  var bookingHubOpenFull = document.getElementById("booking-hub-open-full");
  var bookingHubServicesCache = null;
  var bookingHubIntroTimers = [];
  var bookingHubFilterTimer = null;
  var lastBookingSrc = "";
  var lastFocus = null;

  var BOOKING_LOADER_TIMEOUT_MS = 48000;
  var bookingLoaderWait = null;

  function bookingMinOverlayMs() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 500 : 2400;
  }

  function bookingAfterIframeLoadMs() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 700 : 3600;
  }

  function clearBookingLoaderWait() {
    if (!bookingLoaderWait) return;
    if (bookingLoaderWait.timeoutId) clearTimeout(bookingLoaderWait.timeoutId);
    if (bookingLoaderWait.minTimerId) clearTimeout(bookingLoaderWait.minTimerId);
    if (bookingLoaderWait.postLoadTimerId) clearTimeout(bookingLoaderWait.postLoadTimerId);
    bookingLoaderWait = null;
  }

  function finishBookingLoaderReveal() {
    clearBookingLoaderWait();
    if (!bookingLoader) return;
    bookingLoader.classList.add("booking-embed__loading--done");
    bookingLoader.setAttribute("aria-hidden", "true");
    if (bookingFrameWrap) bookingFrameWrap.setAttribute("aria-busy", "false");
    var doneMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 460;
    setTimeout(function () {
      if (bookingLoader) bookingLoader.hidden = true;
    }, doneMs);
  }

  function tryCompleteBookingLoader() {
    if (!bookingLoaderWait || !bookingLoaderWait.active) return;
    if (bookingLoaderWait.minOverlayDone && bookingLoaderWait.postLoadDone) {
      bookingLoaderWait.active = false;
      finishBookingLoaderReveal();
    }
  }

  function beginBookingLoaderWait() {
    clearBookingLoaderWait();
    bookingLoaderWait = {
      active: true,
      minOverlayDone: false,
      postLoadDone: false,
      postLoadTimerId: null,
      timeoutId: setTimeout(function () {
        if (!bookingLoaderWait || !bookingLoaderWait.active) return;
        bookingLoaderWait.minOverlayDone = true;
        bookingLoaderWait.postLoadDone = true;
        tryCompleteBookingLoader();
      }, BOOKING_LOADER_TIMEOUT_MS),
      minTimerId: setTimeout(function () {
        if (!bookingLoaderWait) return;
        bookingLoaderWait.minOverlayDone = true;
        tryCompleteBookingLoader();
      }, bookingMinOverlayMs()),
    };
  }

  function showBookingLoader() {
    if (!bookingLoader) return;
    bookingLoader.hidden = false;
    bookingLoader.classList.remove("booking-embed__loading--done");
    bookingLoader.removeAttribute("aria-hidden");
    if (bookingFrameWrap) bookingFrameWrap.setAttribute("aria-busy", "true");
    beginBookingLoaderWait();
  }

  function onBookingIframeLoad() {
    if (!bookingLoaderWait || !bookingLoaderWait.active) return;
    if (!bookingIframe || !bookingIframe.src || bookingIframe.src.indexOf("about:blank") === 0) return;
    if (bookingLoaderWait.postLoadTimerId) clearTimeout(bookingLoaderWait.postLoadTimerId);
    bookingLoaderWait.postLoadDone = false;
    bookingLoaderWait.postLoadTimerId = setTimeout(function () {
      if (!bookingLoaderWait || !bookingLoaderWait.active) return;
      bookingLoaderWait.postLoadDone = true;
      bookingLoaderWait.postLoadTimerId = null;
      tryCompleteBookingLoader();
    }, bookingAfterIframeLoadMs());
  }

  if (bookingIframe) {
    bookingIframe.addEventListener("load", onBookingIframeLoad);
  }

  function clearBookingHubIntro() {
    bookingHubIntroTimers.forEach(function (id) {
      clearTimeout(id);
    });
    bookingHubIntroTimers = [];
  }

  function escapeHtmlAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function formatNok(n) {
    try {
      return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
      }).format(n);
    } catch (e) {
      return Math.round(n) + "\u00a0kr";
    }
  }

  function normalizeHubRowsFromApi(apiRows) {
    var out = [];
    var i;
    for (i = 0; i < apiRows.length; i++) {
      var r = apiRows[i];
      if (!r.bookingAllowed || !r.visible) continue;
      if (!SERVICE_MAP[r.name]) continue;
      out.push({
        name: r.name,
        price: r.price,
        duration: r.duration || 0,
        isCombined: !!r.isCombined,
        sort: r.sort || 0,
      });
    }
    out.sort(function (a, b) {
      return a.sort - b.sort;
    });
    return out;
  }

  function hubCategory(row) {
    if (row.isCombined) {
      return { key: "combo", label: "Kombinasjoner", order: 2 };
    }
    var n = row.name.toLowerCase();
    if (/hull|bryn|vipper|nappe/.test(n)) {
      return { key: "detail", label: "Detaljer & piercing", order: 3 };
    }
    if (/klipp|herre|skin fade|skjegg|barne/.test(n)) {
      return { key: "cut", label: "Klipp & herre", order: 0 };
    }
    if (/farge|folie|striper|signatur/.test(n)) {
      return { key: "color", label: "Farge, folie & striper", order: 1 };
    }
    return { key: "other", label: "Flere tjenester", order: 4 };
  }

  function renderBookingHub(rows, filterText) {
    if (!bookingHubSections) return;
    var q = (filterText || "").trim().toLowerCase();
    var filtered = rows.filter(function (r) {
      if (!q) return true;
      return r.name.toLowerCase().indexOf(q) !== -1;
    });
    var groups = {};
    var i;
    for (i = 0; i < filtered.length; i++) {
      var row = filtered[i];
      var cat = hubCategory(row);
      var k = cat.key;
      if (!groups[k]) {
        groups[k] = { label: cat.label, order: cat.order, items: [] };
      }
      groups[k].items.push(row);
    }
    var order = ["cut", "color", "combo", "detail", "other"];
    var html = "";
    var gi;
    var key;
    var g;
    var j;
    var it;
    var nm;
    for (gi = 0; gi < order.length; gi++) {
      key = order[gi];
      g = groups[key];
      if (!g || !g.items.length) continue;
      /* Ved tomt søk: lukket til brukeren åpner. Ved søk: åpne grupper som har treff. */
      var detailsOpen = q ? " open" : "";
      html +=
        '<section class="booking-hub__section"><details class="booking-hub__details"' +
        detailsOpen +
        ">";
      html +=
        '<summary class="booking-hub__summary" id="bh-sec-' +
        escapeHtmlAttr(key) +
        '">';
      html += '<span class="booking-hub__summary-label">' + escapeHtmlAttr(g.label) + "</span>";
      html +=
        '<span class="booking-hub__summary-meta">' +
        g.items.length +
        "&nbsp;tjeneste" +
        (g.items.length !== 1 ? "r" : "") +
        "</span>";
      html += "</summary>";
      html += '<ul class="booking-hub__grid" role="list">';
      for (j = 0; j < g.items.length; j++) {
        it = g.items[j];
        nm = escapeHtmlAttr(it.name);
        html += '<li class="booking-hub__cell">';
        html +=
          '<button type="button" class="booking-hub__card" data-book-hub-service="' +
          nm +
          '">';
        html += '<span class="booking-hub__card-main">';
        html += '<span class="booking-hub__card-name">' + nm + "</span>";
        html +=
          '<span class="booking-hub__card-meta">' +
          it.duration +
          "&nbsp;min</span>";
        html += "</span>";
        html +=
          '<span class="booking-hub__card-price">' +
          escapeHtmlAttr(formatNok(it.price)) +
          "</span>";
        html += "</button></li>";
      }
      html += "</ul></details></section>";
    }
    if (!html) {
      html =
        '<p class="booking-hub__empty">Ingen treff. Prøv et annet søkeord.</p>';
    }
    bookingHubSections.innerHTML = html;
    bookingHubSections.querySelectorAll("[data-book-hub-service]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        proceedBookingFromHub(btn.getAttribute("data-book-hub-service"));
      });
    });
  }

  function applyBookingHeading(prefillService) {
    if (prefillService) {
      if (modalBookingEyebrow) modalBookingEyebrow.textContent = "Bestill";
      if (modalBookingTitle) modalBookingTitle.textContent = prefillService;
    } else {
      if (modalBookingEyebrow) modalBookingEyebrow.textContent = "Virvel";
      if (modalBookingTitle) modalBookingTitle.textContent = "Bestill time";
    }
  }

  function loadBookingIframe(prefillService) {
    var url = buildBookingUrl(prefillService || "");
    var iframeNeedsNavigate = bookingIframe && lastBookingSrc !== url;
    if (bookingOpenTab) {
      bookingOpenTab.href = url;
    }
    if (bookingIframe && iframeNeedsNavigate) {
      showBookingLoader();
      bookingIframe.src = url;
      lastBookingSrc = url;
    }
  }

  function proceedBookingFromHub(serviceName) {
    if (bookingHub) bookingHub.hidden = true;
    if (bookingEmbedPanel) bookingEmbedPanel.hidden = false;
    applyBookingHeading(serviceName || "");
    loadBookingIframe(serviceName || "");
    var dlg = modalBooking ? modalBooking.querySelector(".modal__dialog--booking-embed") : null;
    if (dlg) dlg.scrollTop = 0;
    var cb = modalBooking ? modalBooking.querySelector(".modal__close") : null;
    if (cb && typeof cb.focus === "function") cb.focus();
  }

  function bookingHubSkeletonHtml() {
    var html = '<div class="booking-hub__skeleton" aria-hidden="true">';
    var i;
    for (i = 0; i < 6; i++) {
      html += '<div class="booking-hub__skeleton-row"></div>';
    }
    html += "</div>";
    return html;
  }

  function ensureBookingHubData() {
    if (!bookingHubSections) return;

    function finish(rows) {
      bookingHubServicesCache = rows;
      renderBookingHub(rows, bookingHubFilter ? bookingHubFilter.value : "");
    }

    if (bookingHubServicesCache && bookingHubServicesCache.length) {
      finish(bookingHubServicesCache);
      return;
    }

    bookingHubSections.innerHTML = bookingHubSkeletonHtml();
    fetch(BOOKING_SERVICE_API, { credentials: "omit", mode: "cors" })
      .then(function (r) {
        if (!r.ok) throw new Error("api");
        return r.json();
      })
      .then(function (data) {
        var rows = normalizeHubRowsFromApi(data);
        if (!rows.length) throw new Error("empty");
        finish(rows);
      })
      .catch(function () {
        finish(BOOKING_HUB_ROWS.slice());
      });
  }

  function startBookingHubIntro() {
    clearBookingHubIntro();
    if (!bookingHub) return;
    bookingHub.classList.remove("booking-hub--curtain-up");
    bookingHub.classList.remove("booking-hub--ready");
    void bookingHub.offsetWidth;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      bookingHub.classList.add("booking-hub--curtain-up");
      bookingHub.classList.add("booking-hub--ready");
      return;
    }
    bookingHubIntroTimers.push(
      setTimeout(function () {
        bookingHub.classList.add("booking-hub--curtain-up");
      }, 1380)
    );
    bookingHubIntroTimers.push(
      setTimeout(function () {
        bookingHub.classList.add("booking-hub--ready");
      }, 3430)
    );
    bookingHubIntroTimers.push(
      setTimeout(function () {
        if (bookingHubFilter && document.body.contains(bookingHubFilter)) {
          bookingHubFilter.focus();
        }
      }, 3510)
    );
  }

  /** booking URL må bruke samme searchType som avdelingen (API: Department/GetPreferences → cust2016_DefaultSearchMethod = quick2) */
  function buildBookingUrl(prefillService) {
    if (!prefillService) return BASE_BOOKING;
    var spec = SERVICE_MAP[prefillService];
    if (!spec) return BASE_BOOKING;
    /* 0/1 — ikke true/false i URL: ui-router tolker strengen "false" som bool true, og API-kallet feiler */
    return (
      BASE_BOOKING +
      "?searchType=quick2&serviceId=" +
      encodeURIComponent(spec.serviceId) +
      "&isCombined=" +
      (spec.isCombined ? "1" : "0")
    );
  }

  function openBooking(prefillService) {
    if (!modalBooking) return;
    lastFocus = document.activeElement;

    var useHub = !prefillService;
    if (useHub) {
      bookingHubServicesCache = null;
      applyBookingHeading("");
      if (bookingEmbedPanel) bookingEmbedPanel.hidden = true;
      var dlgHub = modalBooking.querySelector(".modal__dialog--booking-embed");
      if (dlgHub) dlgHub.scrollTop = 0;
      if (bookingHub) {
        bookingHub.hidden = false;
        startBookingHubIntro();
        ensureBookingHubData();
      }
    } else {
      if (bookingHub) bookingHub.hidden = true;
      if (bookingEmbedPanel) bookingEmbedPanel.hidden = false;
      applyBookingHeading(prefillService);
      loadBookingIframe(prefillService);
      var dlgOpen = modalBooking.querySelector(".modal__dialog--booking-embed");
      if (dlgOpen) dlgOpen.scrollTop = 0;
    }

    modalBooking.hidden = false;
    document.body.style.overflow = "hidden";

    var closeBtn = modalBooking.querySelector(".modal__close");
    if (!useHub && closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();

    document.removeEventListener("keydown", onBookingKeydown);
    document.addEventListener("keydown", onBookingKeydown);
  }

  function closeBooking() {
    if (!modalBooking || modalBooking.hidden) return;
    clearBookingHubIntro();
    clearBookingLoaderWait();
    if (bookingHubFilter) bookingHubFilter.value = "";
    if (bookingLoader) {
      bookingLoader.hidden = true;
      bookingLoader.classList.add("booking-embed__loading--done");
      bookingLoader.setAttribute("aria-hidden", "true");
    }
    if (bookingFrameWrap) bookingFrameWrap.setAttribute("aria-busy", "false");
    modalBooking.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onBookingKeydown);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function onBookingKeydown(e) {
    if (e.key === "Escape") closeBooking();
  }

  document.querySelectorAll("[data-open-booking]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openBooking();
    });
  });

  document.querySelectorAll("[data-book-service]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openBooking(btn.getAttribute("data-book-service"));
    });
  });

  if (modalBooking) {
    modalBooking.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeBooking);
    });
  }

  if (bookingHubOpenFull) {
    bookingHubOpenFull.addEventListener("click", function () {
      proceedBookingFromHub("");
    });
  }

  if (bookingHubFilter) {
    bookingHubFilter.addEventListener("input", function () {
      if (bookingHubFilterTimer) clearTimeout(bookingHubFilterTimer);
      bookingHubFilterTimer = setTimeout(function () {
        if (bookingHubServicesCache && bookingHubServicesCache.length) {
          renderBookingHub(bookingHubServicesCache, bookingHubFilter.value);
        }
      }, 120);
    });
  }

  /* -------- Contact form -------- */
  var contactForm = document.getElementById("contact-form");

  function showFieldError(input, msg) {
    var id = input.id;
    var err = document.querySelector('[data-error-for="' + id + '"]');
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg || "";
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validatePhone(v) {
    var digits = v.replace(/\D/g, "");
    return digits.length >= 8;
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var n = document.getElementById("cf-name");
      var em = document.getElementById("cf-email");
      var msg = document.getElementById("cf-msg");
      var st = document.getElementById("contact-form-status");

      if (n && n.value.trim().length < 2) {
        showFieldError(n, "Skriv inn navn.");
        ok = false;
      } else if (n) showFieldError(n, "");

      if (em && !validateEmail(em.value.trim())) {
        showFieldError(em, "Ugyldig e-post.");
        ok = false;
      } else if (em) showFieldError(em, "");

      if (msg && msg.value.trim().length < 10) {
        showFieldError(msg, "Meldingen bør være minst 10 tegn.");
        ok = false;
      } else if (msg) showFieldError(msg, "");

      if (!ok) {
        if (st) st.textContent = "";
        return;
      }

      if (st) st.textContent = "Takk — meldingen er sendt. Vi svarer så fort vi kan.";
      showToast("Melding sendt");
      contactForm.reset();
    });
  }

  function showToast(text) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = text;
    t.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      t.hidden = true;
    }, 3200);
  }

  /* -------- Accordion -------- */
  var accRoot = document.querySelector("[data-accordion]");
  if (accRoot) {
    accRoot.querySelectorAll(".accordion__head").forEach(function (head) {
      head.addEventListener("click", function () {
        var item = head.closest(".accordion__item");
        var panelId = head.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!item || !panel) return;

        var wasOpen = item.classList.contains("is-open");
        accRoot.querySelectorAll(".accordion__item").forEach(function (other) {
          var h = other.querySelector(".accordion__head");
          var pId = h && h.getAttribute("aria-controls");
          var p = pId ? document.getElementById(pId) : null;
          other.classList.remove("is-open");
          if (h) h.setAttribute("aria-expanded", "false");
          if (p) p.hidden = true;
        });

        if (!wasOpen) {
          item.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  /* -------- Team modal -------- */
  var TEAM = {
    leni: {
      title: "Leni",
      body:
        "Leni gjør alt fra klipp og farge til folie og striper — og ja, hun har «Leni's signatur». Liker å snakke seg fram til noe som henger sammen, ikke bare én isolert ting.",
    },
    linda: {
      title: "Linda",
      body:
        "Mange kjenner henne fra «Herreklipp Linda» i booking. Linda tar også farge og piercing, så det er lov å komme med flere ønsker på én time.",
    },
    janeth: {
      title: "Janeth",
      body:
        "Janeth tar seg god tid til å forstå hva du vil — og er grundig mens hun holder på.",
    },
    camilla: {
      title: "Camilla",
      body:
        "Camilla jobber mest med klipp og styling som passer deg og håret ditt i hverdagen.",
    },
    berit: {
      title: "Berit",
      body:
        "Berit er med på alt som skal på plass i salongen, sammen med de andre — slik at dere som kommer inn slipper surr.",
    },
    ragnhild: {
      title: "Ragnhild",
      body:
        "Ragnhild er med på laget og passer på at du blir tatt imot og ivaretatt mens du er her.",
    },
  };

  var modalTeam = document.getElementById("modal-team");
  var modalTeamTitle = document.getElementById("modal-team-title");
  var modalTeamBody = document.getElementById("modal-team-body");

  function openTeam(key) {
    var data = TEAM[key];
    if (!data || !modalTeam) return;
    lastFocus = document.activeElement;
    if (modalTeamTitle) modalTeamTitle.textContent = data.title;
    if (modalTeamBody) modalTeamBody.textContent = data.body;
    modalTeam.hidden = false;
    var closeBtn = modalTeam.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", onTeamKeydown);
  }

  function closeTeam() {
    if (!modalTeam || modalTeam.hidden) return;
    modalTeam.hidden = true;
    document.removeEventListener("keydown", onTeamKeydown);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function onTeamKeydown(e) {
    if (e.key === "Escape") closeTeam();
  }

  document.querySelectorAll("[data-team-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openTeam(btn.getAttribute("data-team-open"));
    });
  });

  if (modalTeam) {
    modalTeam.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeTeam);
    });
  }

  /* -------- Gallery lightbox -------- */
  var GALLERY_SRC = ["css/3.PNG", "css/4.PNG", "css/5.PNG"];
  var GALLERY_ALT = ["Arbeid fra Virvel, bilde 1", "Arbeid fra Virvel, bilde 2", "Arbeid fra Virvel, bilde 3"];

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox__img") : null;
  var lbIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    lbIndex = index;
    lightboxImg.src = GALLERY_SRC[index];
    lightboxImg.alt = GALLERY_ALT[index] || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onLightboxKeydown);
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onLightboxKeydown);
  }

  function onLightboxKeydown(e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  }

  function showLightbox(i) {
    var n = GALLERY_SRC.length;
    var idx = ((i % n) + n) % n;
    openLightbox(idx);
  }

  document.querySelectorAll("[data-gallery-index]").forEach(function (cell) {
    cell.addEventListener("click", function () {
      var idx = parseInt(cell.getAttribute("data-gallery-index"), 10);
      if (!isNaN(idx)) openLightbox(idx);
    });
  });

  if (lightbox) {
    lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    var prev = lightbox.querySelector(".lightbox__prev");
    var next = lightbox.querySelector(".lightbox__next");
    if (prev) prev.addEventListener("click", function () { showLightbox(lbIndex - 1); });
    if (next) next.addEventListener("click", function () { showLightbox(lbIndex + 1); });
  }

  /* -------- Google reviews carousel -------- */
  var GOOGLE_REVIEWS_LINK =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Virvel Narvik AS Kirkegata 34 Narvik");

  var GOOGLE_REVIEWS_META = {
    scoreText: "4,8",
    countText: "30+ anmeldelser",
  };

  /**
   * Basert på Google Maps-anmeldelser for Virvel Narvik AS — kun fornavn, norsk tekst uten emoji.
   */
  var GOOGLE_REVIEWS_LIST = [
    {
      text: "Veldig hyggelige frisører. Fantastisk salong.",
      author: "Toril",
      rating: 5,
      time: "for 3 år siden",
    },
    {
      text:
        "Hadde en veldig hyggelig og fin opplevelse med Janeth. Hun var grundig og forsto nøyaktig hva jeg ønsket. Har du hatt dårlige opplevelser andre steder, anbefaler jeg Virvel.",
      author: "Isak",
      rating: 5,
      time: "for 2 år siden",
    },
    {
      text: "Super service! Camilla får til og med orden på sveisen min.",
      author: "Hans",
      rating: 5,
      time: "for 7 år siden",
    },
    {
      text: "Som alltid koser jeg meg her – frisøren gjør en veldig god jobb.",
      author: "Jorun",
      rating: 5,
      time: "for 4 år siden",
    },
    {
      text: "Fint sted, og veldig flinke frisører.",
      author: "Kirsten",
      rating: 5,
      time: "for 4 år siden",
    },
    {
      text: "Et fantastisk og vakkert sted.",
      author: "Muneer",
      rating: 5,
      time: "for 4 år siden",
    },
    {
      text: "God opplevelse.",
      author: "Ruben",
      rating: 4,
      time: "for 1 år siden",
    },
    {
      text: "Fornøyd kunde.",
      author: "Kristin",
      rating: 5,
      time: "for 2 år siden",
    },
    {
      text: "Fornøyd.",
      author: "Marit",
      rating: 5,
      time: "for 2 år siden",
    },
    {
      text: "God opplevelse.",
      author: "Inger Lill",
      rating: 4,
      time: "for 3 år siden",
    },
    {
      text: "Koselig å være her. Veldig fornøyd med servicen. Flinke frisører.",
      author: "Gunnhild",
      rating: 5,
      time: "for 8 år siden",
    },
    {
      text: "Gode og veldig hyggelige frisører.",
      author: "Kaj",
      rating: 5,
      time: "for 6 år siden",
    },
    {
      text: "Som alltid en god opplevelse.",
      author: "Ingvild",
      rating: 5,
      time: "for 5 år siden",
    },
    {
      text: "Veldig fornøyd, flinke fagfolk.",
      author: "Willy",
      rating: 5,
      time: "for 7 år siden",
    },
    {
      text: "Dyktige frisører som tar deg godt imot.",
      author: "Lindis",
      rating: 5,
      time: "for 2 år siden",
    },
    {
      text: "Linda er superflink.",
      author: "Boy-Arne",
      rating: 5,
      time: "for 6 måneder siden",
    },
    {
      text: "Helt topp som alltid.",
      author: "Sølvi",
      rating: 5,
      time: "for 5 år siden",
    },
    {
      text: "Helt topp.",
      author: "Turid",
      rating: 5,
      time: "for 3 år siden",
    },
    {
      text: "Takk til alle på Virvel.",
      author: "Kjell",
      rating: 5,
      time: "for 7 år siden",
    },
    {
      text: "Alltid god service.",
      author: "Alf",
      rating: 5,
      time: "for 3 år siden",
    },
    {
      text: "Bra opplevelse og hyggelig folk.",
      author: "Evy",
      rating: 4,
      time: "for 4 år siden",
    },
    {
      text: "Hyggelig besøk.",
      author: "Mona",
      rating: 5,
      time: "for 4 år siden",
    },
    {
      text: "Hyggelig og profesjonelt.",
      author: "Siv Anita",
      rating: 5,
      time: "for 5 år siden",
    },
    {
      text: "Anbefaler Virvel.",
      author: "Carina",
      rating: 5,
      time: "for 5 år siden",
    },
    {
      text: "Veldig bra.",
      author: "Daniela",
      rating: 4,
      time: "for 6 år siden",
    },
    {
      text: "Fin salong og god stemning.",
      author: "Charlotte",
      rating: 4,
      time: "for 8 år siden",
    },
    {
      text: "God opplevelse.",
      author: "Matias",
      rating: 5,
      time: "for 8 år siden",
    },
  ];

  function initReviewsCarousel() {
    var carousel = document.getElementById("reviews-carousel");
    var track = document.getElementById("reviews-track");
    var dotsWrap = document.getElementById("reviews-dots");
    var prevBtn = document.querySelector("[data-reviews-prev]");
    var nextBtn = document.querySelector("[data-reviews-next]");
    var scoreEl = document.getElementById("reviews-google-score");
    var countEl = document.getElementById("reviews-google-count");
    var linkEl = document.getElementById("reviews-google-link");

    if (!carousel || !track || !dotsWrap || !GOOGLE_REVIEWS_LIST.length) return;

    if (scoreEl) scoreEl.textContent = GOOGLE_REVIEWS_META.scoreText;
    if (countEl) countEl.textContent = GOOGLE_REVIEWS_META.countText;
    if (linkEl) linkEl.href = GOOGLE_REVIEWS_LINK;

    var idx = 0;
    var timer = null;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var autoplayMs = reducedMotion || GOOGLE_REVIEWS_LIST.length < 2 ? 0 : 6200;

    function escapeHtml(str) {
      var d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }

    function starsHtml(rating) {
      var r = Math.max(0, Math.min(5, Math.round(Number(rating)) || 0));
      var out = "";
      var i;
      for (i = 0; i < r; i++) out += "★";
      for (; i < 5; i++) out += '<span class="reviews-slide__star--dim">★</span>';
      return out;
    }

    function updateDots() {
      var btns = dotsWrap.querySelectorAll(".reviews-carousel__dot");
      var j;
      for (j = 0; j < btns.length; j++) {
        btns[j].classList.toggle("is-active", j === idx);
        btns[j].setAttribute("aria-selected", j === idx ? "true" : "false");
      }
    }

    function applyTransform() {
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      updateDots();
      carousel.setAttribute("aria-label", "Anmeldelse " + (idx + 1) + " av " + GOOGLE_REVIEWS_LIST.length);
    }

    function goTo(i) {
      var n = GOOGLE_REVIEWS_LIST.length;
      idx = ((i % n) + n) % n;
      applyTransform();
      restartTimer();
    }

    function next() {
      goTo(idx + 1);
    }

    function prev() {
      goTo(idx - 1);
    }

    function restartTimer() {
      if (timer) clearInterval(timer);
      timer = null;
      if (autoplayMs <= 0 || GOOGLE_REVIEWS_LIST.length < 2) return;
      timer = setInterval(next, autoplayMs);
    }

    function stopTimer() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    GOOGLE_REVIEWS_LIST.forEach(function (rev, slideIdx) {
      var li = document.createElement("li");
      li.className = "reviews-carousel__slide";
      li.setAttribute("role", "group");
      li.setAttribute("aria-roledescription", "slide");
      li.id = "reviews-slide-" + slideIdx;
      li.innerHTML =
        '<blockquote class="reviews-slide__quote">«' +
        escapeHtml(rev.text) +
        '»</blockquote><div class="reviews-slide__meta">' +
        '<cite class="reviews-slide__cite">' +
        escapeHtml(rev.author) +
        "</cite>" +
        '<span class="reviews-slide__stars" aria-label="' +
        escapeHtml(String(rev.rating)) +
        ' av 5">' +
        starsHtml(rev.rating) +
        "</span>" +
        '<span class="reviews-slide__time">' +
        escapeHtml(rev.time) +
        "</span></div>";
      track.appendChild(li);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-carousel__dot";
      dot.setAttribute("aria-label", "Vis anmeldelse " + (slideIdx + 1));
      dot.setAttribute("aria-controls", "reviews-slide-" + slideIdx);
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", slideIdx === 0 ? "true" : "false");
      (function (targetIdx) {
        dot.addEventListener("click", function () {
          goTo(targetIdx);
        });
      })(slideIdx);
      dotsWrap.appendChild(dot);
    });

    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", restartTimer);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) restartTimer();
            else stopTimer();
          });
        },
        { threshold: 0.2 }
      );
      io.observe(carousel);
    }

    applyTransform();
    if (!("IntersectionObserver" in window)) {
      restartTimer();
    }
  }

  initReviewsCarousel();

  /* -------- Scroll reveal -------- */
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var reveals = document.querySelectorAll(".reveal");
    if (reveals.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-visible");
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* -------- Kart (Leaflet — skarpere enn OSM-iframe, ingen stor bunnbanner) -------- */
  function initSalonMap() {
    var el = document.getElementById("salon-map");
    if (!el || typeof L === "undefined") return;
    var lat = 68.4376;
    var lon = 17.4282;
    var map = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([lat, lon], 18);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup("<strong>Virvel frisør</strong><br>Kongens gate 15");
    function resizeMap() {
      map.invalidateSize();
    }
    requestAnimationFrame(resizeMap);
    setTimeout(resizeMap, 450);
    window.addEventListener("resize", resizeMap, { passive: true });
  }

  initSalonMap();
})();
