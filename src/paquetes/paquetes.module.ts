import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaquetesController } from './paquetes.controller';
import { PaquetesService } from './paquetes.service';
import { paquetesSchema } from './schema/paquetes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Paquetes', schema: paquetesSchema}]),
  ],
  controllers: [PaquetesController],
  providers: [PaquetesService]
})
export class PaquetesModule {}
