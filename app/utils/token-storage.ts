import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "auth_access_token";

const ID_TOKEN_KEY = "auth_id_token";

const ACCESS_TOKEN_EXP_KEY = "auth_access_token_exp";

const isWeb = Platform.OS === "web";

export async function saveAccessToken(
  token: string,
  expiresIn?: number
): Promise<void> {
  if (isWeb) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);

    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      sessionStorage.setItem(
        ACCESS_TOKEN_EXP_KEY,
        expiresAt.toString()
      );
    }
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

  if (expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    await SecureStore.setItemAsync(
      ACCESS_TOKEN_EXP_KEY,
      expiresAt.toString()
    );
  }
}

export async function saveIdToken(token: string): Promise<void> {
  if (isWeb) {
    sessionStorage.setItem(ID_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(ID_TOKEN_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  if (isWeb) {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getIdToken(): Promise<string | null> {
  if (isWeb) {
    return sessionStorage.getItem(ID_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(ID_TOKEN_KEY);
}

export async function isAccessTokenExpired(): Promise<boolean> {
  const exp = isWeb
    ? sessionStorage.getItem(ACCESS_TOKEN_EXP_KEY)
    : await SecureStore.getItemAsync(ACCESS_TOKEN_EXP_KEY);

  if (!exp) return true;
  return Date.now() >= Number(exp);
}

export async function clearTokens(): Promise<void> {
  if (isWeb) {
    sessionStorage.clear();
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_EXP_KEY);
}