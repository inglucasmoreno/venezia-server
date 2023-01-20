
export class MayoristasGastosUpdateDTO {
  
  fecha_gasto: string;

  readonly paquete: string;

  readonly tipo_gasto: string;

  readonly repartidor: string;

  readonly monto: number;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;
  
  readonly activo: boolean;

}