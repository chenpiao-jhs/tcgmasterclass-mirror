(() => {
  function appendTime(url, time) {
    if (!url || !time) return url || "";
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${encodeURIComponent(time)}`;
  }

  function initVideoHub() {
    const hub = document.querySelector(".video-hub");
    const player = document.querySelector("#matchPlayer");
    const status = document.querySelector("#videoStatus");
    const openLink = document.querySelector("#videoOpen");
    const jumps = [...document.querySelectorAll(".jump-card")];
    const controls = [...document.querySelectorAll("[data-time][data-label]")];

    if (!hub || !player) return;

    const basePlayer = hub.dataset.playerBase || player.src.split("&t=")[0];
    const basePage = hub.dataset.pageBase || (openLink ? openLink.href.split("&t=")[0] : "");

    function setVideo(time, label) {
      if (!time) return;

      player.src = appendTime(basePlayer, time);

      if (status && label) {
        status.textContent = `当前：${label}`;
      }

      if (openLink && basePage) {
        openLink.href = appendTime(basePage, time);
      }

      jumps.forEach((jump) => {
        jump.classList.toggle("active", jump.dataset.time === String(time));
      });
    }

    controls.forEach((control) => {
      control.addEventListener("click", () => {
        setVideo(control.dataset.time, control.dataset.label);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVideoHub);
  } else {
    initVideoHub();
  }
})();
