// Papan skor Kepin lawan Adpel.
// Tanpa alamat Firebase di papan-config.js, poin hanya tersimpan di perangkat pengunjung (localStorage).
// Dengan alamat Firebase, poin semua pengunjung digabung di Realtime Database lewat REST (tanpa library tambahan).
(function () {
  var KUNCI = '2ob-papan';
  var KUNCI_TIM = '2ob-tim';
  var NAMA = { kepin: 'Kepin', adpel: 'Adpel' };
  var FOTO = { kepin: 'kepin.png', adpel: 'adpel.png' };
  var ALAMAT = String(window.PAPAN_URL || '').replace(/\/+$/, '');
  var KUNCI_ANTREAN = '2ob-antrean';
  var jauh = null;        // skor gabungan terakhir dari Firebase
  var gagal = false;      // true kalau Firebase tidak bisa dihubungi
  var mengirim = false;
  var memori = { kepin: 0, adpel: 0 };
  var timMemori = '';
  var tampilan = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function baca() {
    try {
      var s = JSON.parse(localStorage.getItem(KUNCI));
      if (s && typeof s === 'object') memori = { kepin: Math.max(0, +s.kepin || 0), adpel: Math.max(0, +s.adpel || 0) };
    } catch (e) {}
    if (ALAMAT && jauh) return { kepin: jauh.kepin, adpel: jauh.adpel };
    return { kepin: memori.kepin, adpel: memori.adpel };
  }
  function bacaLokal() {
    try {
      var s = JSON.parse(localStorage.getItem(KUNCI));
      if (s && typeof s === 'object') memori = { kepin: Math.max(0, +s.kepin || 0), adpel: Math.max(0, +s.adpel || 0) };
    } catch (e) {}
    return { kepin: memori.kepin, adpel: memori.adpel };
  }
  function tulis(s) {
    memori = s;
    try { localStorage.setItem(KUNCI, JSON.stringify(s)); } catch (e) {}
  }
  function tim() {
    try { var t = localStorage.getItem(KUNCI_TIM); if (NAMA[t]) return t; } catch (e) {}
    return timMemori;
  }
  function setTim(t) {
    if (!NAMA[t]) return;
    timMemori = t;
    try { localStorage.setItem(KUNCI_TIM, t); } catch (e) {}
    segarkan();
  }
  function antrean() {
    try {
      var q = JSON.parse(localStorage.getItem(KUNCI_ANTREAN));
      if (q && typeof q === 'object') return { kepin: Math.max(0, +q.kepin || 0), adpel: Math.max(0, +q.adpel || 0) };
    } catch (e) {}
    return { kepin: 0, adpel: 0 };
  }
  function simpanAntrean(q) {
    try { localStorage.setItem(KUNCI_ANTREAN, JSON.stringify(q)); } catch (e) {}
  }
  function ambil() {
    if (!ALAMAT || typeof fetch !== 'function') return;
    fetch(ALAMAT + '/papan.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        jauh = { kepin: Math.max(0, +(d && d.kepin) || 0), adpel: Math.max(0, +(d && d.adpel) || 0) };
        gagal = false;
        segarkan();
      })
      .catch(function () { gagal = true; segarkan(); });
  }
  // Poin dikirim bertahap (maks. 10 per kiriman) dan diulang kalau gagal
  function kirimAntrean() {
    if (!ALAMAT || mengirim || typeof fetch !== 'function') return;
    var q = antrean();
    var t = q.kepin > 0 ? 'kepin' : (q.adpel > 0 ? 'adpel' : '');
    if (!t) { ambil(); return; }
    var n = Math.min(10, q[t]);
    mengirim = true;
    fetch(ALAMAT + '/papan/' + t + '.json', { method: 'PUT', body: JSON.stringify({ '.sv': { increment: n } }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        var q2 = antrean();
        q2[t] = Math.max(0, q2[t] - n);
        simpanAntrean(q2);
        mengirim = false;
        kirimAntrean();
      })
      .catch(function () { mengirim = false; gagal = true; segarkan(); });
  }
  function tambah(t, poin) {
    if (!NAMA[t] || !(poin > 0)) return;
    var s = bacaLokal();
    s[t] += poin;
    tulis(s);
    if (ALAMAT) {
      var q = antrean();
      q[t] += poin;
      simpanAntrean(q);
      if (jauh) jauh[t] += poin;
      kirimAntrean();
    }
    segarkan();
  }
  function atur() {
    tulis({ kepin: 0, adpel: 0 });
    if (window.PEMAIN) window.PEMAIN.reset();
    segarkan();
  }
  function teksCatatan() {
    if (!ALAMAT) return 'Skor tersimpan di perangkat ini.';
    if (gagal && !jauh) return 'Papan bersama belum bisa dihubungi. Menampilkan skor di perangkat ini.';
    if (!jauh) return 'Menghubungkan ke papan bersama...';
    return 'Skor gabungan dari semua pengunjung.';
  }
  function segarkan() { tampilan.forEach(function (f) { f(); }); }

  function wajah(kunci, ukuran) {
    var i = document.createElement('img');
    i.src = FOTO[kunci]; i.alt = ''; i.width = ukuran || 28; i.height = ukuran || 28;
    return i;
  }

  function kabar(s) {
    if (s.kepin + s.adpel === 0) return 'Belum ada poin. Main kuis, pilih tim, lalu kumpulkan poin untuk jagoanmu.';
    if (s.kepin === s.adpel) return 'Skornya seri, masing-masing ' + s.kepin + ' poin.';
    var menang = s.kepin > s.adpel ? 'kepin' : 'adpel';
    var selisih = Math.abs(s.kepin - s.adpel);
    return NAMA[menang] + ' unggul ' + selisih + ' poin.';
  }

  // Tali tarik: batas oranye (Kepin) dan biru (Adpel) bergeser sesuai skor
  function bangunPapan(ringkas) {
    var kotak = el('div', 'papan-kotak' + (ringkas ? ' ringkas' : ''));
    if (!ringkas) kotak.appendChild(el('h2', null, 'Kepin lawan Adpel'));

    var tarik = el('div', 'tarik');
    var sisi = {};
    ['kepin', 'adpel'].forEach(function (k) {
      var s = el('div', 'sisi ' + k);
      var tombolWajah = null;
      if (ringkas) {
        s.appendChild(wajah(k, 52));
      } else {
        // Di papan utama, wajah bisa diketuk untuk memilih tim
        tombolWajah = el('button', 'kepala-tim');
        tombolWajah.type = 'button';
        tombolWajah.setAttribute('aria-label', 'Dukung Tim ' + NAMA[k]);
        tombolWajah.appendChild(wajah(k, 52));
        tombolWajah.addEventListener('click', function () { setTim(k); });
        s.appendChild(tombolWajah);
      }
      var angka = el('b', null, '0');
      s.appendChild(angka);
      s.appendChild(el('small', null, 'Tim ' + NAMA[k]));
      var tag = el('span', 'unggul-tag', 'Unggul');
      tag.hidden = true;
      s.appendChild(tag);
      sisi[k] = { akar: s, angka: angka, tag: tag, tombol: tombolWajah };
    });
    var tali = el('div', 'tali');
    tali.setAttribute('role', 'img');
    var jalur = el('div', 'jalur');
    jalur.appendChild(el('i', 'bagian'));
    tali.appendChild(jalur);
    tali.appendChild(el('span', 'simpul'));
    tarik.appendChild(sisi.kepin.akar);
    tarik.appendChild(tali);
    tarik.appendChild(sisi.adpel.akar);
    kotak.appendChild(tarik);

    var teks = el('p', 'kabar');
    var dukung = el('p', 'dukung');
    kotak.appendChild(teks);
    kotak.appendChild(dukung);

    var pertama = true;
    function perbarui() {
      var s = baca();
      var total = s.kepin + s.adpel;
      var persen = total === 0 ? 50 : Math.round(s.kepin / total * 100);
      persen = Math.min(88, Math.max(12, persen));
      if (pertama) {
        tali.style.setProperty('--p', '50%');
        requestAnimationFrame(function () { requestAnimationFrame(function () { tali.style.setProperty('--p', persen + '%'); }); });
        pertama = false;
      } else {
        tali.style.setProperty('--p', persen + '%');
      }
      sisi.kepin.angka.textContent = s.kepin;
      sisi.adpel.angka.textContent = s.adpel;
      sisi.kepin.tag.hidden = !(s.kepin > s.adpel);
      sisi.adpel.tag.hidden = !(s.adpel > s.kepin);
      sisi.kepin.akar.classList.toggle('menang', s.kepin > s.adpel);
      sisi.adpel.akar.classList.toggle('menang', s.adpel > s.kepin);
      teks.textContent = kabar(s);
      tali.setAttribute('aria-label', 'Skor Kepin ' + s.kepin + ', Adpel ' + s.adpel + '. ' + kabar(s));
      var t = tim();
      ['kepin', 'adpel'].forEach(function (k) {
        if (sisi[k].tombol) sisi[k].tombol.setAttribute('aria-pressed', t === k ? 'true' : 'false');
        sisi[k].akar.classList.toggle('dipilih', t === k);
      });
      dukung.textContent = t ? 'Kamu mendukung Tim ' + NAMA[t] + '.' : (ringkas ? '' : 'Ketuk wajah untuk mendukung timmu.');
      dukung.hidden = !dukung.textContent;
    }
    tampilan.push(perbarui);
    perbarui();
    return kotak;
  }

  // Halaman utama: papan skor di bawah bagian atas
  function pasangPapan() {
    var akar = document.getElementById('papan');
    if (!akar) return;
    var kotak = bangunPapan(false);

    var aksi = el('div', 'papan-aksi');
    var a1 = el('a', 'chip', 'Main kuis'); a1.href = 'kuis.html';
    var a2 = el('a', 'chip', 'Tebak lirik'); a2.href = 'kuis-lirik.html';
    var a3 = el('a', 'chip', 'Tebak intro'); a3.href = 'tebak-intro.html';
    aksi.appendChild(a1); aksi.appendChild(a2); aksi.appendChild(a3);

    var reset = el('button', 'tautan-kecil', 'Atur ulang skor');
    reset.type = 'button';
    var yakin = false;
    reset.addEventListener('click', function () {
      if (!yakin) {
        yakin = true;
        reset.textContent = 'Yakin? Ketuk lagi untuk menghapus';
        setTimeout(function () { yakin = false; reset.textContent = 'Atur ulang skor'; }, 4000);
      } else {
        yakin = false;
        reset.textContent = 'Atur ulang skor';
        atur();
      }
    });
    aksi.appendChild(reset);
    if (ALAMAT) reset.hidden = true;
    kotak.appendChild(aksi);
    var catatan = el('p', 'catatan-kecil', teksCatatan());
    tampilan.push(function () { catatan.textContent = teksCatatan(); });
    kotak.appendChild(catatan);
    akar.appendChild(kotak);
  }

  // Halaman utama: stiker nama di bawah karakter menjadi tombol pilih tim
  function pasangNama() {
    var panggung = document.querySelector('.panggung');
    var petunjuk = document.getElementById('petunjuk-tim');
    var tombol = { kepin: document.getElementById('nama-kepin'), adpel: document.getElementById('nama-adpel') };
    if (!panggung || !tombol.kepin || !tombol.adpel) return;
    ['kepin', 'adpel'].forEach(function (k) {
      tombol[k].addEventListener('click', function () { setTim(k); });
    });
    function perbarui() {
      var t = tim();
      ['kepin', 'adpel'].forEach(function (k) {
        tombol[k].setAttribute('aria-pressed', t === k ? 'true' : 'false');
        tombol[k].setAttribute('aria-label', 'Dukung Tim ' + NAMA[k]);
      });
      panggung.classList.toggle('ada-tim', !!t);
      if (petunjuk) {
        petunjuk.textContent = t
          ? 'Kamu di Tim ' + NAMA[t] + '. Ketuk nama ' + NAMA[t === 'kepin' ? 'adpel' : 'kepin'] + ' kalau mau pindah tim.'
          : 'Ketuk nama untuk mendukung timmu.';
      }
    }
    tampilan.push(perbarui);
    perbarui();
  }

  // Halaman kuis: tim dipilih di halaman utama, di sini hanya diingatkan
  function pasangCatatanTim() {
    var mulai = document.getElementById('mulai');
    if (!mulai) return;
    var aksi = mulai.querySelector('.aksi');
    var blok = el('p', 'tim-catatan');
    function perbarui() {
      var t = tim();
      blok.replaceChildren();
      if (t) {
        var w = el('span', 'wajah'); w.appendChild(wajah(t, 28));
        blok.appendChild(w);
        blok.appendChild(el('span', null, 'Poinmu masuk ke Tim ' + NAMA[t] + '.'));
      } else {
        var kalimat = el('span');
        kalimat.appendChild(document.createTextNode('Kamu belum memilih tim, jadi poin belum dihitung. '));
        var a = el('a', null, 'Pilih tim di halaman album');
        a.href = 'index.html';
        kalimat.appendChild(a);
        kalimat.appendChild(document.createTextNode('.'));
        blok.appendChild(kalimat);
      }
    }
    tampilan.push(perbarui);
    perbarui();
    if (aksi) mulai.insertBefore(blok, aksi); else mulai.appendChild(blok);
  }

  // Dipanggil dari kartu hasil kuis. Menambah poin ke tim, atau menanyakan timnya.
  function pasangHasil(kartu, poin, sebelum) {
    var kotak = el('div', 'tim-hasil');
    var info = el('p', 'tim-info');
    kotak.appendChild(info);

    function tampilSelesai(t) {
      kotak.replaceChildren();
      var baris = el('p', 'tim-info');
      var w = el('span', 'wajah'); w.appendChild(wajah(t, 28));
      baris.appendChild(w);
      baris.appendChild(el('span', null, '+' + poin + ' poin untuk Tim ' + NAMA[t]));
      kotak.appendChild(baris);
      kotak.appendChild(bangunPapan(true));
    }

    if (!(poin > 0)) {
      info.textContent = 'Belum ada poin yang ditambahkan. Coba lagi untuk timmu.';
      kotak.appendChild(bangunPapan(true));
    } else if (tim()) {
      var t = tim();
      tambah(t, poin);
      tampilSelesai(t);
    } else {
      info.appendChild(el('span', null, 'Kamu belum memilih tim, jadi ' + poin + ' poin ini belum dihitung.'));
      var a = el('a', 'tombol kedua', 'Pilih tim di halaman album');
      a.href = 'index.html';
      kotak.appendChild(a);
      kotak.appendChild(bangunPapan(true));
    }
    if (sebelum) kartu.insertBefore(kotak, sebelum); else kartu.appendChild(kotak);
  }

  window.PAPAN = { tim: tim, setTim: setTim, tambah: tambah, skor: baca, atur: atur, pasangHasil: pasangHasil };

  function mulaiSemua() {
    bacaLokal();
    pasangPapan(); pasangNama(); pasangCatatanTim();
    if (ALAMAT) {
      kirimAntrean();
      ambil();
      setInterval(function () { if (!document.hidden) ambil(); }, 30000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) { kirimAntrean(); ambil(); } });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulaiSemua);
  else mulaiSemua();
})();
