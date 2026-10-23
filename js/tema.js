/* Tombol mode siang/malam. Pilihan disimpan di perangkat; tanpa pilihan, ikut pengaturan perangkat. */
(function(){
  var KUNCI="2oldboys-tema",root=document.documentElement;
  function baca(){try{return localStorage.getItem(KUNCI)}catch(e){return null}}
  function simpan(v){try{localStorage.setItem(KUNCI,v)}catch(e){}}
  function sedangGelap(){
    var t=root.getAttribute("data-theme");
    if(t==="dark")return true;
    if(t==="light")return false;
    return !!(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);
  }
  var awal=baca();
  if(awal==="dark"||awal==="light")root.setAttribute("data-theme",awal);

  var css=".tombol-tema{position:fixed;z-index:20;top:calc(.7rem + env(safe-area-inset-top,0px));right:max(.8rem,env(safe-area-inset-right,0px));"+
    "width:2.8rem;height:2.8rem;padding:0;display:grid;place-items:center;cursor:pointer;"+
    "background:var(--kuning);color:#2b1c15;border:3px solid var(--tinta);border-radius:50%;box-shadow:3px 3px 0 var(--tinta);"+
    "transition:transform .12s,box-shadow .12s}"+
    ".tombol-tema:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--tinta)}"+
    ".tombol-tema:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--tinta)}"+
    ".tombol-tema svg{width:1.45rem;height:1.45rem;display:block}"+
    ".tombol-tema .bulan{display:none}"+
    ".tombol-tema[data-gelap=\"1\"] .bulan{display:block}.tombol-tema[data-gelap=\"1\"] .matahari{display:none}";
  var SVG_M='<svg class="matahari" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3 7 7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/></svg>';
  var SVG_B='<svg class="bulan" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a.6.6 0 0 0-.8-.7A9.5 9.5 0 1 0 21.2 15.4a.6.6 0 0 0-.7-.8z"/></svg>';

  function pasang(){
    var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    var b=document.createElement("button");
    b.type="button";b.className="tombol-tema";b.innerHTML=SVG_M+SVG_B;
    function segar(){
      var g=sedangGelap();
      b.setAttribute("data-gelap",g?"1":"0");
      b.setAttribute("aria-label",g?"Ganti ke mode siang":"Ganti ke mode malam");
      b.title=g?"Mode siang":"Mode malam";
    }
    b.addEventListener("click",function(){
      var v=sedangGelap()?"light":"dark";
      root.setAttribute("data-theme",v);simpan(v);segar();
    });
    document.body.appendChild(b);segar();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",pasang);else pasang();
})();
