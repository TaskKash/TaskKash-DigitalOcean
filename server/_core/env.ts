function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[ENV] FATAL: Missing required environment variable: ${key}`);
  return val;
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  // Critical secrets — throw at import time if missing
  cookieSecret: requireEnv('JWT_SECRET'),
  databaseUrl: requireEnv('DATABASE_URL'),
  // Optional services — fall back to empty string
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
