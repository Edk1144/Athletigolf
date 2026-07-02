export const usernameRules = "Use 3-24 letters, numbers or underscores.";

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

export function isValidUsername(value: string) {
  return /^[a-z0-9_]{3,24}$/.test(normalizeUsername(value));
}
