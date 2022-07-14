import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasProductosSchema } from 'src/ventas-productos/schema/ventas-productos.schema';
import { ventasSchema } from './schema/ventas.schema';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Ventas', schema: ventasSchema}]),
    MongooseModule.forFeature([{name: 'VentasProductos', schema: ventasProductosSchema}]),
  ],
  controllers: [VentasController],
  providers: [VentasService]
})
export class VentasModule {}
