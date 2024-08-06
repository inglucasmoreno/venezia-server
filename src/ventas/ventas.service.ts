import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVentasProductos } from 'src/ventas-productos/interface/ventas-productos.interface';
import { VentasUpdateDTO } from './dto/ventas-update.dto';
import { VentasDTO } from './dto/ventas.dto';
import { IVentas } from './interface/ventas.interface';
import * as Afip from '@afipsdk/afip.js';
import { add, format } from 'date-fns';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { IProducto } from 'src/productos/interface/productos.interface';
import { IConfiguracionesGenerales } from 'src/configuraciones-generales/interface/configuraciones-generales.interface';
import { IVentasReservas } from 'src/ventas-reservas/interface/ventas-reservas.interface';
import * as QRCode from 'qrcode';
import { writeFile } from 'fs';

@Injectable()
export class VentasService {

  public afip = new Afip({ CUIT: '24340603989', production: false });

  public LIMITE_FACTURACION = 60000;

  public facturacion = {
    ptoVta: 1,
    docTipo: 99,    // Consumidor final
    docNro: 0,      // Consumidor final
    cbteTipo: 6,    // Factura tipo C (COD 11)
  }

  constructor(
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,
    @InjectModel('Productos') private readonly productosModel: Model<IProducto>,
    @InjectModel('VentasProductos') private readonly ventasProductosModel: Model<IVentasProductos>,
    @InjectModel('VentasReservas') private readonly ventasReservasModel: Model<IVentasReservas>,
    @InjectModel('ConfiguracionesGenerales') private readonly configuracionesGeneralesModel: Model<IConfiguracionesGenerales>,
  ) { }

