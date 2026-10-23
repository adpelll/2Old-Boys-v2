/* Pesan terbaru buku tamu di halaman album: tiga pesan terakhir dari Firebase (REST). */
(function () {
  var ul = document.getElementById('tamu-terbaru');
  var alamat = (window.PAPAN_URL || '').replace(/\/+$/, '');
  if (!ul || !alamat) return;
  var EMOT = ['\u2764\uFE0F', '\uD83D\uDE02', '\uD83E\uDD79', '\uD83D\uDD25', '\uD83C\uDFB6', '\uD83D\uDC4D'];
  var WAJAH = [];
  ['k', 'a'].forEach(function (p) {
    for (var i = 1; i <= 8; i++) WAJAH.push({ t: p === 'k' ? 'kepin' : 'adpel', f: 'stiker-tamu/' + p + (i < 10 ? '0' : '') + i + '.webp' });
  });
  // Sama dengan buku tamu, jadi satu pesan selalu dapat stiker yang sama di dua halaman.
  function stiker(id, tokoh) {
    var h = 0;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    var kolam = WAJAH.filter(function (w) { return !tokoh || w.t === tokoh; });
    if (!kolam.length) kolam = WAJAH;
    return kolam[h % kolam.length].f;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function gambar(data) {
    var kunci = Object.keys(data || {}).filter(function (k) {
      var d = data[k];
      return d && typeof d.nama === 'string' && typeof d.pesan === 'string';
    }).sort().reverse().slice(0, 3);
    if (!kunci.length) return;
    kunci.forEach(function (k) {
      var d = data[k], li = el('li'), img = new Image(), isi = el('div', 'isi');
      img.src = stiker(k, d.tokoh); img.alt = ''; img.width = 46; img.height = 46; img.loading = 'lazy';
      var b = el('b', null, d.nama);
      if (EMOT.indexOf(d.emot) >= 0) { var em = el('span', 'emot-pesan', d.emot); em.setAttribute('aria-hidden', 'true'); b.appendChild(em); }
      var teks = d.pesan.length > 90 ? d.pesan.slice(0, 90).replace(/\s+\S*$/, '') + '\u2026' : d.pesan;
      isi.appendChild(b); isi.appendChild(el('p', null, teks));
      li.appendChild(img); li.appendChild(isi); ul.appendChild(li);
    });
    ul.hidden = false;
  }
  fetch(alamat + '/tamu.json?orderBy=%22%24key%22&limitToLast=3')
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(gambar)
    .catch(function () {});
})();
