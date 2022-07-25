import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngresosGastosController } from './ingresos-gastos.controller';
import { IngresosGastosService } from './ingresos-gastos.service';
import { ingresosGastosSchema } from './schema/ingresos-gastos.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: 'IngresosGastos', schema: ingresosGastosSchema}]),],
  controllers: [IngresosGastosController],
  providers: [IngresosGastosService]
})
export class IngresosGastosModule {}
