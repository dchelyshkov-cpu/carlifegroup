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
  const closeMenu = () => {
    if (!menu || !menuToggle) return;
    menu.classList.remove('open');
    menuBackdrop?.classList.remove('open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Открыть меню');
    menu?.setAttribute('aria-hidden','true');
    unlockScroll();
  };
  const openMenu = () => {
    if (!menu || !menuToggle) return;
    lockScroll();
    menu.classList.add('open');
    menuBackdrop?.classList.add('open');
    menuToggle.setAttribute('aria-expanded','true');
    menuToggle.setAttribute('aria-label','Закрыть меню');
    menu.setAttribute('aria-hidden','false');
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
  document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });

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
})();

// Hero carousel: single source of truth; only enabled on the narrow layout.
(() => {
  const track = document.getElementById('heroCarsTrack');
  if (!track) return;
  const cards = [...track.querySelectorAll('.hero-car-card')];
  const dots = [...document.querySelectorAll('.hero-carousel-pagination button')];
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
    cards.forEach((card, i) => card.classList.toggle('is-active', i === activeIndex));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
      if (i === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
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
  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
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
