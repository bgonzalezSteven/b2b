import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Una constante centralizada, en ella controlamos las opciones de las cookies.S
  private get cookiesOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };
  }
  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      ...this.cookiesOptions,
      maxAge: 15 * 60 * 1000, //Equivale a 15 minutos
    });

    res.cookie('refreshToken', refreshToken, {
      ...this.cookiesOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, //Equivale a 7 días
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.authService.login(loginDto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user, message: 'Acceso concedido', status: 200 };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Sesión cerrada correctamente', status: 200 };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refreshToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub; //Es el nombre que lleva dentro de nuestra inerfas strategy
    const refreshToken = req.user.refreshToken;
    const tokens = await this.authService.refreshToken(userId, refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {
      message: 'Token refreshed successfully',
      status: 200,
    };
  }
}
