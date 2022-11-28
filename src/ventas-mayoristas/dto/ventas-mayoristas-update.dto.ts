export class VentasMayoristasUpdateDTO {
    
  readonly numero: number;

  readonly mayorista: string;

  readonly repartidor: string;

  readonly estado: string;
  
  readonly deuda: boolean;

  readonly monto_recibido: number;
  
  readonly deuda_monto: number;

  readonly monto_cuenta_corriente: number;
  
  readonly monto_anticipo: number;

  readonly precio_total: number;

  readonly facturacion: any;
  
  readonly comprobante: string;
  
  readonly activo: boolean;

}