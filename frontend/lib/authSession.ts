export const getAccessTokenExpiryMs = (token: string): number | null => {
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    return null;
  }

  try {
    const payloadSegment = tokenParts[1];
    const normalizedPayload = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: number };

    if (typeof payload.exp !== "number") {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export const isAccessTokenValid = (token: string, nowMs: number = Date.now()): boolean => {
  const expiry = getAccessTokenExpiryMs(token);
  if (!expiry) {
    return false;
  }

  return expiry > nowMs;
};
