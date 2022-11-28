import { Document } from 'mongoose';

export interface ICobrosPedidos extends Document {
  readonly mayorista: string;
  readonly cobro: string;
  readonly pedido: string;
  readonly cancelado: boolean;
  readonly monto_total: number;
  readonly monto_cobrado: number;
  readonly monto_deuda: number;
  readonly monto_cuenta_corriente: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly activo: boolean;
}