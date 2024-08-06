import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMesasPedidos } from './interface/mesas-pedidos.interface';
import { IMesas } from 'src/mesas/interface/mesas.interface';
import * as mongoose from 'mongoose';
import { MesasPedidosDTO } from './dto/mesas-pedidos.dto';
import { MesasPedidosUpdateDTO } from './dto/mesas-pedidos-update.dto';

@Injectable()
export class MesasPedidosService {

  constructor(
    @InjectModel('MesasPedidos') private readonly mesasPedidosModel: Model<IMesasPedidos>,
    @InjectModel('Mesas') private readonly mesasModel: Model<IMesas>
  ) { }

  // Pedido por ID
  async getPedido(id: string): Promise<IMesasPedidos> {

    const pedidoDB = await this.mesasPedidosModel.findById(id);
    if (!pedidoDB) throw new NotFoundException('El pedido no existe');

    const pipeline = [];

    // Pedido por ID
    const idPedido = new mongoose.Types.ObjectId(id);
    pipeline.push({ $match: { _id: idPedido } })

    // Informacion de mesa
    pipeline.push({
      $lookup: { // Lookup
        from: 'mesas',
        localField: 'mesa',
        foreignField: '_id',
        as: 'mesa'
      }
    }
    );

    pipeline.push({ $unwind: '$mesa' });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const pedido = await this.mesasPedidosModel.aggregate(pipeline);

    return pedido[0];

  }

  // Listar pedidos
  async listarPedidos(querys: any): Promise<IMesasPedidos[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Informacion de mesa
    pipeline.push({
      $lookup: { // Lookup
        from: 'mesas',
        localField: 'mesa',
        foreignField: '_id',
        as: 'mesa'
      }
    }
    );

    pipeline.push({ $unwind: '$mesa' });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    const pedidos = await this.mesasPedidosModel.aggregate(pipeline);

    return pedidos;

  }

  // Crear pedido
  async crearPedido(mesasPedidosDTO: MesasPedidosDTO): Promise<IMesasPedidos> {

    // Numero de pedido
    const ultimoPedido: any = await this.mesasPedidosModel.find()
      .sort({ createdAt: -1 })
      .limit(1)
    
    // Proximo numero de paquete
    let proximoNumeroPedido = 0;
    if (ultimoPedido[0]) proximoNumeroPedido = ultimoPedido[0].numero;
    proximoNumeroPedido += 1;

    mesasPedidosDTO.numero = proximoNumeroPedido;

    const nuevoPedido = new this.mesasPedidosModel(mesasPedidosDTO);
    return await nuevoPedido.save();
  
  }

  // Actualizar pedido
  async actualizarPedido(id: string, mesasPedidosUpdateDTO: MesasPedidosUpdateDTO): Promise<IMesasPedidos> {
    const pedido = await this.mesasPedidosModel.findByIdAndUpdate(id, mesasPedidosUpdateDTO, { new: true });
    return pedido;
  }

}
