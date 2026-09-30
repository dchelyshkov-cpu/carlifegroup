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
    const cookieTrigger = document.getElementById('cookieSettingsTrigger');
    const syncBackToTop = () => {
      const bannerHeight = cookieBanner && !cookieBanner.hidden ? cookieBanner.getBoundingClientRect().height : 0;
      const gap = 16;
      const bottom = `${bannerHeight ? bannerHeight + gap : gap}px`;
      backToTop.style.setProperty('--utility-bottom', bottom);
      cookieTrigger?.style.setProperty('--utility-bottom', bottom);
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
    if(lastTrigger instanceof HTMLElement){
      lastTrigger.classList.add('modal-trigger-cooldown');
    }
    window.setTimeout(()=>document.body.classList.remove('callback-hover-suppress'),300);
  };
  document.querySelectorAll('[data-callback-open]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();open(btn);}));
  modal.querySelectorAll('[data-callback-close]').forEach(n=>n.addEventListener('click',close));
  document.querySelectorAll('[data-booking-open]').forEach(btn=>btn.addEventListener('pointerleave',()=>btn.classList.remove('modal-trigger-cooldown')));
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
  const clearHoverSuppression=()=>{document.body.classList.remove('booking-hover-suppress');if(suppressTimer){window.clearTimeout(suppressTimer);suppressTimer=0;}if(lastTrigger instanceof HTMLElement)lastTrigger.classList.remove('modal-trigger-cooldown');};
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
    if(lastTrigger instanceof HTMLElement){
      lastTrigger.blur();
      lastTrigger.classList.add('modal-trigger-cooldown');
    }
    if(suppressTimer){window.clearTimeout(suppressTimer);suppressTimer=0;}
    window.setTimeout(()=>{
      document.body.classList.remove('booking-hover-suppress');
      suppressTimer=0;
    },300);
    lastTrigger=null;
  };
  const open=(trigger,value)=>{lastTrigger=trigger instanceof HTMLElement?trigger:null;clearHoverSuppression();if(cardName)cardName.textContent=value||'Выбранный автомобиль';modal.hidden=false;document.body.classList.add('booking-modal-open');validate(false);window.setTimeout(()=>name?.focus(),0);};
  document.querySelectorAll('[data-booking-open]').forEach(btn=>btn.addEventListener('click',()=>open(btn,btn.dataset.bookingCar||'Выбранный автомобиль')));
  modal.querySelectorAll('[data-booking-close]').forEach(n=>n.addEventListener('click',close));
  form?.addEventListener('input',()=>validate(false)); form?.addEventListener('change',()=>validate(false));
  document.querySelectorAll('[data-callback-open]').forEach(btn=>btn.addEventListener('pointerleave',()=>btn.classList.remove('modal-trigger-cooldown')));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)close();else if(event.key!=='Escape')clearHoverSuppression();});
  form?.addEventListener('submit',e=>{e.preventDefault();if(!validate(true))return;if(status){status.hidden=false;status.textContent='Форма проверена. Подключение отправки заявки добавим на следующем этапе.';}});
})();

// Same-page anchors: consistent smooth scrolling, including desktop and mobile navigation.
(() => {
  document.querySelectorAll('.text-link[href="#partners"]').forEach(link=>{
    link.addEventListener('click',()=>link.classList.add('is-standard'));
  });
})();

