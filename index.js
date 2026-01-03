// ================= IMAGE DATABASE (PERSISTENT) =================
let imageDB;

const imageDBRequest = indexedDB.open("zedImagesDB", 1);

imageDBRequest.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
    }
};

imageDBRequest.onerror = () => {
    console.error("IndexedDB failed to open");
};

imageDBRequest.onsuccess = e => {
    imageDB = e.target.result;

    const posts = JSON.parse(localStorage.getItem("zedPosts")) || [];
    posts.forEach(post => createPostCard(post));

    applyFilters(); // ✅ apply filters on load
};

function saveImageToDB(id, file) {
    return new Promise(resolve => {
        const tx = imageDB.transaction("images", "readwrite");
        const store = tx.objectStore("images");
        store.put({ id, blob: file });
        tx.oncomplete = () => resolve();
    });
}

function loadImageFromDB(id, callback) {
    const tx = imageDB.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const req = store.get(id);

    req.onsuccess = () => {
        if (!req.result) return callback(null);
        callback(URL.createObjectURL(req.result.blob));
    };
}

// ================= UI ELEMENTS =================
const searchInput = document.querySelector(".search");
const categories = document.querySelectorAll(".all_the_categories");
const menuItems = document.querySelectorAll(".menu ul li");
const footerButtons = document.querySelectorAll("footer button");
const productsGrid = document.querySelector(".products");

// -----------------------------
// 🔍 SEARCH + 🗂️ CATEGORY FILTER
// -----------------------------
let activeCategory = "All";

function applyFilters() {
    const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

    document.querySelectorAll(".product-card").forEach(card => {
        const title = card.querySelector(".product-title").textContent.toLowerCase();
        const cardCategory = card.dataset.category;

        const matchesSearch = title.includes(searchValue);
        const matchesCategory =
            activeCategory === "All" || cardCategory === activeCategory;

        card.style.display =
            matchesSearch && matchesCategory ? "flex" : "none";
    });
}

if (searchInput) {
    searchInput.addEventListener("keyup", applyFilters);
}

// -----------------------------
// 🗂️ CATEGORY CLICK
// -----------------------------
categories.forEach(cat => {
    cat.addEventListener("click", () => {
        categories.forEach(c => c.classList.remove("active"));
        cat.classList.add("active");

        activeCategory = cat.textContent.trim();
        applyFilters();
    });
});

// -----------------------------
// 🟠 MENU ACTIVE
// -----------------------------
menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
    });
});

// -----------------------------
// 📱 FOOTER ACTIVE
// -----------------------------
footerButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        footerButtons.forEach(b => b.classList.remove("active-footer"));
        btn.classList.add("active-footer");
    });
});

// ================= POST SYSTEM =================
const postBtn = footerButtons[2];
const postModal = document.getElementById("postModal");
const cancelPost = document.getElementById("cancelPost");
const publishPost = document.getElementById("publishPost");

// OPEN MODAL
postBtn.addEventListener("click", () => {
    postModal.style.display = "flex";
});

// CLOSE MODAL
cancelPost.addEventListener("click", () => {
    postModal.style.display = "none";
});

// CREATE POST
publishPost.addEventListener("click", async () => {
    const title = productName.value.trim();
    const price = productPrice.value.trim();
    const imageFile = productImage.files[0];
    const contact = productContact.value.trim();
    const category = document.getElementById("productCategory").value.trim();

    if (!title || !price || !imageFile || !contact || !category) {
        alert("Fill all fields including category");
        return;
    }

    const user = JSON.parse(localStorage.getItem("zedUser"));
    const postId = Date.now();

    await saveImageToDB(postId, imageFile);

    const postData = {
        id: postId,
        title,
        price,
        phone: contact,
        category,
        ownerId: user.id
    };

    savePost(postData);
    createPostCard(postData);
    applyFilters(); // ✅ re-filter after post
    postModal.style.display = "none";
});

// SAVE POST
function savePost(post) {
    let posts = JSON.parse(localStorage.getItem("zedPosts")) || [];
    if (posts.length >= 20) posts.pop();
    posts.unshift(post);
    localStorage.setItem("zedPosts", JSON.stringify(posts));
}

// CREATE PRODUCT CARD
function createPostCard(post) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = post.id;
    card.dataset.category = post.category;

    const img = document.createElement("img");
    img.src = "imgs/placeholder.png";

    loadImageFromDB(post.id, url => {
        if (url) img.src = url;
    });

    card.innerHTML = `
        <h2 class="product-title">${post.title}</h2>
        <p class="product-price">K${post.price}</p>
        <button class="buy-button">More Details</button>
    `;

    card.prepend(img);
    productsGrid.prepend(card);
}

// -----------------------------
// PRODUCT DETAILS
// -----------------------------
document.addEventListener("click", e => {
    if (e.target.classList.contains("buy-button")) {
        const card = e.target.closest(".product-card");
        const id = card.dataset.id;

        const posts = JSON.parse(localStorage.getItem("zedPosts")) || [];
        const product = posts.find(p => String(p.id) === String(id));
        if (!product) return alert("Product not found");

        localStorage.setItem("selectedProduct", JSON.stringify(product));
        window.location.href = "product.html";
    }
});

// -----------------------------
// PROFILE / HOME
// -----------------------------
document.getElementById("profileBtn").onclick = () => {
    window.location.href = "profile.html";
};

document.getElementById("homeBtn").onclick = () => {
    window.location.href = "index.html";
};

document.getElementById("notifisBtn").onclick = () => {
    window.location.href = "notifs.html";
};

document.getElementById("messageBtn").onclick = () => {
    window.location.href = "message.html";
};

// -----------------------------
// USER (AUTO CREATE)
// -----------------------------
if (!localStorage.getItem("zedUser")) {
    localStorage.setItem("zedUser", JSON.stringify({
        id: "user_001",
        name: "Zed Phones Store",
        phone: "+260971234567",
        location: "Lusaka, Zambia"
    }));
}

// -----------------------------
// POST TYPE TOGGLE
// -----------------------------
const postTypeToggle = document.getElementById("postType");
const productForm = document.getElementById("productForm");
const jobForm = document.getElementById("jobForm");

postTypeToggle.addEventListener("change", () => {
    productForm.classList.add("hidden");
    jobForm.classList.add("hidden");

    if (postTypeToggle.value === "product") productForm.classList.remove("hidden");
    if (postTypeToggle.value === "job") jobForm.classList.remove("hidden");
});
