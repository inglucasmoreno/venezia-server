import { IsNumber, IsString } from "class-validator";

export class CuentasCorrientesMayoristasDTO {
  
  @IsString()
  readonly mayorista: string;

  @IsNumber()
  readonly saldo: number;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}