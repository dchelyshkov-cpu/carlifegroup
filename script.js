(() => {
  const body = document.body;
  const menuToggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mainNav');
  const backdrop = document.getElementById('menuBackdrop');
  const close = document.getElementById('menuClose');
  let scrollY = 0;
  function openMenu(){ if(!menu) return; scrollY = window.scrollY; body.style.top=`-${scrollY}px`; body.classList.add('menu-open'); menu.classList.add('is-open'); backdrop?.removeAttribute('hidden'); menu.setAttribute('aria-hidden','false'); menuToggle?.setAttribute('aria-expanded','true'); }
  function closeMenu(){ if(!menu) return; menu.classList.remove('is-open'); backdrop?.setAttribute('hidden',''); menu.setAttribute('aria-hidden','true'); menuToggle?.setAttribute('aria-expanded','false'); body.classList.remove('menu-open'); body.style.top=''; window.scrollTo(0,scrollY); }
  menuToggle?.addEventListener('click',()=>menu?.classList.contains('is-open')?closeMenu():openMenu()); close?.addEventListener('click',closeMenu); backdrop?.addEventListener('click',closeMenu);
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  const markActive=()=>{if(!menu)return; const y=window.scrollY+120; menu.querySelectorAll('.menu-links a[href^="#"]').forEach(a=>{const id=a.getAttribute('href'); const el=document.querySelector(id); a.classList.toggle('is-current',!!el && y>=el.offsetTop && y<el.offsetTop+el.offsetHeight);});};
  window.addEventListener('scroll',markActive,{passive:true}); markActive();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();document.getElementById('cookieModal')?.setAttribute('hidden','')}});

  document.querySelectorAll('.filters button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}));
  document.querySelectorAll('.gallery-thumbs button').forEach((btn,i)=>btn.addEventListener('click',()=>{const main=document.getElementById('galleryImage');const counter=document.getElementById('galleryCount');const src=btn.dataset.src;if(!main||!src)return;main.src=src;document.querySelectorAll('.gallery-thumbs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');if(counter)counter.textContent=`${String(i+1).padStart(2,'0')} / ${String(document.querySelectorAll('.gallery-thumbs button').length).padStart(2,'0')}`}));

  const topBtn=document.getElementById('backTop'); const syncTop=()=>topBtn?.classList.toggle('is-visible',window.scrollY>500); window.addEventListener('scroll',syncTop,{passive:true}); topBtn?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})); syncTop();

  const cookieBanner=document.getElementById('cookieBanner'), cookieModal=document.getElementById('cookieModal'), settingsTrigger=document.getElementById('cookieSettingsTrigger'), cookieClose=document.getElementById('cookieClose'), cookieSave=document.getElementById('cookieSave'), analytics=document.getElementById('cookieAnalytics'), marketing=document.getElementById('cookieMarketing');
  const key='carlife_cookie_v2';
  function read(){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
  function write(v){try{localStorage.setItem(key,JSON.stringify(v))}catch{}}
  function showSettings(){if(!cookieModal)return; const v=read()||{}; if(analytics)analytics.checked=!!v.analytics;if(marketing)marketing.checked=!!v.marketing;cookieModal.removeAttribute('hidden')}
  function hideSettings(){cookieModal?.setAttribute('hidden','')}
  function save(v){write(v);cookieBanner?.setAttribute('hidden','');hideSettings()}
  if(read()) cookieBanner?.setAttribute('hidden','');
  document.querySelectorAll('[data-cookie]').forEach(btn=>btn.addEventListener('click',()=>{const a=btn.dataset.cookie;if(a==='accept')save({necessary:true,analytics:true,marketing:true});else if(a==='reject')save({necessary:true,analytics:false,marketing:false});else showSettings()}));
  settingsTrigger?.addEventListener('click',showSettings); cookieClose?.addEventListener('click',hideSettings); cookieSave?.addEventListener('click',()=>save({necessary:true,analytics:!!analytics?.checked,marketing:!!marketing?.checked}));
})();
