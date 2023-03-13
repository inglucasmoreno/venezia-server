import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class ReservasProductosDTO {

  @IsString()
  readonly reserva: string;
  
  @IsString()
  readonly descripcion: string;

  @IsBoolean()
  readonly balanza: string;

  @IsString()
  readonly unidad_medida: string;

  @IsString()
  readonly producto: string;

  @IsNumber()
  readonly precio: number;
  
  @IsNumber()
  readonly precio_unitario: number;
  
  @IsNumber()
  readonly cantidad: number;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  @IsBoolean()
  @IsOptional()
  readonly activo: boolean;

}