(() => {
  function stripTimeParam(url, paramName) {
    if (!url || !paramName) return url || "";
    try {
      const parsed = new URL(url, window.location.href);
      parsed.searchParams.delete(paramName);
      return parsed.toString();
    } catch (_error) {
      return String(url).replace(new RegExp(`([?&])${paramName}=[^&]*&?`), "$1").replace(/[?&]$/, "");
    }
  }

  function appendTime(url, time, paramName = "t") {
    if (!url || !time) return url || "";
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${encodeURIComponent(paramName)}=${encodeURIComponent(time)}`;
  }

  function initVideoHub() {
    const hub = document.querySelector(".video-hub");
    const player = document.querySelector("#matchPlayer");
    const status = document.querySelector("#videoStatus");
    const openLink = document.querySelector("#videoOpen");
    const jumps = [...document.querySelectorAll(".jump-card")];
    const controls = [...document.querySelectorAll("[data-time][data-label]")];

    if (!hub || !player) return;

    const playerTimeParam = hub.dataset.playerTimeParam || "t";
    const pageTimeParam = hub.dataset.pageTimeParam || "t";
    const basePlayer = hub.dataset.playerBase || stripTimeParam(player.src, playerTimeParam);
    const basePage = hub.dataset.pageBase || (openLink ? stripTimeParam(openLink.href, pageTimeParam) : "");

    function setVideo(time, label, control) {
      if (!time) return;

      const effectivePlayerTimeParam = control?.dataset.playerTimeParam || playerTimeParam;
      const effectivePageTimeParam = control?.dataset.pageTimeParam || pageTimeParam;
      const effectiveBasePlayer = control?.dataset.playerBase
        ? stripTimeParam(control.dataset.playerBase, effectivePlayerTimeParam)
        : basePlayer;
      const effectiveBasePage = control?.dataset.pageBase
        ? stripTimeParam(control.dataset.pageBase, effectivePageTimeParam)
        : basePage;

      player.src = appendTime(effectiveBasePlayer, time, effectivePlayerTimeParam);

      if (status && label) {
        status.textContent = `当前：${label}`;
      }

      if (openLink && effectiveBasePage) {
        openLink.href = appendTime(effectiveBasePage, time, effectivePageTimeParam);
      }

      jumps.forEach((jump) => {
        const sameVideo = !control?.dataset.playerBase && !jump.dataset.playerBase;
        jump.classList.toggle("active", sameVideo && jump.dataset.time === String(time));
      });
    }

    controls.forEach((control) => {
      control.addEventListener("click", (event) => {
        if (control.dataset.playerBase) event.preventDefault();
        setVideo(control.dataset.time, control.dataset.label, control);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVideoHub);
  } else {
    initVideoHub();
  }
})();
