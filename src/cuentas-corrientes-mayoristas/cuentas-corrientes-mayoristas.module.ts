import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mayoristasSchema } from 'src/mayoristas/schema/mayoristas.dto.schema';
import { CuentasCorrientesMayoristasController } from './cuentas-corrientes-mayoristas.controller';
import { CuentasCorrientesMayoristasService } from './cuentas-corrientes-mayoristas.service';
import { cuentasCorrientesMayoristasSchema } from './schema/cuentas-corrientes-mayoristas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Mayoristas', schema: mayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CuentasCorrientesMayoristas', schema: cuentasCorrientesMayoristasSchema}]),
  ],
  controllers: [CuentasCorrientesMayoristasController],
  providers: [CuentasCorrientesMayoristasService]
})
export class CuentasCorrientesMayoristasModule {}
