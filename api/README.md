# API Pollution

API REST Node.js / Express / Sequelize / PostgreSQL de l'application Sillage.

## Routes

| Ressource   | Méthode  | Route                 | Description                                  |
| ----------- | -------- | --------------------- | -------------------------------------------- |
| Utilisateur | `POST`   | `/api/users`          | Créer un utilisateur                         |
| Utilisateur | `GET`    | `/api/users`          | Lister les utilisateurs                      |
| Utilisateur | `DELETE` | `/api/users/:id`      | Supprimer un utilisateur                     |
| Utilisateur | `POST`   | `/api/users/login`    | Vérifier des identifiants (auth. fictive)    |
| Pollution   | `GET`    | `/api/pollutions`     | Lister les pollutions                        |
| Pollution   | `GET`    | `/api/pollutions/:id` | Détail d'une pollution                       |
| Pollution   | `POST`   | `/api/pollutions`     | Ajouter une pollution (JSON ou multipart)    |
| Pollution   | `PUT`    | `/api/pollutions/:id` | Modifier une pollution (JSON ou multipart)   |
| Pollution   | `DELETE` | `/api/pollutions/:id` | Supprimer une pollution                      |

Exemple de création d'un utilisateur :

```json
{
  "firstName": "Alice",
  "lastName": "Dupont",
  "email": "alice@example.com",
  "password": "8 à 64 caractères, dont une lettre et un chiffre"
}
```

Le mot de passe est stocké haché (scrypt) et n'est jamais renvoyé.

L'authentification est **fictive** : `POST /api/users/login` vérifie les identifiants mais n'émet aucun
jeton, et les routes ne sont pas protégées. Le JWT prévu par le cahier des charges reste à ajouter.

## Lancer en local

```bash
npm install
npm run dev
```

La connexion se configure avec `DATABASE_URL`, ou à défaut `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
et `DB_NAME` (voir `src/config.ts`).

## Tests

Les tests tournent sur un vrai PostgreSQL et **vident les tables** : ils n'utilisent jamais `DATABASE_URL`
mais une base dédiée, à créer au préalable.

```bash
createdb pollution_db_test
npm test
```

La base par défaut est `postgres://postgres:postgres@localhost:5432/pollution_db_test`. Pour en viser une
autre, définir `TEST_DATABASE_URL`.
