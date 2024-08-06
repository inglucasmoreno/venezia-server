import { Document } from 'mongoose';

export interface IMesasPedidos extends Document {
  readonly mesa: string;
  readonly numero: number;
  readonly precioTotal: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly activo: boolean;
}