import { icon } from "../../../../shared/ui/icons.js";
import { escapeHtml } from "../../../../shared/utils/html.js";

export function renderGuidePanel(state) {
  if (!state.guideOpen) {
    return `
      <button class="guide-launch" type="button" data-action="open-guide" aria-label="Open guide">
        ${icon("bookmark")}
      </button>
    `;
  }

  const journeys = [
    ["Startup", "startup"],
    ["Ecommerce", "ecommerce"],
    ["Agency", "agency"],
    ["More", "more"],
  ];
  const items = [
    ["Send money to contractors", "card", "payments"],
    ["Invite your team members", "users", "settings"],
    ["Create cards for your team", "card", "cards"],
    ["Request vendor payment details", "doc", "payments"],
    ["Issue SAFE to investors", "command", "capital"],
  ];

  return `
    <aside class="guide-panel">
      <div class="guide-head">
        <strong>Try out Mercury for yourself</strong>
        <button type="button" data-action="close-guide">${icon("arrowDown")}</button>
      </div>
      <div class="journey-tabs">
        ${journeys.map(([label, value]) => `
          <button class="${state.activeJourney === value ? "is-active" : ""}" type="button" data-journey="${escapeHtml(value)}">${escapeHtml(label)}</button>
        `).join("")}
      </div>
      <div class="guide-list">
        ${items.map(([label, iconName, route]) => `
          <button type="button" data-action="guide-item" data-route="${escapeHtml(route)}">
            <span>${icon(iconName)}${escapeHtml(label)}</span>
            <em>&rsaquo;</em>
          </button>
        `).join("")}
      </div>
      <button class="guide-close" type="button" data-action="close-guide" aria-label="Close guide">${icon("close")}</button>
    </aside>
  `;
}
