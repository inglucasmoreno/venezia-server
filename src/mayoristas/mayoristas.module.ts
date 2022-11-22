import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { cuentasCorrientesMayoristasSchema } from 'src/cuentas-corrientes-mayoristas/schema/cuentas-corrientes-mayoristas.schema';
import { MayoristasController } from './mayoristas.controller';
import { MayoristasService } from './mayoristas.service';
import { mayoristasSchema } from './schema/mayoristas.dto.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Mayoristas', schema: mayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CuentasCorrientes', schema: cuentasCorrientesMayoristasSchema}]),
  ],
  controllers: [MayoristasController],
  providers: [MayoristasService],
  exports: [MayoristasService]
})
export class MayoristasModule {}
