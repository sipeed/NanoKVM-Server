import { http } from '@/lib/http.ts';

export function getImages() {
  return http.get('/api/storage/images');
}

export function getMountedImage() {
  return http.get('/api/storage/images/mounted');
}

export function mountImage(file?: string) {
  const data = {
    file: file ? file : ''
  };
  return http.post('/api/storage/image/mount', data);
}

export function resetHid() {
  return http.post('/api/storage/hid/reset');
}

export function getUploadUrl() {
  const base = http.getBaseURL();
  return `${base}/api/storage/image/upload`;
}
