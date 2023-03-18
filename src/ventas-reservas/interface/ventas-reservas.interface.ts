import { Document } from 'mongoose';

export interface IVentasReservas extends Document {
    readonly venta: string;
    readonly reserva: string;
    readonly instancia: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}