// Profile page: shows the representative's name, ward, and contact details.
import { applyTranslations } from "./i18n/index.js";
import { state, wardLabel } from "./shared.js";

let _container = null;

const DEFAULT_AVATAR = "N";

function initialsOf(name) {
  if (!name) return DEFAULT_AVATAR;
  const trimmed = String(name).trim();
  if (!trimmed) return DEFAULT_AVATAR;
  // Use the first character of the first word (handles Devanagari and Latin names).
  return trimmed.charAt(0).toUpperCase();
}

function joinLabel() {
  // Fallback joined date when the state does not carry a real value.
  const stored = state.repJoined;
  if (stored) return stored;
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "short" });
  return `${month} ${now.getFullYear()}`;
}

export function init(container) {
  _container = container;
}

export function render(container = _container) {
  if (!container) return;
  applyTranslations(container);

  const name = state.repName || "Nagarsevak";
  const role = `${wardLabel()} Nagarsevak`;
  const mobile = state.repMobile || "9876543210";
  const email = state.repEmail || `${name.toLowerCase().replace(/\s+/g, ".")}@sevak.gov.in`;
  const joined = joinLabel();
  const status = state.repStatus || "Active";

  container.querySelector("#profilePanelName").textContent = name;
  container.querySelector("#profilePanelWard").textContent = role;
  container.querySelector("#profilePanelRole").textContent = role;
  container.querySelector("#profilePanelMobile").textContent = mobile;
  container.querySelector("#profilePanelEmail").textContent = email;
  container.querySelector("#profilePanelJoined").textContent = joined;
  container.querySelector("#profilePanelStatus").textContent = status;
  container.querySelector("#bigAvatar").textContent = initialsOf(name);
}
