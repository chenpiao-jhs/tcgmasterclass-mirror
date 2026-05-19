(() => {
  function initPageNav() {
    const navGroups = [...document.querySelectorAll(".nav .links")];
    if (!navGroups.length) return;

    const tabs = [...document.querySelectorAll("[data-perspective-target]")];
    const panels = [...document.querySelectorAll("[data-perspective-panel]")];
    const topbar = document.querySelector(".topbar");
    const desktopSwitch = document.querySelector(".perspective-switch-desktop");
    const panelByAnchor = new Map();
    let activeNavFrame = 0;
    let currentAnchor = "";

    panels.forEach((panel) => {
      panel.querySelectorAll("[id]").forEach((node) => {
        panelByAnchor.set(node.id, panel.dataset.perspectivePanel);
      });
    });

    function getAnchorId(link) {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return "";
      return decodeURIComponent(href.slice(1));
    }

    function getVisibleNavGroup() {
      return navGroups.find((group) => !group.hidden);
    }

    function getStickyOffset() {
      if (window.matchMedia("(max-width: 900px)").matches) {
        return (topbar?.getBoundingClientRect().height || 0) + 28;
      }

      const switchVisible = desktopSwitch && getComputedStyle(desktopSwitch).display !== "none";
      return switchVisible ? desktopSwitch.getBoundingClientRect().height + 42 : 110;
    }

    function getActivationLine() {
      if (!window.matchMedia("(max-width: 900px)").matches) {
        return getStickyOffset();
      }

      const topbarBottom = topbar?.getBoundingClientRect().bottom || 0;
      const visibleContentHeight = Math.max(0, window.innerHeight - topbarBottom);
      return topbarBottom + Math.min(340, visibleContentHeight * 0.65);
    }

    function revealActiveLink(link) {
      const group = link.closest(".links");
      if (!group || group.scrollWidth <= group.clientWidth) return;

      const targetLeft = link.offsetLeft - (group.clientWidth - link.offsetWidth) / 2;
      group.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });
    }

    function setActiveNav(anchor, shouldReveal = true) {
      if (!anchor) return;

      navGroups.forEach((group) => {
        group.querySelectorAll('a[href^="#"]').forEach((link) => {
          const active = !group.hidden && getAnchorId(link) === anchor;
          if (active) {
            link.setAttribute("aria-current", "location");
            if (shouldReveal) revealActiveLink(link);
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });

      currentAnchor = anchor;
    }

    function getCurrentAnchor() {
      const group = getVisibleNavGroup();
      if (!group) return "";

      const activationLine = getActivationLine();
      const anchors = [...group.querySelectorAll('a[href^="#"]')]
        .map((link) => getAnchorId(link))
        .filter((id) => document.getElementById(id));

      if (!anchors.length) return "";

      let active = anchors[0];

      anchors.forEach((id) => {
        const rect = document.getElementById(id).getBoundingClientRect();
        if (rect.top <= activationLine) {
          active = id;
        }
      });

      return active;
    }

    function updateActiveNav(shouldReveal = true) {
      const anchor = getCurrentAnchor();
      if (anchor && anchor !== currentAnchor) {
        setActiveNav(anchor, shouldReveal);
      }
    }

    function scheduleActiveNavUpdate(shouldReveal = true) {
      if (activeNavFrame) return;
      activeNavFrame = window.requestAnimationFrame(() => {
        activeNavFrame = 0;
        updateActiveNav(shouldReveal);
      });
    }

    function setPerspective(name, shouldFocus = false) {
      if (!name) return;

      tabs.forEach((tab) => {
        const active = tab.dataset.perspectiveTarget === name;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        if (active && shouldFocus) tab.focus();
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.perspectivePanel !== name;
      });

      navGroups.forEach((group) => {
        if (group.dataset.perspectiveNav) {
          group.hidden = group.dataset.perspectiveNav !== name;
        }
      });

      currentAnchor = "";
      scheduleActiveNavUpdate(false);
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setPerspective(tab.dataset.perspectiveTarget, true);
      });
    });

    navGroups.forEach((group) => {
      group.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        setActiveNav(getAnchorId(link));
      });
    });

    function applyHashPerspective() {
      const anchor = decodeURIComponent(window.location.hash.slice(1));
      if (!anchor) {
        scheduleActiveNavUpdate(false);
        return;
      }

      const perspective = panelByAnchor.get(anchor);
      if (perspective) {
        setPerspective(perspective);
        window.requestAnimationFrame(() => {
          document.getElementById(anchor)?.scrollIntoView();
          setActiveNav(anchor);
        });
        return;
      }

      window.requestAnimationFrame(() => {
        if (document.getElementById(anchor)) {
          setActiveNav(anchor);
        } else {
          scheduleActiveNavUpdate(false);
        }
      });
    }

    applyHashPerspective();
    window.addEventListener("hashchange", applyHashPerspective);
    window.addEventListener("scroll", () => scheduleActiveNavUpdate(), { passive: true });
    window.addEventListener("resize", () => scheduleActiveNavUpdate(false));
    scheduleActiveNavUpdate(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageNav);
  } else {
    initPageNav();
  }
})();
