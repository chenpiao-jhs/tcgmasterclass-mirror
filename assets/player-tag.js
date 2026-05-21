(() => {
  const VISIBLE_CLASS = "is-visible";
  const HIDE_DELAY_MS = 2000;
  let activeTag = null;
  let hideTimer = 0;

  function getPlayerSide(tag) {
    return tag.dataset.playerSide || tag.dataset.side || "";
  }

  function hideTooltip() {
    activeTag?.classList.remove(VISIBLE_CLASS);
    activeTag = null;
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }

  function showTooltip(tag) {
    if (activeTag !== tag) {
      activeTag?.classList.remove(VISIBLE_CLASS);
    }
    activeTag = tag;
    tag.classList.add(VISIBLE_CLASS);
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hideTooltip, HIDE_DELAY_MS);
  }

  function initPlayerTag(tag) {
    if (tag.dataset.playerTagReady === "true") return;

    const side = getPlayerSide(tag);
    if (!side) return;

    tag.dataset.playerTagReady = "true";
    const insideInteractive = tag.closest("button, a, [role='button'], [role='link']");
    if (!insideInteractive) {
      tag.tabIndex = 0;
      tag.setAttribute("role", "button");
    }
    if (!tag.getAttribute("aria-label")) {
      tag.setAttribute("aria-label", `选手：${side}`);
    }

    tag.addEventListener("click", (event) => {
      event.stopPropagation();
      showTooltip(tag);
    });

    tag.addEventListener("keydown", (event) => {
      if (insideInteractive) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      showTooltip(tag);
    });
  }

  function initPlayerTags(root = document) {
    root.querySelectorAll(".player-tag").forEach(initPlayerTag);
  }

  window.PlayerTag = { init: initPlayerTags };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initPlayerTags());
  } else {
    initPlayerTags();
  }

  document.addEventListener("click", hideTooltip);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideTooltip();
  });
})();
