import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { reservasProductosSchema } from 'src/reservas-productos/schema/reservas-productos.schema';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { reservasSchema } from './schema/reservas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Reservas', schema: reservasSchema }]),
    MongooseModule.forFeature([{ name: 'ReservasProductos', schema: reservasProductosSchema }]),
  ],
  controllers: [ReservasController],
  providers: [ReservasService]
})
export class ReservasModule {}
