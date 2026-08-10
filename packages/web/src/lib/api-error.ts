import axios from "axios";

/**
 * The API answers with `{ error }` for handled failures and
 * `{ error, errors[] }` for schema rejections. Both are worth showing verbatim —
 * "Day 3 needs a workout" is the whole point of the publish check.
 */
export const apiErrorMessage = (err: unknown, fallback: string): string => {
  if (!axios.isAxiosError(err)) return fallback;

  const data = err.response?.data as
    | { error?: string; errors?: Array<{ field: string; message: string }> }
    | undefined;

  if (data?.errors?.length) {
    return data.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
  }
  return data?.error ?? fallback;
};
