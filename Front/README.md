# Front : TP 03, gestion des pollutions (CRUD)

## Lancer le projet

```bash
npm install   # la première fois
ng serve      # http://localhost:4200
ng build      # build de prod, sortie dans dist/front
```

## TP 03 : service, HttpClient et backend simulé

### Pages et routes

| Route | Page | Contenu |
|---|---|---|
| `/pollutions` | `pollution-list-page` | liste en cartes, filtres, suppression avec confirmation |
| `/pollutions/nouvelle` | `pollution-declaration-page` | formulaire en 3 étapes (création) |
| `/pollutions/:id` | `pollution-detail-page` | fiche détaillée, modifier, supprimer |
| `/pollutions/:id/modifier` | `pollution-declaration-page` | même formulaire, pré-rempli (modification) |

- `''` et les routes inconnues redirigent vers `/pollutions`. Chaque route a un `title` (onglet du navigateur).
- Le paramètre `:id` arrive directement en `@Input()` grâce à `withComponentInputBinding()`.
- Après un enregistrement, on arrive sur le détail avec un message « Déclaration enregistrée » ou « Modifications enregistrées », transmis par l'état de navigation (`router.navigate(..., { state })`).

### Service `PollutionService`

`features/pollution/services/pollution.service.ts`, injectable `providedIn: 'root'`, basé sur `HttpClient` :

| Méthode | Requête |
|---|---|
| `getAll()` | `GET /pollutions` |
| `getById(id)` | `GET /pollutions/:id` |
| `create(declaration)` | `POST /pollutions` |
| `update(id, declaration)` | `PUT /pollutions/:id` |
| `delete(id)` | `DELETE /pollutions/:id` |

- Les créations et modifications sont envoyées en **`multipart/form-data`** : c'est le seul format qui permet d'envoyer la photo importée (`File`) avec les autres champs.
- L'API renvoie une `Pollution` (`id`, `createdAt`, et `photoUrl` à la place du fichier).

### Environnements

| Fichier | Utilisé par | `apiUrl` |
|---|---|---|
| `src/environments/environment.development.ts` | `ng serve` | `http://localhost:3000/api` |
| `src/environments/environment.ts` | `ng build` (prod) | URL de l'API sur Render |

- La bascule se fait par `fileReplacements` dans `angular.json` (configuration `development`).
- L'URL de prod est provisoire : à mettre à jour quand l'API (dossier `api`) sera déployée.

### Backend simulé

- `core/mock-api/mock-api.interceptor.ts` est un `HttpInterceptorFn` qui répond aux requêtes `/pollutions` à la place du serveur : il gère les 5 routes CRUD, renvoie `404` pour un id inconnu et ajoute **400 ms de latence** pour voir les états de chargement.
- Il est activé par `mockApi: true` dans l'environnement. Le service ne sait pas qu'il parle à un faux backend : passer `mockApi` à `false` suffira pour brancher la vraie API.
- Les données de départ sont dans `mock-pollutions.ts`. Elles sont gardées **en mémoire** : un rechargement de la page les réinitialise.
- Une photo importée devient une URL `blob:` locale, comme une vraie API renverrait l'URL du fichier stocké.

### Liste et filtres

- Trois critères, combinables :
  - **recherche libre** dans le titre, le lieu, la description et le type, sans tenir compte des majuscules ni des accents (« depot » trouve « Dépôt ») ;
  - **type** de pollution ;
  - **période d'observation** (du / au, bornes incluses).
- Le filtrage se fait côté client, avec un `computed()` sur la liste et les filtres. La logique est une fonction pure dans `models/pollution-filters.ts`.
- La recherche attend 150 ms après la frappe (`debounceTime`).
- Tri du plus récent au plus ancien.
- États gérés : chargement (cartes fantômes), erreur avec « Réessayer », liste vide, aucun résultat avec « Réinitialiser les filtres ».

### Vue d'ensemble de la page Signalements

