//Vamos a crear un interceptor general para los negocios
//para evitar que el tenantId ande vagando por ahi
// sino que este oculto!
// Asi evitamos que pueda ser extraido, pero a su vez validamos el uso de para peticiones
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    //Sino hay usuario, es accesso publico
    if (!user) {
      return next.handle();
    }
    //SI soy yo, opero sobre cualquier tenatId
    if (user.role === 'role_admin') {
      return next.handle();
    }

    //Validamos si es un usiario normal o un tenantId, obligandolo a operar sobre su id

    if (user.tenantId) {
      if (request.body) {
        request.body.tenantId = user.tenantId;
      }
      if (request.query) {
        request.query.tenantId = user.tenantId;
      }
    } else {
      throw new ForbiddenException('Usuario sin tenant asignado');
    }
    return next.handle();
  }
}
