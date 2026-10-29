import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import db from "../models";
import { POLLUTION_TYPES, PollutionCreationAttributes } from "../models/pollutions.model";

const Pollutions = db.pollutions;

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({
      order: [
        ["observedAt", "DESC"],
        ["id", "DESC"]
      ]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    sendServerError(res, "Erreur lors de la récupération des données de pollution", err);
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  if (id === null) {
    res.status(400).json({ message: "Identifiant invalide." });
    return;
  }
  try {
    const data = await Pollutions.findByPk(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    sendServerError(res, `Erreur lors de la récupération de la pollution id=${id}`, err);
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const fields = readFields(req);
  if (typeof fields === "string") {
    res.status(400).json({ message: fields });
    return;
  }
  try {
    const data = await Pollutions.create(fields);
    res.status(201).json(data);
  } catch (err: unknown) {
    sendSaveError(res, "Erreur lors de la création de la pollution", err);
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  if (id === null) {
    res.status(400).json({ message: "Identifiant invalide." });
    return;
  }
  const fields = readFields(req);
  if (typeof fields === "string") {
    res.status(400).json({ message: fields });
    return;
  }
  try {
    const data = await Pollutions.findByPk(id);
    if (!data) {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
      return;
    }
    await data.update(fields);
    res.status(200).json(data);
  } catch (err: unknown) {
    sendSaveError(res, `Erreur lors de la mise à jour de la pollution id=${id}`, err);
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  if (id === null) {
    res.status(400).json({ message: "Identifiant invalide." });
    return;
  }
  try {
    const deleted = await Pollutions.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    sendServerError(res, `Erreur lors de la suppression de la pollution id=${id}`, err);
  }
};

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function readFields(req: Request): PollutionCreationAttributes | string {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const text = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");

  const title = text("title");
  const type = text("type");
  const description = text("description");
  const observedAt = text("observedAt");
  const place = text("place");
  const latitude = Number(text("latitude"));
  const longitude = Number(text("longitude"));

  if (!title || !description || !place) {
    return "Les champs title, description et place sont obligatoires.";
  }
  if (!(POLLUTION_TYPES as readonly string[]).includes(type)) {
    return `Le type doit être l'un de : ${POLLUTION_TYPES.join(", ")}.`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(observedAt)) {
    return "observedAt doit être une date au format AAAA-MM-JJ.";
  }
  if (!text("latitude") || !text("longitude") || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "latitude et longitude doivent être des nombres.";
  }

  const photoUrl = req.file
    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
    : text("photoUrl") || null;

  return {
    title,
    type: type as PollutionCreationAttributes["type"],
    description,
    observedAt,
    place,
    latitude,
    longitude,
    photoUrl
  };
}

function sendSaveError(res: Response, context: string, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: `${context}: ${err.errors.map((e) => e.message).join(", ")}` });
    return;
  }
  sendServerError(res, context, err);
}

function sendServerError(res: Response, context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ message: `${context}: ${message}` });
}

export default { getAll, getById, create, update, remove };
