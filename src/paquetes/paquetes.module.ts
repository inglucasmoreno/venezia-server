import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasMayoristasProductosSchema } from 'src/ventas-mayoristas-productos/schema/ventas-mayoristas-productos.schema';
import { ventasMayoristasSchema } from 'src/ventas-mayoristas/schema/ventas-mayoristas.schema';
import { PaquetesController } from './paquetes.controller';
import { PaquetesService } from './paquetes.service';
import { paquetesSchema } from './schema/paquetes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Paquetes', schema: paquetesSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristas', schema: ventasMayoristasSchema}]),
    MongooseModule.forFeature([{name: 'VentasMayoristasProductos', schema: ventasMayoristasProductosSchema}]),
  ],
  controllers: [PaquetesController],
  providers: [PaquetesService]
})
export class PaquetesModule {}
