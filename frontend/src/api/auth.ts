// apiAuth.POST("/auth/password", auth.ChangePassword) // 修改密码

import { http } from '@/lib/http';

export function login(username: string, password: string) {
  const data = {
    username,
    password
  };
  return http.post('/api/auth/login', data);
}

export function changePassword(username: string, password: string) {
  const data = {
    username,
    password
  };
  return http.post('/api/auth/password', data);
}
