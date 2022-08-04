import { Document } from 'mongoose';

export interface IPedidosYa extends Document {
    readonly monto: number;
    readonly comentario: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}