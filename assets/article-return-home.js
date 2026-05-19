(() => {
  const script = document.currentScript;
  const href = script?.dataset.href || "../";
  const label = script?.dataset.label || "返回目录";

  class ArticleReturnHome extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;

      const root = this.attachShadow({ mode: "open" });
      const link = document.createElement("a");
      link.href = this.getAttribute("href") || href;
      link.textContent = this.getAttribute("label") || label;
      link.setAttribute("aria-label", this.getAttribute("aria-label") || label);

      const style = document.createElement("style");
      style.textContent = `
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        :host {
          position: absolute;
          top: max(18px, env(safe-area-inset-top));
          left: max(20px, calc((100vw - var(--max, 1160px)) / 2));
          z-index: 4;
          display: block;
        }

        a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 40px;
          padding: 0 16px;
          border: 1px solid rgba(255, 255, 255, 0.36);
          border-radius: 999px;
          background: rgba(8, 18, 13, 0.4);
          color: #fff;
          text-decoration: none;
          font: 700 14px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
          letter-spacing: 0;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }

        a::before {
          content: "←";
          font-size: 14px;
          line-height: 1;
        }

        a:hover,
        a:focus-visible {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.62);
          outline: none;
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          :host {
            top: max(18px, env(safe-area-inset-top));
            left: 18px;
          }

          a {
            height: 40px;
            padding: 0 16px;
            font-size: 14px;
          }
        }
      `;

      root.append(style, link);
    }
  }

  if (!customElements.get("article-return-home")) {
    customElements.define("article-return-home", ArticleReturnHome);
  }

  function mount() {
    const hero = document.querySelector(".hero");
    if (!hero || hero.querySelector("article-return-home")) return;

    const component = document.createElement("article-return-home");
    component.setAttribute("href", href);
    component.setAttribute("label", label);
    hero.prepend(component);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
