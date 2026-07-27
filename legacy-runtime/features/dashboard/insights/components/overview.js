import { icon } from "../../../../shared/ui/icons.js";
import { escapeHtml } from "../../../../shared/utils/html.js";

export function renderPageHeader() {
  return `
    <header class="insights-head">
      <h1>Insights</h1>
      <button class="bookmark-toggle" type="button" data-action="bookmark" aria-label="Remove from bookmarks">${icon("bookmark")}</button>
      <button class="feedback-button" type="button" data-action="feedback">${icon("feedback")}<span>Share feedback</span></button>
    </header>
  `;
}

export function renderControls(data, state) {
  const activeRange = data.rangeWindows[state.rangeIndex] || data.rangeWindows[data.rangeWindows.length - 1];
  return `
    <section class="insights-controls" aria-label="Insights controls">
      <div class="view-tabs" role="tablist" aria-label="Insights views">
        ${data.tabs.map((tab) => `
          <button class="${state.activeTab === tab.id ? "is-active" : ""}" type="button" role="tab" aria-selected="${state.activeTab === tab.id}" data-tab="${escapeHtml(tab.id)}">
            ${escapeHtml(tab.label)}
          </button>
        `).join("")}
      </div>
      <button class="round-menu" type="button" data-action="more" aria-label="More options">${icon("dotMenu")}</button>
      <div class="date-tools">
        <button class="date-button" type="button" data-action="date-range">${icon("calendar")}<span>${escapeHtml(activeRange.buttonLabel)}</span>${icon("arrowDown")}</button>
        <button class="date-button is-disabled" type="button" data-action="compare" aria-disabled="true">${icon("calendar")}<span>Compare to</span>${icon("arrowDown")}</button>
      </div>
    </section>
  `;
}

export function renderTimeline(months, ranges, activeRangeIndex) {
  const activeRange = ranges[activeRangeIndex] || ranges[ranges.length - 1];
  return `
    <section class="range-track" aria-label="Selected insight period" data-range-track>
      <div class="month-row">
        ${months.map((month, index) => `
          <span class="${index === 8 ? "year-turn" : ""}">
            ${index === 8 ? `<em>2026</em>` : ""}
            ${escapeHtml(month)}
          </span>
        `).join("")}
      </div>
      <div class="minor-ticks" aria-hidden="true"></div>
      <div class="range-selection" style="--range-left: ${activeRange.left}%; --range-width: ${activeRange.width}%;" data-range-selection>
        <span>${escapeHtml(activeRange.label)}</span>
      </div>
      <input class="range-drag-input" type="range" min="0" max="${ranges.length - 1}" step="1" value="${activeRangeIndex}" aria-label="Adjust insight date range" data-range-slider />
    </section>
  `;
}

export function renderMetrics(metrics) {
  return `
    <section class="insight-metrics" aria-label="Cashflow summary">
      ${metrics.map((metric) => `
        <article class="${metric.featured ? "is-featured" : ""}">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
        </article>
      `).join("")}
      <button class="period-select" type="button" data-action="period">Month ${icon("arrowDown")}</button>
    </section>
  `;
}

const chartFrames = {
  early: {
    bars: `
      <rect class="cash-bar negative" x="210" y="210" width="76" height="18" />
      <rect class="cash-bar negative" x="380" y="214" width="78" height="48" />
      <rect class="cash-bar positive" x="552" y="188" width="78" height="34" />
      <rect class="cash-bar negative tall" x="724" y="210" width="78" height="58" />
    `,
    inLine: "M248 210 L420 226 L592 202 L764 218",
    outLine: "M248 214 L420 242 L592 224 L764 250",
    points: [[248, 210], [420, 226], [592, 202], [764, 218]],
  },
  spring: {
    bars: `
      <rect class="cash-bar negative" x="210" y="214" width="76" height="10" />
      <rect class="cash-bar positive" x="380" y="172" width="78" height="64" />
      <rect class="cash-bar positive" x="552" y="126" width="78" height="118" />
      <rect class="cash-bar negative tall" x="724" y="210" width="78" height="72" />
    `,
    inLine: "M248 214 L420 184 L592 146 L764 162",
    outLine: "M248 216 L420 226 L592 208 L764 242",
    points: [[248, 214], [420, 184], [592, 146], [764, 162]],
  },
  current: {
    bars: `
      <rect class="cash-bar negative" x="210" y="214" width="76" height="10" />
      <rect class="cash-bar negative" x="380" y="210" width="78" height="34" />
      <rect class="cash-bar positive" x="552" y="194" width="78" height="44" />
      <rect class="cash-bar positive" x="724" y="30" width="78" height="226" />
      <rect class="cash-bar negative tall" x="724" y="210" width="78" height="86" />
    `,
    inLine: "M248 214 L420 224 L592 222 L764 78",
    outLine: "M248 214 L420 224 L592 220",
    points: [[248, 214], [420, 224], [592, 222], [764, 78]],
  },
};

