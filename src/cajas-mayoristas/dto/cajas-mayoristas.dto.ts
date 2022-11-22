import { IsNumber, IsString } from "class-validator";

export class CajasMayoristasDTO {
  
  @IsString()
  readonly fecha_caja: string;
  
  @IsNumber()
  readonly total_ventas: number;

  @IsNumber()
  readonly total_otros_ingresos: number;
  
  @IsNumber()
  readonly total_otros_gastos: number;
  
  @IsNumber()
  readonly total_deuda: number;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}