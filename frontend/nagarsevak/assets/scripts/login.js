// Login page: language switch + login form.
import { applyTranslations, setLanguage, getLanguage } from "./i18n/index.js";
import { injectTemplate, state, emit } from "./shared.js";
import { showToast } from "./toast.js";

let _container = null;
const API = "https://seva-setu-complaint-app.onrender.com/";

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
  const nameInput = document.getElementById("representativeName");
  const mobileInput = document.getElementById("representativeMobile");
  const wardSelect = document.getElementById("wardSelect");
  const passwordInput = document.getElementById("password");

  mobileInput.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const identifier = mobileInput.value.trim() || nameInput.value.trim();
      const response = await fetch(`${API}/nagarsevaks/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password: passwordInput.value,
          ward_id: wardSelect.value
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Login failed");

      state.repId = data.nagarsevak.id;
      state.selectedWard = String(data.nagarsevak.ward_id);
      state.repName = data.nagarsevak.name;
      state.repMobile = data.nagarsevak.mobile_number || "";
      emit("login:success");
    } catch (error) {
      showToast(error.message || "Login failed");
    }
  });
}
