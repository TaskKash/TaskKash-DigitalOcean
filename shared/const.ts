export const COOKIE_NAME = "tk_session";
export const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days (was 1 year)
export const ONE_YEAR_MS = SESSION_EXPIRY_MS; // alias for backwards compat
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
