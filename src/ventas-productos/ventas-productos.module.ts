import { Module } from '@nestjs/common';
import { VentasProductosController } from './ventas-productos.controller';
import { VentasProductosService } from './ventas-productos.service';

@Module({
  controllers: [VentasProductosController],
  providers: [VentasProductosService]
})
export class VentasProductosModule {}
