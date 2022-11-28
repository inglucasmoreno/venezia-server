import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';
import { MayoristasGastosController } from './mayoristas-gastos.controller';
import { MayoristasGastosService } from './mayoristas-gastos.service';
import { mayoristasGastosSchema } from './schema/mayoristas-gastos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Gastos', schema: mayoristasGastosSchema}]),
    MongooseModule.forFeature([{name: 'Usuario', schema: usuarioSchema}]),
  ],
  controllers: [MayoristasGastosController],
  providers: [MayoristasGastosService]
})
export class MayoristasGastosModule {}
