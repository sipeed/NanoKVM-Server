import { http } from '@/lib/http.ts';

export function power(type: string, second?: number) {
  const data = {
    type,
    second: second ? second : 0
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
