<route lang="yaml">
meta:
  layout: AuthLayout
  requiresGuest: true
</route>
<!--Fraccion de este encabezado maneja la seguridad y uso de cada layout, basicamenre indica a que medula osea pertenece esta pagina-->
<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card
      flat
      bordered
      class="q-pa-lg shadow-2"
      style="width: 500px; max-width: 90%; border-radius: 1rem"
    >
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bold text-primary">Bienvenido</div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">Ingresa a tu cuenta B2B</div>
      </q-card-section>

      <q-card-section class="q-mt-md">
        <div class="con-form">
          <vs-input v-model="form.email" block label="Correo electrónico" type="email" label-float>
            <template #message-danger>{{ v$.email.$errors[0]?.$message }}</template>
          </vs-input>
          <vs-input v-model="form.password" block label="Contraseña" type="password" label-float>
            <template #message-danger>{{ v$.password.$errors[0]?.$message }}</template>
          </vs-input>
          <vs-button
            block
            :loading="active == 1"
            @click="handleLogin"
            color="success"
            class="q-mt-lg"
            >Iniciar sesión</vs-button
          >
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const active = ref<number>(0);
const form = reactive({
  email: '',
  password: '',
});

const rules = computed(() => ({
  email: {
    required: helpers.withMessage('El correo electrónico es requerido', required),
    email: helpers.withMessage('Debe ser un correo electrónico válido', email),
  },
  password: {
    required: helpers.withMessage('La contraseña es requerida', required),
  },
}));

const v$ = useVuelidate(rules, form);

const handleLogin = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;
  try {
    active.value = 1;
    // Recuerda.
    /* Manejamos una arquitectura similar a Nest dentro de Vue, es decir que: usamos un Store y un Service dentro
    del Store de pinia.
    Siguiendo esa linea, auth.store solo maneja la reactividad y el estado de la autenticación, mientras que auth.service se encarga de las llamadas a la API y la lógica de negocio relacionada con la autenticación
   */
    const success = await authStore.login({
      email: form.email,
      password: form.password,
    });
    if (success) {
      const redirectPath = (route.query.redirect as string) || '/';
      await router.push(redirectPath);
    }
    active.value = 0;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
  } finally {
    v$.value.$reset();
  }
};
</script>
