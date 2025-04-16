const addBtn = document.getElementById("add");
const resetBtn = document.getElementById("resetBtn");
const toggleDark = document.getElementById("toggleDark");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");

const transactionList = document.getElementById("list-transaction");
const totalRevenus = document.getElementById("total-revenus");
const totalDepenses = document.getElementById("total-depenses");
const soldeNet = document.getElementById("solde-net");

// 🔐 Récupération du token JWT (après connexion ou enregistrement)
const token = localStorage.getItem("token");

// 🔄 Charger les transactions au démarrage
document.addEventListener("DOMContentLoaded", () => {
  // Si aucun token trouvé, on redirige vers la page de login
  if (!token) {
    window.location.href = "login.html"; // adapte le nom si besoin
    return;
  }

  // Si le token existe, vérifier s’il est toujours valide
  fetch("https://spentflow-2.onrender.com/api/user/profile", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) {
        // Token invalide ou expiré → redirection
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      return res.json();
    })
    .then(user => {
      if (user) {
        document.getElementById("userName").textContent = user.name;
      }
    })
    

  // Continuer à charger les transactions
  fetchTransactions();
});

// ➕ Ajouter une transaction
addBtn.addEventListener("click", () => {
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = categoryInput.value;
  const type = document.getElementById("revenu").checked ? "Revenu" : "Dépense";

  if (!description || isNaN(amount) || amount <= 0 || !date) {
    return showMessage("Veuillez remplir tous les champs correctement.", "error");
  }

  fetch("https://spentflow-2.onrender.com/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ description, amount, category, type, date })
  })
    .then(res => res.json())
    .then(() => {
      clearInputs();
      fetchTransactions();
      showMessage("Transaction ajoutée !");
    })
    .catch(() => showMessage("Erreur lors de l'ajout.", "error"));
});

// 🔁 Charger les transactions depuis l'API
function fetchTransactions() {
  fetch("https://spentflow-2.onrender.com/api/transactions", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => updateUI(data))
    .catch(() => showMessage("Erreur de chargement.", "error"));
}

// 🔄 Mettre à jour l’interface
function updateUI(transactions) {
  transactionList.innerHTML = "";
  let revenus = 0;
  let depenses = 0;

  transactions.forEach(tx => {
    const li = document.createElement("li");
    const isRevenu = tx.type === "Revenu";

    li.className = `p-3 rounded-lg shadow flex justify-between items-center border-l-4 ${
      isRevenu ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"
    }`;

    li.innerHTML = `
      <div>
        <p class="font-semibold">${tx.description}</p>
        <p class="text-sm text-gray-600">${tx.category} — ${tx.date}</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="font-bold ${isRevenu ? "text-green-600" : "text-red-600"}">
          ${isRevenu ? "+" : "-"}${formatAmount(tx.amount)}
        </div>
        <button onclick="deleteTransaction('${tx._id}')" class="text-sm text-red-500 hover:underline">Supprimer</button>
      </div>
    `;

    transactionList.appendChild(li);

    if (isRevenu) revenus += tx.amount;
    else depenses += tx.amount;
  });

  totalRevenus.textContent = "+" + formatAmount(revenus);
  totalDepenses.textContent = "-" + formatAmount(depenses);
  soldeNet.textContent = formatAmount(revenus - depenses);
}
// 🧑‍💼 Récupérer les infos utilisateur
fetch("https://spentflow-2.onrender.com/api/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(user => {
      const nameEl = document.getElementById("user-name");
      if (nameEl && user.name) {
        nameEl.textContent = user.name;
      }
    })
    .catch(() => showMessage("Impossible de charger l'utilisateur", "error"));
  

// 🗑️ Supprimer une transaction
function deleteTransaction(id) {
  fetch(`https://spentflow-2.onrender.com/api/transactions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(() => {
      fetchTransactions();
      showMessage("Transaction supprimée !");
    })
    .catch(() => showMessage("Erreur de suppression.", "error"));
}

// 🌙 Dark mode
toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("bg-gray-900");
  document.body.classList.toggle("text-white");
});

// 🔄 Réinitialiser (supprime tout côté API)
resetBtn.addEventListener("click", () => {
  if (!confirm("Réinitialiser toutes les transactions ?")) return;

  fetch("https://spentflow-2.onrender.com/api/transactions", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const deleteAll = data.map(tx =>
        fetch(`/api/transactions/${tx._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      Promise.all(deleteAll).then(() => {
        fetchTransactions();
        showMessage("Toutes les transactions ont été supprimées.");
      });
    });
});

// 🔧 Fonctions utilitaires
function clearInputs() {
  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
  document.getElementById("revenu").checked = true;
  categoryInput.value = "Nourriture";
}

function formatAmount(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF"
  }).format(value);
}

function showMessage(text, type = "success") {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `mt-4 text-sm font-semibold ${
    type === "success" ? "text-green-600" : "text-red-600"
  }`;
  setTimeout(() => {
    messageEl.textContent = "";
  }, 3000);
}


 // Date du jour par défaut dans le champ date
 document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  });


  // 🚪 Déconnexion
const logoutBtn = document.querySelector("button.bg-red-500");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html"; // ou autre page de connexion
  });
}
