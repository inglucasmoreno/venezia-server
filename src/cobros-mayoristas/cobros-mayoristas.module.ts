import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { cobrosPedidosSchema } from 'src/cobros-pedidos/schema/cobros-pedidos.schema';
import { cuentasCorrientesMayoristasSchema } from 'src/cuentas-corrientes-mayoristas/schema/cuentas-corrientes-mayoristas.schema';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';
import { ventasMayoristasSchema } from 'src/ventas-mayoristas/schema/ventas-mayoristas.schema';
import { CobrosMayoristasController } from './cobros-mayoristas.controller';
import { CobrosMayoristasService } from './cobros-mayoristas.service';
import { cobrosMayoristasSchema } from './schema/cobros-mayoristas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'CobrosMayoristas', schema: cobrosMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CobrosPedidos', schema: cobrosPedidosSchema}]),
    MongooseModule.forFeature([{name: 'Usuarios', schema: usuarioSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristas', schema: ventasMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CuentasCorrientesMayoristas', schema: cuentasCorrientesMayoristasSchema}]),
  ],
  controllers: [CobrosMayoristasController],
  providers: [CobrosMayoristasService]
})
export class CobrosMayoristasModule {}
