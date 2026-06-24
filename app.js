/* ============================================================
   app.js — shared logic for the public catalogue
   ============================================================ */
(function () {
  "use strict";
  var STORE_KEY = "dubelart_data_v1";

  // --- data loading: localStorage override (admin edits on this device) > seed (data.js)
  function loadData() {
    var seed = { site: window.SITE || {}, works: window.ARTWORKS || [] };
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.works) return parsed;
      }
    } catch (e) { /* sandbox / disabled storage — fall back to seed */ }
    return seed;
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
    if (w.priceMode === "on_request" || !w.price) return "Price on request";
    return w.price;
  }

  function inquireHref(site, w) {
    var subj = "Inquiry — " + (w.artist || "") + ", " + (w.title || "");
    var body =
      "Hello,\n\nI would like more information about the following work:\n\n" +
      (w.artist || "") + " — " + (w.title || "") + (w.year ? " (" + w.year + ")" : "") + "\n" +
      (w.medium || "") + (w.dimensions ? ", " + w.dimensions : "") + "\n" +
      "Reference: " + (w.slug || w.id) + "\n\n" +
      "Please send a condition report and availability.\n\nThank you.";
    return "mailto:" + (site.email || "") +
      "?subject=" + encodeURIComponent(subj) +
      "&body=" + encodeURIComponent(body);
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
          '<span class="brand__mark">' + esc(monogram) + "</span>" +
          "<span><span class='brand__name'>" + esc(site.wordmarkA || "DUBEL") + " <b>" + esc(site.wordmarkB || "ART") + "</b></span>" +
          "<span class='brand__tag'>" + esc(site.tagline || "") + "</span></span>" +
        "</a>" +
        '<button class="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button>' +
        '<nav class="nav">' +
          '<a href="index.html">The Collection</a>' +
          '<a href="index.html#about">About</a>' +
          '<a href="index.html#contact">Contact</a>' +
          '<a class="btn" href="mailto:' + esc(site.email || "") + '">Inquire</a>' +
        "</nav>" +
      "</div></header>"
    );
  }

  function footerHtml(site) {
    return (
      '<footer class="site-footer" id="contact"><div class="wrap">' +
        '<div class="foot__grid">' +
          "<div><div class='foot__name'>" + esc(site.wordmarkA || "DUBEL") + " <b>" + esc(site.wordmarkB || "ART") + "</b></div>" +
            "<div class='foot__tag'>" + esc(site.tagline || "") + "</div></div>" +
          "<div><p class='foot__h'>Inquiries</p>" +
            "<p><a href='mailto:" + esc(site.email || "") + "'>" + esc(site.email || "") + "</a></p>" +
            "<p><a href='tel:" + esc((site.phone || "").replace(/\s/g, "")) + "'>" + esc(site.phone || "") + "</a></p></div>" +
          "<div><p class='foot__h'>Location</p><p>" + esc(site.address || "") + "</p></div>" +
        "</div>" +
        "<div class='foot__bottom'>" +
          "<span>© " + new Date().getFullYear() + " " + esc(site.name || "DUBEL ART") + " — " + esc(site.url || "") + "</span>" +
          "<a href='admin.html'>Manage catalogue</a>" +
        "</div>" +
      "</div></footer>"
    );
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
  }

  window.DubelArt = {
    loadData: loadData, esc: esc, statusInfo: statusInfo,
    priceText: priceText, inquireHref: inquireHref, mountChrome: mountChrome
  };
})();
