// ================= PROFILE PAGE =================

// ================= IMAGE DATABASE =================
let imageDB;

const imageDBRequest = indexedDB.open("zedImagesDB", 1);

imageDBRequest.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
    }
};

imageDBRequest.onsuccess = e => {
    imageDB = e.target.result;
    renderUserProducts(); // ensure DB is ready before rendering
};

function loadImageFromDB(id, callback) {
    if (!imageDB) return;

    const tx = imageDB.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const req = store.get(id);

    req.onsuccess = () => {
        if (!req.result) return callback(null);
        callback(URL.createObjectURL(req.result.blob));
    };
}

// ================= LOAD USER =================
const user = JSON.parse(localStorage.getItem("zedUser")) || {};

// USER INFO
if (user.name && document.getElementById("profileName"))
    document.getElementById("profileName").textContent = user.name;

if (user.phone && document.getElementById("profilePhone"))
    document.getElementById("profilePhone").textContent = user.phone;

if (user.location && document.getElementById("profileLocation"))
    document.getElementById("profileLocation").textContent = user.location;

// ================= USER PRODUCTS =================
function renderUserProducts() {
    const myProducts = document.getElementById("myProducts");
    if (!myProducts) return;

    const posts = JSON.parse(localStorage.getItem("zedPosts")) || [];
    const userPosts = posts.filter(post => post.ownerId === user.id);

    if (userPosts.length === 0) {
        myProducts.innerHTML = "<p>No posts yet</p>";
        return;
    }

    myProducts.innerHTML = "";

    userPosts.forEach(post => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.id = post.id;

        const img = document.createElement("img");
        img.src = "imgs/placeholder.png";

        loadImageFromDB(post.id, url => {
            if (url) img.src = url;
        });

        card.innerHTML = `
            <h2 class="product-title">${post.title}</h2>
            <p class="product-price">K${post.price}</p>
            <button class="delete-btn" data-id="${post.id}">Delete</button>
        `;

        card.prepend(img);
        myProducts.appendChild(card);
    });
}

// ================= DELETE PRODUCT POST =================
document.addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;

        let posts = JSON.parse(localStorage.getItem("zedPosts")) || [];
        posts = posts.filter(p => String(p.id) !== String(id));
        localStorage.setItem("zedPosts", JSON.stringify(posts));

        renderUserProducts(); // render instantly without refresh
        renderProfileJobs();  // also update jobs if needed
    }
});

// ================= PROFILE JOBS =================
const profileJobList =
    document.querySelector(".job-list") ||
    document.getElementById("myJobs");

function renderProfileJobs() {
    if (!profileJobList) return;

    const jobs = JSON.parse(localStorage.getItem("zedJobs")) || [];
    const userJobs = jobs.filter(job => String(job.ownerId) === String(user.id));

    if (userJobs.length === 0) {
        profileJobList.innerHTML = "<p>No jobs posted yet</p>";
        return;
    }

    profileJobList.innerHTML = "";

    userJobs.forEach(job => renderProfileJob(job));
}

function renderProfileJob(job) {
    if (!profileJobList) return;

    const card = document.createElement("div");
    card.className = "job-card";
    card.dataset.id = job.id;

    card.innerHTML = `
        <h3>${job.title}</h3>
        <p class="company">${job.company}</p>
        <p class="meta">📍 ${job.location} · ${job.type}</p>
        <p class="desc">${job.description}</p>
        <p class="contact">Contact: ${job.contact} · ${job.email}</p>
        <div class="job-actions">
            <button class="delete-job-btn">Delete</button>
        </div>
    `;

    profileJobList.prepend(card);

    card.querySelector(".delete-job-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this job?")) {
            let jobs = JSON.parse(localStorage.getItem("zedJobs")) || [];
            jobs = jobs.filter(j => String(j.id) !== String(job.id));
            localStorage.setItem("zedJobs", JSON.stringify(jobs));

            renderProfileJobs(); // update instantly
        }
    });
}

// Initial load of jobs
window.addEventListener("load", () => {
    renderUserProducts();
    renderProfileJobs();
});

