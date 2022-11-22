import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CobrosMayoristasController } from './cobros-mayoristas.controller';
import { CobrosMayoristasService } from './cobros-mayoristas.service';
import { cobrosMayoristasSchema } from './schema/cobros-mayoristas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'CobrosMayoristas', schema: cobrosMayoristasSchema}]),
  ],
  controllers: [CobrosMayoristasController],
  providers: [CobrosMayoristasService]
})
export class CobrosMayoristasModule {}
