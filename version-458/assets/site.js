(function () {
  var button = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (button && menu) {
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function playHero() {
    if (timer) {
      clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      playHero();
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      playHero();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')));
      playHero();
    });
  });
  playHero();

  var search = document.querySelector('[data-card-search]');
  var year = document.querySelector('[data-year-filter]');
  var genre = document.querySelector('[data-genre-filter]');
  var clear = document.querySelector('[data-clear-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilter() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var y = year ? year.value : '';
    var g = genre ? genre.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var matchedText = !q || text.indexOf(q) !== -1;
      var matchedYear = !y || card.getAttribute('data-year') === y;
      var matchedGenre = !g || text.indexOf(g) !== -1;
      card.classList.toggle('is-filtered', !(matchedText && matchedYear && matchedGenre));
    });
  }

  if (search) {
    search.addEventListener('input', applyFilter);
  }
  if (year) {
    year.addEventListener('change', applyFilter);
  }
  if (genre) {
    genre.addEventListener('change', applyFilter);
  }
  if (clear) {
    clear.addEventListener('click', function () {
      if (search) {
        search.value = '';
      }
      if (year) {
        year.value = '';
      }
      if (genre) {
        genre.value = '';
      }
      applyFilter();
    });
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var cover = document.querySelector('.play-cover');
  var started = false;
  if (!video || !streamUrl) {
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  function startPlay() {
    started = true;
    hideCover();
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlay);
  }
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      startPlay();
    }
  });
  video.addEventListener('play', hideCover);
}
