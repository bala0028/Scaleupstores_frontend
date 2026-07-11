/**
 * Phone number helpers used by the OTP flows.
 *
 * Strategy:
 * - Accept what the user types (digits, spaces, dashes, parens, leading +).
 * - Strip everything except digits and a single leading +.
 * - If the result has 10 digits and the user didn't type a country code,
 *   prefix the supplied default country code (default +91 / India).
 * - Validate E.164: + followed by 8–15 digits.
 */

export const stripPhone = (raw: string): string => raw.replace(/[^\d+]/g, "");

export const isValidPhoneDigits = (raw: string): boolean =>
  /^\d{10,15}$/.test(raw.replace(/\D/g, ""));

/**
 * Normalize a phone string to E.164 (e.g. "+919876543210").
 * Returns null if the input can't be normalized.
 */
export function normalizePhone(
  raw: string,
  defaultCountryCode: string = "+91"
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 0) return null;

  if (hasPlus) {
    if (!/^\+\d{8,15}$/.test("+" + digits)) return null;
    return "+" + digits;
  }

  // No country code provided — prepend the default.
  // 10-digit numbers are assumed to be local (India default).
  if (digits.length === 10) {
    const cc = defaultCountryCode.replace(/\D/g, "");
    return "+" + cc + digits;
  }

  // 11–15 digits without + — treat as already including country code.
  if (digits.length >= 11 && digits.length <= 15) {
    return "+" + digits;
  }

  return null;
}
