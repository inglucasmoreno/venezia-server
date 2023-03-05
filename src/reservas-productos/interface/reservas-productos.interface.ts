import { Document } from 'mongoose';

export interface IReservasProductos extends Document {
    readonly reserva: string;
    readonly descripcion: string;
    readonly unidad_medida_descripcion: string;
    readonly producto: string;
    readonly precio: number;
    readonly precio_unitario: number;
    readonly cantidad: number;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}