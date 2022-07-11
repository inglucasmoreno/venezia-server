import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { productosSchema } from './schema/productos.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Productos', schema: productosSchema}])],
  controllers: [ProductosController],
  providers: [ProductosService]
})
export class ProductosModule {}
