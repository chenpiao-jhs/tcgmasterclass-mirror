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
    const reversedRows = [...rows].reverse();
    dailyRows.innerHTML = reversedRows.map((row) => `
      <tr>
        <td>${row.date}</td>
        <td>${formatNumber(row.pageViews)}</td>
        <td>${formatNumber(row.uniqueVisitors)}</td>
        <td>${formatNumber(row.uniqueIpHashes)}</td>
      </tr>
    `).join("");
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
  loadAnalytics();
  scheduleRefresh();
})();
