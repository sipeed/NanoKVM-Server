import Cookies from 'js-cookie';

export const COOKIE_TOKEN_KEY = 'nano-kvm-token';
export const COOKIE_LANGUAGE_KEY = 'nano-kvm-language';
export const COOKIE_RESOLUTION_KEY = 'nano-kvm-resolution';
export const COOKIE_FPS_KEY = 'nano-kvm-fps';
export const COOKIE_QUALITY_KEY = 'nano-kvm-quality';

export const encode = (obj: any) => window.btoa(JSON.stringify(obj));

export const decode = (str: string) => JSON.parse(window.atob(str));

export function getToken() {
  const token = Cookies.get(COOKIE_TOKEN_KEY);
  return token ? decode(token) : null;
}

export function setToken(token: any) {
  Cookies.set(COOKIE_TOKEN_KEY, encode(token), { expires: 60 });
}

export function removeToken() {
  Cookies.remove(COOKIE_TOKEN_KEY);
}

export function getLanguage() {
  const language = Cookies.get(COOKIE_LANGUAGE_KEY);
  return language ? language : 'en';
}

export function setLanguage(language: string) {
  Cookies.set(COOKIE_LANGUAGE_KEY, language, { expires: 999 });
}

export function getResolution() {
  const screen = Cookies.get(COOKIE_RESOLUTION_KEY);
  return screen ? decode(screen) : null;
}

export function setResolution(width: number, height: number) {
  const resolution = {
    width,
    height
  };
  Cookies.set(COOKIE_RESOLUTION_KEY, encode(resolution), { expires: 999 });
}

export function getFps() {
  const fps = Cookies.get(COOKIE_FPS_KEY);
  return fps ? Number(fps) : null;
}

export function setFps(fps: number) {
  Cookies.set(COOKIE_FPS_KEY, String(fps), { expires: 999 });
}

export function getQuality() {
  const quality = Cookies.get(COOKIE_QUALITY_KEY);
  return quality ? Number(quality) : null;
}

export function setQuality(quality: number) {
  Cookies.set(COOKIE_QUALITY_KEY, String(quality), { expires: 999 });
}
