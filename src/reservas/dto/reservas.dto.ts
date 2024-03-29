import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class ReservasDTO {

  @IsString()
  readonly cliente: string;

  @IsNumber()
  readonly adelanto: number;
  
  @IsNumber()
  readonly precio_total: number;

  @IsArray()
  readonly productos: Array<any>;
  
  @IsString()
  readonly fecha_entrega: string;

  @IsString()
  readonly hora_entrega: string;

  @IsString()
  readonly fecha_alerta: string;
 
  @IsString()
  readonly fecha_reserva: string;
  
  @IsString()
  @IsOptional()
  readonly fecha_finalizacion: string;

  @IsString()
  readonly horas_antes: string;

  @IsString()
  @IsOptional()
  readonly observaciones: string;

  @IsString()
  readonly usuario_generador: string;

  @IsString()
  @IsOptional()
  readonly tipo_observaciones: string;

  @IsString()
  @IsOptional()
  readonly torta_relleno1: string;

  @IsString()
  @IsOptional()
  readonly torta_relleno2: string;
  
  @IsString()
  @IsOptional()
  readonly torta_relleno3: string;
  
  @IsString()
  @IsOptional()
  readonly torta_forma: string;

  @IsString()
  @IsOptional()
  readonly torta_peso: number;
  
  @IsString()
  @IsOptional()
  readonly torta_cobertura: string;

  @IsString()
  @IsOptional()
  readonly torta_detalles: string;

  @IsString()
  @IsOptional()
  readonly estado: string;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  @IsBoolean()
  @IsOptional()
  readonly activo: boolean;

}