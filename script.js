(()=>{
  const menu=document.querySelector('.menu-toggle');
  const panel=document.querySelector('.mobile-menu');
  const modal=document.querySelector('.car-modal');
  const modalImage=modal?.querySelector('.modal-image');
  const modalStatus=modal?.querySelector('.modal-status');
  const modalKicker=document.querySelector('#modal-kicker');
  const modalTitle=document.querySelector('#modal-title');
  const modalPrice=document.querySelector('#modal-price');
  const modalCurrency=document.querySelector('#modal-currency');
  const modalSpecs=document.querySelector('#modal-specs');
  const modalHistory=document.querySelector('#modal-history');
  const modalCheck=document.querySelector('#modal-check');
  const modalOrigin=document.querySelector('#modal-origin');
  const modalState=document.querySelector('#modal-state');
  const cars={
    'bmw-x5':{kicker:'BMW · X5 · G05',title:'xDrive30d M Sport',price:'189 900 BYN',currency:'≈ $58 200 · ≈ €53 400',status:'В наличии',origin:'Европа',image:'https://upload.wikimedia.org/wikipedia/commons/3/35/2020_BMW_X5_G05_xDrive30d_M_Sport%2C_front_right%2C_06-30-2024.jpg',specs:[['Год','2022'],['Пробег','68 400 км'],['Двигатель','Дизель 3.0 · 286 л.с.'],['КПП','8-ст. автомат'],['Привод','xDrive'],['Кузов','SUV']],history:'История заявлена прозрачной',check:'Полная проверка',origin:'Европа',state:'В наличии'},
    'glc':{kicker:'Mercedes-Benz · GLC',title:'300 4MATIC',price:'174 500 BYN',currency:'≈ $53 500 · ≈ €49 100',status:'В наличии',origin:'Европа',image:'https://content.app-sources.com/s/48683017097093202/uploads/Images/Pic-4741839.png?format=webp',specs:[['Год','2021'],['Пробег','73 800 км'],['Двигатель','Бензин 2.0 · 258 л.с.'],['КПП','9G-Tronic'],['Привод','4MATIC'],['Кузов','SUV']],history:'История заявлена прозрачной',check:'Проверен',origin:'Европа',state:'В наличии'},
    'li-l7':{kicker:'Li Auto · L7',title:'Max',price:'от 128 900 BYN',currency:'≈ $39 500 · ≈ €36 200',status:'Под заказ',origin:'Китай',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Li%20Auto%20L7%20002.jpg',specs:[['Год','2025'],['Состояние','Новый'],['Силовая установка','Гибрид 1.5'],['Привод','AWD'],['Места','6'],['Поставка','Под ключ']],history:'Автомобиль под заказ',check:'Проверка перед сделкой',origin:'Китай',state:'Под заказ'}
  };
  const deferredImages=[...document.querySelectorAll('img[data-defer-image]')].filter(img=>img.dataset.src);
  if('IntersectionObserver' in window){
    const imageObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const img=entry.target;
        img.src=img.dataset.src;
        img.removeAttribute('data-defer-image');
        imageObserver.unobserve(img);
      });
    },{rootMargin:'500px 0px'});
    deferredImages.forEach(img=>imageObserver.observe(img));
  }
  const closeMenu=()=>{if(!menu||!panel)return;menu.setAttribute('aria-expanded','false');panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');document.body.classList.remove('menu-lock')};
  if(menu&&panel){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';if(open){menu.setAttribute('aria-expanded','true');panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');document.body.classList.add('menu-lock')}else closeMenu()});panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));}
  function openModal(id){const car=cars[id];if(!modal||!car)return;modalImage.className=`modal-image ${id==='bmw-x5'?'photo-bmw':id==='glc'?'photo-mercedes':'photo-li'}`;modalImage.style.backgroundImage=`url("${car.image}")`;modalStatus.textContent=car.status;modalKicker.textContent=car.kicker;modalTitle.textContent=car.title;modalPrice.textContent=car.price;modalCurrency.textContent=car.currency;modalSpecs.innerHTML=car.specs.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');modalHistory.textContent=car.history;modalCheck.textContent=car.check;modalOrigin.textContent=car.origin;modalState.textContent=car.state;modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-lock');}
  function closeModal(){if(!modal)return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-lock');}
  document.querySelectorAll('[data-car]').forEach(el=>el.addEventListener('click',()=>openModal(el.dataset.car)));
  modal?.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeModal()}});
  document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.classList.add('image-failed'),{once:true}));
  const filterButtons=document.querySelectorAll('[data-filter]');const catalogCards=document.querySelectorAll('.catalog-card');
  filterButtons.forEach(btn=>btn.addEventListener('click',()=>{filterButtons.forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');const filter=btn.dataset.filter;catalogCards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.state!==filter})}));
})();
