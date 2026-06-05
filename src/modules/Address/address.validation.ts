import { z } from "zod";

/**
 * Bangladesh mobile number validator.
 * Accepts either the 11-digit local format (01XXXXXXXXX)
 * or the 10-digit country-code-stripped format (1XXXXXXXXX).
 */
const bdMobileSchema = z
  .string()
  .min(1, "Mobile number is required")
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      // Normalise: strip leading 0 if 11 digits
      const normalized =
        digits.length === 11 && digits.startsWith("0")
          ? digits.slice(1)
          : digits;
      return /^1[3-9]\d{8}$/.test(normalized);
    },
    { message: "Enter a valid Bangladeshi mobile number (e.g. 01712345678)" },
  );

const createAddressValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Address name is required"),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Building/Villa name is required"),
    address_2: z.string().min(1, "Flat/floor/apartment is required"),
    road: z.string().min(1, "Road is required"),
    area: z.string().optional().nullable(),
    landmark: z.string().optional().nullable(),
    latitude: z.string().optional().nullable(),
    longitude: z.string().optional().nullable(),
    mobile_country_code: z.string().optional(),
    mobile: bdMobileSchema,
    default: z.number().min(0).max(1).optional(),
  }),
});

const updateAddressValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    address_1: z.string().optional(),
    address_2: z.string().optional(),
    road: z.string().optional(),
    area: z.string().optional().nullable(),
    landmark: z.string().optional().nullable(),
    latitude: z.string().optional().nullable(),
    longitude: z.string().optional().nullable(),
    mobile_country_code: z.string().optional(),
    mobile: bdMobileSchema.optional(),
    default: z.number().min(0).max(1).optional(),
  }),
});

export const AddressValidations = {
  createAddressValidationSchema,
  updateAddressValidationSchema,
};
