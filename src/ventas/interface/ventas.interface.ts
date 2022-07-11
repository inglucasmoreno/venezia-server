import { Document } from 'mongoose';

export interface IVentas extends Document {
    readonly formaPago: [];
    readonly precio_total: number;
    readonly afip: boolean;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}