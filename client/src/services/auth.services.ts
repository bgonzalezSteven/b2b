//Esta estructura es nueva para mi. Los servicios al igual que es nestJs, manejarán la logica del sistema
//Asi evitamos sobrecargar los state de pinia de informacion
import { api } from '@/boot/axios';
import type { LoginDto, userData } from '@/types/auth';
// Recordar siempre que se trae una interfaz se tipea la importacion

export const AuthService = {
  //Para mantener la logica, diversion y aprende mas  al uso de esto, siempre el HUMOR xd
  // RECUERDA las funcions de TS son function (interfaz que define lo que recibimos): Promise<interfaz que define el tipo de funcion que es y que devuelve>
  async login(data: LoginDto): Promise<userData> {
    const response = await api.post<userData>('/auth/login', data, {
      meta: {
        successMsg: '¡BIENVENIDO Capitán!',
      },
    });
    return response.data;
  },
  // Peticiones de este tipo, nos hace la consulta al back y si todo sale bien, devuelve el mensaje a axios y los datos para el store
  async logout(): Promise<void> {
    await api.post(
      '/auth/logout',
      {},
      {
        meta: {
          successMsg: '¡Adiós!',
        },
      },
    );
  },
  async me(): Promise<userData> {
    const response = await api.get<userData>('/auth/me', {
      meta: {
        // Si el usuario recarga la pagina y no esta logueado
        // Silenciamos la notifiacion para que no salga nada rojo por ahi
        //SINO que se va al login pero en 0.5
        skipErrorNotify: true,
      },
    });
    return response.data;
  },
};
