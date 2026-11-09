import { defineRouter } from '#q-app';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

export default defineRouter(({ store }) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  let isInitialAuthCheckDone = false;

  Router.beforeEach(async (to) => {
    // Ya no necesitamos 'from' ni 'next'
    const authStore = useAuthStore(store);

    if (!isInitialAuthCheckDone) {
      await authStore.checkAuth();
      isInitialAuthCheckDone = true;
    }

    const requiresAuth = to.meta.requiresAuth;
    const requiresGuest = to.meta.requiresGuest;

    // CASO A: Ruta protegida sin sesión -> Redirige al login con retorno pendiente
    if (requiresAuth && !authStore.isAuthenticated) {
      return {
        path: '/auth/login',
        query: { redirect: to.fullPath },
      };
    }

    // CASO B: Ruta de invitado (login) con sesión activa -> Redirige al Dashboard
    if (requiresGuest && authStore.isAuthenticated) {
      return { path: '/' };
    }

    // Si todo está bien, simplemente no retornamos nada (permite el paso)
  });

  if (import.meta.hot) {
    handleHotUpdate(Router);
  }

  return Router;
});
