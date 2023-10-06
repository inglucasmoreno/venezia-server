import { Document } from 'mongoose';

export interface ICompras extends Document {
    readonly fecha_compra: string;
    readonly comentarios: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}