import { Document } from 'mongoose';

export interface IUnidadMedida extends Document {
    readonly descripcion: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}