import { Document } from 'mongoose';

export interface ICobrosMayoristas extends Document {
  readonly nro: number;
  readonly tipo: string;
  readonly mayorista: string;
  readonly repartidor: string;
  readonly anticipo: number;
  readonly monto: number;
  readonly monto_total: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly activo: boolean;
}