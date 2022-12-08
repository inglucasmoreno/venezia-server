
export class CobrosMayoristasUpdateDTO {
  
  fecha_cobro: string;

  readonly nro: number;

  readonly tipo: string;

  readonly pedidos: Array<any>;

  readonly mayorista: string;

  readonly epartidor: string;

  readonly anticipo: number;

  readonly monto: number;
  
  readonly monto_total: number;

  readonly creatorUser: string;
  
  readonly updatorUser: string;
  
  readonly ingreso: boolean;

  readonly activo: boolean;

}