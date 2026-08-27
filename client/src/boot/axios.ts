import { defineBoot } from '#q-app';
import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import { Notify } from 'quasar';

// Nuevo codigo y formato de TS, mantendremos la logica antigua de siempre pero ligando a lo cagarla conla nueva sintaxis xd

// Vamos a usar meta como propiedad, asi manejaremos un poco de manera externa la logica
// de los mensajes traidos segun la operacion

declare module 'axios' {
  export interface AxiosRequestConfig {
    meta?: {
      successMsg?: string;
      errorMsg?: string;
      skipErrorNotify?: boolean;
    };
  }
}
// Con este modelo, la idea es sustitutir los ciclos de validacion de cada peticion
// pasamos de tener un if(interpector.method === "post") y el if (si todo sale bien y el codigo es tal) -> imprimo el meensaje tal
// Validamos los metadatos, asi desde la peticion, si todo sale bien ya enviamos el mensaje
// OJO ES UNA PRUEBA; SI NO FUNCIONA; VOLVEMOS A LO ANTIGUO XD

const api: AxiosInstance = axios.create({
  baseURL: process.env.baseUrl || 'http://localhost:3000',
  withCredentials: true, // Aqui es donde cambiamos del JWt tradicional al uso de cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];
// Validaremos el uso de un solo refresh al token, si hay 3 peticiones a la vez
// no me refresh cada 3 veces sino el token va expirar pronto

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

// Como de costrumbre, interceptores para captar los fallos/buenos rovenientes del api

export default defineBoot(({ router, app }) => {
  api.interceptors.response.use(
    (response) => {
      if (response.config.meta?.successMsg) {
        Notify.create({
          type: 'positive',
          message: response.config.meta.successMsg,
          position: 'bottom',
        });
      }
      return response;
    },

    async (error: AxiosError<{ message?: string | string[] }>) => {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean };
      // Validamos el error 401 que no viene de un login o refresh
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          // En segundo plano renovamos sesion
          await api.post('/auth/refresh');
          processQueue(null);
          return api(originalRequest); //Reintentamos la peticion original
        } catch (refreshError) {
          processQueue(refreshError as AxiosError);
          //En caso de una falla general, es que expiro todo, asi que volvemos al inicio
          Notify.create({
            type: 'negative',
            message: 'Sesión expirada ...',
            position: 'top-right',
          });
          await router.push('/auth/login');
          return Promise.reject(
            refreshError instanceof Error ? refreshError : new Error(String(refreshError)),
          );
        } finally {
          isRefreshing = false;
        }
      }

      // Configuramos los errores globales de cada peticion
      // Inclyendo el skyErrorNotify para silenciar en caso de...

      if (error.response && !originalRequest?.url?.includes('/auth/refresh')) {
        const rawMessaage = error.response.data?.message;
        const apiMsg = Array.isArray(rawMessaage)
          ? rawMessaage.join(', ')
          : rawMessaage || 'Ocurrio un error inesperado';
        const message = originalRequest?.meta?.errorMsg || apiMsg || 'Ayuda, no sé que paso';
        //Si la peticion viene del login, no mostramos nadita
        if (!originalRequest.url?.includes('/auth/login')) {
          Notify.create({
            type: 'negative',
            message,
            position: 'top-right',
          });
        }
      }
      return Promise.reject(error);
    },
  );

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api, axios };
