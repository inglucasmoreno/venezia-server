import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InicializacionController } from './inicializacion.controller';
import { InicializacionService } from './inicializacion.service';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';
import { unidadMedidaSchema } from 'src/unidad-medida/schema/unidad-medida.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Usuario', schema: usuarioSchema}]),
    MongooseModule.forFeature([{name: 'UnidadMedida', schema: unidadMedidaSchema}])
  ],
  controllers: [InicializacionController],
  providers: [InicializacionService]
})
export class InicializacionModule {}
