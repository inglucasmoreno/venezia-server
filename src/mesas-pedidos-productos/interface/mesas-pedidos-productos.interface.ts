
import { Document } from 'mongoose';

export interface IMesasPedidosProductos extends Document {
  readonly mesa: string;
  readonly pedido: string;
  readonly producto: string;
  readonly cantidad: number;
  readonly precio: number;
  readonly precioTotal: number;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly activo: boolean;
}