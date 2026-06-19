(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '<a class="poster-frame" href="./' + escapeHtml(movie.file) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-label">' + escapeHtml(movie.category) + '</span>',
            '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<h2><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>',
            '<p>' + escapeHtml(movie.desc) + '</p>',
            '<div class="meta-line">',
            '<span>' + escapeHtml(movie.region) + '</span>',
            '<span>' + escapeHtml(movie.type) + '</span>',
            '<span>' + escapeHtml(movie.genre) + '</span>',
            '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function initSearch() {
        var results = document.getElementById("search-results");
        var summary = document.getElementById("search-summary");
        var formInput = document.querySelector(".search-page-form input[name='q']");
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var data = window.MovieSearchIndex || [];
        if (formInput) {
            formInput.value = query;
        }
        if (!results || !summary || !query) {
            return;
        }
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = data.filter(function (movie) {
            var text = [movie.title, movie.desc, movie.region, movie.type, movie.genre, movie.tags, movie.category, movie.year].join(" ").toLowerCase();
            return terms.every(function (term) {
                return text.indexOf(term) !== -1;
            });
        });
        summary.innerHTML = '<h2>搜索 “' + escapeHtml(query) + '” 的结果</h2><p>找到 <strong>' + matched.length + '</strong> 个相关视频</p>';
        results.innerHTML = matched.length ? matched.map(card).join('') : '<p class="filter-empty">没有找到匹配影片</p>';
    }

    ready(initSearch);
})();
