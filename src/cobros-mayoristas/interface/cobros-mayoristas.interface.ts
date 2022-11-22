import { Document } from 'mongoose';

export interface ICobrosMayoristas extends Document {
  readonly nro: number;
  readonly mayorista: string;
  readonly monto: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly activo: boolean;
}