import { Document } from 'mongoose';

export interface IMayoristasGastos extends Document {
    readonly fecha_gasto: string;
    readonly tipo_gasto: string;
    readonly repartidor: string;
    readonly monto: number;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly activo: boolean;
}