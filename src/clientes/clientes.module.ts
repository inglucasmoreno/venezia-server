import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { clientesSchema } from './schema/clientes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Clientes', schema: clientesSchema }]),
  ],
  controllers: [ClientesController],
  providers: [ClientesService]
})
export class ClientesModule {}
