import { z } from "zod";

export const registerParticipantSchema = z.object({
  userId: z.number().int().positive(),
});
