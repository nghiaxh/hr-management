import axios from 'axios';

function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));
  return match?.split('=').slice(1).join('=');
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN');
  if (token) {
    config.headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
  }
  return config;
});

export default api;