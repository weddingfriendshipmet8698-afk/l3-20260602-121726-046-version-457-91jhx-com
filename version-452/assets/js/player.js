function initMoviePlayer(videoId, streamUrl, buttonId, overlayId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var prepared = false;

  function attach() {
    if (!video || prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var started = video.play();
    if (started && typeof started.catch === 'function') {
      started.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
}
