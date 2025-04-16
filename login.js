const BASE_URL = "https://spentflow-2.onrender.com/api"; // adapte si besoin
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
      



loginTab.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginTab.classList.add("text-blue-600", "border-blue-600");
    registerTab.classList.remove("text-blue-600", "border-blue-600");
  });

  registerTab.addEventListener("click", () => {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    registerTab.classList.add("text-blue-600", "border-blue-600");
    loginTab.classList.remove("text-blue-600", "border-blue-600");
  });


// Connexion
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Échec de connexion");

    // Stocker le token dans localStorage
    localStorage.setItem("token", data.token);
    showMessage("Connexion réussie ✅", "success");

    // Rediriger vers le tableau de bord ou page principale
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (err) {
    showMessage(err.message, "error");
  }
});

// Inscription
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Échec de l'inscription");

    showMessage("Inscription réussie 🎉 Vous pouvez maintenant vous connecter", "success");

    // Basculer vers l’onglet de connexion
    document.getElementById("loginTab").click();
  } catch (err) {
    showMessage(err.message, "error");
  }
});

function showMessage(text, type = "success") {
  authMessage.textContent = text;
  authMessage.className = `text-center text-sm font-medium mt-2 ${
    type === "success" ? "text-green-600" : "text-red-600"
  }`;
}
