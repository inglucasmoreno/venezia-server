import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { cobrosMayoristasSchema } from 'src/cobros-mayoristas/schema/cobros-mayoristas.schema';
import { cobrosPedidosSchema } from 'src/cobros-pedidos/schema/cobros-pedidos.schema';
import { cuentasCorrientesMayoristasSchema } from 'src/cuentas-corrientes-mayoristas/schema/cuentas-corrientes-mayoristas.schema';
import { mayoristasGastosSchema } from 'src/mayoristas-gastos/schema/mayoristas-gastos.schema';
import { mayoristasIngresosSchema } from 'src/mayoristas-ingresos/schema/mayoristas-ingresos.schema';
import { ventasMayoristasProductosSchema } from 'src/ventas-mayoristas-productos/schema/ventas-mayoristas-productos.schema';
import { ventasMayoristasSchema } from 'src/ventas-mayoristas/schema/ventas-mayoristas.schema';
import { PaquetesController } from './paquetes.controller';
import { PaquetesService } from './paquetes.service';
import { paquetesSchema } from './schema/paquetes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Paquetes', schema: paquetesSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristas', schema: ventasMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristasProductos', schema: ventasMayoristasProductosSchema}]),
    MongooseModule.forFeature([{name: 'MayoristasGastos', schema: mayoristasGastosSchema}]),
    MongooseModule.forFeature([{name: 'MayoristasIngresos', schema: mayoristasIngresosSchema}]),
    MongooseModule.forFeature([{name: 'CuentasCorrientesMayoristas', schema: cuentasCorrientesMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CobrosMayoristas', schema: cobrosMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CobrosPedidos', schema: cobrosPedidosSchema}]),
  ],
  controllers: [PaquetesController],
  providers: [PaquetesService]
})
export class PaquetesModule {}
