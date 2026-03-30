const head = document.getElementById("head");
const tugle = document.getElementById('tugle');
const body = document.body;

tugle.onclick =()=>{
  head.classList.toggle("night-Mode");
  body.classList.toggle("night-Mode");
 const layout = document.querySelectorAll(".layout");
  layout.forEach(div => div.classList.toggle("night-Mode"))
//  window.dialog.classList.toggle("night-Mode");
  tugle.textContent = head.classList.contains("night-Mode") ? 'day-Mode':' night-Mode';
}

const ppb = document.getElementById('popup-bttn');
const nL = document.getElementById("navList");

ppb.addEventListener('click',()=>{
    nL.style.display = "";
    nL.style.display === "flex"?"none":"flex";
});

document.addEventListener("click",(event)=>{
   if(!
   ppb.contains(event.target)
   &&!
   nL.contains(event.target))
   {
     nL.style.display="none";
   }
 });
 
 const search = document.getElementById('search');
 const panna = document.getElementById('panna');
 const sBar = document.getElementById('searchBar');
 const find1 = document.getElementById("find1");
 
 const cancel = document.getElementById("cancel");
 search.addEventListener('click',()=>{
   sBar.style.display = "block";
   find1.style.display = "block";
   panna.style.display = "none";
   nL.style.display = "none";
   ppb.style.display = "none";
   cancel.style.display = "block";
   library.style.display = "none";
   display.style.display = "block";
   display.style.textAlign = "center";
 });
 
 cancel.addEventListener('click',()=>{
   panna.style.display = "block";
   ppb.style.display = "flex";
   cancel.style.display = "none";
   sBar.style.display = "none";
   find1.style.display = "none";
   library.style.display = "block";
   display.style.display = "none";
   display.innerHTML = "";
 });
 
 function getFingerprint(){
  return navigator.userAgent + screen.width + screen.height + navigator.language + new Date().getTimezoneOffset();
}
const userId = btoa(unescape(encodeURIComponent(getFingerprint()))).slice(0,15);

console.log("this is the user who viewed", userId)

                 