(() => {
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    const href=link.getAttribute('href')||'';
    if(!href || href==='#' || href==='#callbackModal' || href==='#bookingModal' || href==='#questionModal') return;
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
  const cards=[...track.querySelectorAll('.inventory-card')]; const prev=document.querySelector('[data-inventory-prev]'); const next=document.querySelector('[data-inventory-next]'); const count=document.querySelector('.inventory-carousel-count');
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


// Reviews carousel: same mobile interaction model as the Hero/inventory cards.
(() => {
  const track=document.getElementById('reviewCardsTrack');
  if(!track) return;
  const cards=[...track.querySelectorAll('.review-card--generated')];
  const prev=document.querySelector('[data-review-dir="prev"]');
  const next=document.querySelector('[data-review-dir="next"]');
  const count=document.querySelector('.review-carousel-count');
  if(!cards.length) return;
  const mobile=window.matchMedia('(max-width:768px)');
  let active=0, raf=0, busy=false, equalizeRaf=0;
  const equalizeReviewText=()=>{
    const texts=cards.map(card=>card.querySelector('.review-card-text')).filter(Boolean);
    if(!texts.length) return;
    texts.forEach(text=>{ text.style.height='auto'; });
    const maxHeight=Math.max(...texts.map(text=>text.scrollHeight));
    texts.forEach(text=>{ text.style.height=`${maxHeight}px`; });
  };
  const scheduleEqualize=()=>{
    cancelAnimationFrame(equalizeRaf);
    equalizeRaf=requestAnimationFrame(equalizeReviewText);
  };
  const render=()=>{
    if(count) count.textContent=`${active+1} / ${cards.length}`;
    if(prev) prev.disabled=active===0;
    if(next) next.disabled=active===cards.length-1;
  };
  const nearest=()=>{
    const center=track.getBoundingClientRect().left+track.clientWidth/2;
    let ix=0,dist=Infinity;
    cards.forEach((card,i)=>{
      const r=card.getBoundingClientRect();
      const d=Math.abs(r.left+r.width/2-center);
      if(d<dist){dist=d;ix=i;}
    });
    return ix;
  };
  const go=ix=>{
    active=Math.max(0,Math.min(cards.length-1,ix));
    render();
    if(!mobile.matches) return;
    busy=true;
    const card=cards[active];
    track.scrollTo({left:card.offsetLeft-track.offsetLeft,behavior:'smooth'});
    window.setTimeout(()=>busy=false,420);
  };
  prev?.addEventListener('click',()=>go(active-1));
  next?.addEventListener('click',()=>go(active+1));
  track.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      e.preventDefault();
      go(active+(e.key==='ArrowRight'?1:-1));
    }
  });
  track.addEventListener('scroll',()=>{
    if(busy||!mobile.matches) return;
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{active=nearest();render();});
  },{passive:true});
  const relayout=()=>{
    busy=false;
    equalizeReviewText();
    if(mobile.matches) go(active);
    else {active=0;track.scrollLeft=0;render();}
  };
  mobile.addEventListener?.('change',relayout);
  window.addEventListener('resize',()=>{ relayout(); scheduleEqualize(); },{passive:true});
  window.addEventListener('load',scheduleEqualize,{once:true});
  document.fonts?.ready?.then(scheduleEqualize).catch(()=>{});
  render();
  equalizeReviewText();
  go(0);
})();

// Question modal — automobile sourcing request with three directions: Europe, South Korea, China.
(() => {
  const modal=document.getElementById('questionModal'); if(!modal) return;
  const form=document.getElementById('questionForm');
  const status=document.getElementById('questionStatus');
  const name=form?.querySelector('[name="name"]');
  const phone=form?.querySelector('[name="phone"]');
  const phoneCountry=form?.querySelector('[name="phoneCountry"]');
  const destination=form?.querySelector('[name="destination"]');
  const budget=form?.querySelector('[name="budget"]');
  const purchaseTiming=form?.querySelector('[name="purchaseTiming"]');
  const consent=form?.querySelector('[name="consent"]');
  const submit=form?.querySelector('.question-submit');
  const phoneValid=window.CarLifePhoneMask?.setup(phoneCountry,phone) || (()=>false);
  let lastTrigger=null;
  const validate=showMessage=>{
    const nameOk=!!name?.value.trim();
    const phoneOk=phoneValid();
    const destinationOk=!!destination?.value;
    const budgetOk=!!budget?.value.trim();
    const timingOk=!!purchaseTiming?.value;
    const consentOk=!!consent?.checked;
    if(name) name.setCustomValidity(nameOk?'':'Пожалуйста, укажите имя.');
    if(phone) phone.setCustomValidity(phoneOk?'':'Пожалуйста, укажите корректный номер телефона.');
    if(destination) destination.setCustomValidity(destinationOk?'':'Выберите направление.');
    if(budget) budget.setCustomValidity(budgetOk?'':'Укажите предполагаемый бюджет.');
    if(purchaseTiming) purchaseTiming.setCustomValidity(timingOk?'':'Выберите срок покупки.');
    if(consent) consent.setCustomValidity(consentOk?'':'Необходимо подтвердить согласие на обработку персональных данных.');
    const ok=nameOk&&phoneOk&&destinationOk&&budgetOk&&timingOk&&consentOk;
    if(submit) submit.disabled=!ok;
    if(status){status.hidden=!showMessage||ok;status.textContent=showMessage&&!ok?'Заполните обязательные поля и подтвердите согласие.':'';}
    return ok;
  };
  const close=()=>{
    const active=document.activeElement;if(active instanceof HTMLElement)active.blur();
    modal.hidden=true;document.body.classList.remove('question-modal-open');
    status&&(status.hidden=true,status.textContent='');
    form?.reset();
    phoneCountry&&(phoneCountry.value='by');
    phone&&window.CarLifePhoneMask?.setup(phoneCountry,phone);
    validate(false);
    if(lastTrigger instanceof HTMLElement)lastTrigger.blur();
    lastTrigger=null;
  };
  const open=trigger=>{
    lastTrigger=trigger instanceof HTMLElement?trigger:null;
    modal.hidden=false;document.body.classList.add('question-modal-open');validate(false);
    window.setTimeout(()=>name?.focus(),0);
  };
  document.querySelectorAll('[data-question-open]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();open(btn);}));
  modal.querySelectorAll('[data-question-close]').forEach(n=>n.addEventListener('click',close));
  form?.addEventListener('input',()=>validate(false));
  form?.addEventListener('change',()=>validate(false));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)close();});
  form?.addEventListener('submit',e=>{
    e.preventDefault();
    if(!validate(true)) return;
    if(status){status.hidden=false;status.textContent='Форма проверена. Подключение отправки заявки добавим на следующем этапе.';}
  });
})();


