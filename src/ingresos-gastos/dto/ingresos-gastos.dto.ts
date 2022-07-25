import { IsNotEmpty } from "class-validator";

export class IngresosGastosDTO {
    
  @IsNotEmpty()
  readonly descripcion: string;
  
  @IsNotEmpty()
  readonly monto: number;

  @IsNotEmpty()
  readonly tipo: string;

  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;

  readonly activo: boolean;

}