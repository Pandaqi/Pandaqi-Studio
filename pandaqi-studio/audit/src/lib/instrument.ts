// Injected with addInitScript, so it runs before any page script.
// 1. Capture unhandled rejections and errors (example callbacks throw asynchronously).
// 2. Seed Math.random from ?auditSeed= (appendix B), so generations are reproducible.
// 3. Record every canvas passed to toDataURL, but hold NO references to it and measure only two of
//    them. A generator can produce dozens of full-page canvases; keeping them alive (or decoding
//    pixels for each) is what made this harness eat a whole computer.
// 4. When the audit asks for renders, also capture a handful of PDF page previews (as JPEG thumbs)
//    through __auditCapturePdfPages, which generateMaterial calls before it releases each canvas.
export const INSTRUMENT = `(function () {
  if (window.__audit) { return; }

  var A = { rejects: [], errors: [], renders: [], pdfPages: [] };
  window.__audit = A;

  window.addEventListener("unhandledrejection", function (ev) {
    var r = ev && ev.reason;
    A.rejects.push(String((r && r.stack) || r));
  });

  window.addEventListener("error", function (ev) {
    A.errors.push(String((ev && ev.message) || ev));
  });

  // --- seeded RNG (appendix B) ---
  var seed = "audit";
  try { seed = new URLSearchParams(location.search).get("auditSeed") || "audit"; } catch (e) {}
  var h = 1779033703 ^ seed.length;
  for (var i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  var seedHash = h >>> 0;
  var a = seedHash;
  Math.random = function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // which render gets the full measurement; canvas 0 is always measured so there is always data
  var targetIndex = seedHash % 4;
  var origToDataURL = HTMLCanvasElement.prototype.toDataURL;

  // A downscaled thumbnail (white base, so a JPEG of a transparent page is not black) plus the ink
  // ratio. Used both for the one measured render and for the PDF page previews.
  var makeThumb = function (canvas, maxW, mime, quality) {
    var w = canvas.width, h = canvas.height;
    if (!w || !h) { return { w: w, h: h, inkRatio: 0, thumb: null, error: "empty" }; }

    try {
      var scale = Math.min(1, maxW / w);
      var tw = Math.max(1, Math.round(w * scale));
      var th = Math.max(1, Math.round(h * scale));
      var c = document.createElement("canvas");
      c.width = tw; c.height = th;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, tw, th);
      ctx.drawImage(canvas, 0, 0, tw, th);
      var data = ctx.getImageData(0, 0, tw, th).data;

      var counts = new Map();
      var n = 0;
      for (var p = 0; p < tw * th; p += 7) {
        var idx = p * 4;
        var key = (data[idx] * 16777216) + (data[idx + 1] * 65536) + (data[idx + 2] * 256) + data[idx + 3];
        counts.set(key, (counts.get(key) || 0) + 1);
        n++;
      }
      var max = 0;
      counts.forEach(function (v) { if (v > max) { max = v; } });
      var inkRatio = n > 0 ? 1 - (max / n) : 0;
      return { w: w, h: h, inkRatio: inkRatio, thumb: origToDataURL.call(c, mime, quality) };
    } catch (err) {
      return { w: w, h: h, inkRatio: 0, thumb: null, error: "tainted" };
    }
  };

  window.__auditMeasureCanvas = function (canvas) {
    return makeThumb(canvas, 480, "image/png", undefined);
  };

  // --- record renders without keeping them ---
  HTMLCanvasElement.prototype.toDataURL = function (type, quality) {
    try {
      var entry = { w: this.width, h: this.height };
      var index = A.renders.length;
      if (index === 0 || index === targetIndex) {
        var measured = window.__auditMeasureCanvas(this);
        entry.inkRatio = measured.inkRatio;
        entry.thumb = measured.thumb;
        if (measured.error) { entry.error = measured.error; }
      }
      A.renders.push(entry);
    } catch (err) {}
    return origToDataURL.call(this, type, quality);
  };

  // --- PDF page previews (only when --render asked for them) ---
  // generateMaterial calls this with every page canvas of one PDF, before the PDF builder caps the
  // document and before the canvas is released. Pages are picked spread across the document, so a
  // deck yields an early, a middle and a late page instead of three near-identical first pages.
  window.__auditCapturePdfPages = function (pdfName, canvases) {
    var opts = window.__auditPdf || {};
    if (!opts.capture || !canvases || !canvases.length) { return; }

    var perPdf = Math.max(1, opts.rendersPerPdf || 3);
    var total = Math.max(0, opts.rendersTotal || 12);
    if (A.pdfPages.length >= total) { return; }

    var n = canvases.length;
    var count = Math.min(perPdf, n);
    var picked = [];
    for (var k = 0; k < count; k++) {
      var idx = count === 1 ? 0 : Math.round(k * (n - 1) / (count - 1));
      if (picked.indexOf(idx) < 0) { picked.push(idx); }
    }

    for (var j = 0; j < picked.length; j++) {
      if (A.pdfPages.length >= total) { break; }
      var pageIndex = picked[j];
      var info = makeThumb(canvases[pageIndex], 1280, "image/jpeg", 0.82);
      info.pdf = String(pdfName || "document");
      info.index = pageIndex;
      info.total = n;
      A.pdfPages.push(info);
    }
  };

  window.__auditCollect = function () {
    return { rejects: A.rejects, errors: A.errors, renders: A.renders, pdfPages: A.pdfPages };
  };

  // one canvas that is currently inside a node (for examples that never call toDataURL)
  window.__auditMeasureIn = function (selector, index) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(selector + " canvas"));
    var canvas = nodes[index];
    return canvas ? window.__auditMeasureCanvas(canvas) : null;
  };
})();`;
