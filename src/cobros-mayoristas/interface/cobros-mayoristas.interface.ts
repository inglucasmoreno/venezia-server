import { Document } from 'mongoose';

export interface ICobrosMayoristas extends Document {
  fecha_cobro: string;
  readonly caja: string;
  readonly nro: number;
  readonly tipo: string;
  readonly mayorista: string;
  readonly repartidor: string;
  readonly anticipo: number;
  readonly monto: number;
  readonly monto_total: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly ingreso: boolean;
  readonly activo: boolean;
}