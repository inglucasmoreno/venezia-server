import { Module } from '@nestjs/common';
import { RepartidoresService } from './repartidores.service';
import { RepartidoresController } from './repartidores.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { repartidoresSchema } from './schema/repartidores.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Repartidores', schema: repartidoresSchema}]),
  ],
  providers: [RepartidoresService],
  controllers: [RepartidoresController]
})
export class RepartidoresModule {}
