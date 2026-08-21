import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.isActived) {
      throw new UnauthorizedException(
        'Invalid credentials or account not activated',
      );
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Una vez validado todo, procedemos a generar el token
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.roleId,
      user.tenantId,
    );

    //Almacenamos dentro de la BD el token necesario para actualizar
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      tokens,
      user: {
        ...user,
      },
    };
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.roleId,
      user.tenantId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  //Creacion del token
  async generateTokens(
    userId: string,
    email: string,
    roleId: string,
    tenantId: string | null,
  ) {
    const payload = { sub: userId, email, roleId, tenantId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m', //Token de corta duracion
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d', //Token de larga duracion
      }),
    ]);
    return { accessToken, refreshToken };
  }

  // Almacenamiento del token de actualizacion en la BD
  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}

// Servicio que se encarga de:
// Crear tokens, refrescar, guardar en bd y verificar que todo este bien en base a ello
// Unavez te logueas, te crea el token, almacena el fresh en la db
// Luego t valida el token de refresco, si es valido, te genera un nuevo token y actualiza el token de refresco en la db
// En caso de desloguearte elimina el token de refresco de la db, para que no pueda ser usado nuevamente
