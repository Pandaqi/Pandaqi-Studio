// Injected with addInitScript, so it runs before any page script.
// 1. Capture unhandled rejections and errors (example callbacks throw asynchronously).
// 2. Seed Math.random from ?auditSeed= (appendix B), so generations are reproducible.
// 3. Wrap toDataURL to measure how much ink every canvas actually contains.
export const INSTRUMENT = `(function () {
  if (window.__audit) { return; }

  var A = { rejects: [], errors: [], renders: [] };
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
  var a = h >>> 0;
  Math.random = function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // --- canvas ink measurement ---
  var orig = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function (type, quality) {
    try {
      var w = this.width, h = this.height;
      if (w > 0 && h > 0) {
        var maxW = 480;
        var scale = Math.min(1, maxW / w);
        var tw = Math.max(1, Math.round(w * scale));
        var th = Math.max(1, Math.round(h * scale));
        var c = document.createElement("canvas");
        c.width = tw; c.height = th;
        var ctx = c.getContext("2d");
        ctx.drawImage(this, 0, 0, tw, th);
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
        A.renders.push({ w: w, h: h, inkRatio: inkRatio, thumb: orig.call(c, "image/png") });
      }
    } catch (err) {
      A.renders.push({ w: this.width, h: this.height, inkRatio: 0, thumb: null, error: "tainted" });
    }
    return orig.call(this, type, quality);
  };
})();`;
