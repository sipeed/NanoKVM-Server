import { http } from '@/lib/http.ts';

export function power(type: string, duration: number) {
  const data = {
    type,
    duration
  };
  return http.post('/api/vm/power', data);
}

export function updateScreen(type: string, value: number) {
  const data = {
    type,
    value
  };
  return http.post('/api/vm/screen', data);
}

export function getLed() {
  return http.get('/api/vm/led');
}
