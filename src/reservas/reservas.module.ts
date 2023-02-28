import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { reservasSchema } from './schema/reservas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Reservas', schema: reservasSchema }]),
  ],
  controllers: [ReservasController],
  providers: [ReservasService]
})
export class ReservasModule {}
