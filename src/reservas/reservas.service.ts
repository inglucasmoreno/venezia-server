import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IReservas } from './interface/reservas.interface';

@Injectable()
export class ReservasService {

  constructor(
    @InjectModel('Reservas') private readonly reservasModel: Model<IReservas>,
  ) { }

  // Reserva por ID
  async getReserva(id: string): Promise<IReservas> {

    const reservaDB = await this.reservasModel.findById(id);
    if (!reservaDB) throw new NotFoundException('La reserva no existe');

    const pipeline = [];

    // Reserva por ID
    const idReserva = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idReserva } })

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

    const reserva = await this.reservasModel.aggregate(pipeline);

    return reserva[0];
  }

  // Crear reserva
  async crearReserva(reservasDTO: any): Promise<IReservas> {

    // Numero de reserva
    const reservas = await this.reservasModel.find().sort({ createdAt: -1 }).limit(1);

    let ultimoNumero = 0;
    if (reservas.length > 0) ultimoNumero = reservas[0].nro;

    const data = {
      ...reservasDTO,
      nro: ultimoNumero + 1
    }

    // Creacion de reserva
    const nuevaReserva = new this.reservasModel(data);
    const reserva = await nuevaReserva.save();
    
    // Cargar los productos a la reserva

    return reserva;

  }

  // Listar reservas
  async listarReservas(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      parametro,
      activo
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

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

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
    }

    // Filtro por parametros
    if (parametro && parametro !== '') {
      const regex = new RegExp(parametro, 'i');
      pipeline.push({ $match: { $or: [{ nro: Number(parametro) }] } });
      pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }] } });
    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [reservas, reservasTotal] = await Promise.all([
      this.reservasModel.aggregate(pipeline),
      this.reservasModel.aggregate(pipelineTotal)
    ]);

    return {
      reservas,
      totalItems: reservasTotal.length
    };

  }

  // Actualizar reserva
  async actualizarReserva(id: string, reservasUpdateDTO: any): Promise<IReservas> {

    // Se verifica si la reserva a actualizar existe
    let reservaDB = await this.getReserva(id);
    if (!reservaDB) throw new NotFoundException('La reserva no existe');

    const reservaRes = await this.reservasModel.findByIdAndUpdate(id, reservasUpdateDTO, { new: true });
    return reservaRes;

  }

}
