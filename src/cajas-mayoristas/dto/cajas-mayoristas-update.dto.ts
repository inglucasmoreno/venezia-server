
export class CajasMayoristasUpdateDTO {
  
  readonly fecha_caja: string;

  readonly cantidad_ventas: number;

  readonly total_ventas: number;

  readonly total_anticipos: number;

  readonly total_cuentas_corrientes: number;

  readonly total_deuda: number;

  readonly monto_a_recibir: number;

  readonly total_otros_ingresos: number;

  readonly total_otros_gastos: number;

  readonly ingresos: [];

  readonly gastos: [];

  readonly total_recibido: number;

  readonly total_recibido_real: number;

  readonly monto_cintia: number;

  readonly diferencia: number;

  readonly total_final: number;

  readonly activo: boolean;
  
  readonly creatorUser: string; 
  
  readonly updatorUser: string;

}