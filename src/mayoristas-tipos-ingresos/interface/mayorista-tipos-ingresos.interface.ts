import { Document } from 'mongoose';

export interface IMayoristasTiposIngresos extends Document {
    readonly descripcion: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}