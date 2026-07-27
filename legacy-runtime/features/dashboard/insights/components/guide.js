import { icon } from "../../../../shared/ui/icons.js";

export function renderGuideLauncher() {
  return `
    <button class="map-launch" type="button" data-action="guide" aria-label="Open guide">
      ${icon("map")}
    </button>
  `;
}
