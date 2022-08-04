import { Injectable } from '@nestjs/common';
import * as Afip from '@afipsdk/afip.js';

@Injectable()
export class AfipService {

  // public afip = new Afip({ CUIT: 20176652536 });
  public afip = new Afip({ CUIT: 20176652536, production: true });

  constructor(){}

  // Obtener tipo de comprobantes
  tiposComprobantes(): Promise<any> {
    return this.afip.ElectronicBilling.getVoucherTypes();  
  }

  // Conceptos disponibles - 1 = Productos | 2 = Servicios | 3 - Productos y Servicios
  tiposConceptos(): Promise<any> {
    return this.afip.ElectronicBilling.getConceptTypes(); 
  }

  // Tipos de documentos - CUIT = 80 | CUIL = 86 | DNI = 96
  tiposDocumentos(): Promise<any> {
    return this.afip.ElectronicBilling.getDocumentTypes();
  }

  // Ultimo numero de comprobante
  ultimoNroComprobante(data: any): Promise<any> {
    const { puntoVenta, tipoComprobante } = data;
    return this.afip.ElectronicBilling.getLastVoucher(puntoVenta, tipoComprobante);
  }

  // Informacion de comprobante
  infoComprobante(data: any): Promise<any> {
    const { puntoVenta, nroComprobante, tipoComprobante } = data;
    return this.afip.ElectronicBilling.getVoucherInfo(nroComprobante, puntoVenta, tipoComprobante);
  }

  // Ajustar formato de fecha
  ajustarFecha(data: any): Promise<any> {
    return this.afip.ElectronicBilling.formatDate(data.fecha);  
  }

  // Generacion de factura electronica
  facturaElectronica(data: any): Promise<any> {

    const {
      ptoVta = 5, 
      cbteTipo, 
      docTipo = 99, 
      docNro = 0, 
      cbteNro,
      impTotal,
    } = data;

    const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    let dataFactura = {
      'CantReg' 	  : 1,                                   // Cantidad de comprobantes a registrar
      'PtoVta' 	    : 5,                                   // Punto de venta
      'CbteTipo' 	  : 11,                                  // Tipo de comprobante (Ej. 6 = B y 11 = C)
      'Concepto' 	  : 1,                                   // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
      'DocTipo' 	  : 99,                                  // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
      'DocNro' 	    : 0,                                   // Número de documento del comprador (0 consumidor final)
      'CbteDesde' 	: 1,                                   // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
      'CbteHasta' 	: 1,                                   // Número de comprobante o numero del último comprobante en caso de ser mas de uno
      'CbteFch' 	  : parseInt(date.replace(/-/g, '')),    // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
      'ImpTotal' 	  : 10,                                  // Importe total del comprobante
      'ImpTotConc' 	: 0,                                   // Importe neto no gravado
      'ImpNeto' 	  : 10,                                  // Importe neto gravado
      'ImpOpEx' 	  : 0,                                   // Importe exento de IVA
      'ImpIVA' 	    : 0,                                   // Importe total de IVA
      'ImpTrib' 	  : 0,                                   // Importe total de tributos
      'MonId' 	    : 'PES',                               // Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos) 
      'MonCotiz' 	  : 1,                                   // Cotización de la moneda usada (1 para pesos argentinos)  
    };

    const res = this.afip.ElectronicBilling.createVoucher(dataFactura);        
    return res;

  }

  // Consula de padrones alcances 4, 5, 10, 13 (Datos de contribuyente)
  
  // Alcance 4
  getContribuyenteA4(cuit: string): Promise<any> {
    return this.afip.RegisterScopeFour.getTaxpayerDetails(cuit); 
  }  

  // Alcance 5
  getContribuyenteA5(cuit: string): Promise<any> {
    return this.afip.RegisterScopeFive.getTaxpayerDetails(cuit);
  }  

  // Alcance 10
  getContribuyenteA10(cuit: string): Promise<any> {
    return this.afip.RegisterScopeTen.getTaxpayerDetails(cuit);
  }  

  // Alcance 13
  getContribuyenteA13(cuit: string): Promise<any> {
    return this.afip.RegisterScopeThirteen.getTaxpayerDetails(cuit); 
  }  

}
