(() => {
  const body = document.body;
  const menuToggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mainNav');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const menuClose = document.getElementById('menuClose');

  let menuScrollY = 0;
  const lockScroll = () => {
    menuScrollY = window.scrollY || 0;
    body.style.top = `-${menuScrollY}px`;
    body.classList.add('menu-open');
  };
  const unlockScroll = () => {
    body.classList.remove('menu-open');
    body.style.top = '';
    window.scrollTo(0, menuScrollY);
  };
  if (menu) menu.setAttribute('inert','');
  const closeMenu = () => {
    if (!menu || !menuToggle || !menu.classList.contains('open')) return;
    menuToggle.focus();
    menu.classList.remove('open');
    menuBackdrop?.classList.remove('open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Открыть меню');
    menu.setAttribute('aria-hidden','true');
    menu.setAttribute('inert','');
    unlockScroll();
  };
  const openMenu = () => {
    if (!menu || !menuToggle) return;
    lockScroll();
    menu.removeAttribute('inert');
    menu.classList.add('open');
    menuBackdrop?.classList.add('open');
    menuToggle.setAttribute('aria-expanded','true');
    menuToggle.setAttribute('aria-label','Закрыть меню');
    menu.setAttribute('aria-hidden','false');
    window.setTimeout(() => menuClose?.focus(), 0);
  };
  menuToggle?.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  menuClose?.addEventListener('click', closeMenu);
  menuBackdrop?.addEventListener('click', closeMenu);
  menu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#') && href.length > 1) {
        event.preventDefault();
        const target = document.querySelector(href);
        closeMenu();
        if (target) window.setTimeout(() => target.scrollIntoView({behavior:'smooth',block:'start'}), 24);
      } else {
        closeMenu();
      }
    });
  });
  document.addEventListener('keydown', event => { if(event.key === 'Escape' && menu?.classList.contains('open')) closeMenu(); });

  document.querySelectorAll('.faq-question').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const open = item.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    const marker = btn.querySelector('span');
    if(marker) marker.textContent = open ? '−' : '+';
  }));

  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const main = gallery.querySelector('[data-gallery-main]');
    const counter = gallery.querySelector('[data-gallery-counter]');
    const thumbs = [...gallery.querySelectorAll('[data-gallery-thumb]')];
    thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => {
      const img = thumb.dataset.src;
      if(!img || !main) return;
      main.src = img;
      main.alt = thumb.dataset.alt || main.alt;
      if(counter) counter.textContent = `${String(i+1).padStart(2,'0')} / ${String(thumbs.length).padStart(2,'0')}`;
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    }));
  });

  const backToTop = document.getElementById('backToTop');
  const cookieBanner = document.getElementById('cookieConsent');
  if(backToTop){
    const syncBackToTop = () => {
      const bannerHeight = cookieBanner && !cookieBanner.hidden ? cookieBanner.getBoundingClientRect().height : 0;
      const gap = 16;
      backToTop.style.setProperty('--back-to-top-bottom', `${bannerHeight ? bannerHeight + gap : gap}px`);
      backToTop.classList.toggle('is-visible', window.scrollY > 500);
    };
    window.addEventListener('scroll', syncBackToTop, {passive:true});
    window.addEventListener('resize', syncBackToTop, {passive:true});
    backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
    if(window.ResizeObserver && cookieBanner){ new ResizeObserver(syncBackToTop).observe(cookieBanner); }
    syncBackToTop();
  }

  const cookieKey = 'carlife_cookie_consent_v1';
  const banner = document.getElementById('cookieConsent');
  const settings = document.getElementById('cookieSettings');
  const backdrop = document.getElementById('cookieBackdrop');
  const trigger = document.getElementById('cookieSettingsTrigger');
  const readConsent = () => { try { return JSON.parse(localStorage.getItem(cookieKey) || 'null'); } catch { return null; } };
  const writeConsent = value => { try { localStorage.setItem(cookieKey, JSON.stringify(value)); } catch {} };
  const setSettings = open => {
    if(!settings || !backdrop) return;
    settings.hidden = !open; backdrop.hidden = !open;
    body.classList.toggle('cookie-lock', open);
  };
  const applySettings = value => {
    const analytics = document.querySelector('[data-cookie-category="analytics"]');
    const advertising = document.querySelector('[data-cookie-category="advertising"]');
    if(analytics) analytics.checked = !!value?.analytics;
    if(advertising) advertising.checked = !!value?.advertising;
  };
  const hideBanner = () => { if(banner) banner.hidden = true; if(trigger) trigger.hidden = false; };
  const showBanner = () => { if(banner) banner.hidden = false; if(trigger) trigger.hidden = true; };
  const save = value => { writeConsent(value); applySettings(value); hideBanner(); setSettings(false); window.dispatchEvent(new CustomEvent('carlife:cookie-consent',{detail:value})); };
  const current = readConsent();
  const previewMode = new URLSearchParams(window.location.search).has('preview');
  if(previewMode){ if(banner) banner.hidden = true; if(trigger) trigger.hidden = true; if(settings) settings.hidden = true; if(backdrop) backdrop.hidden = true; }
  else if(current){ applySettings(current); hideBanner(); } else { showBanner(); }
  document.querySelectorAll('[data-cookie-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.cookieAction;
    if(action === 'accept') save({necessary:true,analytics:true,advertising:true});
    if(action === 'reject') save({necessary:true,analytics:false,advertising:false});
    if(action === 'settings') { applySettings(readConsent() || {analytics:false,advertising:false}); setSettings(true); }
    if(action === 'close-settings') setSettings(false);
    if(action === 'save-settings') save({necessary:true,analytics:!!document.querySelector('[data-cookie-category="analytics"]')?.checked,advertising:!!document.querySelector('[data-cookie-category="advertising"]')?.checked});
  }));
  backdrop?.addEventListener('click', () => setSettings(false));
  document.addEventListener('keydown', event => { if(event.key === 'Escape') setSettings(false); });

  document.querySelectorAll('[data-placeholder-link]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
})();



