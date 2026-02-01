import { z } from "zod";

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const UserValidation = {
  updateProfileSchema,
};
