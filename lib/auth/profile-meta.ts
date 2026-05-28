import type { User } from "@supabase/supabase-js";

/** Stored on `user.user_metadata` at sign-up (snake_case matches Supabase examples). */
export const PROFILE_FIRST_NAME_KEY = "first_name";
export const PROFILE_LAST_NAME_KEY = "last_name";

const PROFILE_GIVEN_NAME_KEYS = [
  PROFILE_FIRST_NAME_KEY,
  // Common Supabase / OAuth metadata keys
  "given_name",
  "givenName",
  "firstName",
];

const PROFILE_FAMILY_NAME_KEYS = [
  PROFILE_LAST_NAME_KEY,
  "family_name",
  "familyName",
  "lastName",
];

const PROFILE_AVATAR_URL_KEYS = [
  // Google OAuth commonly uses `picture`
  "picture",
  "picture_url",
  "photo_url",
  "avatar_url",
  "avatarUrl",
  "profile_picture",
];

const PROFILE_FULL_NAME_KEYS = [
  "full_name",
  "fullName",
  "name",
  "display_name",
  "displayName",
  "preferred_username",
  "preferredUsername",
  "user_name",
  "userName",
];

function readMetaString(
  user: User | null | undefined,
  key: string,
): string | null {
  const userMeta = user?.user_metadata as Record<string, unknown> | undefined;
  const appMeta = user?.app_metadata as Record<string, unknown> | undefined;

  const v = userMeta?.[key] ?? appMeta?.[key];
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function readFirstAvailableMetaString(
  user: User | null | undefined,
  keys: string[],
): string | null {
  for (const k of keys) {
    const v = readMetaString(user, k);
    if (v) return v;
  }
  return null;
}

/**
 * First token from a display/full name string (e.g. Google `name`: "Ada Lovelace").
 * Handles "Last, First" by taking the segment before the comma.
 */
export function getFirstNameFromFullNameString(
  fullName: string | null | undefined,
): string | null {
  const s = fullName?.trim();
  if (!s) return null;
  const beforeComma = s.split(",")[0]?.trim();
  const normalized = (beforeComma || s).replace(/\s+/g, " ");
  const first = normalized.split(" ")[0]?.trim();
  return first && first.length > 0 ? first : null;
}

/** First name for greetings (“Good morning, …”). */
export function getProfileFirstName(
  user: User | null | undefined,
): string | null {
  const given = readFirstAvailableMetaString(user, PROFILE_GIVEN_NAME_KEYS);
  if (given) return given;

  // Google (and many OAuth providers) often provide a single `name` string.
  const fullName = readFirstAvailableMetaString(user, PROFILE_FULL_NAME_KEYS);
  return getFirstNameFromFullNameString(fullName);
}

/** “First Last” when both exist; otherwise first or last alone. */
export function getProfileFullName(
  user: User | null | undefined,
): string | null {
  const explicitFirst = readFirstAvailableMetaString(
    user,
    PROFILE_GIVEN_NAME_KEYS,
  );
  const explicitLast = readFirstAvailableMetaString(
    user,
    PROFILE_FAMILY_NAME_KEYS,
  );
  if (explicitFirst && explicitLast) return `${explicitFirst} ${explicitLast}`;
  const full = readFirstAvailableMetaString(user, PROFILE_FULL_NAME_KEYS);
  if (full) return full.trim();
  if (explicitFirst) return explicitFirst;
  if (explicitLast) return explicitLast;
  return null;
}

/** Best-effort profile photo URL for greeting/avatar. */
export function getProfileAvatarUrl(
  user: User | null | undefined,
): string | null {
  return readFirstAvailableMetaString(user, PROFILE_AVATAR_URL_KEYS);
}

/**
 * First name for “Good morning, …” when present; otherwise `fallback` (e.g. “You”).
 * Does not use email — account email belongs in account UI (e.g. sidebar).
 */
export function getGreetingName(
  user: User | null | undefined,
  fallback: string,
): string {
  const first = getProfileFirstName(user);
  if (first) return first;
  return fallback;
}
