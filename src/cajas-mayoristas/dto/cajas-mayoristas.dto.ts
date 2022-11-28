import { IsNumber, IsString } from "class-validator";

export class CajasMayoristasDTO {
  
  @IsString()
  readonly fecha_caja: string;

  @IsNumber()
  readonly cantidad_ventas: number;

  @IsNumber()
  readonly total_ventas: number;

  @IsNumber()
  readonly total_anticipos: number;

  @IsNumber()
  readonly total_cuentas_corrientes: number;

  @IsNumber()
  readonly total_deuda: number;

  @IsNumber()
  readonly monto_a_recibir: number;

  @IsNumber()
  readonly total_otros_ingresos: number;

  @IsNumber()
  readonly total_otros_gastos: number;

  readonly ingresos: [];

  readonly gastos: [];

  @IsNumber()
  readonly total_recibido: number;

  @IsNumber()
  readonly total_recibido_real: number;

  @IsNumber()
  readonly monto_cintia: number;

  @IsNumber()
  readonly diferencia: number;

  @IsNumber()
  readonly total_final: number;

  readonly activo: boolean;
  
  readonly creatorUser: string; 
  
  readonly updatorUser: string;

}