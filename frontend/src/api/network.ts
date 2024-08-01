import { http } from '@/lib/http.ts';

export function wol(mac: string) {
  const data = {
    mac
  };
  return http.post('/api/network/wol', data);
}

export function getWolMacs() {
  return http.get('/api/network/wol/mac');
}

export function deleteWolMac(mac: string) {
  return http.request({
    method: 'delete',
    url: '/api/network/wol/mac',
    data: { mac }
  });
}
