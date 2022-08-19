import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasMayoristasProductosSchema } from './schema/ventas-mayoristas-productos.schema';
import { VentasMayoristasProductosController } from './ventas-mayoristas-productos.controller';
import { VentasMayoristasProductosService } from './ventas-mayoristas-productos.service';

@Module({
  imports: [MongooseModule.forFeature([{name: 'VentasMayoristasProductos', schema: ventasMayoristasProductosSchema}])],
  controllers: [VentasMayoristasProductosController],
  providers: [VentasMayoristasProductosService]
})
export class VentasMayoristasProductosModule {}
