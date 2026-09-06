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
  // Keep screenshots ordered 1 → n, then move the viewport back toward 1.
  const direction = -1;
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
