const API = ""; // ugyanazon hoston fut, ezért üres (http://localhost:3000)

const authStatus = document.getElementById("authStatus");
const openAuthBtn = document.getElementById("openAuthBtn");
const logoutBtn = document.getElementById("logoutBtn");

const authModal = document.getElementById("authModal");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authMsg = document.getElementById("authMsg");

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

const noteForm = document.getElementById("noteForm");
const titleEl = document.getElementById("title");
const contentEl = document.getElementById("content");
const noteMsg = document.getElementById("noteMsg");

const notesList = document.getElementById("notesList");

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function setMessage(el, text, isError = false) {
  el.textContent = text;
  el.style.color = isError ? "crimson" : "green";
}

function showModal(show) {
  authModal.classList.toggle("hidden", !show);
}

function setLoggedInUI(isLoggedIn) {
  if (isLoggedIn) {
    authStatus.textContent = "Bejelentkezve";
    logoutBtn.classList.remove("hidden");
    openAuthBtn.classList.add("hidden");
  } else {
    authStatus.textContent = "Nincs bejelentkezve";
    logoutBtn.classList.add("hidden");
    openAuthBtn.classList.remove("hidden");
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(API + path, {
    ...options,
    headers,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

async function loadNotes() {
  notesList.innerHTML = "";
  noteMsg.textContent = "";

  if (!getToken()) {
    notesList.innerHTML = "<p>Jelentkezz be a jegyzetek megtekintéséhez.</p>";
    return;
  }

  try {
    const notes = await apiFetch("/api/notes", { method: "GET" });
    if (!notes.length) {
      notesList.innerHTML = "<p>Még nincs jegyzeted.</p>";
      return;
    }

    for (const n of notes) {
      const div = document.createElement("div");
      div.className = "note";
      div.innerHTML = `
        <h3>${escapeHtml(n.title)}</h3>
        <p>${escapeHtml(n.content)}</p>
        <small>Frissítve: ${n.updated_at}</small><br/>
        <button data-id="${n.id}" class="deleteBtn">Törlés</button>
      `;
      notesList.appendChild(div);
    }

    // törlés gombok
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Biztos törlöd?")) return;
        try {
          await apiFetch(`/api/notes/${id}`, { method: "DELETE" });
          await loadNotes();
        } catch (e) {
          setMessage(noteMsg, e.message, true);
        }
      });
    });
  } catch (e) {
    setMessage(noteMsg, e.message, true);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// UI események
openAuthBtn.addEventListener("click", () => {
  authMsg.textContent = "";
  showModal(true);
});

closeAuthBtn.addEventListener("click", () => showModal(false));

logoutBtn.addEventListener("click", async () => {
  clearToken();
  setLoggedInUI(false);
  await loadNotes();
});

registerBtn.addEventListener("click", async () => {
  authMsg.textContent = "";
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  try {
    const result = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(result.token);
    setLoggedInUI(true);
    showModal(false);
    setMessage(noteMsg, "Sikeres regisztráció!", false);
    await loadNotes();
  } catch (e) {
    setMessage(authMsg, e.message, true);
  }
});

loginBtn.addEventListener("click", async () => {
  authMsg.textContent = "";
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  try {
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(result.token);
    setLoggedInUI(true);
    showModal(false);
    setMessage(noteMsg, "Sikeres bejelentkezés!", false);
    await loadNotes();
  } catch (e) {
    setMessage(authMsg, e.message, true);
  }
});

noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  noteMsg.textContent = "";

  if (!getToken()) {
    setMessage(noteMsg, "Előbb jelentkezz be!", true);
    return;
  }

  const title = titleEl.value.trim();
  const content = contentEl.value.trim();

  try {
    await apiFetch("/api/notes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });

    titleEl.value = "";
    contentEl.value = "";
    setMessage(noteMsg, "Jegyzet elmentve ✅", false);
    await loadNotes();
  } catch (e2) {
    setMessage(noteMsg, e2.message, true);
  }
});

// Induláskor
(function init() {
  const token = getToken();
  setLoggedInUI(!!token);
  loadNotes();
})();
