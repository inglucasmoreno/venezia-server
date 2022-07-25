export class VentasUpdateDTO {
    
  readonly productos: [];

  readonly forma_pago: [];
  
  readonly precio_total: number;

  readonly precio_total_limpio: number;
  
  readonly adicional_credito: number;

  readonly comprobante: string;
  
  readonly total_balanza: number;
  
  readonly total_no_balanza: number;

  readonly facturacion: {
    puntoVenta: number,
    tipoComprobante: number,
    nroComprobante: number
  };

  readonly creatorUser: string;
  
  readonly updatorUser: string;
  
  readonly activo: boolean;

}