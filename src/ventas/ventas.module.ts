import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasSchema } from './schema/ventas.schema';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Ventas', schema: ventasSchema}])],
  controllers: [VentasController],
  providers: [VentasService]
})
export class VentasModule {}
