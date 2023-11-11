import { Document } from 'mongoose';

export interface ICompras extends Document {
    readonly fecha_compra: string;
    readonly numero: number;
    readonly numero_factura: string;
    readonly comentarios: string;
    readonly estado: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}