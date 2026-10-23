/* Tombol "Kembali ke atas": muncul setelah menggulir cukup jauh. */
(function(){
  var css=".ke-atas{position:fixed;z-index:15;right:max(.8rem,env(safe-area-inset-right,0px));bottom:calc(6rem + env(safe-area-inset-bottom,0px));"+
    "width:2.9rem;height:2.9rem;padding:0;display:grid;place-items:center;cursor:pointer;"+
    "background:var(--aksen);color:#2b1c15;border:3px solid var(--tinta);border-radius:50%;box-shadow:3px 3px 0 var(--tinta);"+
    "opacity:0;transform:translateY(.6rem);pointer-events:none;transition:opacity .2s,transform .2s,box-shadow .12s}"+
    ".ke-atas.tampil{opacity:1;transform:none;pointer-events:auto}"+
    ".ke-atas:hover{box-shadow:4px 4px 0 var(--tinta)}.ke-atas:active{box-shadow:1px 1px 0 var(--tinta)}"+
    ".ke-atas svg{width:1.4rem;height:1.4rem;display:block}"+
    "@media (prefers-reduced-motion:reduce){.ke-atas{transition:none}}";
  function pasang(){
    var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    var b=document.createElement("button");
    b.type="button";b.className="ke-atas";b.setAttribute("aria-label","Kembali ke atas");b.title="Kembali ke atas";
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';
    b.tabIndex=-1;
    b.addEventListener("click",function(){
      var kurang=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({top:0,behavior:kurang?"auto":"smooth"});
    });
    document.body.appendChild(b);
    function cek(){
      var t=window.scrollY>window.innerHeight*0.9;
      b.classList.toggle("tampil",t);b.tabIndex=t?0:-1;
    }
    window.addEventListener("scroll",cek,{passive:true});cek();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",pasang);else pasang();
})();
