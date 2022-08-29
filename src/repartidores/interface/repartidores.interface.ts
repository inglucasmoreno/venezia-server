import { Document } from 'mongoose';

export interface IRepartidores extends Document {
    readonly descripcion: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}