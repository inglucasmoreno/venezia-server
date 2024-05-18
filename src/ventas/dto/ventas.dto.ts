import { IsNotEmpty } from "class-validator";

export class VentasDTO {

  readonly sena: boolean;

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
 
  readonly comprobante: string;

  readonly identContribuyente: string;
  
  readonly pedidosya_comprobante: string;

  readonly total_balanza: number;
  
  readonly total_no_balanza: number;

  readonly facturacion: {
    puntoVenta: number,
    tipoComprobante: number,
    nroComprobante: number,
  };

  readonly contribuyente: {
    razonSocial: string,
    tipoPersona: string,
    tipoIdentificacion: string,
    identificacion: string,
  }
  
  @IsNotEmpty()
  readonly creatorUser: string;
  
  @IsNotEmpty()
  readonly updatorUser: string;
  
  readonly activo: boolean;

}