import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VentasReservasUpdateDTO } from './dto/ventas-reservas-update.dto';
import { VentasReservasDTO } from './dto/ventas-reservas.dto';
import { IVentasReservas } from './interface/ventas-reservas.interface';

@Injectable()
export class VentasReservasService {

  constructor(
    @InjectModel('VentasReservas') private readonly ventasReservasModel: Model<IVentasReservas>,
  ) { }

  // Relacion por ID
  async getRelacion(id: string): Promise<IVentasReservas> {

    const relacionDB = await this.ventasReservasModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

    // Informacion de venta
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas',
        localField: 'venta',
        foreignField: '_id',
        as: 'venta'
      }
    }
    );

    pipeline.push({ $unwind: '$venta' });

    // Informacion de reserva
    pipeline.push({
      $lookup: { // Lookup
        from: 'reservas',
        localField: 'reserva',
        foreignField: '_id',
        as: 'reserva'
      }
    }
    );

    pipeline.push({ $unwind: '$reserva' });

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

    const relacion = await this.ventasReservasModel.aggregate(pipeline);

    return relacion[0];

  }

   // Relacion por venta
   async getRelacionPorVenta(venta: string): Promise<IVentasReservas> {

    const pipeline = [];

    // Relacion por venta
    const idVenta = new Types.ObjectId(venta);
    pipeline.push({ $match: { venta: idVenta } });

    // Informacion de venta
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas',
        localField: 'venta',
        foreignField: '_id',
        as: 'venta'
      }
    }
    );

    pipeline.push({ $unwind: '$venta' });

    // Informacion de reserva
    pipeline.push({
      $lookup: { // Lookup
        from: 'reservas',
        localField: 'reserva',
        foreignField: '_id',
        as: 'reserva'
      }
    }
    );

    pipeline.push({ $unwind: '$reserva' });

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

    const relacion = await this.ventasReservasModel.aggregate(pipeline);

    return relacion[0];

  }

  // Listar relaciones
  async listarRelaciones(querys: any): Promise<IVentasReservas[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Informacion de venta
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas',
        localField: 'venta',
        foreignField: '_id',
        as: 'venta'
      }
    }
    );

    pipeline.push({ $unwind: '$venta' });

    // Informacion de reserva
    pipeline.push({
      $lookup: { // Lookup
        from: 'reservas',
        localField: 'reserva',
        foreignField: '_id',
        as: 'reserva'
      }
    }
    );

    pipeline.push({ $unwind: '$reserva' });

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

    const relaciones = await this.ventasReservasModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async crearRelacion(ventasReservasDTO: VentasReservasDTO): Promise<IVentasReservas> {
    const relacion = new this.ventasReservasModel(ventasReservasDTO);
    return await relacion.save();
  }

  // Actualizar relacion
  async actualizarRelacion(id: string, ventasReservasUpdateDTO: VentasReservasUpdateDTO): Promise<IVentasReservas> {
    const relacion = await this.ventasReservasModel.findByIdAndUpdate(id, ventasReservasUpdateDTO, { new: true });
    return relacion;
  }

}
