const categoryCards = document.querySelectorAll(".category-card");
const selectedCategory = document.getElementById("selectedCategory");
const issueDescription = document.getElementById("issueDescription");
const charCounter = document.getElementById("charCounter");
const photoInput = document.getElementById("complaintPhoto");
const uploadBox = document.getElementById("uploadBox");
const photoPreview = document.getElementById("photoPreview");
const complaintForm = document.getElementById("complaintForm");
const submitButton = complaintForm.querySelector(".submit-btn");
const toast = document.getElementById("toast");
const STORAGE_KEY = "sevaSetuComplaints";

const categoryLabels = {
  water: "पाणी",
  garbage: "कचरा",
  "street-lights": "रस्त्यावरील दिवे",
  road: "रस्ता",
  gutter: "गटार",
  animals: "भटकी जनावरे",
  traffic: "वाहतूक समस्या",
  drainage: "नाले / पाणी साचणे",
  tree: "झाड समस्या",
  other: "इतर"
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    categoryCards.forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });

    card.classList.add("is-selected");
    card.setAttribute("aria-pressed", "true");
    selectedCategory.value = card.dataset.category;
  });
});

issueDescription.addEventListener("input", () => {
  charCounter.textContent = `${issueDescription.value.length} / 500`;
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];

  if (!file) {
    uploadBox.classList.remove("has-preview");
    photoPreview.removeAttribute("src");
    return;
  }

  const isSupported = ["image/jpeg", "image/png"].includes(file.type);
  const isWithinLimit = file.size <= 5 * 1024 * 1024;

  if (!isSupported || !isWithinLimit) {
    photoInput.value = "";
    uploadBox.classList.remove("has-preview");
    photoPreview.removeAttribute("src");
    showToast("कृपया 5MB पेक्षा कमी JPG किंवा PNG फोटो निवडा.");
    return;
  }

  photoPreview.src = URL.createObjectURL(file);
  uploadBox.classList.add("has-preview");
});

complaintForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!selectedCategory.value) {
    showToast("कृपया तक्रार विभाग निवडा.");
    return;
  }

  if (issueDescription.value.trim().length < 10) {
    showToast("कृपया समस्येचे थोडक्यात स्पष्ट वर्णन लिहा.");
    issueDescription.focus();
    return;
  }

  const complaintPayload = {
    id: `MC${Date.now().toString().slice(-6)}`,
    category: selectedCategory.value,
    categoryLabel: categoryLabels[selectedCategory.value] || "इतर",
    description: issueDescription.value.trim(),
    status: "pending",
    ward: "वॉर्ड 3",
    hasPhoto: Boolean(photoInput.files[0]),
    createdAt: new Date().toISOString()
  };

  console.log("Complaint payload:", complaintPayload);
  const savedComplaints = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  savedComplaints.unshift(complaintPayload);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedComplaints));

  submitButton.classList.add("is-loading");
  submitButton.querySelector("span").textContent = "सबमिट होत आहे...";

  window.setTimeout(() => {
    submitButton.classList.remove("is-loading");
    submitButton.querySelector("span").textContent = "तक्रार सबमिट करा";
    showToast("तक्रार यशस्वीपणे नोंदवली गेली.");
    window.setTimeout(() => {
      window.location.href = "my-complaints.html";
    }, 450);
  }, 900);
});
