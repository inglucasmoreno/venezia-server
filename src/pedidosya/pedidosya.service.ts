import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose  from 'mongoose';
import { IPedidosYa } from './interface/pedidosya.interface';
import { PedidosYaDTO } from './dto/pedidosya.dto';
import { PedidosYaUpdateDTO } from './dto/pedidosya-update.dto';

@Injectable()
export class PedidosyaService {
  constructor(@InjectModel('PedidosYa') private readonly pedidosYaModel: Model<IPedidosYa>){}

  // PedidosYa por ID
  async getPedidosYa(id: string): Promise<IPedidosYa> {

    const pedidosYaDB = await this.pedidosYaModel.findById(id);
    if(!pedidosYaDB) throw new NotFoundException('El elemento no existe');

    const pipeline = [];

    // PedidosYa por ID
    const idPedidosYa = new mongoose.Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idPedidosYa} }) 

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const pedido = await this.pedidosYaModel.aggregate(pipeline);

    return pedido[0];

  } 

  // Listar pedidosYa
  async listarPedidosYa(querys: any): Promise<IPedidosYa[]> {

    const {columna, direccion} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    // Ordenando datos
    const ordenar: any = {};
    if(columna){
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({$sort: ordenar});
    }      

    const pedidos = await this.pedidosYaModel.aggregate(pipeline);

    return pedidos;

  }  

  // Crear pedidos
  async crearPedido(pedidosYaDTO: PedidosYaDTO): Promise<IPedidosYa> {
    const nuevoPedido = new this.pedidosYaModel(pedidosYaDTO);
    return await nuevoPedido.save();
  }

  // Actualizar pedidos
  async actualizarPedidos(id: string, pedidosYaUpdateDTO: PedidosYaUpdateDTO): Promise<IPedidosYa> {
    const pedido = await this.pedidosYaModel.findByIdAndUpdate(id, pedidosYaUpdateDTO, {new: true});
    return pedido;
  }

}
