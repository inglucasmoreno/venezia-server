import { IsNotEmpty } from "class-validator";

export class VentasDTO {

  @IsNotEmpty()
  readonly productos: [];

  @IsNotEmpty()
  readonly forma_pago: [];

  @IsNotEmpty()
  readonly precio_total: number;

  @IsNotEmpty()
  readonly precio_total_limpio: number;
  
  @IsNotEmpty()
  readonly adicional_credito: number;

  readonly total_balanza: number;
  
  readonly total_no_balanza: number;
  
  readonly comprobante: string;

  readonly facturacion: {
    puntoVenta: number,
    tipoComprobante: number,
    nroComprobante: number
  };
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}