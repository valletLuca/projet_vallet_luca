# Front : TP 02, déclaration d'une pollution

## Lancer le projet

```bash
npm install   # la première fois
ng serve      # http://localhost:4200
ng build      # build de prod, sortie dans dist/front
```

## Ce que fait l'appli

1. Le formulaire est découpé en **3 étapes** avec un stepper :
   - **Quoi** : titre, type (liste déroulante), description.
   - **Où et quand** : date, lieu, latitude, longitude.
   - **Preuve** : la photo, optionnelle, par lien URL **ou** par import depuis l'appareil.
2. Le bouton **Déclarer** masque le formulaire et affiche le **récap** via `@Input()`, dans la même page.
3. Depuis le récap :
   - **Modifier** rouvre le formulaire pré-rempli, à l'étape Quoi. Le bouton final s'appelle alors **Sauvegarder**.
   - **Nouvelle déclaration** repart d'un formulaire vide.

## Architecture

```
src/app/
├── core/app-header/            header de l'appli (logo et slogan)
├── shared/ui/                  composants génériques réutilisables pour le projet final
│   ├── form-field/             label flottant, message d'erreur, compteur de caractères
│   └── stepper-header/         pastilles d'étapes et barre de progression
└── features/pollution/
    ├── pollution-declaration-page/   CONTAINER : détient l'état de la page
    ├── components/
    │   ├── pollution-form/           le formulaire réactif
    │   ├── pollution-recap/          le récapitulatif
    │   ├── photo-picker/             import d'une photo (clic ou glisser-déposer)
    │   └── photo-preview/            aperçu d'image (vide, chargement, ok, erreur)
    ├── validators/                   validateurs custom (ValidatorFn)
    ├── models/pollution.model.ts     types métier, prêts pour la future API
    ├── pollution-steps.ts            config des étapes (séparée du modèle)
    └── utils/file-size.ts
```

### Pattern container / presentational

- **`pollution-declaration-page`** est le seul composant qui détient l'état applicatif, sous forme de signals : l'étape courante, la déclaration validée et le brouillon utilisé par « Modifier ».
- Les autres composants sont **presentational**. Ils reçoivent leurs données par `@Input()` et remontent les actions par `@Output()` + `EventEmitter`.
- Le flux de données va dans un seul sens :

```
page ──[currentStep, initialValue, editing]──▶ pollution-form ──(stepChange, declared)──▶ page
page ──[pollution]──▶ pollution-recap ──(edit, restart)──▶ page
```

- L'affichage formulaire ou récap passe par un `@if` dans la page.

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

- `PollutionDeclaration` est l'interface typée qui sera envoyée à l'API.
- Il n'y a **pas encore de service** : ce sera pour le TP où on branche `HttpClient`.

### UI

- Les couleurs, rayons, ombres sont des variables CSS dans `styles.scss`, avec une couleur par type de pollution pour le badge du récap.
- La date est affichée en français (`LOCALE_ID` à `fr` dans `app.config.ts`, avec `DatePipe` et `DecimalPipe`).
- Accessibilité :
  - labels liés aux champs, `aria-invalid` et `aria-describedby` vers les messages d'erreur ;
  - focus automatique sur le premier champ à chaque changement d'étape ;
  - `prefers-reduced-motion` respecté.
- Responsive testé.

## Limites connues

- Aucune donnée n'est persistée.
- Pas de tests unitaires sur ce TP.
- `zone.js` est gardé, et non le mode zoneless, pour rester aligné sur le cours.
