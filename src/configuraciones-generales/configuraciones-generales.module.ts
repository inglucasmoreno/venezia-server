import { Module } from '@nestjs/common';
import { ConfiguracionesGeneralesController } from './configuraciones-generales.controller';
import { ConfiguracionesGeneralesService } from './configuraciones-generales.service';
import { MongooseModule } from '@nestjs/mongoose';
import { configuracionesGeneralesSchema } from './schema/configuraciones-generales.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'ConfiguracionesGenerales', schema: configuracionesGeneralesSchema}]),
  ],
  controllers: [ConfiguracionesGeneralesController],
  providers: [ConfiguracionesGeneralesService]
})
export class ConfiguracionesGeneralesModule {}
