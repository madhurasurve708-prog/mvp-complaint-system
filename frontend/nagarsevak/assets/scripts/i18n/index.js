// Reusable i18n engine.
// Loads translation dictionaries and applies them to the DOM.
// To add a new language, drop a new dictionary file (e.g. hi.js) into this folder
// and register it below. No consumer code needs to change.
import mr from "./mr.js";
import en from "./en.js";

const dictionaries = { mr, en };
let currentLang = "mr";

export function setLanguage(lang) {
  if (!dictionaries[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang === "mr" ? "mr" : "en";
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  const dict = dictionaries[currentLang] || dictionaries.mr;
  return dict[key] || dictionaries.mr[key] || key;
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  root.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
}

export { mr, en };
