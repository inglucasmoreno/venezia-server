import { IsNumber, IsString } from "class-validator";

export class CobrosMayoristasDTO {
  
  readonly nro: number;

  @IsString()
  readonly tipo: string;

  readonly pedidos: Array<any>;

  @IsString()
  repartidor: string;

  @IsString()
  readonly mayorista: string;

  @IsNumber()
  readonly anticipo: number;

  @IsNumber()
  readonly monto: number;

  @IsNumber()
  readonly monto_total: number;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}