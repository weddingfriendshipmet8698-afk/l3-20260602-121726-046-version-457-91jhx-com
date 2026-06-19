(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-button");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = menu.hasAttribute("hidden");
            if (opened) {
                menu.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
                button.textContent = "×";
            } else {
                menu.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
                button.textContent = "☰";
            }
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector(".card-filter-input");
        var selects = Array.prototype.slice.call(panel.querySelectorAll(".card-filter-select"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
        var empty = document.querySelector(".filter-empty");
        function valueOf(select, key) {
            var active = selects.find(function (item) {
                return item.getAttribute("data-filter") === key;
            });
            return active ? active.value.trim() : "";
        }
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var type = valueOf(null, "type");
            var region = valueOf(null, "region");
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var matched = (!query || text.indexOf(query) !== -1) && (!type || cardType === type) && (!region || cardRegion === region);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