// Finance calculator: informational annuity model, no external calculation service.
(() => {
  const form=document.getElementById('financeCalculator');
  if(!form) return;
  const type=form.querySelector('#financeType');
  const price=form.querySelector('#financePrice');
  const down=form.querySelector('#financeDown');
  const term=form.querySelector('#financeTerm');
  const rate=form.querySelector('#financeRate');
  const monthly=document.getElementById('financeMonthly');
  const principalOut=document.getElementById('financePrincipal');
  const totalOut=document.getElementById('financeTotal');
  const overpayOut=document.getElementById('financeOverpay');
  const defaults={credit:18,leasing:17};
  const fmt=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.max(0,n));
  const calc=()=>{
    const p=Math.max(0,Number(price?.value)||0);
    const d=Math.min(90,Math.max(0,Number(down?.value)||0));
    const n=Math.max(1,Number(term?.value)||36);
    const annual=Math.max(0.01,Number(rate?.value)||18);
    const principal=p*(1-d/100);
    const r=annual/100/12;
    const payment=r>0 ? principal*r/(1-Math.pow(1+r,-n)) : principal/n;
    const total=payment*n;
    const overpay=Math.max(0,total-principal);
    if(monthly) monthly.textContent=`${fmt(payment)} BYN / мес.`;
    if(principalOut) principalOut.textContent=`${fmt(principal)} BYN`;
    if(totalOut) totalOut.textContent=`${fmt(total)} BYN`;
    if(overpayOut) overpayOut.textContent=`${fmt(overpay)} BYN`;
  };
  const normalizeDown=()=>{
    if(!down) return;
    const value=Number(down.value);
    if(Number.isFinite(value)){
      const normalized=Math.min(90,Math.max(0,value));
      down.value=String(normalized);
    }
  };
  type?.addEventListener('change',()=>{ if(rate) rate.value=defaults[type.value]||18; calc(); });
  down?.addEventListener('input',()=>{ normalizeDown(); calc(); });
  down?.addEventListener('change',()=>{ normalizeDown(); calc(); });
  [price,term,rate].forEach(el=>el?.addEventListener('input',calc));
  normalizeDown();
  calc();
})();


