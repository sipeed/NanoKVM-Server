const LANGUAGE_KEY = 'nano-kvm-language';
const RESOLUTION_KEY = 'nano-kvm-resolution';
const FPS_KEY = 'nano-kvm-fps';
const QUALITY_KEY = 'nano-kvm-quality';
const MOUSE_KEY = 'nano-kvm-mouse';

export function getLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || 'en';
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