// Shared phone mask for callback/booking forms: Belarus +375 and Russia +7.
(() => {
  const formatBY = digits => {
    const d = digits.slice(0,9);
    const p = [d.slice(0,2), d.slice(2,5), d.slice(5,7), d.slice(7,9)].filter(Boolean);
    if (!p.length) return '';
    return p[0] + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '');
  };
  const formatRU = digits => {
    const d = digits.slice(0,10);
    const p = [d.slice(0,3), d.slice(3,6), d.slice(6,8), d.slice(8,10)].filter(Boolean);
    if (!p.length) return '';
    return (p[0] ? '(' + p[0] + ')' : '') + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '');
  };
  const stripCountryPrefix = (raw, country) => {
    let d = (raw || '').replace(/\D/g,'');
    if (country === 'by') { if (d.startsWith('375')) d=d.slice(3); if (d.startsWith('80')) d=d.slice(1); return d.slice(0,9); }
    if (d.startsWith('7')) d=d.slice(1);
    return d.slice(0,10);
  };
  const setupPhone = (select,input) => {
    if (!select || !input) return;
    const sync = () => {
      const country = select.value;
      const digits = stripCountryPrefix(input.value,country);
      input.value = country === 'by' ? formatBY(digits) : formatRU(digits);
      input.placeholder = country === 'by' ? '29 123-45-67' : '(999) 123-45-67';
      input.dataset.digits = digits;
    };
    select.addEventListener('change', () => { input.value=''; input.dataset.digits=''; input.focus(); sync(); });
    input.addEventListener('input', sync);
    input.addEventListener('paste', () => window.setTimeout(sync,0));
    sync();
    return () => stripCountryPrefix(input.value,select.value).length === (select.value==='by' ? 9 : 10);
  };
  window.CarLifePhoneMask = { setup: setupPhone };
})();

