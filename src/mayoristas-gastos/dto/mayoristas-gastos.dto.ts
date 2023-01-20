import { IsNotEmpty } from "class-validator";

export class MayoristasGastosDTO {
  
  fecha_gasto: any;

  readonly paquete: string;

  @IsNotEmpty()
  readonly tipo_gasto: string;

  @IsNotEmpty()
  repartidor: string;

  @IsNotEmpty()
  readonly monto: number;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}