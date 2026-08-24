import { SetMetadata } from '@nestjs/common';
//Creamos el decorador para filtrar las rutas a roles especificos.
//Este paisano no entra sino tiene el rol de "..."
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
