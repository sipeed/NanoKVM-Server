import { http } from '@/lib/http.ts';

export function getInfo() {
  return http.get('/api/vm/info');
}

export function setGpio(type: string, duration: number) {
  const data = {
    type,
    duration
  };
  return http.post('/api/vm/gpio', data);
}

export function getLedGpio() {
  return http.get('/api/vm/gpio/led');
}

export function updateScreen(type: string, value: number) {
  const data = {
    type,
    value
  };
  return http.post('/api/vm/screen', data);
}
