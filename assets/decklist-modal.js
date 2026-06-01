(() => {
  const defaultRarityTags = ["普通", "不凡", "稀有", "史诗"];
  const articleCardLinkClass = "tcg-card-link";
  const articleCardLinkSelector = `.${articleCardLinkClass}`;
  const defaultArticleCardAliases = {
    "和平卫士": "蔚, 和平卫士",
    "剑圣": "无极剑圣, 入门",
    "靴子": "轻灵之靴",
    "游走鞋": "轻灵之靴",
    "复活甲": "守护天使",
    "中亚": "中娅沙漏",
    "中亚沙漏": "中娅沙漏",
    "魅惑": "魅惑妖术",
    "距破": "距破之舞",
    "巨破": "距破之舞",
    "巨破之舞": "距破之舞",
    "御风": "驭风而行",
    "灭世": "蔑视",
    "河道蟹": "迅捷蟹",
    "狮子狗": "雷恩加尔, 异兽猎手",
    "凤凰": "不朽凤凰",
    "玄龙": "辟心玄龙",
    "远古龙": "远古巨龙",
    "大厅": "废弃大厅",
    "妖姬": "诡术妖姬",
    "剑姬": "无双剑姬",
    "花朵": "占卜花朵",
    "贝壳": "占卜贝壳",
    "花康": "极速反制",
    "水手": "鬼祟的水手",
    "鼠人": "变异猫咪",
    "星芒凝辉": "星芒凝汇",
    "青王宁会": "星芒凝汇",
    "星芒尼会": "星芒凝汇",
    "精灵梦发": "精灵迸发",
    "精灵莫发": "精灵迸发",
    "诺言之境": "落岩之径",
    "落言之境": "落岩之径",
    "快快乐": "换换乐",
    "欢欢乐": "换换乐",
    "铲子": "临终仪式",
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
  const defaultArticleCardCorrections = {
    "巨破": "距破",
    "巨破之舞": "距破之舞",
    "灭世": "蔑视",
    "星芒凝辉": "星芒凝汇",
    "青王宁会": "星芒凝汇",
    "星芒尼会": "星芒凝汇",
    "精灵梦发": "精灵迸发",
    "精灵莫发": "精灵迸发",
    "诺言之境": "落岩之径",
    "落言之境": "落岩之径",
    "快快乐": "换换乐",
    "欢欢乐": "换换乐"
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

  function getFlatDeckCards(deck) {
    return [
      ...(deck.main || []).map((card) => ({ card, source: "main" })),
      ...(deck.side || []).map((card) => ({ card, source: "side" }))
    ].flatMap(({ card, source }) => {
      const rawCount = Number(getCardCount(card));
      const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.floor(rawCount) : 1;
      return Array.from({ length: count }, () => ({ card, source }));
    });
  }

  function renderTileCard(item) {
    const { card, source } = item;
    const name = getCardName(card);
    const image = getCardImage(card);
    const sourceHtml = source === "side" ? `<span class="deck-card-tile-badge">备</span>` : "";
    const imageHtml = image
      ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)} 卡图" loading="lazy">`
      : `<span class="deck-card-tile-empty" aria-hidden="true"></span>`;
    const previewAttrs = image
      ? ` data-card-image="${escapeHtml(image)}" data-card-name="${escapeHtml(name)}"`
      : "";
    return `
      <button class="deck-card-tile" type="button"${previewAttrs} aria-label="查看 ${escapeHtml(name)} 卡图">
        <span class="deck-card-tile-art">
          ${imageHtml}
          ${sourceHtml}
        </span>
        <span class="deck-card-tile-name">${escapeHtml(name)}</span>
      </button>
    `;
  }

  function renderTileDeck(deck) {
    const cards = getFlatDeckCards(deck);
    return cards.length > 0
      ? `<div class="deck-card-tile-grid">${cards.map((item) => renderTileCard(item)).join("")}</div>`
      : "<p>暂无平铺版牌表。</p>";
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
          <button class="deck-tab is-active" id="deckTabTile" type="button" role="tab" aria-selected="true" aria-controls="deckPanelTile" data-deck-tab="tile">平铺版</button>
          <button class="deck-tab" id="deckTabText" type="button" role="tab" aria-selected="false" aria-controls="deckPanelText" data-deck-tab="text">列表版</button>
          <button class="deck-tab" id="deckTabImage" type="button" role="tab" aria-selected="false" aria-controls="deckPanelImage" data-deck-tab="image">图片版</button>
        </div>
        <div class="deck-panel deck-tile-wrap" id="deckPanelTile" role="tabpanel" aria-labelledby="deckTabTile">
          <div id="deckTileList"></div>
        </div>
        <div class="deck-panel deck-text-wrap" id="deckPanelText" role="tabpanel" aria-labelledby="deckTabText" hidden>
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

  function normalizeToken(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "");
  }

  function getLegendaryCard(deck) {
    const cards = [...(deck?.main || []), ...(deck?.side || [])];
    return (
      cards.find((card) => getCardMeta(card).startsWith("传奇") && getCardImage(card)) ||
      cards.find((card) => getCardImage(card)) ||
      null
    );
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

  function createMobileFloatingButton() {
    const button = document.createElement("button");
    button.className = "deck-floating-button";
    button.type = "button";
    button.hidden = true;
    document.body.append(button);
    return button;
  }

  function renderFloatingCard(deck, card, className) {
    const image = getCardImage(card);
    if (!image) return "";
    const cardName = getCardName(card) || getDeckLabel(deck);
    return `
      <span class="deck-floating-card ${className}">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(cardName)}">
      </span>
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

  function getCorrectedCardLinkText(corrections, alias, card) {
    const corrected = corrections[alias];
    if (corrected === true) return card.name;
    return typeof corrected === "string" ? corrected : "";
  }

  function applyConfiguredCardAliases(index, aliases = {}, corrections = {}) {
    Object.entries(aliases).forEach(([alias, target]) => {
      if (!alias) return;
      if (typeof target === "string") {
        const card = index.get(target);
        if (card && !index.has(alias)) {
          const correctedText = getCorrectedCardLinkText(corrections, alias, card);
          index.set(alias, correctedText ? { ...card, displayText: correctedText } : card);
        }
        return;
      }
      if (target?.image) {
        const card = {
          name: target.name || alias,
          image: target.image
        };
        const correctedText = target.displayText || getCorrectedCardLinkText(corrections, alias, card);
        index.set(alias, {
          ...card,
          ...(correctedText ? { displayText: correctedText } : {})
        });
      }
    });
  }

  function buildArticleCardIndex(decks, config = {}) {
    const index = new Map();
    const excluded = new Set(config.exclude || []);
    const corrections = {
      ...defaultArticleCardCorrections,
      ...(config.corrections || {}),
      ...(config.correctedAliases || {})
    };
    decks.forEach((deck) => {
      [...(deck.main || []), ...(deck.side || [])].forEach((card) => {
        getCardAliasTerms(card, config)
          .filter((term) => !excluded.has(term))
          .forEach((term) => addCardLinkTerm(index, term, card));
      });
    });
    applyConfiguredCardAliases(index, { ...defaultArticleCardAliases, ...(config.aliases || {}) }, corrections);

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

  function createArticleCardTrigger(node, term, card) {
    const isInsideButton = Boolean(node.parentElement?.closest("button,[role='button']"));
    const trigger = document.createElement(isInsideButton ? "b" : "a");
    trigger.className = `${articleCardLinkClass} article-card-link`;
    if (isInsideButton) {
      trigger.setAttribute("role", "link");
      trigger.tabIndex = 0;
    } else {
      trigger.href = card.image;
      trigger.target = "_blank";
      trigger.rel = "noreferrer";
    }
    trigger.dataset.cardImage = card.image;
    trigger.dataset.cardName = card.name;
    trigger.setAttribute("aria-label", `查看 ${card.name} 卡图`);
    if (card.displayText && card.displayText !== term) {
      trigger.dataset.cardMatchedText = term;
      trigger.dataset.cardCorrectedText = card.displayText;
      trigger.title = `${term} -> ${card.displayText}`;
    }
    trigger.textContent = card.displayText || term;
    return trigger;
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
      fragment.append(createArticleCardTrigger(node, term, card));
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
      articleCardLinkSelector,
      "script",
      "style",
      "textarea",
      "input",
      "select",
      "option",
      "[role='tab']",
      "[role='tablist']",
      ".perspective-tab",
      ".perspective-switch",
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
      if (!trigger?.dataset.cardImage || event?.pointerType === "touch") return;
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
      event.stopPropagation();
      openCardImage(trigger);
    }, true);

    root.addEventListener("keydown", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (!trigger || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      openCardImage(trigger);
    }, true);

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
    const perspectiveDecks = options.perspectiveDecks || options.perspectiveDeckMap || {};
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
    const tilePanel = modal.querySelector("#deckPanelTile");
    const textList = modal.querySelector("#deckTextList");
    const tileList = modal.querySelector("#deckTileList");
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
    const mobileFloatingButton = options.mobileFloatingButton === false
      ? null
      : document.querySelector(options.mobileFloatingSelector || ".deck-floating-button") || createMobileFloatingButton();
    const backtopButton = document.querySelector(options.backtopSelector || ".backtop");
    const articleCardRoot = linkArticleCardNames(getArticleCardConfig(options), decks);

    function getPerspectiveNames() {
      const names = [];
      document.querySelectorAll("[data-perspective-target]").forEach((tab) => {
        const name = tab.dataset.perspectiveTarget;
        if (name && !names.includes(name)) names.push(name);
      });
      return names;
    }

    function getActivePerspectiveName() {
      return (
        [...document.querySelectorAll("[data-perspective-target]")]
          .find((tab) => tab.classList.contains("active") || tab.getAttribute("aria-selected") === "true")
          ?.dataset.perspectiveTarget || ""
      );
    }

    function getConfiguredPerspectiveDeck(perspective) {
      const configured = perspectiveDecks[perspective];
      if (!configured) return null;
      if (typeof configured === "string") return deckByKey.get(configured) || null;
      if (configured.key) return deckByKey.get(String(configured.key)) || configured;
      return null;
    }

    function getDeckSearchText(deck) {
      return [
        deck.key,
        deck.title,
        deck.buttonLabel,
        deck.deckName,
        deck.deckCategory,
        deck.player
      ].map(normalizeToken).filter(Boolean).join(" ");
    }

    function findDeckByPerspective(perspective) {
      const configuredDeck = getConfiguredPerspectiveDeck(perspective);
      if (configuredDeck) return configuredDeck;

      const needle = normalizeToken(perspective);
      if (!needle) return null;
      return decks.find((deck) => getDeckSearchText(deck).includes(needle)) || null;
    }

    function getDeckForPerspective(perspective) {
      const directDeck = findDeckByPerspective(perspective);
      if (directDeck) return directDeck;

      const perspectiveNames = getPerspectiveNames();
      if (decks.length === 2 && perspectiveNames.length === 2) {
        const otherMatchedDecks = perspectiveNames
          .filter((name) => name !== perspective)
          .map((name) => findDeckByPerspective(name))
          .filter(Boolean);
        const unmatchedDeck = decks.find((deck) => !otherMatchedDecks.includes(deck));
        if (unmatchedDeck) return unmatchedDeck;
      }

      const perspectiveIndex = perspectiveNames.indexOf(perspective);
      return decks[perspectiveIndex] || decks[0] || null;
    }

    function getOrderedPerspectiveDecks() {
      const orderedDecks = [];
      getPerspectiveNames().forEach((perspective) => {
        const deck = getDeckForPerspective(perspective);
        if (deck && !orderedDecks.includes(deck)) orderedDecks.push(deck);
      });
      decks.forEach((deck) => {
        if (!orderedDecks.includes(deck)) orderedDecks.push(deck);
      });
      return orderedDecks;
    }

    function getFloatingDeckState() {
      const currentDeck = getDeckForPerspective(getActivePerspectiveName()) || decks[0];
      return {
        currentDeck,
        orderedDecks: getOrderedPerspectiveDecks().slice(0, 2)
      };
    }

    renderDeckSwitcher(deckSwitcher, getOrderedPerspectiveDecks());

    function isBacktopVisible() {
      if (!backtopButton) return true;
      return !backtopButton.hidden && window.getComputedStyle(backtopButton).display !== "none";
    }

    function updateMobileFloatingButton() {
      if (!mobileFloatingButton) return;
      const { currentDeck, orderedDecks } = getFloatingDeckState();
      const currentCard = getLegendaryCard(currentDeck);
      if (!currentDeck || !currentCard || !isBacktopVisible()) {
        mobileFloatingButton.hidden = true;
        return;
      }

      const floatingCards = orderedDecks.map((deck, index) => {
        const card = getLegendaryCard(deck);
        if (!card) return "";
        const slotClass = index === 0 ? "deck-floating-card-left" : "deck-floating-card-right";
        const activeClass = deck === currentDeck ? "is-active" : "is-inactive";
        return renderFloatingCard(deck, card, `${slotClass} ${activeClass}`);
      }).join("");

      mobileFloatingButton.dataset.deckKey = currentDeck.key;
      mobileFloatingButton.setAttribute("aria-label", `查看${getDeckLabel(currentDeck)}`);
      mobileFloatingButton.innerHTML = `
        <span class="deck-floating-cards" aria-hidden="true">
          ${floatingCards}
        </span>
        <span class="deck-floating-label">查看牌表</span>
      `;
      mobileFloatingButton.hidden = false;
    }

    function scheduleMobileFloatingUpdate() {
      window.requestAnimationFrame(updateMobileFloatingButton);
    }

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

    function renderActiveTileDeck() {
      if (!tileList) return;
      tileList.innerHTML = activeDeck ? renderTileDeck(activeDeck) : "<p>暂无平铺版牌表。</p>";
    }

    function setDeckTab(tabName) {
      if (tabName === "image" && activeDeck && !activeDeck.image) {
        tabName = "text";
      }
      if ((tabName === "text" || tabName === "tile") && activeDeck && !hasTextDeck(activeDeck) && activeDeck.image) {
        tabName = "image";
      }
      const isText = tabName === "text";
      const isTile = tabName === "tile";
      tabs.forEach((tab) => {
        const active = tab.dataset.deckTab === tabName;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.hidden = tab.dataset.deckTab === "image" && activeDeck && !activeDeck.image;
        if ((tab.dataset.deckTab === "text" || tab.dataset.deckTab === "tile") && activeDeck && !hasTextDeck(activeDeck)) {
          tab.hidden = true;
        }
      });
      if (imagePanel) imagePanel.hidden = isText || isTile;
      if (textPanel) textPanel.hidden = !isText;
      if (tilePanel) tilePanel.hidden = !isTile;
      if (isText) renderTextDeck();
      if (isTile) renderActiveTileDeck();
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
      renderActiveTileDeck();
      setDeckTab(preferredTab || (hasTextDeck(activeDeck) ? "tile" : "image"));
      updateDeckSwitcher(deckSwitcher, activeDeck);
      if (textPanel) textPanel.scrollTop = 0;
      if (tilePanel) tilePanel.scrollTop = 0;
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
      if (!trigger?.dataset.cardImage || event?.pointerType === "touch") return;
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

    function openDeckByKey(deckKey, trigger) {
      activeDeck = deckByKey.get(String(deckKey));
      if (!activeDeck || !modal) return;
      lastTrigger = trigger || null;
      renderActiveDeck(hasTextDeck(activeDeck) ? "tile" : "image");
      modal.hidden = false;
      document.body.classList.add("deck-modal-open");
      closeButton?.focus();
    }

    function openDeck(button) {
      openDeckByKey(button.dataset.deckKey, button);
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

    mobileFloatingButton?.addEventListener("click", () => {
      openDeckByKey(mobileFloatingButton.dataset.deckKey, mobileFloatingButton);
    });

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setDeckTab(tab.dataset.deckTab || "image"));
    });

    document.querySelectorAll("[data-perspective-target]").forEach((tab) => {
      tab.addEventListener("click", scheduleMobileFloatingUpdate);
    });

    if (window.MutationObserver) {
      const perspectiveObserver = new MutationObserver(scheduleMobileFloatingUpdate);
      document.querySelectorAll("[data-perspective-target]").forEach((tab) => {
        perspectiveObserver.observe(tab, {
          attributes: true,
          attributeFilter: ["class", "aria-selected"]
        });
      });
      if (backtopButton) {
        perspectiveObserver.observe(backtopButton, {
          attributes: true,
          attributeFilter: ["hidden"]
        });
      }
    }

    updateMobileFloatingButton();
    window.addEventListener("hashchange", scheduleMobileFloatingUpdate);
    window.addEventListener("popstate", scheduleMobileFloatingUpdate);
    window.addEventListener("load", scheduleMobileFloatingUpdate);

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

    tileList?.addEventListener("pointerover", (event) => {
      const trigger = event.target.closest(".deck-card-tile");
      if (!trigger || trigger === activePreviewTrigger) return;
      showHoverPreview(trigger, event);
    });

    tileList?.addEventListener("pointermove", (event) => {
      const trigger = event.target.closest(".deck-card-tile");
      if (trigger && trigger === activePreviewTrigger) {
        positionHoverPreview(event, trigger);
      }
    });

    tileList?.addEventListener("pointerout", (event) => {
      const trigger = event.target.closest(".deck-card-tile");
      if (trigger && !trigger.contains(event.relatedTarget)) {
        hideHoverPreview();
      }
    });

    tileList?.addEventListener("focusin", (event) => {
      const trigger = event.target.closest(".deck-card-tile");
      if (trigger) showHoverPreview(trigger);
    });

    tileList?.addEventListener("focusout", (event) => {
      const trigger = event.target.closest(".deck-card-tile");
      if (trigger) hideHoverPreview();
    });

    tileList?.addEventListener("click", (event) => {
      const trigger = event.target.closest(".deck-card-tile");
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
      event.stopPropagation();
      openCardImage(trigger);
    }, true);

    articleCardRoot?.addEventListener("keydown", (event) => {
      const trigger = event.target.closest(articleCardLinkSelector);
      if (!trigger || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      openCardImage(trigger);
    }, true);

    textPanel?.addEventListener("scroll", hideHoverPreview, { passive: true });
    tilePanel?.addEventListener("scroll", hideHoverPreview, { passive: true });

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