// ================= HOME BUTTON =================
const homeBtn = document.getElementById("homeBtn");
if (homeBtn) {
    homeBtn.onclick = () => {
        window.location.href = "index.html";
    };
}

// ================= POST MODAL =================
const postModal = document.getElementById("postModal");
const postTypeToggle = document.getElementById("postType");
const productForm = document.getElementById("productForm");
const jobForm = document.getElementById("jobForm");

// OPEN POST MODAL
const footerButtons = document.querySelectorAll("footer button");
if (footerButtons[2]) {
    footerButtons[2].addEventListener("click", () => {
        postModal.style.display = "flex";
    });
}

// CLOSE MODAL
const cancelButtons = document.querySelectorAll("#cancelJob, #cancelProduct");
cancelButtons.forEach(btn => btn.addEventListener("click", () => {
    postModal.style.display = "none";
}));

// TOGGLE FORMS
postTypeToggle.addEventListener("change", () => {
    productForm.classList.add("hidden");
    jobForm.classList.add("hidden");

    if (postTypeToggle.value === "product") productForm.classList.remove("hidden");
    if (postTypeToggle.value.toLowerCase() === "job-posting") jobForm.classList.remove("hidden");
});

// ================= PUBLISH PRODUCT =================
const publishPostBtn = document.getElementById("publishPost");
if (publishPostBtn) {
    publishPostBtn.addEventListener("click", async () => {
        const title = document.getElementById("productName").value.trim();
        const price = document.getElementById("productPrice").value.trim();
        const contact = document.getElementById("productContact").value.trim();
        const imageFile = document.getElementById("productImage").files[0];

        if (!title || !price || !contact || !imageFile) {
            alert("Please fill all fields");
            return;
        }

        const postId = Date.now();

        // SAVE IMAGE TO DB
        if (imageFile && imageDB) {
            const tx = imageDB.transaction("images", "readwrite");
            const store = tx.objectStore("images");
            store.put({ id: postId, blob: imageFile });
        }

        const postData = {
            id: postId,
            ownerId: user.id,
            title,
            price,
            phone: contact
        };

        let posts = JSON.parse(localStorage.getItem("zedPosts")) || [];
        posts.unshift(postData);
        localStorage.setItem("zedPosts", JSON.stringify(posts));

        renderUserProducts(); // show instantly
        postModal.style.display = "none";

        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productContact").value = "";
        document.getElementById("productImage").value = "";
    });
}

// ================= PUBLISH JOB =================
const publishJobBtn = document.getElementById("publishJob");
if (publishJobBtn) {
    publishJobBtn.addEventListener("click", () => {
        const title = document.getElementById("jobTitle").value.trim();
        const company = document.getElementById("jobCompany").value.trim();
        const location = document.getElementById("jobLocation").value.trim();
        const type = document.getElementById("jobType").value;
        const description = document.getElementById("jobDesc").value.trim();
        const contact = document.getElementById("jobContact").value.trim();
        const email = document.getElementById("jobEmail").value.trim();

        if (!title || !company || !location || !type || !description || !contact || !email) {
            alert("Please fill all fields");
            return;
        }

        const jobId = Date.now();
        const jobData = {
            id: jobId,
            ownerId: user.id,
            title,
            company,
            location,
            type,
            description,
            contact,
            email
        };

        let jobs = JSON.parse(localStorage.getItem("zedJobs")) || [];
        jobs.unshift(jobData);
        localStorage.setItem("zedJobs", JSON.stringify(jobs));

        renderProfileJob(jobData); // show instantly
        postModal.style.display = "none";

        document.getElementById("jobTitle").value = "";
        document.getElementById("jobCompany").value = "";
        document.getElementById("jobLocation").value = "";
        document.getElementById("jobType").value = "";
        document.getElementById("jobDesc").value = "";
        document.getElementById("jobContact").value = "";
        document.getElementById("jobEmail").value = "";
    });
}

document.getElementById("messageBtn").onclick = () => {
    window.location.href = "message.html";
};
