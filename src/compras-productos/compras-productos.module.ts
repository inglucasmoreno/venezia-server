import { Module } from '@nestjs/common';
import { ComprasProductosController } from './compras-productos.controller';
import { ComprasProductosService } from './compras-productos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { comprasProductosSchema } from './schema/compras-productos.schema';
import { productosSchema } from 'src/productos/schema/productos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'ComprasProductos', schema: comprasProductosSchema},
      {name: 'Productos', schema: productosSchema}
    ]),
  ],
  controllers: [ComprasProductosController],
  providers: [ComprasProductosService]
})
export class ComprasProductosModule {}