- **Carte en trame de points** (`components/pollution-map`) : la France est dessinée en SVG à partir d'un contour simplifié (`france-geometry.ts`). Chaque point de la trame est gardé s'il tombe à l'intérieur du contour (algorithme du lancer de rayon). Les coordonnées des pollutions sont projetées sur la carte : une épingle par signalement, à la couleur de son type. Les signalements écartés par les filtres sont estompés. Un clic sur une épingle ouvre le détail.
- **Survol synchronisé** : survoler une carte de la liste met en avant son épingle, et inversement (signal `activeId` dans la page).
- **Répartition par type** (`components/pollution-breakdown`) : une barre segmentée avec sa légende. Cliquer sur un type filtre la liste ; un second clic retire le filtre.
- **Deux affichages** : grille de cartes ou chronologie regroupée par mois (`components/pollution-timeline`). Le choix est retenu dans le `localStorage`.
- **Raccourci clavier** : `/` place le curseur dans la recherche.

### Suppression

- Depuis une carte de la liste ou depuis le détail, avec une **boîte de confirmation** (`shared/ui/confirm-dialog`, basée sur `<dialog>` : focus gardé dans la boîte, Échap, clic hors de la boîte).
- Le bouton reste sur « Suppression… » pendant la requête ; en cas d'échec, l'erreur s'affiche dans la boîte.

---

## Le formulaire de déclaration (TP 02)

1. Le formulaire est découpé en **3 étapes** avec un stepper :
   - **Quoi** : titre, type (liste déroulante), description.
   - **Où et quand** : date, lieu, latitude, longitude.
   - **Preuve** : la photo, optionnelle, par lien URL **ou** par import depuis l'appareil.
2. Le bouton **Déclarer** envoie la déclaration à l'API puis ouvre la fiche détaillée.
3. Depuis la fiche, **Modifier** rouvre le formulaire pré-rempli, à l'étape Quoi. Le bouton final s'appelle alors **Sauvegarder**.

## Architecture

```
src/
├── environments/                     URL de l'API selon l'environnement
└── app/
    ├── app.routes.ts                 routes de l'appli
    ├── core/
    │   ├── app-header/               header (logo, navigation)
    │   └── mock-api/                 backend simulé (intercepteur + données)
    ├── shared/ui/                    composants génériques
    │   ├── form-field/               label flottant, message d'erreur, compteur de caractères
    │   ├── stepper-header/           pastilles d'étapes et barre de progression
    │   ├── confirm-dialog/           boîte de confirmation modale
    │   └── page-state/               état vide, sans résultat ou en erreur
    └── features/pollution/
        ├── pollution-list-page/          CONTAINER : liste, filtres, suppression
        ├── pollution-detail-page/        CONTAINER : fiche détaillée
        ├── pollution-declaration-page/   CONTAINER : création et modification
        ├── services/                     PollutionService (appels HTTP)
        ├── components/
        │   ├── pollution-form/           le formulaire réactif
        │   ├── pollution-recap/          la fiche d'une pollution (actions projetées)
        │   ├── pollution-card/           carte d'une pollution dans la liste
        │   ├── pollution-filter-bar/     barre de filtres
        │   ├── photo-picker/             import d'une photo (clic ou glisser-déposer)
        │   └── photo-preview/            aperçu d'image (vide, chargement, ok, erreur)
        ├── validators/                   validateurs custom (ValidatorFn)
        ├── models/                       types métier et logique de filtrage
        ├── pollution-steps.ts            config des étapes (séparée du modèle)
        └── utils/file-size.ts
```

### Pattern container / presentational

- Les trois **pages** (liste, détail, déclaration) sont les seuls composants qui détiennent un état, sous forme de signals, et les seuls à appeler `PollutionService`.
- Les autres composants sont **presentational**. Ils reçoivent leurs données par `@Input()` et remontent les actions par `@Output()` + `EventEmitter`.
- Le flux de données va dans un seul sens :

```
déclaration ──[currentStep, initialValue, editing, saving]──▶ pollution-form ──(stepChange, declared)──▶ déclaration
liste ──[pollution]──▶ pollution-card ──(remove)──▶ liste
liste ◀──(filtersChange)── pollution-filter-bar
détail ──[pollution, status]──▶ pollution-recap (boutons d'action projetés par ng-content)
```

## Choix techniques

### Formulaire (Reactive Forms)

