import { http } from '@/lib/http.ts';

export function getVirtualDevice() {
  return http.get('/api/vm/device/virtual');
}

export function updateVirtualDevice(device: string) {
  const data = {
    device
  };

  return http.post('/api/vm/device/virtual', data);
}
