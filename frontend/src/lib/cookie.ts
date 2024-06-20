import Cookies from 'js-cookie';

import { decrypt, encrypt } from '@/lib/encrypt.ts';

const COOKIE_TOKEN_KEY = 'nano-kvm-token';

export const encode = (obj: any) => window.btoa(JSON.stringify(obj));
export const decode = (str: string) => JSON.parse(window.atob(str));

export function existToken() {
  const token = Cookies.get(COOKIE_TOKEN_KEY);
  return !!token;
}

export function getToken() {
  const token = Cookies.get(COOKIE_TOKEN_KEY);
  if (!token) return null;

  const decryptToken = decrypt(token);
  return JSON.parse(decryptToken);
}

export function setToken(token: any) {
  const encryptToken = encrypt(JSON.stringify(token));
  Cookies.set(COOKIE_TOKEN_KEY, encryptToken, { expires: 365 });
}

export function removeToken() {
  Cookies.remove(COOKIE_TOKEN_KEY);
}
