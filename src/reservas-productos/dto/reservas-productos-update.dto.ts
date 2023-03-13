export class ReservasProductosUpdateDTO {

  readonly reserva: string;
  
  readonly descripcion: string;

  readonly balanza: boolean;

  readonly unidad_medida: string;

  readonly producto: string;

  readonly precio: number;
  
  readonly precio_unitario: number;
  
  readonly cantidad: number;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;
  
  readonly activo: boolean;

}