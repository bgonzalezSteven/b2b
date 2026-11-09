/*import type { RouteRecordRaw } from 'vue-router';
const Routes: RouteRecordRaw[] = [
  //Los modelos de rutas los dividire en 2 partes
  // PUblicas y privadas
  // Divididas en las que requieren autenticacion y las que no
  {
    //Rutas privadas, con requiresAhth: true, estas rutas requieren que el usuario este autenticado
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/indexPage.vue'),
      },
    ],
  },
  {
    //Rutas publicas, con requiresAuth: false, estas rutas no requieren que el usuario este autenticado
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { requiresGuest: true }, // Este Guest valida si su sesion ya esta iniciada, asi evitar
        //Que se logueen 100veces
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];
export default Routes;*/
