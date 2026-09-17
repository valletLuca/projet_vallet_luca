"use strict";

// ===== Éléments de la page =====
var formulaire = document.getElementById("formulaire-inscription");
var carteFormulaire = document.getElementById("carte-formulaire");
var carteRecapitulatif = document.getElementById("carte-recapitulatif");
var zoneErreur = document.getElementById("message-erreur");
var boutonRetour = document.getElementById("bouton-retour");

// Libellé affiché dans les messages d'erreur pour chaque champ
var CHAMPS = [
    { id: "login", libelle: "Login" },
    { id: "motdepasse", libelle: "Mot de passe" },
    { id: "confirmation", libelle: "Confirmation du mot de passe" },
    { id: "nom", libelle: "Nom" },
    { id: "prenom", libelle: "Prénom" },
    { id: "adresse", libelle: "Adresse" },
    { id: "email", libelle: "Email" },
    { id: "telephone", libelle: "Téléphone" },
    { id: "naissance", libelle: "Date de naissance" }
];

var MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// ===== Affichage des messages =====
function afficherErreur(texte) {
    zoneErreur.textContent = texte;
    zoneErreur.hidden = false;
}

function masquerErreur() {
    zoneErreur.textContent = "";
    zoneErreur.hidden = true;
}

function marquerInvalide(id) {
    document.getElementById(id).classList.add("champ-invalide");
}

function reinitialiserMarquages() {
    CHAMPS.forEach(function (champ) {
        document.getElementById(champ.id).classList.remove("champ-invalide");
    });
}

function valeurDe(id) {
    return document.getElementById(id).value.trim();
}

// ===== Validation =====
// Retourne un message d'erreur, ou null si tout est correct.
function validerFormulaire() {
    // 1. Tous les champs sont remplis
    var champsVides = CHAMPS.filter(function (champ) {
        return valeurDe(champ.id) === "";
    });

    if (champsVides.length > 0) {
        champsVides.forEach(function (champ) {
            marquerInvalide(champ.id);
        });

        if (champsVides.length === 1) {
            return "Le champ « " + champsVides[0].libelle + " » est obligatoire.";
        }

        var libelles = champsVides.map(function (champ) {
            return champ.libelle;
        });
        return "Les champs suivants sont obligatoires : " + libelles.join(", ") + ".";
    }

    // 2. L'email est valide
    if (!MOTIF_EMAIL.test(valeurDe("email"))) {
        marquerInvalide("email");
        return "L'adresse email saisie n'est pas valide (exemple : nom@domaine.fr).";
    }

    // 3. Le mot de passe et sa confirmation correspondent
    if (valeurDe("motdepasse") !== valeurDe("confirmation")) {
        marquerInvalide("motdepasse");
        marquerInvalide("confirmation");
        return "Le mot de passe et sa confirmation ne correspondent pas.";
    }

    return null;
}

// ===== Récapitulatif =====
// Affiche une date au format jj/mm/aaaa (la valeur d'un input date est aaaa-mm-jj).
function formaterDate(valeur) {
    var morceaux = valeur.split("-");
    if (morceaux.length !== 3) {
        return valeur;
    }
    return morceaux[2] + "/" + morceaux[1] + "/" + morceaux[0];
}

// Toutes les informations saisies sont reprises, sauf le mot de passe.
function remplirRecapitulatif() {
    document.getElementById("recap-login").textContent = valeurDe("login");
    document.getElementById("recap-nom").textContent = valeurDe("nom");
    document.getElementById("recap-prenom").textContent = valeurDe("prenom");
    document.getElementById("recap-adresse").textContent = valeurDe("adresse");
    document.getElementById("recap-email").textContent = valeurDe("email");
    document.getElementById("recap-telephone").textContent = valeurDe("telephone");
    document.getElementById("recap-naissance").textContent = formaterDate(valeurDe("naissance"));
}

// ===== Soumission =====
formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault(); // pas de rechargement de la page

    reinitialiserMarquages();
    masquerErreur();

    var erreur = validerFormulaire();

    if (erreur !== null) {
        afficherErreur(erreur);
        return;
    }

    remplirRecapitulatif();
    carteFormulaire.hidden = true;
    carteRecapitulatif.hidden = false;
    window.scrollTo(0, 0);
});

// Retour au formulaire, les valeurs saisies sont conservées.
boutonRetour.addEventListener("click", function () {
    carteRecapitulatif.hidden = true;
    carteFormulaire.hidden = false;
    window.scrollTo(0, 0);
});

// Le message d'erreur disparaît dès que l'utilisateur corrige sa saisie.
CHAMPS.forEach(function (champ) {
    document.getElementById(champ.id).addEventListener("input", function () {
        this.classList.remove("champ-invalide");
        masquerErreur();
    });
});
