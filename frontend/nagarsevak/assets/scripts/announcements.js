// Announcements page: form to send announcements and the recent announcements list.
import { applyTranslations, t } from "./i18n/index.js";
import { showToast } from "./toast.js";

let _container = null;

export function init(container) {
  _container = container;
  applyTranslations(container);

  container.querySelector("#sendAnnouncementButton").addEventListener("click", () => {
    showToast(t("announcementSent"));
  });
}

export function render(container = _container) {
  if (!container) return;
  applyTranslations(container);

  container.querySelector("#announcementList").innerHTML = `
    <div><i class="fa-solid fa-broom"></i><span>${t("announceOne")}</span></div>
    <div><i class="fa-solid fa-droplet"></i><span>${t("announceTwo")}</span></div>
    <div><i class="fa-solid fa-road"></i><span>${t("announceThree")}</span></div>
  `;
}
