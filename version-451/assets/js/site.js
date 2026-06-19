(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobileMenu = document.getElementById("mobile-menu");

    if (mobileButton && mobileMenu) {
        mobileButton.addEventListener("click", function () {
            var isOpen = mobileMenu.classList.toggle("is-open");
            mobileButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(heroTimer);
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            startHero();
        });
    });

    startHero();

    var globalSearch = document.getElementById("global-search");
    var searchResults = document.getElementById("global-search-results");
    var searchIndex = window.MovieSearchIndex || [];

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function closeSearchResults() {
        if (searchResults) {
            searchResults.classList.remove("is-open");
            searchResults.innerHTML = "";
        }
    }

    if (globalSearch && searchResults) {
        globalSearch.addEventListener("input", function () {
            var query = normalize(globalSearch.value);
            if (!query) {
                closeSearchResults();
                return;
            }
            var matches = searchIndex.filter(function (movie) {
                return normalize(movie.title + " " + movie.category + " " + movie.year + " " + movie.type).indexOf(query) !== -1;
            }).slice(0, 10);

            if (!matches.length) {
                closeSearchResults();
                return;
            }

            searchResults.innerHTML = matches.map(function (movie) {
                return "<a class="search-result-item" href="" + movie.href + ""><img src="" + movie.image + "" alt="" + movie.title.replace(/"/g, "&quot;") + ""><div><strong>" + movie.title + "</strong><span>" + movie.category + " · " + movie.year + " · " + movie.type + "</span></div></a>";
            }).join("");
            searchResults.classList.add("is-open");
        });

        document.addEventListener("click", function (event) {
            if (!globalSearch.contains(event.target) && !searchResults.contains(event.target)) {
                closeSearchResults();
            }
        });
    }

    var pageFilter = document.querySelector(".page-filter");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var activeFilter = "all";

    function filterCards() {
        var query = pageFilter ? normalize(pageFilter.value) : "";
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search-text"));
            var buttonMatch = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
            var queryMatch = !query || text.indexOf(query) !== -1;
            card.classList.toggle("is-hidden", !(buttonMatch && queryMatch));
        });
    }

    if (pageFilter) {
        pageFilter.addEventListener("input", filterCards);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter-button") || "all";
            filterButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            filterCards();
        });
    });
})();

function attachMoviePlayer(playerId, streamUrl) {
    var shell = document.getElementById(playerId);
    if (!shell) {
        return;
    }

    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var hlsInstance = null;
    var prepared = false;

    function playVideo() {
        if (!video || !streamUrl) {
            return;
        }

        if (!prepared) {
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = streamUrl;
                video.play().catch(function () {});
            }
        } else {
            video.play().catch(function () {});
        }

        if (cover) {
            cover.classList.add("is-hidden");
        }
    }

    if (cover) {
        cover.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
