import { Document } from 'mongoose';

export interface ICobrosMayoristas extends Document {
  fecha_cobro: any;
  readonly nro: number;
  readonly tipo: string;
  readonly paquete: string;
  readonly mayorista: string;
  readonly repartidor: string;
  readonly monto_anticipo: number;
  readonly monto_total_recibido: number;
  readonly monto_cancelar_deuda: number;
  readonly deuda_total: number;
  readonly deuda_restante: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly activo: boolean;
}