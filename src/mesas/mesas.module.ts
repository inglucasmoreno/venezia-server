import { Module } from '@nestjs/common';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mesasSchema } from './schema/mesas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Mesas', schema: mesasSchema}]),
  ],
  controllers: [MesasController],
  providers: [MesasService]
})
export class MesasModule {}
