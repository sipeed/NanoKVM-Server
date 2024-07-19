import { http } from '@/lib/http.ts';

export function getVersion(type?: string) {
  const data = {
    type: type ? type : ''
  };
  return http.get('/api/firmware/version', data);
}

export function update() {
  return http.request({
    method: 'post',
    url: '/api/firmware/update',
    timeout: 3 * 60 * 1000
  });
}

export function getLib() {
  return http.get('/api/firmware/lib');
}

export function updateLib() {
  return http.post('/api/firmware/lib/update');
}
