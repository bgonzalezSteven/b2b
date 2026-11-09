import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthService } from '@/services/auth.services';
import type { LoginDto, userData } from '@/types/auth';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  //Manejaremos un estilo de vista disinta, mas enfoacado en la logica de TS como si manejaramos un SetupStore
  //Estructura de los datos del store
  const user = ref<userData | null>(null);
  const router = useRouter(); // Accedemos al router para redirigir después del logout
  //Getters -> Funciones que devuelven valores calculados
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.roleId || null);

  //Actions -> Funciones que modifican el estado del store
  async function login(credentials: LoginDto) {
    try {
      const userData = await AuthService.login(credentials);
      user.value = userData;
      return true;
    } catch {
      user.value = null;
      return false;
    }
  }

  async function checkAuth(): Promise<boolean> {
    try {
      const userData = await AuthService.me();
      user.value = userData;
      return true;
    } catch {
      user.value = null;
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      user.value = null;
      await router.replace('/auth/login'); // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
    }
  }
  //Retornamos los valores y funciones del store como un setup normal de VUE<<<<<<<<<
  return {
    user,
    isAuthenticated,
    userRole,
    login,
    checkAuth,
    logout,
  };
});
