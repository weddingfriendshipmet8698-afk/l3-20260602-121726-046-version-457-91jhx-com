const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");

if (menuButton && header) {
  menuButton.addEventListener("click", () => {
    header.classList.toggle("menu-open");
  });
}

const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;
let heroTimer = null;

function setHeroSlide(index) {
  if (!heroSlides.length) {
    return;
  }
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === heroIndex);
  });
  heroDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === heroIndex);
  });
}

function startHeroTimer() {
  if (heroSlides.length < 2) {
    return;
  }
  clearInterval(heroTimer);
  heroTimer = setInterval(() => setHeroSlide(heroIndex + 1), 5200);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    setHeroSlide(index);
    startHeroTimer();
  });
});

setHeroSlide(0);
startHeroTimer();

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function applyFilter(form) {
  const scope = form.closest("main") || document;
  const input = form.querySelector("[data-filter-input]");
  const yearSelect = form.querySelector("[data-year-filter]");
  const list = scope.querySelector("[data-filter-list]");
  const status = scope.querySelector("[data-filter-status]");
  if (!list || !input) {
    return;
  }
  const cards = Array.from(list.querySelectorAll(".movie-card"));
  const keyword = normalizeText(input.value);
  const year = yearSelect ? yearSelect.value : "";
  let visible = 0;
  cards.forEach((card) => {
    const haystack = normalizeText([
      card.dataset.title,
      card.dataset.genre,
      card.dataset.region,
      card.dataset.year,
      card.textContent
    ].join(" "));
    const yearMatch = !year || card.dataset.year === year;
    const textMatch = !keyword || haystack.includes(keyword);
    const show = yearMatch && textMatch;
    card.classList.toggle("is-filter-hidden", !show);
    if (show) {
      visible += 1;
    }
  });
  if (status) {
    status.textContent = keyword || year ? `当前筛选到 ${visible} 部影片` : "";
  }
}

const filterForms = Array.from(document.querySelectorAll("[data-filter-scope]"));
filterForms.forEach((form) => {
  const params = new URLSearchParams(window.location.search);
  const input = form.querySelector("[data-filter-input]");
  const yearSelect = form.querySelector("[data-year-filter]");
  if (input && params.get("q")) {
    input.value = params.get("q");
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilter(form);
  });
  if (input) {
    input.addEventListener("input", () => applyFilter(form));
  }
  if (yearSelect) {
    yearSelect.addEventListener("change", () => applyFilter(form));
  }
  applyFilter(form);
});

async function attachStream(video, stream) {
  if (!stream) {
    return;
  }
  if (stream.includes(".m3u8") && !video.canPlayType("application/vnd.apple.mpegurl")) {
    try {
      const module = await import("./hls-vendor-dru42stk.js");
      const Hls = module.H;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }
    } catch (error) {
      video.dataset.state = "fallback";
    }
  }
  video.src = stream;
}

async function startPlayer(player) {
  const video = player.querySelector("video");
  const layer = player.querySelector(".play-layer");
  const stream = player.dataset.stream;
  if (!video || video.dataset.ready === "1") {
    if (video) {
      video.play().catch(() => {});
    }
    return;
  }
  video.dataset.ready = "1";
  if (layer) {
    layer.classList.add("is-hidden");
  }
  video.controls = true;
  await attachStream(video, stream);
  video.play().catch(() => {});
}

Array.from(document.querySelectorAll(".player")).forEach((player) => {
  const button = player.querySelector("[data-play]");
  if (button) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      startPlayer(player);
    });
  }
  player.addEventListener("click", (event) => {
    if (event.target && event.target.tagName === "VIDEO") {
      return;
    }
    startPlayer(player);
  });
});
