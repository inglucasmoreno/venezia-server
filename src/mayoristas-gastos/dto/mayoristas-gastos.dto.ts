import { IsNotEmpty } from "class-validator";

export class MayoristasGastosDTO {
  
  @IsNotEmpty()
  readonly tipo_gasto: string;

  @IsNotEmpty()
  readonly repartidor: string;

  @IsNotEmpty()
  readonly monto: number;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}