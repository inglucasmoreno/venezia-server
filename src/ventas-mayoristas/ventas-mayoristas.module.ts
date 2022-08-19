import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasMayoristasProductosSchema } from 'src/ventas-mayoristas-productos/schema/ventas-mayoristas-productos.schema';
import { ventasMayoristasSchema } from './schema/ventas-mayoristas.schema';
import { VentasMayoristasController } from './ventas-mayoristas.controller';
import { VentasMayoristasService } from './ventas-mayoristas.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'VentasMayoristas', schema: ventasMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristasProductos', schema: ventasMayoristasProductosSchema}])
  ],
  controllers: [VentasMayoristasController],
  providers: [VentasMayoristasService]
})
export class VentasMayoristasModule {}
