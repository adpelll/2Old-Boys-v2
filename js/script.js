(function () {
  var daftar = document.getElementById('daftar');
  var now = document.getElementById('now');
  var artisNow = document.getElementById('artis-now');
  var btnPP = document.getElementById('pp');
  var btnPrev = document.getElementById('prev');
  var btnNext = document.getElementById('next');
  var seek = document.getElementById('seek');
  var menggeser = false;

  // Ikon tetap (tidak berasal dari data)
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  var PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM20 6v12L9.5 12z"/></svg>';
  var NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM4 6l10.5 6L4 18z"/></svg>';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), d = Math.floor(s % 60);
    return m + ':' + (d < 10 ? '0' : '') + d;
  }

  var d = window.DATA_2OB;
  if (!d || !d.lagu) {
    daftar.appendChild(el('p', 'galat', 'Daftar lagu tidak ditemukan. Pastikan data.js ada di folder yang sama dengan index.html.'));
    return;
  }
  var lagu = d.lagu;

  // Pemilih lagu: Kepin (kiri di ilustrasi), Adpel (kanan), atau berdua
  var ORANG = {
    kepin: { nama: 'Kepin', foto: ['kepin.png'], teks: 'Pilihan Kepin' },
    adpel: { nama: 'Adpel', foto: ['adpel.png'], teks: 'Pilihan Adpel' },
    berdua: { nama: 'Berdua', foto: ['kepin.png', 'adpel.png'], teks: 'Pilihan berdua' }
  };
  function pemilihDari(l) {
    var v = String(l.pemilih || (d.pemilih && d.pemilih[l.no]) || '').toLowerCase().trim();
    return ORANG[v] ? v : '';
  }
  function wajah(kunci) {
    var w = el('span', 'wajah' + (ORANG[kunci].foto.length > 1 ? ' dua' : ''));
    ORANG[kunci].foto.forEach(function (f) {
      var i = document.createElement('img');
      i.src = f; i.alt = ''; i.width = 28; i.height = 28;
      w.appendChild(i);
    });
    return w;
  }
  function lencana(kunci) {
    var b = el('p', 'pilih ' + kunci);
    b.appendChild(wajah(kunci));
    b.appendChild(el('span', null, ORANG[kunci].teks));
    return b;
  }

  // Lokasi file lagu: lagu/01.mp3, lagu/02.mp3, dst. Bisa diganti per lagu dengan "audio" di data.js
  function sumber(l) { return l.audio || ('lagu/' + pad(l.no) + '.mp3'); }

  var audio = new Audio();
  audio.preload = 'none';
  var ui = {};      // no lagu -> elemen kartu
  var ada = {};     // no lagu -> true / false (file ditemukan atau tidak)
  var cur = null;   // lagu yang sedang dimuat di pemutar
  var dilihat = null; // lagu yang sedang terlihat di layar
  var pesan = '';

  function sedangMain(l) { return cur === l && !audio.paused && !audio.ended; }

  function pemutar(l) {
    var w = el('div', 'pemutar');
    var atas = el('div', 'p-atas');
    var b = el('button', 'p-tombol');
    b.type = 'button';
    b.innerHTML = PLAY;
    b.setAttribute('aria-label', 'Putar ' + l.judul);
    var info = el('div', 'p-info');
    info.appendChild(el('strong', null, l.judul));
    info.appendChild(el('span', null, l.artis));
    var eq = el('span', 'eq');
    eq.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 4; i++) eq.appendChild(document.createElement('i'));
    atas.appendChild(b); atas.appendChild(info); atas.appendChild(eq);

    var bawah = el('div', 'p-bawah');
    var r = document.createElement('input');
    r.type = 'range'; r.min = 0; r.max = 1000; r.value = 0;
    r.setAttribute('aria-label', 'Posisi lagu ' + l.judul);
    var waktu = el('span', 'waktu', '0:00');
    bawah.appendChild(r); bawah.appendChild(waktu);

    var belum = el('p', 'belum', 'Lagu belum tersedia.');
    belum.hidden = true;
    belum.title = 'Simpan file lagu di ' + sumber(l);

    w.appendChild(atas); w.appendChild(bawah); w.appendChild(belum);
    ui[l.no] = { w: w, b: b, r: r, waktu: waktu, belum: belum, main: false, dur: 0 };

    b.addEventListener('click', function () { toggle(l); });
    r.addEventListener('input', function () {
      if (cur === l && isFinite(audio.duration)) audio.currentTime = r.value / 1000 * audio.duration;
    });
    return w;
  }

  var kurangiGerak = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Buka atau tutup kisah dan lirik sebuah kartu
  function atur(a, buka) {
    var tb = a.querySelector('.buka-kisah');
    a.classList.toggle('terbuka', buka);
    tb.setAttribute('aria-expanded', buka ? 'true' : 'false');
    tb.firstChild.textContent = buka ? 'Tutup kisahnya' : 'Baca kisahnya';
  }

  // Favorit: tersimpan di perangkat ini (localStorage), tanpa akun
  var FAV_KUNCI = '2oldboys-favorit';
  var fav = {};
  try {
    var simpanan = JSON.parse(localStorage.getItem(FAV_KUNCI) || '[]');
    if (Array.isArray(simpanan)) simpanan.forEach(function (n) { fav[Number(n)] = true; });
  } catch (e) {}
  function simpanFav() {
    try { localStorage.setItem(FAV_KUNCI, JSON.stringify(Object.keys(fav).map(Number))); } catch (e) {}
  }
  function jumlahFav() { return Object.keys(fav).length; }
  var setelahFav = function () {};
  var HATI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.8 6.2 4.5c2.1-.2 3.9.9 5.8 3.1 1.9-2.2 3.7-3.3 5.8-3.1 3.5.3 5.3 3.9 3.8 7.3C19.5 16.4 12 21 12 21z"/></svg>';
  function tombolHati(l) {
    var h = el('button', 'hati');
    h.type = 'button';
    h.innerHTML = HATI;
    function segar() {
      var on = !!fav[l.no];
      h.setAttribute('aria-pressed', on ? 'true' : 'false');
      h.setAttribute('aria-label', (on ? 'Hapus dari favorit: ' : 'Tandai favorit: ') + l.judul);
      h.title = on ? 'Hapus dari favorit' : 'Tandai favorit';
    }
    segar();
    h.addEventListener('click', function () {
      if (fav[l.no]) delete fav[l.no]; else fav[l.no] = true;
      simpanFav(); segar(); setelahFav();
    });
    return h;
  }

  function kartu(l) {
    var a = el('article', 'lagu');
    a.dataset.no = String(l.no);
    if (l.gambar) {
      var i = el('img', 'formal');
      i.src = l.gambar.src;
      i.alt = l.gambar.alt;
      a.appendChild(i);
    }
    a.appendChild(el('div', 'no', String(l.no)));
    a.appendChild(tombolHati(l));
    a.appendChild(el('h2', null, l.judul));
    a.appendChild(el('p', 'art', l.artis));
    var pm = pemilihDari(l);
    if (pm) { a.dataset.pilih = pm; a.appendChild(lencana(pm)); }
    a.appendChild(pemutar(l));

    // Tombol buka kisah punya area sentuh sendiri, terpisah dari pemutar
    var id = 'kisah-' + l.no;
    var tb = el('button', 'buka-kisah');
    tb.type = 'button';
    tb.setAttribute('aria-expanded', 'false');
    tb.setAttribute('aria-controls', id);
    tb.appendChild(el('span', null, 'Baca kisahnya'));
    var panah = el('span', 'panah');
    panah.setAttribute('aria-hidden', 'true');
    tb.appendChild(panah);

    var panel = el('div', 'panel');
    panel.id = id;
    var isi = el('div', 'panel-isi');
    isi.appendChild(el('p', null, l.kisah));
    if (l.catatan) {
      var f = el('p', 'fav');
      f.appendChild(el('span', null, l.catatan));
      isi.appendChild(f);
    }
    var c = el('a', 'cari', 'Cari di Spotify');
    c.href = l.spotify;
    c.target = '_blank';
    c.rel = 'noopener';
    isi.appendChild(c);
    panel.appendChild(isi);

    a.appendChild(tb);
    a.appendChild(panel);

    // Hanya satu kartu terbuka dalam satu waktu
    tb.addEventListener('click', function () {
      var mau = !a.classList.contains('terbuka');
      if (mau) {
        document.querySelectorAll('.lagu.terbuka').forEach(function (x) { if (x !== a) atur(x, false); });
      }
      atur(a, mau);
      if (mau) {
        setTimeout(function () { a.scrollIntoView({ block: 'nearest', behavior: kurangiGerak ? 'auto' : 'smooth' }); }, kurangiGerak ? 0 : 330);
      }
    });
    return a;
  }

  function tandaiKosong(l) {
    ada[l.no] = false;
    var u = ui[l.no];
    u.w.classList.add('kosong');
    u.b.disabled = true;
    u.belum.hidden = false;
  }

  // Cek diam-diam apakah file lagu ada, sekaligus ambil durasinya
  function periksa(l) {
    var p = new Audio();
    p.preload = 'metadata';
    p.addEventListener('loadedmetadata', function () {
      ada[l.no] = true;
      ui[l.no].dur = p.duration;
      segarkan();
    });
    p.addEventListener('error', function () { tandaiKosong(l); });
    p.src = sumber(l);
  }

  function segarkan() {
    var ct = audio.currentTime || 0, dur = audio.duration;
    lagu.forEach(function (l) {
      var u = ui[l.no], main = sedangMain(l);
      if (u.main !== main) {
        u.main = main;
        u.b.innerHTML = main ? PAUSE : PLAY;
        u.b.setAttribute('aria-label', (main ? 'Jeda ' : 'Putar ') + l.judul);
        u.w.classList.toggle('jalan', main);
      }
      if (cur === l && isFinite(dur) && dur > 0) {
        u.r.value = Math.round(ct / dur * 1000);
        u.waktu.textContent = fmt(ct) + ' / ' + fmt(dur);
      } else {
        u.r.value = 0;
        u.waktu.textContent = u.dur ? '0:00 / ' + fmt(u.dur) : '0:00';
      }
    });

    var t = cur || dilihat;
    var main2 = cur ? sedangMain(cur) : false;
    now.textContent = t ? t.no + '. ' + t.judul : 'Gulir untuk mulai';
    artisNow.textContent = pesan || (t ? t.artis : '');
    btnPP.innerHTML = main2 ? PAUSE : PLAY;
    btnPP.setAttribute('aria-label', main2 ? 'Jeda' : 'Putar');
    document.body.classList.toggle('memutar', main2);
    var bisa = !!(cur && isFinite(dur) && dur > 0);
    seek.disabled = !bisa;
    if (!menggeser) {
      seek.value = bisa ? Math.round(ct / dur * 1000) : 0;
    }
    seek.style.setProperty('--isi', (seek.value / 10) + '%');
  }

  function main(l) {
    if (ada[l.no] === false) return;
    pesan = '';
    if (cur !== l) { cur = l; audio.src = sumber(l); }
    var p = audio.play();
    if (p && p.catch) p.catch(function () {});
    segarkan();
  }

  function toggle(l) {
    if (sedangMain(l)) audio.pause(); else main(l);
  }

  // Pindah lagu, lewati yang filenya belum ada
  function arah(delta) {
    var base = cur || dilihat || lagu[0];
    if (delta < 0 && cur && audio.currentTime > 3) { audio.currentTime = 0; return; }
    var i = lagu.indexOf(base) + delta;
    while (i >= 0 && i < lagu.length && ada[lagu[i].no] === false) i += delta;
    if (i >= 0 && i < lagu.length) main(lagu[i]);
  }

  ['play', 'pause', 'timeupdate', 'loadedmetadata', 'seeked'].forEach(function (n) { audio.addEventListener(n, segarkan); });
  audio.addEventListener('ended', function () { arah(1); segarkan(); });
  audio.addEventListener('error', function () {
    if (!cur) return;
    tandaiKosong(cur);
    pesan = 'Lagu belum tersedia';
    cur = null;
    segarkan();
  });

  btnPrev.innerHTML = PREV;
  btnNext.innerHTML = NEXT;
  btnPP.innerHTML = PLAY;
  btnPP.addEventListener('click', function () {
    var l = cur || dilihat || lagu[0];
    toggle(l);
  });
  // Geser bar bawah untuk maju atau mundur di dalam lagu
  function lepas() { menggeser = false; segarkan(); }
  seek.addEventListener('pointerdown', function () { menggeser = true; });
  seek.addEventListener('pointerup', lepas);
  seek.addEventListener('pointercancel', lepas);
  seek.addEventListener('change', lepas);
  seek.addEventListener('input', function () {
    if (!cur || !isFinite(audio.duration)) return;
    var t = seek.value / 1000 * audio.duration;
    audio.currentTime = t;
    seek.style.setProperty('--isi', (seek.value / 10) + '%');
  });
  btnPrev.addEventListener('click', function () { arah(-1); });
  btnNext.addEventListener('click', function () { arah(1); });

  // Bar bawah mengikuti lagu yang sedang dibaca (saat belum ada yang diputar)
  function amati() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var no = Number(e.target.dataset.no);
          dilihat = lagu.filter(function (x) { return x.no === no; })[0] || dilihat;
          if (!cur) pesan = '';
          segarkan();
        }
      });
    }, { threshold: 0.55 });
    document.querySelectorAll('.lagu').forEach(function (a) { io.observe(a); });
  }

  lagu.forEach(function (l) { daftar.appendChild(kartu(l)); });

  // Penyaring: Semua, pilihan Kepin/Adpel/berdua, dan Favorit saya
  function buatPenyaring() {
    var bar = document.getElementById('saring');
    if (!bar) return;
    var hitung = { kepin: 0, adpel: 0, berdua: 0 };
    lagu.forEach(function (l) { var p = pemilihDari(l); if (p) hitung[p]++; });
    var info = el('p', 'saring-info');
    var aktif = 'semua';
    var chips = {};
    var teksFav = null;

    function terapkan(gulir) {
      var n = 0;
      daftar.querySelectorAll('.lagu').forEach(function (a) {
        var no = Number(a.dataset.no);
        var tampil = aktif === 'semua' || (aktif === 'favorit' ? !!fav[no] : a.dataset.pilih === aktif);
        a.hidden = !tampil;
        if (tampil) n++;
      });
      Object.keys(chips).forEach(function (k) { chips[k].setAttribute('aria-pressed', k === aktif ? 'true' : 'false'); });
      teksFav.textContent = 'Favorit ' + jumlahFav();
      if (aktif === 'semua') info.textContent = '';
      else if (aktif === 'favorit') info.textContent = n ? 'Menampilkan ' + n + ' lagu favoritmu' : 'Belum ada favorit. Ketuk hati di kartu lagu untuk menandainya.';
      else info.textContent = 'Menampilkan ' + n + ' lagu pilihan ' + (aktif === 'berdua' ? 'berdua' : ORANG[aktif].nama);
      if (gulir) window.scrollTo({ top: Math.max(0, bar.offsetTop - 72), behavior: 'smooth' });
    }
    function tambah(kunci, ikon, teks) {
      var b = el('button', 'chip');
      b.type = 'button';
      b.dataset.k = kunci;
      if (ikon) b.appendChild(ikon);
      var t = el('span', null, teks);
      b.appendChild(t);
      b.setAttribute('aria-pressed', kunci === 'semua' ? 'true' : 'false');
      b.addEventListener('click', function () { aktif = kunci; terapkan(true); });
      chips[kunci] = b;
      bar.appendChild(b);
      return t;
    }
    tambah('semua', null, 'Semua ' + lagu.length);
    ['kepin', 'adpel', 'berdua'].forEach(function (k) {
      if (hitung[k] > 0) tambah(k, wajah(k), ORANG[k].nama + ' ' + hitung[k]);
    });
    var ikonHati = el('span', 'hati-chip');
    ikonHati.innerHTML = HATI;
    teksFav = tambah('favorit', ikonHati, 'Favorit ' + jumlahFav());
    chips.favorit.classList.add('chip-fav');
    bar.appendChild(info);
    bar.hidden = false;
    setelahFav = function () { terapkan(false); };
  }
  buatPenyaring();
  lagu.forEach(periksa);
  amati();
  segarkan();
})();
