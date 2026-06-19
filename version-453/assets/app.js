import { H as Hls } from "./hls-vendor.js";

const videoSources = [
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8"
];

function setupMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function setupHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, currentIndex) => {
      slide.classList.toggle("is-active", currentIndex === activeIndex);
    });
    dots.forEach((dot, currentIndex) => {
      dot.classList.toggle("is-active", currentIndex === activeIndex);
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.heroDot || 0);
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5200);
  }
}

function setupFilters() {
  const form = document.querySelector("[data-filter-form]");
  const cards = Array.from(document.querySelectorAll("[data-title]"));
  const count = document.querySelector("[data-result-count]");
  if (!form || cards.length === 0) {
    return;
  }

  function applyFilters() {
    const query = (form.querySelector("[name='q']")?.value || "").trim().toLowerCase();
    const year = form.querySelector("[name='year']")?.value || "";
    const region = form.querySelector("[name='region']")?.value || "";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.textContent
      ].join(" ").toLowerCase();
      const matchedQuery = !query || haystack.includes(query);
      const matchedYear = !year || card.dataset.year === year;
      const matchedRegion = !region || card.dataset.region === region;
      const matched = matchedQuery && matchedYear && matchedRegion;
      card.classList.toggle("hidden-by-filter", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  form.addEventListener("input", applyFilters);
  form.addEventListener("change", applyFilters);
  applyFilters();
}

function setupSearchPage() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  const input = document.querySelector("[data-search-input]");
  if (query && input) {
    input.value = query;
    const event = new Event("input", { bubbles: true });
    window.setTimeout(() => input.dispatchEvent(event), 0);
  }
}

function setupPlayer() {
  const shells = Array.from(document.querySelectorAll("[data-video-url]"));
  shells.forEach((shell) => {
    const video = shell.querySelector("video");
    const button = shell.querySelector("[data-play-button]");
    const source = shell.dataset.videoUrl || videoSources[0];
    let mounted = false;

    function mountVideo() {
      if (!video || mounted) {
        return;
      }
      mounted = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      mountVideo();
      shell.classList.add("is-playing");
      video.play().catch(() => {
        shell.classList.remove("is-playing");
      });
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    if (video) {
      video.addEventListener("play", () => shell.classList.add("is-playing"));
      video.addEventListener("pause", () => shell.classList.remove("is-playing"));
    }
  });
}

setupMobileMenu();
setupHeroSlider();
setupFilters();
setupSearchPage();
setupPlayer();
