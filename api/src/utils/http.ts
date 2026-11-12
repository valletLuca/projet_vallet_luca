import { Request, Response } from "express";
import { ValidationError } from "sequelize";

const MAX_ID = 2147483647;

export function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 && id <= MAX_ID ? id : null;
}

export function sendSaveError(res: Response, context: string, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: `${context}: ${err.errors.map((e) => e.message).join(", ")}` });
    return;
  }
  sendServerError(res, context, err);
}

export function sendServerError(res: Response, context: string, err: unknown): void {
  console.error(`${context}:`, err);
  res.status(500).json({ message: `${context}.` });
}
