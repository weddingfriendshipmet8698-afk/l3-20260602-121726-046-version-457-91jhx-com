import { H as Hls } from './video-vendor-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-play-overlay]');
    var status = document.querySelector('[data-player-status]');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function attachSource() {
        if (!source) {
            setStatus('当前影片没有可用播放源。');
            return;
        }

        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源已加载，点击播放按钮即可观看。');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放源连接异常，可刷新页面后重试。');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            setStatus('播放源已加载，点击播放按钮即可观看。');
        } else {
            video.src = source;
            setStatus('浏览器不支持 HLS 自动解析，请使用支持 HLS 的浏览器访问。');
        }
    }

    attachSource();

    if (overlay) {
        overlay.addEventListener('click', function () {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    setStatus('浏览器阻止了自动播放，请使用播放器控制条播放。');
                });
            }
        });

        video.addEventListener('play', function () {
            overlay.style.display = 'none';
        });

        video.addEventListener('pause', function () {
            overlay.style.display = '';
        });
    }
});
