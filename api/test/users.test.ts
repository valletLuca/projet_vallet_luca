import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import db from "../src/models";
import { postJson, startApi, TestApi } from "./helpers";

const ALICE = {
  firstName: "Alice",
  lastName: "Dupont",
  email: "alice@example.com",
  password: "motdepasse1"
};

describe("API /api/users", () => {
  let api: TestApi;
  let users: string;

  before(async () => {
    api = await startApi();
    users = `${api.url}/users`;
  });
  after(() => api.close());
  beforeEach(() => db.users.destroy({ where: {} }));

  describe("POST /api/users", () => {
    it("crée un utilisateur sans jamais renvoyer le mot de passe", async () => {
      const res = await postJson(users, ALICE);
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.firstName, "Alice");
      assert.equal(body.lastName, "Dupont");
      assert.equal(body.email, "alice@example.com");
      assert.ok(Number.isInteger(body.id));
      assert.ok(body.createdAt);
      assert.deepEqual(Object.keys(body).sort(), ["createdAt", "email", "firstName", "id", "lastName"]);
    });

    it("ne stocke pas le mot de passe en clair", async () => {
      await postJson(users, ALICE);

      const stored = await db.users.findOne({ where: { email: ALICE.email } });

      assert.ok(stored);
      assert.ok(!stored.passwordHash.includes(ALICE.password));
    });

    it("sale chaque mot de passe : deux mots de passe identiques ont des empreintes différentes", async () => {
      await postJson(users, ALICE);
      await postJson(users, { ...ALICE, email: "bob@example.com" });

      const stored = await db.users.findAll();

      assert.notEqual(stored[0].passwordHash, stored[1].passwordHash);
    });

    it("normalise l'e-mail (espaces et majuscules)", async () => {
      const res = await postJson(users, { ...ALICE, email: "  Alice@Example.COM " });

      assert.equal((await res.json()).email, "alice@example.com");
    });

    it("refuse un e-mail déjà utilisé, sans tenir compte de la casse (409)", async () => {
      await postJson(users, ALICE);

      const res = await postJson(users, { ...ALICE, email: "ALICE@example.com" });

      assert.equal(res.status, 409);
      assert.ok((await res.json()).message);
    });

    const invalid: [string, Record<string, unknown>][] = [
      ["un prénom vide", { firstName: "   " }],
      ["un nom absent", { lastName: undefined }],
      ["un e-mail invalide", { email: "pas-un-mail" }],
      ["un mot de passe trop court", { password: "court1" }],
      ["un mot de passe trop long", { password: `a1${"x".repeat(63)}` }],
      ["un mot de passe sans chiffre", { password: "motdepasse" }],
      ["un mot de passe sans lettre", { password: "12345678" }],
      ["un prénom trop long", { firstName: "x".repeat(256) }],
      ["un e-mail trop long", { email: `${"x".repeat(250)}@example.com` }],
      ["un mot de passe qui n'est pas une chaîne", { password: 12345678 }]
    ];
    for (const [label, override] of invalid) {
      it(`refuse ${label} (400)`, async () => {
        const res = await postJson(users, { ...ALICE, ...override });

        assert.equal(res.status, 400);
        assert.ok((await res.json()).message);
      });
    }
  });

  describe("GET /api/users", () => {
    it("renvoie une liste vide sans utilisateur", async () => {
      const res = await fetch(users);

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), []);
    });

    it("liste les utilisateurs par nom, sans mot de passe", async () => {
      await postJson(users, { ...ALICE, lastName: "Zola", email: "z@example.com" });
      await postJson(users, ALICE);

      const body = await (await fetch(users)).json();

      assert.deepEqual(body.map((u: { lastName: string }) => u.lastName), ["Dupont", "Zola"]);
      assert.ok(body.every((u: object) => !("passwordHash" in u) && !("password" in u)));
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("supprime l'utilisateur (204)", async () => {
      const { id } = await (await postJson(users, ALICE)).json();

      const res = await fetch(`${users}/${id}`, { method: "DELETE" });

      assert.equal(res.status, 204);
      assert.deepEqual(await (await fetch(users)).json(), []);
    });

    it("répond 404 si l'utilisateur n'existe pas", async () => {
      const res = await fetch(`${users}/999`, { method: "DELETE" });

      assert.equal(res.status, 404);
    });

    it("répond 400 si l'identifiant est invalide", async () => {
      const res = await fetch(`${users}/abc`, { method: "DELETE" });

      assert.equal(res.status, 400);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(() => postJson(users, ALICE));

    it("connecte avec les bons identifiants, sans renvoyer le mot de passe", async () => {
      const res = await postJson(`${users}/login`, { email: ALICE.email, password: ALICE.password });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.email, ALICE.email);
      assert.ok(!("passwordHash" in body));
    });

    it("accepte l'e-mail quelle que soit la casse", async () => {
      const res = await postJson(`${users}/login`, { email: "ALICE@example.com", password: ALICE.password });

      assert.equal(res.status, 200);
    });

    it("refuse un mauvais mot de passe (401)", async () => {
      const res = await postJson(`${users}/login`, { email: ALICE.email, password: "mauvais-mot" });

      assert.equal(res.status, 401);
    });

    it("donne la même réponse pour un compte inconnu, pour ne pas révéler les e-mails", async () => {
      const wrongPassword = await postJson(`${users}/login`, { email: ALICE.email, password: "mauvais-mot" });
      const unknownEmail = await postJson(`${users}/login`, { email: "x@example.com", password: "mauvais-mot" });

      assert.equal(unknownEmail.status, 401);
      assert.deepEqual(await unknownEmail.json(), await wrongPassword.json());
    });

    it("refuse une requête incomplète (400)", async () => {
      const res = await postJson(`${users}/login`, { email: ALICE.email });

      assert.equal(res.status, 400);
    });
  });

  it("répond en JSON à un corps JSON mal formé (400)", async () => {
    const res = await fetch(users, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{oups"
    });

    assert.equal(res.status, 400);
    assert.ok((await res.json()).message);
  });
});
