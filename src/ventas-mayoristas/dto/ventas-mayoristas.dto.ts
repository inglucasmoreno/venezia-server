import { IsNotEmpty } from "class-validator";

export class VentasMayoristasDTO {
  
  readonly fecha_pedido: string;

  readonly numero: number;

  @IsNotEmpty()
  readonly mayorista: string;

  @IsNotEmpty()
  readonly repartidor: string;

  @IsNotEmpty()
  readonly estado: string;
  
  readonly deuda: boolean;

  readonly monto_recibido: number;

  readonly deuda_monto: number;

  readonly monto_cuenta_corriente: number;

  readonly monto_anticipo: number;
  
  @IsNotEmpty()
  readonly precio_total: number;

  readonly facturacion: any;
  
  readonly comprobante: string;
  
  readonly activo: boolean;

}