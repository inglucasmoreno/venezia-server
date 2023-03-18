import { IsBoolean, IsOptional, IsString } from "class-validator";

export class VentasReservasDTO {

  @IsString()
  readonly venta: string;
  
  @IsString()
  readonly reserva: string;

  @IsString()
  readonly instancia: string;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  @IsBoolean()
  @IsOptional()
  readonly activo: boolean;

}