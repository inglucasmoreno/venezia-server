import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasProductosSchema } from './schema/ventas-productos.schema';
import { VentasProductosController } from './ventas-productos.controller';
import { VentasProductosService } from './ventas-productos.service';

@Module({
  imports: [MongooseModule.forFeature([{name: 'VentasProductos', schema: ventasProductosSchema}])],
  controllers: [VentasProductosController],
  providers: [VentasProductosService]
})
export class VentasProductosModule {}
