/* Hero background: a supernova remnant shell, drawn procedurally.
   The shell expands once on page load with Sedov-Taylor scaling (R ∝ t^0.4)
   on comoving coordinates, the way an expanding mesh follows the flow,
   then holds still. Colours use the inferno colormap. */
(function () {
  var canvas = document.querySelector('.hero__shell');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // inferno colormap stops
  var stops = [
    [0.00, 0, 0, 4], [0.13, 27, 12, 65], [0.25, 74, 12, 107], [0.38, 120, 28, 109],
    [0.50, 165, 44, 96], [0.63, 207, 68, 70], [0.75, 237, 105, 37], [0.88, 251, 155, 6],
    [1.00, 252, 255, 164]
  ];
  var LUT = new Uint8ClampedArray(256 * 3);
  for (var i = 0; i < 256; i++) {
    var t = i / 255, k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    var a = stops[k], b = stops[k + 1], f = (t - a[0]) / (b[0] - a[0]);
    LUT[i * 3] = a[1] + (b[1] - a[1]) * f;
    LUT[i * 3 + 1] = a[2] + (b[2] - a[2]) * f;
    LUT[i * 3 + 2] = a[3] + (b[3] - a[3]) * f;
  }

  // value noise
  var P = new Uint8Array(512);
  var seed = 1181;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  for (i = 0; i < 256; i++) P[i] = i;
  for (i = 255; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var s = P[i]; P[i] = P[j]; P[j] = s; }
  for (i = 0; i < 256; i++) P[i + 256] = P[i];
  var G = new Float32Array(256);
  for (i = 0; i < 256; i++) G[i] = rnd();
  function noise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    xi &= 255; yi &= 255;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var aa = G[P[P[xi] + yi]], ba = G[P[P[xi + 1] + yi]];
    var ab = G[P[P[xi] + yi + 1]], bb = G[P[P[xi + 1] + yi + 1]];
    return (aa + (ba - aa) * u) + ((ab + (bb - ab) * u) - (aa + (ba - aa) * u)) * v;
  }
  function ridge(x, y) {
    var sum = 0, amp = 0.55, fr = 1;
    for (var o = 0; o < 3; o++) {
      var n = 1 - Math.abs(noise(x * fr, y * fr) * 2 - 1);
      sum += n * n * n * amp; amp *= 0.5; fr *= 2.03;
    }
    return sum;
  }

  // edge perturbation per angle: Rayleigh-Taylor fingers along the contact surface
  var NA = 2048, EDGE = new Float32Array(NA);
  for (i = 0; i < NA; i++) {
    var th = (i / NA) * Math.PI * 2, cx = Math.cos(th), sy = Math.sin(th);
    EDGE[i] = 1 + 0.045 * (noise(cx * 3 + 9, sy * 3 + 9) - 0.5)
                + 0.03 * Math.pow(noise(cx * 14 + 40, sy * 14 + 40), 3)
                + 0.012 * noise(cx * 40 + 70, sy * 40 + 70);
  }

  var buf = document.createElement('canvas'), bctx = buf.getContext('2d');
  var W, H, BW, BH, img, geom;

  // quality: buffer width in pixels. Lower while animating, sharper for the final frame.
  function layout(quality) {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.round(r.width * dpr);
    H = canvas.height = Math.round(r.height * dpr);
    var scale = Math.max(1, W / quality);
    BW = buf.width = Math.max(1, Math.round(W / scale));
    BH = buf.height = Math.max(1, Math.round(H / scale));
    img = bctx.createImageData(BW, BH);
    var wide = r.width / r.height > 1.05;
    geom = wide
      ? { cx: BW * 0.72, cy: BH * 1.04, R: Math.min(BH * 0.86, BW * 0.4) }
      : { cx: BW * 0.6, cy: BH * 0.36, R: Math.min(BW * 0.52, BH * 0.32) };
  }

  function render(progress) {
    // Sedov-Taylor: R grows as t^0.4
    var R = geom.R * (0.12 + 0.88 * Math.pow(progress, 0.4));
    var bright = 0.55 + 0.45 * Math.min(1, progress * 1.6);
    var d = img.data, cx = geom.cx, cy = geom.cy, inv = 1 / R;
    var lim = 1.18;
    for (var y = 0; y < BH; y++) {
      var dy = (y - cy) * inv;
      for (var x = 0; x < BW; x++) {
        var dx = (x - cx) * inv, p = (y * BW + x) * 4;
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r > lim) { d[p + 3] = 0; continue; }
        var ang = Math.atan2(dy, dx); if (ang < 0) ang += 6.283185307;
        var fa = ang / 6.283185307 * NA, ia = fa | 0, ta = fa - ia;
        var e = EDGE[ia % NA] * (1 - ta) + EDGE[(ia + 1) % NA] * ta;
        var q = r / e, v;
        if (q < 1) {
          // projected emission from a thick shell, brightening toward the limb
          var limb = 0.18 + 0.82 * Math.pow(q, 7);
          var fil = ridge(dx * 6.5 + 20, dy * 6.5 + 20);
          v = limb * (0.3 + 1.05 * fil) + 0.55 * Math.exp(-Math.pow((1 - q) / 0.022, 2));
        } else {
          v = 0.6 * Math.exp(-(q - 1) / 0.012);
        }
        v *= bright;
        if (v > 1) v = 1;
        var c = (v * 255) | 0;
        d[p] = LUT[c * 3]; d[p + 1] = LUT[c * 3 + 1]; d[p + 2] = LUT[c * 3 + 2];
        d[p + 3] = Math.min(255, v * 600);
      }
    }
    bctx.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(buf, 0, 0, W, H);
  }

  var DURATION = 2600, start = null, done = false;
  function frame(ts) {
    if (start === null) start = ts;
    var p = Math.min(1, (ts - start) / DURATION);
    render(p);
    if (p < 1) requestAnimationFrame(frame);
    else { done = true; layout(FINAL); render(1); }
  }

  var ANIM = 480, FINAL = 1100;
  layout(reduce ? FINAL : ANIM);
  if (reduce) { render(1); done = true; }
  else requestAnimationFrame(frame);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (done) { layout(FINAL); render(1); } }, 150);
  });
})();
