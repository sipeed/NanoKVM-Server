import { http } from '@/lib/http.ts';

export function getFrameDetect() {
  return http.get('/api/stream/mjpeg/detect');
}

export function updateFrameDetect() {
  return http.post('/api/stream/mjpeg/detect');
}

export function stopFrameDetect() {
  return http.post('/api/stream/mjpeg/detect/stop');
}
