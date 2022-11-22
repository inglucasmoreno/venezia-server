import { IsNumber, IsString } from "class-validator";

export class CobrosMayoristasDTO {
  
  readonly nro: number;

  @IsString()
  readonly mayorista: string;

  @IsNumber()
  readonly monto: number;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}