- Il y a **un seul `FormGroup` typé**, contenant un sous-groupe par étape : `what`, `where` et `evidence`. Le bouton « Suivant » est désactivé tant que le sous-groupe de l'étape courante est invalide.
- Les contrôles sont en `nonNullable: true` (sauf latitude et longitude, dont la valeur initiale est `null`) et la validation passe par `Validators`. On ne mélange pas avec `ngModel` ou `FormsModule`.
- Les étapes inactives sont **masquées en CSS**, pas retirées du DOM. Cela permet d'avoir l'animation de transition et de garder les valeurs quand on revient en arrière.
- La **soumission est verrouillée deux fois** : le bouton est `[disabled]="form.invalid"`, et `onSubmit()` revérifie `form.invalid`.
- Un petit verrou de 320 ms empêche qu'un double-clic sur « Suivant » à l'étape 2 valide aussitôt l'étape 3, puisque le bouton « Déclarer » apparaît au même endroit.

### Validations

| Champ | Règles |
|---|---|
| Titre | requis, de 5 à 80 caractères, pas uniquement des espaces |
| Type | requis, parmi Plastique, Chimique, Dépôt sauvage, Eau, Air, Autre |
| Description | requise, de 20 à 1000 caractères, pas uniquement des espaces |
| Date | requise, date valide, **pas dans le futur** |
| Lieu | requis, pas uniquement des espaces |
| Latitude et longitude | requises, nombres valides (volontairement **pas** de bornes) |
| Photo (fichier) | image uniquement, **5 Mo max** |
| Photo (URL) | optionnelle, sans validation de format |

- Les validateurs custom sont des fabriques de `ValidatorFn` dans `validators/`, à la manière de `Validators`.
- Les erreurs ne s'affichent qu'après qu'on a quitté le champ (`touched`), pour ne pas mettre du rouge partout dès le chargement de la page.

### Photo : lien URL ou import

- Un sélecteur **Lien URL | Importer** est lié à un contrôle `source`. Par défaut, c'est « Lien URL ».
- Le contrôle de la source non choisie est **désactivé** avec `disable()`. Il ne compte donc pas dans la validité : un fichier refusé ne bloque pas l'envoi si on repasse sur l'URL. Sa valeur est conservée si on revient sur l'onglet.
- **Import** :
  - `input type="file" accept="image/*"`, ce qui ouvre l'explorateur de fichiers sur ordinateur et la galerie sur téléphone. Le glisser-déposer marche aussi sur ordinateur.
  - Il n'existe pas d'accessor natif pour `type=file` en Reactive Forms : `photo-picker` émet le `File` et c'est le formulaire qui fait le `setValue`.
- **Aperçu** : on crée une URL temporaire avec `URL.createObjectURL`, que chaque composant libère dans `ngOnDestroy` pour éviter les fuites mémoire.
- Le `File` est gardé tel quel dans le modèle (`photoFile`) pour le futur envoi à l'API en `FormData`.
- Les photos HEIC (iPhone) sont acceptées, mais Chrome et Firefox ne savent pas les prévisualiser : l'aperçu l'indique.

### Préparation du backend

- `PollutionDeclaration` est l'interface typée envoyée à l'API, `Pollution` celle qu'elle renvoie.
- Depuis le TP 03, les pages passent par `PollutionService` (voir plus haut).

### UI

- Les couleurs, rayons, ombres sont des variables CSS dans `styles.scss`, avec une couleur par type de pollution pour le badge du récap.
- La date est affichée en français (`LOCALE_ID` à `fr` dans `app.config.ts`, avec `DatePipe` et `DecimalPipe`).
- Accessibilité :
  - labels liés aux champs, `aria-invalid` et `aria-describedby` vers les messages d'erreur ;
  - focus automatique sur le premier champ à chaque changement d'étape ;
  - `prefers-reduced-motion` respecté.
- Responsive testé.

## Limites connues

- Le backend est simulé : les données sont réinitialisées à chaque rechargement de la page.
- Pas de tests unitaires sur ces TP.
- `zone.js` est gardé, et non le mode zoneless, pour rester aligné sur le cours.
