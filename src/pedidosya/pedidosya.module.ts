import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PedidosyaController } from './pedidosya.controller';
import { PedidosyaService } from './pedidosya.service';
import { pedidosYaSchema } from './schema/pedidosya.schema';

@Module({
  imports: [ MongooseModule.forFeature([{name: 'PedidosYa', schema: pedidosYaSchema}]) ],
  controllers: [PedidosyaController],
  providers: [PedidosyaService]
})
export class PedidosyaModule {}
