//Definimos los tipos de cada dato que recibimos del front
export interface LoginDto {
  email: string;
  password: string;
}
// LO que envi del login y lo que quiero recibir de esa respuesta del backend
export interface userData {
  id: string;
  email: string;
  roleId: string;
  tenantId: string;
}
