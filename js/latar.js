// Suara latar untuk halaman kuis. Simpan musiknya di suara/latar.mp3
// Kalau file belum ada, tombol suara tidak ditampilkan dan halaman tetap normal.
(function () {
  var SUMBER = window.SUARA_LATAR || 'suara/latar.mp3';
  var VOLUME = 0.3;
  var KUNCI_MATI = '2ob-latar-mati';
  var KUNCI_WAKTU = '2ob-latar-waktu';

  var nyala = true, siap = false, jalan = false, tombol = null;
  try { if (localStorage.getItem(KUNCI_MATI) === '1') nyala = false; } catch (e) {}

  var a = new Audio();
  a.loop = true;
  a.volume = VOLUME;
  a.preload = 'auto';

  function simpanWaktu() {
    try { sessionStorage.setItem(KUNCI_WAKTU, String(a.currentTime || 0)); } catch (e) {}
  }

  function buatTombol() {
    tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.className = 'suara';
    tombol.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>' +
      '<path class="gel" d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>' +
      '<path class="coret" d="M3 3l18 18"/></svg>';
    tombol.addEventListener('click', ganti);
    document.body.appendChild(tombol);
    segarkan();
  }

  function segarkan() {
    if (!tombol) return;
    tombol.setAttribute('aria-pressed', nyala ? 'true' : 'false');
    tombol.setAttribute('aria-label', nyala ? 'Matikan suara latar' : 'Nyalakan suara latar');
    tombol.title = nyala ? 'Matikan suara latar' : 'Nyalakan suara latar';
    tombol.classList.toggle('mati', !nyala);
  }

  function coba() {
    if (!nyala || !siap || jalan) return;
    var p = a.play();
    if (p && p.then) p.then(function () { jalan = true; }).catch(function () {});
    else jalan = true;
  }

  function ganti() {
    nyala = !nyala;
    try { localStorage.setItem(KUNCI_MATI, nyala ? '0' : '1'); } catch (e) {}
    if (nyala) { jalan = false; coba(); } else { a.pause(); jalan = false; }
    segarkan();
  }

  a.addEventListener('loadedmetadata', function () {
    siap = true;
    try {
      var t = parseFloat(sessionStorage.getItem(KUNCI_WAKTU));
      if (t > 0 && t < a.duration) a.currentTime = t;
    } catch (e) {}
    buatTombol();
    coba();
  });
  a.addEventListener('error', function () { siap = false; });
  a.addEventListener('timeupdate', function () { if (Math.floor(a.currentTime) % 2 === 0) simpanWaktu(); });

  // Browser baru mengizinkan suara setelah pengunjung menyentuh halaman
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (n) {
    document.addEventListener(n, function () { coba(); }, { passive: true });
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { a.pause(); jalan = false; simpanWaktu(); }
    else if (nyala) coba();
  });
  window.addEventListener('pagehide', simpanWaktu);

  a.src = SUMBER;
})();
