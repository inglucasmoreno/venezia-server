import { Document } from 'mongoose';

export interface IIngresosGastos extends Document {
    readonly descripcion: string;
    readonly monto: number;
    readonly tipo: string;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}