  // Venta por ID
  async getVentas(id: string): Promise<any> {

    const ventaDB = await this.ventasModel.findById(id);
    if (!ventaDB) throw new NotFoundException('La venta no existe');

    const pipeline = [];

    const idVenta = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idVenta } })

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

    const venta = await this.ventasModel.aggregate(pipeline);

    const productos = await this.ventasProductosModel.find({ venta: id });

    return {
      venta: venta[0],
      productos
    };

  }

  // Listar ventas
  async listarVentas(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      tipoComprobante,
      pedidosYa,
      desde,
      registerpp,
      fechaDesde,
      fechaHasta,
      activo,
      parametro
    } = querys;

    // Pipelines
    const pipeline = [];
    const pipelineTotal = [];
    const pipelineCalculos = [];
    const pipelinePedidosYa = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });
    pipelineCalculos.push({ $match: {} });
    pipelinePedidosYa.push({ $match: {} });

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
      pipelineCalculos.push({ $match: filtroActivo });
      pipelinePedidosYa.push({ $match: filtroActivo });
    }

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
      pipelinePedidosYa.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
      pipelineCalculos.push({
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
      pipelinePedidosYa.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
      pipelineCalculos.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    // Filtro - Tipo de comprobante
    if (tipoComprobante && tipoComprobante !== '') {
      pipeline.push({ $match: { comprobante: tipoComprobante } });
      pipelineTotal.push({ $match: { comprobante: tipoComprobante } });
    };

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

    // Filtro - Parametros

    if (parametro && parametro !== '') {
      const regex = new RegExp(parametro, 'i');
      pipeline.push({ $match: { $or: [{ pedidosya_comprobante: regex }, { 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ pedidosya_comprobante: regex }, { 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex }] } });
    }

    // TOTALES - VENTAS Y FACTURADO

    pipelineCalculos.push({
      $group: {
        _id: null,
        totalVentas: { $sum: "$precio_total" },
        totalFacturado: { $sum: { $cond: [{ $eq: ["$comprobante", 'Fiscal'] }, "$precio_total", 0] } },
        cantidad_ventas: { $sum: 1 },
      }
    })
    // pipelineCalculos.push({ "$unset": ["_id"] });

    // TOTALES - PEDIDOS YA

    pipelinePedidosYa.push({ $unwind: '$forma_pago' });
    pipelinePedidosYa.push({
      $group: {
        _id: null,
        totalPedidosYaOnline: { $sum: { $cond: [{ $eq: ["$forma_pago.descripcion", 'PedidosYa'] }, "$precio_total", 0] } },
        totalPedidosYaEfectivo: { $sum: { $cond: [{ $eq: ["$forma_pago.descripcion", 'PedidosYa - Efectivo'] }, "$precio_total", 0] } },
      }
    })
    // pipelineCalculos.push({ "$unset": ["_id"] })

    // FILTRO - PEDIDOSYA ONLINE
    if (pedidosYa.trim() !== '' && pedidosYa.trim() === 'PedidosYa - App') {
      pipeline.push({ $unwind: '$forma_pago' });
      pipelineTotal.push({ $unwind: '$forma_pago' });
      pipeline.push({ $match: { 'forma_pago.descripcion': 'PedidosYa' } });
      pipelineTotal.push({ $match: { 'forma_pago.descripcion': 'PedidosYa' } });
    }

    // FILTRO - PEDIDOSYA EFECTIVO
    if (pedidosYa.trim() !== '' && pedidosYa.trim() === 'PedidosYa - Efectivo') {
      pipeline.push({ $unwind: '$forma_pago' });
      pipelineTotal.push({ $unwind: '$forma_pago' });
      pipeline.push({ $match: { 'forma_pago.descripcion': 'PedidosYa - Efectivo' } });
      pipelineTotal.push({ $match: { 'forma_pago.descripcion': 'PedidosYa - Efectivo' } });
    }

    // FILTRO - PEDIDOSYA
    if (pedidosYa.trim() !== '' && pedidosYa.trim() === 'PedidosYa') {
      pipeline.push({ $unwind: '$forma_pago' });
      pipelineTotal.push({ $unwind: '$forma_pago' });
      pipeline.push({ $match: { $or: [{ 'forma_pago.descripcion': 'PedidosYa' }, { 'forma_pago.descripcion': 'PedidosYa - Efectivo' }] } });
      pipelineTotal.push({ $match: { $or: [{ 'forma_pago.descripcion': 'PedidosYa' }, { 'forma_pago.descripcion': 'PedidosYa - Efectivo' }] } });
    }

    // FILTRO - DISTINTOS A PEDIDOS YA
    if (pedidosYa.trim() !== '' && pedidosYa.trim() === 'SinPedidosYa') {
      pipeline.push({ $unwind: '$forma_pago' });
      pipelineTotal.push({ $unwind: '$forma_pago' });
      pipeline.push({ $match: { $and: [{ 'forma_pago.descripcion': { $ne: 'PedidosYa' } }, { 'forma_pago.descripcion': { $ne: 'PedidosYa - Efectivo' } }] } });
      pipelineTotal.push({ $match: { $and: [{ 'forma_pago.descripcion': { $ne: 'PedidosYa' } }, { 'forma_pago.descripcion': { $ne: 'PedidosYa - Efectivo' } }] } });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    // Busqueda de ventas
    const [
      ventas,
      ventasTotal,
      totales,
      totalesPedidosYa,
    ] = await Promise.all([
      this.ventasModel.aggregate(pipeline),
      this.ventasModel.aggregate(pipelineTotal),
      this.ventasModel.aggregate(pipelineCalculos),
      this.ventasModel.aggregate(pipelinePedidosYa),
    ]);

    if (pedidosYa.trim() !== '') ventas.map(venta => (venta.forma_pago = [venta.forma_pago]));

    return {
      ventas,
      totalVentas: totales.length !== 0 ? totales[0].totalVentas : 0,
      totalFacturado: totales.length !== 0 ? totales[0].totalFacturado : 0,
      totalPedidosYaOnline: totalesPedidosYa.length !== 0 ? totalesPedidosYa[0].totalPedidosYaOnline : 0,
      totalPedidosYaEfectivo: totalesPedidosYa.length !== 0 ? totalesPedidosYa[0].totalPedidosYaEfectivo : 0,
      totalPedidosYa: totalesPedidosYa.length !== 0 ? totalesPedidosYa[0].totalPedidosYaOnline + totalesPedidosYa[0].totalPedidosYaEfectivo : 0,
      // totalItems: pedidosYa !== '' ? ventas.length : ventasTotal.length
      totalItems: ventasTotal.length
    };

  }

  // Funcion para redondeo
  redondear(numero: number, decimales: number): number {

    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

  }

  // Crear venta
  async crearVenta(ventasDTO: VentasDTO): Promise<IVentas> {

    const {
      productos,
      comprobante,
      sena,
      adicional_credito,
      contribuyente
    } = ventasDTO;

    // Se verifica si el control de stock esta habilitado
    const configuraciones = await this.configuracionesGeneralesModel.find();
    const stockHabilitado = configuraciones[0].stock;

    // Se calculan los totales de balanza y no balanza
    let total_balanza = 0;
    let total_no_balanza = 0;

    productos.map((producto: any) => {
      if (producto.balanza) total_balanza += producto.precio;   // Producto de balanza
      else total_no_balanza += producto.precio;                 // Producto no es de balanza
    });

    if (comprobante === 'Normal') {

      // --> VENTA NORMAL

      const productosTMP: any[] = productos;

      const dataVenta = { ...ventasDTO, total_balanza, total_no_balanza }

      // Se crea la venta
      const nuevaVenta = new this.ventasModel(dataVenta);
      const venta = await nuevaVenta.save();

      // Recorrido de productos
      for (const producto of productosTMP) {

        // Se agregar el id de la venta al producto 
        producto.venta = venta._id;

        if (stockHabilitado) { // Se descuenta el stock si esta habilitado el uso del mismo
          if (!producto.balanza) { // Se reduce la cantidad de cada producto en el stock si no es de balanza
            const productoDB = await this.productosModel.findById(producto.producto);

            if (!productoDB.cantidad)
              await this.productosModel.findByIdAndUpdate(producto.producto, { cantidad: -producto.cantidad });
            else
              await this.productosModel.findByIdAndUpdate(producto.producto, { $inc: { cantidad: -producto.cantidad } });
          }
        }

      }

      // Se cargan los productos
      await this.ventasProductosModel.insertMany(productos);

      return venta;

    } else {

      let cbteTipo = 0;
      let docTipo = 0;
      let docNro = 0;

      if (comprobante === 'Fiscal') {
        cbteTipo = 6;                                     // Facturacion B
        docTipo = 99;                                     // Consumidor final
        docNro = 0;                                       // Consumidor final
      } else if (comprobante === 'Factura A') {
        cbteTipo = 1;                                     // Facturacion A
        docTipo = 80;                                     // Consumido final
        docNro = Number(contribuyente.identificacion);    // Consumidor final
      }

      // --> FACTURACION ELECTRONICA

      let impTotal = ventasDTO.precio_total;

      // Ultimo numero de comprobante
      const ultimoNumero = await this.afip.ElectronicBilling.getLastVoucher(this.facturacion.ptoVta, cbteTipo).catch(() => {
        throw new NotFoundException('No hay conexión con el servidor de AFIP');
      })

      let cbteNro = ultimoNumero + 1;

      const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

      let impNeto = 0;
      let impIVA = 0;
      let alicuotas = [];

      if (productos.length !== 0 && !sena) {

        // A = 21 y B = 10.5

        // Importes totales
        let impTotal_A = 0
        let impTotal_B = 0

        productos.map((producto: any) => {

          if (producto.alicuota === 10.5) { // -> B (10.5)
            impTotal_B += producto.precio
          } else {                        // -> A (21)
            impTotal_A += producto.precio
          }

        })

        // En caso de ser pago con credito se agrega el adicional
        if (adicional_credito !== 0 && impTotal_A !== 0) {
          impTotal_A += adicional_credito;
        } else if (adicional_credito !== 0 && impTotal_B !== 0) {
          impTotal_B += adicional_credito;
        }

        // Importes Netos
        let impNeto_A = this.redondear((impTotal_A / 1.21), 2);
        let impNeto_B = this.redondear((impTotal_B / 1.105), 2);
        impNeto = this.redondear(impNeto_A + impNeto_B, 2)

        // Importe de IVA
        let impIVA_A = this.redondear(impTotal_A - impNeto_A, 2);
        let impIVA_B = this.redondear(impTotal_B - impNeto_B, 2);
        impIVA = this.redondear(impIVA_A + impIVA_B, 2);

        // Arreglo de alicuotas

        if (impTotal_A !== 0) {       // Alicuota -> 21
          alicuotas.push({
            'Id': 5,
            'BaseImp': impNeto_A,
            'Importe': impIVA_A
          })
        }

        if (impTotal_B !== 0) { // Alicuota -> 10.5
          alicuotas.push({
            'Id': 4,
            'BaseImp': impNeto_B,
            'Importe': impIVA_B
          })
        }

      } else { // -> El importe total corresponde a una seña

        impNeto = this.redondear((impTotal / 1.21), 2);
        impIVA = this.redondear((impTotal - impNeto), 2);

        alicuotas.push({
          'Id': 5,
          'BaseImp': impNeto,
          'Importe': impIVA
        })

      }

      let dataFactura = {
        'CantReg': 1,                                 // Cantidad de comprobantes a registrar
        'PtoVta': this.facturacion.ptoVta,            // Punto de venta
        'CbteTipo': cbteTipo,                         // Tipo de comprobante (Ej. 1 = A, 6 = B y 11 = C)
        'Concepto': 1,                                // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
        'DocTipo': docTipo,                           // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
        'DocNro': docNro,                             // Número de documento del comprador (0 consumidor final)
        'CbteDesde': cbteNro,                         // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
        'CbteHasta': cbteNro,                         // Número de comprobante o numero del último comprobante en caso de ser mas de uno
        'CbteFch': parseInt(date.replace(/-/g, '')),  // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
        'ImpTotal': impTotal,                         // Importe total del comprobante
        'ImpTotConc': 0,                              // Importe neto no gravado
        'ImpNeto': impNeto,                           // Importe neto gravado
        'ImpOpEx': 0,                                 // Importe exento de IVA
        'ImpIVA': impIVA,                             // Importe total de IVA
        'ImpTrib': 0,                                 // Importe total de tributos
        'MonId': 'PES',                               // Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
        'MonCotiz': 1,                                // Cotización de la moneda usada (1 para pesos argentinos)
        'Iva': alicuotas,
      };

      const facturaElectronica = await this.afip.ElectronicBilling.createVoucher(dataFactura).catch((error) => {
        throw new NotFoundException(error.message);
      })

      // --> CREANDO VENTA

      const facturacion = {
        puntoVenta: this.facturacion.ptoVta,
        tipoComprobante: cbteTipo,
        nroComprobante: cbteNro,
        clienteRazonSocial: cbteTipo === 6 ? '' : contribuyente.razonSocial,
        clienteTipoPersona: cbteTipo === 6 ? '' : contribuyente.tipoPersona,
        clienteTipoIdentificacion: contribuyente.tipoIdentificacion,
        clienteIdentificacion: cbteTipo === 6 ? '' : contribuyente.identificacion,
      }

      let dataVenta = { ...ventasDTO, facturacion, total_balanza, total_no_balanza }
      dataVenta.comprobante = 'Fiscal';

      const nuevaVenta = new this.ventasModel(dataVenta);
      const venta = await nuevaVenta.save();

      // --> CARGA DE PRODUCTOS

      const productosTMP: any[] = productos;
      for (const producto of productosTMP) {

        producto.venta = venta._id;

        if (stockHabilitado) { // Se descuenta el stock si esta habilitado el uso del mismo
          if (!producto.balanza) { // Se reduce la cantidad de cada producto en el stock si no es de balanza
            const productoDB = await this.productosModel.findById(producto.producto);

            if (!productoDB.cantidad)
              await this.productosModel.findByIdAndUpdate(producto.producto, { cantidad: -producto.cantidad });
            else
              await this.productosModel.findByIdAndUpdate(producto.producto, { $inc: { cantidad: -producto.cantidad } });
          }
        }

      }

      await this.ventasProductosModel.insertMany(productos);

      return venta;

    }

  }

  // Actualizar venta
  async actualizarVenta(id: string, ventasUpdateDTO: VentasUpdateDTO): Promise<IVentas> {
    const venta = await this.ventasModel.findByIdAndUpdate(id, ventasUpdateDTO, { new: true });
    return venta;
  }

  // Actualizar a comprobante fiscal
  async actualizarFacturacion(id, data: any): Promise<any> {

    // --> FACTURACION ELECTRONICA

    const { precio_total, updatorUser } = data;

    let impTotal = precio_total;

    // Ultimo numero de comprobante
    const ultimoNumero = await this.afip.ElectronicBilling.getLastVoucher(this.facturacion.ptoVta, this.facturacion.cbteTipo).catch(() => {
      throw new NotFoundException('No hay conexión con el servidor de AFIP');
    })

    let cbteNro = ultimoNumero + 1;

    const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    let impNeto = this.redondear((impTotal / 1.21), 2);
    let impIVA = this.redondear((impTotal - impNeto), 2);

    let dataFactura = {
      'CantReg': 1,                                // Cantidad de comprobantes a registrar
      'PtoVta': this.facturacion.ptoVta,          // Punto de venta
      'CbteTipo': this.facturacion.cbteTipo,        // Tipo de comprobante (Ej. 6 = B y 11 = C)
      'Concepto': 1,                                // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
      'DocTipo': this.facturacion.docTipo,         // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
      'DocNro': this.facturacion.docNro,          // Número de documento del comprador (0 consumidor final)
      'CbteDesde': cbteNro,                          // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
      'CbteHasta': cbteNro,                          // Número de comprobante o numero del último comprobante en caso de ser mas de uno
      'CbteFch': parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
      'ImpTotal': impTotal,                         // Importe total del comprobante
      'ImpTotConc': 0,                                // Importe neto no gravado
      'ImpNeto': impNeto,                          // Importe neto gravado
      'ImpOpEx': 0,                                // Importe exento de IVA
      'ImpIVA': impIVA,                                // Importe total de IVA
      'ImpTrib': 0,                                // Importe total de tributos
      'MonId': 'PES',                            // Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
      'MonCotiz': 1,                                // Cotización de la moneda usada (1 para pesos argentinos)
      'Iva': [                                     // (Opcional) Alícuotas asociadas al comprobante
        {
          'Id': 5,                                    // Id del tipo de IVA (5 para 21%)(ver tipos disponibles) 
          'BaseImp': impNeto,                          // Base imponible
          'Importe': impIVA                            // Importe 
        }
      ],
    };

    const facturaElectronica = await this.afip.ElectronicBilling.createVoucher(dataFactura).catch((error) => {
      throw new NotFoundException('Error al realizar la facturación');
    })

    const dataUpdate = {
      comprobante: 'Fiscal',
      facturacion: {
        puntoVenta: this.facturacion.ptoVta,
        tipoComprobante: this.facturacion.cbteTipo,
        nroComprobante: cbteNro
      },
      updatorUser
    }

    // --> ACTUALIZACION DE VENTA -> Comprobante fiscal
    const venta = await this.ventasModel.findByIdAndUpdate(id, dataUpdate);
    return venta;

  }

  // Comprobante electronico
  async comprobanteElectronico(idVenta: string): Promise<any> {

    // Flag - Reserva
    let instanciaReserva = '';

    // Buscando venta
    const ventaDB: any = await this.ventasModel.findById(idVenta);

    // Buscando productos
    const productosDB = await this.ventasProductosModel.find({ venta: ventaDB._id });

    // La venta esta relacionada con una reserva
    const relacion = await this.ventasReservasModel.findOne({ venta: ventaDB._id });

    if (relacion) instanciaReserva = relacion.instancia;

    // Productos
    let productos = [];
    productosDB.map(producto => {
      productos.push({
        descripcion: producto.descripcion,
        unidad_medida: producto.unidad_medida,
        precio: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio),
        precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_unitario),
        cantidad: producto.balanza === false ? producto.cantidad : Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.cantidad),
      })
    })

    // Formas de pago
    let forma_pago = '';
    let first = true;
    ventaDB.forma_pago.map(forma => {
      if (first) {
        forma.descripcion === 'PedidosYa - Efectivo' ? forma_pago += 'PedidosYa' : forma_pago += `${forma.descripcion}`
        first = false;
      } else {
        forma.descripcion === 'PedidosYa - Efectivo' ? forma_pago += ' - PedidosYa' : forma_pago += ` - ${forma.descripcion}`
      }
    })

    let dataPDF = {};
    let html: any;

    if (ventaDB.comprobante === 'Normal') { // Comprobante - Normal
      html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/comprobante.html', 'utf-8');
      dataPDF = {
        fecha: format(ventaDB.createdAt, 'dd/MM/yyyy kk:mm:ss'),
        forma_pago,
        instanciaReserva,
        total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ventaDB.precio_total),
        productos: productos,
      };
    } else { // - Comprobante - Fiscal

      // Informacion de comprobante
      const { puntoVenta, nroComprobante, tipoComprobante } = ventaDB.facturacion;
      const comprobante = await this.afip.ElectronicBilling.getVoucherInfo(nroComprobante, puntoVenta, tipoComprobante).catch((error) => {
        throw new NotFoundException('Error al obtener información de comprobante');
      })

      const {
        CodAutorizacion,
        MonId,
        MonCotiz,
        ImpTotal,
        PtoVta,
        DocTipo,
        DocNro,
        CbteTipo,
        CbteDesde,
        CbteFch,
        EmisionTipo,
      } = comprobante;

      // Adaptando formato de fecha
      let CbteFchAdaptada = this.convertirFormatoFecha(CbteFch);

      // Codificacion - Base64
      const datosQR = {
        ver: 1,
        fecha: CbteFchAdaptada,
        cuit: Number(this.afip.CUIT),
        ptoVta: PtoVta,
        tipoCmp: CbteTipo,
        nroCmp: Number(CbteDesde),
        importe: Number(ImpTotal),
        moneda: MonId,
        ctz: Number(MonCotiz),
        tipoDocRec: DocTipo,
        nroDocRec: Number(DocNro),
        tipoCodAut: EmisionTipo === "CAE" ? "E" : "A",
        codAut: Number(CodAutorizacion),
      };

      // Codificar en base64
      const cadenaJson = JSON.stringify(datosQR);
      const cadenaEnBase64 = Buffer.from(cadenaJson).toString('base64');

      const urlQR = `https://www.afip.gob.ar/fe/qr/?p=${cadenaEnBase64}`;

      // QRCode.toDataURL(urlQR, { errorCorrectionLevel: 'H' }, function (err, url) {
      //   if (err) throw err;

      //   // Convertir Data URL a Buffer
      //   const base64Data = url.split(';base64,').pop();
      //   if (base64Data) {
      //     const buffer = Buffer.from(base64Data, 'base64');

      //     // Especifica la ruta y el nombre del archivo donde quieres guardar el QR
      //     const pathArchivo = './public/codigoQR.png';

      //     // Guardar el archivo
      //     writeFile(pathArchivo, buffer, (error) => {
      //       if (error) throw error;
      //     });
      //   }
      // });

      try {
        // Convertir QRCode.toDataURL a una versión que retorna una promesa
        const url = await new Promise<string>((resolve, reject) => {
          QRCode.toDataURL(urlQR, { errorCorrectionLevel: 'L' }, (err, url) => {
            if (err) reject(err);
            else resolve(url);
          });

        });

        // Convertir Data URL a Buffer
        const base64Data = url.split(';base64,').pop();
        if (!base64Data) throw new Error("No se pudo obtener los datos en base64 del QR.");

        const buffer = Buffer.from(base64Data, 'base64');

        // Especifica la ruta y el nombre del archivo donde quieres guardar el QR

        const pathPublic = process.env.PUBLIC_DIR || './public';
        const pathArchivoQR = `${pathPublic}/codigoQR.png`;
  
        // Guardar el archivo usando la versión de promesa de writeFile
        await writeFile(pathArchivoQR, buffer, () => {});
  
      } catch (error) {
        throw new Error("Error al generar el QR.");
      }
      
      // Generar numero de comprobante
      let codigoFactura = `${puntoVenta.toString().padStart(5, '0')}-${(nroComprobante).toString().padStart(8, '0')}`;

      // Fecha de vto de CAE
      const vtoCAEtmp = await this.afip.ElectronicBilling.formatDate(comprobante.FchVto);
      const vtoCAE = format(add(new Date(vtoCAEtmp), { hours: 3 }), 'dd/MM/yyyy');

      // Fecha de emision de comprobante
      const fechaEmisionTmp = await this.afip.ElectronicBilling.formatDate(comprobante.CbteFch);
      const fechaEmision = format(add(new Date(fechaEmisionTmp), { hours: 3 }), 'dd/MM/yyyy');

      // Tipo comprobante
      let tipoCte = '';
      if (tipoComprobante === 1) tipoCte = 'A';
      if (tipoComprobante === 6) tipoCte = 'B';
      if (tipoComprobante === 11) tipoCte = 'C';

      // let nroFactura = '';
      let nroFactura = `${puntoVenta.toString().padStart(5, '0')}-${(nroComprobante).toString().padStart(8, '0')}`;
      let puntoVentaString = `${puntoVenta.toString().padStart(5, '0')}`;
      let nroComprobanteString = `${(nroComprobante).toString().padStart(8, '0')}`;

      html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/comprobante_fiscal.html', 'utf-8');
      dataPDF = {
        CAE: comprobante.CodAutorizacion,
        nroFactura,
        nroComprobante: nroComprobanteString,
        puntoVenta: puntoVentaString,
        fecha: format(ventaDB.createdAt, 'dd/MM/yyyy kk:mm:ss'),
        vtoCAE,
        tipoCte,
        ideTipoCte: tipoComprobante,
        fechaEmision,
        tipoComprobante,
        clienteRazonSocial: ventaDB.facturacion.tipoComprobante === 1 ? ventaDB.facturacion.clienteRazonSocial : '',
        clienteTipoPersona: ventaDB.facturacion.tipoComprobante === 1 ? ventaDB.facturacion.clienteTipoPersona : '',
        clienteTipoIdentificacion: ventaDB.facturacion.tipoComprobante === 1 ? ventaDB.facturacion.clienteTipoIdentificacion : '',
        clienteIdentificacion: ventaDB.facturacion.tipoComprobante === 1 ? ventaDB.facturacion.clienteIdentificacion : '',
        forma_pago,
        instanciaReserva,
        total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ventaDB.precio_total),
        productos: productos,
      };

    }

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '0mm',
      footer: {
        height: "0mm",
        contents: {}
      }
    }

    // Configuraciones de documento
    var document = {
      html: html,
      data: dataPDF,
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/comprobante.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'Comprobante generado correctamente';

  }

  // Obtener contribuyente
  async getContribuyente(cuit: string): Promise<any> {
    const contribuyente = await this.afip.RegisterScopeThirteen.getTaxpayerDetails(cuit); // Padron 13
    if (!contribuyente) throw new NotFoundException('No se encontro al contribuyente');
    return contribuyente;
  }

  // Proximo numero de factura
  async proximoNroFactura(tipoComprobante: string): Promise<any> {

    let tipoNroComprobante = 6;

    if (tipoComprobante === 'A') tipoNroComprobante = 1;  // 1 -> A
    if (tipoComprobante === 'B') tipoNroComprobante = 6;  // 6 -> B
    if (tipoComprobante === 'C') tipoNroComprobante = 11; // 11 -> C

    // Ultimo numero de comprobante
    const ultimoNumero = await this.afip.ElectronicBilling.getLastVoucher(this.facturacion.ptoVta, tipoNroComprobante).catch(() => {
      throw new NotFoundException('No hay conexión con el servidor de AFIP');
    })

    let nroComprobante = ultimoNumero + 1;

    // Generacion de numero de factura
    let nroFactura = '';

    if (nroComprobante <= 9) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-0000000' + nroComprobante;
    } else if (nroComprobante <= 99) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-000000' + nroComprobante;
    } else if (nroComprobante <= 999) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-00000' + nroComprobante;
    } else if (nroComprobante <= 9999) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-0000' + nroComprobante;
    } else if (nroComprobante <= 99999) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-000' + nroComprobante;
    } else if (nroComprobante <= 999999) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-00' + nroComprobante;
    } else if (nroComprobante <= 9999999) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-0' + nroComprobante;
    } else if (nroComprobante <= 99999999) {
      nroFactura = '0000' + this.facturacion.ptoVta + '-' + nroComprobante;
    }

    return nroFactura;

  }

  // Función para convertir la fecha de formato YYYYMMDD a YYYY-MM-DD
  convertirFormatoFecha(fechaOriginal: string): string {
    // Asegurarse de que la fechaOriginal tiene la longitud esperada
    if (fechaOriginal.length !== 8) {
      throw new Error("La fecha debe tener exactamente 8 caracteres en el formato YYYYMMDD.");
    }

    // Extraer año, mes y día de la fechaOriginal
    let año = fechaOriginal.substring(0, 4);
    let mes = fechaOriginal.substring(4, 6);
    let día = fechaOriginal.substring(6, 8);

    // Construir la nueva fecha en el formato deseado
    let fechaConvertida = `${año}-${mes}-${día}`;

    return fechaConvertida;
  }

}
