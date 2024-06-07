import Axios from 'axios';

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
    return Promise.reject(error);
  }
);

export function getBaseUrl() {
  return `${window.location.protocol}//${window.location.hostname}`;
}

export function getUrl(path: string) {
  const base = getBaseUrl();
  return `${base}:80${path}`;
}
