import { Argon2id } from "oslo/password";

export async function hashPassword(password: string) {
  const argon2id = new Argon2id();
  return await argon2id.hash(password);
}

export async function verifyPassword(hash: string, password: string) {
  const argon2id = new Argon2id();
  return await argon2id.verify(hash, password);
}
