/* Buku tamu: pesan langsung tampil, disimpan di Firebase Realtime Database lewat REST. */
(function(){
  var ALAMAT=(window.PAPAN_URL||"").replace(/\/+$/,"");
  var BATAS_NAMA=20,BATAS_PESAN=140,JEDA=30000,MAKS=30,KUNCI_JEDA="2ob-tamu-terakhir";
  var $=function(i){return document.getElementById(i)};
  var form=$("form"),nama=$("nama"),pesan=$("pesan"),hitung=$("hitung"),kirim=$("kirim"),
      status=$("status"),daftar=$("pesan-daftar"),kosong=$("kosong");

  // Kata kasar umum (ID dan EN). Dicek setelah huruf dinormalkan, jadi "b4j!ngan" tetap kena.
  var KASAR=["anjing","anjir","babi","bangsat","bajingan","brengsek","kontol","memek","ngentot","jancok","jancuk","asu","tolol","goblok","bego","kampret","sialan","setan","pepek","pukimak","bokep","fuck","shit","bitch","asshole","dick","cunt","nigga","nigger","porn"];
  var PETA={"0":"o","1":"i","3":"e","4":"a","5":"s","7":"t","@":"a","$":"s","!":"i"};
  function normal(t){
    t=String(t).toLowerCase().replace(/[01345 7@$!]/g,function(c){return PETA[c]||c});
    return t.replace(/[^a-z]/g,"").replace(/(.)\1+/g,"$1");
  }
  function kasar(t){
    var n=normal(t);
    for(var i=0;i<KASAR.length;i++){if(n.indexOf(normal(KASAR[i]))>=0)return true}
    return false;
  }
  function spam(t){
    if(/https?:\/\/|www\.|\.(com|net|org|id|xyz|ru|io)\b/i.test(t))return "Tautan belum boleh ditaruh di sini.";
    if(/(.)\1{9,}/.test(t))return "Terlalu banyak huruf berulang.";
    return "";
  }

  var EMOT=["\u2764\uFE0F","\uD83D\uDE02","\uD83E\uDD79","\uD83D\uDD25","\uD83C\uDFB6","\uD83D\uDC4D"];
  var LAGU=(window.DATA_2OB&&window.DATA_2OB.lagu)||[];
  var pilihEmot="",pilihTokoh="";
  [].forEach.call($("tokoh").children,function(b){
    b.addEventListener("click",function(){
      var t=b.getAttribute("data-t");pilihTokoh=(pilihTokoh===t)?"":t;
      [].forEach.call($("tokoh").children,function(x){x.setAttribute("aria-checked",x.getAttribute("data-t")===pilihTokoh?"true":"false")});
    });
  });
  function judul(no){for(var i=0;i<LAGU.length;i++)if(LAGU[i].no===no)return LAGU[i].judul;return ""}
  LAGU.forEach(function(l){
    var o=document.createElement("option");o.value=l.no;
    o.textContent=(l.no<10?"0":"")+l.no+". "+l.judul+" \u2013 "+l.artis;$("lagu").appendChild(o);
  });
  EMOT.forEach(function(e){
    var b=document.createElement("button");b.type="button";b.textContent=e;
    b.setAttribute("role","radio");b.setAttribute("aria-checked","false");
    b.addEventListener("click",function(){
      pilihEmot=(pilihEmot===e)?"":e;
      [].forEach.call($("emot").children,function(x){x.setAttribute("aria-checked",x.textContent===pilihEmot?"true":"false")});
    });
    $("emot").appendChild(b);
  });

  function lapor(teks,galat){status.textContent=teks;status.className="status"+(galat?" galat":"")}
  function bacaJeda(){try{return +localStorage.getItem(KUNCI_JEDA)||0}catch(e){return 0}}
  function tulisJeda(){try{localStorage.setItem(KUNCI_JEDA,String(Date.now()))}catch(e){}}

  var WAJAH=[];
  ["k","a"].forEach(function(p){for(var i=1;i<=8;i++)WAJAH.push({t:p==="k"?"kepin":"adpel",f:"stiker-tamu/"+p+(i<10?"0":"")+i+".webp"})});
  function stiker(id,tokoh){
    var h=0;for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;
    var kolam=WAJAH.filter(function(w){return !tokoh||w.t===tokoh});
    if(!kolam.length)kolam=WAJAH;
    return kolam[h%kolam.length].f;
  }
  function tanggal(w){
    if(!w)return "";
    try{return new Date(w).toLocaleString("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch(e){return ""}
  }
  function gambar(data){
    daftar.textContent="";
    var kunci=Object.keys(data||{}).filter(function(k){
      var d=data[k];return d&&typeof d.nama==="string"&&typeof d.pesan==="string";
    }).sort().reverse();
    kosong.hidden=kunci.length>0;
    if(!kunci.length)kosong.textContent="Belum ada pesan. Jadilah yang pertama.";
    kunci.forEach(function(k){
      var d=data[k],li=document.createElement("li"),img=new Image(),isi=document.createElement("div"),
          b=document.createElement("b"),s=document.createElement("small"),p=document.createElement("p");
      img.src=stiker(k,d.tokoh);img.alt="";img.width=58;img.height=58;img.loading="lazy";
      var nm=document.createElement("span");nm.textContent=d.nama;b.appendChild(nm);
      if(EMOT.indexOf(d.emot)>=0){var em=document.createElement("span");em.className="emot-pesan";em.textContent=d.emot;em.setAttribute("aria-hidden","true");b.appendChild(em)}
      s.textContent=tanggal(d.waktu);p.textContent=d.pesan;
      isi.appendChild(b);isi.appendChild(s);isi.appendChild(p);
      if(typeof d.lagu==="number"&&judul(d.lagu)){var ll=document.createElement("span");ll.className="label-lagu";ll.textContent="\u266A "+judul(d.lagu);isi.appendChild(ll)}
      li.appendChild(img);li.appendChild(isi);daftar.appendChild(li);
    });
  }

  function muat(){
    if(!ALAMAT){kosong.hidden=false;kosong.textContent="Buku tamu belum disambungkan ke Firebase.";return}
    fetch(ALAMAT+"/tamu.json?orderBy=%22%24key%22&limitToLast="+MAKS)
      .then(function(r){if(!r.ok)throw 0;return r.json()})
      .then(function(d){gambar(d||{})})
      .catch(function(){kosong.hidden=false;kosong.textContent="Pesan belum bisa dimuat. Coba lagi nanti."});
  }

  function dataKirim(n,p){
    var d={nama:n,pesan:p,waktu:{".sv":"timestamp"}},no=parseInt($("lagu").value,10);
    if(no>=1&&no<=LAGU.length&&judul(no))d.lagu=no;
    if(pilihEmot)d.emot=pilihEmot;
    if(pilihTokoh)d.tokoh=pilihTokoh;
    return d;
  }
  pesan.addEventListener("input",function(){hitung.textContent=pesan.value.length+"/"+BATAS_PESAN});

  form.addEventListener("submit",function(e){
    e.preventDefault();
    var n=nama.value.replace(/\s+/g," ").trim(),p=pesan.value.replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
    if(!ALAMAT)return lapor("Buku tamu belum disambungkan ke Firebase.",true);
    if(!n)return lapor("Isi namamu dulu.",true);
    if(!p)return lapor("Pesannya masih kosong.",true);
    if(n.length>BATAS_NAMA||p.length>BATAS_PESAN)return lapor("Teks terlalu panjang.",true);
    var sp=spam(n+" "+p);if(sp)return lapor(sp,true);
    if(kasar(n)||kasar(p))return lapor("Ada kata yang kurang pantas. Coba ganti ya.",true);
    var sisa=JEDA-(Date.now()-bacaJeda());
    if(sisa>0)return lapor("Tunggu "+Math.ceil(sisa/1000)+" detik lagi sebelum kirim pesan berikutnya.",true);

    kirim.disabled=true;lapor("Menempel pesan...",false);
    // text/plain supaya termasuk "simple request" dan tidak memicu preflight CORS
    fetch(ALAMAT+"/tamu.json",{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8"},
      body:JSON.stringify(dataKirim(n,p))})
      .then(function(r){if(!r.ok)throw 0;return r.json()})
      .then(function(){tulisJeda();pesan.value="";$("lagu").value="";pilihEmot="";pilihTokoh="";[].forEach.call($("tokoh").children,function(x){x.setAttribute("aria-checked","false")});[].forEach.call($("emot").children,function(x){x.setAttribute("aria-checked","false")});hitung.textContent="0/"+BATAS_PESAN;lapor("Pesanmu sudah tertempel. Terima kasih!",false);muat()})
      .catch(function(){lapor("Pesan gagal terkirim. Coba lagi sebentar.",true)})
      .then(function(){kirim.disabled=false});
  });

  muat();
  setInterval(function(){if(!document.hidden)muat()},30000);
})();
