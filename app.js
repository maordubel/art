/* ============================================================
   app.js — shared logic for the public catalogue
   ============================================================ */
(function () {
  "use strict";
  var STORE_KEY = "dubelart_data_v1";
  var CLOUD_CACHE = "dubelart_cloud_v1";
  var CLOUD_TTL = 5 * 60 * 1000; // serve cache instantly, refresh from cloud at most this often
  var CLOUD_BASE = "https://api.jsonbin.io/v3/b/";
  var loadedSite = null;

  function isPreview() {
    try { return /[?&]preview=1(\b|&|$)/.test(location.search); } catch (e) { return false; }
  }
  function cloudCfg() {
    var s = window.SITE || {};
    return (s.cloudBinId && s.cloudReadKey) ? s : null;
  }
  function readCloudCache() {
    try { var c = JSON.parse(localStorage.getItem(CLOUD_CACHE) || "null"); if (c && c.data && c.data.works) return c; } catch (e) {}
    return null;
  }

  // Instant data for first render: cloud cache (public) or local edits (preview) or bundled seed.
  function loadData() {
    var seed = { site: window.SITE || {}, works: window.ARTWORKS || [] };
    if (isPreview()) {
      var data = seed;
      try { var raw = localStorage.getItem(STORE_KEY); if (raw) { var p = JSON.parse(raw); if (p && p.works) data = p; } } catch (e) {}
      loadedSite = data.site || {};
      return data;
    }
    if (cloudCfg()) {
      var c = readCloudCache();
      if (c) { loadedSite = c.data.site || {}; return c.data; }
    }
    loadedSite = seed.site || {};
    return seed;
  }

  // Fetch the latest catalogue from the cloud store (JSONBin). cb(data|null).
  function fetchCloud(s, cb) {
    if (typeof fetch !== "function") { cb(null); return; }
    var url = CLOUD_BASE + encodeURIComponent(s.cloudBinId) + "/latest";
    fetch(url, { headers: { "X-Access-Key": s.cloudReadKey, "X-Bin-Meta": "false" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.works) cb(j);
        else if (j && j.record && j.record.works) cb(j.record); // if meta wasn't stripped
        else cb(null);
      })
      .catch(function () { cb(null); });
  }

  // Render-now-then-sync: calls cb immediately with instant data, then again if the cloud has newer data.
  function onData(cb) {
    var instant = loadData();
    cb(instant);
    if (isPreview()) return;
    var s = cloudCfg(); if (!s) return;
    var c = readCloudCache();
    if (c && (Date.now() - (c.t || 0) < CLOUD_TTL)) return; // cache still fresh — skip the request
    fetchCloud(s, function (cloud) {
      if (!cloud || !cloud.works) return;
      try { localStorage.setItem(CLOUD_CACHE, JSON.stringify({ t: Date.now(), data: cloud })); } catch (e) {}
      if (JSON.stringify(cloud) !== JSON.stringify(instant)) { loadedSite = cloud.site || {}; cb(cloud); }
    });
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
    loadData: loadData, onData: onData, esc: esc, statusInfo: statusInfo,
    priceText: priceText, mountChrome: mountChrome
  };
})();
