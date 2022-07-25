import { Document } from 'mongoose';

export interface ISaldoInicial extends Document {
    readonly monto: number;
    readonly activo: boolean;
}