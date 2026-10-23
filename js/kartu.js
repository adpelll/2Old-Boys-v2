/* Rekor kuis pribadi + kartu hasil yang bisa dibagikan. Rekor disimpan di perangkat (localStorage). */
(function () {
  var NAMA_MODE = { kuis: 'Kuis 2Old Boys', lirik: 'Tebak Lirik', intro: 'Tebak Intro' };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function baca(mode) {
    try {
      var s = JSON.parse(localStorage.getItem('2oldboys-rekor-' + mode));
      if (s && typeof s === 'object' && +s.total > 0) return { skor: +s.skor || 0, total: +s.total, main: +s.main || 0 };
    } catch (e) {}
    return null;
  }
  function simpan(mode, s) {
    try { localStorage.setItem('2oldboys-rekor-' + mode, JSON.stringify(s)); } catch (e) {}
  }

  var css = '.rekor{display:inline-block;margin:0 0 1rem;padding:.3rem .9rem;font-weight:700;font-size:.98rem;' +
    'color:var(--tinta);background:var(--kuning);border:3px solid var(--tinta);border-radius:999px;box-shadow:2px 2px 0 var(--tinta)}' +
    '.rekor.baru{background:var(--jingga);transform:rotate(-2deg)}' +
    '.kartu .rekor-kecil{margin:-.2rem 0 1rem;font-size:.92rem;opacity:.8}' +
    '.lapis-kartu{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;' +
    'padding:calc(1rem + env(safe-area-inset-top,0px)) 1rem calc(1rem + env(safe-area-inset-bottom,0px));background:rgba(20,12,8,.82)}' +
    '.lapis-kartu img{max-width:min(92vw,420px);max-height:68vh;width:auto;height:auto;border:3px solid var(--tinta);border-radius:14px;box-shadow:4px 4px 0 var(--tinta);background:#fff7e6}' +
    '.lapis-kartu p{margin:0;color:#fff7e6;font-size:.95rem;text-align:center}' +
    '.lapis-kartu .aksi{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function bungkus(ctx, teks, x, y, lebarMaks, tinggiBaris) {
    var kata = teks.split(' '), baris = '', n = 0;
    for (var i = 0; i < kata.length; i++) {
      var coba = baris ? baris + ' ' + kata[i] : kata[i];
      if (ctx.measureText(coba).width > lebarMaks && baris) {
        ctx.fillText(baris, x, y + n * tinggiBaris); n++; baris = kata[i];
      } else baris = coba;
    }
    ctx.fillText(baris, x, y + n * tinggiBaris);
    return n + 1;
  }

  function lukis(d, stikerEl, denganStiker) {
    var W = 1080, H = 1350;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    var TINTA = '#2b1c15', KERTAS = '#fff7e6', KUNING = '#f4c64f', JINGGA = '#f28c4b', AKSEN = '#3ab5a6';
    var DISP = '"Bagel Fat One","Arial Rounded MT Bold",system-ui,sans-serif';
    var BODY = '"Bricolage Grotesque",system-ui,sans-serif';

    x.fillStyle = AKSEN; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,.12)';
    for (var gx = 30; gx < W; gx += 60) for (var gy = 30; gy < H; gy += 60) { x.beginPath(); x.arc(gx, gy, 5, 0, 7); x.fill(); }

    function kotak(px, py, w, h, r, warna, geser) {
      x.fillStyle = TINTA; x.beginPath(); x.roundRect(px + geser, py + geser, w, h, r); x.fill();
      x.fillStyle = warna; x.strokeStyle = TINTA; x.lineWidth = 8;
      x.beginPath(); x.roundRect(px, py, w, h, r); x.fill(); x.stroke();
    }
    kotak(70, 70, W - 140, H - 140, 56, KERTAS, 14);

    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    function teksTebal(t, px, py, ukuran, isi) {
      x.font = '400 ' + ukuran + 'px ' + DISP;
      x.lineJoin = 'round'; x.strokeStyle = TINTA; x.lineWidth = ukuran * (ukuran > 200 ? 0.075 : 0.16);
      x.strokeText(t, px + ukuran * 0.04, py + ukuran * 0.05);
      x.fillStyle = TINTA; x.fillText(t, px + ukuran * 0.04, py + ukuran * 0.05);
      x.strokeText(t, px, py); x.fillStyle = isi; x.fillText(t, px, py);
    }
    teksTebal('2Old Boys', W / 2, 220, 120, KUNING);
    x.fillStyle = TINTA; x.font = '800 44px ' + BODY;
    x.fillText(d.nama.toUpperCase(), W / 2, 295);

    if (denganStiker && stikerEl && stikerEl.naturalWidth) {
      var sw = 440, sh = sw * stikerEl.naturalHeight / stikerEl.naturalWidth;
      x.save(); x.translate(W / 2, 345 + sh / 2); x.rotate(-0.05);
      x.shadowColor = 'rgba(43,28,21,.3)'; x.shadowOffsetY = 10;
      x.drawImage(stikerEl, -sw / 2, -sh / 2, sw, sh); x.restore();
    }
    teksTebal(d.skor + '/' + d.total, W / 2, 1000, 250, KERTAS);

    x.fillStyle = TINTA; x.font = '600 44px ' + BODY;
    bungkus(x, d.pesan, W / 2, 1090, 800, 58);

    if (d.baru) {
      x.save(); x.translate(W - 250, 400); x.rotate(0.2);
      kotak(-170, -48, 340, 96, 48, JINGGA, 6);
      x.fillStyle = TINTA; x.font = '800 44px ' + BODY; x.fillText('REKOR BARU!', 0, 16); x.restore();
    }
    x.fillStyle = TINTA; x.globalAlpha = .7; x.font = '700 34px ' + BODY;
    x.fillText('Seberapa kenal kamu dengan 2Old Boys?', W / 2, H - 120);
    x.globalAlpha = 1;
    return c;
  }

  function kunciStiker(skor, total) {
    return skor === total ? 's02' : skor >= 7 ? 's11' : skor >= 4 ? 's07' : 's17';
  }
  function muatStiker(d, stikerEl) {
    return new Promise(function (ok) {
      var data = window.KARTU_STIKER && window.KARTU_STIKER[kunciStiker(d.skor, d.total)];
      if (!data) return ok(stikerEl);
      var im = new Image();
      im.onload = function () { ok(im); };
      im.onerror = function () { ok(stikerEl); };
      im.src = data;
    });
  }

  function buatKartu(d, stikerEl) {
    var tunggu = [];
    try {
      tunggu.push(document.fonts.load('120px "Bagel Fat One"'));
      tunggu.push(document.fonts.load('800 44px "Bricolage Grotesque"'));
    } catch (e) {}
    return Promise.all(tunggu).catch(function () {}).then(function () {
      return muatStiker(d, stikerEl);
    }).then(function (stiker) {
      var c = lukis(d, stiker, true), url;
      try { url = c.toDataURL('image/png'); }
      catch (e) { c = lukis(d, stiker, false); url = c.toDataURL('image/png'); }
      return { canvas: c, url: url };
    });
  }

  function tampilLapis(url, teks) {
    var lapis = el('div', 'lapis-kartu');
    lapis.setAttribute('role', 'dialog'); lapis.setAttribute('aria-label', 'Kartu hasil');
    var img = el('img'); img.src = url; img.alt = teks;
    lapis.appendChild(img);
    lapis.appendChild(el('p', null, 'Tekan lama gambar untuk menyimpan, atau pakai tombol unduh.'));
    var aksi = el('div', 'aksi');
    var unduh = el('a', 'tombol', 'Unduh kartu');
    unduh.href = url; unduh.download = 'kartu-2oldboys.png';
    var tutup = el('button', 'tombol kedua', 'Tutup'); tutup.type = 'button';
    function tutupLapis() { lapis.remove(); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') tutupLapis(); }
    tutup.addEventListener('click', tutupLapis);
    lapis.addEventListener('click', function (e) { if (e.target === lapis) tutupLapis(); });
    document.addEventListener('keydown', esc);
    aksi.appendChild(unduh); aksi.appendChild(tutup); lapis.appendChild(aksi);
    document.body.appendChild(lapis);
    tutup.focus();
  }

  function bagikan(d, stikerEl, tombol) {
    var label = tombol.textContent;
    tombol.disabled = true; tombol.textContent = 'Menyiapkan kartu...';
    buatKartu(d, stikerEl).then(function (h) {
      var teks = 'Skorku ' + d.skor + '/' + d.total + ' di ' + d.nama + '. Seberapa kenal kamu dengan 2Old Boys?';
      return new Promise(function (ok) { h.canvas.toBlob(ok, 'image/png'); }).then(function (blob) {
        var file = null;
        try { if (blob) file = new File([blob], 'kartu-2oldboys.png', { type: 'image/png' }); } catch (e) {}
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({ files: [file], text: teks }).catch(function (e) {
            if (!e || e.name !== 'AbortError') tampilLapis(h.url, teks);
          });
        }
        tampilLapis(h.url, teks);
      });
    }).catch(function () {}).then(function () {
      tombol.disabled = false; tombol.textContent = label;
    });
  }

  // Dipanggil dari layar hasil tiap mode.
  function pasang(kartu, aksi, mode, nama, skor, total, pesan) {
    var lama = baca(mode);
    var baru = !lama || skor > lama.skor;
    var terbaik = baru ? skor : lama.skor;
    simpan(mode, { skor: terbaik, total: total, main: (lama ? lama.main : 0) + 1 });

    var teks;
    if (!lama) teks = 'Rekor pertamamu: ' + skor + '/' + total;
    else if (baru) teks = 'Rekor baru! Sebelumnya ' + lama.skor + '/' + lama.total;
    else if (skor === lama.skor) teks = 'Menyamai rekormu: ' + terbaik + '/' + total;
    else teks = 'Rekormu: ' + terbaik + '/' + total;
    var lencana = el('p', 'rekor' + (baru && lama ? ' baru' : ''), teks);
    var skorEl = kartu.querySelector('.skor');
    if (skorEl) skorEl.insertAdjacentElement('afterend', lencana); else kartu.insertBefore(lencana, aksi);

    var stikerEl = kartu.querySelector('.stiker-hasil');
    var tombol = el('button', 'tombol kedua', 'Bagikan kartu'); tombol.type = 'button';
    tombol.addEventListener('click', function () {
      bagikan({ nama: nama, skor: skor, total: total, pesan: pesan, baru: baru && !!lama }, stikerEl, tombol);
    });
    aksi.insertBefore(tombol, aksi.children[1] || null);
  }

  // Layar awal: tampilkan rekor kalau sudah pernah main.
  function pasangAwal(mode) {
    var r = baca(mode), mulai = document.getElementById('mulai');
    if (!r || !mulai) return;
    var p = el('p', 'rekor', 'Rekormu: ' + r.skor + '/' + r.total + ' · dimainkan ' + r.main + ' kali');
    var aksi = mulai.querySelector('.aksi');
    if (aksi) mulai.insertBefore(p, aksi); else mulai.appendChild(p);
  }

  window.KARTU = { pasang: pasang, pasangAwal: pasangAwal, nama: NAMA_MODE };
})();
