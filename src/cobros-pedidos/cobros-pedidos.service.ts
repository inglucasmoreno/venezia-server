import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CobrosPedidosUpdateDTO } from './dto/cobros-pedidos-update.dto';
import { CobrosPedidosDTO } from './dto/cobros-pedidos.dto';
import { ICobrosPedidos } from './inteface/cobros-pedidos.interface';

@Injectable()
export class CobrosPedidosService {

  constructor(@InjectModel('CobrosPedidos') private readonly relacionesModel: Model<ICobrosPedidos>) { }

  // Relacion por ID
  async getRelacion(id: string): Promise<ICobrosPedidos> {

    const relacionDB = await this.relacionesModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

    // Informacion de mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$mayorista' });

    // Informacion de cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'cobros-mayoristas',
        localField: 'cobro',
        foreignField: '_id',
        as: 'cobro'
      }
    }
    );

    pipeline.push({ $unwind: '$cobro' });

    // Informacion de cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_mayoristas',
        localField: 'pedido',
        foreignField: '_id',
        as: 'pedido'
      }
    }
    );

    pipeline.push({ $unwind: '$pedido' });

    // Informacion de paquete - cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'paquetes',
        localField: 'paquete_cobro',
        foreignField: '_id',
        as: 'paquete_cobro'
      }
    }
    );

    pipeline.push({ $unwind: '$paquete_cobro' });

    // Informacion de paquete - pedido
    pipeline.push({
      $lookup: { // Lookup
        from: 'paquetes',
        localField: 'paquete_pedido',
        foreignField: '_id',
        as: 'paquete_pedido'
      }
    }
    );

    pipeline.push({ $unwind: '$paquete_pedido' });
    
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

    const relacion = await this.relacionesModel.aggregate(pipeline);

    return relacion[0];

  }

  // Listar relacion
  async listarRelaciones(querys: any): Promise<ICobrosPedidos[]> {

    const { columna, direccion, cobro } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Relacion por Cobro
    if (cobro && cobro !== '') {
      const idCobro = new Types.ObjectId(cobro);
      pipeline.push({ $match: { cobro: idCobro } });
    }

    // Informacion de mayorista
    pipeline.push({
      $lookup: { // Lookup
        from: 'mayoristas',
        localField: 'mayorista',
        foreignField: '_id',
        as: 'mayorista'
      }
    }
    );

    pipeline.push({ $unwind: '$mayorista' });

    // Informacion de cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'cobros_mayoristas',
        localField: 'cobro',
        foreignField: '_id',
        as: 'cobro'
      }
    }
    );

    pipeline.push({ $unwind: '$cobro' });

    // Informacion de cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_mayoristas',
        localField: 'pedido',
        foreignField: '_id',
        as: 'pedido'
      }
    }
    );

    pipeline.push({ $unwind: '$pedido' });

    // Informacion de paquete - cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'paquetes',
        localField: 'paquete_cobro',
        foreignField: '_id',
        as: 'paquete_cobro'
      }
    }
    );

    pipeline.push({ $unwind: '$paquete_cobro' });

    // Informacion de paquete - pedido
    pipeline.push({
      $lookup: { // Lookup
        from: 'paquetes',
        localField: 'paquete_pedido',
        foreignField: '_id',
        as: 'paquete_pedido'
      }
    }
    );

    pipeline.push({ $unwind: '$paquete_pedido' });

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

    const relaciones = await this.relacionesModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async crearRelacion(relacionDTO: CobrosPedidosDTO): Promise<ICobrosPedidos> {
    const nuevaRelacion = new this.relacionesModel(relacionDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async actualizarRelacion(id: string, relacionesUpdateDTO: CobrosPedidosUpdateDTO): Promise<ICobrosPedidos> {
    const relacion = await this.relacionesModel.findByIdAndUpdate(id, relacionesUpdateDTO, { new: true });
    return relacion;
  }

}
