// Main entry point.
// 1. Loads the login page.
// 2. Listens for login:success -> loads the dashboard page.
// 3. The dashboard page handles sidebar, topbar, view loading, and bus events.
import { setLanguage } from "./i18n/index.js";
import { injectTemplate, on } from "./shared.js";
import { init as initLogin } from "./login.js";
import { init as initDashboard } from "./dashboard.js";

async function bootstrap() {
  // Default language: Marathi (matches original behavior)
  setLanguage("mr");

  // Load toast (needed by login + dashboard)
  await injectTemplate("toast", document.getElementById("toastContainer"));

  // Load login page
  await initLogin();

  // After login: swap the login container for the dashboard container
  on("login:success", async () => {
    const loginContainer = document.getElementById("loginContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    loginContainer.hidden = true;
    dashboardContainer.hidden = false;
    await injectTemplate("dashboard", dashboardContainer);
    await initDashboard();
  });
}

bootstrap().catch((err) => console.error("Bootstrap failed", err));
