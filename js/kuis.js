(function () {
  var bank = [
    // ===== CERITA (jenis: 'cerita') =====
    { j: 'cerita', t: 'Dalam kisah “The Greatest Love of All”, apa yang tidak boleh hilang saat kita mencintai seseorang?',
      p: ['Jati diri dan harga diri', 'Kenangan masa kecil', 'Harapan untuk bertemu lagi', 'Rasa takut kehilangan'], b: 0,
      k: 'Kehilangan seseorang bukan berarti kehilangan harga diri. Sebelum mencintai orang lain, kita perlu mencintai dan menghargai diri sendiri.' },
    { j: 'cerita', t: 'Lagu mana yang bercerita tentang seseorang yang tak ingin melewatkan satu momen pun, bahkan saat pasangannya tertidur?',
      p: ['Making Love Out of Nothing at All', 'I Don’t Want To Miss A Thing', 'Goodbye', 'Through the Years'], b: 1,
      k: 'I Don’t Want To Miss A Thing: setiap detik bersama pasangan terasa berharga, dan ia berharap waktu bisa berhenti.' },
    { j: 'cerita', t: 'Menurut kisah “Making Love Out of Nothing at All”, apa yang justru terasa sulit dijelaskan dengan kata-kata?',
      p: ['Rasa sedih saat berpisah', 'Cinta sejati', 'Alasan sebuah pertengkaran', 'Arti kata maaf'], b: 1,
      k: 'Tokohnya paham cinta dan perasaan orang lain, tetapi merasa cinta sejati sulit diungkapkan lewat kata-kata.' },
    { j: 'cerita', t: 'Lagu mana yang bercerita tentang keinginan untuk dimengerti, bukan hanya dari sikap dan kata-kata, tetapi juga dari perasaan terdalam?',
      p: ['Heaven', 'Shape of My Heart', 'Goodbye', 'The Power of Love'], b: 1,
      k: 'Shape of My Heart: seseorang tampak baik-baik saja di luar, padahal menyimpan penyesalan, keraguan, dan harapan di dalam.' },
    { j: 'cerita', t: 'Dalam “I Don’t Want to Talk About It”, mengapa tokohnya memilih diam dan menyimpan sendiri kesedihannya?',
      p: ['Karena ia sudah tidak peduli lagi', 'Karena lukanya sudah sembuh sepenuhnya', 'Karena terlalu menyakitkan untuk diungkapkan', 'Karena ingin membalas dendam'], b: 2,
      k: 'Di balik sikap diam, ada perasaan mendalam dan luka yang belum sepenuhnya sembuh.' },
    { j: 'cerita', t: 'Lagu mana yang bercerita tentang kenangan indah bersama orang tercinta, yang tetap hidup di hati meski orangnya telah pergi?',
      p: ['Forever Young', 'The Best of Times', 'Goodbye', 'Through the Years'], b: 1,
      k: 'The Best of Times: waktu tidak bisa diulang, tetapi kenangan akan selalu menjadi bagian dari diri kita. Hargai kebersamaan selagi ada kesempatan.' },
    { j: 'cerita', t: 'Mengapa tokoh dalam “Love Me Like There’s No Tomorrow” ingin mencintai sepenuh hati dan memberikan seluruh kebahagiaan?',
      p: ['Karena ingin dikenal banyak orang', 'Karena yakin akan bersama selamanya', 'Karena takut ditinggalkan teman', 'Karena tidak tahu berapa lama waktu yang tersisa bersama orang yang disayangi'], b: 3,
      k: 'Ia sadar kebersamaan tidak selamanya, jadi ingin menunjukkan betapa berharganya seseorang sebelum kesempatan itu hilang.' },
    { j: 'cerita', t: 'Lagu mana yang bercerita tentang orang tersayang yang tumbuh dewasa dan menjalani hidupnya sendiri, sementara kita terlalu sibuk dengan rutinitas?',
      p: ['Slipping Through My Fingers', 'Heaven', 'Still Loving You', 'Through the Years'], b: 0,
      k: 'Slipping Through My Fingers: ada rasa haru dan penyesalan karena waktu tidak bisa dihentikan.' },
    { j: 'cerita', t: 'Menurut kisah “Heaven”, apa yang sebenarnya cukup untuk membuat kita bahagia?',
      p: ['Hidup yang sempurna tanpa masalah', 'Kekayaan dan ketenaran', 'Seseorang yang membuat kita merasa dicintai dan diterima apa adanya', 'Kenangan masa muda'], b: 2,
      k: 'Kita tidak butuh sesuatu yang sempurna. Cukup seseorang yang menjadi tempat paling nyaman untuk pulang.' },
    { j: 'cerita', t: 'Lagu mana yang berbicara tentang ego yang membuat seseorang sulit mengucapkan maaf kepada orang yang dicintai?',
      p: ['Goodbye', 'Hard to Say I’m Sorry / Get Away', 'The Greatest Love of All', 'To Love You More'], b: 1,
      k: 'Mempertahankan cinta butuh kerendahan hati untuk mengakui kesalahan dan berani mengesampingkan ego.' },
    { j: 'cerita', t: 'Dalam “Still Loving You”, mengapa seseorang belum ingin menyerah meski hubungan penuh luka dan jarak?',
      p: ['Karena tidak ada pilihan lain', 'Karena takut sendirian', 'Karena perasaannya masih sama dan masih ada harapan', 'Karena sudah berjanji pada orang lain'], b: 2,
      k: 'Selama masih ada harapan, cinta itu layak diperjuangkan sekali lagi.' },
    { j: 'cerita', t: 'Dalam “She’s Gone”, apa yang datang bersama penyesalan setelah orang yang dicintai pergi?',
      p: ['Kemarahan', 'Rasa lega', 'Kerinduan', 'Keinginan memulai hidup baru'], b: 2,
      k: 'Penyesalan datang bersama kerinduan, sementara hati masih sulit menerima kenyataan bahwa sosok yang dulu selalu ada kini tak lagi di sisi.' },
    { j: 'cerita', t: 'Lagu mana yang bercerita tentang perpisahan karena keadaan memaksa dua orang berjalan ke arah yang berbeda, padahal hati masih ingin bersama?',
      p: ['Heaven', 'Goodbye', 'The Power of Love', 'Forever Young'], b: 1,
      k: 'Goodbye: merelakan menjadi cara menerima kenyataan, dan kenangan serta kasih sayang tidak serta-merta hilang.' },
    { j: 'cerita', t: 'Apa pesan utama “You Are Not Alone” bagi orang yang merasa kesepian dan terpuruk?',
      p: ['Sebaiknya menyendiri sampai pulih', 'Jarak selalu memisahkan cinta', 'Hanya yang hadir langsung yang bisa memberi dukungan', 'Jangan menyerah, karena selalu ada harapan dan cinta sebagai pegangan'], b: 3,
      k: 'Kasih sayang tetap bisa dirasakan walau jarak memisahkan. Bahkan saat dunia terasa sunyi, kita tidak benar-benar sendirian.' },
    { j: 'cerita', t: 'Lagu mana yang menyebut bahwa kekuatan terbesar bukan berasal dari apa yang kita miliki, melainkan dari cinta yang tulus?',
      p: ['Still Loving You', 'She’s Gone', 'Slipping Through My Fingers', 'The Power of Love'], b: 3,
      k: 'The Power of Love: cinta memberi keberanian, ketenangan, dan harapan untuk menghadapi rintangan.' },
    { j: 'cerita', t: 'Dalam “To Love You More”, apa yang paling diharapkan oleh tokohnya?',
      p: ['Dilupakan dengan tenang', 'Diberi kesempatan menunjukkan betapa besar kasih sayangnya', 'Mendapat balasan yang setimpal', 'Pergi jauh untuk memulai lagi'], b: 1,
      k: 'Ia takut kehilangan dan ingin tetap menjadi bagian dari hidup orang yang dicintai, serta membuatnya bahagia.' },
    { j: 'cerita', t: 'Dalam “Love of My Life”, kapan seseorang baru menyadari betapa berharganya sebuah cinta?',
      p: ['Saat merayakan ulang tahun bersama', 'Saat pertama kali bertemu', 'Saat memenangkan sesuatu bersama', 'Saat harus menghadapi kenyataan bahwa orang yang paling berarti telah pergi'], b: 3,
      k: 'Perasaan dan kenangan indah masih sulit dilupakan, disertai kerinduan untuk memperbaiki keadaan.' },
    { j: 'cerita', t: 'Lagu mana yang berpesan bahwa kematian bukan selalu akhir dari segalanya?',
      p: ['She’s Gone', 'Scene Eight: The Spirit Carries On', 'The Best of Times', 'Forever Young'], b: 1,
      k: 'Semangat dan pengaruh seseorang dapat terus hidup dalam hati orang lain, jadi kita diajak berani menjalani hidup dengan penuh makna.' },
    { j: 'cerita', t: 'Menurut kisah “Through the Years”, cinta sejati bukan sekadar awal yang indah, melainkan apa?',
      p: ['Menemukan orang yang sempurna', 'Tetap memilih orang yang sama dari tahun ke tahun', 'Menghindari semua tantangan', 'Selalu berada di tempat yang sama'], b: 1,
      k: 'Pasangan juga menjadi sahabat yang selalu ada, dan kesetiaan membuat dua hati tetap bertahan melewati masa sulit.' },
    { j: 'cerita', t: 'Lagu mana yang bercerita tentang keinginan untuk tetap muda selamanya, sambil sadar bahwa hidup begitu singkat?',
      p: ['Slipping Through My Fingers', 'The Best of Times', 'Forever Young', 'Heaven'], b: 2,
      k: 'Masa muda adalah simbol kebebasan, harapan, dan impian, sehingga setiap kesempatan terasa berharga.' },

    // ===== TEBAK ARTIS (jenis: 'artis') =====
    { j: 'artis', t: 'Siapa yang membawakan “Love of My Life” di album ini?',
      p: ['Freddie Mercury', 'Rod Stewart', 'Queen', 'Michael Jackson'], b: 2,
      k: 'Di album ini lagu tersebut tercatat atas nama Queen, bukan Freddie Mercury sebagai solois.' },
    { j: 'artis', t: 'Penyanyi mana yang membawakan dua lagu sekaligus, “The Power of Love” dan “To Love You More”?',
      p: ['Whitney Houston', 'Air Supply', 'Chicago', 'Celine Dion'], b: 3,
      k: 'Celine Dion punya dua lagu di album ini.' },
    { j: 'artis', t: 'Pasangan lagu mana yang sama-sama dibawakan Air Supply?',
      p: ['Heaven dan Goodbye', 'Still Loving You dan She’s Gone', 'Forever Young dan Heaven', 'Making Love Out of Nothing at All dan Goodbye'], b: 3,
      k: 'Air Supply membawakan dua lagu di album ini.' },
    { j: 'artis', t: 'Siapa penyanyi “You Are Not Alone”?',
      p: ['Freddie Mercury', 'Michael Jackson', 'Kenny Rogers', 'Rod Stewart'], b: 1,
      k: 'Michael Jackson.' }
  ];

  // Komposisi 10 pertanyaan tiap main
  var CERITA = 8, ARTIS = 2;
  var warna = ['--aksen', '--kuning', '--sage', '--langit', '--lila'];

  function acak(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Menyusun 10 pertanyaan: 8 tentang cerita lagu, 2 tebak artis
  function susun() {
    var dari = function (j) { return bank.filter(function (q) { return q.j === j; }); };
    return acak(acak(dari('cerita')).slice(0, CERITA).concat(acak(dari('artis')).slice(0, ARTIS)));
  }

  if (typeof module !== 'undefined') module.exports = { susun: susun, bank: bank };
  if (typeof document === 'undefined') return;

  var root = document.getElementById('kuis');
  var soal = [], idx = 0, skor = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function mulai() {
    soal = susun();
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

    var h = el('h2', null, s.t);
    h.tabIndex = -1;
    kartu.appendChild(h);
    if (s.lirik) kartu.appendChild(el('blockquote', 'lirik', s.lirik));

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
    acak(s.p.map(function (teks, i) { return i; })).forEach(function (i) {
      var li = document.createElement('li');
      var b = el('button', 'pilihan', s.p[i]);
      b.type = 'button';
      if (s.sub) b.appendChild(el('small', null, s.sub[i]));
      var me = { b: b, i: i };
      tombol.push(me);
      b.addEventListener('click', function () {
        var benar = i === s.b;
        if (benar) skor++;
        tombol.forEach(function (x) {
          x.b.disabled = true;
          if (x.i === s.b) x.b.classList.add('benar');
          else if (x === me) x.b.classList.add('salah');
          else x.b.classList.add('redup');
        });
        var u = el('div', 'umpan');
        u.appendChild(el('strong', null, benar ? 'Benar!' : 'Belum tepat.'));
        u.appendChild(el('span', null, s.k));
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
    if (skor === soal.length) pesan = 'Sempurna! Kamu benar-benar kenal album ini.';
    else if (skor >= 7) pesan = 'Keren, kamu cukup hafal cerita dan lagu-lagu kami.';
    else if (skor >= 4) pesan = 'Lumayan! Masih ada beberapa lagu yang bisa didengar ulang.';
    else pesan = 'Tidak apa-apa, putar albumnya dan coba lagi.';
    var h = el('h2', null, 'Kuis selesai');
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
    if (window.KARTU) window.KARTU.pasang(kartu, aksi, 'kuis', 'Kuis 2Old Boys', skor, soal.length, pesan);
    if (window.PAPAN) window.PAPAN.pasangHasil(kartu, skor, aksi);
    root.replaceChildren(kartu);
    h.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }

  document.getElementById('btn-mulai').addEventListener('click', mulai);
})();
