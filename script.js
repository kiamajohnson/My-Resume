document.querySelectorAll('.carousel').forEach(function (carousel) {
  var track = carousel.querySelector('.track');
  var slides = carousel.querySelectorAll('.slide');
  var interval = parseInt(carousel.dataset.interval, 10) || 2000;
  var index = 0, timer = null, hovering = false, visible = true;
  var startX = 0, startY = 0, dx = 0, dragging = false, axis = null;

  // Dots
  var dots = document.createElement('div');
  dots.className = 'dots';
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show slide ' + (i + 1));
    b.addEventListener('click', function () { goTo(i); restart(); });
    dots.appendChild(b);
  });
  carousel.appendChild(dots);

  // Arrows
  function makeArrow(cls, label, symbol, step) {
    var a = document.createElement('button');
    a.type = 'button';
    a.className = 'arrow ' + cls;
    a.setAttribute('aria-label', label);
    a.textContent = symbol;
    a.addEventListener('click', function () { goTo(index + step); restart(); });
    carousel.appendChild(a);
  }
  makeArrow('prev', 'Previous slide', '\u2039', -1);
  makeArrow('next', 'Next slide', '\u203A', 1);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.querySelectorAll('button').forEach(function (b, n) {
      b.classList.toggle('active', n === index);
    });
  }

  // Autoplay
  function start() {
    stop();
    if (!hovering && visible && !dragging && !document.hidden) {
      timer = setInterval(function () { goTo(index + 1); }, interval);
    }
  }
  function stop() { clearInterval(timer); timer = null; }
  function restart() { start(); }

  // Pause on mouse hover only (touch screens never "leave", so they are excluded)
  carousel.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; stop(); } });
  carousel.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; start(); } });

  // Only advance while the carousel is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      start();
    }, { threshold: 0.3 }).observe(carousel);
  }
  document.addEventListener('visibilitychange', start);

  // Swipe / drag
  carousel.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.arrow, .dots')) return;
    dragging = true; axis = null; dx = 0;
    startX = e.clientX; startY = e.clientY;
    stop();
  });
  carousel.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (axis === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis === 'x') {
        track.classList.add('dragging');
        try { carousel.setPointerCapture(e.pointerId); } catch (err) {}
      }
    }
    if (axis === 'x') {
      track.style.transform = 'translateX(calc(-' + index * 100 + '% + ' + dx + 'px))';
    }
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    if (axis === 'x' && Math.abs(dx) > carousel.offsetWidth * 0.15) {
      goTo(index + (dx < 0 ? 1 : -1));
    } else {
      goTo(index);
    }
    axis = null;
    start();
  }
  carousel.addEventListener('pointerup', endDrag);
  carousel.addEventListener('pointercancel', endDrag);

  // Keyboard arrows
  carousel.tabIndex = 0;
  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { goTo(index - 1); restart(); }
    if (e.key === 'ArrowRight') { goTo(index + 1); restart(); }
  });

  goTo(0);
  start();
});
