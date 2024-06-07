import Cookies from 'js-cookie';

export const COOKIE_TOKEN_KEY = 'nano-kvm-token';
export const COOKIE_LANGUAGE_KEY = 'nano-kvm-language';

export const encode = (obj: any) => window.btoa(JSON.stringify(obj));

export const decode = (str: string) => JSON.parse(window.atob(str));

export function getToken() {
  const token = Cookies.get(COOKIE_TOKEN_KEY);
  return token ? decode(token) : null;
}

export function setToken(token: any) {
  Cookies.set(COOKIE_TOKEN_KEY, encode(token));
}

export function removeToken() {
  Cookies.remove(COOKIE_TOKEN_KEY);
}

export function getLanguage() {
  const language = Cookies.get(COOKIE_LANGUAGE_KEY);
  return language ? language : 'en';
}

export function setLanguage(language: string) {
  Cookies.set(COOKIE_LANGUAGE_KEY, language);
}
