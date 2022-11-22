import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CobrosPedidosController } from './cobros-pedidos.controller';
import { CobrosPedidosService } from './cobros-pedidos.service';
import { cobrosPedidosSchema } from './schema/cobros-pedidos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'CobrosPedidos', schema: cobrosPedidosSchema}]),
  ],
  controllers: [CobrosPedidosController],
  providers: [CobrosPedidosService]
})
export class CobrosPedidosModule {}