export function renderChart(range) {
  const frame = chartFrames[range.id] || chartFrames.current;
  return `
    <section class="chart-panel" aria-label="Net cashflow chart" data-chart-range="${escapeHtml(range.id)}">
      <div class="chart-axis-labels" aria-hidden="true">
        <span>$2M</span>
        <span>$1.5M</span>
        <span>$1M</span>
        <span>$500K</span>
        <span>0</span>
        <span>-$500K</span>
        <span>-$1M</span>
      </div>
      <svg class="cashflow-chart" viewBox="0 0 920 360" preserveAspectRatio="none" role="img" aria-label="Monthly cashflow trend from February through May">
        <defs>
          <pattern id="insightDots" width="13" height="13" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r=".78" fill="#dfe3ed" stroke="none" />
          </pattern>
          <linearGradient id="positiveBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6373ff" stop-opacity=".34" />
            <stop offset="100%" stop-color="#6373ff" stop-opacity=".08" />
          </linearGradient>
          <linearGradient id="negativeBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#222736" stop-opacity=".06" />
            <stop offset="100%" stop-color="#222736" stop-opacity=".16" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="920" height="360" fill="url(#insightDots)" opacity=".62" stroke="none" />
        <g class="grid-lines">
          <line x1="0" x2="920" y1="66" y2="66" />
          <line x1="0" x2="920" y1="126" y2="126" />
          <line x1="0" x2="920" y1="186" y2="186" />
          <line x1="0" x2="920" y1="246" y2="246" />
          <line x1="0" x2="920" y1="306" y2="306" />
        </g>
        <line class="zero-line" x1="0" x2="920" y1="210" y2="210" />
        ${frame.bars}
        <path class="cash-line in" d="${frame.inLine}" />
        <path class="cash-line out" d="${frame.outLine}" />
        <g class="chart-points in">
          ${frame.points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" />`).join("")}
        </g>
      </svg>
      <div class="chart-months" aria-hidden="true">
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
      </div>
    </section>
  `;
}

export function renderTrendNotes(notes) {
  return `
    <section class="trend-panel" aria-label="Generated trend notes">
      ${notes.map((note) => `
        <article class="trend-note tone-${escapeHtml(note.tone)}">
          ${icon("sparkle")}
          <div>
            <h2>${escapeHtml(note.title)}</h2>
            <p>${escapeHtml(note.body)}</p>
          </div>
          <div class="note-actions">
            <button type="button" data-action="helpful" aria-label="Helpful">${icon("thumbsUp")}</button>
            <button type="button" data-action="not-helpful" aria-label="Not helpful">${icon("thumbsDown")}</button>
            <button type="button" data-action="copy-section" aria-label="Copy section">${icon("copy")}</button>
          </div>
        </article>
      `).join("")}
      <p>Trends are generated and may include inaccuracies.</p>
    </section>
  `;
}

function rowPercent(percent) {
  const value = Number(percent.replace("%", ""));
  return Math.max(3, Math.min(100, value));
}

export function renderBreakdownTable(dataset, activeOption, tone) {
  return `
    <section class="breakdown-card tone-${tone}">
      <header>
        <div>
          <span>${escapeHtml(dataset.title)}</span>
          <strong>${escapeHtml(dataset.total)}</strong>
        </div>
        <div class="group-control">
          <span>${escapeHtml(dataset.groupLabel)}</span>
          <div>
            ${dataset.options.map((option) => `
              <button class="${activeOption === option ? "is-active" : ""}" type="button" data-group="${tone}:${escapeHtml(option)}">${escapeHtml(option)}</button>
            `).join("")}
          </div>
        </div>
      </header>
      <table>
        <caption>Top ${escapeHtml(dataset.title)} table</caption>
        <thead>
          <tr>
            <th>${tone === "in" ? "Source" : "Recipient"}</th>
            <th>% of total</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${dataset.rows.map(([name, percent, amount]) => `
            <tr data-action="table-row">
              <td>${escapeHtml(name)}</td>
              <td><span class="bar-cell"><i style="--w: ${rowPercent(percent)}%"></i>${escapeHtml(percent)}</span></td>
              <td>${escapeHtml(amount)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}
