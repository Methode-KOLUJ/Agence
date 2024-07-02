document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search_button");
  const retirerButton = document.getElementById("retirer_button");

  searchButton.addEventListener("click", function () {
    const numSuivi = document.getElementById("num_suivi_search").value.trim();

    if (numSuivi !== "") {
      fetch(`/search/${numSuivi}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP! Statut: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.length > 0) {
            displaySearchResult(data[0]);
          } else {
            alert("Aucune donnée trouvée pour ce BILLOT LOADING N°.");
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données:", error);
          alert("Une erreur est survenue lors de la recherche des données.");
        });
    } else {
      alert("Veuillez entrer un BILLOT LOADING N°.");
    }
  });

  retirerButton.addEventListener("click", function () {
    const form = document.getElementById("colis_form");
    const numSuivi = form.elements["num_suivi"].value.trim();
    const motDePasse = form.elements["mot_de_passe"].value.trim();

    if (numSuivi !== "" && motDePasse !== "") {
      fetch("/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ num_suivi: numSuivi, mot_de_passe: motDePasse }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP! Statut: ${response.status}`);
          }
          return response.text();
        })
        .then((message) => {
          alert(message);
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression des données:", error);
          alert("Une erreur est survenue lors de la suppression des données.");
        });
    } else {
      alert("Veuillez entrer le BILLOT LOADING N° et le mot de passe.");
    }
  });

  function displaySearchResult(data) {
    const form = document.getElementById("colis_form");

    // Remplir les champs du formulaire avec les données récupérées
    form.elements["client_name"].value = data.client_name || "";
    form.elements["vessels_name"].value = data.vessels_name || "";
    form.elements["port_loading"].value = data.port_loading || "";
    form.elements["port_discharge"].value = data.port_discharge || "";
    form.elements["date_exp"].value = data.date_exp || "";
    form.elements["eta"].value = data.eta || "";
    form.elements["num_suivi"].value = data.num_suivi || "";
    form.elements["containers_no"].value = data.containers_no || "";
    form.elements["mot_de_passe"].value = ""; // Effacer le champ mot de passe par mesure de sécurité
  }
});

// Code de retrait

document.addEventListener("DOMContentLoaded", function () {
  const codeRetraitInput = document.getElementById("num_suivi");
  if (codeRetraitInput) {
    codeRetraitInput.value = genererCode();
  }
});

function genererCode() {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const codeUtilises = new Set();
  while (true) {
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        code += "-";
      }
      const index = Math.floor(Math.random() * caracteres.length);
      code += caracteres.charAt(index);
    }
    if (!codeUtilises.has(code)) {
      codeUtilises.add(code);
      return code;
    }
    code = "";
  }
}
