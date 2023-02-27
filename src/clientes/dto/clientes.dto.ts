import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ClientesDTO {
  
  @IsString()
  readonly descripcion: string;

  @IsString()
  readonly tipo_identificacion: string;
  
  @IsString()
  readonly identificacion: string;
  
  @IsString()
  @IsOptional()
  readonly direccion: string;
  
  @IsString()
  @IsOptional()
  readonly telefono: string;
  
  @IsString()
  @IsOptional()
  readonly email: string;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  @IsBoolean()
  @IsOptional()
  readonly activo: boolean;

}