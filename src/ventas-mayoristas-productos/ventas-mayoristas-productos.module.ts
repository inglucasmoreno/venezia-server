import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';
import { ventasMayoristasProductosSchema } from './schema/ventas-mayoristas-productos.schema';
import { VentasMayoristasProductosController } from './ventas-mayoristas-productos.controller';
import { VentasMayoristasProductosService } from './ventas-mayoristas-productos.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'VentasMayoristasProductos', schema: ventasMayoristasProductosSchema}]),
    MongooseModule.forFeature([{name: 'Usuarios', schema: usuarioSchema}])
  ],
  controllers: [VentasMayoristasProductosController],
  providers: [VentasMayoristasProductosService]
})
export class VentasMayoristasProductosModule {}
