// ===== JOB POSTING JS =====

// ELEMENTS
const jobModal = document.getElementById("jobModal");
const cancelJob = document.getElementById("cancelJob");
const publishJob = document.getElementById("publishJob");
const jobList = document.querySelector(".job-list");
const footerButtons = document.querySelectorAll("footer button");
const profileBtn = document.getElementById("profileBtn");

// -----------------------------
// OPEN JOB MODAL (footer Post button is 3rd button)
if (footerButtons[2] && jobModal) {
    footerButtons[2].addEventListener("click", () => {
        jobModal.style.display = "flex";
    });
}

// -----------------------------
// CLOSE JOB MODAL
if (cancelJob && jobModal) {
    cancelJob.addEventListener("click", () => {
        jobModal.style.display = "none";
    });
}

// -----------------------------
// PUBLISH JOB
if (publishJob) {
    publishJob.addEventListener("click", () => {
        const user = JSON.parse(localStorage.getItem("zedUser")) || {};

        const job = {
            id: Date.now(),
            ownerId: user.id, // ✅ REQUIRED
            title: document.getElementById("jobTitle").value.trim(),
            company: document.getElementById("jobCompany").value.trim(),
            location: document.getElementById("jobLocation").value.trim(),
            type: document.getElementById("jobType").value,
            description: document.getElementById("jobDesc").value.trim(),
            contact: document.getElementById("jobContact").value.trim(),
            email: document.getElementById("jobEmail").value.trim()
        };


                // Validate fields
        if (Object.values(job).some(v => !v)) {
            alert("Please fill all job fields");
            return;
        }

        // Save to localStorage
        const jobs = JSON.parse(localStorage.getItem("zedJobs")) || [];
        jobs.unshift(job);
        localStorage.setItem("zedJobs", JSON.stringify(jobs));

        // Render job immediately
        renderJob(job);

        // Close modal and reset form
        jobModal.style.display = "none";
        document.getElementById("jobTitle").value = "";
        document.getElementById("jobCompany").value = "";
        document.getElementById("jobLocation").value = "";
        document.getElementById("jobType").value = "";
        document.getElementById("jobDesc").value = "";
        document.getElementById("jobContact").value = "";
        document.getElementById("jobEmail").value = "";
    });
}

// -----------------------------
// RENDER JOB FUNCTION
function renderJob(job) {
    if (!jobList) return;

    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML = `
        <h3>${job.title}</h3>
        <p class="company">${job.company}</p>
        <p class="meta">📍 ${job.location} · ${job.type}</p>
        <p class="desc">${job.description}</p>
        <p class="contact">Contact: ${job.contact} · ${job.email}</p>
        <button class="apply-btn">Apply</button>
    `;
    jobList.prepend(card);

    // Apply button click
    card.querySelector(".apply-btn").addEventListener("click", () => {
        window.location.href = "applydetails.html";
    });
}

// -----------------------------
// LOAD JOBS ON PAGE LOAD
window.addEventListener("load", () => {
    const jobs = JSON.parse(localStorage.getItem("zedJobs")) || [];
    jobs.forEach(job => renderJob(job));

    // Add click for existing Apply buttons in HTML
    document.querySelectorAll(".job-card .apply-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            window.location.href = "applydetails.html";
        });
    });
});

// -----------------------------
// PROFILE BUTTON
if (profileBtn) {
    profileBtn.addEventListener("click", () => {
        window.location.href = "profile.html";
    });
}

document.getElementById("profileBtn").onclick = () => {
    window.location.href = "profile.html";
};

document.getElementById("notifisBtn").onclick = () => {
    window.location.href = "notifs.html";
};

document.getElementById("homeBtn").onclick = () =>{
    window.location.href = "index.html";
}


document.getElementById("messageBtn").onclick = () => {
    window.location.href = "message.html";
};