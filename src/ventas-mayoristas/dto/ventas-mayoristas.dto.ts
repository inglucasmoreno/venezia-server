import { IsNotEmpty } from "class-validator";

export class VentasMayoristasDTO {
    
  readonly numero: number;

  @IsNotEmpty()
  readonly mayorista: string;

  @IsNotEmpty()
  readonly estado: string;
  
  readonly deuda: boolean;

  readonly monto_recibido: number;
  
  readonly deuda_monto: number;
  
  @IsNotEmpty()
  readonly precio_total: number;

  readonly facturacion: any;
  
  readonly comprobante: string;
  
  readonly activo: boolean;

}