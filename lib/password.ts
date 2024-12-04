import bcryptjs from "bcryptjs";

export async function hashPassword(password: string) {
  return await bcryptjs.hash(password, 12);
}

export async function verifyPassword(hash: string, password: string) {
  return await bcryptjs.compare(password, hash);
}
