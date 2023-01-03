import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { IIngresosGastos } from 'src/ingresos-gastos/interface/ingresos-gastos.schema';
import { IVentas } from 'src/ventas/interface/ventas.interface';
import { CajasUpdateDTO } from './dto/cajas-update';
import { CajasDTO } from './dto/cajas.dto';
import { ICajas } from './interface/cajas.interface';
import { ISaldoInicial } from './interface/saldo-inicial.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';

@Injectable()
export class CajasService {

  constructor(
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('SaldoInicial') private readonly saldoInicialModel: Model<ISaldoInicial>,
    @InjectModel('IngresosGastos') private readonly ingresosGastosModel: Model<IIngresosGastos>,
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>
  ) { }

  // Caja por ID
  async getCaja(id: string): Promise<ICajas> {

    const cajaDB = await this.cajasModel.findById(id);
    if (!cajaDB) throw new NotFoundException('La caja no existe');

    const pipeline = [];

    const idCaja = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCaja } })

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

    const caja = await this.cajasModel.aggregate(pipeline);

    return caja[0];

  }

  // Listar cajas
  async listarCajas(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      fechaDesde,
      fechaHasta,
      parametro
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Filtro - Fecha desde
    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
      pipelineTotal.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

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

    // Informacion de usuario creador - TOTAL
    pipelineTotal.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipelineTotal.push({ $unwind: '$creatorUser' });

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

    // Filtro por parametros
    if (parametro && parametro !== '') {

      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for (var i = 0; i < porPartes.length; i++) {
        if (i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal, 'i');
      pipeline.push({ $match: { $or: [{ 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex }] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [cajas, cajasTotal] = await Promise.all([
      this.cajasModel.aggregate(pipeline),
      this.cajasModel.aggregate(pipelineTotal),
    ])

    return {
      cajas,
      totalItems: cajasTotal.length
    };

  }

  // Calculos iniciales
  async calculosIniciales(): Promise<any> {

    const ventasActivas = await this.ventasModel.find({ activo: true });

    // Variables iniciales
    let total_ventas = 0;
    let total_adicional_credito = 0;
    let total_facturado = 0;
    let total_credito = 0;
    let total_debito = 0;
    let total_pedidosYa = 0;
    let total_mercadopago = 0;
    let total_efectivo = 0;
    let total_balanza = 0;
    let total_no_balanza = 0;
    let total_postnet = 0;
    let cantidad_ventas = 0;

    ventasActivas.map(venta => {  // Recorrido de ventas

      // Cantidad de ventas activas (Sin cierre de caja)
      cantidad_ventas += 1;

      // Adicional credito
      total_adicional_credito += venta.adicional_credito;

      // Monto de venta total
      total_ventas += venta.precio_total;

      // Monto balanza y no balanza
      total_balanza += venta.total_balanza;
      total_no_balanza += venta.total_no_balanza;

      // Monto facturado
      if (venta.comprobante === 'Fiscal') total_facturado += venta.precio_total;

      // Calculos sobre -> Formas de pago
      venta['forma_pago'].map(formaPago => {
        if (formaPago.descripcion === 'Efectivo' || formaPago.descripcion === 'PedidosYa - Efectivo') total_efectivo += formaPago.valor;
        if (formaPago.descripcion === 'Crédito') total_credito += formaPago.valor;
        if (formaPago.descripcion === 'Débito') total_debito += formaPago.valor;
        if (formaPago.descripcion === 'Mercado pago') total_mercadopago += formaPago.valor;
        if (formaPago.descripcion === 'PedidosYa') total_pedidosYa += formaPago.valor;
        if (formaPago.descripcion === 'Crédito' || formaPago.descripcion === 'Débito' || formaPago.descripcion === 'Mercado pago') total_postnet += formaPago.valor;
      })

    })

    // Ingresos y Gastos
    const ingresosGastos = await this.ingresosGastosModel.find({ activo: true });

    let ingresos: any[] = [];
    let gastos: any[] = [];
    let totalGastos = 0;
    let totalIngresos = 0;

    ingresosGastos.map(elemento => {
      if (elemento.tipo === 'gasto') {
        totalGastos += elemento.monto;
        gastos.push(elemento);
      }
      else {
        ingresos.push(elemento);
        totalIngresos += elemento.monto;
      }
    });

    // Saldo inicial de caja
    const idSaldoInicial = '222222222222222222222222';
    const saldoInicial = await this.saldoInicialModel.findById(idSaldoInicial);

    return {
      saldoInicial: saldoInicial.monto,
      ingresos,
      gastos,
      totalGastos,
      totalIngresos,
      total_ventas,
      total_pedidosYa,
      total_balanza,
      total_adicional_credito,
      total_no_balanza,
      total_facturado,
      total_postnet,
      total_credito,
      total_debito,
      total_efectivo,
      total_mercadopago,
      cantidad_ventas
    }

  }

  // Crear caja
  async crearCaja(cajasDTO: CajasDTO): Promise<ICajas> {

    const nuevaCaja = new this.cajasModel(cajasDTO);
    const idSaldoInicial = '222222222222222222222222';

    // 1 - Se crea la caja
    // 2 - Baja de ventas
    // 3 - Eliminar Ingresos y Gastos temporales
    // 4 - Actualizacion de saldo de nueva caja

    const [respuestaCaja] = await Promise.all([
      nuevaCaja.save(),
      this.ventasModel.updateMany({}, { activo: false }),
      this.ingresosGastosModel.deleteMany(),
      this.saldoInicialModel.findByIdAndUpdate(idSaldoInicial, { monto: cajasDTO.saldo_proxima_caja })
    ])

    // 1) - Crear nueva caja
    // const respuestaCaja = await nuevaCaja.save();

    // 2) - Baja de ventas
    // await this.ventasModel.updateMany({},{activo: false});

    // 3) - Eliminar ingresos y gastos
    // await this.ingresosGastosModel.deleteMany();

    // 4) - Caja con nuevo saldo
    // await this.saldoInicialModel.findByIdAndUpdate(idSaldoInicial, {monto: cajasDTO.saldo_proxima_caja});

    return respuestaCaja;

  }

  // Actualizar caja
  async actualizarCaja(id: string, cajasUpdateDTO: CajasUpdateDTO): Promise<ICajas> {
    const caja = await this.cajasModel.findByIdAndUpdate(id, cajasUpdateDTO, { new: true });
    return caja;
  }

  // Actualizar saldo inicial de caja
  async actualizarSaldoInicial(data: any): Promise<ISaldoInicial> {
    const idSaldo = '222222222222222222222222';
    const saldoInicial = await this.saldoInicialModel.findByIdAndUpdate(idSaldo, data, { new: true });
    return saldoInicial;
  }

  // Reporte de cajas
  async reporteCajas(data: any): Promise<any> {

    const { fechaDesde, fechaHasta } = data;

    const pipeline = [];

    // Filtro - Fecha desde
    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });

    }

    // Filtro - Fecha hasta
    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    pipeline.push({ $match: {} });

    pipeline.push({
      $group: {
        _id: null,
        cantidad_ventas: { $sum: "$cantidad_ventas" },
        total_ventas: { $sum: "$total_ventas" },
        total_facturado: { $sum: "$total_facturado" },
        total_balanza: { $sum: "$total_balanza" },
        total_no_balanza: { $sum: "$total_no_balanza" },
        otros_ingresos: { $sum: "$otros_ingresos" },
        otros_gastos: { $sum: "$otros_gastos" },
        total_credito: { $sum: "$total_credito" },
        total_mercadopago: { $sum: "$total_mercadopago" },
        total_efectivo: { $sum: "$total_efectivo" },
        total_debito: { $sum: "$total_debito" },
        total_adicional_credito: { $sum: "$total_adicional_credito" },
        total_pedidosYa: { $sum: "$total_credito" },
        diferencia: { $sum: "$diferencia" },
        tesoreria: { $sum: "$tesoreria" },
        total_efectivo_en_caja: { $sum: "$total_efectivo_en_caja" },
        total_efectivo_en_caja_real: { $sum: "$total_efectivo_en_caja_real" },
      }
    })

    const reportes = await this.cajasModel.aggregate(pipeline);

    return reportes[0];

  }

  // Reporte de cajas - PDF
  async reporteCajasPDF(data: any): Promise<any> {

    const { fechaDesde, fechaHasta, reportes } = data;

    let html: any;

    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/reporte_cajas.html', 'utf-8');

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
        height: "10mm",
        contents: {}
      }
    }

    // Configuraciones de documento
    var document = {
      html: html,
      data: {
        fechaDesde: fechaDesde === '' ? 'Inicio del sistema' : fechaDesde,
        fechaHasta: fechaHasta === '' ? 'El día de hoy' : fechaHasta,
        cantidad_ventas: reportes.cantidad_ventas,
        total_balanza: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_balanza),
        total_debito: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_debito),
        total_credito: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_credito),
        total_mercadopago: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_mercadopago),
        total_no_balanza: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_no_balanza),
        total_adicional_credito: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_adicional_credito),
        total_ventas: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_ventas),
        otros_ingresos: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.otros_ingresos),
        otros_gastos: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.otros_gastos),
        total_pedidosYa: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_pedidosYa),
        total_efectivo_en_caja: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_efectivo_en_caja),
        total_efectivo_en_caja_real: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_efectivo_en_caja_real),
        tesoreria: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.tesoreria),
        diferencia: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.diferencia),
        total_facturado: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_facturado),
        total_postnet: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(reportes.total_debito + reportes.total_credito + reportes.total_mercadopago),
      },
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/reporte_cajas.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'Reporte generado correctamente';
    
  }

}
