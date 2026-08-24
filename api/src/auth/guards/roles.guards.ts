import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  // ESTO es nuevo para mi, un reflector es una herramienta de Nest para leer los Post-its
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    //Leemos los roles que hay dentro de la ruta
    if (!requiredRoles) {
      return true;
    }
    //Cogemos el usuario inyectado por JwtStrategy
    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException('No tienes permiso para esta accion');
    }
    return true;
  }
}
