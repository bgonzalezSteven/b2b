import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt_payload.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['accessToken'] || null;
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  // EN observacion el metodo asincrono, haremos pruebas para ver que funcione y envie los datos necesarios si encuentra el token, de lo contrario envia null y no permite el acceso a la ruta protegida
  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      tenantId: payload.tenantId,
    };
  }
}
