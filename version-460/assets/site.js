(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initHeader() {
    var header = qs("[data-header]");
    var button = qs("[data-menu-button]");
    var panel = qs("[data-mobile-panel]");

    function onScroll() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (button && panel && header) {
      button.addEventListener("click", function () {
        var isOpen = panel.classList.toggle("is-open");
        header.classList.toggle("is-open", isOpen);
        document.body.classList.toggle("menu-open", isOpen);
        button.textContent = isOpen ? "×" : "☰";
      });
    }
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest(".section") || document;
      var grid = qs("[data-movie-grid]", section);
      if (!grid) {
        return;
      }

      var cards = qsa(".movie-card", grid);
      var keywordInput = qs("[data-filter-keyword]", panel);
      var regionInput = qs("[data-filter-region]", panel);
      var yearInput = qs("[data-filter-year]", panel);
      var categoryInput = qs("[data-filter-category]", panel);
      var count = qs("[data-filter-count]", panel);
      var reset = qs("[data-filter-reset]", panel);
      var urlParams = new URLSearchParams(window.location.search);
      var query = urlParams.get("q") || "";

      if (keywordInput && query) {
        keywordInput.value = query;
      }

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionInput && regionInput.value);
        var year = normalize(yearInput && yearInput.value);
        var category = normalize(categoryInput && categoryInput.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-keywords"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion.indexOf(region) === -1 && text.indexOf(region) === -1) {
            matched = false;
          }
          if (year && cardYear.indexOf(year) === -1) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " / " + cards.length + " 部影片";
        }
      }

      [keywordInput, regionInput, yearInput, categoryInput].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          [keywordInput, regionInput, yearInput].forEach(function (input) {
            if (input) {
              input.value = "";
            }
          });
          if (categoryInput) {
            categoryInput.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  function getHlsClass() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (typeof window.importShim === "function") {
      return Promise.resolve(null);
    }

    try {
      return import("./video-vendor-dru42stk.js")
        .then(function (module) {
          return module.H || module.default || null;
        })
        .catch(function () {
          return null;
        });
    } catch (error) {
      return Promise.resolve(null);
    }
  }

  function initPlayers() {
    var players = qsa("[data-player]");
    if (!players.length) {
      return;
    }

    getHlsClass().then(function (HlsClass) {
      players.forEach(function (player) {
        var video = qs("video", player);
        var toggle = qs("[data-player-toggle]", player);
        var status = qs("[data-player-status]", player);
        var source = player.getAttribute("data-src");
        var hls = null;
        var loaded = false;

        if (!video || !source) {
          return;
        }

        function setStatus(message) {
          if (status) {
            status.textContent = message;
          }
        }

        function loadSource() {
          if (loaded) {
            return Promise.resolve();
          }
          loaded = true;
          setStatus("正在加载高清播放源...");

          if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
            hls = new HlsClass({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(HlsClass.Events.MANIFEST_PARSED, function () {
              setStatus("播放源加载完成");
            });
            hls.on(HlsClass.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus("播放源异常，正在尝试恢复");
                if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
                  hls.startLoad();
                } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
                  hls.recoverMediaError();
                } else {
                  hls.destroy();
                }
              }
            });
            return Promise.resolve();
          }

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            setStatus("浏览器原生播放源已就绪");
            return Promise.resolve();
          }

          setStatus("当前浏览器不支持 HLS 播放，请更换现代浏览器访问");
          return Promise.resolve();
        }

        function playVideo() {
          loadSource().then(function () {
            var promise = video.paused ? video.play() : Promise.resolve(video.pause());
            if (promise && promise.catch) {
              promise.catch(function () {
                setStatus("请再次点击播放器或检查浏览器自动播放设置");
              });
            }
          });
        }

        if (toggle) {
          toggle.addEventListener("click", playVideo);
        }

        video.addEventListener("play", function () {
          player.classList.add("is-playing");
          setStatus("正在播放");
        });

        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
          setStatus("已暂停");
        });

        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });

        window.addEventListener("beforeunload", function () {
          if (hls && hls.destroy) {
            hls.destroy();
          }
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHero();
    initFilters();
    initPlayers();
  });
})();
