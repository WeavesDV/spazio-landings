(async()=>{const errs=[];window.addEventListener('error',e=>errs.push(e.message));
const total=document.querySelectorAll('.reveal').length;
const before=document.querySelectorAll('.reveal.is-in').length;
for(let y=0;y<document.documentElement.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}
await new Promise(r=>setTimeout(r,1800));
const after=document.querySelectorAll('.reveal.is-in').length;
const pending=[...document.querySelectorAll('.reveal:not(.is-in)')].map(e=>e.className).slice(0,8);
return JSON.stringify({js:document.documentElement.classList.contains('js'),total,before,after,pending,scrolled:document.querySelector('.site-header').classList.contains('is-scrolled'),errs,heroAnim:getComputedStyle(document.querySelector('.hero-img')).animationName});})()