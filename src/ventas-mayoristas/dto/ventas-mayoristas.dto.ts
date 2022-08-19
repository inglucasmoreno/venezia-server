import { IsNotEmpty } from "class-validator";

export class VentasMayoristasDTO {
    
  @IsNotEmpty()
  readonly mayorista: string;

  @IsNotEmpty()
  readonly precio_total: number;

  readonly facturacion: any;
  
  readonly comprobante: string;
  
  readonly activo: boolean;

}