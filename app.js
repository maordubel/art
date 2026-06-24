/* ============================================================
   app.js — shared logic for the public catalogue
   ============================================================ */
(function () {
  "use strict";
  var STORE_KEY = "dubelart_data_v1";
  var loadedSite = null;

  // --- data loading: localStorage override (admin edits on this device) > seed (data.js)
  function loadData() {
    var seed = { site: window.SITE || {}, works: window.ARTWORKS || [] };
    var preview = false;
    try { preview = /[?&]preview=1(\b|&|$)/.test(location.search); } catch (e) {}
    if (!preview) {
      // PUBLIC: the published data.js is the single source of truth for every device.
      loadedSite = seed.site || {};
      return seed;
    }
    // PREVIEW mode (admin "View site"): show this device's unpublished local edits.
    var data = seed;
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) { var parsed = JSON.parse(raw); if (parsed && parsed.works) data = parsed; }
    } catch (e2) {}
    loadedSite = data.site || {};
    return data;
  }

  function hiddenPriceLabel() {
    return (loadedSite && loadedSite.priceHiddenLabel) || (window.SITE && window.SITE.priceHiddenLabel) || "Contact for price";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function statusInfo(w) {
    var s = (w.status || "available").toLowerCase();
    if (s === "sold") return { key: "sold", label: "Sold" };
    if (s === "reserved") return { key: "reserved", label: "Reserved" };
    return { key: "available", label: "Available" };
  }

  function priceText(w) {
    if (w.priceMode === "sold" || (w.status || "") === "sold") return "Sold";
    if (w.priceMode === "on_request" || !w.price) return hiddenPriceLabel();
    return w.price;
  }

  // --- site chrome ---------------------------------------------------------
  function tickerHtml(site) {
    var items = (site.ticker && site.ticker.length ? site.ticker : ["PRIVATE SALE"]);
    var run = items.map(function (t) { return "<span>" + esc(t) + "</span><b>+</b>"; }).join("");
    return '<div class="ticker"><div class="ticker__track">' + run + run + "</div></div>";
  }

  function headerHtml(site) {
    var monogram = (site.wordmarkA ? site.wordmarkA[0] : "D") + (site.wordmarkB ? site.wordmarkB[0] : "A");
    return (
      '<header class="site-header"><div class="wrap">' +
        '<a class="brand" href="index.html">' +
          "<span class='brand__mark brand__mark--logo'><img src='" + esc(site.logo || "images/logo.png") + "' alt='" + esc(site.name || "DUBEL TEAM") + "' onerror=\"this.parentNode.classList.remove('brand__mark--logo');this.parentNode.textContent='" + esc(monogram) + "'\"></span>" +
          "<span><span class='brand__name'>" + esc(site.wordmarkA || "DUBEL") + " <b>" + esc(site.wordmarkB || "ART") + "</b></span>" +
          "<span class='brand__tag'>" + esc(site.tagline || "") + "</span></span>" +
        "</a>" +
        '<button class="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button>' +
        '<nav class="nav">' +
          '<a href="index.html">The Collection</a>' +
          '<a href="index.html#about">About</a>' +
          '<a href="contact.html">Contact</a>' +
          '<a class="btn" href="contact.html">Inquire</a>' +
        "</nav>" +
      "</div></header>"
    );
  }

  function footerHtml(site) {
    return (
      '<footer class="site-footer" id="contact"><div class="wrap">' +
        '<div class="foot__grid">' +
          "<div><img class='foot__logo' src='" + esc(site.logo || "images/logo.png") + "' alt='' onerror=\"this.style.display='none'\">" +
            "<div class='foot__name'>" + esc(site.wordmarkA || "DUBEL") + " <b>" + esc(site.wordmarkB || "ART") + "</b></div>" +
            "<div class='foot__tag'>" + esc(site.tagline || "") + "</div></div>" +
          "<div><p class='foot__h'>Enquiries</p>" +
            "<p><a href='contact.html'>Make an enquiry &rarr;</a></p>" +
            "<p>Private viewings by appointment.</p></div>" +
          "<div><p class='foot__h'>The Department</p>" +
            "<p>Private sale</p><p>Worldwide shipping</p><p>Provenance on request</p></div>" +
        "</div>" +
        "<div class='foot__bottom'>" +
          "<span>© " + new Date().getFullYear() + " " + esc(site.name || "DUBEL ART") + " — Dubel Team, Art Department</span>" +
          "<span>" + esc(site.url || "") + "</span>" +
        "</div>" +
      "</div></footer>"
    );
  }

  function injectAnalytics(site) {
    var id = site && site.analyticsId;
    if (!id || !/^G-[A-Z0-9]+$/i.test(id) || window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id);
  }

  function mountChrome(site) {
    var head = document.getElementById("site-chrome");
    if (head) head.innerHTML = tickerHtml(site) + headerHtml(site);
    var foot = document.getElementById("site-footer");
    if (foot) foot.outerHTML = footerHtml(site);
    // mobile nav toggle
    var btn = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (btn && nav) {
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    injectAnalytics(site);
  }

  window.DubelArt = {
    loadData: loadData, esc: esc, statusInfo: statusInfo,
    priceText: priceText, mountChrome: mountChrome
  };
})();
