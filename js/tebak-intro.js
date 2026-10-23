(function () {
  var JUMLAH = 10;
  var DURASI = 10; // detik intro yang diputar
  var warna = ['--aksen', '--kuning', '--sage', '--langit', '--lila'];

  function acak(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  // Sama seperti di album: lagu/01.mp3, dst., atau "audio" di data.js
  function sumber(l) { return l.audio || ('lagu/' + pad(l.no) + '.mp3'); }

  // lagu: semua lagu (untuk pilihan jawaban). tersedia: lagu yang file-nya ada (untuk soal).
  function buatSoal(lagu, tersedia) {
    return acak(tersedia).slice(0, JUMLAH).map(function (l) {
      var lain = acak(lagu.filter(function (x) { return x.no !== l.no && x.judul !== l.judul; })).slice(0, 3);
      return { benar: l, pilihan: acak([l].concat(lain)) };
    });
  }

  if (typeof module !== 'undefined') module.exports = { buatSoal: buatSoal, sumber: sumber };
  if (typeof document === 'undefined') return;

  var root = document.getElementById('kuis');
  var soal = [], idx = 0, skor = 0, semua = [], cache = null;
  var pemutar = new Audio();
  pemutar.preload = 'auto';

  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor"/></svg>';
  var JEDA = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.6" height="14" rx="1" fill="currentColor"/><rect x="13.4" y="5" width="4.6" height="14" rx="1" fill="currentColor"/></svg>';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function berhenti() { try { pemutar.pause(); } catch (e) {} }
  window.addEventListener('pagehide', berhenti);

  // Cek lagu mana yang file-nya ada, cukup sekali per kunjungan
  function periksa(l) {
    return new Promise(function (ok) {
      var a = new Audio();
      var selesai = false;
      function akhir(v) { if (selesai) return; selesai = true; a.src = ''; ok(v); }
      a.preload = 'metadata';
      a.addEventListener('loadedmetadata', function () { akhir(true); });
      a.addEventListener('error', function () { akhir(false); });
      setTimeout(function () { akhir(false); }, 6000);
      a.src = sumber(l);
    });
  }

  function kosong() {
    var kartu = el('section', 'kartu');
    var h = el('h2', null, 'Lagunya belum tersedia');
    h.tabIndex = -1;
    kartu.appendChild(h);
    kartu.appendChild(el('p', null, 'Mode ini butuh file lagu di folder lagu/ (01.mp3 sampai 20.mp3). Begitu file-nya ada, mode ini langsung bisa dimainkan.'));
    var aksi = el('div', 'aksi');
    var coba = el('button', 'tombol', 'Periksa lagi');
    coba.type = 'button';
    coba.addEventListener('click', function () { cache = null; mulai(); });
    var kuis = el('a', 'tombol kedua', 'Main kuis biasa');
    kuis.href = 'kuis.html';
    aksi.appendChild(coba); aksi.appendChild(kuis);
    kartu.appendChild(aksi);
    root.replaceChildren(kartu);
    h.focus({ preventScroll: true });
  }

  function mulai() {
    berhenti();
    var tunggu = el('section', 'kartu');
    tunggu.appendChild(el('h2', null, 'Memeriksa lagu...'));
    root.replaceChildren(tunggu);
    var siap = cache ? Promise.resolve(cache) : Promise.all(semua.map(periksa)).then(function (r) {
      cache = semua.filter(function (l, i) { return r[i]; });
      return cache;
    });
    siap.then(function (tersedia) {
      if (!tersedia.length) return kosong();
      soal = buatSoal(semua, tersedia);
      idx = 0; skor = 0;
      tampil();
    });
  }

  function tampil() {
    var s = soal[idx];
    var kartu = el('section', 'kartu');
    kartu.style.setProperty('--c', 'var(' + warna[idx % warna.length] + ')');

    var pr = el('div', 'progres');
    pr.appendChild(el('span', null, 'Pertanyaan ' + (idx + 1) + ' dari ' + soal.length));
    pr.appendChild(el('span', null, 'Skor ' + skor));
    kartu.appendChild(pr);

    var garis = el('div', 'garis');
    garis.setAttribute('role', 'progressbar');
    garis.setAttribute('aria-valuemin', '0');
    garis.setAttribute('aria-valuemax', String(soal.length));
    garis.setAttribute('aria-valuenow', String(idx));
    var isi = el('div', 'isi');
    garis.appendChild(isi);
    kartu.appendChild(garis);
    requestAnimationFrame(function () { isi.style.width = (idx / soal.length * 100) + '%'; });

    var h = el('h2', null, 'Ini lagu apa?');
    h.tabIndex = -1;
    kartu.appendChild(h);

    // Pemutar intro
    var intro = el('div', 'intro');
    var tp = el('button', 'intro-tombol');
    tp.type = 'button';
    tp.innerHTML = PLAY;
    tp.setAttribute('aria-label', 'Putar intro');
    var waktu = el('div', 'intro-waktu');
    var wIsi = el('div', 'intro-isi');
    waktu.appendChild(wIsi);
    var info = el('p', 'intro-info', 'Ketuk untuk memutar ' + DURASI + ' detik pertama');
    intro.appendChild(tp); intro.appendChild(waktu); intro.appendChild(info);
    kartu.appendChild(intro);

    function reset(pesan) {
      intro.classList.remove('main');
      tp.innerHTML = PLAY;
      tp.setAttribute('aria-label', 'Putar intro');
      wIsi.style.width = '0%';
      if (pesan) info.textContent = pesan;
    }
    pemutar.onended = function () { reset('Putar lagi kalau perlu'); };
    pemutar.ontimeupdate = function () {
      if (pemutar.currentTime >= DURASI) { pemutar.pause(); reset('Putar lagi kalau perlu'); return; }
      wIsi.style.width = Math.min(100, pemutar.currentTime / DURASI * 100) + '%';
    };
    pemutar.onerror = function () { reset('Lagu ini tidak bisa diputar. Coba lagi atau pilih jawaban.'); };
    tp.addEventListener('click', function () {
      if (intro.classList.contains('main')) { pemutar.pause(); reset('Putar lagi kalau perlu'); return; }
      pemutar.src = sumber(s.benar);
      pemutar.currentTime = 0;
      var p = pemutar.play();
      intro.classList.add('main');
      tp.innerHTML = JEDA;
      tp.setAttribute('aria-label', 'Hentikan');
      info.textContent = 'Sedang memutar...';
      if (p && p.catch) p.catch(function () { reset('Lagu ini tidak bisa diputar. Coba lagi atau pilih jawaban.'); });
    });

    var daftar = el('ul', 'pilihan-wrap');
    var umpan = el('div');
    var lanjut = el('button', 'tombol', idx === soal.length - 1 ? 'Lihat hasil' : 'Pertanyaan berikutnya');
    lanjut.type = 'button';
    lanjut.hidden = true;
    lanjut.addEventListener('click', function () {
      berhenti();
      idx++;
      if (idx < soal.length) tampil(); else hasil();
    });

    var tombol = [];
    s.pilihan.forEach(function (l) {
      var li = document.createElement('li');
      var b = el('button', 'pilihan', l.judul);
      b.type = 'button';
      b.appendChild(el('small', null, l.artis));
      var me = { b: b, l: l };
      tombol.push(me);
      b.addEventListener('click', function () {
        var benar = l === s.benar;
        if (benar) skor++;
        berhenti(); reset('');
        info.textContent = 'Jawabannya sudah terbuka';
        tp.disabled = true;
        tombol.forEach(function (x) {
          x.b.disabled = true;
          if (x.l === s.benar) x.b.classList.add('benar');
          else if (x === me) x.b.classList.add('salah');
          else x.b.classList.add('redup');
        });
        var u = el('div', 'umpan');
        u.appendChild(el('strong', null, benar ? 'Benar!' : 'Belum tepat.'));
        u.appendChild(el('span', null, 'Lagu nomor ' + s.benar.no + ': ' + s.benar.judul + ' — ' + s.benar.artis + '.'));
        umpan.appendChild(u);
        lanjut.hidden = false;
        lanjut.focus();
      });
      li.appendChild(b);
      daftar.appendChild(li);
    });

    kartu.appendChild(daftar);
    kartu.appendChild(umpan);
    kartu.appendChild(lanjut);
    root.replaceChildren(kartu);
    h.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  function hasil() {
    berhenti();
    var kartu = el('section', 'kartu');
    var pesan;
    if (skor === soal.length) pesan = 'Sempurna! Telingamu hafal semua intro.';
    else if (skor >= 7) pesan = 'Keren, kamu cepat mengenali lagunya.';
    else if (skor >= 4) pesan = 'Lumayan! Putar lagi albumnya, lalu coba lagi.';
    else pesan = 'Tidak apa-apa, dengarkan albumnya dulu lalu coba lagi.';
    var h = el('h2', null, 'Selesai');
    h.tabIndex = -1;
    kartu.appendChild(h);
    var stk = el('img', 'stiker-hasil');
    stk.src = 'stiker/' + (skor === soal.length ? 's02' : skor >= 7 ? 's11' : skor >= 4 ? 's07' : 's17') + '.webp';
    stk.alt = '';
    kartu.appendChild(stk);
    kartu.appendChild(el('div', 'skor', skor + '/' + soal.length));
    kartu.appendChild(el('p', null, pesan));
    var aksi = el('div', 'aksi');
    var ulang = el('button', 'tombol', 'Main lagi');
    ulang.type = 'button';
    ulang.addEventListener('click', mulai);
    var balik = el('a', 'tombol kedua', 'Kembali ke album');
    balik.href = 'index.html';
    aksi.appendChild(ulang);
    aksi.appendChild(balik);
    kartu.appendChild(aksi);
    if (window.KARTU) window.KARTU.pasang(kartu, aksi, 'intro', 'Tebak Intro', skor, soal.length, pesan);
    if (window.PAPAN) window.PAPAN.pasangHasil(kartu, skor, aksi);
    root.replaceChildren(kartu);
    h.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  document.getElementById('btn-mulai').addEventListener('click', function () {
    var d = window.DATA_2OB;
    if (d && d.lagu) {
      semua = d.lagu;
      mulai();
    } else if (!root.querySelector('.galat')) {
      root.appendChild(el('p', 'galat', 'Data lagu tidak ditemukan. Pastikan data.js ada di folder yang sama dengan tebak-intro.html.'));
    }
  });
})();
