(() => {
  if (window.feedbackWidgetLoaded) return;
  window.feedbackWidgetLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    .feedback-fab {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 30;
      appearance: none;
      border: 0;
      border-radius: 999px;
      background: var(--red, #9f3d36);
      color: #fff;
      cursor: pointer;
      font: inherit;
      font-weight: 800;
      line-height: 1;
      padding: 12px 16px;
      box-shadow: var(--shadow, 0 18px 54px rgba(25, 39, 31, 0.1));
    }

    .feedback-fab:hover,
    .feedback-fab:focus {
      background: #7f2d28;
      outline: none;
    }

    .feedback-modal[hidden] {
      display: none;
    }

    .feedback-modal {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: grid;
      place-items: center;
      padding: 20px;
      background: rgba(8, 18, 13, 0.52);
    }

    .feedback-dialog {
      width: min(520px, 100%);
      border-radius: var(--radius, 8px);
      background: var(--paper, #fff);
      box-shadow: 0 28px 90px rgba(8, 18, 13, 0.28);
      overflow: hidden;
    }

    .feedback-head {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 18px;
      padding: 20px 22px 14px;
      border-bottom: 1px solid var(--line, #dfe7dd);
    }

    .feedback-head h2 {
      color: var(--green-dark, #16402c);
      font-size: 24px;
      line-height: 1.18;
      margin: 0;
    }

    .feedback-close {
      appearance: none;
      border: 1px solid var(--line, #dfe7dd);
      border-radius: 50%;
      background: var(--paper-soft, #fbfcf8);
      color: var(--muted, #5f6b63);
      cursor: pointer;
      font: inherit;
      font-size: 22px;
      line-height: 1;
      width: 34px;
      height: 34px;
    }

    .feedback-close:hover,
    .feedback-close:focus {
      color: var(--green-dark, #16402c);
      border-color: var(--green, #2f6f4e);
      outline: none;
    }

    .feedback-form {
      display: grid;
      gap: 14px;
      padding: 18px 22px 22px;
    }

    .feedback-field {
      display: grid;
      gap: 7px;
      color: var(--green-dark, #16402c);
      font-weight: 800;
    }

    .feedback-field span {
      font-size: 14px;
    }

    .feedback-field .optional {
      color: var(--muted, #5f6b63);
      font-size: 12px;
      font-weight: 700;
    }

    .feedback-field textarea,
    .feedback-field input {
      width: 100%;
      border: 1px solid var(--line, #dfe7dd);
      border-radius: 7px;
      background: var(--paper-soft, #fbfcf8);
      color: var(--ink, #18201b);
      font: inherit;
      line-height: 1.55;
      padding: 11px 12px;
    }

    .feedback-field textarea {
      min-height: 150px;
      resize: vertical;
    }

    .feedback-field textarea:focus,
    .feedback-field input:focus {
      border-color: var(--green, #2f6f4e);
      outline: 3px solid rgba(47, 111, 78, 0.14);
    }

    .feedback-type-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 2px 0;
    }

    .feedback-type-tab {
      appearance: none;
      border: 1px solid var(--line, #dfe7dd);
      border-radius: 999px;
      background: var(--paper-soft, #fbfcf8);
      color: var(--muted, #5f6b63);
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
      padding: 9px 12px;
    }

    .feedback-type-tab:hover,
    .feedback-type-tab:focus {
      border-color: var(--green, #2f6f4e);
      color: var(--green-dark, #16402c);
      outline: none;
    }

    .feedback-type-tab.active {
      border-color: var(--green-dark, #16402c);
      background: var(--green-dark, #16402c);
      color: #fff;
    }

    .feedback-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-top: 2px;
    }

    .feedback-status {
      min-height: 22px;
      color: var(--muted, #5f6b63);
      font-size: 14px;
    }

    .feedback-submit {
      appearance: none;
      border: 0;
      border-radius: 7px;
      background: var(--green-dark, #16402c);
      color: #fff;
      cursor: pointer;
      font: inherit;
      font-weight: 800;
      line-height: 1;
      padding: 12px 16px;
      white-space: nowrap;
    }

    .feedback-submit:hover,
    .feedback-submit:focus {
      background: var(--green, #2f6f4e);
      outline: none;
    }

    .feedback-submit:disabled {
      cursor: wait;
      opacity: 0.7;
    }

    @media (max-width: 560px) {
      .feedback-actions {
        align-items: stretch;
        flex-direction: column;
      }

      .feedback-submit {
        width: 100%;
      }
    }
  `;

  const markup = document.createElement("div");
  markup.innerHTML = `
    <button class="feedback-fab" id="feedbackOpen" type="button">我要吐槽</button>

    <div class="feedback-modal" id="feedbackModal" hidden>
      <div class="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
        <div class="feedback-head">
          <div>
            <h2 id="feedbackTitle">我要吐槽</h2>
          </div>
          <button class="feedback-close" id="feedbackClose" type="button" aria-label="关闭反馈窗口">×</button>
        </div>
        <form class="feedback-form" id="feedbackForm">
          <div class="feedback-field">
            <span>反馈类型 <span class="optional">（选填）</span></span>
            <input id="feedbackType" name="type" type="hidden">
            <div class="feedback-type-tabs" role="group" aria-label="反馈类型">
              <button class="feedback-type-tab" type="button" data-feedback-type="功能建议" aria-pressed="false">功能建议</button>
              <button class="feedback-type-tab" type="button" data-feedback-type="bug/报错" aria-pressed="false">bug/报错</button>
              <button class="feedback-type-tab" type="button" data-feedback-type="其他" aria-pressed="false">其他</button>
            </div>
          </div>
          <label class="feedback-field">
            <span>吐槽内容</span>
            <textarea id="feedbackMessage" name="message" maxlength="4000" required placeholder="你遇到了什么问题？有任何建议？"></textarea>
          </label>
          <label class="feedback-field">
            <span>联系方式 <span class="optional">（选填）</span></span>
            <input id="feedbackContact" name="contact" maxlength="200" placeholder="微信、飞书、邮箱都行">
          </label>
          <div class="feedback-actions">
            <div class="feedback-status" id="feedbackStatus" role="status" aria-live="polite"></div>
            <button class="feedback-submit" id="feedbackSubmit" type="submit">提交反馈</button>
          </div>
        </form>
      </div>
    </div>
  `;

  function mount() {
    if (!document.head.querySelector("[data-feedback-widget-style]")) {
      style.setAttribute("data-feedback-widget-style", "");
      document.head.appendChild(style);
    }

    if (!document.querySelector("#feedbackOpen")) {
      document.body.append(...markup.children);
    }

    const openButton = document.querySelector("#feedbackOpen");
    const modal = document.querySelector("#feedbackModal");
    const closeButton = document.querySelector("#feedbackClose");
    const form = document.querySelector("#feedbackForm");
    const type = document.querySelector("#feedbackType");
    const typeTabs = [...document.querySelectorAll(".feedback-type-tab")];
    const message = document.querySelector("#feedbackMessage");
    const contact = document.querySelector("#feedbackContact");
    const status = document.querySelector("#feedbackStatus");
    const submit = document.querySelector("#feedbackSubmit");

    function openModal() {
      modal.hidden = false;
      status.textContent = "";
      window.setTimeout(() => message.focus(), 0);
    }

    function closeModal() {
      modal.hidden = true;
      openButton.focus();
    }

    function setFeedbackType(nextType) {
      const selected = type.value === nextType ? "" : nextType;
      type.value = selected;

      typeTabs.forEach((tab) => {
        const isActive = tab.dataset.feedbackType === selected;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
      });
    }

    openButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    typeTabs.forEach((tab) => {
      tab.addEventListener("click", () => setFeedbackType(tab.dataset.feedbackType));
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const text = message.value.trim();
      if (!text) {
        status.textContent = "先写点内容再提交。";
        message.focus();
        return;
      }

      submit.disabled = true;
      status.textContent = "正在提交...";

      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: type.value,
            message: text,
            contact: contact.value.trim(),
            pageUrl: window.location.href
          })
        });

        if (!response.ok) throw new Error("submit_failed");

        form.reset();
        setFeedbackType("");
        status.textContent = "已收到，我会看。";
        window.setTimeout(closeModal, 900);
      } catch (error) {
        status.textContent = "提交失败，稍后再试。";
      } finally {
        submit.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
