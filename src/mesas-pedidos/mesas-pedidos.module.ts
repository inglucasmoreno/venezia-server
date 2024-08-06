import { Module } from '@nestjs/common';
import { MesasPedidosController } from './mesas-pedidos.controller';
import { MesasPedidosService } from './mesas-pedidos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mesasSchema } from 'src/mesas/schema/mesas.schema';
import { mesasPedidosSchema } from './schema/mesas-pedidos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'MesasPedidos', schema: mesasPedidosSchema}]),
    MongooseModule.forFeature([{name: 'Mesas', schema: mesasSchema}])
  ],
  controllers: [MesasPedidosController],
  providers: [MesasPedidosService]
})
export class MesasPedidosModule {}