// Generic validated callback form based on the ALEN reference geometry.
(() => {
  const modal=document.getElementById('callbackModal');
  if(!modal) return;
  const form=document.getElementById('callbackForm');
  const status=document.getElementById('callbackStatus');
  const name=form?.querySelector('[name="name"]');
  const phone=form?.querySelector('[name="phone"]');
  const country=form?.querySelector('[name="phoneCountry"]');
  const consent=form?.querySelector('[name="consent"]');
  const submit=form?.querySelector('.callback-submit');
  let lastTrigger=null;
  const clearHoverSuppression=()=>document.body.classList.remove('callback-hover-suppress');
  const phoneValid=window.CarLifePhoneMask?.setup(country,phone) || (()=>false);
  const validate=showMessage=>{
    const nameOk=!!name?.value.trim();
    const phoneOk=phoneValid();
    const consentOk=!!consent?.checked;
    if(name) name.setCustomValidity(nameOk?'':'Пожалуйста, укажите имя.');
    if(phone) phone.setCustomValidity(phoneOk?'':'Пожалуйста, укажите корректный номер телефона.');
    if(consent) consent.setCustomValidity(consentOk?'':'Необходимо подтвердить согласие на обработку персональных данных.');
    const ok=nameOk&&phoneOk&&consentOk;
    if(submit) submit.disabled=!ok;
    if(showMessage && !ok && status){status.hidden=false;status.textContent='Заполните обязательные поля и подтвердите согласие.';}
    else if(status){status.hidden=true;status.textContent='';}
    return ok;
  };
  const open=trigger=>{clearHoverSuppression();lastTrigger=trigger instanceof HTMLElement?trigger:null;modal.hidden=false;document.body.classList.add('callback-modal-open');validate(false);window.setTimeout(()=>name?.focus(),0);};
  const close=()=>{
    const active=document.activeElement;
    if(active instanceof HTMLElement) active.blur();
    modal.hidden=true;
    document.body.classList.remove('callback-modal-open');
    status&&(status.hidden=true,status.textContent='');
    form?.reset();
    country&&(country.value='by');
    phone&&window.CarLifePhoneMask?.setup(country,phone);
    validate(false);
    if(lastTrigger instanceof HTMLElement) lastTrigger.blur();
    lastTrigger=null;
    document.body.classList.add('callback-hover-suppress');
  };
  document.querySelectorAll('[data-callback-open]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();open(btn);}));
  modal.querySelectorAll('[data-callback-close]').forEach(n=>n.addEventListener('click',close));
  document.addEventListener('pointermove',clearHoverSuppression,{passive:true});
  form?.addEventListener('input',()=>validate(false));
  form?.addEventListener('change',()=>validate(false));
  form?.addEventListener('submit',e=>{e.preventDefault();if(!validate(true)) return;if(status){status.hidden=false;status.textContent='Форма проверена. Подключение отправки заявки добавим на следующем этапе.';}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
})();

// Hero booking modal — visual prototype with country-aware phone mask and required consent.
(() => {
  const modal=document.getElementById('bookingModal'); if(!modal) return;
  const cardName=document.getElementById('bookingModalCar'); const form=document.getElementById('bookingForm'); const status=document.getElementById('bookingStatus');
  const name=form?.querySelector('[name="name"]'); const phone=form?.querySelector('[name="phone"]'); const country=form?.querySelector('[name="phoneCountry"]'); const consent=form?.querySelector('[name="consent"]'); const submit=form?.querySelector('.booking-submit');
  const finance=form?.querySelector('[name="finance"]'); let lastTrigger=null; let suppressTimer=0;
  const phoneValid=window.CarLifePhoneMask?.setup(country,phone) || (()=>false);
  const clearHoverSuppression=()=>{document.body.classList.remove('booking-hover-suppress');if(suppressTimer){window.clearTimeout(suppressTimer);suppressTimer=0;}};
  const validate=showMessage=>{
    const nameOk=!!name?.value.trim(); const phoneOk=phoneValid(); const consentOk=!!consent?.checked;
    if(name) name.setCustomValidity(nameOk?'':'Пожалуйста, укажите имя.');
    if(phone) phone.setCustomValidity(phoneOk?'':'Пожалуйста, укажите корректный номер телефона.');
    if(consent) consent.setCustomValidity(consentOk?'':'Необходимо подтвердить согласие на обработку персональных данных.');
    const ok=nameOk&&phoneOk&&consentOk;
    if(submit) submit.disabled=!ok;
    if(status){ status.hidden=!showMessage || ok; status.textContent=showMessage&&!ok?'Заполните обязательные поля и подтвердите согласие.':''; }
    return ok;
  };
  const close=()=>{
    const active=document.activeElement;if(active instanceof HTMLElement)active.blur();modal.hidden=true;document.body.classList.remove('booking-modal-open');status&&(status.hidden=true,status.textContent='');form?.reset();country&&(country.value='by');phone&&window.CarLifePhoneMask?.setup(country,phone);validate(false);
    document.body.classList.add('booking-hover-suppress');
    if(suppressTimer){window.clearTimeout(suppressTimer);suppressTimer=0;}
    if(lastTrigger instanceof HTMLElement){lastTrigger.blur();}
    lastTrigger=null;
  };
  const open=(trigger,value)=>{lastTrigger=trigger instanceof HTMLElement?trigger:null;clearHoverSuppression();if(cardName)cardName.textContent=value||'Выбранный автомобиль';modal.hidden=false;document.body.classList.add('booking-modal-open');validate(false);window.setTimeout(()=>name?.focus(),0);};
  document.querySelectorAll('[data-booking-open]').forEach(btn=>btn.addEventListener('click',()=>open(btn,btn.dataset.bookingCar||'Выбранный автомобиль')));
  modal.querySelectorAll('[data-booking-close]').forEach(n=>n.addEventListener('click',close));
  form?.addEventListener('input',()=>validate(false)); form?.addEventListener('change',()=>validate(false));
  document.addEventListener('pointermove',clearHoverSuppression,{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)close();else if(event.key!=='Escape')clearHoverSuppression();});
  form?.addEventListener('submit',e=>{e.preventDefault();if(!validate(true))return;if(status){status.hidden=false;status.textContent='Форма проверена. Подключение отправки заявки добавим на следующем этапе.';}});
})();

// Same-page anchors: consistent smooth scrolling, including desktop and mobile navigation.
(() => {
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    const href=link.getAttribute('href')||'';
    if(!href || href==='#' || href==='#callbackModal' || href==='#bookingModal') return;
    const target=document.querySelector(href); if(!target) return;
    link.addEventListener('click',e=>{
      if(link.closest('.main-nav')) return; // menu handler above already closes/scrolls
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();

// Block 01 demo inventory carousel: same interaction model as Hero.
(() => {
  const track=document.getElementById('inventoryCarsTrack'); if(!track) return;
  const cards=[...track.querySelectorAll('.inventory-demo-card')]; const prev=document.querySelector('[data-inventory-prev]'); const next=document.querySelector('[data-inventory-next]'); const count=document.querySelector('.inventory-carousel-count');
  const mobile=window.matchMedia('(max-width:768px)'); let active=0, raf=0, busy=false;
  const render=()=>{if(count)count.textContent=`${active+1} / ${cards.length}`;if(prev)prev.disabled=active===0;if(next)next.disabled=active===cards.length-1;};
  const nearest=()=>{const center=track.getBoundingClientRect().left+track.clientWidth/2;let ix=0,dist=Infinity;cards.forEach((c,i)=>{const r=c.getBoundingClientRect();const d=Math.abs(r.left+r.width/2-center);if(d<dist){dist=d;ix=i;}});return ix;};
  const go=ix=>{active=Math.max(0,Math.min(cards.length-1,ix));render();if(!mobile.matches)return;busy=true;const c=cards[active];track.scrollTo({left:c.offsetLeft-track.offsetLeft,behavior:'smooth'});window.setTimeout(()=>busy=false,420);};
  prev?.addEventListener('click',()=>go(active-1)); next?.addEventListener('click',()=>go(active+1)); track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(active+(e.key==='ArrowRight'?1:-1));}});
  track.addEventListener('scroll',()=>{if(busy||!mobile.matches)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{active=nearest();render();});},{passive:true});
  const relayout=()=>{busy=false;if(mobile.matches)go(active);else{active=0;track.scrollLeft=0;render();}};
  mobile.addEventListener?.('change',relayout); window.addEventListener('resize',relayout,{passive:true}); render(); go(0);
})();

// Hero carousel: single source of truth; only enabled on the narrow layout.
(() => {
  const track = document.getElementById('heroCarsTrack');
  if (!track) return;
  const cards = [...track.querySelectorAll('.hero-car-card')];
  const count = document.querySelector('.hero-carousel-count');
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  if (!cards.length) return;

  const mobileQuery = window.matchMedia('(max-width: 768px)');
  let activeIndex = 0;
  let programmatic = false;
  let settleTimer = 0;
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(cards.length - 1, value));
  const render = () => {
    if (count) count.textContent = `${activeIndex + 1} / ${cards.length}`;
    if (prev) prev.disabled = activeIndex === 0;
    if (next) next.disabled = activeIndex === cards.length - 1;
  };
  const nearest = () => {
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    let index = 0, distance = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const current = Math.abs(rect.left + rect.width / 2 - center);
      if (current < distance) { distance = current; index = i; }
    });
    return index;
  };
  const go = (requested, behavior = 'smooth') => {
    activeIndex = clamp(requested);
    render();
    if (!mobileQuery.matches) return;
    programmatic = true;
    clearTimeout(settleTimer);
    const card = cards[activeIndex];
    const left = card.offsetLeft - track.offsetLeft;
    track.scrollTo({ left, behavior });
    settleTimer = window.setTimeout(() => { programmatic = false; }, behavior === 'auto' ? 0 : 450);
  };
  prev?.addEventListener('click', () => go(activeIndex - 1));
  next?.addEventListener('click', () => go(activeIndex + 1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); go(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  track.addEventListener('scroll', () => {
    if (programmatic || !mobileQuery.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      activeIndex = nearest();
      render();
    });
  }, { passive: true });
  const onLayoutChange = () => {
    clearTimeout(settleTimer);
    programmatic = false;
    if (mobileQuery.matches) go(activeIndex, 'auto');
    else { activeIndex = 0; render(); track.scrollLeft = 0; }
  };
  mobileQuery.addEventListener?.('change', onLayoutChange);
  window.addEventListener('resize', onLayoutChange, { passive: true });
  render();
  go(0, 'auto');
})();


/* V10 — review carousel controls on compact screens */
document.addEventListener('DOMContentLoaded',()=>{
  const reviewTrack=document.querySelector('.review-grid--carousel');
  const reviewPrev=document.querySelector('[data-review-dir="prev"]');
  const reviewNext=document.querySelector('[data-review-dir="next"]');
  if(!reviewTrack||!reviewPrev||!reviewNext) return;
  const step=()=>{
    const card=reviewTrack.querySelector('.review-card--tilda');
    return card ? card.getBoundingClientRect().width + 12 : reviewTrack.clientWidth;
  };
  const update=()=>{
    const max=reviewTrack.scrollWidth-reviewTrack.clientWidth-2;
    reviewPrev.disabled=reviewTrack.scrollLeft<=2;
    reviewNext.disabled=reviewTrack.scrollLeft>=max;
  };
  reviewPrev.addEventListener('click',()=>reviewTrack.scrollBy({left:-step(),behavior:'smooth'}));
  reviewNext.addEventListener('click',()=>reviewTrack.scrollBy({left:step(),behavior:'smooth'}));
  reviewTrack.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update,{passive:true});
  update();
});
