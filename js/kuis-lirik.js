(function () {
  var JUMLAH = 10;
  var warna = ['--aksen', '--kuning', '--sage', '--langit', '--lila'];

  function acak(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function lolos(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Judul yang muncul di dalam potongan lirik disamarkan supaya tidak jadi petunjuk
  function samarkan(teks, judul) {
    var inti = judul.split('/')[0].trim();
    var pola = lolos(inti).replace(/['\u2019]/g, "['\u2019]").replace(/\s+/g, '\\s+');
    try { return teks.replace(new RegExp(pola, 'gi'), '____'); } catch (e) { return teks; }
  }

  // Soal dibuat dari data.js milik situs ini
  function buatSoal(lagu) {
    var ada = lagu.filter(function (l) { return l.catatan && l.catatan.trim(); });
    return acak(ada).slice(0, JUMLAH).map(function (l) {
      var lain = acak(lagu.filter(function (x) { return x.no !== l.no && x.judul !== l.judul; })).slice(0, 3);
      return {
        lirik: samarkan(l.catatan.trim(), l.judul),
        benar: l,
        pilihan: acak([l].concat(lain))
      };
    });
  }

  if (typeof module !== 'undefined') module.exports = { buatSoal: buatSoal, samarkan: samarkan };
  if (typeof document === 'undefined') return;

  var root = document.getElementById('kuis');
  var soal = [], idx = 0, skor = 0, semua = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function mulai() {
    soal = buatSoal(semua);
    idx = 0; skor = 0;
    tampil();
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

    var h = el('h2', null, 'Potongan lirik ini dari lagu apa?');
    h.tabIndex = -1;
    kartu.appendChild(h);
    kartu.appendChild(el('blockquote', 'lirik', s.lirik));

    var daftar = el('ul', 'pilihan-wrap');
    var umpan = el('div');
    var lanjut = el('button', 'tombol', idx === soal.length - 1 ? 'Lihat hasil' : 'Pertanyaan berikutnya');
    lanjut.type = 'button';
    lanjut.hidden = true;
    lanjut.addEventListener('click', function () {
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
        tombol.forEach(function (x) {
          x.b.disabled = true;
          if (x.l === s.benar) x.b.classList.add('benar');
          else if (x === me) x.b.classList.add('salah');
          else x.b.classList.add('redup');
        });
        var u = el('div', 'umpan');
        u.appendChild(el('strong', null, benar ? 'Benar!' : 'Belum tepat.'));
        u.appendChild(el('span', null, 'Lagu nomor ' + s.benar.no + ': ' + s.benar.judul + ' \u2014 ' + s.benar.artis + '.'));
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
    var kartu = el('section', 'kartu');
    var pesan;
    if (skor === soal.length) pesan = 'Sempurna! Kamu hafal lirik-liriknya.';
    else if (skor >= 7) pesan = 'Keren, telingamu tajam.';
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
    if (window.KARTU) window.KARTU.pasang(kartu, aksi, 'lirik', 'Tebak Lirik', skor, soal.length, pesan);
    if (window.PAPAN) window.PAPAN.pasangHasil(kartu, skor, aksi);
    root.replaceChildren(kartu);
    h.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  var tbl = document.getElementById('btn-mulai');
  tbl.addEventListener('click', function () {
    var d = window.DATA_2OB;
    if (d && d.lagu) {
      semua = d.lagu;
      mulai();
    } else if (!root.querySelector('.galat')) {
      root.appendChild(el('p', 'galat', 'Data lagu tidak ditemukan. Pastikan data.js ada di folder yang sama dengan kuis-lirik.html.'));
    }
  });
})();
