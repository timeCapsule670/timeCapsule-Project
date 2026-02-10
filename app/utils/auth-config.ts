// authConfig.ts
import { requireEnv } from "@/project/env";
import * as AuthSession from "expo-auth-session";


/**
 * Required environment variables
 */
const TENANT_NAME = requireEnv("EXPO_PUBLIC_AUTH_TENANT_NAME");
const CLIENT_ID = requireEnv("EXPO_PUBLIC_AUTH_CLIENT_ID");
const API_CLIENT_ID = requireEnv("EXPO_PUBLIC_AUTH_API_CLIENT_ID");
const USER_FLOW = requireEnv("EXPO_PUBLIC_AUTH_USER_FLOW");
const SCOPE_DOMAIN = requireEnv("EXPO_PUBLIC_SCOPE_DOMAIN");
const TENANT_ID = requireEnv("EXPO_PUBLIC_AUTH_TENANT_ID");

/**
 * Derived values
 */
const AUTHORITY_HOST = `${TENANT_NAME}.ciamlogin.com`;
const TENANT_DOMAIN = `${TENANT_NAME}.onmicrosoft.com`;

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "timecapsule.app",
});

/**
 * OAuth scopes
 */
export const scopes = [
  "openid",
  "profile",
  "email",
  `api://${API_CLIENT_ID}/access_as_user`,
];

/**
 * OIDC discovery document
 */
export const discovery = {
  authorizationEndpoint:
    `https://${AUTHORITY_HOST}/${TENANT_DOMAIN}/oauth2/v2.0/authorize`,
  tokenEndpoint:
    `https://${AUTHORITY_HOST}/${TENANT_ID}/oauth2/v2.0/token`,
};

/**
 * Exported config object
 */
export const authConfig = {
  tenantId: TENANT_ID,
  clientId: CLIENT_ID,
  apiClientId: API_CLIENT_ID,
  userFlow: USER_FLOW,
  redirectUri,
  scopes,
  discovery,
};

/**
 * Startup logging (safe for public values)
 */
console.info("🔐 Auth configuration loaded:");
console.info(`• Tenant: ${TENANT_NAME}`);
console.info(`• Client ID: ${CLIENT_ID}`);
console.info(`• API Scope: api://${API_CLIENT_ID}/access_as_user`);
console.info(`• User Flow: ${USER_FLOW}`);
console.info(`• Redirect URI: ${redirectUri}`);