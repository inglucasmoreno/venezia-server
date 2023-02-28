import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class ReservasDTO {

  @IsNumber()
  readonly adelanto: number;
  
  @IsNumber()
  readonly precio_total: number;
  
  @IsString()
  readonly fecha_entrega: string;
 
  @IsString()
  readonly fecha_pedido: string;
  
  @IsString()
  @IsOptional()
  readonly fecha_finalizacion: string;

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