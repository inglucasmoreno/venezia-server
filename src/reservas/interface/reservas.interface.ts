import { Document } from 'mongoose';

export interface IReservas extends Document {
    readonly nro: number;
    readonly adelanto: number;
    readonly precio_total: number;
    readonly fecha_entrega: string;
    readonly fecha_pedido: string;
    readonly fecha_finalizacion: string;
    readonly estado: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}