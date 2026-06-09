const authView = document.getElementById("authView");
const dashboardView = document.getElementById("dashboardView");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const showLoginButton = document.getElementById("showLogin");
const showRegisterButton = document.getElementById("showRegister");
const welcomeText = document.getElementById("welcomeText");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const authTagline = document.getElementById("authTagline");
const togglePasswordButton = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const forgotPassword = document.getElementById("forgotPassword");
const mobileNumber = document.getElementById("mobileNumber");
const toast = document.getElementById("toast");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboardPanels = document.querySelectorAll(".dashboard-panel");
const viewLinks = document.querySelectorAll("[data-view-link]");
const settingsContent = document.getElementById("settingsContent");
const settingsMenuButtons = document.querySelectorAll("[data-settings-tab]");
const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackCount = document.getElementById("feedbackCount");
const feedbackStars = document.getElementById("feedbackStars");
const submitFeedback = document.getElementById("submitFeedback");

const OFFICIAL_LOGIN_URL = "nagarsevak.html";
const initialSettingsContent = settingsContent?.innerHTML ?? "";

const authCopy = {
  register: {
    title: "नागरिक नोंदणी",
    welcome: "आपले स्वागत आहे!",
    subtitle: "पुढे जाण्यासाठी कृपया लॉगिन करा",
    tagline: "आपला आवाज, चांगल्या मालवणासाठी आपली कृती."
  },
  login: {
    title: "नागरिक लॉगिन",
    welcome: "पुन्हा स्वागत आहे!",
    subtitle: "पुढे जाण्यासाठी कृपया लॉगिन करा",
    tagline: "तुमचा आवाज, चांगल्या मालवणासाठी आमची कृती."
  }
};

function switchAuthMode(mode) {
  const isLogin = mode === "login";
  const copy = authCopy[mode];

  registerForm.classList.toggle("is-active", !isLogin);
  loginForm.classList.toggle("is-active", isLogin);
  welcomeText.textContent = copy.welcome;
  formTitle.textContent = copy.title;
  formSubtitle.textContent = copy.subtitle;
  authTagline.textContent = copy.tagline;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function showDashboard() {
  authView.hidden = true;
  dashboardView.hidden = false;
  showDashboardPanel("home");
  document.title = "सेवा सेतू | मुख्यपृष्ठ";
  window.location.hash = "dashboard";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDashboardPanel(panelName) {
  const resolvedPanel = ["help", "ward", "settings", "feedback"].includes(panelName) ? panelName : "home";

  dashboardPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === resolvedPanel;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  document.querySelectorAll(".side-nav a.active").forEach((link) => {
    link.classList.remove("active");
  });

  viewLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === resolvedPanel);
  });

  const titles = {
    help: "सेवा सेतू | मदत केंद्र",
    ward: "सेवा सेतू | माझा वॉर्ड",
    settings: "सेवा सेतू | सेटिंग्ज",
    feedback: "सेवा सेतू | अभिप्राय द्या",
    home: "सेवा सेतू | मुख्यपृष्ठ"
  };

  document.title = titles[resolvedPanel];
}

