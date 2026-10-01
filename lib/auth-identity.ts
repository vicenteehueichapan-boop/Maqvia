/** Identity claims supplied by the trusted Sites authentication boundary. */
export type AuthenticatedIdentity = {
  userId: string;
  email: string;
  fullName: string | null;
  displayName: string;
};

const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER = "oai-authenticated-user-full-name-encoding";

/** Never use this parser as proof that raw HTTP headers came from a trusted proxy. */
export function identityFromTrustedHeaders(
  headers: Pick<Headers, "get">,
): AuthenticatedIdentity | null {
  const userId = headers.get(USER_ID_HEADER)?.trim();
  const email = headers.get(USER_EMAIL_HEADER)?.trim();
  if (!userId || !email || userId.length > 256 || email.length > 254) return null;
  if (hasControlCharacters(userId) || !isPlausibleEmail(email)) return null;

  let fullName: string | null = null;
  const encodedName = headers.get(USER_FULL_NAME_HEADER);
  if (encodedName && headers.get(USER_FULL_NAME_ENCODING_HEADER) === "percent-encoded-utf-8") {
    try {
      const decoded = decodeURIComponent(encodedName).trim();
      if (decoded && decoded.length <= 200 && !hasControlCharacters(decoded)) fullName = decoded;
    } catch {
      // The name is optional. A malformed name must not invalidate a valid identity.
    }
  }

  return { userId, email, fullName, displayName: fullName ?? email };
}

/**
 * The flag is a deployment assertion, not a signature. It may only be enabled
 * when the edge removes visitor-supplied identity headers and blocks direct
 * access to the Worker. An independent public Worker must use real auth.
 */
export function platformIdentityEnabled(
  nodeEnv: string | undefined,
  trustedProxy: string | undefined,
): boolean {
  return nodeEnv === "development" || trustedProxy === "sites";
}

function hasControlCharacters(value: string): boolean {
  return /[\u0000-\u001f\u007f]/.test(value);
}

function isPlausibleEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !hasControlCharacters(email);
}
