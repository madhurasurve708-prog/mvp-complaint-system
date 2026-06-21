const filterButtons = document.querySelectorAll(".status-tabs button");
const complaintsList = document.getElementById("complaintsList");


const categoryView = {
  water: { icon: "fa-droplet", className: "water", title: "पाणी" },
  garbage: { icon: "fa-trash-can", className: "garbage", title: "कचरा" },
  "street-lights": { icon: "fa-lightbulb", className: "lights", title: "रस्त्यावरील दिवे" },
  road: { icon: "fa-road", className: "road", title: "रस्ता" },
  gutter: { icon: "fa-water", className: "gutter", title: "गटार" },
  animals: { icon: "fa-dog", className: "animals", title: "भटकी जनावरे" },
  traffic: { icon: "fa-traffic-light", className: "traffic", title: "वाहतूक समस्या" },
  drainage: { icon: "fa-person-digging", className: "gutter", title: "नाले / पाणी साचणे" },
  tree: { icon: "fa-tree", className: "tree", title: "झाड समस्या" },
  other: { icon: "fa-circle-plus", className: "other", title: "इतर" }
};

const statusView = {
  pending: { label: "प्रलंबित", className: "pending" },
  progress: { label: "प्रगतीत", className: "progress" },
  resolved: { label: "निकाली", className: "resolved" }
};

const API = "http://127.0.0.1:8000";


async function getComplaints() {

  const ward_id = 1; // demo user ka ward

  const response = await fetch(
    `${API}/complaints/${ward_id}`
  );

  const data = await response.json();

  return data.map(c => ({
    id: c.id,
    category: c.category,
    description: c.description,
    status: convertStatus(c.status),
    ward: "वॉर्ड " + c.ward_id,
    createdAt: new Date()
  }));
}


function convertStatus(status){

  if(status === "Pending")
    return "pending";

  if(status === "Resolved")
    return "resolved";

  return "progress";
}


function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("mr-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function emptyStateMarkup(filter) {
  const text = filter === "all"
    ? "अजून कोणतीही तक्रार नोंदवलेली नाही."
    : "या स्थितीत सध्या कोणतीही तक्रार नाही.";

  return `
    <div class="empty-state">
      <div class="empty-icon"><i class="fa-regular fa-folder-open"></i></div>
      <h2>${text}</h2>
      <p>तक्रार नोंदवल्यानंतर तिची स्थिती, क्रमांक आणि तपशील येथे दिसतील.</p>
      <a href="report-complaint.html">तक्रार नोंदवा</a>
    </div>
  `;
}

function complaintMarkup(complaint) {
  const category = categoryView[complaint.category] || categoryView.other;
  const status = statusView[complaint.status] || statusView.pending;
  const description = complaint.description || "तक्रारीचा तपशील उपलब्ध नाही.";
  const id = complaint.id || "MC000000";

  return `
    <article class="complaint-item" data-status="${complaint.status || "pending"}">
      <div class="item-icon ${category.className}"><i class="fa-solid ${category.icon}"></i></div>
      <div class="item-body">
        <div class="item-head">
          <h3>${complaint.categoryLabel || category.title}</h3>
          <span class="badge ${status.className}">${status.label}</span>
        </div>
        <p>${description}</p>
        <div class="meta-row">
          <span><i class="fa-regular fa-calendar"></i> ${formatDate(complaint.createdAt)}</span>
          <span>#${id}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${complaint.ward || "वॉर्ड 3"}</span>
        </div>
      </div>
      <button class="open-btn" type="button" aria-label="तक्रार तपशील"><i class="fa-solid fa-chevron-right"></i></button>
    </article>
  `;
}

async function renderComplaints(filter = "all") {

  const complaints = await getComplaints();
  const complaints = getComplaints();
  const visibleComplaints = filter === "all"
    ? complaints
    : complaints.filter((complaint) => complaint.status === filter);

  complaintsList.innerHTML = visibleComplaints.length
    ? visibleComplaints.map(complaintMarkup).join("")
    : emptyStateMarkup(filter);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderComplaints(button.dataset.filter);
  });
});

complaintsList.addEventListener("click", (event) => {
  const openButton = event.target.closest(".open-btn");
  if (!openButton) return;
  openButton.closest(".complaint-item").classList.toggle("is-open");
});

renderComplaints("all");