function openDashboardPanel(panelName) {
  const resolvedPanel = ["help", "ward", "settings", "feedback"].includes(panelName) ? panelName : "home";
  authView.hidden = true;
  dashboardView.hidden = false;
  showDashboardPanel(resolvedPanel);
  window.location.hash = resolvedPanel === "home" ? "dashboard" : resolvedPanel;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function settingRow(icon, color, title, value, description = "") {
  const detail = description ? `<small>${description}</small>` : "";
  return `
    <button class="setting-row link-row" type="button">
      <div class="setting-icon ${color}"><i class="${icon}"></i></div>
      <strong>${title}</strong>
      <span>${value}${detail}</span>
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

function toggleRow(icon, color, title, description, checked = true) {
  return `
    <div class="setting-row toggle-row">
      <div class="setting-icon ${color}"><i class="${icon}"></i></div>
      <div class="setting-copy">
        <strong>${title}</strong>
        <span>${description}</span>
      </div>
      <label class="switch">
        <input type="checkbox" ${checked ? "checked" : ""}>
        <span></span>
      </label>
    </div>
  `;
}

const settingsViews = {
  general: () => initialSettingsContent,
  profile: () => `
    <article class="settings-card">
      <h2>प्रोफाइल माहिती</h2>
      <div class="setting-row profile-photo-row">
        <div class="setting-icon green"><i class="fa-regular fa-user"></i></div>
        <div class="setting-copy"><strong>प्रोफाइल फोटो</strong><span>नागरिक खात्यासाठी दिसणारा फोटो.</span></div>
        <div class="profile-preview"><i class="fa-solid fa-user"></i></div>
        <button class="outline-small" type="button">बदला</button>
      </div>
      ${settingRow("fa-regular fa-user", "blue", "पूर्ण नाव", "राहुल पाटील")}
      ${settingRow("fa-regular fa-envelope", "purple", "ईमेल आयडी", "rahulpatil@gmail.com")}
      ${settingRow("fa-solid fa-phone", "orange", "मोबाईल क्रमांक", "9876543210")}
      ${settingRow("fa-solid fa-location-dot", "green-soft", "पत्ता", "मालवण, सिंधुदुर्ग, महाराष्ट्र - 416606")}
      ${settingRow("fa-regular fa-id-card", "blue", "नागरिक आयडी", "SS-MVN-2401")}
    </article>
  `,
  notifications: () => `
    <article class="settings-card preference-card">
      <h2>सूचना सेटिंग्ज</h2>
      ${toggleRow("fa-solid fa-bell", "red", "पुश सूचना", "महत्त्वाच्या सूचना आणि अपडेट मिळवा.", true)}
      ${toggleRow("fa-regular fa-envelope", "orange", "ईमेल सूचना", "तक्रार स्थिती आणि महत्त्वाच्या माहितीचे ईमेल मिळवा.", true)}
      ${toggleRow("fa-solid fa-comment-sms", "blue", "SMS सूचना", "मोबाईलवर त्वरित SMS अलर्ट मिळवा.", false)}
      ${toggleRow("fa-regular fa-calendar-check", "green", "आठवड्याचा सारांश", "आठवड्यातील तक्रारी व सेवा अपडेट मिळवा.", true)}
    </article>
  `,
  privacy: () => `
    <article class="settings-card preference-card">
      <h2>गोपनीयता आणि सुरक्षा</h2>
      ${toggleRow("fa-solid fa-location-dot", "green", "लोकेशन परवानगी", "तक्रारीचे अचूक ठिकाण जोडण्यासाठी वापरा.", true)}
      ${toggleRow("fa-solid fa-shield-halved", "blue", "दोन-स्तरीय सुरक्षा", "लॉगिन करताना अतिरिक्त OTP पडताळणी.", true)}
      ${toggleRow("fa-regular fa-eye", "purple", "प्रोफाइल दृश्यमानता", "प्रशासनाला आवश्यक प्रोफाइल माहिती दिसेल.", true)}
      ${settingRow("fa-solid fa-clock-rotate-left", "orange", "लॉगिन इतिहास", "मागील 5 लॉगिन पहा")}
    </article>
  `,
  language: () => `
    <article class="settings-card language-card">
      <h2>भाषा</h2>
      <div class="language-options">
        <button class="active" type="button"><i class="fa-solid fa-check"></i><strong>मराठी</strong><span>सध्या निवडलेली भाषा</span></button>
        <button type="button"><i class="fa-solid fa-language"></i><strong>English</strong><span>Use app in English</span></button>
        <button type="button"><i class="fa-solid fa-language"></i><strong>हिंदी</strong><span>ऐप हिंदी में इस्तेमाल करें</span></button>
      </div>
    </article>
  `,
  password: () => `
    <article class="settings-card password-card">
      <h2>पासवर्ड बदला</h2>
      <div class="password-fields">
        <label><span>सध्याचा पासवर्ड</span><input type="password" placeholder="सध्याचा पासवर्ड"></label>
        <label><span>नवीन पासवर्ड</span><input type="password" placeholder="नवीन पासवर्ड"></label>
        <label><span>पासवर्ड पुन्हा लिहा</span><input type="password" placeholder="पासवर्ड पुन्हा लिहा"></label>
        <button type="button">पासवर्ड अपडेट करा</button>
      </div>
    </article>
  `,
  data: () => `
    <article class="settings-card preference-card">
      <h2>डेटा आणि परवानग्या</h2>
      ${settingRow("fa-solid fa-download", "blue", "माझा डेटा डाउनलोड करा", "PDF / CSV")}
      ${settingRow("fa-solid fa-image", "green", "अपलोड केलेले फोटो", "12 फोटो")}
      ${toggleRow("fa-solid fa-chart-line", "purple", "सेवा सुधारणा डेटा", "अनामिक वापर डेटा शहर सेवा सुधारण्यासाठी वापरा.", true)}
      ${settingRow("fa-regular fa-trash-can", "red", "डेटा साफ करा", "तात्पुरता cache आणि draft काढा")}
    </article>
  `,
  about: () => `
    <article class="settings-card about-card">
      <h2>अॅप माहिती</h2>
      ${settingRow("fa-solid fa-mobile-screen-button", "blue", "सेवा सेतू मालवण", "Version 1.0.0")}
      ${settingRow("fa-solid fa-building-columns", "green", "प्रशासन", "मालवण नगरपरिषद")}
      ${settingRow("fa-regular fa-circle-question", "purple", "मदत", "02365-252111")}
      ${settingRow("fa-solid fa-file-shield", "orange", "नियम व अटी", "वाचा")}
    </article>
  `,
  logout: () => `
    <article class="settings-card logout-card">
      <h2>लॉगआउट</h2>
      <div class="logout-confirm">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
        <strong>तुम्हाला खात्यातून बाहेर पडायचे आहे का?</strong>
        <p>लॉगआउट केल्यानंतर पुन्हा प्रवेश करण्यासाठी मोबाईल क्रमांक किंवा पासवर्ड लागेल.</p>
        <button type="button">लॉगआउट करा</button>
      </div>
    </article>
  `
};

function renderSettings(tabName) {
  if (!settingsContent) return;
  const resolvedTab = settingsViews[tabName] ? tabName : "general";
  settingsContent.innerHTML = settingsViews[resolvedTab]();

  settingsMenuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.settingsTab === resolvedTab);
  });
}

showLoginButton.addEventListener("click", () => {
  window.location.href = OFFICIAL_LOGIN_URL;
});
showRegisterButton.addEventListener("click", () => switchAuthMode("register"));

mobileNumber.addEventListener("input", (event) => {
  event.target.value = onlyDigits(event.target.value).slice(0, 10);
});

togglePasswordButton.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  togglePasswordButton.innerHTML = shouldShow
    ? '<i class="fa-regular fa-eye"></i>'
    : '<i class="fa-regular fa-eye-slash"></i>';
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const citizenRegistrationPayload = {
    fullName: formData.get("fullName"),
    mobileNumber: formData.get("mobileNumber"),
    ward: formData.get("ward"),
    locality: formData.get("locality")
  };

  if (citizenRegistrationPayload.mobileNumber.length !== 10) {
    showToast("कृपया १० अंकी मोबाईल क्रमांक प्रविष्ट करा.");
    return;
  }

  console.log("Citizen registration payload:", citizenRegistrationPayload);
  showToast("नोंदणी यशस्वी. मुख्यपृष्ठ उघडत आहे...");
  window.setTimeout(showDashboard, 650);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const citizenLoginPayload = {
    username: formData.get("username"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") === "on",
    ward: formData.get("ward")
  };

  console.log("Citizen login payload:", citizenLoginPayload);
  showToast("लॉगिन यशस्वी. मुख्यपृष्ठ उघडत आहे...");
  window.setTimeout(showDashboard, 650);
});

forgotPassword.addEventListener("click", (event) => {
  event.preventDefault();
  showToast("पासवर्ड रीसेट सुविधा backend जोडल्यावर सक्रिय होईल.");
});

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.querySelectorAll(".side-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (link.dataset.viewLink) {
      openDashboardPanel(link.dataset.viewLink);
    } else {
      document.querySelector(".side-nav a.active")?.classList.remove("active");
      link.classList.add("active");
    }
    sidebar.classList.remove("open");
  });
});

document.querySelectorAll('[data-action="new-complaint"], .blue-card button').forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "citizen/report-complaint.html";
  });
});

document.querySelectorAll('[data-action="track-complaint"], .green-card button').forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "citizen/my-complaints.html";
  });
});

document.querySelectorAll('[data-action="open-help"]').forEach((button) => {
  button.addEventListener("click", () => {
    openDashboardPanel("help");
  });
});

document.querySelectorAll('[data-action="open-feedback"]').forEach((button) => {
  button.addEventListener("click", () => {
    openDashboardPanel("feedback");
  });
});

document.querySelectorAll(".ward-card").forEach((card) => {
  card.addEventListener("click", () => {
    openDashboardPanel("ward");
  });
});

settingsMenuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderSettings(button.dataset.settingsTab);
  });
});

settingsContent?.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button");
  if (!actionButton) return;
  showToast("ही सेटिंग backend API जोडल्यावर सेव्ह होईल.");
});

feedbackMessage?.addEventListener("input", () => {
  feedbackCount.textContent = feedbackMessage.value.length;
});

feedbackStars?.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    const rating = Number(button.dataset.rating);
    feedbackStars.querySelectorAll("button").forEach((starButton) => {
      const isActive = Number(starButton.dataset.rating) <= rating;
      starButton.classList.toggle("active", isActive);
      starButton.innerHTML = isActive
        ? '<i class="fa-solid fa-star"></i>'
        : '<i class="fa-regular fa-star"></i>';
    });
  });
});

document.querySelectorAll(".satisfaction-level button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".satisfaction-level button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

submitFeedback?.addEventListener("click", () => {
  showToast("अभिप्राय सबमिट झाला. तुमच्या सूचनांसाठी धन्यवाद!");
  if (feedbackMessage) {
    feedbackMessage.value = "";
    feedbackCount.textContent = "0";
  }
});

document.querySelectorAll('.help-card button, .help-search button, .previous-feedback button').forEach((button) => {
  button.addEventListener("click", () => {
    showToast("ही क्रिया backend API जोडल्यावर पूर्णपणे कार्य करेल.");
  });
});

if (window.location.hash === "#complaints") {
  window.location.replace("citizen/my-complaints.html");
}

if (window.location.hash === "#dashboard" || window.location.hash === "#home") {
  openDashboardPanel("home");
}

if (window.location.hash === "#help") {
  openDashboardPanel("help");
}

if (window.location.hash === "#ward") {
  openDashboardPanel("ward");
}

if (window.location.hash === "#settings") {
  openDashboardPanel("settings");
}

if (window.location.hash === "#feedback") {
  openDashboardPanel("feedback");
}
