const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Chargement des variables d'environnement depuis .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Liste pour stocker les numéros de suivi soumis pendant la session
let submittedTrackingNumbers = new Set();

// Middleware de vérification de mot de passe
function verifyPassword(req, res, next) {
  const motDePasseSoumis = req.body.mot_de_passe; // Récupération du mot de passe soumis dans le formulaire
  const motDePasseAttendu = process.env.MOT_DE_PASSE; // Récupération du mot de passe depuis .env

  if (!motDePasseSoumis || motDePasseSoumis !== motDePasseAttendu) {
    return res.status(401).send("Accès non autorisé. Mot de passe incorrect.");
  }

  // Si le mot de passe est correct, passez à la prochaine étape de middleware
  next();
}

// Route pour gérer la soumission du formulaire avec vérification de mot de passe
app.post("/submit", verifyPassword, (req, res) => {
  const data = req.body;
  const numSuivi = data.num_suivi;

  // Vérifier si le numéro de suivi est déjà soumis pendant la session
  if (submittedTrackingNumbers.has(numSuivi)) {
    return res
      .status(409)
      .send("Le BILLOT LOADING N° est déjà enregistré dans cette session.");
  }

  // Lire les données existantes du fichier Lucasdb.json
  const dbPath = path.join(__dirname, "Lucasdb.json");
  let existingData = [];
  if (fs.existsSync(dbPath)) {
    const fileContent = fs.readFileSync(dbPath, "utf-8");
    existingData = JSON.parse(fileContent || "[]");
  }

  // Vérifier si le numéro de suivi est déjà présent dans la base de données
  const isDuplicate = existingData.some((item) => item.num_suivi === numSuivi);
  if (isDuplicate) {
    return res
      .status(409)
      .send(
        "Ce BILLOT LOADING N° est déjà présent dans notre base de données !"
      );
  }

  // Ajouter le numéro de suivi à la liste des soumis
  submittedTrackingNumbers.add(numSuivi);

  // Ajouter les nouvelles données
  existingData.push(data);

  // Écrire les données mises à jour dans le fichier
  fs.writeFileSync(dbPath, JSON.stringify(existingData, null, 2));

  // Rediriger l'utilisateur vers la page d'impression
  res.redirect(`/print/${numSuivi}`);
});

// Route pour générer la page d'impression
app.get("/print/:num_suivi", (req, res) => {
  const numSuivi = req.params.num_suivi;

  // Lire les données existantes du fichier Lucasdb.json
  const dbPath = path.join(__dirname, "Lucasdb.json");
  if (fs.existsSync(dbPath)) {
    const fileContent = fs.readFileSync(dbPath, "utf-8");
    const existingData = JSON.parse(fileContent || "[]");

    // Trouver les données correspondant au BILLOT LOADING N°
    const item = existingData.find((data) => data.num_suivi === numSuivi);

    if (item) {
      // Générer le contenu HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Page d'Impression</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              margin: 0;
              padding: 0;
              background-color: #f0f0f0;
            }
            .container {
              width: 80%;
              margin: 40px auto;
              padding: 30px;
              background-color: #fff;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border-radius: 10px;
              page-break-inside: avoid;
            }
            .header, .footer {
              text-align: center;
              margin-bottom: 40px;
            }
            .header h1 {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 60px;
            }
            .footer p {
              font-size: 18px;
              margin-top: 20px;
            }
            .content {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding-top: 20px;
              padding-bottom: 20px;
              margin-bottom: 40px;
              margin-left: 15%;
              margin-right: 15%;
            }
            .content p {
              font-size: 18px;
              line-height: 1.6;
              margin: 15px 0;
            }
            .content p strong {
              font-weight: bold;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            @media print {
              body {
                background-color: #fff;
              }
              .container {
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border: none;
                page-break-inside: avoid;
                margin-top : 10%;
              }
              .header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                text-align: center;
                margin: 0;
              }
              .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                margin: 0;
              }
              .content {
                margin-top: 100px;
                margin-bottom: 100px;
                padding-top: 20px;
                padding-bottom: 20px;
                page-break-inside: avoid;
              }
              .content p {
                font-size: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FORMULAIRE D'ENVOI</h1>
            </div>
            <div class="content">
              <p><strong>Nom du Client:</strong> ${item.client_name}</p>
              <p><strong>Nom du Navire:</strong> ${item.vessels_name}</p>
              <p><strong>Port de Chargement:</strong> ${item.port_loading}</p>
              <p><strong>Port de Déchargement:</strong> ${item.port_discharge}</p>
              <p><strong>ETD:</strong> ${item.date_exp}</p>
              <p><strong>ETA:</strong> ${item.eta}</p>
              <p><strong>BILLOT LOADING N°:</strong> ${item.num_suivi}</p>
              <p><strong>Containers N°:</strong> ${item.containers_no}</p>
            </div>
            <div class="footer">
              <p>Merci d'avoir choisi notre agence, à très bientôt !</p>
            </div>
          </div>
        </body>
        </html>
      `;

      res.send(htmlContent);
    } else {
      res.status(404).send("Aucune donnée trouvée pour ce BILLOT LOADING N°.");
    }
  } else {
    res
      .status(500)
      .send(
        "Erreur interne du serveur. Impossible de lire la base de données."
      );
  }
});

// Route pour rechercher les données par BILLOT LOADING N°
app.get("/search/:num_suivi", (req, res) => {
  const numSuiviRecherche = req.params.num_suivi;

  // Lire les données existantes du fichier Lucasdb.json
  const dbPath = path.join(__dirname, "Lucasdb.json");
  if (fs.existsSync(dbPath)) {
    const fileContent = fs.readFileSync(dbPath, "utf-8");
    const existingData = JSON.parse(fileContent || "[]");

    // Recherche des données correspondant au BILLOT LOADING N°
    const searchData = existingData.filter(
      (item) => item.num_suivi === numSuiviRecherche
    );

    if (searchData.length > 0) {
      res.json(searchData); // Envoyer les données trouvées en tant que réponse JSON
    } else {
      res.status(404).send("Aucune donnée trouvée pour ce BILLOT LOADING N°.");
    }
  } else {
    res
      .status(500)
      .send(
        "Erreur interne du serveur. Impossible de lire la base de données."
      );
  }
});

// Route pour gérer la suppression du colis avec vérification de mot de passe
app.delete("/remove", verifyPassword, (req, res) => {
  const { num_suivi, mot_de_passe } = req.body;

  // Lire les données existantes du fichier Lucasdb.json
  const dbPath = path.join(__dirname, "Lucasdb.json");
  if (fs.existsSync(dbPath)) {
    const fileContent = fs.readFileSync(dbPath, "utf-8");
    let existingData = JSON.parse(fileContent || "[]");

    // Filtrer les données pour supprimer le colis correspondant
    const newData = existingData.filter((item) => item.num_suivi !== num_suivi);

    // Écrire les données mises à jour dans le fichier
    fs.writeFileSync(dbPath, JSON.stringify(newData, null, 2));

    // Retourner un message de confirmation
    res.send("Vous avez retiré le colis avec succès !");
  } else {
    res
      .status(500)
      .send(
        "Erreur interne du serveur. Impossible de lire la base de données."
      );
  }
});

app.listen(PORT, () => {
  console.log(`Le serveur marche au port http://localhost:${PORT}`);
});
