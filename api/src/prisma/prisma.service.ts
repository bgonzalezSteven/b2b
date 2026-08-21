import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  //Constructo para inicializar y dar una variable de entorno
  constructor() {
    const pgAdapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    //LLamado del constructor
    super({
      adapter: pgAdapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn'] // Logs en desarrollo
          : ['error'], // Solo errores en producción
    });
  }

  /*Module Init
    Un Hook que se ejecuta cuando el modulo se inicializa
  */
  async onModuleInit() {
    console.log('Conectando con Pg....');
    try {
      await this.$connect();
      console.log('Conectado');
    } catch (error) {
      console.log('Error de conexion:', error);
      throw error;
    }
  }

  /* 
  Module Destroy
  Hoksque se ejecuta al cerrar el app
  */
  async onModuleDestroy() {
    console.log('Desconectando de Pg...');
    await this.$disconnect();
    console.log('Desconectado ...');
  }
}
