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

@Injectable()
export class VentasService {

  public afip = new Afip({ CUIT: '', production: true });

  public facturacion = {
    ptoVta: 4,
    docTipo: 99,    // Consumidor final
    docNro: 0,      // Consumidor final
    cbteTipo: 6,   // Factura tipo C (COD 11)
  }

  constructor(
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,
    @InjectModel('VentasProductos') private readonly ventasProductosModel: Model<IVentasProductos>,
  ){}

  // Venta por ID
  async getVentas(id: string): Promise<any> {

      const ventaDB = await this.ventasModel.findById(id);
      if(!ventaDB) throw new NotFoundException('La venta no existe');

      const pipeline = [];

      const idVenta = new Types.ObjectId(id);
      pipeline.push({ $match:{ _id: idVenta} })

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

      const venta = await this.ventasModel.aggregate(pipeline);

      const productos = await this.ventasProductosModel.find({venta: id});

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
    
      pipeline.push({$match:{}});
      pipelineTotal.push({$match:{}});

      // Ordenando datos
      const ordenar: any = {};
      if(columna){
          ordenar[String(columna)] = Number(direccion);
          pipeline.push({$sort: ordenar});
      }

      // Filtro - Fecha desde
      if(fechaDesde && fechaDesde.trim() !== ''){
        pipeline.push({$match: { 
          createdAt: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
        }});
      }
      
      // Filtro - Fecha hasta
      if(fechaHasta && fechaHasta.trim() !== ''){
        pipeline.push({$match: { 
          createdAt: { $lte: add(new Date(fechaHasta),{ hours: 3, days: 1 })} 
        }});
      }

      // Filtro - Tipo de comprobante
      if(tipoComprobante && tipoComprobante !== '') {
        pipeline.push({$match: { comprobante: tipoComprobante }});
      };

      // Filtro - Activo / Inactivo
      let filtroActivo = {};
      if(activo && activo !== '') {
        filtroActivo = { activo: activo === 'true' ? true : false };
        pipeline.push({$match: filtroActivo});
      }

      // Paginacion
      pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

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

      // Filtro - Parametros

      if(parametro && parametro !== ''){
        const regex = new RegExp(parametro, 'i');
        pipeline.push({$match: { $or: [ { pedidosya_comprobante: regex }, { 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex } ] }});
        pipelineTotal.push({$match: { $or: [ { pedidosya_comprobante: regex },  { 'creatorUser.apellido': regex }, { 'creatorUser.nombre': regex } ] }});
      }

      // Busqueda de ventas
      const [ventas, ventasTotal] = await Promise.all([
        this.ventasModel.aggregate(pipeline),
        this.ventasModel.aggregate(pipelineTotal),
      ]);

      // Calcular totales

      let totalVentas = 0;
      let totalFacturado = 0;
      let totalPedidosYaOnline = 0;
      let totalPedidosYaEfectivo = 0;

      ventasTotal.map(venta => {
        totalVentas = venta.precio_total + totalVentas;
        
        if(venta.comprobante === 'Fiscal') totalFacturado = venta.precio_total + totalFacturado;
        
        if(venta.forma_pago[0].descripcion === 'PedidosYa') totalPedidosYaOnline = venta.precio_total;
                
        if(venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') totalPedidosYaEfectivo = venta.precio_total;
        
      });
      
      // Filtro PedidosYA

      let ventasTMP = ventas;
      let ventasTMPTotal = ventasTotal;


      // PedidosYA - Efectivo
      if(pedidosYa.trim() !== '' && pedidosYa.trim() !== 'PedidosYa - Efectivo'){
        ventasTMP = ventas.filter(venta => venta.forma_pago[0].descripcion === 'PedidosYa');
        ventasTMPTotal = ventas.filter(venta => venta.forma_pago[0].descripcion === 'PedidosYa');
      }

      // PedidosYA - Online
      if(pedidosYa.trim() !== '' && pedidosYa.trim() !== 'PedidosYa - App'){
        ventasTMP = ventas.filter( venta => venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo')
      }

      // PedidosYa - Completo
      if(pedidosYa.trim() !== '' && pedidosYa === 'PedidosYa'){
        ventasTMP = ventas.filter( venta => venta.forma_pago[0].descripcion === 'PedidosYa' || venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo')
      }

      // Sin pedidosYa
      if(pedidosYa.trim() !== '' && pedidosYa === 'SinPedidosYa'){
        ventasTMP = ventas.filter( venta => venta.forma_pago[0].descripcion !== 'PedidosYa' && venta.forma_pago[0].descripcion !== 'PedidosYa - Efectivo'
        )
      }

      return {
        ventas: ventasTMP,
        totalVentas: ventasTMPTotal,
        totalFacturado,
        totalPedidosYa: totalPedidosYaOnline + totalPedidosYaEfectivo,
        totalPedidosYaOnline,
        totalPedidosYaEfectivo,
        totalItems: ventasTotal.length
      };

  }

  // Funcion para redondeo
  redondear(numero:number, decimales:number):number {
  
    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));
  
  }

  // Crear venta
  async crearVenta(ventasDTO: VentasDTO): Promise<IVentas> {

    const { productos, comprobante } = ventasDTO;

    // Se calculan los totales de balanza y no balanza
    let total_balanza = 0;
    let total_no_balanza = 0;

    productos.map( (producto: any) => {
      if(producto.balanza) total_balanza += producto.precio; // Producto de balanza
      else total_no_balanza += producto.precio;              // Producto no es de balanza
    });

    if(comprobante === 'Normal'){

      // --> VENTA NORMAL

      const productosTMP: any[] = productos;

      const dataVenta = {...ventasDTO, total_balanza, total_no_balanza}

      const nuevaVenta = new this.ventasModel(dataVenta);
      const venta = await nuevaVenta.save();

      for(const producto of productosTMP){ producto.venta = venta._id; }

      // Se cargan los productos
      await this.ventasProductosModel.insertMany(productos);

      return venta;

    }else{

      // --> FACTURACION ELECTRONICA

      let impTotal = ventasDTO.precio_total;

      // Ultimo numero de comprobante
      const ultimoNumero = await this.afip.ElectronicBilling.getLastVoucher(this.facturacion.ptoVta, this.facturacion.cbteTipo).catch( () => {
        throw new NotFoundException('Problemas al obtener numero de comprobante');
      })

      let cbteNro = ultimoNumero + 1;

      const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

      let impNeto = this.redondear((impTotal / 1.21), 2);
      let impIVA = this.redondear((impTotal - impNeto), 2);

      let dataFactura = {
        'CantReg' 	  : 1,                                // Cantidad de comprobantes a registrar
        'PtoVta' 	    : this.facturacion.ptoVta,          // Punto de venta
        'CbteTipo' 	  : this.facturacion.cbteTipo,        // Tipo de comprobante (Ej. 6 = B y 11 = C)
        'Concepto' 	  : 1,                                // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
        'DocTipo' 	  : this.facturacion.docTipo,         // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
        'DocNro' 	    : this.facturacion.docNro,          // Número de documento del comprador (0 consumidor final)
        'CbteDesde' 	: cbteNro,                          // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
        'CbteHasta' 	: cbteNro,                          // Número de comprobante o numero del último comprobante en caso de ser mas de uno
        'CbteFch' 	  : parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
        'ImpTotal' 	  : impTotal,                         // Importe total del comprobante
        'ImpTotConc' 	: 0,                                // Importe neto no gravado
        'ImpNeto' 	  : impNeto,                          // Importe neto gravado
        'ImpOpEx' 	  : 0,                                // Importe exento de IVA
        'ImpIVA' 	    : impIVA,                           // Importe total de IVA
        'ImpTrib' 	  : 0,                                // Importe total de tributos
        'MonId' 	    : 'PES',                            // Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
        'MonCotiz' 	  : 1,                                // Cotización de la moneda usada (1 para pesos argentinos)
        'Iva' 		: [                                     // (Opcional) Alícuotas asociadas al comprobante
        {
          'Id' 		: 5,                                    // Id del tipo de IVA (5 para 21%)(ver tipos disponibles) 
          'BaseImp' 	: impNeto,                          // Base imponible
          'Importe' 	: impIVA                            // Importe 
        }
      ],
      };

      const facturaElectronica = await this.afip.ElectronicBilling.createVoucher(dataFactura).catch((error) => {
        throw new NotFoundException(error.message);
      })

      // --> CREANDO VENTA
      
      const facturacion = {
        puntoVenta: this.facturacion.ptoVta,
        tipoComprobante: this.facturacion.cbteTipo,
        nroComprobante: cbteNro,
      }

      const dataVenta = {...ventasDTO, facturacion, total_balanza, total_no_balanza}

      const nuevaVenta = new this.ventasModel(dataVenta);
      const venta = await nuevaVenta.save();

      // --> CARGA DE PRODUCTOS
      
      const productosTMP: any[] = productos;
      for(const producto of productosTMP){ producto.venta = venta._id; }

      await this.ventasProductosModel.insertMany(productos);

      return venta;

    }

  }

  // Actualizar venta
  async actualizarVenta(id: string, ventasUpdateDTO: VentasUpdateDTO): Promise<IVentas> {
      const venta = await this.ventasModel.findByIdAndUpdate(id, ventasUpdateDTO, {new: true});
      return venta;
  }

  // Actualizar a comprobante fiscal
  async actualizarFacturacion(id, data: any): Promise<IVentas> {
  
    const { precio_total, updatorUser } = data;

    // --> FACTURACION ELECTRONICA

    let impTotal = precio_total;

    // Ultimo numero de comprobante
    const ultimoNumero = await this.afip.ElectronicBilling.getLastVoucher(this.facturacion.ptoVta, this.facturacion.cbteTipo).catch( () => {
      throw new NotFoundException('Problemas al obtener número de comprobante');
    })

    let cbteNro = ultimoNumero + 1;

    const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    let impNeto = this.redondear((impTotal / 1.21), 2);
    let impIVA = this.redondear((impTotal - impNeto), 2);

    let dataFactura = {
      'CantReg' 	  : 1,                                // Cantidad de comprobantes a registrar
      'PtoVta' 	    : this.facturacion.ptoVta,          // Punto de venta
      'CbteTipo' 	  : this.facturacion.cbteTipo,        // Tipo de comprobante (Ej. 6 = B y 11 = C)
      'Concepto' 	  : 1,                                // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
      'DocTipo' 	  : this.facturacion.docTipo,         // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
      'DocNro' 	    : this.facturacion.docNro,          // Número de documento del comprador (0 consumidor final)
      'CbteDesde' 	: cbteNro,                          // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
      'CbteHasta' 	: cbteNro,                          // Número de comprobante o numero del último comprobante en caso de ser mas de uno
      'CbteFch' 	  : parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
      'ImpTotal' 	  : impTotal,                         // Importe total del comprobante
      'ImpTotConc' 	: 0,                                // Importe neto no gravado
      'ImpNeto' 	  : impNeto,                          // Importe neto gravado
      'ImpOpEx' 	  : 0,                                // Importe exento de IVA
      'ImpIVA' 	    : impIVA,                                // Importe total de IVA
      'ImpTrib' 	  : 0,                                // Importe total de tributos
      'MonId' 	    : 'PES',                            // Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
      'MonCotiz' 	  : 1,                                // Cotización de la moneda usada (1 para pesos argentinos)
      'Iva' 		: [                                     // (Opcional) Alícuotas asociadas al comprobante
      {
        'Id' 		: 5,                                    // Id del tipo de IVA (5 para 21%)(ver tipos disponibles) 
        'BaseImp' 	: impNeto,                          // Base imponible
        'Importe' 	: impIVA                            // Importe 
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

    // Buscando venta
    const ventaDB: any = await this.ventasModel.findById(idVenta);

    // Buscando productos
    const productosDB = await this.ventasProductosModel.find({ venta: ventaDB._id });

    // Productos
    let productos = [];
    productosDB.map( producto => {
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
        if(first){
          forma.descripcion === 'PedidosYa - Efectivo' ? forma_pago += 'PedidosYa' : forma_pago += `${forma.descripcion}`
          first = false;
        }else{
          forma.descripcion === 'PedidosYa - Efectivo' ? forma_pago += ' - PedidosYa' : forma_pago += ` - ${forma.descripcion}`  
        }
    })

    let dataPDF = {};
    let html: any;

    if(ventaDB.comprobante === 'Normal'){ // Comprobante - Normal
      html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/comprobante.html', 'utf-8');
      dataPDF = {
        fecha: format(ventaDB.createdAt, 'dd/MM/yyyy kk:mm:ss'),
        forma_pago,
        total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ventaDB.precio_total),
        productos: productos,
      };
    }else{ // - Comprobante - Fiscal

      // Informacion de comprobante
      const { puntoVenta, nroComprobante, tipoComprobante } = ventaDB.facturacion;
      const comprobante = await this.afip.ElectronicBilling.getVoucherInfo(nroComprobante, puntoVenta, tipoComprobante).catch((error) => {
        throw new NotFoundException('Error al obtener información de comprobante');
      })

      // -- Ajustando fechas --
      
      // Fecha de vto de CAE
      const vtoCAEtmp = await this.afip.ElectronicBilling.formatDate(comprobante.FchVto);
      const vtoCAE = format(add(new Date(vtoCAEtmp),{ hours: 3 }), 'dd/MM/yyyy');

      // Fecha de emision de comprobante
      const fechaEmisionTmp = await this.afip.ElectronicBilling.formatDate(comprobante.CbteFch);
      const fechaEmision = format(add(new Date(fechaEmisionTmp), { hours: 3 }), 'dd/MM/yyyy');

      // Tipo comprobante
      let tipoCte = '';
      if(tipoComprobante === 1) tipoCte = 'A';
      if(tipoComprobante === 6) tipoCte = 'B';
      if(tipoComprobante === 11) tipoCte = 'C';

      let nroFactura = '';
      // Generacion de numero de factura
      if(nroComprobante <= 9){
        nroFactura =  '0000' + puntoVenta + '-0000000' + nroComprobante;
      }else if(nroComprobante <= 99){
        nroFactura =  '0000' + puntoVenta + '-000000' + nroComprobante;
      }else if(nroComprobante <= 999){
        nroFactura =  '0000' + puntoVenta + '-00000' + nroComprobante;
      }else if(nroComprobante <= 9999){
        nroFactura =  '0000' + puntoVenta + '-0000' + nroComprobante;
      }else if(nroComprobante <= 99999){
        nroFactura =  '0000' + puntoVenta + '-000' + nroComprobante;
      }else if(nroComprobante <= 999999){
        nroFactura =  '0000' + puntoVenta + '-00' + nroComprobante;
      }else if(nroComprobante <= 9999999){
        nroFactura =  '0000' + puntoVenta + '-0' + nroComprobante;
      }else if(nroComprobante <= 99999999){
        nroFactura =  '0000' + puntoVenta + '-' + nroComprobante;
      }

      html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/comprobante_fiscal.html', 'utf-8');
      dataPDF = {
        CAE: comprobante.CodAutorizacion,
        nroFactura,
        fecha: format(ventaDB.createdAt, 'dd/MM/yyyy kk:mm:ss'),
        vtoCAE,
        tipoCte,
        ideTipoCte: tipoComprobante,
        fechaEmision,
        tipoComprobante,
        forma_pago,
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

}
