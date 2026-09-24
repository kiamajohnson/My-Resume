document.querySelectorAll('.carousel').forEach(function (carousel) {
  var track = carousel.querySelector('.track');
  var slides = carousel.querySelectorAll('.slide');
  var interval = parseInt(carousel.dataset.interval, 10) || 2000;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0, timer = null;

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

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.querySelectorAll('button').forEach(function (b, n) {
      b.classList.toggle('active', n === index);
    });
  }
  function start() { if (!reduceMotion) timer = setInterval(function () { goTo(index + 1); }, interval); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', restart);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', restart);

  goTo(0);
  start();
});
