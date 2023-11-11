
export class ComprasUpdateDTO {
  
  readonly fecha_compra: string | Date;

  readonly numero: number;

  readonly numero_factura: string;

  readonly comentarios: string;

  readonly estado: string;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;
  
  readonly activo: boolean;

}