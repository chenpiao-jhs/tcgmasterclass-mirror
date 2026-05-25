(function () {
  const daysSelect = document.getElementById("daysSelect");
  const refreshButton = document.getElementById("refreshButton");
  const refreshStatus = document.getElementById("refreshStatus");
  const latestVisit = document.getElementById("latestVisit");
  const totalViews = document.getElementById("totalViews");
  const totalVisitors = document.getElementById("totalVisitors");
  const totalIps = document.getElementById("totalIps");
  const dailyRows = document.getElementById("dailyRows");
  const pageRows = document.getElementById("pageRows");
  const formatter = new Intl.NumberFormat("zh-CN");
  let refreshTimer = null;
  let expandedDates = new Set();
  let latestDailyRows = [];

  function formatNumber(value) {
    return formatter.format(value || 0);
  }

  function formatTime(value) {
    if (!value) {
      return "-";
    }
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(value));
  }

  function setStatus(text) {
    refreshStatus.textContent = text;
  }

  function renderDaily(rows) {
    latestDailyRows = rows;
    const reversedRows = [...rows].reverse();
    dailyRows.innerHTML = reversedRows.map((row) => renderDailyRow(row)).join("");
  }

  function renderDailyRow(row) {
    const isExpanded = expandedDates.has(row.date);
    const pageCount = row.pages ? row.pages.length : 0;
    const detailRow = isExpanded ? renderDailyDetailRow(row) : "";
    return `
      <tr class="daily-row ${isExpanded ? "expanded" : ""}" data-date="${row.date}" tabindex="0" aria-expanded="${isExpanded}">
        <td>
          <span class="expand-mark" aria-hidden="true">${isExpanded ? "-" : "+"}</span>
          <span>${row.date}</span>
          <span class="page-count">${pageCount} 页</span>
        </td>
        <td>${formatNumber(row.pageViews)}</td>
        <td>${formatNumber(row.uniqueVisitors)}</td>
        <td>${formatNumber(row.uniqueIpHashes)}</td>
      </tr>
      ${detailRow}
    `;
  }

  function renderDailyDetailRow(row) {
    if (!row.pages || !row.pages.length) {
      return `
        <tr class="daily-detail-row">
          <td colspan="4">
            <div class="daily-detail empty-state">这一天还没有页面访问数据。</div>
          </td>
        </tr>
      `;
    }

    const maxViews = Math.max(...row.pages.map((page) => page.pageViews), 1);
    const pageRowsHtml = row.pages.map((page) => {
      const width = Math.max(4, Math.round((page.pageViews / maxViews) * 100));
      return `
        <div class="daily-page-row">
          <div class="page-title">
            <strong>${page.title}</strong>
            <span>${page.pagePath}</span>
          </div>
          <div class="bar" aria-hidden="true"><span style="width: ${width}%"></span></div>
          <div class="page-number">${formatNumber(page.pageViews)} 次</div>
          <div class="page-number">${formatNumber(page.uniqueVisitors)} 人</div>
          <div class="page-number">${formatNumber(page.uniqueIpHashes)} IP</div>
        </div>
      `;
    }).join("");

    return `
      <tr class="daily-detail-row">
        <td colspan="4">
          <div class="daily-detail">
            ${pageRowsHtml}
          </div>
        </td>
      </tr>
    `;
  }

  function toggleDailyRow(date) {
    if (expandedDates.has(date)) {
      expandedDates.delete(date);
    } else {
      expandedDates.add(date);
    }
    renderDaily(latestDailyRows);
  }

  function renderPages(rows) {
    if (!rows.length) {
      pageRows.innerHTML = '<div class="empty-state">还没有页面访问数据。</div>';
      return;
    }

    const maxViews = Math.max(...rows.map((row) => row.pageViews), 1);
    pageRows.innerHTML = rows.map((row) => {
      const width = Math.max(4, Math.round((row.pageViews / maxViews) * 100));
      return `
        <div class="page-row">
          <div class="page-title">
            <strong>${row.title}</strong>
            <span>${row.pagePath}</span>
          </div>
          <div class="bar" aria-hidden="true"><span style="width: ${width}%"></span></div>
          <div class="page-number">${formatNumber(row.pageViews)} 次</div>
          <div class="page-number">${formatNumber(row.uniqueVisitors)} 人</div>
          <div class="page-number">${formatNumber(row.uniqueIpHashes)} IP</div>
        </div>
      `;
    }).join("");
  }

  async function loadAnalytics() {
    const days = daysSelect.value;
    setStatus("正在刷新...");
    refreshButton.disabled = true;
    try {
      const response = await fetch(`/api/analytics?days=${encodeURIComponent(days)}`, {
        headers: { "Accept": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      totalViews.textContent = formatNumber(data.summary.pageViews);
      totalVisitors.textContent = formatNumber(data.summary.uniqueVisitors);
      totalIps.textContent = formatNumber(data.summary.uniqueIpHashes);
      latestVisit.textContent = `最新访问：${formatTime(data.latestVisitAt)}`;
      renderDaily(data.daily);
      renderPages(data.pages);
      setStatus(`已更新：${formatTime(data.generatedAt)}，每 10 秒自动刷新`);
    } catch (error) {
      setStatus("加载失败，请稍后刷新");
    } finally {
      refreshButton.disabled = false;
    }
  }

  function scheduleRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    refreshTimer = setInterval(loadAnalytics, 10000);
  }

  refreshButton.addEventListener("click", loadAnalytics);
  daysSelect.addEventListener("change", loadAnalytics);
  dailyRows.addEventListener("click", (event) => {
    const row = event.target.closest(".daily-row");
    if (!row) {
      return;
    }
    toggleDailyRow(row.dataset.date);
  });
  dailyRows.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const row = event.target.closest(".daily-row");
    if (!row) {
      return;
    }
    event.preventDefault();
    toggleDailyRow(row.dataset.date);
  });
  loadAnalytics();
  scheduleRefresh();
})();
