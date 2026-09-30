document.querySelectorAll('[data-year]').forEach((node)=>{node.textContent=new Date().getFullYear();});

document.querySelectorAll('[data-carousel]').forEach((rail) => {
  const track = rail.querySelector('.screenshot-track');
  const originals = [...track.children];
  if (!track || originals.length < 2) return;

  const cloneSet = () => originals.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.alt = '';
    track.appendChild(clone);
  });
  cloneSet();
  cloneSet();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const direction = 1;
  let setWidth = 0;
  let resumeAt = 0;
  let previousTime = 0;

  const measure = () => {
    setWidth = track.scrollWidth / 3;
    if (rail.scrollLeft < setWidth * .5 || rail.scrollLeft > setWidth * 2.5) {
      rail.scrollLeft = setWidth;
    }
  };
  const pause = () => {
    resumeAt = performance.now() + 3500;
    rail.classList.add('is-paused');
  };
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach((eventName) => {
    rail.addEventListener(eventName, pause, { passive: true });
  });
  rail.addEventListener('pointerup', pause, { passive: true });

  const animate = (time) => {
    if (!previousTime) previousTime = time;
    const elapsed = Math.min(time - previousTime, 50);
    previousTime = time;
    if (!reduceMotion.matches && !document.hidden && time >= resumeAt && setWidth) {
      rail.classList.remove('is-paused');
      rail.scrollLeft += direction * elapsed * .052;
      if (rail.scrollLeft >= setWidth * 2) rail.scrollLeft -= setWidth;
      if (rail.scrollLeft <= 0) rail.scrollLeft += setWidth;
    }
    requestAnimationFrame(animate);
  };

  // Every image has intrinsic dimensions, so the track can be measured before
  // lazy images load. Waiting for decode() here would stall autoplay off-screen.
  measure();
  requestAnimationFrame(measure);
  window.addEventListener('load', measure, { once: true });
  window.addEventListener('resize', measure, { passive: true });
  requestAnimationFrame(animate);
});

// ---- Header, menu overlay and scroll reveals (Handsome Frank-style motion) ----
document.documentElement.classList.add('js');
(()=>{
  const header=document.querySelector('.site-header');
  const toggle=document.querySelector('[data-nav-toggle]');
  const nav=document.querySelector('.site-header nav');
  if(header){
    const dark=[...document.querySelectorAll('.hero, footer')];
    const update=()=>{const y=40;const over=dark.some(el=>{const r=el.getBoundingClientRect();return r.top<=y&&r.bottom>=y;});header.classList.toggle('on-light',!over);};
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  }
  if(toggle&&nav){
    const set=open=>{nav.classList.toggle('open',open);header.classList.toggle('nav-open',open);document.body.classList.toggle('nav-locked',open);toggle.setAttribute('aria-expanded',String(open));};
    toggle.addEventListener('click',()=>set(!nav.classList.contains('open')));
    nav.addEventListener('click',e=>{if(e.target.closest('a'))set(false);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});
  }
  const targets=document.querySelectorAll('.section:not(.screenshot-showcase) > *, .screens-intro, .screenshot-group, .grid article, .showcase > *, .faq-list details');
  targets.forEach(el=>{el.setAttribute('data-reveal','');const i=[...el.parentElement.children].indexOf(el);el.style.setProperty('--d',Math.min(i,3)*0.08+'s');});
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:0,rootMargin:'0px 0px -4% 0px'});
    targets.forEach(el=>io.observe(el));
  }else targets.forEach(el=>el.classList.add('in'));
})();
