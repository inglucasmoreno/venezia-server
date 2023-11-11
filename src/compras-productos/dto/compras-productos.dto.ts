import { IsNotEmpty } from "class-validator";

export class ComprasProductosDTO {
  
  @IsNotEmpty()
  compra: string;

  @IsNotEmpty()
  producto: string;

  @IsNotEmpty()
  cantidad: number;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}