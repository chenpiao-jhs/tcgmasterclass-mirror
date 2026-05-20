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

    function updateStickyOffsetVar() {
      if (!window.matchMedia("(max-width: 900px)").matches) {
        document.documentElement.style.removeProperty("--page-nav-sticky-offset");
        return;
      }

      const topbarHeight = Math.ceil(topbar?.getBoundingClientRect().height || 0);
      if (topbarHeight) {
        document.documentElement.style.setProperty("--page-nav-sticky-offset", `${topbarHeight}px`);
      }
    }

    function getStickyOffset() {
      if (window.matchMedia("(max-width: 900px)").matches) {
        return (topbar?.getBoundingClientRect().height || 0) + 12;
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
      const mobileOffset = Math.min(120, Math.max(44, visibleContentHeight * 0.35));
      return topbarBottom + mobileOffset;
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

    function getScrollTop() {
      return document.scrollingElement?.scrollTop || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function scrollToAnchor(anchor, behavior = "smooth") {
      const target = document.getElementById(anchor);
      if (!target) return;

      updateStickyOffsetVar();
      const top = Math.max(0, getScrollTop() + target.getBoundingClientRect().top - getStickyOffset());
      if (typeof window.scrollTo === "function") {
        window.scrollTo({ top, behavior });
        return;
      }

      const root = document.scrollingElement || document.documentElement || document.body;
      root.scrollTop = top;
    }

    function afterLayout(callback) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(callback);
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
        if (rect.top <= activationLine + 2) {
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
      updateStickyOffsetVar();
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

        const anchor = getAnchorId(link);
        if (!anchor || !document.getElementById(anchor)) return;

        event.preventDefault();
        const perspective = panelByAnchor.get(anchor);
        if (perspective) setPerspective(perspective);

        if (window.history?.pushState) {
          window.history.pushState(null, "", `#${encodeURIComponent(anchor)}`);
        } else {
          window.location.hash = anchor;
        }

        afterLayout(() => {
          scrollToAnchor(anchor);
          setActiveNav(anchor);
        });
      });
    });

    function applyHashPerspective() {
      updateStickyOffsetVar();
      const anchor = decodeURIComponent(window.location.hash.slice(1));
      if (!anchor) {
        scheduleActiveNavUpdate(false);
        return;
      }

      const perspective = panelByAnchor.get(anchor);
      if (perspective) {
        setPerspective(perspective);
        afterLayout(() => {
          scrollToAnchor(anchor, "auto");
          setActiveNav(anchor);
        });
        return;
      }

      afterLayout(() => {
        if (document.getElementById(anchor)) {
          scrollToAnchor(anchor, "auto");
          setActiveNav(anchor);
        } else {
          scheduleActiveNavUpdate(false);
        }
      });
    }

    updateStickyOffsetVar();
    applyHashPerspective();
    window.addEventListener("hashchange", applyHashPerspective);
    window.addEventListener("popstate", applyHashPerspective);
    window.addEventListener("scroll", () => scheduleActiveNavUpdate(), { passive: true });
    window.addEventListener("resize", () => {
      updateStickyOffsetVar();
      scheduleActiveNavUpdate(false);
    });
    window.addEventListener("load", () => {
      updateStickyOffsetVar();
      if (window.location.hash) {
        applyHashPerspective();
      } else {
        scheduleActiveNavUpdate(false);
      }
    });
    window.setTimeout(() => {
      updateStickyOffsetVar();
      if (window.location.hash) {
        applyHashPerspective();
      } else {
        scheduleActiveNavUpdate(false);
      }
    }, 250);
    scheduleActiveNavUpdate(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageNav);
  } else {
    initPageNav();
  }
})();
