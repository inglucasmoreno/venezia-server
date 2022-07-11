import { Document } from 'mongoose';

export interface IVentasProductos extends Document {
    readonly producto: string;
    readonly descripcion: string;
    readonly precio: number;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}