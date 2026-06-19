document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('[data-nav]');
    var toggle = document.querySelector('[data-mobile-toggle]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        var bg = hero.querySelector('[data-hero-bg]');
        var poster = hero.querySelector('[data-hero-poster]');
        var title = hero.querySelector('[data-hero-title]');
        var desc = hero.querySelector('[data-hero-desc]');
        var meta = hero.querySelector('[data-hero-meta]');
        var link = hero.querySelector('[data-hero-link]');
        var dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function renderSlide(index) {
            if (!slides.length) {
                return;
            }

            current = index % slides.length;
            var slide = slides[current];
            var image = slide.getAttribute('data-image') || '';

            if (bg) {
                bg.style.backgroundImage = 'url(' + image + ')';
            }
            if (poster) {
                poster.src = image;
                poster.alt = slide.getAttribute('data-title') || '';
            }
            if (title) {
                title.textContent = slide.getAttribute('data-title') || '';
            }
            if (desc) {
                desc.textContent = slide.getAttribute('data-desc') || '';
            }
            if (meta) {
                meta.textContent = slide.getAttribute('data-meta') || '';
            }
            if (link) {
                link.href = slide.getAttribute('data-url') || '#';
            }

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                renderSlide(dotIndex);
            });
        });

        renderSlide(0);
        window.setInterval(function () {
            renderSlide(current + 1);
        }, 5200);
    }

    var filterForms = document.querySelectorAll('[data-filter-scope]');
    filterForms.forEach(function (scope) {
        var search = scope.querySelector('[data-filter-search]');
        var year = scope.querySelector('[data-filter-year]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        var empty = scope.querySelector('[data-empty-state]');

        function applyFilters() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var show = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    show = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    show = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    show = false;
                }
                if (typeValue && cardType !== typeValue) {
                    show = false;
                }

                card.style.display = show ? '' : 'none';
                if (show) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.style.display = visibleCount ? 'none' : 'block';
            }
        }

        [search, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    var globalSearch = document.querySelector('[data-global-search]');
    if (globalSearch) {
        globalSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = globalSearch.querySelector('input');
            var value = input ? input.value.trim() : '';
            if (value) {
                window.location.href = 'categories.html?q=' + encodeURIComponent(value);
            }
        });
    }

    var urlParams = new URLSearchParams(window.location.search);
    var q = urlParams.get('q');
    if (q) {
        var searchBox = document.querySelector('[data-filter-search]');
        if (searchBox) {
            searchBox.value = q;
            searchBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
});
