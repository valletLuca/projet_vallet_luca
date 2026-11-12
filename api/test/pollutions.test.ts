import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import db from "../src/models";
import { postJson, startApi, TestApi } from "./helpers";

const POLLUTION = {
  title: "Sacs plastiques sur la plage",
  type: "plastique",
  description: "Une vingtaine de sacs échoués en haut de plage.",
  observedAt: "2026-10-18",
  place: "Marseille",
  latitude: 43.26,
  longitude: 5.37
};

function toForm(fields: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }
  return form;
}

describe("API /api/pollutions", () => {
  let api: TestApi;
  let pollutions: string;

  before(async () => {
    api = await startApi();
    pollutions = `${api.url}/pollutions`;
  });
  after(() => api.close());
  beforeEach(() => db.pollutions.destroy({ where: {} }));

  const create = async (fields: object = POLLUTION) => (await postJson(pollutions, fields)).json();

  describe("POST /api/pollutions", () => {
    it("crée une pollution envoyée en JSON", async () => {
      const res = await postJson(pollutions, POLLUTION);
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.title, POLLUTION.title);
      assert.equal(body.latitude, POLLUTION.latitude);
      assert.equal(body.photoUrl, null);
    });

    it("crée une pollution envoyée en multipart, comme le fait le Front", async () => {
      const res = await fetch(pollutions, { method: "POST", body: toForm(POLLUTION) });

      assert.equal(res.status, 201);
      assert.equal((await res.json()).longitude, POLLUTION.longitude);
    });

    it("transforme la photo importée en data URL", async () => {
      const form = toForm(POLLUTION);
      form.append("photo", new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" }));

      const res = await fetch(pollutions, { method: "POST", body: form });

      assert.equal(res.status, 201);
      assert.equal((await res.json()).photoUrl, "data:image/png;base64,AQID");
    });

    it("refuse un fichier qui n'est pas une image (400)", async () => {
      const form = toForm(POLLUTION);
      form.append("photo", new File(["texte"], "a.txt", { type: "text/plain" }));

      const res = await fetch(pollutions, { method: "POST", body: form });

      assert.equal(res.status, 400);
    });

    const invalid: [string, Record<string, unknown>][] = [
      ["un titre vide", { title: " " }],
      ["un titre trop long", { title: "x".repeat(256) }],
      ["un lieu trop long", { place: "x".repeat(256) }],
      ["un type inconnu", { type: "sonore" }],
      ["une date mal formée", { observedAt: "18/10/2026" }],
      ["une date qui n'existe pas", { observedAt: "2026-02-31" }],
      ["une latitude non numérique", { latitude: "abc" }],
      ["une latitude absente", { latitude: undefined }],
      ["une latitude hors limites", { latitude: 91 }],
      ["une longitude hors limites", { longitude: -181 }]
    ];
    for (const [label, override] of invalid) {
      it(`refuse ${label} (400)`, async () => {
        const res = await postJson(pollutions, { ...POLLUTION, ...override });

        assert.equal(res.status, 400);
        assert.ok((await res.json()).message);
      });
    }
  });

  describe("GET /api/pollutions", () => {
    it("liste les pollutions, les plus récentes d'abord", async () => {
      await create({ ...POLLUTION, observedAt: "2026-01-01" });
      await create({ ...POLLUTION, observedAt: "2026-06-01" });

      const res = await fetch(pollutions);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.deepEqual(body.map((p: { observedAt: string }) => p.observedAt), ["2026-06-01", "2026-01-01"]);
    });
  });

  describe("GET /api/pollutions/:id", () => {
    it("renvoie le détail d'une pollution", async () => {
      const { id } = await create();

      const res = await fetch(`${pollutions}/${id}`);

      assert.equal(res.status, 200);
      assert.equal((await res.json()).id, id);
    });

    it("répond 404 si la pollution n'existe pas", async () => {
      assert.equal((await fetch(`${pollutions}/999`)).status, 404);
    });

    it("répond 400 si l'identifiant est invalide", async () => {
      assert.equal((await fetch(`${pollutions}/abc`)).status, 400);
    });

    it("répond 400 si l'identifiant dépasse la capacité d'un entier", async () => {
      assert.equal((await fetch(`${pollutions}/99999999999`)).status, 400);
    });
  });

  describe("PUT /api/pollutions/:id", () => {
    const put = (url: string, body: object) =>
      fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

    it("modifie la pollution et conserve sa date de création", async () => {
      const created = await create();

      const res = await put(`${pollutions}/${created.id}`, { ...POLLUTION, place: "Toulon" });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.place, "Toulon");
      assert.equal(body.createdAt, created.createdAt);
      assert.equal((await (await fetch(`${pollutions}/${created.id}`)).json()).place, "Toulon");
    });

    it("répond 404 si la pollution n'existe pas", async () => {
      assert.equal((await put(`${pollutions}/999`, POLLUTION)).status, 404);
    });

    it("refuse des données invalides (400)", async () => {
      const { id } = await create();

      assert.equal((await put(`${pollutions}/${id}`, { ...POLLUTION, type: "sonore" })).status, 400);
    });
  });

  describe("DELETE /api/pollutions/:id", () => {
    it("supprime la pollution (204)", async () => {
      const { id } = await create();

      const res = await fetch(`${pollutions}/${id}`, { method: "DELETE" });

      assert.equal(res.status, 204);
      assert.equal((await fetch(`${pollutions}/${id}`)).status, 404);
    });

    it("répond 404 si la pollution n'existe pas", async () => {
      assert.equal((await fetch(`${pollutions}/999`, { method: "DELETE" })).status, 404);
    });
  });
});
