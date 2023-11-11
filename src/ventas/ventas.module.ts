import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasProductosSchema } from 'src/ventas-productos/schema/ventas-productos.schema';
import { ventasSchema } from './schema/ventas.schema';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { productosSchema } from 'src/productos/schema/productos.schema';
import { configuracionesGeneralesSchema } from 'src/configuraciones-generales/schema/configuraciones-generales.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Ventas', schema: ventasSchema}]),
    MongooseModule.forFeature([{name: 'Productos', schema: productosSchema}]),
    MongooseModule.forFeature([{name: 'VentasProductos', schema: ventasProductosSchema}]),
    MongooseModule.forFeature([{name: 'ConfiguracionesGenerales', schema: configuracionesGeneralesSchema}]),
  ],
  controllers: [VentasController],
  providers: [VentasService]
})
export class VentasModule {}
