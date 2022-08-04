import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVentasProductos } from 'src/ventas-productos/interface/ventas-productos.interface';
import { VentasUpdateDTO } from './dto/ventas-update.dto';
import { VentasDTO } from './dto/ventas.dto';
import { IVentas } from './interface/ventas.interface';
import * as Afip from '@afipsdk/afip.js';
import { add, format } from 'date-fns';

@Injectable()
export class VentasService {

  public afip = new Afip({ CUIT: 20176652536 });

  public facturacion = {
    ptoVta: 5,
    docTipo: 99,    // Consumidor final
    docNro: 0,      // Consumidor final
    cbteTipo: 11,   // Factura tipo C (COD 11)
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
  async listarVentas(querys: any): Promise<IVentas[]> {

      const {columna, fechaDesde, fechaHasta, direccion, activo} = querys;

      const pipeline = [];
      pipeline.push({$match:{}});

      // Fecha desde
      if(fechaDesde && fechaDesde.trim() !== ''){
        pipeline.push({$match: { 
          createdAt: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
        }});
      }
      
      // Fecha hasta
      if(fechaHasta && fechaHasta.trim() !== ''){
        pipeline.push({$match: { 
          createdAt: { $lte: add(new Date(fechaHasta),{ hours: 3, days: 1 })} 
        }});
      }

      // Filtrado por activos/inactivos
      if(activo !== 'todo') pipeline.push({$match:{ activo: activo === 'true' ? true : false }});

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

      // Se crea la venta
      const ventas = await this.ventasModel.aggregate(pipeline);

      return ventas;

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

      console.log(ventasDTO);

      // Ultimo numero de comprobante
      const ultimoNumero = await this.afip.ElectronicBilling.getLastVoucher(this.facturacion.ptoVta, this.facturacion.cbteTipo).catch( () => {
        throw new NotFoundException('Problemas al obtener numero de comprobante');
      })

      let cbteNro = ultimoNumero + 1;

      const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

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
        'ImpNeto' 	  : impTotal,                         // Importe neto gravado
        'ImpOpEx' 	  : 0,                                // Importe exento de IVA
        'ImpIVA' 	    : 0,                                // Importe total de IVA
        'ImpTrib' 	  : 0,                                // Importe total de tributos
        'MonId' 	    : 'PES',                            // Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
        'MonCotiz' 	  : 1,                                // Cotización de la moneda usada (1 para pesos argentinos)
      };

      const facturaElectronica = await this.afip.ElectronicBilling.createVoucher(dataFactura).catch((error) => {
        throw new NotFoundException(error.message);
      })

      // --> CREANDO VENTA
      
      const facturacion = {
        puntoVenta: 5,
        tipoComprobante: 11,
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
      'ImpNeto' 	  : impTotal,                         // Importe neto gravado
      'ImpOpEx' 	  : 0,                                // Importe exento de IVA
      'ImpIVA' 	    : 0,                                // Importe total de IVA
      'ImpTrib' 	  : 0,                                // Importe total de tributos
      'MonId' 	    : 'PES',                            // Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
      'MonCotiz' 	  : 1,                                // Cotización de la moneda usada (1 para pesos argentinos)
    };

    const facturaElectronica = await this.afip.ElectronicBilling.createVoucher(dataFactura).catch((error) => {
      throw new NotFoundException('Error al realizar la facturación');
    })

    // --> ACTUALIZACION DE VENTA -> Comprobante fiscal
    const venta = await this.ventasModel.findByIdAndUpdate(id, { 
      comprobante: 'Fiscal',
      updatorUser
    });
    return venta;

  }

}
