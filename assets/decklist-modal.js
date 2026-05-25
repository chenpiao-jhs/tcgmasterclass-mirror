(() => {
  const defaultRarityTags = ["普通", "不凡", "稀有", "史诗"];
  const defaultSections = [
    { title: "传奇", match: (meta) => meta.startsWith("传奇") },
    { title: "主牌组", match: (meta) => !meta.startsWith("传奇") && !meta.startsWith("战场") && !meta.startsWith("符文") },
    { title: "战场牌", match: (meta) => meta.startsWith("战场") },
    { title: "符文牌", match: (meta) => meta.startsWith("符文") },
    { title: "备牌", source: "side" }
  ];

  function sumCards(cards) {
    return cards.reduce((sum, card) => sum + Number(getCardCount(card) || 0), 0);
  }

  function getCardMeta(card) {
    return Array.isArray(card) ? card[2] || "" : card.meta || "";
  }

  function getCardName(card) {
    return Array.isArray(card) ? card[0] || "" : card.name || "";
  }

  function getCardCount(card) {
    return Array.isArray(card) ? card[1] || 0 : card.count || 0;
  }

  function getCardImage(card) {
    return Array.isArray(card) ? card[3] || "" : card.image || "";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatCardMeta(meta, rarityTags) {
    return String(meta)
      .split("｜")
      .map((part) => part.split("/").filter((item) => !rarityTags.includes(item)).join("/"))
      .filter(Boolean)
      .join("｜");
  }

  function renderCardList(cards, rarityTags) {
    return cards.map((card) => {
      const name = getCardName(card);
      const meta = formatCardMeta(getCardMeta(card), rarityTags);
      const metaHtml = meta ? `<span class="deck-card-meta">${escapeHtml(meta)}</span>` : "";
      const image = getCardImage(card);
      const imageHtml = image
        ? `
          <button class="deck-card-thumb" type="button" data-card-image="${escapeHtml(image)}" data-card-name="${escapeHtml(name)}" aria-label="查看 ${escapeHtml(name)} 卡图大图">
            <img class="deck-card-image" src="${escapeHtml(image)}" alt="${escapeHtml(name)} 卡图" loading="lazy">
          </button>
        `
        : `<span class="deck-card-image deck-card-image-empty" aria-hidden="true"></span>`;
      return `
        <li>
          ${imageHtml}
          <span class="deck-card-count">x${escapeHtml(getCardCount(card))}</span>
          <span>
            <span class="deck-card-name">${escapeHtml(name)}</span>
            ${metaHtml}
          </span>
        </li>
      `;
    }).join("");
  }

  function renderDeckSection(title, cards, rarityTags) {
    const denseClass = cards.length > 8 ? " is-dense" : "";
    const evenClass = cards.length > 8 && cards.length % 2 === 0 ? " is-even" : "";
    return `
      <section class="deck-section${denseClass}${evenClass}">
        <h3>${escapeHtml(title)} ${sumCards(cards)} 张</h3>
        <ul class="deck-card-list">${renderCardList(cards, rarityTags)}</ul>
      </section>
    `;
  }

  function getSections(deck, sectionConfig) {
    const main = deck.main || [];
    const side = deck.side || [];
    return sectionConfig.map((section) => {
      const sourceCards = section.source === "side" ? side : main;
      const cards = typeof section.match === "function"
        ? sourceCards.filter((card) => section.match(getCardMeta(card), card, deck))
        : sourceCards;
      return { title: section.title, cards };
    }).filter((section) => section.cards.length > 0 || section.keepEmpty);
  }

  function hasTextDeck(deck) {
    if (!deck) return false;
    return [...(deck.main || []), ...(deck.side || [])].length > 0;
  }

  function createModal() {
    const modal = document.createElement("div");
    modal.className = "deck-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="deck-dialog" role="dialog" aria-modal="true" aria-labelledby="deckModalTitle" aria-describedby="deckModalPlayer">
        <div class="deck-dialog-head">
          <div>
            <h2 id="deckModalTitle">牌表</h2>
            <p id="deckModalPlayer">选手</p>
          </div>
          <button class="deck-close" type="button" data-deck-close>关闭</button>
        </div>
        <div class="deck-tabs" role="tablist" aria-label="牌表展示方式">
          <button class="deck-tab is-active" id="deckTabText" type="button" role="tab" aria-selected="true" aria-controls="deckPanelText" data-deck-tab="text">列表版</button>
          <button class="deck-tab" id="deckTabImage" type="button" role="tab" aria-selected="false" aria-controls="deckPanelImage" data-deck-tab="image">图片版</button>
        </div>
        <div class="deck-panel deck-text-wrap" id="deckPanelText" role="tabpanel" aria-labelledby="deckTabText">
          <div class="deck-text-grid" id="deckTextList"></div>
        </div>
        <div class="deck-panel deck-image-wrap" id="deckPanelImage" role="tabpanel" aria-labelledby="deckTabImage" hidden>
          <img id="deckModalImage" src="" alt="">
        </div>
      </div>
    `;
    document.body.append(modal);
    return modal;
  }

  function createHoverPreview() {
    const preview = document.createElement("div");
    preview.className = "deck-card-hover-preview";
    preview.hidden = true;
    preview.innerHTML = `
      <img alt="">
      <p></p>
    `;
    document.body.append(preview);
    return preview;
  }

  function createImageLightbox() {
    const lightbox = document.createElement("div");
    lightbox.className = "deck-card-lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="deck-card-lightbox-dialog" role="dialog" aria-modal="true" aria-label="卡牌大图预览">
        <button class="deck-card-lightbox-close" type="button" data-card-preview-close>关闭</button>
        <img alt="">
        <p></p>
      </div>
    `;
    document.body.append(lightbox);
    return lightbox;
  }

  function renderEntrypoints(mount, decks, label) {
    mount.classList.add("decklist-panel");
    mount.setAttribute("aria-label", label);
    mount.innerHTML = `
      <div class="decklist-label">${escapeHtml(label)}</div>
      ${decks.map((deck) => `
        <button class="decklist-button" type="button" data-deck-key="${escapeHtml(deck.key)}">
          <span>${escapeHtml(deck.buttonLabel || deck.title || "牌表")}</span>
          <strong>${escapeHtml(deck.player || "")}</strong>
        </button>
      `).join("")}
    `;
  }

  function resolveDecks(decks, dataSource) {
    const source = dataSource || {};
    return decks.map((deck) => {
      if (typeof deck === "string") {
        return source[deck] ? { ...source[deck] } : { key: deck };
      }
      const sourceKey = deck.sourceKey || deck.key;
      const sourceDeck = sourceKey && source[sourceKey] ? source[sourceKey] : {};
      return { ...sourceDeck, ...deck, key: deck.key || sourceDeck.key || sourceKey };
    }).filter((deck) => deck.key);
  }

  function initDecklistModal(options = {}) {
    const decks = resolveDecks(Array.isArray(options.decks) ? options.decks : [], options.dataSource || options.deckSource);
    const mount = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
    if (!mount || decks.length === 0) return null;

    const deckByKey = new Map(decks.map((deck) => [String(deck.key), deck]));
    const sectionConfig = options.sections || defaultSections;
    const rarityTags = options.rarityTags || defaultRarityTags;
    const label = options.label || "公开牌表";
    const modal = document.querySelector(options.modalSelector || ".deck-modal") || createModal();
    const image = modal.querySelector("#deckModalImage");
    const title = modal.querySelector("#deckModalTitle");
    const player = modal.querySelector("#deckModalPlayer");
    const tabs = [...modal.querySelectorAll("[data-deck-tab]")];
    const imagePanel = modal.querySelector("#deckPanelImage");
    const textPanel = modal.querySelector("#deckPanelText");
    const textList = modal.querySelector("#deckTextList");
    const closeButton = modal.querySelector("[data-deck-close]");
    const hoverPreview = document.querySelector(".deck-card-hover-preview") || createHoverPreview();
    const hoverPreviewImage = hoverPreview.querySelector("img");
    const hoverPreviewTitle = hoverPreview.querySelector("p");
    const lightbox = document.querySelector(".deck-card-lightbox") || createImageLightbox();
    const lightboxImage = lightbox.querySelector("img");
    const lightboxTitle = lightbox.querySelector("p");
    const lightboxClose = lightbox.querySelector("[data-card-preview-close]");
    let lastTrigger = null;
    let activeDeck = null;
    let activePreviewTrigger = null;
    let lastImageTrigger = null;
    let lightboxPointerStartY = null;

    renderEntrypoints(mount, decks, label);

    function renderTextDeck() {
      if (!textList) return;
      if (!activeDeck) {
        textList.innerHTML = "<p>暂无列表版牌表。</p>";
        return;
      }
      const sections = getSections(activeDeck, sectionConfig);
      textList.innerHTML = sections.length > 0
        ? sections.map((section) => renderDeckSection(section.title, section.cards, rarityTags)).join("")
        : "<p>暂无列表版牌表。</p>";
    }

    function setDeckTab(tabName) {
      if (tabName === "image" && activeDeck && !activeDeck.image) {
        tabName = "text";
      }
      if (tabName === "text" && activeDeck && !hasTextDeck(activeDeck) && activeDeck.image) {
        tabName = "image";
      }
      const isText = tabName === "text";
      tabs.forEach((tab) => {
        const active = tab.dataset.deckTab === tabName;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.hidden = tab.dataset.deckTab === "image" && activeDeck && !activeDeck.image;
        if (tab.dataset.deckTab === "text" && activeDeck && !hasTextDeck(activeDeck)) {
          tab.hidden = true;
        }
      });
      if (imagePanel) imagePanel.hidden = isText;
      if (textPanel) textPanel.hidden = !isText;
      if (isText) renderTextDeck();
    }

    function setPreviewImage(target, titleTarget, trigger) {
      if (!target || !titleTarget || !trigger?.dataset.cardImage) return;
      target.src = trigger.dataset.cardImage;
      target.alt = `${trigger.dataset.cardName || "卡牌"} 卡图`;
      titleTarget.textContent = trigger.dataset.cardName || "";
    }

    function positionHoverPreview(event, trigger) {
      if (!hoverPreview || hoverPreview.hidden) return;
      const rect = trigger.getBoundingClientRect();
      const pointerX = event?.clientX || rect.right;
      const pointerY = event?.clientY || rect.top + rect.height / 2;
      const previewWidth = hoverPreview.offsetWidth || 220;
      const previewHeight = hoverPreview.offsetHeight || 320;
      const gap = 16;
      let left = pointerX + gap;
      if (left + previewWidth + gap > window.innerWidth) {
        left = pointerX - previewWidth - gap;
      }
      left = Math.max(gap, Math.min(left, window.innerWidth - previewWidth - gap));
      const top = Math.max(gap, Math.min(pointerY - previewHeight / 2, window.innerHeight - previewHeight - gap));
      hoverPreview.style.left = `${left}px`;
      hoverPreview.style.top = `${top}px`;
    }

    function showHoverPreview(trigger, event) {
      if (!trigger?.dataset.cardImage || window.matchMedia("(hover: none)").matches) return;
      activePreviewTrigger = trigger;
      setPreviewImage(hoverPreviewImage, hoverPreviewTitle, trigger);
      hoverPreview.hidden = false;
      positionHoverPreview(event, trigger);
    }

    function hideHoverPreview() {
      activePreviewTrigger = null;
      if (hoverPreview) hoverPreview.hidden = true;
    }

    function openCardImage(trigger) {
      if (!trigger?.dataset.cardImage || !lightbox || !lightboxImage || !lightboxTitle) return;
      hideHoverPreview();
      lastImageTrigger = trigger;
      setPreviewImage(lightboxImage, lightboxTitle, trigger);
      lightbox.hidden = false;
      lightboxClose?.focus();
    }

    function closeCardImage() {
      if (!lightbox || !lightboxImage) return;
      lightbox.hidden = true;
      lightboxImage.removeAttribute("src");
      lightboxPointerStartY = null;
      lastImageTrigger?.focus();
    }

    function openDeck(button) {
      activeDeck = deckByKey.get(button.dataset.deckKey);
      if (!activeDeck || !modal || !image || !title || !player) return;
      lastTrigger = button;
      title.textContent = activeDeck.title || activeDeck.buttonLabel || "牌表";
      player.textContent = activeDeck.player ? `选手：${activeDeck.player}` : "";
      if (activeDeck.image) {
        image.src = activeDeck.image;
      } else {
        image.removeAttribute("src");
      }
      image.alt = activeDeck.alt || title.textContent;
      renderTextDeck();
      setDeckTab(hasTextDeck(activeDeck) ? "text" : "image");
      modal.hidden = false;
      document.body.classList.add("deck-modal-open");
      closeButton?.focus();
    }

    function closeDeck() {
      if (!modal || !image) return;
      modal.hidden = true;
      document.body.classList.remove("deck-modal-open");
      image.removeAttribute("src");
      if (textList) textList.innerHTML = "";
      hideHoverPreview();
      closeCardImage();
      lastTrigger?.focus();
    }

    mount.addEventListener("click", (event) => {
      const button = event.target.closest(".decklist-button");
      if (button) openDeck(button);
    });

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setDeckTab(tab.dataset.deckTab || "image"));
    });

    textList?.addEventListener("pointerover", (event) => {
      const trigger = event.target.closest(".deck-card-thumb");
      if (!trigger || trigger === activePreviewTrigger) return;
      showHoverPreview(trigger, event);
    });

    textList?.addEventListener("pointermove", (event) => {
      const trigger = event.target.closest(".deck-card-thumb");
      if (trigger && trigger === activePreviewTrigger) {
        positionHoverPreview(event, trigger);
      }
    });

    textList?.addEventListener("pointerout", (event) => {
      const trigger = event.target.closest(".deck-card-thumb");
      if (trigger && !trigger.contains(event.relatedTarget)) {
        hideHoverPreview();
      }
    });

    textList?.addEventListener("focusin", (event) => {
      const trigger = event.target.closest(".deck-card-thumb");
      if (trigger) showHoverPreview(trigger);
    });

    textList?.addEventListener("focusout", (event) => {
      const trigger = event.target.closest(".deck-card-thumb");
      if (trigger) hideHoverPreview();
    });

    textList?.addEventListener("click", (event) => {
      const trigger = event.target.closest(".deck-card-thumb");
      if (trigger) openCardImage(trigger);
    });

    textPanel?.addEventListener("scroll", hideHoverPreview, { passive: true });

    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-deck-close]")) {
        closeDeck();
      }
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target === lightboxImage || event.target.closest("[data-card-preview-close]")) {
        closeCardImage();
      }
    });

    lightbox.addEventListener("wheel", (event) => {
      if (!lightbox.hidden && event.deltaY > 18) {
        event.preventDefault();
        closeCardImage();
      }
    }, { passive: false });

    lightbox.addEventListener("pointerdown", (event) => {
      lightboxPointerStartY = event.clientY;
    });

    lightbox.addEventListener("pointerup", (event) => {
      if (lightboxPointerStartY !== null && event.clientY - lightboxPointerStartY > 48) {
        closeCardImage();
      }
      lightboxPointerStartY = null;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox && !lightbox.hidden) {
        closeCardImage();
      } else if (event.key === "Escape" && !modal.hidden) {
        closeDeck();
      }
    });

    return { openDeck, closeDeck };
  }

  window.TcgDecklistModal = { init: initDecklistModal };

  function initFromGlobalConfig() {
    if (window.tcgDecklistConfig) {
      initDecklistModal(window.tcgDecklistConfig);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFromGlobalConfig);
  } else {
    initFromGlobalConfig();
  }
})();
