import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MayoristasTiposIngresosController } from './mayoristas-tipos-ingresos.controller';
import { MayoristasTiposIngresosService } from './mayoristas-tipos-ingresos.service';
import { mayoristasTiposIngresosSchema } from './schema/mayorista-tipos-ingresos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'TiposIngresos', schema: mayoristasTiposIngresosSchema}]),
  ],
  controllers: [MayoristasTiposIngresosController],
  providers: [MayoristasTiposIngresosService]
})
export class MayoristasTiposIngresosModule {}
