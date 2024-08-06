import { Module } from '@nestjs/common';
import { MesasPedidosProductosController } from './mesas-pedidos-productos.controller';
import { MesasPedidosProductosService } from './mesas-pedidos-productos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mesasPedidosProductosSchema } from './schema/mesas-pedidos-productos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'MesasPedidosProductos', schema: mesasPedidosProductosSchema}]),
  ],
  controllers: [MesasPedidosProductosController],
  providers: [MesasPedidosProductosService]
})
export class MesasPedidosProductosModule {}
