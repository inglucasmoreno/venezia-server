import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MayoristasTiposGastosController } from './mayoristas-tipos-gastos.controller';
import { MayoristasTiposGastosService } from './mayoristas-tipos-gastos.service';
import { mayoristasTiposGastosSchema } from './schema/mayoristas-tipos-gastos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'TiposGastos', schema: mayoristasTiposGastosSchema}]),
  ],
  controllers: [MayoristasTiposGastosController],
  providers: [MayoristasTiposGastosService]
})
export class MayoristasTiposGastosModule {}
