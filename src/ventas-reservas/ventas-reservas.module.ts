import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasReservasSchema } from './schema/ventas-reservas.schema';
import { VentasReservasController } from './ventas-reservas.controller';
import { VentasReservasService } from './ventas-reservas.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'VentasReservas', schema: ventasReservasSchema}])
  ],
  controllers: [VentasReservasController],
  providers: [VentasReservasService]
})
export class VentasReservasModule {}
