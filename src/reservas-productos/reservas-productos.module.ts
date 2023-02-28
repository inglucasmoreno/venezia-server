import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservasProductosController } from './reservas-productos.controller';
import { ReservasProductosService } from './reservas-productos.service';
import { reservasProductosSchema } from './schema/reservas-productos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ReservasProductos', schema: reservasProductosSchema }]),
  ],
  controllers: [ReservasProductosController],
  providers: [ReservasProductosService]
})
export class ReservasProductosModule {}
