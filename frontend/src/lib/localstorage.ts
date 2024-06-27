const LANGUAGE_KEY = 'nano-kvm-language';
const RESOLUTION_KEY = 'nano-kvm-resolution';
const FPS_KEY = 'nano-kvm-fps';
const QUALITY_KEY = 'nano-kvm-quality';
const MOUSE_KEY = 'nano-kvm-mouse';
const SKIP_UPDATE_KEY = 'nano-kvm-check-update';

type Item = {
  value: string;
  expiry: number;
};

// 设置带过期事件的值（单位：毫秒）
function setWithExpiry(key: string, value: string, ttl: number) {
  const now = new Date();

  const item: Item = {
    value: value,
    expiry: now.getTime() + ttl
  };

  localStorage.setItem(key, JSON.stringify(item));
}

// 获取带过期时间的值
function getWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item: Item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

export function getLanguage() {
  const lang = localStorage.getItem(LANGUAGE_KEY);
  if (lang) return lang;

  if (navigator.language.indexOf("zh") > -1) {
    return "zh"
  }

  return "en"
}

export function setLanguage(language: string) {
  localStorage.setItem(LANGUAGE_KEY, language);
}

export function getResolution() {
  const resolution = localStorage.getItem(RESOLUTION_KEY);
  return resolution ? JSON.parse(window.atob(resolution)) : null;
}

export function setResolution(width: number, height: number) {
  const resolution = {
    width,
    height
  };

  localStorage.setItem(RESOLUTION_KEY, window.btoa(JSON.stringify(resolution)));
}

export function getFps() {
  const fps = localStorage.getItem(FPS_KEY);
  return fps ? Number(fps) : null;
}

export function setFps(fps: number) {
  localStorage.setItem(FPS_KEY, String(fps));
}

export function getQuality() {
  const quality = localStorage.getItem(QUALITY_KEY);
  return quality ? Number(quality) : null;
}

export function setQuality(quality: number) {
  localStorage.setItem(QUALITY_KEY, String(quality));
}

export function getMouse() {
  return localStorage.getItem(MOUSE_KEY);
}

export function setMouse(mouse: string) {
  localStorage.setItem(MOUSE_KEY, mouse);
}

export function getSkipUpdate() {
  const skip = getWithExpiry(SKIP_UPDATE_KEY);
  if (skip) {
    return Boolean(skip);
  }
  return false;
}

export function setSkipUpdate(skip: boolean) {
  const expiry = 3 * 24 * 60 * 60 * 1000; // 3天
  setWithExpiry(SKIP_UPDATE_KEY, String(skip), expiry);
}