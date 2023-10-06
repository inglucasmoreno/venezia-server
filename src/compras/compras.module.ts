import { Module } from '@nestjs/common';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { MongooseModule } from '@nestjs/mongoose';
import { comprasSchema } from './schema/compras.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Compras', schema: comprasSchema}]),
  ],
  controllers: [ComprasController],
  providers: [ComprasService]
})
export class ComprasModule {}
