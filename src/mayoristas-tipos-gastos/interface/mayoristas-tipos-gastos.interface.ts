import { Document } from 'mongoose';

export interface IMayoristasTiposGastos extends Document {
    readonly descripcion: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}