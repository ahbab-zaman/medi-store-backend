import AppError from "../errors/AppError";

/**
 * Asserts that a required route parameter or user field is defined.
 * Throws a 400 AppError if the value is undefined or empty string.
 *
 * @example
 *   const id = requireParam(req.params.id, "id");
 */
export function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new AppError(400, `Required parameter "${name}" is missing`);
  }
  return value;
}
