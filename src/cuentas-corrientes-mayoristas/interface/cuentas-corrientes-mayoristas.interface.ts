import { Document } from 'mongoose';

export interface ICuentasCorrientesMayoristas extends Document {
    readonly mayorista: string;
    readonly saldo: number;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}