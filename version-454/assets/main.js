(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", String(open));
            });
        }

        setupHero();
        setupCategoryFilters();
        renderSearchResults();
    });

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupCategoryFilters() {
        var panel = document.querySelector(".filter-panel");
        if (!panel) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
        var search = panel.querySelector(".local-search");
        var year = "all";
        var type = "all";

        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var matchesYear = year === "all" || card.getAttribute("data-year") === year;
                var matchesType = type === "all" || card.getAttribute("data-type") === type;
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = matchesYear && matchesType && matchesKeyword ? "" : "none";
            });
        }

        panel.addEventListener("click", function (event) {
            var button = event.target.closest("button");
            if (!button) {
                return;
            }
            if (button.hasAttribute("data-filter-year")) {
                year = button.getAttribute("data-filter-year");
                panel.querySelectorAll("[data-filter-year]").forEach(function (node) {
                    node.classList.toggle("is-active", node === button);
                });
            }
            if (button.hasAttribute("data-filter-type")) {
                type = button.getAttribute("data-filter-type");
                panel.querySelectorAll("[data-filter-type]").forEach(function (node) {
                    node.classList.toggle("is-active", node === button);
                });
            }
            apply();
        });

        if (search) {
            search.addEventListener("input", apply);
        }
    }

    function renderSearchResults() {
        var container = document.getElementById("search-results");
        if (!container || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        var title = document.getElementById("search-title");
        var input = document.querySelector(".search-page-form input[name='q']");
        if (input) {
            input.value = q;
        }
        var keyword = q.toLowerCase();
        var list = window.SEARCH_MOVIES.filter(function (item) {
            if (!keyword) {
                return true;
            }
            return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 240);
        if (title) {
            title.textContent = q ? "“" + q + "” 搜索结果" : "全部可检索影片";
        }
        if (!list.length) {
            container.innerHTML = "<p class=\"empty\">没有匹配的影片，请尝试更换关键词。</p>";
            return;
        }
        container.innerHTML = list.map(searchCard).join("");
    }

    function escapeText(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function searchCard(item) {
        var tags = String(item.tags || "").split(/[,，、/|]/).filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeText(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"card-poster\" href=\"" + escapeText(item.url) + "\">",
            "<img src=\"" + escapeText(item.cover) + "\" alt=\"" + escapeText(item.title) + "\" loading=\"lazy\">",
            "<span class=\"score\">" + escapeText(item.score) + "</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<div class=\"card-tags\">" + tags + "</div>",
            "<h3><a href=\"" + escapeText(item.url) + "\">" + escapeText(item.title) + "</a></h3>",
            "<p>" + escapeText(item.oneLine) + "</p>",
            "<div class=\"card-meta\"><span>" + escapeText(item.year) + "</span><span>" + escapeText(item.region) + "</span><span>" + escapeText(item.type) + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }
})();

function setupVideoPlayer(videoId, maskId, streamUrl) {
    var video = document.getElementById(videoId);
    var mask = document.getElementById(maskId);
    if (!video || !mask || !streamUrl) {
        return;
    }
    var hlsInstance = null;

    function attach() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.src !== streamUrl) {
                video.src = streamUrl;
            }
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            }
            return Promise.resolve();
        }
        video.src = streamUrl;
        return Promise.resolve();
    }

    function play() {
        attach().then(function () {
            mask.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    mask.classList.remove("is-hidden");
                });
            }
        });
    }

    mask.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        mask.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            mask.classList.remove("is-hidden");
        }
    });
}
