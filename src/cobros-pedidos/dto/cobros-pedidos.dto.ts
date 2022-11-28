import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CobrosPedidosDTO {
  
  @IsString()
  readonly mayorista: string;
  
  @IsString()
  readonly cobro: string;
  
  @IsString()
  readonly pedido: string;
  
  @IsBoolean()
  readonly cancelado: boolean;
 
  @IsNumber()
  readonly monto_total: number;
  
  @IsNumber()
  readonly monto_cobrado: number;
  
  @IsNumber()
  readonly monto_deuda: number;

  readonly monto_cuenta_corriente: number;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}