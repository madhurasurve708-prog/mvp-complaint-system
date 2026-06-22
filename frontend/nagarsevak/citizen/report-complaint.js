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

const API = "https://seva-setu-complaint-app.onrender.com";

function getCitizenId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("citizen_id") || localStorage.getItem("citizenId") || sessionStorage.getItem("citizenId");
  if (id) {
    localStorage.setItem("citizenId", id);
    sessionStorage.setItem("citizenId", id);
  }
  return Number(id);
}

complaintForm.addEventListener("submit", async (event) => {

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

  const citizenId = getCitizenId();
  if (!citizenId) {
    showToast("कृपया तक्रार नोंदवण्यापूर्वी नागरिक लॉगिन करा.");
    window.setTimeout(() => {
      window.location.href = "../index.html";
    }, 900);
    return;
  }

  const complaintPayload = {

    category: selectedCategory.value,

    description: issueDescription.value.trim(),

    photo: photoInput.files[0] 
      ? photoInput.files[0].name 
      : null,

    citizen_id: citizenId
};
 


  submitButton.classList.add("is-loading");
  submitButton.querySelector("span").textContent =
    "सबमिट होत आहे...";


  try {


    const response = await fetch(
      `${API}/complaints`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(complaintPayload)
      }
    );


    const data = await response.json();


    if(response.ok){

      showToast("तक्रार यशस्वीपणे नोंदवली गेली.");

      setTimeout(()=>{
        window.location.href="my-complaints.html";
      },800);

    }
    else {

      showToast("तक्रार नोंदवता आली नाही.");

    }


  } catch(error){

    console.log(error);

    showToast("Server connect होत नाही.");

  }


  submitButton.classList.remove("is-loading");
  submitButton.querySelector("span").textContent =
    "तक्रार सबमिट करा";

});
