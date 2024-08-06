import { Document } from 'mongoose';

export interface IMesas extends Document {
    readonly descripcion: string;
    readonly estado: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}