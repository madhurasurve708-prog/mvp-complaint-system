// Login page: language switch + login form.
import { applyTranslations, setLanguage, getLanguage } from "./i18n/index.js";
import { injectTemplate, state, emit } from "./shared.js";

let _container = null;

export async function init() {
  _container = document.getElementById("loginContainer");
  await injectTemplate("login", _container);
  applyTranslations(_container);
  wireLanguageSwitch();
  wireForm();
}

function wireLanguageSwitch() {
  _container.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
      applyTranslations(document);
      emit("language:change", { lang: getLanguage() });
    });
  });
}

function wireForm() {
  const form = document.getElementById("loginForm");
  const wardSelect = document.getElementById("wardSelect");
  const nameInput = document.getElementById("representativeName");
  const mobileInput = document.getElementById("representativeMobile");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.selectedWard = wardSelect.value;
    state.repName = nameInput.value.trim();
    state.repMobile = mobileInput.value.trim();
    emit("login:success");
  });
}
