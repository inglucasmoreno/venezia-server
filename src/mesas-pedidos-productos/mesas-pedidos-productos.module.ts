import { Module } from '@nestjs/common';
import { MesasPedidosProductosController } from './mesas-pedidos-productos.controller';
import { MesasPedidosProductosService } from './mesas-pedidos-productos.service';

@Module({
  controllers: [MesasPedidosProductosController],
  providers: [MesasPedidosProductosService]
})
export class MesasPedidosProductosModule {}
