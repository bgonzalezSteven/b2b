<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="bg-grey-1 flex flex-center">
      <!-- Aquí se inyectarán dinámicamente las páginas hijas (Login, Recuperar contraseña, etc.) -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>
