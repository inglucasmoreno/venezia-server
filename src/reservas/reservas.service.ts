import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format } from 'date-fns';
import { Model, Types } from 'mongoose';
import { IReservasProductos } from 'src/reservas-productos/interface/reservas-productos.interface';
import { IReservas } from './interface/reservas.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';

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
    pipeline.push({ $match: { _id: idReserva } });

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

    const { productos, fecha_entrega, fecha_reserva, fecha_alerta, cliente_descripcion } = reservasDTO;

    // Numero de reserva
    const reservas = await this.reservasModel.find().sort({ nro: -1 }).limit(1);

    let ultimoNumero = 0;
    if (reservas.length > 0) ultimoNumero = reservas[0].nro;

    // Adaptacion de fechas
    reservasDTO.fecha_reserva = add(new Date(fecha_reserva), { hours: 3 });
    reservasDTO.fecha_entrega = add(new Date(fecha_entrega), { hours: 3 });
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

    // Se crea el comprobante de la reserva
    
    const dataComprobante = {
      nro_reserva: reserva.nro,
      fecha_reserva: reserva.fecha_reserva,
      fecha_entrega: reserva.fecha_entrega,
      hora_entrega: reserva.hora_entrega,
      cliente: cliente_descripcion,
      precio_total: reserva.precio_total,
      adelanto: reserva.adelanto,
      productos,
      tipo_observaciones: reserva.tipo_observaciones,
      torta_cobertura: reserva.torta_cobertura,
      torta_detalles: reserva.torta_detalles,
      torta_forma: reserva.torta_forma,
      torta_peso: reserva.torta_peso,
      torta_relleno1: reserva.torta_relleno1,
      torta_relleno2: reserva.torta_relleno2,
      torta_relleno3: reserva.torta_relleno3
    }

    await this.generaraComprobante(dataComprobante);

    return reserva;

  }

  // Listar reservas
  async listarReservas(querys: any): Promise<any> {

    let fechaHoy = new Date();

    const {
      columna,
      direccion,
      desde,
      registerpp,
      parametro,
      activo,
      estado,
      por_vencer,
      fecha
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Reservas por vencer
    if (por_vencer === 'true') {
      // Mayor a la fecha de alerta
      pipeline.push({ $match: { fecha_alerta: { $lte: fechaHoy }, estado: 'Pendiente' } });
    }

    // Filtro - Fecha desde
    if (fecha && fecha.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_reserva: { $gte: add(new Date(fecha), { hours: 0 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_reserva: { $gte: add(new Date(fecha), { hours: 0 }) }
        }
      });
    }

    // Filtro - Fecha hasta
    if (fecha && fecha.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_reserva: { $lte: add(new Date(fecha), { days: 1, hours: 0 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          fecha_reserva: { $lte: add(new Date(fecha), { days: 1, hours: 0 }) }
        }
      });
    }

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
    if (estado && estado !== '') {
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
    pipeline.push({
      $match: {
        fecha_alerta: { $lte: fechaHoy }
      }
    });

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

    let { fecha_entrega, fecha_reserva, fecha_alerta, estado } = reservasUpdateDTO;

    // Se verifica si la reserva a actualizar existe
    let reservaDB = await this.getReserva(id);
    if (!reservaDB) throw new NotFoundException('La reserva no existe');

    // Ajuste de fecha de reserva
    if (fecha_reserva && fecha_reserva !== '') {
      reservasUpdateDTO.fecha_reserva = add(new Date(fecha_reserva), { hours: 3 });
    }

    // Ajuste de fecha de entrega
    if (fecha_entrega && fecha_entrega !== '') {
      reservasUpdateDTO.fecha_entrega = new Date(fecha_entrega);
    }

    // Ajuste de fecha de alerta
    if (fecha_alerta && fecha_alerta !== '') {
      reservasUpdateDTO.fecha_alerta = new Date(fecha_alerta);
    }

    // Finalizando reservas - No retirada
    if (estado && estado === 'No retirada') {
      reservasUpdateDTO.fecha_finalizacion = new Date();
    }

    // Finalizando reservas - Completada
    if (estado && estado === 'Completada') {
      reservasUpdateDTO.fecha_finalizacion = new Date();
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

  // Generar comprobante
  async generaraComprobante(data: any): Promise<any> {
    
    // GENERACION DE PDF

    let html: any;
    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/comprobante_reserva.html', 'utf-8');

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
        height: "0mm",
        contents: {}
      }
    }

    // Completando data
    data = { ...data, 
      fecha: format(new Date(), 'dd/MM/yyyy'),
      fecha_reserva: format(add(new Date(data.fecha_reserva), { hours: 3 }), 'dd/MM/yyyy'),
      fecha_entrega: format(add(new Date(data.fecha_entrega), { hours: 3 }), 'dd/MM/yyyy'),
      adelanto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.adelanto),
      precio_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.precio_total),
      falta_abonar: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.precio_total - data.adelanto)
    }

    // Configuraciones de documento
    var document = {
      html: html,
      data,
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/comprobante_reserva.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'PDF generado correctamente';


  }

}
