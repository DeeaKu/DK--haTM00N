let currentUser;

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    document.getElementById("username").innerText = user.email;
    loadMessages();
  }
});

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

function loadMessages() {
  const chatRef = firebase.database().ref("messages");
  chatRef.on("value", snapshot => {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    snapshot.forEach(child => {
      const data = child.val();
      const div = document.createElement("div");
      div.classList.add("chat-message");

      if (data.user === currentUser.email) {
        div.classList.add("self");
      } else {
        div.classList.add("other");
      }

      div.innerHTML = `<strong>${escapeHtml(data.user)}</strong><br>${escapeHtml(data.message)}<br><small>${new Date(data.timestamp).toLocaleString()}</small>`;
      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

/* -----------------------------
   Emoji Picker: robust init
   ----------------------------- */

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Wait for a global (like EmojiButton) to appear on window
 * tries every `intervalMs` for up to `timeoutMs`
 */
function waitForGlobal(name, intervalMs = 100, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const iv = setInterval(() => {
      const val = window[name];
      if (val) {
        clearInterval(iv);
        resolve(val);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        reject(new Error(`${name} not found on window after ${timeoutMs}ms`));
      }
    }, intervalMs);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const emojiBtn = document.querySelector('#emojiBtn');
  const input = document.querySelector('#messageInput');

  if (!emojiBtn || !input) {
    console.warn('Emoji or input element missing (#emojiBtn or #messageInput).');
    return;
  }

  // Ensure the emoji library is loaded. Some CDNs or caching may delay it.
  try {
    // Wait for the script to create a global named EmojiButton (up to 5s)
    await waitForGlobal('EmojiButton', 100, 5000);

    // The UMD build sometimes places the constructor at window.EmojiButton
    // and sometimes at window.EmojiButton.default — handle both.
    const EmojiCtor = window.EmojiButton || (window.EmojiButton && window.EmojiButton.default) || null;

    if (!EmojiCtor) {
      console.error('EmojiButton found but constructor not available. window.EmojiButton:', window.EmojiButton);
      return;
    }

    const picker = new EmojiCtor({
      position: 'top-end',
      autoHide: false,
      showPreview: false,
      showRecents: true,
      theme: 'dark'
    });

    picker.on('emoji', emoji => {
      // Insert emoji at caret position (not just append)
      insertAtCursor(input, emoji);
      input.focus();
    });

    emojiBtn.addEventListener('click', (e) => {
      e.preventDefault();
      picker.togglePicker(emojiBtn);
    });

    // good feedback
    console.log('Emoji picker initialized.');
  } catch (err) {
    console.error('Emoji picker failed to initialize:', err);
  }
});

/* Utility: insert text at cursor for textarea/input */
function insertAtCursor(el, text) {
  if (!el) return;
  // For inputs and textareas
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const before = el.value.substring(0, start);
  const after = el.value.substring(end);
  el.value = before + text + after;
  // move caret after inserted text
  const caret = start + text.length;
  el.selectionStart = el.selectionEnd = caret;
}
