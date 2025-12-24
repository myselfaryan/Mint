import bcryptjs from "bcryptjs";

export async function hashPassword(password: string) {
  // Salt rounds 10 provides good security while being significantly faster
  // Each additional round doubles computation time (10 = ~100ms, 12 = ~400ms)
  return await bcryptjs.hash(password, 10);
}

export async function verifyPassword(hash: string, password: string) {
  return await bcryptjs.compare(password, hash);
}
