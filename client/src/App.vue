<template>
  <!-- Renderiza dinámicamente el layout resuelto y tipado -->
  <component :is="resolvedLayout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 1. Tipamos explícitamente el glob de Vite
const layouts = import.meta.glob('@/layouts/*.vue') as Record<
  string,
  () => Promise<{ default: Component }>
>;

// 2. Computada inteligente con respaldo seguro para TypeScript
const resolvedLayout = computed(() => {
  const layoutName = (route.meta.layout as string) || 'MainLayout';
  const layoutPath = `/src/layouts/${layoutName}.vue`;
  const defaultPath = '/src/layouts/MainLayout.vue';

  // Obtenemos el loader del layout solicitado o caemos en MainLayout si no existe
  const loader = layouts[layoutPath] || layouts[defaultPath];

  if (!loader) {
    console.error(`[Layout Error]: No se encontró el layout predeterminado (MainLayout).`);
    return null;
  }

  return defineAsyncComponent(loader);
});
</script>
