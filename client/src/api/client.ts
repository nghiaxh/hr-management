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

function clearSessionCookies() {
  document.cookie = 'JSESSIONID=; Max-Age=0; path=/';
  document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      clearSessionCookies();
    }
    return Promise.reject(error);
  }
);

export default api;