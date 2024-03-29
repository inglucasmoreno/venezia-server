import { IsNotEmpty } from "class-validator";

export class ComprasDTO {
  
  fecha_compra: string | Date;

  numero: number;

  numero_factura: string;

  readonly comentarios: string;

  estado: string;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}