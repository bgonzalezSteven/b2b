import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet()); //Evitamos los envios constantes de cabeceras HTTP que puedan comprometer la seguridad de la aplicacion
  app.use(cookieParser()); //Para poder leer las cookies que se envian desde el cliente
  app.enableCors({
    //Habilitamos el CORS para poder recibir peticiones desde el cliente
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  });
  //Validamos los datos que se envian desde el cliente, pasandolos por los DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Elimina propiedades que no esten definidas en el DTO
      forbidNonWhitelisted: true, //Lanza un error si se envian propiedades que no esten definidas en el DTO
      transform: true, //Transforma los tipos de datos a los definidos en el DTO
    }),
  );

  //Documentamos todo porque se me olvidara algo seguramente, cada iniciacion aqui es para el funcionamiento de validaciones y seguridad
  // La idea principal es que se tenga total autonomia y total seguridad entre cada modulo, empresa, rol y demás de aqui vas a saltar a la creacion de los endspoint y configuracion de peticiones
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
