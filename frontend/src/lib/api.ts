import Axios from 'axios';

import { removeToken } from '@/lib/cookie.ts';

export const api = Axios.create();

api.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.log(error);
    const code = error.response?.status;
    if (code === 401) {
      removeToken();
    }
    return Promise.reject(error);
  }
);
