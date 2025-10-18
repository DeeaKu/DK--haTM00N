let currentUser;

// Firebase Auth
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    document.getElementById("username").innerText = user.email;
    loadMessages();
  }
});

// Send Message
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

// Load Messages
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

      div.innerHTML = `<strong>${data.user}</strong><br>${data.message}<br><small>${new Date(data.timestamp).toLocaleString()}</small>`;
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

// ✅ Custom Local Emoji Picker (no CDN)
(function() {
  const emojiBtn = document.getElementById('emojiBtn');
  const input = document.getElementById('messageInput');
  if (!emojiBtn || !input) return;

  const EMOJIS = [
    "😀","😁","😂","🤣","😊","😍","😘","😎","🤩","🤔",
    "😅","😢","😭","😡","👍","👎","🙏","👏","🎉","🔥",
    "❤️","💔","🤝","🤗","🤖","🙈","🌟","😴","🥳","🍕"
  ];

  const pop = document.createElement('div');
  pop.className = 'emoji-popover';
  EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-item';
    btn.innerText = e;
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      insertAtCursor(input, e);
      input.focus();
      hidePopover();
    });
    pop.appendChild(btn);
  });
  document.body.appendChild(pop);

  function insertAtCursor(el, text) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + text.length;
  }

  function showPopover() {
    const rect = emojiBtn.getBoundingClientRect();
    pop.style.left = (rect.left + window.scrollX) + 'px';
    pop.style.top = (rect.top + window.scrollY - pop.offsetHeight - 8) + 'px';
    pop.style.display = 'flex';
  }

  function hidePopover() {
    pop.style.display = 'none';
  }

  emojiBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (pop.style.display === 'flex') hidePopover();
    else showPopover();
  });

  document.addEventListener('click', (e) => {
    if (!pop.contains(e.target) && e.target !== emojiBtn) hidePopover();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hidePopover();
  });

  window.addEventListener('resize', hidePopover);
  window.addEventListener('scroll', hidePopover);
})();
