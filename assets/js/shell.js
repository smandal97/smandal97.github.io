/* Hero background: a real hydrodynamic simulation of supernova ejecta
   ploughing into circumstellar gas (axisymmetric run, one quadrant).

   assets/sim/remnant.mp4 (+ .webm)   greyscale "emission" of the shocked gas, one frame per output
   assets/sim/remnant-final.png   the last output at full resolution

   Each frame is coloured with the inferno colormap, given transparency where
   there is no shocked gas, and mirrored about the symmetry axis and the
   equator to show the whole remnant. The run plays once, then holds. */
(function () {
  var canvas = document.querySelector('.hero__shell');
  if (!canvas || !canvas.getContext) return;
  var base = canvas.getAttribute('data-src') || '/assets/sim/';
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // inferno colormap
  var stops = [
    [0.00, 0, 0, 4], [0.13, 27, 12, 65], [0.25, 74, 12, 107], [0.38, 120, 28, 109],
    [0.50, 165, 44, 96], [0.63, 207, 68, 70], [0.75, 237, 105, 37], [0.88, 251, 155, 6],
    [1.00, 252, 255, 164]
  ];
  var LUT = new Uint8ClampedArray(256 * 4);
  for (var i = 0; i < 256; i++) {
    var t = i / 255, k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    var a = stops[k], b = stops[k + 1], f = (t - a[0]) / (b[0] - a[0]);
    LUT[i * 4] = a[1] + (b[1] - a[1]) * f;
    LUT[i * 4 + 1] = a[2] + (b[2] - a[2]) * f;
    LUT[i * 4 + 2] = a[3] + (b[3] - a[3]) * f;
    LUT[i * 4 + 3] = Math.min(255, i * 3);       // dark = transparent, so the page colour shows
  }

  var src = document.createElement('canvas'), sctx = src.getContext('2d', { willReadFrequently: true });
  var quad = document.createElement('canvas'), qctx = quad.getContext('2d');
  var disk = document.createElement('canvas'), dctx = disk.getContext('2d');
  var lastSource = null;

  function colourise(source, size) {
    if (src.width !== size) { src.width = src.height = quad.width = quad.height = size; disk.width = disk.height = size * 2; }
    sctx.drawImage(source, 0, 0, size, size);
    var img = sctx.getImageData(0, 0, size, size), d = img.data;
    for (var p = 0; p < d.length; p += 4) {
      var v = d[p + 1], o = v * 4;                 // green channel = luma for a grey frame
      d[p] = LUT[o]; d[p + 1] = LUT[o + 1]; d[p + 2] = LUT[o + 2]; d[p + 3] = LUT[o + 3];
    }
    qctx.putImageData(img, 0, 0);
    // mirror the quadrant (origin bottom-left) into a full disk, pixel-exact so there are no seams
    dctx.clearRect(0, 0, size * 2, size * 2);
    for (var sx = -1; sx <= 1; sx += 2) for (var sy = -1; sy <= 1; sy += 2) {
      dctx.setTransform(sx, 0, 0, sy, size, size);
      dctx.drawImage(quad, 0, -size);
    }
    dctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function geometry(W, H) {
    var wide = W / H > 1.05;
    // the forward shock sits at ~93% of the quadrant at the end of the run
    var R = wide ? Math.min(H * 0.86, W * 0.42) : Math.min(W * 0.55, H * 0.34);
    // rot turns the remnant so the symmetry axis, where the run has a small
    // numerical artefact, points off-screen rather than straight up
    return wide ? { cx: W * 0.78, cy: H * 1.02, S: R / 0.93, rot: -0.87 }
                : { cx: W * 0.62, cy: H * 0.33, S: R / 0.93, rot: -0.87 };
  }

  function paint(source, size) {
    lastSource = [source, size];
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    colourise(source, size);
    var g = geometry(W, H), S = g.S;
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.setTransform(1, 0, 0, 1, g.cx, g.cy);
    ctx.rotate(g.rot);
    ctx.drawImage(disk, -S, -S, 2 * S, 2 * S);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  var still = new Image();
  var stillReady = new Promise(function (res) { still.onload = res; still.onerror = res; });
  still.src = base + 'remnant-final.png';
  function showStill() { stillReady.then(function () { if (still.naturalWidth) paint(still, still.naturalWidth); }); }

  if (reduce) { showStill(); }
  else {
    var video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.preload = 'auto';
    video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
    video.src = base + (video.canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'remnant.mp4' : 'remnant.webm');
    var started = false, finished = false;
    var fallback = setTimeout(function () { if (!started) { finished = true; showStill(); } }, 2500);
    var useRVFC = 'requestVideoFrameCallback' in video;
    function tick() {
      if (finished) return;
      if (video.readyState >= 2) paint(video, 540);
      if (useRVFC) video.requestVideoFrameCallback(tick); else requestAnimationFrame(tick);
    }
    video.addEventListener('playing', function () {
      if (started || finished) return;
      started = true; clearTimeout(fallback); tick();
    });
    video.addEventListener('ended', function () { finished = true; showStill(); });
    video.addEventListener('error', function () { finished = true; clearTimeout(fallback); showStill(); });
    var p = video.play();
    if (p && p.catch) p.catch(function () { finished = true; clearTimeout(fallback); showStill(); });
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (lastSource) paint(lastSource[0], lastSource[1]); }, 150);
  });
})();
