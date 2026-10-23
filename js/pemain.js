/* Papan pemain: nama diisi sebelum kuis, poin dicatat per nama, dua daftar (Tim Kepin dan Tim Adpel).
   Tanpa alamat Firebase, daftar hanya berisi pemain di perangkat ini. Dengan Firebase, daftar dibagi semua pengunjung. */
(function () {
  var P = window.PAPAN;
  if (!P) return;
  var ALAMAT = String(window.PAPAN_URL || '').replace(/\/+$/, '');
  var K_NAMA = '2ob-nama', K_PEMAIN = '2ob-pemain', K_ANTREAN = '2ob-pemain-antrean';
  var NAMA = { kepin: 'Kepin', adpel: 'Adpel' };
  var FOTO = { kepin: 'kepin.png', adpel: 'adpel.png' };
  var jauh = { kepin: null, adpel: null };   // 10 teratas dari Firebase
  var gagal = false, mengirim = false, namaMemori = '', tampilan = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function baca(k) {
    try { var s = JSON.parse(localStorage.getItem(k)); if (s && typeof s === 'object') return s; } catch (e) {}
    return {};
  }
  function tulis(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function namaTersimpan() {
    try { var n = localStorage.getItem(K_NAMA); if (n) return n; } catch (e) {}
    return namaMemori;
  }
  function simpanNama(n) { namaMemori = n; try { localStorage.setItem(K_NAMA, n); } catch (e) {} }
  function bersih(n) { return String(n || '').replace(/\s+/g, ' ').trim().slice(0, 20); }
  function buatId() {
    var h = 'abcdefghijklmnopqrstuvwxyz0123456789', s = '', i;
    try { var a = new Uint8Array(14); crypto.getRandomValues(a); for (i = 0; i < 14; i++) s += h[a[i] % 36]; }
    catch (e) { s = ''; for (i = 0; i < 14; i++) s += h[Math.floor(Math.random() * 36)]; }
    return s;
  }
  function segarkan() { tampilan.forEach(function (f) { f(); }); }

  // Satu nama di satu tim = satu pemain (huruf besar/kecil dianggap sama)
  function catat(tim, nama, poin) {
    if (!NAMA[tim] || !(poin > 0)) return;
    var p = baca(K_PEMAIN), k = tim + ':' + nama.toLowerCase();
    var r = p[k];
    if (!r || !/^[a-z0-9]{10,24}$/.test(r.id)) r = p[k] = { id: buatId(), nama: nama, tim: tim, poin: 0 };
    r.poin += poin;
    tulis(K_PEMAIN, p);
    if (ALAMAT) {
      var q = baca(K_ANTREAN);
      var e = q[r.id] || (q[r.id] = { nama: r.nama, tim: tim, n: 0 });
      e.n += poin;
      tulis(K_ANTREAN, q);
      kirim();
    }
    segarkan();
  }

  // Poin dikirim bertahap (maks. 10 per kiriman) dan diulang kalau gagal
  function kirim() {
    if (!ALAMAT || mengirim || typeof fetch !== 'function') return;
    var q = baca(K_ANTREAN), id = '', i;
    for (i in q) { if (q[i] && q[i].n > 0 && NAMA[q[i].tim] && /^[a-z0-9]{10,24}$/.test(i)) { id = i; break; } }
    if (!id) { ambil(); return; }
    var e = q[id], n = Math.min(10, e.n);
    mengirim = true;
    fetch(ALAMAT + '/pemain/' + e.tim + '/' + id + '.json', {
      method: 'PUT',
      body: JSON.stringify({ nama: e.nama, poin: { '.sv': { increment: n } } })
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        var q2 = baca(K_ANTREAN);
        if (q2[id]) { q2[id].n = Math.max(0, q2[id].n - n); if (!q2[id].n) delete q2[id]; }
        tulis(K_ANTREAN, q2);
        mengirim = false;
        kirim();
      })
      .catch(function () { mengirim = false; gagal = true; segarkan(); });
  }

  function urut(d) {
    var a = [];
    if (d && typeof d === 'object') {
      Object.keys(d).forEach(function (k) {
        var r = d[k];
        if (r && typeof r.nama === 'string' && +r.poin > 0) a.push({ id: k, nama: r.nama.slice(0, 20), poin: +r.poin });
      });
    }
    a.sort(function (x, y) { return y.poin - x.poin || (x.nama < y.nama ? -1 : 1); });
    return a.slice(0, 10);
  }
  function ambil() {
    if (!ALAMAT || typeof fetch !== 'function' || !tampilan.length) return;
    var selesai = 0, galat = false;
    ['kepin', 'adpel'].forEach(function (t) {
      fetch(ALAMAT + '/pemain/' + t + '.json?orderBy=%22poin%22&limitToLast=10', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { jauh[t] = urut(d); })
        .catch(function () { galat = true; })
        .then(function () {
          selesai++;
          if (selesai === 2) { gagal = galat && !jauh.kepin && !jauh.adpel; segarkan(); }
        });
    });
  }

  function daftar(t) {
    if (ALAMAT && !(gagal && !jauh[t])) return jauh[t] || [];
    var p = baca(K_PEMAIN), a = [];
    Object.keys(p).forEach(function (k) { if (p[k] && p[k].tim === t && +p[k].poin > 0) a.push({ id: p[k].id, nama: String(p[k].nama), poin: +p[k].poin }); });
    a.sort(function (x, y) { return y.poin - x.poin || (x.nama < y.nama ? -1 : 1); });
    return a.slice(0, 10);
  }
  function idSaya() {
    var p = baca(K_PEMAIN), m = {};
    Object.keys(p).forEach(function (k) { if (p[k] && p[k].id) m[p[k].id] = p[k]; });
    return m;
  }

  // Dua daftar berdampingan: Tim Kepin dan Tim Adpel
  function bangun(maks, ringkas) {
    var akar = el('div', 'pemain-papan' + (ringkas ? ' ringkas' : ''));
    if (!ringkas) akar.appendChild(el('h3', null, 'Papan pemain'));
    var dua = el('div', 'pemain-dua'), ol = {};
    ['kepin', 'adpel'].forEach(function (t) {
      var kol = el('section', 'pemain-kolom ' + t);
      var h = el('h4');
      var im = new Image(); im.src = FOTO[t]; im.alt = ''; im.width = 28; im.height = 28;
      h.appendChild(im); h.appendChild(el('span', null, 'Tim ' + NAMA[t]));
      kol.appendChild(h);
      ol[t] = el('ol'); kol.appendChild(ol[t]); dua.appendChild(kol);
    });
    akar.appendChild(dua);
    var cat = el('p', 'catatan-kecil');
    akar.appendChild(cat);
    function perbarui() {
      var aku = idSaya();
      ['kepin', 'adpel'].forEach(function (t) {
        var data = daftar(t).slice(0, maks);
        ol[t].replaceChildren();
        if (!data.length) { ol[t].appendChild(el('li', 'kosong', 'Belum ada pemain.')); return; }
        data.forEach(function (r, i) {
          var li = el('li', aku[r.id] ? 'aku' : '');
          li.appendChild(el('span', 'p-no', String(i + 1)));
          li.appendChild(el('span', 'p-nm', r.nama));
          li.appendChild(el('span', 'p-pt', String(r.poin)));
          ol[t].appendChild(li);
        });
      });
      if (!ALAMAT) cat.textContent = 'Papan pemain tersimpan di perangkat ini.';
      else if (gagal) cat.textContent = 'Papan bersama belum bisa dihubungi. Menampilkan pemain di perangkat ini.';
      else if (!jauh.kepin && !jauh.adpel) cat.textContent = 'Memuat papan pemain...';
      else cat.textContent = 'Sepuluh pemain teratas tiap tim.';
    }
    tampilan.push(perbarui);
    perbarui();
    return akar;
  }

  // Halaman kuis: isi nama dan pilih tim sebelum mulai
  function pasangForm() {
    var mulai = document.getElementById('mulai');
    if (!mulai) return;
    var S = window.SARING;
    var kotak = el('div', 'pemain-form');
    var lbl = el('label', null, 'Namamu untuk papan skor'); lbl.htmlFor = 'nama-pemain';
    var inp = el('input'); inp.id = 'nama-pemain'; inp.type = 'text'; inp.maxLength = 20;
    inp.autocomplete = 'nickname'; inp.placeholder = 'Tulis namamu'; inp.value = namaTersimpan();
    var galat = el('p', 'pemain-galat'); galat.setAttribute('role', 'alert'); galat.hidden = true;
    var grup = el('div', 'pemain-tim'); grup.setAttribute('role', 'radiogroup'); grup.setAttribute('aria-label', 'Pilih tim');
    var tombol = {};
    ['kepin', 'adpel'].forEach(function (t) {
      var b = el('button'); b.type = 'button'; b.setAttribute('role', 'radio');
      var im = new Image(); im.src = FOTO[t]; im.alt = ''; im.width = 42; im.height = 42;
      b.appendChild(im); b.appendChild(el('span', null, 'Tim ' + NAMA[t]));
      b.addEventListener('click', function () { P.setTim(t); tandai(); galat.hidden = true; });
      grup.appendChild(b); tombol[t] = b;
    });
    function tandai() {
      ['kepin', 'adpel'].forEach(function (t) { tombol[t].setAttribute('aria-checked', P.tim() === t ? 'true' : 'false'); });
    }
    inp.addEventListener('input', function () { galat.hidden = true; });
    kotak.appendChild(lbl); kotak.appendChild(inp); kotak.appendChild(grup); kotak.appendChild(galat);
    tandai();
    var sebelum = mulai.querySelector('.tim-catatan') || mulai.querySelector('.aksi');
    if (sebelum) mulai.insertBefore(kotak, sebelum); else mulai.appendChild(kotak);

    // Dicek lebih dulu daripada tombol mulai milik kuis
    mulai.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('#btn-mulai');
      if (!b) return;
      var n = bersih(inp.value), pesan = '', fokus = inp;
      if (!n) pesan = 'Isi namamu dulu supaya masuk papan skor.';
      else if (S && (S.kasar(n) || S.spam(n))) pesan = 'Nama itu belum bisa dipakai. Coba nama lain.';
      else if (!P.tim()) { pesan = 'Pilih Tim Kepin atau Tim Adpel dulu.'; fokus = tombol.kepin; }
      if (pesan) {
        e.preventDefault(); e.stopPropagation();
        galat.textContent = pesan; galat.hidden = false; fokus.focus();
        return;
      }
      galat.hidden = true;
      inp.value = n;
      simpanNama(n);
    }, true);
  }

  // Layar hasil: catat poin atas nama pemain, lalu tampilkan papan pemain
  var asli = P.pasangHasil;
  P.pasangHasil = function (kartu, poin, sebelum) {
    asli(kartu, poin, sebelum);
    var kotak = kartu.querySelector('.tim-hasil');
    if (!kotak) return;
    var t = P.tim(), n = namaTersimpan();
    if (t && n && poin > 0) {
      catat(t, n, poin);
      kotak.appendChild(el('p', 'tim-info pemain-info', n + ' tercatat di papan pemain Tim ' + NAMA[t] + '.'));
    }
    kotak.appendChild(bangun(5, true));
    kirim();
  };

  function pasangBeranda() {
    var akar = document.getElementById('papan');
    if (akar) akar.appendChild(bangun(10, false));
  }

  window.PEMAIN = {
    nama: namaTersimpan,
    reset: function () { tulis(K_PEMAIN, {}); tulis(K_ANTREAN, {}); segarkan(); }
  };

  function mulaiSemua() {
    pasangForm(); pasangBeranda();
    if (ALAMAT) {
      kirim();
      setInterval(function () { if (!document.hidden) ambil(); }, 30000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) { kirim(); ambil(); } });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulaiSemua);
  else mulaiSemua();
})();
