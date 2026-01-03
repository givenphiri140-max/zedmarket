// ===================== MESSAGES JS =====================

// Sample chat data (replace with real DB later)
const chats = [
  {
    id: 1,
    name: "John Mwila",
    avatar: "JM",
    messages: [
      { type: "received", text: "Hello, is the iPhone still available?" },
      { type: "sent", text: "Yes, it’s still available 👍" },
    ],
  },
  {
    id: 2,
    name: "Alice K.",
    avatar: "AK",
    messages: [
      { type: "received", text: "Thanks, I’ll check." },
    ],
  },
];

// DOM elements
const chatList = document.querySelector(".chat-list");
const chatWindow = document.querySelector(".chat-window");
const chatHeader = chatWindow.querySelector(".chat-header h3");
const chatAvatar = chatWindow.querySelector(".chat-header .chat-avatar");
const chatMessages = chatWindow.querySelector(".chat-messages");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

// Track current chat
let currentChatId = chats[0].id;

// Render chat list dynamically
function renderChatList() {
  chatList.innerHTML = "";
  chats.forEach(chat => {
    const div = document.createElement("div");
    div.className = `chat-item${chat.id === currentChatId ? " active" : ""}`;
    div.dataset.id = chat.id;

    div.innerHTML = `
      <div class="chat-avatar">${chat.avatar}</div>
      <div class="chat-info">
        <h4>${chat.name}</h4>
        <p>${chat.messages[chat.messages.length - 1]?.text || ""}</p>
      </div>
      <span class="chat-time">Now</span>
    `;

    // Click to select chat
    div.addEventListener("click", () => {
      currentChatId = chat.id;
      renderChatList();
      renderChatWindow();
    });

    chatList.appendChild(div);
  });
}

// Render chat window
function renderChatWindow() {
  const chat = chats.find(c => c.id === currentChatId);
  chatHeader.textContent = chat.name;
  chatAvatar.textContent = chat.avatar;

  chatMessages.innerHTML = "";
  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.type}`;
    div.textContent = msg.text;
    chatMessages.appendChild(div);
  });

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const chat = chats.find(c => c.id === currentChatId);
  chat.messages.push({ type: "sent", text });

  renderChatWindow();
  renderChatList();

  messageInput.value = "";
  messageInput.focus();
}

// Send button click
sendMessageBtn.addEventListener("click", sendMessage);

// Enter key press
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// Initial render
renderChatList();
renderChatWindow();


document.getElementById("homeBtn").onclick = () => {
    window.location.href = "index.html";
};

document.getElementById("profileBtn").onclick = () => {
    window.location.href = "profile.html";
};

document.getElementById("notifisBtn").onclick = () => {
    window.location.href = "notifs.html";
};