# Ex 02 : service client, inscription d'un utilisateur

## Lancer le projet

```bash
npm install   # la première fois
npm run api   # terminal 1 : fausse API REST sur http://localhost:3000 (json-server)
ng serve      # terminal 2 : http://localhost:4200
ng build      # build de prod, sortie dans dist/ex02
```

## Ce que fait l'appli

1. Un formulaire d'inscription : prénom, nom, e-mail, mot de passe et confirmation.
2. Au clic sur **Créer mon compte**, le composant appelle `AuthService.signUp()`, qui :
   - fait un `GET /users?email=…` pour refuser un e-mail déjà utilisé ;
   - puis un `POST /users` pour créer le compte.
3. Pendant l'appel, le formulaire est désactivé et le bouton affiche un spinner.
4. En cas de succès, le formulaire laisse place à un message **« Bienvenue, {prénom} ! »**.
5. En cas d'échec :
   - e-mail déjà pris : erreur affichée directement sous le champ e-mail ;
   - serveur injoignable ou erreur serveur : bandeau d'erreur, les valeurs saisies sont conservées.

Pour tester le cas « e-mail déjà pris », utiliser `ada@sillage.fr` (présent dans `mock/db.json`).

## Architecture

```
src/
├── environments/
│   ├── environment.ts               prod : API publique JSONPlaceholder
│   └── environment.development.ts   dev  : json-server sur localhost:3000
└── app/
    ├── app.config.ts                provideHttpClient(withFetch())
    ├── const/                       toutes les constantes, un fichier par type
    │   ├── brand.const.ts                nom et slogan de l'appli
    │   ├── messages.const.ts             messages d'erreur d'inscription
    │   └── validation.const.ts           longueurs max/min, regex, règles du mot de passe
    ├── core/app-header/             header de l'appli (repris du TP 02)
    ├── shared/ui/form-field/        label flottant + message d'erreur (repris du TP 02)
    └── features/auth/
        ├── services/auth.service.ts      encapsule les appels HTTP
        ├── sign-up-page/                 CONTAINER : injecte le service, détient l'état
        ├── components/
        │   ├── sign-up-form/             formulaire réactif
        │   └── sign-up-result/           message de bienvenue
        ├── models/user.model.ts          SignUpRequest, User, SignUpError
        └── validators/                   not-blank, password-strength, match-field
mock/db.json                         données de la fausse API
```

### Flux de données

```
sign-up-form ──(submitted: SignUpRequest)──▶ sign-up-page ──signUp()──▶ AuthService ──HTTP──▶ API
sign-up-page ──[pending, error]──▶ sign-up-form
sign-up-page ──[firstName]──▶ sign-up-result
```

- **Seule la page injecte le service** (`inject(AuthService)`). Le formulaire et le résultat restent presentational : `@Input()` / `@Output()`, aucune dépendance HTTP.
- L'état de la page est en signals : `pending`, `error`, `createdUser`.
- L'abonnement est nettoyé avec `takeUntilDestroyed`, et `finalize` remet `pending` à `false` dans tous les cas.

## Choix techniques

### Le service

- `@Injectable({ providedIn: 'root' })` : un singleton disponible partout, sans le déclarer dans un `providers`.
- `HttpClient` est fourni une seule fois dans `app.config.ts` avec `provideHttpClient(withFetch())`.
- L'URL est construite à partir de `environment.apiUrl` : aucune URL en dur dans le code.
- Le service **traduit les erreurs HTTP en erreur métier** (`SignUpError` avec une raison `email-taken`, `network` ou `server`). Le composant n'a pas à manipuler `HttpErrorResponse` ni les codes de statut.
- La réponse de l'API contient le mot de passe : le service ne garde que les champs utiles (`id`, `firstName`, `lastName`, `email`, `createdAt`).

### Variables d'environnement

- `angular.json` remplace `environment.ts` par `environment.development.ts` en configuration `development` (`fileReplacements`), donc :
  - `ng serve` appelle `http://localhost:3000` ;
  - `ng build` appelle `https://jsonplaceholder.typicode.com`.

### Validations

| Champ | Règles |
|---|---|
| Prénom, nom | requis, 50 caractères max, pas uniquement des espaces |
| E-mail | requis, format valide **avec extension de domaine**, 254 caractères max, pas déjà utilisé (vérifié par l'API) |
| Mot de passe | requis, 8 à 64 caractères, au moins une lettre et un chiffre |
| Confirmation | requise, identique au mot de passe |

- Les règles du mot de passe sont affichées en direct sous le champ.
- La confirmation est revalidée à chaque modification du mot de passe.
- L'e-mail est mis en minuscules et les noms sont `trim()` avant l'envoi.

## Limites connues

- json-server et JSONPlaceholder sont de **fausses API** : le mot de passe est stocké en clair dans `mock/db.json`, et JSONPlaceholder ne persiste rien (il renvoie toujours l'id `11`). Un vrai backend hacherait le mot de passe et vérifierait l'unicité de l'e-mail lui-même.
- La vérification « e-mail déjà pris » côté front n'est pas atomique : c'est au backend de garantir l'unicité.
- Pas de tests unitaires sur cet exercice.
