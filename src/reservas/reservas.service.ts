import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { IReservasProductos } from 'src/reservas-productos/interface/reservas-productos.interface';
import { IReservas } from './interface/reservas.interface';

@Injectable()
export class ReservasService {

  constructor(
    @InjectModel('Reservas') private readonly reservasModel: Model<IReservas>,
    @InjectModel('ReservasProductos') private readonly reservasProductosModel: Model<IReservasProductos>,
  ) { }

  // Reserva por ID
  async getReserva(id: string): Promise<any> {

    const reservaDB = await this.reservasModel.findById(id);
    if (!reservaDB) throw new NotFoundException('La reserva no existe');

    const pipeline = [];

    // Reserva por ID
    const idReserva = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idReserva } })

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }
    );

    pipeline.push({ $unwind: '$cliente' });

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

    const [reserva, productos] = await Promise.all([
      this.reservasModel.aggregate(pipeline),
      this.reservasProductosModel.find({ reserva: id })
    ])

    return {
      reserva: reserva[0],
      productos
    }
  }

  // Crear reserva
  async crearReserva(reservasDTO: any): Promise<IReservas> {

    const { productos, fecha_entrega, fecha_reserva, fecha_alerta } = reservasDTO;

    // Numero de reserva
    const reservas = await this.reservasModel.find().sort({ nro: -1 }).limit(1);

    let ultimoNumero = 0;
    if (reservas.length > 0) ultimoNumero = reservas[0].nro;

    // Adaptacion de fechas
    reservasDTO.fecha_reserva = add(new Date(fecha_reserva), { hours: 3 });
    reservasDTO.fecha_entrega = new Date(fecha_entrega);
    reservasDTO.fecha_alerta = new Date(fecha_alerta);

    const data = {
      ...reservasDTO,
      nro: ultimoNumero + 1
    }

    // Creacion de reserva
    const nuevaReserva = new this.reservasModel(data);
    const reserva = await nuevaReserva.save();

    // Cargar los productos a la reserva
    productos.map(async producto => {
      producto.reserva = reserva._id;
      const nuevoProducto = new this.reservasProductosModel(producto);
      await nuevoProducto.save();
    })

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
      activo,
      estado
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }
    );

    pipeline.push({ $unwind: '$cliente' });

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

    // Filtro por estado
    if(estado && estado !== ''){
      pipeline.push({ $match: { estado } });
      pipelineTotal.push({ $match: { estado } });      
    }

    // Filtro por parametros
    if (parametro && parametro !== '') {
      const regex = new RegExp(parametro, 'i');
      pipeline.push({ $match: { $or: [{ nro: Number(parametro) }, { 'cliente.identificacion': parametro }, { 'cliente.descripcion': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }, { 'cliente.identificacion': parametro }, { 'cliente.descripcion': regex }] } });
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

  // Reservas por vencer
  async reservasPorVencer({ columna, direccion }): Promise<IReservas[]> {
  
    const pipeline = [];
    pipeline.push({ $match: { estado: 'Pendiente' } })
    
    const fechaHoy = new Date();

    // Mayor a la fecha de alerta
    pipeline.push({$match: { 
      fecha_alerta: { $lte: fechaHoy } 
    }});


    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    const reservas = await this.reservasModel.aggregate(pipeline);
    return reservas;

  }

  // Actualizar reserva
  async actualizarReserva(id: string, reservasUpdateDTO: any): Promise<IReservas> {

    let { fecha_entrega, fecha_reserva, fecha_alerta } = reservasUpdateDTO;

    // Se verifica si la reserva a actualizar existe
    let reservaDB = await this.getReserva(id);
    if (!reservaDB) throw new NotFoundException('La reserva no existe');

    // Ajuste de fecha de reserva
    if(fecha_reserva && fecha_reserva !== ''){
      reservasUpdateDTO.fecha_reserva = add(new Date(fecha_reserva), { hours: 3 });
    }

    // Ajuste de fecha de entrega
    if(fecha_entrega && fecha_entrega !== ''){
      reservasUpdateDTO.fecha_entrega = new Date(fecha_entrega);
    }

    // Ajuste de fecha de alerta
    if(fecha_alerta && fecha_alerta !== ''){
      reservasUpdateDTO.fecha_entrega = new Date(fecha_alerta);
    }

    const reservaRes = await this.reservasModel.findByIdAndUpdate(id, reservasUpdateDTO, { new: true });
    return reservaRes;

  }

  // Eliminar reserva
  async eliminarReserva(id: string): Promise<String> {

    // Se verifica si la reserva existe
    let reservaDB = await this.getReserva(id);
    if (!reservaDB) throw new NotFoundException('La reserva no existe');

    // Se eliminan los productos de la reserva
    await this.reservasProductosModel.deleteMany({ reserva: id });

    // Se elimina la reserva
    await this.reservasModel.findByIdAndDelete(id);

    return 'Reserva eliminada correctamente';

  }

}
