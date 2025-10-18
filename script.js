let currentUser;

// 🔥 Auth listener
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    document.getElementById("username").innerText = user.email;
    loadMessages();
  }
});

// 📤 Send Message
function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  const chatRef = firebase.database().ref("messages");
  chatRef.push({
    user: currentUser.email,
    message: message,
    timestamp: new Date().toISOString()
  });

  input.value = "";
}

// 📥 Load Messages + Add Edit/Delete buttons
function loadMessages() {
  const chatRef = firebase.database().ref("messages");
  chatRef.on("value", snapshot => {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    snapshot.forEach(child => {
      const data = child.val();
      const msgKey = child.key;

      const div = document.createElement("div");
      div.classList.add("chat-message");
      div.classList.add(data.user === currentUser.email ? "self" : "other");

      // Message content
      let messageHTML = `
        <strong>${data.user}</strong><br>
        <span class="message-text">${data.message}</span><br>
        <small>${new Date(data.timestamp).toLocaleString()}</small>
      `;

      // 🧩 Only show edit/delete if it's your message
      if (data.user === currentUser.email) {
        messageHTML += `
          <div class="message-actions">
            <button onclick="editMessage('${msgKey}', '${data.message.replace(/'/g, "\\'")}')">✏️ Edit</button>
            <button onclick="deleteMessage('${msgKey}')">🗑️ Delete</button>
          </div>
        `;
      }

      div.innerHTML = messageHTML;
      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// ✏️ Edit Message
function editMessage(key, oldText) {
  const newText = prompt("Edit your message:", oldText);
  if (newText !== null && newText.trim() !== "") {
    firebase.database().ref("messages/" + key).update({
      message: newText.trim()
    });
  }
}

// 🗑️ Delete Message
function deleteMessage(key) {
  if (confirm("Are you sure you want to delete this message?")) {
    firebase.database().ref("messages/" + key).remove();
  }
}

// 🚪 Logout
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// 😀 Emoji Picker Integration (stable)
const emojiBtn = document.querySelector('#emojiBtn');
const input = document.querySelector('#messageInput');

const picker = new EmojiButton({
  position: 'top-end',
  theme: 'auto',
  showPreview: false,
  showSearch: true,
  showRecents: true,
  zIndex: 9999
});

emojiBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  picker.togglePicker(emojiBtn);
});

picker.on('emoji', (emoji) => {
  input.value += emoji;
  input.focus();
});
