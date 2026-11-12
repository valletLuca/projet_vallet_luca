import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { UniqueConstraintError } from "sequelize";
import db from "../models";
import { UserInstance } from "../models/users.model";
import { parseId, sendSaveError, sendServerError } from "../utils/http";
import { hashPassword, verifyPassword } from "../utils/password";

const Users = db.users;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;

const UNKNOWN_USER_HASH = hashPassword(randomUUID());

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Users.findAll({
      order: [
        ["lastName", "ASC"],
        ["firstName", "ASC"],
        ["id", "ASC"]
      ]
    });
    res.status(200).json(data.map(toPublicUser));
  } catch (err: unknown) {
    sendServerError(res, "Erreur lors de la récupération des utilisateurs", err);
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = readBody(req);
  const firstName = text(body.firstName);
  const lastName = text(body.lastName);
  const email = normalizeEmail(body.email);

  if (!firstName || !lastName || !email) {
    res.status(400).json({ message: "Les champs firstName, lastName et email sont obligatoires." });
    return;
  }
  const { password } = body;
  if (typeof password !== "string" || !isStrongPassword(password)) {
    res.status(400).json({
      message: `Le mot de passe doit contenir entre ${MIN_PASSWORD_LENGTH} et ${MAX_PASSWORD_LENGTH} caractères, dont une lettre et un chiffre.`
    });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const data = await Users.create({ firstName, lastName, email, passwordHash });
    res.status(201).json(toPublicUser(data));
  } catch (err: unknown) {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: "Cette adresse e-mail est déjà utilisée." });
      return;
    }
    sendSaveError(res, "Erreur lors de la création de l'utilisateur", err);
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  if (id === null) {
    res.status(400).json({ message: "Identifiant invalide." });
    return;
  }
  try {
    const deleted = await Users.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: `Aucun utilisateur trouvé avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    sendServerError(res, `Erreur lors de la suppression de l'utilisateur id=${id}`, err);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const body = readBody(req);
  const email = normalizeEmail(body.email);
  const { password } = body;

  if (!email || typeof password !== "string" || !password) {
    res.status(400).json({ message: "Les champs email et password sont obligatoires." });
    return;
  }
  try {
    const user = await Users.findOne({ where: { email } });
    const valid = await verifyPassword(password, user?.passwordHash ?? (await UNKNOWN_USER_HASH));
    if (user && valid) {
      res.status(200).json(toPublicUser(user));
    } else {
      res.status(401).json({ message: "E-mail ou mot de passe incorrect." });
    }
  } catch (err: unknown) {
    sendServerError(res, "Erreur lors de la connexion", err);
  }
};

function isStrongPassword(password: string): boolean {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH &&
    /\p{L}/u.test(password) &&
    /\d/.test(password)
  );
}

function readBody(req: Request): Record<string, unknown> {
  return (req.body ?? {}) as Record<string, unknown>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string {
  return text(value).toLowerCase();
}

function toPublicUser({ id, firstName, lastName, email, createdAt }: UserInstance) {
  return { id, firstName, lastName, email, createdAt };
}

export default { getAll, create, remove, login };
