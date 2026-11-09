/* Este layout es para las páginas privadas de la aplicación, donde el usuario ya ha iniciado
sesión. Contiene un header con información de estado y un menú lateral (sidebar) para la navegación
interna. Se utiliza el sistema de diseño de Quasar para estructurar la interfaz. El contenido
principal de cada página se inyecta dinámicamente en el
<router-view />
*/ Modificar a gusto pues es el menu principal
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Barra superior corporativa (Header) -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Botón para abrir/cerrar el menú lateral en pantallas móviles o escritorio -->
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold"> Plataforma B2B </q-toolbar-title>

        <!-- Información de estado o usuario en el header -->
        <div class="text-subtitle2">
          Modo Seguro
          <vs-button @click="authStore.logout()">Cerrar sesión</vs-button>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Menú lateral (Sidebar / Drawer) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list class="q-pa-sm">
        <q-item-label header class="text-weight-bold text-uppercase text-grey-7">
          Navegación
        </q-item-label>

        <!-- Enlace al Dashboard principal -->
        <q-item clickable v-ripple to="/" rounded class="q-my-xs">
          <q-item-section avatar>
            <q-icon name="dashboard" color="primary" />
          </q-item-section>
          <q-item-section class="text-weight-medium"> Dashboard </q-item-section>
        </q-item>

        <!-- Aquí podrás agregar más opciones de menú en el futuro (Clientes, Reportes, etc.) -->
      </q-list>
    </q-drawer>

    <!-- Contenedor principal donde se inyectarán todas tus páginas privadas -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
const authStore = useAuthStore();
// Estado reactivo para controlar la apertura del menú lateral
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
