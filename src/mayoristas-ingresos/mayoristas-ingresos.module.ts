import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MayoristasIngresosController } from './mayoristas-ingresos.controller';
import { MayoristasIngresosService } from './mayoristas-ingresos.service';
import { mayoristasIngresosSchema } from './schema/mayoristas-ingresos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Ingresos', schema: mayoristasIngresosSchema}]),
  ],
  controllers: [MayoristasIngresosController],
  providers: [MayoristasIngresosService]
})
export class MayoristasIngresosModule {}
