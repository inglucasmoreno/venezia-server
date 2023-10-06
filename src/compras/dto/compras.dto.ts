import { IsNotEmpty } from "class-validator";

export class ComprasDTO {
  
  readonly fecha_compra: string;

  readonly comentarios: string;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}