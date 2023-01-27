import { IsNumber, IsString } from "class-validator";

export class CobrosMayoristasDTO {
  
  fecha_cobro: string;

  readonly nro: number;

  @IsString()
  readonly tipo: string;

  readonly pedidos: Array<any>;

  @IsString()
  repartidor: string;

  @IsString()
  readonly paquete: string;

  @IsString()
  readonly mayorista: string;

  @IsNumber()
  readonly monto_anticipo: number;

  @IsNumber()
  readonly monto_total_recibido: number;
  
  @IsNumber()
  readonly monto_cancelar_deuda: number;
  
  @IsNumber()
  readonly deuda_total: number;

  @IsNumber()
  readonly deuda_restante: number;

  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}