import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';
import { MayoristasIngresosController } from './mayoristas-ingresos.controller';
import { MayoristasIngresosService } from './mayoristas-ingresos.service';
import { mayoristasIngresosSchema } from './schema/mayoristas-ingresos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Ingresos', schema: mayoristasIngresosSchema}]),
    MongooseModule.forFeature([{name: 'Usuario', schema: usuarioSchema}]),
  ],
  controllers: [MayoristasIngresosController],
  providers: [MayoristasIngresosService]
})
export class MayoristasIngresosModule {}
