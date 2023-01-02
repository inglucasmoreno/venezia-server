import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { cobrosMayoristasSchema } from 'src/cobros-mayoristas/schema/cobros-mayoristas.schema';
import { cobrosPedidosSchema } from 'src/cobros-pedidos/schema/cobros-pedidos.schema';
import { cuentasCorrientesMayoristasSchema } from 'src/cuentas-corrientes-mayoristas/schema/cuentas-corrientes-mayoristas.schema';
import { mayoristasGastosSchema } from 'src/mayoristas-gastos/schema/mayoristas-gastos.schema';
import { mayoristasIngresosSchema } from 'src/mayoristas-ingresos/schema/mayoristas-ingresos.schema';
import { ventasMayoristasProductosSchema } from 'src/ventas-mayoristas-productos/schema/ventas-mayoristas-productos.schema';
import { ventasMayoristasSchema } from './schema/ventas-mayoristas.schema';
import { VentasMayoristasController } from './ventas-mayoristas.controller';
import { VentasMayoristasService } from './ventas-mayoristas.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'VentasMayoristas', schema: ventasMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristasProductos', schema: ventasMayoristasProductosSchema}]),
    MongooseModule.forFeature([{name: 'CuentasCorrientesMayoristas', schema: cuentasCorrientesMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CobrosMayoristas', schema: cobrosMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'CobrosPedidosMayoristas', schema: cobrosPedidosSchema}]),
    MongooseModule.forFeature([{name: 'MayoristasGastos', schema: mayoristasGastosSchema}]),
    MongooseModule.forFeature([{name: 'MayoristasIngresos', schema: mayoristasIngresosSchema}]),
  ],
  controllers: [VentasMayoristasController],
  providers: [VentasMayoristasService]
})
export class VentasMayoristasModule {}
