import { Module } from '@nestjs/common';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { MongooseModule } from '@nestjs/mongoose';
import { comprasSchema } from './schema/compras.schema';
import { comprasProductosSchema } from 'src/compras-productos/schema/compras-productos.schema';
import { productosSchema } from 'src/productos/schema/productos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Compras', schema: comprasSchema}]),
    MongooseModule.forFeature([{name: 'Productos', schema: productosSchema}]),
    MongooseModule.forFeature([{name: 'ComprasProductos', schema: comprasProductosSchema}]),
  ],
  controllers: [ComprasController],
  providers: [ComprasService]
})
export class ComprasModule {}
