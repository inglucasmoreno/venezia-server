import { IsNotEmpty } from "class-validator";

export class MayoristasIngresosDTO {
  
  readonly fecha_ingreso: string;

  @IsNotEmpty()
  readonly tipo_ingreso: string;

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