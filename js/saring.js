/* Penyaring nama dan teks (sama dengan buku tamu): kata kasar dan tautan. */
(function(){
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
  window.SARING={kasar:kasar,spam:spam};
})();
