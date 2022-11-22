import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mayoristasGastosSchema } from 'src/mayoristas-gastos/schema/mayoristas-gastos.schema';
import { mayoristasIngresosSchema } from 'src/mayoristas-ingresos/schema/mayoristas-ingresos.schema';
import { ventasMayoristasSchema } from 'src/ventas-mayoristas/schema/ventas-mayoristas.schema';
import { CajasMayoristasController } from './cajas-mayoristas.controller';
import { CajasMayoristasService } from './cajas-mayoristas.service';
import { cajasMayoristasSchema } from './schema/cajas-mayoristas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'CajasMayoristas', schema: cajasMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'GastosMayoristas', schema: mayoristasGastosSchema}]),
    MongooseModule.forFeature([{name: 'IngresosMayoristas', schema: mayoristasIngresosSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristas', schema: ventasMayoristasSchema}]),
  ],
  controllers: [CajasMayoristasController],
  providers: [CajasMayoristasService]
})
export class CajasMayoristasModule {}
