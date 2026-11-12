import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt) as (password: string, salt: string, keyLength: number) => Promise<Buffer>;

const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, KEY_LENGTH);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [salt, key] = passwordHash.split(":");
  const candidate = await deriveKey(password, salt, KEY_LENGTH);
  return timingSafeEqual(candidate, Buffer.from(key, "hex"));
}
