import { IsNotEmpty } from "class-validator";

export class CajasDTO {
  
  @IsNotEmpty()
  readonly saldo_inicial: number;

  @IsNotEmpty()
  readonly saldo_proxima_caja: number;

  @IsNotEmpty()
  readonly total_ventas: number;

  @IsNotEmpty()
  readonly total_facturado: number;

  @IsNotEmpty()
  readonly total_balanza: number;

  @IsNotEmpty()
  readonly total_no_balanza: number;

  @IsNotEmpty()
  readonly total_efectivo: number;
  
  @IsNotEmpty()
  readonly total_credito: number;

  @IsNotEmpty()
  readonly total_adicional_credito: number;
  
  @IsNotEmpty()
  readonly total_mercadopago: number;
  
  @IsNotEmpty()
  readonly total_debito: number;
  
  @IsNotEmpty()
  readonly otros_gastos: number;
 
  @IsNotEmpty()
  readonly otros_ingresos: number;

  @IsNotEmpty()
  readonly tesoreria: number;
  
  @IsNotEmpty()
  readonly diferencia: number;

  @IsNotEmpty()
  readonly gastos: [];

  @IsNotEmpty()
  readonly ingresos: [];

  @IsNotEmpty()
  readonly total_efectivo_en_caja: number;
  
  @IsNotEmpty()
  readonly total_efectivo_en_caja_real: number;
  
  readonly activo: boolean;
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  

}