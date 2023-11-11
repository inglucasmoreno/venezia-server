import { Document } from 'mongoose';

export interface IComprasProductos extends Document {
  readonly compra: string;
  readonly producto: string;
  readonly cantidad: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly activo: boolean;
}