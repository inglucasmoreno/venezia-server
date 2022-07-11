import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { productosSchema } from 'src/productos/schema/productos.schema';
import { unidadMedidaSchema } from './schema/unidad-medida.schema';
import { UnidadMedidaController } from './unidad-medida.controller';
import { UnidadMedidaService } from './unidad-medida.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'UnidadMedida', schema: unidadMedidaSchema}]),
    MongooseModule.forFeature([{name: 'Producto', schema: productosSchema}])
  ],
  controllers: [UnidadMedidaController],
  providers: [UnidadMedidaService]
})
export class UnidadMedidaModule {}
