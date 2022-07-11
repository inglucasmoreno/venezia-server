import { IsNotEmpty } from "class-validator";

export class VentasDTO {
    
  @IsNotEmpty()
  readonly forma_pago: [];
  
  @IsNotEmpty()
  readonly precio_total: number;
  
  readonly afip: boolean;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}