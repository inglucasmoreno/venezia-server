export class CajasUpdateDTO {
  
  readonly saldo_inicial: number;

  readonly saldo_proxima_caja: number;

  readonly cantidad_ventas: number;

  readonly total_ventas: number;

  readonly total_facturado: number;

  readonly total_balanza: number;

  readonly total_no_balanza: number;

  readonly total_efectivo: number;
  
  readonly total_credito: number;

  readonly total_adicional_credito: number;

  readonly total_pedidosYa: number;
  
  readonly total_mercadopago: number;
  
  readonly total_debito: number;
  
  readonly otros_gastos: number;
 
  readonly otros_ingresos: number;
  
  readonly tesoreria: number;
  
  readonly diferencia: number;
  
  readonly gastos: [];

  readonly ingresos: [];

  readonly total_efectivo_en_caja: number;
  
  readonly total_efectivo_en_caja_real: number;

  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string; 

}