// Report purchase demo: local-only mock checkout; no card data is transmitted or stored.
(() => {
  const modal=document.getElementById('reportModal');
  if(!modal) return;
  const paymentStep=document.getElementById('reportPaymentStep');
  const successStep=document.getElementById('reportSuccessStep');
  const form=document.getElementById('reportPaymentForm');
  const status=document.getElementById('reportPaymentStatus');
  const carOut=document.getElementById('reportModalCar');
  const successCar=document.getElementById('reportSuccessCar');
  const card=form?.querySelector('[name="reportCard"]');
  const expiry=form?.querySelector('[name="reportExpiry"]');
  const cvc=form?.querySelector('[name="reportCvc"]');
  const name=form?.querySelector('[name="reportName"]');
  const phone=form?.querySelector('[name="reportPhone"]');
  const phoneCountry=form?.querySelector('[name="reportPhoneCountry"]');
  const consent=form?.querySelector('[name="reportConsent"]');
  const submit=form?.querySelector('.booking-submit');
  const phoneValid=window.CarLifePhoneMask?.setup(phoneCountry,phone) || (()=>false);
  let lastCar='Выбранный автомобиль';

  const onlyDigits=value=>(value||'').replace(/\D/g,'');
  const validCard=value=>onlyDigits(value).length===16;
  const validExpiry=value=>/^(0[1-9]|1[0-2])\/\d{2}$/.test(value||'');
  const validCvc=value=>/^\d{3,4}$/.test(value||'');
  const validate=show=>{
    const okName=!!name?.value.trim();
    const okPhone=phoneValid();
    const okCard=validCard(card?.value);
    const okExpiry=validExpiry(expiry?.value);
    const okCvc=validCvc(cvc?.value);
    const okConsent=!!consent?.checked;
    if(name) name.setCustomValidity(okName?'':'Пожалуйста, укажите имя.');
    if(phone) phone.setCustomValidity(okPhone?'':'Пожалуйста, укажите корректный номер телефона.');
    if(card) card.setCustomValidity(okCard?'':'Введите 16 цифр карты.');
    if(expiry) expiry.setCustomValidity(okExpiry?'':'Укажите срок в формате MM/YY.');
    if(cvc) cvc.setCustomValidity(okCvc?'':'Укажите CVC.');
    if(consent) consent.setCustomValidity(okConsent?'':'Необходимо подтвердить согласие.');
    const ok=okName&&okPhone&&okCard&&okExpiry&&okCvc&&okConsent;
    if(submit) submit.disabled=!ok;
    if(status){status.hidden=!show||ok;status.textContent=show&&!ok?'Проверьте обязательные поля и данные карты.':'';}
    return ok;
  };
  const reset=()=>{
    paymentStep.hidden=false; successStep.hidden=true; status.hidden=true; status.textContent=''; form?.reset();
    if(phoneCountry){phoneCountry.value='by';} if(phone&&window.CarLifePhoneMask) window.CarLifePhoneMask.setup(phoneCountry,phone);
    if(submit) submit.disabled=true;
  };
  let lastTrigger=null; let suppressTimer=0;
  const clearReportHoverSuppression=()=>{
    document.body.classList.remove('report-hover-suppress');
    if(suppressTimer){window.clearTimeout(suppressTimer);suppressTimer=0;}
    if(lastTrigger instanceof HTMLElement) lastTrigger.classList.remove('modal-trigger-cooldown');
  };
  const open=trigger=>{
    clearReportHoverSuppression();
    lastTrigger=trigger instanceof HTMLElement?trigger:null;
    lastCar=trigger?.dataset?.reportCar||'Выбранный автомобиль';
    if(carOut) carOut.textContent=lastCar;
    if(successCar) successCar.textContent=lastCar;
    reset(); modal.hidden=false; document.body.classList.add('report-modal-open');
    window.setTimeout(()=>name?.focus(),0);
  };
  const close=()=>{
    const active=document.activeElement;
    if(active instanceof HTMLElement) active.blur();
    modal.hidden=true;
    document.body.classList.remove('report-modal-open');
    reset();
    document.body.classList.add('report-hover-suppress');
    if(lastTrigger instanceof HTMLElement){
      lastTrigger.blur();
      lastTrigger.classList.add('modal-trigger-cooldown');
    }
    if(suppressTimer){window.clearTimeout(suppressTimer);suppressTimer=0;}
  };
  document.querySelectorAll('[data-report-open]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();open(btn);}));
  modal.querySelectorAll('[data-report-close]').forEach(btn=>btn.addEventListener('click',close));
  [name,phone,card,expiry,cvc].forEach(el=>el?.addEventListener('input',()=>{
    if(el===card){const d=onlyDigits(card.value).slice(0,16);card.value=d.replace(/(.{4})/g,'$1 ').trim();}
    if(el===expiry){const d=onlyDigits(expiry.value).slice(0,4);expiry.value=d.length>2?`${d.slice(0,2)}/${d.slice(2)}`:d;}
    if(el===cvc){cvc.value=onlyDigits(cvc.value).slice(0,4);}
    validate(false);
  }));
  phoneCountry?.addEventListener('change',()=>{phone.value='';window.CarLifePhoneMask?.setup(phoneCountry,phone);validate(false);});
  consent?.addEventListener('change',()=>validate(false));
  form?.addEventListener('submit',e=>{
    e.preventDefault(); if(!validate(true)) return;
    if(status){status.hidden=false;status.textContent='Проверяем оплату…';}
    if(submit) submit.disabled=true;
    window.setTimeout(()=>{
      const match=(lastCar.match(/·\s*(\d{4})\s*·/)||[])[1]||'—';
      const mileageMap={'ВАЗ 2106':'120 000 км','ВАЗ 2107':'98 000 км','ГАЗ 24 «Волга»':'76 000 км','Москвич 412':'64 000 км','УАЗ 469':'110 000 км','ЗАЗ 968М':'52 000 км'};
      const model=Object.keys(mileageMap).find(k=>lastCar.startsWith(k))||'';
      const mileage=mileageMap[model]||'—';
      document.getElementById('reportYear').textContent=match;
      document.getElementById('reportMileage').textContent=mileage;
      document.getElementById('reportVin').textContent='ДЕМО-'+Math.random().toString(36).slice(2,15).toUpperCase();
      successCar&&(successCar.textContent=lastCar);
      paymentStep.hidden=true; successStep.hidden=false;
      document.querySelector('#reportViewSheet')?.focus?.();
    },650);
  });
  document.querySelectorAll('[data-report-open]').forEach(btn=>btn.addEventListener('pointerleave',()=>{
    if(document.body.classList.contains('report-hover-suppress')) clearReportHoverSuppression();
  }));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
  modal.addEventListener('contextmenu',e=>{if(successStep && !successStep.hidden)e.preventDefault();});
})();
