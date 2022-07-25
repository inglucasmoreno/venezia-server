import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ingresosGastosSchema } from 'src/ingresos-gastos/schema/ingresos-gastos.schema';
import { ventasSchema } from 'src/ventas/schema/ventas.schema';
import { CajasController } from './cajas.controller';
import { CajasService } from './cajas.service';
import { cajasSchema } from './schema/cajas.schema';
import { saldoInicialSchema } from './schema/saldo-inicial.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Cajas', schema: cajasSchema}]),
    MongooseModule.forFeature([{name: 'SaldoInicial', schema: saldoInicialSchema}]),
    MongooseModule.forFeature([{name: 'IngresosGastos', schema: ingresosGastosSchema}]),
    MongooseModule.forFeature([{name: 'Ventas', schema: ventasSchema}]),
  ],
  controllers: [CajasController],
  providers: [CajasService]
})
export class CajasModule {}
