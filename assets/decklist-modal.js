(() => {
  const defaultRarityTags = ["普通", "不凡", "稀有", "史诗"];
  const articleCardLinkClass = "tcg-card-link";
  const articleCardLinkSelector = `.${articleCardLinkClass}`;
  const defaultArticleCardAliases = {
    "和平卫士": "蔚, 和平卫士",
    "剑圣": "无极剑圣, 入门",
    "靴子": "轻灵之靴",
    "复活甲": "守护天使",
    "中亚沙漏": "中娅沙漏",
    "魅惑": "魅惑妖术",
    "巨破": "距破之舞",
    "巨破之舞": "距破之舞",
    "御风": "驭风而行",
    "灭世": "蔑视",
    "水手": "鬼祟的水手",
    "鼠人": "变异猫咪",
    "Vex, Gloomist": "愁云使者",
    "Vex, Apathetic": "薇古丝, 冷眼旁观",
    "Boots of Swiftness": "轻灵之靴",
    "Charm": "魅惑妖术",
    "Defy": "蔑视",
    "Discipline": "训练有素",
    "Edge of Night": "夜之锋刃",
    "En Garde": "距破之舞",
    "Evelynn, Entrancing": "伊芙琳, 摄人心魄",
    "Irelia, Fervent": "艾瑞莉娅, 虔心承志",
    "Last Rites": "临终仪式",
    "Mutated Mouser": "变异猫咪",
    "Sneaky Deckhand": "鬼祟的水手",
    "Switcheroo": "换换乐",
    "Tidetumer": "控潮者",
    "Zhonya's Hourglass": "中娅沙漏",
    "Calm Rune": "翠意符文",
    "Chaos Rune": "混沌符文",
    "Mindsplitter": "辟心玄龙"
  };
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

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      <div class="deck-dialog" role="dialog" aria-modal="true" aria-labelledby="deckModalTitle">
        <div class="deck-dialog-head">
          <div>
            <h2 id="deckModalTitle">查看牌表</h2>
          </div>
          <button class="deck-close" type="button" data-deck-close>关闭</button>
        </div>
        <div class="deck-switcher" id="deckModalSwitcher" aria-label="切换选手牌表" hidden></div>
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

  function getDeckLabel(deck) {
    return deck.buttonLabel || deck.title || "牌表";
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

  function renderDeckSwitcher(switcher, decks) {
    if (!switcher) return;
    switcher.hidden = decks.length <= 1;
    switcher.innerHTML = decks.map((deck) => `
      <button class="deck-switch-button" type="button" data-deck-switch="${escapeHtml(deck.key)}" aria-pressed="false">
        <span>${escapeHtml(getDeckLabel(deck))}</span>
        <strong>${escapeHtml(deck.player || "")}</strong>
      </button>
    `).join("");
  }

  function updateDeckSwitcher(switcher, activeDeck) {
    if (!switcher || !activeDeck) return;
    switcher.querySelectorAll("[data-deck-switch]").forEach((button) => {
      const active = button.dataset.deckSwitch === String(activeDeck.key);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
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

  function mergeDeckSources(sources) {
    return sources.reduce((merged, source) => ({ ...merged, ...(source || {}) }), {});
  }

  function resolveArticleDecks(options = {}) {
    const dataSources = Array.isArray(options.dataSources)
      ? options.dataSources
      : [options.dataSource || options.deckSource];
    const dataSource = mergeDeckSources(dataSources);
    const sourceKeys = Object.keys(dataSource);
    const deckConfig = Array.isArray(options.decks) ? options.decks : sourceKeys;
    const decks = resolveDecks(deckConfig, dataSource);
    if (Array.isArray(options.cards) && options.cards.length > 0) {
      decks.push({ key: "manual-card-links", main: options.cards });
    }
    return decks;
  }

  function getArticleCardConfig(options) {
    if (!options.articleCardLinks) return null;
    return options.articleCardLinks === true ? {} : options.articleCardLinks;
  }

  function getCardAliasTerms(card, config) {
    const name = getCardName(card).trim();
    const minAliasLength = Number(config.minAliasLength || 2);
    const terms = new Set([name]);
    const commaParts = name.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
    commaParts.forEach((part) => {
      if (part.length >= minAliasLength) terms.add(part);
    });
    return [...terms].filter((term) => term.length >= minAliasLength);
  }

  function addCardLinkTerm(index, term, card) {
    const image = getCardImage(card);
    const name = getCardName(card);
    if (!term || !image || !name || index.has(term)) return;
    index.set(term, { name, image });
  }

  function applyConfiguredCardAliases(index, aliases = {}) {
    Object.entries(aliases).forEach(([alias, target]) => {
      if (!alias) return;
      if (typeof target === "string") {
        const card = index.get(target);
        if (card && !index.has(alias)) index.set(alias, card);
        return;
      }
      if (target?.image) {
        index.set(alias, {
          name: target.name || alias,
          image: target.image
        });
      }
    });
  }

  function buildArticleCardIndex(decks, config = {}) {
    const index = new Map();
    const excluded = new Set(config.exclude || []);
    decks.forEach((deck) => {
      [...(deck.main || []), ...(deck.side || [])].forEach((card) => {
        getCardAliasTerms(card, config)
          .filter((term) => !excluded.has(term))
          .forEach((term) => addCardLinkTerm(index, term, card));
      });
    });
    applyConfiguredCardAliases(index, { ...defaultArticleCardAliases, ...(config.aliases || {}) });

    const terms = [...index.keys()]
      .filter((term) => !excluded.has(term))
      .sort((a, b) => b.length - a.length);
    if (terms.length === 0) return null;
    return {
      cardsByTerm: index,
      pattern: new RegExp(terms.map(escapeRegExp).join("|"), "g")
    };
  }

  function shouldSkipArticleTextNode(node, skipSelector) {
    const parent = node.parentElement;
    if (!parent || !node.nodeValue?.trim()) return true;
    return Boolean(parent.closest(skipSelector));
  }

  function linkArticleTextNode(node, cardIndex) {
    const text = node.nodeValue || "";
    const { pattern, cardsByTerm } = cardIndex;
    pattern.lastIndex = 0;
    let match;
    let lastIndex = 0;
    let linkedCount = 0;
    const fragment = document.createDocumentFragment();

    while ((match = pattern.exec(text)) !== null) {
      const term = match[0];
      const card = cardsByTerm.get(term);
      if (!card) continue;
      if (match.index > lastIndex) {
        fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const link = document.createElement("a");
      link.className = `${articleCardLinkClass} article-card-link`;
      link.href = card.image;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.dataset.cardImage = card.image;
      link.dataset.cardName = card.name;
      link.setAttribute("aria-label", `查看 ${card.name} 卡图`);
      link.textContent = term;
      fragment.append(link);
      linkedCount += 1;
      lastIndex = pattern.lastIndex;
    }

    if (linkedCount === 0) return 0;
    if (lastIndex < text.length) {
      fragment.append(document.createTextNode(text.slice(lastIndex)));
    }
    node.replaceWith(fragment);
    return linkedCount;
  }

  function linkArticleCardNames(config, decks) {
    if (!config) return null;
    const root = document.querySelector(config.root || config.rootSelector || "main");
    if (!root) return null;
    const cardIndex = buildArticleCardIndex(decks, config);
    if (!cardIndex) return null;
    const skipSelector = config.skipSelector || [
      "a",
      "button",
      "script",
      "style",
      "textarea",
      "input",
      "select",
      "option",
      ".deck-modal",
      ".deck-card-hover-preview",
      ".deck-card-lightbox"
    ].join(",");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      if (!shouldSkipArticleTextNode(walker.currentNode, skipSelector)) {
        textNodes.push(walker.currentNode);
      }
    }
    const linkedCount = textNodes.reduce((sum, node) => sum + linkArticleTextNode(node, cardIndex), 0);
    if (linkedCount === 0) return null;
    root.dataset.articleCardLinks = String(linkedCount);
    return root;
  }

  function initArticleCardLinks(options = {}) {
    const decks = resolveArticleDecks(options);
    const root = linkArticleCardNames(options, decks);
    if (!root) return null;

    const hoverPreview = document.querySelector(".deck-card-hover-preview") || createHoverPreview();
    const hoverPreviewImage = hoverPreview.querySelector("img");
    const hoverPreviewTitle = hoverPreview.querySelector("p");
    const lightbox = document.querySelector(".deck-card-lightbox") || createImageLightbox();
    const lightboxImage = lightbox.querySelector("img");
    const lightboxTitle = lightbox.querySelector("p");
    const lightboxClose = lightbox.querySelector("[data-card-preview-close]");
    let activePreviewTrigger = null;
    let lastImageTrigger = null;
    let lightboxPointerStartY = null;

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

    root.addEventListener("pointerover", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (!trigger || trigger === activePreviewTrigger) return;
      showHoverPreview(trigger, event);
    });

    root.addEventListener("pointermove", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger && trigger === activePreviewTrigger) {
        positionHoverPreview(event, trigger);
      }
    });

    root.addEventListener("pointerout", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger && !trigger.contains(event.relatedTarget)) {
        hideHoverPreview();
      }
    });

    root.addEventListener("focusin", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger) showHoverPreview(trigger);
    });

    root.addEventListener("focusout", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger) hideHoverPreview();
    });

    root.addEventListener("click", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (!trigger || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openCardImage(trigger);
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
      }
    });

    return { root, closeCardImage };
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
    const tabs = [...modal.querySelectorAll("[data-deck-tab]")];
    const deckSwitcher = modal.querySelector("#deckModalSwitcher");
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
    renderDeckSwitcher(deckSwitcher, decks);
    const articleCardRoot = linkArticleCardNames(getArticleCardConfig(options), decks);

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

    function getActiveDeckTab() {
      return tabs.find((tab) => tab.classList.contains("is-active"))?.dataset.deckTab || "text";
    }

    function renderActiveDeck(preferredTab) {
      if (!activeDeck || !modal || !image || !title) return;
      const deckTitle = activeDeck.title || getDeckLabel(activeDeck);
      title.textContent = "查看牌表";
      if (activeDeck.image) {
        image.src = activeDeck.image;
      } else {
        image.removeAttribute("src");
      }
      image.alt = activeDeck.alt || deckTitle;
      renderTextDeck();
      setDeckTab(preferredTab || (hasTextDeck(activeDeck) ? "text" : "image"));
      updateDeckSwitcher(deckSwitcher, activeDeck);
      if (textPanel) textPanel.scrollTop = 0;
      if (imagePanel) imagePanel.scrollTop = 0;
      hideHoverPreview();
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
      if (!activeDeck || !modal) return;
      lastTrigger = button;
      renderActiveDeck(hasTextDeck(activeDeck) ? "text" : "image");
      modal.hidden = false;
      document.body.classList.add("deck-modal-open");
      closeButton?.focus();
    }

    function switchDeck(key) {
      const nextDeck = deckByKey.get(String(key));
      if (!nextDeck || nextDeck === activeDeck) return;
      activeDeck = nextDeck;
      renderActiveDeck(getActiveDeckTab());
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

    deckSwitcher?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-deck-switch]");
      if (button) switchDeck(button.dataset.deckSwitch);
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

    articleCardRoot?.addEventListener("pointerover", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (!trigger || trigger === activePreviewTrigger) return;
      showHoverPreview(trigger, event);
    });

    articleCardRoot?.addEventListener("pointermove", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger && trigger === activePreviewTrigger) {
        positionHoverPreview(event, trigger);
      }
    });

    articleCardRoot?.addEventListener("pointerout", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger && !trigger.contains(event.relatedTarget)) {
        hideHoverPreview();
      }
    });

    articleCardRoot?.addEventListener("focusin", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger) showHoverPreview(trigger);
    });

    articleCardRoot?.addEventListener("focusout", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (trigger) hideHoverPreview();
    });

    articleCardRoot?.addEventListener("click", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (!trigger || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openCardImage(trigger);
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
  window.TcgArticleCardLinks = { init: initArticleCardLinks };

  function initFromGlobalConfig() {
    if (window.tcgDecklistConfig) {
      initDecklistModal(window.tcgDecklistConfig);
    }
    if (window.tcgArticleCardLinkConfig) {
      initArticleCardLinks(window.tcgArticleCardLinkConfig);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFromGlobalConfig);
  } else {
    initFromGlobalConfig();
  }
})();
